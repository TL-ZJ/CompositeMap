---
title: "基于相控阵超声的变压器密封橡胶内部缺陷检测（声学技术 2026）"
type: source_summary
created_date: 2026-10-02
last_modified: 2026-10-02
last_modified_by: LLM
status: draft
confidence: high
source_count: 1
sources:
  - "[[raw/06-rubber/rubber_phased_array_2025]]"
tags:
  - phased-array-ultrasound
  - rubber
  - nbr
  - defect-atlas
  - flat-bottom-hole
---

# 基于相控阵超声的变压器密封橡胶内部缺陷检测 ^h-1-1-c93947

> **原始文件**: [[raw/06-rubber/rubber_phased_array_2025]]
> **作者**: 张鹏鲲、林林、赵娜、刘洋、季昌国、王云、徐海滨（国网冀北电力）
> **期刊**: 声学技术（Technical Acoustics），2026，DOI: 10.16300/j.cnki.1000-3630.25060301 ^p-1-e0efd2

## 核心论点 ^h-2-1-522a48

1. 橡胶具有高粘弹性与高阻尼，会强烈吸收并衰减入射声能，声阻抗匹配困难——常用自发自收单晶直探头甚至无法获得底波，因此需要相控阵超声（PAUT）。[[raw/06-rubber/rubber_phased_array_2025#^p-7-d34525]]
2. 密封橡胶的声速与声衰减系数均随频率增大而增大：1 MHz 时衰减 1.939 dB/mm、声速 1573 m/s，5 MHz 时衰减 4.061 dB/mm、声速 1749 m/s。[[raw/06-rubber/rubber_phased_array_2025#^p-27-efa5ed]]
3. 采用相控阵纵波、双面检测可实现变压器密封橡胶板的内部缺陷检测；推荐工艺参数下灵敏度达 Φ1.5 mm 平底孔当量。[[raw/06-rubber/rubber_phased_array_2025#^p-56-ad8763]]
4. 推荐工艺参数：中心频率 f=2.25 MHz、激发阵元数 n=16~20、聚焦深度 h=1.5T~2T。[[raw/06-rubber/rubber_phased_array_2025#^p-56-ad8763]] ^p-2-d4f687

## 数据要点 ^h-2-2-77bc27

- 声特性（表 1，17 ℃，丁腈橡胶）：1 MHz → 衰减 1.939 dB/mm、声速 1573 m/s、波长 1.573 mm；2.5 MHz → 3.766 dB/mm、1632 m/s、0.6528 mm；5 MHz → 4.061 dB/mm、1749 m/s、0.3498 mm。[[raw/06-rubber/rubber_phased_array_2025#^p-27-efa5ed]]
- 对比钢铁材料（衰减 α=5 dB/m、纵波声速 CL=5940 m/s），橡胶的衰减大、声速低，差异巨大。[[raw/06-rubber/rubber_phased_array_2025#^p-27-efa5ed]]
- 中心频率由 2.25 MHz 升至 5 MHz 时缺陷回波强度与有效检测深度明显减小（5 MHz 有效深度仅 2~3 mm，无法检出 1 mm 深 Φ1.5 mm 平底孔）。[[raw/06-rubber/rubber_phased_array_2025#^t-43-6c0347]]
- 现场应用（承德 220 kV 变电站，10 mm 丁腈橡胶板）：检出缺陷 Q1（深度 3.46 mm / 长度 7.20 mm）与 Q2（3.71 mm / 7.40 mm），与解剖结果（3.62/6.70、3.82/7.00 mm）吻合。[[raw/06-rubber/rubber_phased_array_2025#^p-55-3185ff]]
- 缺陷判据参照 HG/T 3090-1987：模压制品气泡缺陷长度/宽度≤2 mm、压出制品气泡直径≤1.5 mm。[[raw/06-rubber/rubber_phased_array_2025#^t-17-74f8f3]] ^p-3-c0cb37

## 方法/做法 ^h-2-3-1eeef8

- 声速/衰减测定：汉威 HS700 超声仪 + 纵波透射法，5/2.5/1 MHz 三组单晶直探头一发一收正对布置，水槽中进行，试样为 250×200 mm 丁腈橡胶板，保持 17 ℃。[[raw/06-rubber/rubber_phased_array_2025#^p-14-cafe11]]
- 相控阵检测：多浦乐 Phascan 仪 + 64 阵元线阵探头（阵元间距 0.6 mm、阵元长 10 mm、0° 平楔块）；试样 250×200 mm 丁腈橡胶板（厚 8/10/12 mm），预制 Φ1.5/2/3 mm 平底孔模拟扁平气泡缺陷，机油耦合。[[raw/06-rubber/rubber_phased_array_2025#^p-19-512b62]]
- 单一变量法：分别改变激发阵元数 n（8/12/16/20/24）、聚焦深度 h（T/1.5T/2T/2.5T）、中心频率 f（2.25/5 MHz），分析不同孔径/深度的缺陷图像质量与检出率；TCG 曲线用 NB/T 47013.3 碳钢 CS-3-1 试块上 25/35/45 mm 三个 Φ2 mm 平底孔制作。[[raw/06-rubber/rubber_phased_array_2025#^p-19-512b62]]
- 激发阵元数与聚焦深度的可选组合范围：n=12~20、h=12~16 mm（h=1.5T~2T），此时成像精度与灵敏度平衡较好。[[raw/06-rubber/rubber_phased_array_2025#^p-42-06069c]] ^p-4-951e42

## AI 综合判断 ^h-2-4-e0eacb

### 核心价值 ^h-3-1-57ae37

为橡胶材料（06-rubber）提供首个相控阵超声检测案例：声特性基准数据（衰减系数/声速随频率的关系）、推荐工艺参数、现场验证结果（与解剖吻合）。直接支撑 M2A 的 S·A 工件属性（橡胶声学参数）、F2.7（信号-缺陷映射）、F2.5（专家阈值）。 ^p-5-d231a4

### 关联 ^h-3-2-1c3cf7

与 [[wiki/sources/iso8203-2_array_aircoupled_ut]] 的阵列超声方法互补——ISO 给出规范要求与缺陷当量公式，本文给出橡胶这一高衰减材料的具体参数与 Φ1.5 mm 平底孔当量灵敏度。与 [[wiki/sources/dlr_2021_acui_cmc]] 形成材料维度对比（橡胶 vs CMC，相控阵 vs 空气耦合）。 ^p-6-649652

### 冲突 ^h-3-3-93190b

无（冷启动）。 ^p-7-1b8746
