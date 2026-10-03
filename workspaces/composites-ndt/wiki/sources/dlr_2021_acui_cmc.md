---
title: "空气耦合超声检测氧化物 CMC 不均匀性的力学与微观评估（DLR 2021）"
type: source_summary
created_date: 2026-10-02
last_modified: 2026-10-02
last_modified_by: LLM
status: draft
confidence: high
source_count: 1
sources:
  - "[[raw/08-cmc/dlr_2021_acui_cmc_delamination]]"
tags:
  - air-coupled-ultrasound
  - cmc
  - delamination
  - defect-atlas
  - mechanical-correlation
---

# 空气耦合超声检测氧化物 CMC 不均匀性的力学与微观评估 ^h-1-1-347ab8

> **原始文件**: [[raw/08-cmc/dlr_2021_acui_cmc_delamination]]
> **作者**: Jan Roßdeutscher、Peter Mechnich、Ferdinand Flucht、Yuan Shi、Raouf Jemmali（德国航空航天中心 DLR）
> **期刊**: Journal of Composites Science, 2021, 5, 286. DOI: 10.3390/jcs5110286 ^p-1-90eaf6

## 核心论点 ^h-2-1-522a48

1. 空气耦合超声（ACU）能快速、低成本地检测大尺寸 Ox-CMC 构件的不均匀性，但 C 扫描图像的解读在关键缺陷及其对局部材料性能的影响上常含糊不清——本文提出把 ACU 局部声阻尼与随后的破坏性力学测试、微观分析关联起来。[[raw/08-cmc/dlr_2021_acui_cmc_delamination#^p-9-31feca]]
2. Young's（E）模量不可从 ACU 阻尼图预测——E 模量与阻尼几乎无相关性。[[raw/08-cmc/dlr_2021_acui_cmc_delamination#^p-149-ac5186]][[raw/08-cmc/dlr_2021_acui_cmc_delamination#^p-171-9babde]]
3. ACU 对大面积（mm² 级）但很薄（亚 µm 级）的层间基体裂纹/分层高度敏感——局部阻尼与剪切模量、弯曲强度显著相关。[[raw/08-cmc/dlr_2021_acui_cmc_delamination#^p-171-9babde]][[raw/08-cmc/dlr_2021_acui_cmc_delamination#^p-173-a36b64]]
4. XCT 重建孔隙率不能反映力学性能（12 µm³ 体素漏检基体微孔），不如 ACU 对力学敏感。[[raw/08-cmc/dlr_2021_acui_cmc_delamination#^p-171-9babde]][[raw/08-cmc/dlr_2021_acui_cmc_delamination#^p-138-c58f7b]] ^p-2-9ebdbc

## 数据要点 ^h-2-2-77bc27

- 材料：Ox-CMC 板 480×305×3 mm³（Schunk 公司），8 层 Nextel™ 610 3000 den 缎纹织物（8HSS），0/90°，Al₂O₃+ZrO₂ 基体；密度 3.0 g/cm³、孔隙率 26.2%、纤维体积分数 44.6%，预浸料铺层 + 热压罐 + 烧结，烧结态（未机加工）。[[raw/08-cmc/dlr_2021_acui_cmc_delamination#^p-47-2a917b]]
- ACU：FlatScan 1000 AirTech + USPC 4000 AirTech（Hillger-NDT），AirTech 200 换能器穿透法，频率 200 kHz，步进 0.6 mm。[[raw/08-cmc/dlr_2021_acui_cmc_delamination#^p-52-23994c]]
- 好材料区域平均衰减约 −17 dB（信号分布窄）；两个明显不均匀区位于 C 扫描左上与中下（衰减更低、散射更强）。[[raw/08-cmc/dlr_2021_acui_cmc_delamination#^p-65-610d02]]
- 相关性（R²/ANOVA）：E 模量 0.363（±45°）/0.108（0/90°）不显著；G 模量 0.853/0.650 显著；弯曲强度 0.423/0.501 显著；弯曲应变 0.257/0.733（±45° 不显著）。[[raw/08-cmc/dlr_2021_acui_cmc_delamination#^p-159-b6e2c8]][[raw/08-cmc/dlr_2021_acui_cmc_delamination#^p-149-ac5186]]
- 不均匀区弯曲强度低于基准：0/90° #3 = 282 MPa（基准均值 74%）、±45° #6 = 143 MPa（93%）。[[raw/08-cmc/dlr_2021_acui_cmc_delamination#^p-140-a41829]]
- SEM 表明主损伤为水平微裂纹，位于纤维层间边界或富基体区；较强样本（#1、#9）裂纹明显少于弱样本（#5、#3）。[[raw/08-cmc/dlr_2021_acui_cmc_delamination#^p-166-b5d9bd]] ^p-3-db5b62

## 方法/做法 ^h-2-3-1eeef8

- 多手段关联：ACU 成像 → 谐振频率阻尼分析（RFDA/脉冲激励，测 E、G 模量）→ 三点弯曲 → 微焦 CT（µCT，12 µm³ 体素）→ SEM 截面。[[raw/08-cmc/dlr_2021_acui_cmc_delamination#^p-52-23994c]][[raw/08-cmc/dlr_2021_acui_cmc_delamination#^p-54-385552]][[raw/08-cmc/dlr_2021_acui_cmc_delamination#^p-56-631dde]]
- 从 ACU 原始数据用自研 Python 脚本为每条弯曲试条提取阻尼值（5 条平行线扫描取平均）。[[raw/08-cmc/dlr_2021_acui_cmc_delamination#^p-145-261c13]]
- 取样：从 C 扫描的均匀/不均匀区切 90×10 mm² 弯曲试条，±45° 与 0/90° 两种纤维取向，样本 1–10 取自不均匀区、11–15 为均匀区基准。[[raw/08-cmc/dlr_2021_acui_cmc_delamination#^p-65-610d02]] ^p-4-100a34

## AI 综合判断 ^h-2-4-e0eacb

### 核心价值 ^h-3-1-57ae37

为陶瓷基复合材料（08-cmc）提供空气耦合超声 + 力学关联的完整案例，核心洞察「E 模量不可从 ACU 阻尼预测、G 模量与弯曲强度可关联」对 M2A 的 F2.7（信号-缺陷-性能映射）与 F2.8（模型自我学习，作者明确展望 ACU 图可作自动化质量评估训练集）有直接价值。 ^p-5-f907fd

### 关联 ^h-3-2-1c3cf7

与 [[wiki/sources/iso8203-2_array_aircoupled_ut]] 的空气耦合方法互补（本文 200 kHz 落在标准 50 kHz–1 MHz 范围，C 扫描评定与标准一致）。与 [[wiki/sources/rubber_phased_array_2025]] 形成材料维度对比（CMC vs 橡胶、空气耦合 vs 相控阵）。 ^p-6-32a5cb

### 冲突 ^h-3-3-93190b

无（冷启动）。 ^p-7-1b8746
