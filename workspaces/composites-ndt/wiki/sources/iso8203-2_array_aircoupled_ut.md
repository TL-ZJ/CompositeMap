---
title: "ISO 8203-2:2025 纤维增强塑料复合材料 无损检测 第2部分：阵列与空气耦合超声"
type: source_summary
created_date: 2026-10-02
last_modified: 2026-10-02
last_modified_by: LLM
status: draft
confidence: high
source_count: 1
sources:
  - "[[raw/_common/iso8203-2_frp_ndt_part2_draft]]"
tags:
  - standard
  - air-coupled-ultrasound
  - phased-array-ultrasound
  - frp
  - defect-sizing
---

# ISO 8203-2:2025 纤维增强塑料复合材料 无损检测 第2部分：阵列与空气耦合超声 ^h-1-1-12830e

> **原始文件**: [[raw/_common/iso8203-2_frp_ndt_part2_draft]]
> **标准号**: GB/T ××××.2 / ISO 8203-2:2025（IDT，等同采用）
> **归口**: 全国纤维增强塑料标准化技术委员会（SAC/TC 39） ^p-1-aa8088

## 核心论点 ^h-2-1-522a48

1. 本标准规定了采用合成聚焦信号处理算法的阵列超声探头、以及空气耦合超声探头对纤维增强塑料（FRP）复合材料进行机械扫查式超声检测的方法与评定要求。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-63-d6145c]]
2. 适用范围为阵列超声检测（A-UT）与空气耦合超声检测（AC-UT），面向热固性/热塑性基体的碳纤维（CFRP）与玻璃纤维（GFRP）增强塑料，限定厚度变化不超过 20% 的平板类试件。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-65-febe70]]
3. 阵列超声应采用合成聚焦算法——合成孔径聚焦（SAFT）、全矩阵采集/全聚焦（FMC/TFM）、平面波成像（PWI/TFM）或聚焦场法（FFM）——从原始数据生成 3D 图像，并以 C/B 扫描二维投影评定。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-119-a7f8c1]]
4. 空气耦合超声采用单晶片探头的一发一收（穿透）法，探头分置被检件两侧，频率范围比阵列超声低约一个数量级。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-129-68f18b]][[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-139-ef0f53]] ^p-2-e76085

## 数据要点 ^h-2-2-77bc27

- 阵列超声系统最低要求：至少控制 32 个有效晶片，工作频率覆盖 1–10 MHz，A 扫幅值分辨率≥8 位（48 dB），声程分辨力≥0.1 mm（60 ns），并配 DAC 校正单元。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-145-41ccf8]]
- 探头选型：线阵建议≥16 晶片，面阵建议 64–128 晶片。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-151-a09cee]]
- 空气耦合系统频率覆盖 50 kHz–1 MHz，晶片直径一般 15–80 mm；4 mm 厚 CFRP 可选 100–500 kHz 中心频率。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-155-1dc7f3]][[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-157-415ebc]][[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-159-53599c]]
- 空气声衰减随频率平方上升，单位声程衰减约 1.6×10⁻¹⁰×f² dB/m，50 kHz 时约 10 dB/m。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-175-7da345]]
- 表面粗糙度上限：中心频率 fP≤5 MHz 时 Ra<250 μm；fP>5 MHz 时 Ra<100 μm。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-217-339781]][[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-219-8ded6e]]
- 被检件声速校验与对比试块的差值不应超过 10%。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-224-fc4a1b]]
- 用于图像评定与分级的信噪比（RSN）应不低于 6 dB。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-260-106e8c]]
- 空气耦合基准灵敏度：将被检件未损伤部位信号调至 80% FSH。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-264-5b1bbd]]
- 周期灵敏度核查：底面/平底孔回波幅值与初始值偏差不应大于 2 dB。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-268-46cf89]] ^p-3-233656

## 方法/做法 ^h-2-3-1eeef8

- 检测程序：先测材料衰减系数与声速，再按锯齿/梳形方式扫描，记录射频（RF）A 扫数据（采样频率≥0.1 mm 声程且≥20 倍中心频率），最后用合成聚焦算法生成图像。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-222-bbf4b5]][[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-235-1725f0]]
- 对比试块以平底孔（FBH）为参考反射体，空气耦合穿透检测可使用人工分层缺陷作参考。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-204-c44aba]]
- 缺陷当量评定：按公式（2）计算圆形反射体当量 REDS = 2√(NAGP·gx·gy/π)，或以半波高宽按公式（3）REDS=(AGx+AGy)/2。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-295-ca8f80]][[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-306-87a3f9]]
- 信噪比按公式（4）RSN = 20·log(IAVE/NB)，其中 IAVE 为幅值高于最大幅值 71%（-3 dB）部分的平均值，NB 为背景噪声最大值。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-328-41fa3d]]
- 空气耦合对比度 = 网格点信号幅值与参考信号幅值之差（dB），如参考 80% FSH、信号 20% FSH 时对比度为 12 dB。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-345-b820b4]][[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-347-2d6009]]
- 检测人员须按 ISO 9712 取得 UT 2 级资质。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-353-3e217b]]
- 附录 NB 给出对比试块做法：内置缺陷用两层厚度≤0.05 mm 的 PTFE 薄膜嵌入，人工缺陷位于中间厚度处，边缘间距≥50 mm（相邻）/80 mm（边缘）。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-518-18232d]] ^p-4-9bf936

## AI 综合判断 ^h-2-4-e0eacb

### 核心价值 ^h-3-1-57ae37

冷启动下为 KB 引入复合材料超声检测的**规范性地基**：阵列超声 + 空气耦合超声两套方法、设备参数、缺陷当量评定（REDS/NAGP/信噪比）与验收判据。对 M2A 的 P1.1（检出率）、P1.2（识别准确率）验证判据、F2.5（专家阈值）、G4-C（评定标准）直接提供标准依据。 ^p-5-bdceab

### 关联 ^h-3-2-1c3cf7

本 workspace 冷启动无既有页面。与 [[wiki/sources/dlr_2021_acui_cmc]]（空气耦合超声的 CMC 案例）与 [[wiki/sources/rubber_phased_array_2025]]（相控阵超声的橡胶案例）共同构成「超声检测方法」知识簇，分别对应标准规范 / 材料案例。 ^p-6-845479

### 冲突 ^h-3-3-93190b

无（冷启动）。 ^p-7-1b8746
