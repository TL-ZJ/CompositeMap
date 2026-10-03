#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""hn_extract.py — 从 CNKI 的 HN 格式（清华同方硕博论文）提取正文文本。

HN 是文本+插图混合格式：正文文字用 zlib 压缩（COMPRESSTEXT 标记），
解压后是"指令码+数据"的字节流（0x8001=单字符 GBK、0x8070=多字符、0x800A=插图）。
本脚本只提取文字层（不含插图），输出纯文本。

结构参考 caj2pdf 项目（cajparser.py / HNParsePage.py，Hin-Tak Leung 逆向）。
"""
from __future__ import annotations

import argparse
import struct
import sys
import zlib
from pathlib import Path

# HN 文件头关键偏移
_PAGE_NUMBER_OFFSET = 0x90   # 页数（int）
_TOC_NUMBER_OFFSET = 0x158   # 目录条目数（int）
_TOC_ENTRY_SIZE = 0x134      # 每条目录 308 字节
_PAGEINFO_SIZE = 20          # 每页信息 20 字节（iihhii）


def _parse_page(data: bytes, old_style: bool) -> str:
    """把解压后的字节流解析为文本（HNParsePage 逻辑）。"""
    chars: list[str] = []
    offset = 0
    n = len(data)

    def text(code: int) -> None:
        nonlocal offset
        try:
            chars.append(bytes([data[offset + 5], data[offset + 4]]).decode("gbk"))
        except IndexError:
            pass
        except UnicodeDecodeError:
            table = {0xA389: "\t", 0xA38A: "\n", 0xA38D: "\r", 0xA3A0: " "}
            code = data[offset + 5] * 256 + data[offset + 4]
            chars.append(table.get(code, f"<0x{code:04X}>"))
        offset += 6

    def text_multi(code: int) -> None:
        nonlocal offset
        offset += 2
        if code == 0x8001:
            chars.append("\n")
        while True:
            if data[offset + 1] == 0x80:
                break
            chars.append(bytes([data[offset + 3], data[offset + 2]]).decode("gbk"))
            offset += 4

    dispatch = {0x800A: lambda c: None}  # 插图占位，跳过
    if old_style:
        dispatch[0x8001] = text_multi
        dispatch[0x8070] = text_multi
    else:
        dispatch[0x8001] = text

    while offset <= n - 2:
        code = struct.unpack("<H", data[offset:offset + 2])[0]
        offset += 2
        if code == 0x800A:
            # 插图：跳过 26 字节（位置/大小）
            offset += 26
        elif code in dispatch:
            dispatch[code](code)
        else:
            offset += 2
    return "".join(chars).replace("\x00", "")


def extract_hn_text(path: Path) -> list[str]:
    """提取 HN 文件每页文本，返回 list[页文本]。"""
    data = path.read_bytes()
    page_num = struct.unpack("<i", data[_PAGE_NUMBER_OFFSET:_PAGE_NUMBER_OFFSET + 4])[0]
    toc_num = struct.unpack("<i", data[_TOC_NUMBER_OFFSET:_TOC_NUMBER_OFFSET + 4])[0]
    toc_end = _TOC_NUMBER_OFFSET + 4 + _TOC_ENTRY_SIZE * toc_num

    pages: list[str] = []
    for i in range(page_num):
        off = toc_end + i * _PAGEINFO_SIZE
        (pd_offset, size_text, _imgs, _page_no, _unk2, next_pd) = struct.unpack(
            "<iihhii", data[off:off + _PAGEINFO_SIZE])
        head32 = data[pd_offset:pd_offset + 32]
        if head32[8:20] == b"COMPRESSTEXT":
            exp_size = struct.unpack("<i", head32[20:24])[0]
            raw = data[pd_offset + 24:pd_offset + size_text]
            output = zlib.decompress(raw, bufsize=exp_size)
        else:
            output = data[pd_offset:pd_offset + size_text]
        old_style = next_pd > pd_offset
        pages.append(_parse_page(output, old_style))
    return pages


def main() -> int:
    ap = argparse.ArgumentParser(description="从 HN 格式 .caj 提取正文文本")
    ap.add_argument("input", help="HN .caj 文件路径")
    ap.add_argument("-o", "--output", help="输出 .txt 路径（默认打印到 stdout）")
    args = ap.parse_args()

    src = Path(args.input)
    if not src.exists():
        sys.stderr.write(f"文件不存在：{src}\n")
        return 1
    pages = extract_hn_text(src)
    text = "\n\n".join(f"[第{i+1}页]\n{p}" for i, p in enumerate(pages) if p.strip())
    if args.output:
        Path(args.output).write_text(text, encoding="utf-8")
        print(f"已写入 {args.output}（{len(text)} 字，{len(pages)} 页）")
    else:
        print(text)
    return 0


if __name__ == "__main__":
    sys.exit(main())
