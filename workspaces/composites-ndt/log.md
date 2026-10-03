# composites-ndt 操作日志

## [2026-10-02] ingest | 冷启动首批入库：ISO 8203-2 + 橡胶相控阵 + DLR 空气耦合 CMC
- 来源：`raw/_common/iso8203-2_frp_ndt_part2_draft`、`raw/06-rubber/rubber_phased_array_2025`、`raw/08-cmc/dlr_2021_acui_cmc_delamination`
- 新建：`wiki/sources/iso8203-2_array_aircoupled_ut`、`wiki/sources/rubber_phased_array_2025`、`wiki/sources/dlr_2021_acui_cmc`、`wiki/concepts/air-coupled-ultrasound`、`wiki/concepts/phased-array-ultrasound`、`wiki/concepts/ultrasonic-defect-sizing`、`wiki/root_index`
- 更新：无（冷启动，workspace 首次 ingest）
- 标记待更新：无
- MOC：`wiki/root_index`
- 摘要：ISO 8203-2 标准（阵列/空气耦合超声的规范地基）+ 橡胶相控阵案例（声特性 + Φ1.5mm 当量）+ DLR 空气耦合 CMC 案例（阻尼↔力学关联），建立超声检测方法与缺陷当量评定的概念骨架
- 备注：NASA PRSEUS 冲击分层 B/C 扫 PDF 已锁定目标 = NASA/TM-2013-217799（Johnston 2013, "Ultrasonic Nondestructive Evaluation of PRSEUS Pressure Cube Article in Support of Load Test to Failure", NTRS 20130013480, 36 页）。2026-10-02 重试：NTRS/fdlp.gov/core.ac.uk 均 403 或 Cloudflare 挑战，archive.org/TIB 超时，hdl.handle.net 重定向回 NTRS——从当前（中国）IP 全部不可达，未做规避。待换网络手动下载后补入 `raw/01-cfrp/`
