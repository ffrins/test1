// 钢筋等级与符号映射 (22G101)
// 平法符号: A=HPB300(光圆), B=HRB335, C=HRB400, D=HRB500, E=HRBF400/500
export type RebarGrade = 'HPB300' | 'HRB400' | 'HRB500';
export type ConcreteGrade = 'C25' | 'C30' | 'C35' | 'C40' | 'C45' | 'C50';
export type SeismicLevel = 1 | 2 | 3 | 4 | null; // null = 非抗震

export const GRADE_SYMBOL: Record<string, RebarGrade> = {
  A: 'HPB300', Φ: 'HPB300', φ: 'HPB300',
  B: 'HRB400', // 简化: 通常 B 表示 HRB335，已淘汰，此处近似按 HRB400 处理
  C: 'HRB400',
  D: 'HRB500',
  E: 'HRB500',
};

export const GRADE_TO_SYMBOL: Record<RebarGrade, string> = {
  HPB300: 'A',
  HRB400: 'C',
  HRB500: 'D',
};

// 22G101 抗震弯钩平直段 (箍筋 135°): max(10d, 75mm)
export function stirrupHookStraight(d: number): number {
  return Math.max(10 * d, 75);
}
