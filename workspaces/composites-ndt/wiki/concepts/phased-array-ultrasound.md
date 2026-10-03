---
title: "相控阵超声检测（PAUT）"
type: concept
created_date: 2026-10-02
last_modified: 2026-10-02
last_modified_by: LLM
status: draft
confidence: high
source_count: 2
sources:
  - "[[wiki/sources/iso8203-2_array_aircoupled_ut]]"
  - "[[wiki/sources/rubber_phased_array_2025]]"
tags:
  - ultrasonic-testing
  - phased-array-ultrasound
  - composite-ndt
---

# 相控阵超声检测（PAUT） ^h-1-1-466341

> 通过电子系统控制超声阵列各阵元的延时激发/接收，动态聚焦与偏转声束的无损检测方法，成像分辨率与灵敏度高。 ^p-1-971539

## 定义与背景 ^h-2-1-2a2eb8

相控阵超声（Phased Array Ultrasonic Testing, PAUT）按延迟法则控制阵列中各阵元发射/接收超声波，实现声束聚焦与偏转。标准 ISO 8203-2:2025 规定阵列超声探头应为线阵或面阵，通过部分晶片控制电子束偏转、孔径聚焦，并采用合成聚焦算法生成 2D/3D 图像。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-114-e64ae0]][[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-115-9d1cad]] ^p-2-27edd1

## 核心原理 ^h-2-2-c9f78f

- 阵列超声系统最低应控制 ≥32 个有效晶片，工作频率 1–10 MHz，A 扫幅值分辨率≥8 位（48 dB）、声程分辨力≥0.1 mm（60 ns）。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-145-41ccf8]]
- 合成聚焦算法：SAFT、FMC/TFM、PWI/TFM、FFM，从原始数据生成 3D 图像，以 C/B 扫描二维投影评定。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-119-a7f8c1]]
- 探头选型：线阵建议≥16 晶片、面阵 64–128 晶片，按被检件几何形状选择晶片数量与尺寸以实现中平面聚焦。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-151-a09cee]]
- 高衰减材料（如橡胶）需权衡频率：频率升高分辨率提高但有效检测深度减小。[[raw/06-rubber/rubber_phased_array_2025#^p-56-ad8763]] ^p-3-35ece8

## 应用与实例 ^h-2-3-ba846e

- 变压器密封橡胶内部缺陷：多浦乐 Phascan 仪 + 64 阵元线阵（间距 0.6 mm、阵元长 10 mm、0° 平楔块），推荐 f=2.25 MHz、n=16~20、h=1.5T~2T，双面纵波检测，灵敏度达 Φ1.5 mm 平底孔当量。[[raw/06-rubber/rubber_phased_array_2025#^p-19-512b62]][[raw/06-rubber/rubber_phased_array_2025#^p-56-ad8763]]
- 橡胶声特性：衰减系数/声速随频率增大（1 MHz 1.939 dB/mm、1573 m/s；5 MHz 4.061 dB/mm、1749 m/s）。[[raw/06-rubber/rubber_phased_array_2025#^p-27-efa5ed]] ^p-4-a8ca0a

## 与其他概念的关系 ^h-2-4-330f03

- [[wiki/concepts/air-coupled-ultrasound|ALTERNATIVE_TO]] — 同为复合材料超声检测方法，路线不同（阵列聚焦接触/水浸法 vs 空气耦合穿透法）。
- [[wiki/concepts/ultrasonic-defect-sizing]] — 缺陷当量评定（REDS/NAGP）。 ^p-5-c39e35

## 来源 ^h-2-5-26ca20

- [[wiki/sources/iso8203-2_array_aircoupled_ut]]
- [[wiki/sources/rubber_phased_array_2025]] ^p-6-1dcbff
