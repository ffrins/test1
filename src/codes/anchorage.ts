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
 * 受拉锚固 La (此处近似 ζa = 1.0; 一般工程已经是简化场景)
 */
export function computeLa(
  grade: RebarGrade,
  concrete: ConcreteGrade,
  d: number
): number {
  return computeLab(grade, concrete, d);
}

export function computeLaE(
  grade: RebarGrade,
  concrete: ConcreteGrade,
  d: number,
  level: SeismicLevel
): number {
  return Math.round(computeLa(grade, concrete, d) * zetaAE(level));
}
