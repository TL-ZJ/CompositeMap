#!/usr/bin/env python3
"""caj2pdf.py — 将 .caj 文件转换为可读的 .pdf（纯 Python，仅依赖 pypdf）

.caj 是 CNKI 知网的封装格式。实测其内部内容分为四类：

  1. 内嵌完整 PDF（文件头即 %PDF-…，含 %%EOF）→ 直接复制字节
  2. 无头 PDF：正文是完整 PDF 对象（`N 0 obj … endobj`）但缺 %PDF 头 / xref 表
     → 扫描对象偏移重建 xref，产出合法 PDF
  3. HN 扫描版：每页一张 JPEG 图像，无 PDF 文本层
     → 逐张抽取 JPEG，组装为纯图像 PDF（/DCTDecode）
  4. KDH（会议论文，Huffman 压缩编码）→ 不支持（无开源解码器）
  5. 北大方正 CEB（c8 文件头 / "北大方正授权" 字样）→ 不支持（无开源工具）

用法：

  python scripts/caj2pdf.py <input.caj> [-o <out.pdf>]     # 单文件
  python scripts/caj2pdf.py --batch <dir> [-o <outdir>]    # 批量（保持相对目录结构）
  python scripts/caj2pdf.py --batch <dir> [--flat]         # 批量（全部平铺到输出目录）
  python scripts/caj2pdf.py --batch <dir> [--dry-run]      # 只统计分类，不产出文件

exit code: 0 成功 / 1 转换失败 / 2 不支持的格式
"""
from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path

try:
    import logging

    import pypdf
    from pypdf import PdfReader, PdfWriter

    # 重建的 xref 难免有指向偏差，pypdf 会逐个 warn 刷屏；只保留报错
    logging.getLogger("pypdf").setLevel(logging.ERROR)
except ImportError:  # pragma: no cover
    sys.stderr.write("缺少依赖 pypdf，请先 pip install pypdf\n")
    sys.exit(1)

# ---- 格式分类 ----
KIND_PDF_DIRECT = "pdf-direct"      # 头 %PDF 且含 %%EOF：直接复制
KIND_PDF_REPAIR = "pdf-repair"      # 头 CAJ/HN，内嵌 %PDF 需抽取修复
KIND_UNSUPPORTED_KDH = "kdh"        # Huffman 压缩，无开源解码器
KIND_UNSUPPORTED_CEB = "ceb"        # 北大方正，无开源工具
KIND_UNKNOWN = "unknown"

# 北大方正文件：偏移 ~0x14 处有 GBK 编码的 "北大版权"/"北大方正授权" 字样
_GBK_BEIDA = b"\xb1\xb1\xb4\xf3"  # "北大" 的 GBK 字节


@dataclass
class Result:
    src: Path
    status: str          # ok / repaired / unsupported / failed
    dst: Path | None = None
    pages: int = 0
    reason: str = ""


def classify(path: Path) -> str:
    with open(path, "rb") as f:
        head = f.read(64)

    if head.startswith(b"%PDF"):
        return KIND_PDF_DIRECT
    if head.startswith((b"CAJ", b"HN")):
        return KIND_PDF_REPAIR
    if head.startswith(b"KDH"):
        return KIND_UNSUPPORTED_KDH
    # 北大方正系：文件头为 c8 00 00 00 …（部分版本在 0x14 处有 GBK "北大版权" 字样，
    # 部分版本该位置为 0 且全文无标记）
    if head.startswith(b"\xc8") or _GBK_BEIDA in head:
        return KIND_UNSUPPORTED_CEB
    return KIND_UNKNOWN


def _verify(data: bytes) -> int:
    """返回页数；无法解析则抛异常。"""
    reader = PdfReader(BytesIO(data), strict=False)
    if len(reader.pages) < 1:
        raise ValueError("no pages")
    return len(reader.pages)


def _repair(data: bytes, dst: Path) -> int:
    """用 pypdf 宽松解析并重写，产出结构完好的 PDF。返回页数。"""
    reader = PdfReader(BytesIO(data), strict=False)
    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)
    try:
        writer.add_metadata(reader.metadata or {})
    except Exception:
        pass
    with open(dst, "wb") as f:
        writer.write(f)
    return _verify(dst.read_bytes())


# ---- 策略 A：内嵌完整 PDF 的抽取 ----

def _slice_embedded_pdf(data: bytes) -> bytes:
    """从字节流中定位第一个 %PDF 起点，截到最后一个 %%EOF 为止。"""
    start = data.find(b"%PDF-")
    if start < 0:
        raise ValueError("no embedded %PDF marker")
    end = data.rfind(b"%%EOF")
    stop = end + len(b"%%EOF") + 2 if end >= 0 else len(data)  # 保留 %%EOF 后换行
    return data[start:stop]


# ---- 策略 B：无头 PDF 正文重建 xref ----

# 对象头必须以换行开头：二进制流（JPEG/Flate）中偶发的 "N 0 obj" 字节组合
# 前面极少紧跟 \n / \r，借此过滤绝大部分假匹配
_OBJ_RE = re.compile(rb"(?:^|[\r\n])(\d+)\s+(\d+)\s+obj\b")


def _looks_like_headless_pdf(data: bytes) -> bool:
    return bool(_OBJ_RE.search(data)) and (
        b"/Type" in data and (b"/Page" in data or b"/Catalog" in data)
    )


def _rebuild_headless_pdf(data: bytes, dst: Path) -> int:
    """CAJ 文件正文是完整 PDF 对象但缺头部/xref（甚至缺 Catalog）：扫描对象
    偏移重建 xref；无 Catalog 时合成 Catalog+Pages 并把每个叶页 Parent 指向它。"""
    matches = list(_OBJ_RE.finditer(data))
    if not matches:
        raise ValueError("no PDF objects found")
    body_start = matches[0].start(1)  # group(1) = 对象号起点，跳过前导换行
    body_end = data.rfind(b"endobj")
    if body_end < body_start:
        raise ValueError("no endobj")

    # 记录对象号 -> 偏移；重复对象号取第一次出现
    offsets: dict[int, int] = {}
    spans: dict[int, tuple[int, int]] = {}  # obj_num -> (span_start, span_end) in data
    for idx, m in enumerate(matches):
        num = int(m.group(1))
        end = matches[idx + 1].start(1) if idx + 1 < len(matches) else body_end
        if num not in offsets:
            offsets[num] = m.start(1) - body_start
            spans[num] = (m.start(1), end)

    body = bytearray(data[body_start:body_end + len(b"endobj")])

    # 找 Catalog；没有则合成
    catalog_num = None
    for m in matches:
        chunk = data[m.start():m.start() + 4096]
        if re.search(rb"/Type\s*/Catalog\b", chunk):
            catalog_num = int(m.group(1))
            break

    if catalog_num is None:
        # 叶页：/Type /Page（\b 已排除 /Pages），仅在对象自身跨度内判定，
        # 避免把后续对象（字体/流/Pages 节点）误收为页面
        leaf_pages = [n for n, (s, e) in spans.items()
                      if re.search(rb"/Type\s*/Page\b", data[s:e])]
        if not leaf_pages:
            raise ValueError("no /Catalog and no leaf pages")
        max_num = max(offsets)
        catalog_num, pages_num = max_num + 1, max_num + 2
        # 把每个叶页的 /Parent 指向合成 Pages 节点；缺 /Parent 的补上
        for n in leaf_pages:
            s, e = spans[n]
            rel = s - body_start
            span = bytes(body[rel:e - body_start])
            patched, cnt = re.subn(rb"/Parent\s+\d+\s+0\s+R",
                                   f"/Parent {pages_num} 0 R".encode(), span, count=1)
            if cnt == 0:
                patched = re.sub(rb"/Type\s*/Page\b",
                                 f"/Parent {pages_num} 0 R/Type /Page".encode(),
                                 span, count=1)
            body[rel:rel + len(span)] = patched
        kids = " ".join(f"{n} 0 R" for n in leaf_pages)
        synth = {
            catalog_num: f"<< /Type /Catalog /Pages {pages_num} 0 R >>".encode(),
            pages_num: f"<< /Type /Pages /Kids [{kids}] /Count {len(leaf_pages)} >>".encode(),
        }
    else:
        synth = {}

    size = max(list(offsets) + list(synth)) + 1
    header = b"%PDF-1.5\n%\xe2\xe3\xcf\xd3\n"
    out = bytearray(header)
    out += body + b"\n"
    # xref 偏移必须相对于文件起点：在拼接后的 out 上重新扫描（Parent 打补丁后长度可能变化）
    offsets = {}
    for m in _OBJ_RE.finditer(bytes(body)):
        num = int(m.group(1))
        if num not in offsets:
            offsets[num] = len(header) + m.start()
    for num in sorted(synth):
        offsets[num] = len(out)
        out += f"{num} 0 obj\n".encode() + synth[num] + b"\nendobj\n"
    xref_pos = len(out)
    out += f"xref\n0 {size}\n".encode()
    out += b"0000000000 65535 f \n"
    for num in range(1, size):
        off = offsets.get(num)
        out += (f"{off:010d} 00000 n \n".encode() if off is not None
                else b"0000000000 00000 f \n")
    out += (f"trailer\n<< /Size {size} /Root {catalog_num} 0 R >>\n"
            f"startxref\n{xref_pos}\n%%EOF\n").encode()

    dst.write_bytes(bytes(out))
    try:
        return _verify(bytes(out))
    except Exception:
        # 重建的 xref 仍不被接受时，交给 pypdf 宽松解析重写
        return _repair(bytes(out), dst)


# ---- 策略 C：HN 扫描版 —— 抽取 JPEG 组装图像 PDF ----

_MIN_JPEG_BYTES = 8 * 1024  # 小于该尺寸的 JPEG 视为缩略图跳过
_SOF_MARKERS = {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7,
                0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}


def _walk_jpeg(data: bytes, start: int) -> tuple[int, tuple[int, int, int]] | None:
    """从 SOI 起点走 JPEG 标记，返回 (结束偏移, (高, 宽, 分量数))；损坏则返回 None。"""
    i, n = start + 2, len(data)
    dims: tuple[int, int, int] | None = None
    while i < n - 1:
        if data[i] != 0xFF:
            i += 1
            continue
        while i < n and data[i] == 0xFF:
            i += 1
        if i >= n:
            break
        marker = data[i]
        i += 1
        if marker in (0xD8, 0x01) or 0xD0 <= marker <= 0xD7:
            continue
        if marker == 0xD9:  # EOI
            return (i + 1, dims) if dims else None
        if i + 2 > n:
            break
        seglen = int.from_bytes(data[i:i + 2], "big")
        if marker in _SOF_MARKERS:
            h = int.from_bytes(data[i + 3:i + 5], "big")
            w = int.from_bytes(data[i + 5:i + 7], "big")
            comps = data[i + 7]
            dims = (h, w, comps)
        if marker == 0xDA:  # SOS：进入熵编码数据区
            i += seglen
            while i < n - 1:
                if data[i] == 0xFF:
                    nxt = data[i + 1]
                    if nxt == 0x00 or 0xD0 <= nxt <= 0xD7:
                        i += 2
                        continue
                    if nxt == 0xFF:
                        i += 1
                        continue
                    if nxt == 0xD9:
                        return (i + 2, dims) if dims else None
                    return (i, dims) if dims else None  # 异常中断也截断
                i += 1
            break
        i += seglen
    return None


def _extract_jpegs(data: bytes) -> list[tuple[bytes, int, int, int]]:
    """扫描全部 JPEG，返回 [(jpeg_bytes, 高, 宽, 分量数)]，按文件顺序。"""
    out = []
    for m in re.finditer(rb"\xff\xd8\xff", data):
        got = _walk_jpeg(data, m.start())
        if not got:
            continue
        end, dims = got
        seg = data[m.start():end]
        if len(seg) >= _MIN_JPEG_BYTES:
            out.append((seg, *dims))
    return out


def _build_image_pdf(jpegs: list[tuple[bytes, int, int, int]], dst: Path) -> int:
    """把 JPEG 列表组装为每图一页的 PDF（/DCTDecode，无重编码）。"""
    colorspace = {1: b"/DeviceGray", 3: b"/DeviceRGB", 4: b"/DeviceCMYK"}
    objects: dict[int, bytes] = {}
    kids = []
    for idx, (seg, h, w, comps) in enumerate(jpegs):
        page_num = 3 + idx * 3
        image_num, content_num = page_num + 1, page_num + 2
        kids.append(page_num)
        objects[page_num] = (
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {w} {h}] "
            f"/Resources << /ProcSet [/PDF /ImageC] /XObject << /Im0 {image_num} 0 R >> >> "
            f"/Contents {content_num} 0 R >>"
        ).encode()
        cs = colorspace.get(comps, b"/DeviceRGB")
        objects[image_num] = (
            f"<< /Type /XObject /Subtype /Image /Width {w} /Height {h} "
            f"/ColorSpace {cs.decode()} /BitsPerComponent 8 /Filter /DCTDecode "
            f"/Length {len(seg)} >>\nstream\n"
        ).encode() + seg + b"\nendstream"
        content = f"q\n{w} 0 0 {h} 0 0 cm\n/Im0 Do\nQ".encode()
        objects[content_num] = (
            f"<< /Length {len(content)} >>\nstream\n".encode() + content + b"\nendstream"
        )

    objects[1] = b"<< /Type /Catalog /Pages 2 0 R >>"
    objects[2] = (
        f"<< /Type /Pages /Kids [{' '.join(f'{k} 0 R' for k in kids)}] "
        f"/Count {len(kids)} >>"
    ).encode()

    out = bytearray(b"%PDF-1.5\n%\xe2\xe3\xcf\xd3\n")
    offsets: dict[int, int] = {}
    for num in sorted(objects):
        offsets[num] = len(out)
        out += f"{num} 0 obj\n".encode() + objects[num] + b"\nendobj\n"
    xref_pos = len(out)
    size = max(offsets) + 1
    out += f"xref\n0 {size}\n".encode() + b"0000000000 65535 f \n"
    for num in range(1, size):
        off = offsets.get(num)
        out += (f"{off:010d} 00000 n \n".encode() if off is not None
                else b"0000000000 00000 f \n")
    out += (f"trailer\n<< /Size {size} /Root 1 0 R >>\n"
            f"startxref\n{xref_pos}\n%%EOF\n").encode()

    dst.write_bytes(bytes(out))
    return _verify(bytes(out))


def _text_sample(data: bytes) -> int:
    """抽取第 1 页文本长度，用于重写前后的内容对等检查。"""
    try:
        return len((PdfReader(BytesIO(data), strict=False).pages[0].extract_text() or "").strip())
    except Exception:
        return -1


def convert_file(src: Path, dst: Path) -> Result:
    """转换单个文件；绝不修改 src。失败时不保留半成品。"""
    kind = classify(src)
    if kind in (KIND_UNSUPPORTED_KDH, KIND_UNSUPPORTED_CEB, KIND_UNKNOWN):
        reason = {
            KIND_UNSUPPORTED_KDH: "KDH 格式（Huffman 压缩），无开源解码器",
            KIND_UNSUPPORTED_CEB: "北大方正 CEB 格式，无开源转换工具",
            KIND_UNKNOWN: "无法识别的文件头",
        }[kind]
        return Result(src=src, status="unsupported", reason=reason)

    data = src.read_bytes()
    dst.parent.mkdir(parents=True, exist_ok=True)

    try:
        if kind == KIND_PDF_DIRECT:
            pages = _verify(data)
            # 部分 CNKI 内嵌 PDF 用 xref stream 且无 trailer 关键字，pdfminer 系
            # 工具（convert.py/markitdown）会报 "No /Root object!"。经 pypdf 规范化
            # 重写可解决；重写前后第 1 页文本量需对等，否则回退字节拷贝保真。
            before = _text_sample(data)
            if before >= 0:
                try:
                    pages2 = _repair(data, dst)
                    if pages2 > 0 and _text_sample(dst.read_bytes()) == before:
                        return Result(src=src, status="ok", dst=dst, pages=pages2)
                except Exception:
                    pass
            dst.write_bytes(data)
            return Result(src=src, status="ok", dst=dst, pages=pages)
        # KIND_PDF_REPAIR：按三种子策略依次尝试
        if data.find(b"%PDF-") >= 0:  # 内嵌完整/半完整 PDF
            sliced = _slice_embedded_pdf(data)
            try:
                pages = _verify(sliced)
                dst.write_bytes(sliced)
                return Result(src=src, status="repaired", dst=dst, pages=pages)
            except Exception:
                pages = _repair(sliced, dst)
                return Result(src=src, status="repaired", dst=dst, pages=pages)
        if _looks_like_headless_pdf(data):  # 无头 PDF 正文
            pages = _rebuild_headless_pdf(data, dst)
            return Result(src=src, status="repaired", dst=dst, pages=pages)
        jpegs = _extract_jpegs(data)  # HN 扫描版
        if jpegs:
            pages = _build_image_pdf(jpegs, dst)
            return Result(src=src, status="repaired", dst=dst, pages=pages)
        raise ValueError("no PDF objects or JPEG images found")
    except Exception as exc:
        if dst.exists():
            dst.unlink()  # 不留下损坏的半成品
        return Result(src=src, status="failed", reason=f"{type(exc).__name__}: {exc}")


def iter_caj(root: Path) -> list[Path]:
    return sorted(p for p in root.rglob("*.caj") if p.is_file())


def cmd_single(args: argparse.Namespace) -> int:
    src = Path(args.input)
    dst = Path(args.output) if args.output else src.with_suffix(".pdf")
    r = convert_file(src, dst)
    _print_result(r)
    return {"ok": 0, "repaired": 0}.get(r.status, 2 if r.status == "unsupported" else 1)


def cmd_batch(args: argparse.Namespace) -> int:
    root = Path(args.batch)
    outdir = Path(args.output) if args.output else root / "_converted_pdf"
    files = iter_caj(root)
    if not files:
        print(f"在 {root} 下未找到 .caj 文件")
        return 0

    results: list[Result] = []
    for src in files:
        rel = src.relative_to(root)
        if args.flat:
            dst = outdir / (src.stem + ".pdf")
            n = 2
            while dst.exists():  # 平铺模式下重名时加序号
                dst = outdir / f"{src.stem}__{n}.pdf"
                n += 1
        else:
            dst = (outdir / rel).with_suffix(".pdf")
        if args.dry_run:
            kind = classify(src)
            results.append(Result(src=src, status=kind))
        else:
            results.append(convert_file(src, dst))

    _print_batch(results, dry_run=args.dry_run)
    if args.dry_run:
        return 0
    return 1 if any(r.status == "failed" for r in results) else 0


def _print_result(r: Result) -> None:
    if r.status in ("ok", "repaired"):
        print(f"[{r.status}] {r.src} -> {r.dst} ({r.pages} 页)")
    else:
        print(f"[{r.status}] {r.src} — {r.reason}")


def _print_batch(results: list[Result], dry_run: bool) -> None:
    from collections import Counter

    counts = Counter(r.status for r in results)
    print("---- 分类统计 ----")
    for status, n in sorted(counts.items(), key=lambda kv: -kv[1]):
        print(f"  {status:12s} {n}")
    print(f"  合计 {len(results)}")
    bad = [r for r in results if r.status in ("unsupported", "failed")]
    if bad:
        print("---- 未转换明细 ----")
        for r in bad:
            print(f"  {r.status:12s} {r.src} {r.reason}")
    if not dry_run:
        ok = counts.get("ok", 0) + counts.get("repaired", 0)
        print(f"转换完成：{ok}/{len(results)} 成功")


def main() -> int:
    ap = argparse.ArgumentParser(description="将 .caj 转换为可读的 .pdf")
    ap.add_argument("input", nargs="?", help="单个 .caj 文件")
    ap.add_argument("-o", "--output", help="输出 .pdf 路径 / 批量模式的输出目录")
    ap.add_argument("--batch", metavar="DIR", help="批量转换目录（递归找 *.caj）")
    ap.add_argument("--flat", action="store_true", help="批量模式：全部平铺到输出目录")
    ap.add_argument("--dry-run", action="store_true", help="只统计分类，不产出文件")
    args = ap.parse_args()

    if args.batch:
        return cmd_batch(args)
    if args.input:
        return cmd_single(args)
    ap.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())
