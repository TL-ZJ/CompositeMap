---
title: "超声缺陷当量评定（REDS/信噪比）"
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
  - defect-sizing
  - reds
---

# 超声缺陷当量评定（REDS/信噪比） ^h-1-1-e1488c

> 用反射/透射信号幅值把未知形态的缺陷换算成等效圆形反射体当量（REDS）的定量评定方法，是超声检测数据分析与验收的核心环节。 ^p-1-03e345

## 定义与背景 ^h-2-1-2a2eb8

缺陷的实际尺寸、取向、表面状态、反射率与透射率均未知，因此采用反射或透射信号的幅值信息来评定圆形反射体当量（REDS），把记录信号直接换算为 REDS。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-288-1ddf58]][[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-290-46f4ea]] ^p-2-0fb8fb

## 核心原理 ^h-2-2-c9f78f

- REDS 按公式（2）计算：REDS = 2√(NAGP·gx·gy/π)，其中 NAGP 为受影响的网格点数，gx、gy 为扫描轴步进。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-295-ca8f80]]
- 若缺陷信号整体近似圆形，按半波高宽计算：REDS = (AGx + AGy)/2。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-306-87a3f9]]
- 信噪比 RSN = 20·log(IAVE/NB)，IAVE 为幅值高于最大幅值 71%（-3 dB）部分的平均值，NB 为背景噪声最大值；用于图像评定与分级的信噪比应≥6 dB。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-328-41fa3d]][[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-260-106e8c]]
- 空气耦合对比度 = 网格点信号幅值与参考（未损伤部位）幅值之差（dB）。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-345-b820b4]] ^p-3-183963

## 应用与实例 ^h-2-3-ba846e

- 阵列超声需记录每个缺陷的最大幅值（%FSH 或 dB）、信噪比、声程、NAGP、REDS、Gx/Gy 位置。[[raw/_common/iso8203-2_frp_ndt_part2_draft#^p-281-309c90]]
- 橡胶相控阵检测以平底孔当量表达灵敏度：推荐工艺参数下达 Φ1.5 mm 平底孔当量，对应 HG/T 3090-1987 规定的压出制品气泡直径≤1.5 mm 判据。[[raw/06-rubber/rubber_phased_array_2025#^p-56-ad8763]][[raw/06-rubber/rubber_phased_array_2025#^t-17-74f8f3]] ^p-4-b2c486

## 与其他概念的关系 ^h-2-4-330f03

- [[wiki/concepts/phased-array-ultrasound|PART_OF]] — 缺陷当量评定是相控阵数据分析的组成部分。
- [[wiki/concepts/air-coupled-ultrasound|PART_OF]] — 缺陷当量评定是空气耦合数据分析的组成部分。 ^p-5-7b68d7

## 来源 ^h-2-5-26ca20

- [[wiki/sources/iso8203-2_array_aircoupled_ut]]
- [[wiki/sources/rubber_phased_array_2025]] ^p-6-1dcbff
