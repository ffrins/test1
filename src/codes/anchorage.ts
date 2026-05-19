import { ConcreteGrade, RebarGrade, SeismicLevel } from './rebar';

// 22G101-1 受拉钢筋基本锚固长度 Lab (倍数 d)
// 简化采用常用情形: d <= 25, d > 25 时增加 ~3d (查图集精确表)
// 参考 22G101-1 表 1.0.4-1
const LAB_TABLE: Record<RebarGrade, Partial<Record<ConcreteGrade, number>>> = {
  HPB300: { C25: 34, C30: 30, C35: 28, C40: 25, C45: 24, C50: 23 },
  HRB400: { C25: 40, C30: 35, C35: 32, C40: 29, C45: 28, C50: 27 },
  HRB500: { C25: 48, C30: 43, C35: 39, C40: 36, C45: 34, C50: 32 },
};

// 抗震修正系数 ζaE
export function zetaAE(level: SeismicLevel): number {
  if (level === 1 || level === 2) return 1.15;
  if (level === 3) return 1.05;
  return 1.0; // 四级或非抗震
}

/**
 * 受拉钢筋锚固长度修正系数 ζa (22G101-1 表 1.0.4-2)
 *
 * 影响因素:
 *  - 直径 d > 25 时, ζa *= 1.10 (大直径)
 *  - 环氧树脂涂层钢筋 ζa *= 1.25
 *  - 施工扰动 ζa *= 1.10
 *  - 锚固区保护层 c (c/d > 3 时 ζa *= 0.80, c/d > 5 时 *= 0.60)
 *  - 末端机械锚固时返回 0.60 (替代直锚)
 *
 * 最小取 0.60 (机械锚固), 最大不超过 1.40 (多重不利)。
 */
export interface ZetaAOptions {
  /** 钢筋直径 mm */
  d?: number;
  /** 锚固区净保护层 (mm), 用于计算 c/d */
  c?: number;
  /** 环氧树脂涂层 */
  epoxy?: boolean;
  /** 施工扰动 (例如桩头钢筋) */
  disturbed?: boolean;
  /** 末端机械锚固 (90° 弯钩 / 锚板) */
  mechAnchor?: boolean;
}

export function zetaA(opt: ZetaAOptions = {}): number {
  if (opt.mechAnchor) return 0.6;
  let z = 1.0;
  if (opt.d != null && opt.d > 25) z *= 1.1;
  if (opt.epoxy) z *= 1.25;
  if (opt.disturbed) z *= 1.1;
  if (opt.c != null && opt.d != null && opt.d > 0) {
    const r = opt.c / opt.d;
    if (r >= 5) z *= 0.6;
    else if (r >= 3) z *= 0.8;
  }
  return Math.max(0.6, Math.min(1.4, Number(z.toFixed(3))));
}

/**
 * 受拉钢筋基本锚固长度 (mm)
 */
export function computeLab(
  grade: RebarGrade,
  concrete: ConcreteGrade,
  d: number
): number {
  const factor = LAB_TABLE[grade][concrete] ?? 35;
  // d > 25 时锚固稍增 (经验近似)
  const adj = d > 25 ? 3 : 0;
  return (factor + adj) * d;
}

/**
 * 抗震基本锚固 LabE
 */
export function computeLabE(
  grade: RebarGrade,
  concrete: ConcreteGrade,
  d: number,
  level: SeismicLevel
): number {
  return Math.round(computeLab(grade, concrete, d) * zetaAE(level));
}

/**
 * 受拉锚固 La = ζa * Lab
 * extra 未传时 ζa = 1.0 (与历史行为兼容)
 */
export function computeLa(
  grade: RebarGrade,
  concrete: ConcreteGrade,
  d: number,
  extra?: ZetaAOptions
): number {
  const za = extra ? zetaA({ d, ...extra }) : 1.0;
  return Math.round(computeLab(grade, concrete, d) * za);
}

export function computeLaE(
  grade: RebarGrade,
  concrete: ConcreteGrade,
  d: number,
  level: SeismicLevel,
  extra?: ZetaAOptions
): number {
  return Math.round(computeLa(grade, concrete, d, extra) * zetaAE(level));
}
