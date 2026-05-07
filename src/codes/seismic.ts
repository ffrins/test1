import { SeismicLevel } from './rebar';

/**
 * 22G101-1 框架梁箍筋加密区长度 (从支座边算起)
 * 一级抗震: max(2hb, 500)
 * 二/三/四级抗震: max(1.5hb, 500)
 * 非抗震: 0
 */
export function beamStirrupDenseZone(hb: number, level: SeismicLevel): number {
  if (level === null) return 0;
  if (level === 1) return Math.max(2 * hb, 500);
  return Math.max(1.5 * hb, 500);
}

/**
 * 22G101-1 框架柱箍筋加密区
 * 底层柱根: 不小于 Hn/3
 * 其他楼层: max(Hn/6, hc, 500)
 * 节点核心区: 全高加密
 */
export function columnStirrupDenseZone(
  Hn: number,
  hc: number,
  isBottom: boolean
): number {
  if (isBottom) return Hn / 3;
  return Math.max(Hn / 6, hc, 500);
}
