# caj2pdf

把 CNKI 知网的 `.caj` 文件转成可读的 `.pdf`。纯 Python 实现，仅依赖 [`pypdf`](https://pypi.org/project/pypdf/)，可独立使用，与任何知识库 / 框架无关。

## 支持的格式

`.caj` 只是 CNKI 的封装扩展名，实际内部内容分四类，本工具自动识别并分别处理：

| 内部格式 | 识别特征 | 处理方式 | 结果 |
|---|---|---|---|
| 内嵌完整 PDF | 文件头 `%PDF-…` 且含 `%%EOF` | 规范化重写（修 xref stream 缺 `/Root` 的问题） | ✅ 可读 PDF（带文本层） |
| 无头 PDF | 文件头 `CAJ`/`HN`，正文是 `N 0 obj … endobj` 但缺头/xref | 扫描对象偏移重建 xref，缺 Catalog 时合成 | ✅ 可读 PDF（带文本层） |
| HN 扫描版 | 每页一张 JPEG，无文本层 | 抽取 JPEG 组装为纯图像 PDF | ✅ 可读 PDF（图像版，无文本层，需 OCR） |
| KDH | 文件头 `KDH`，Huffman 压缩 | 不支持 | ❌ 无开源解码器 |
| 北大方正 CEB | 文件头 `c8 …` 或含"北大方正授权"字样 | 不支持 | ❌ 无开源工具 |

> 说明：KDH（会议论文）与北大方正 CEB 两种格式目前没有成熟的开源解码方案，本工具会明确报告 `unsupported` 并给出原因，不会产出损坏的半成品。

## 环境要求

- Python **3.10+**（用了 `X | None` 联合类型与内置泛型语法）
- `pypdf`

```bash
pip install -r requirements.txt
# 或
pip install pypdf
```

## 用法

```bash
# 单文件：默认输出到同目录、同名的 .pdf
python caj2pdf.py /path/to/论文.caj

# 指定输出路径
python caj2pdf.py /path/to/论文.caj -o /path/to/out.pdf

# 批量：递归扫描目录下所有 *.caj，保持相对目录结构输出到 outdir
python caj2pdf.py --batch /path/to/papers -o /path/to/out

# 批量平铺：全部输出到同一目录（重名自动加序号）
python caj2pdf.py --batch /path/to/papers -o /path/to/out --flat

# 只统计分类、不产出文件（先看看哪些能转、哪些不支持）
python caj2pdf.py --batch /path/to/papers --dry-run

# 查看版本
python caj2pdf.py --version
```

不指定 `-o` 时，批量模式默认输出到 `<输入目录>/_converted_pdf/`。

## 退出码

| 退出码 | 含义 |
|---|---|
| `0` | 成功（单文件）或批量全部成功 |
| `1` | 转换失败（单文件）或批量中存在失败项 |
| `2` | 不支持的格式（KDH / 北大方正 CEB / 无法识别） |

## 批量输出示例

```
---- 分类统计 ----
  repaired    48
  ok          20
  kdh         21
  ceb          9
  合计 98
---- 未转换明细 ----
  kdh         /papers/a/会议论文.caj KDH 格式（Huffman 压缩），无开源解码器
  ceb         /papers/b/方正论文.caj 北大方正 CEB 格式，无开源转换工具
转换完成：68/98 成功
```

## 安全与幂等

- **绝不修改原始 `.caj` 文件**，只读入字节、另存为新 PDF。
- 转换失败时删除刚写出的半成品，不留下损坏文件。
- 对同一输入可重复运行，输出一致。

## 原理简述

1. **分类**：读前 64 字节判断内部格式（`%PDF` / `CAJ`/`HN` / `KDH` / `c8` 或 GBK"北大"）。
2. **PDF-direct**：直接 `pypdf` 规范化重写；若重写后第 1 页文本量有损，则回退字节拷贝保真。
3. **PDF-repair**：优先抽取内嵌 `%PDF … %%EOF`；否则按 `\n N 0 obj` 正则扫描对象偏移重建 xref（无 Catalog 时合成 Catalog+Pages 并回填各页 `/Parent`）；再否则按 JPEG SOI/EOI 标记逐张抽取图像组装纯图像 PDF。
4. **校验**：每个产物都要求能被 `pypdf.PdfReader` 打开且页数 > 0，否则判失败。
