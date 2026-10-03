---
title: "空气耦合超声检测（ACUT）"
type: concept
created_date: 2026-10-02
last_modified: 2026-10-02
last_modified_by: LLM
status: draft
confidence: high
source_count: 2
sources:
  - "[[wiki/sources/iso8203-2_array_aircoupled_ut]]"
  - "[[wiki/sources/dlr_2021_acui_cmc]]"
tags:
  - ultrasonic-testing
  - air-coupled-ultrasound
  - composite-ndt
---

# 空气耦合超声检测（ACUT） ^h-1-1-f5a947

> 用空气作耦合介质的非接触超声检测方法，单晶片探头一发一收（穿透法）分置被检件两侧，用于大尺寸复合材料的快速无损检测。 ^p-1-9a0d7c

## 定义与背景 ^h-2-1-2a2eb8

空气耦合超声（Air-Coupled Ultrasound, ACU）以空气替代传统水/油耦合剂，探头分置被检件两侧、保持设定距离，通过机械扫查记录透射信号并以 C 扫描显示。标准 GB/T ××××.2 / ISO 8203-2:2025 将空气耦合超声检测（AC-UT）与阵列超声（A-UT）并列作为纤维增强塑料复合材料的两类机械扫查式超声方法。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-129-68f18b]][[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-63-d6145c]] ^p-2-48b7b2

## 核心原理 ^h-2-2-c9f78f

- 空气耦合频率范围通常比阵列超声低一个数量级（50 kHz–1 MHz，晶片直径一般 15–80 mm）。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-155-1dc7f3]][[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-139-ef0f53]]
- 声波在空气中衰减随频率平方上升，单位声程约 1.6×10⁻¹⁰×f² dB/m（50 kHz 约 10 dB/m），故只能工作在低频。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-175-7da345]]
- 穿透法以透射信号幅值变化表征缺陷：较低衰减通常对应材料间隙（基体裂纹/孔隙聚集），大面积分层则表现为高衰减。[[raw/08-cmc/dlr_2021_acui_cmc_delamination#^p-65-610d02]]
- 基准灵敏度设定为被检件未损伤部位信号 80% FSH。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-264-5b1bbd]] ^p-3-46975d

## 应用与实例 ^h-2-3-ba846e

- 大尺寸 Ox-CMC 板不均匀性检测：200 kHz 穿透法，好材料平均衰减约 −17 dB，可分辨大面积（mm²）但薄（亚 µm）的层间基体裂纹/分层，且局部阻尼与剪切模量、弯曲强度显著相关（G 模量 R²=0.853）。[[raw/08-cmc/dlr_2021_acui_cmc_delamination#^p-52-23994c]][[raw/08-cmc/dlr_2021_acui_cmc_delamination#^p-171-9babde]]
- 4 mm 厚 CFRP 可选 100–500 kHz 中心频率探头（附录 NA 给出模压/热压罐、缠绕成型的探头推荐表）。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-159-53599c]] ^p-4-dfd7ef

## 与其他概念的关系 ^h-2-4-330f03

- [[wiki/concepts/phased-array-ultrasound|ALTERNATIVE_TO]] — 同为复合材料超声无损检测方法，路线不同（非接触穿透法 vs 接触/水浸阵列聚焦）。
- [[wiki/concepts/ultrasonic-defect-sizing]] — 缺陷当量评定（REDS/对比度）。 ^p-5-948b87

## 来源 ^h-2-5-26ca20

- [[wiki/sources/iso8203-2_array_aircoupled_ut]]
- [[wiki/sources/dlr_2021_acui_cmc]] ^p-6-1d1c9b
