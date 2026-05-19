import type { BeamParams, ColumnParams, WallParams } from '@/geometry/types';

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

const empty = (): ValidationResult => ({ errors: [], warnings: [] });

export function validateBeam(b: BeamParams): ValidationResult {
  const r = empty();
  const spans = b.spans && b.spans.length > 0 ? b.spans : [b.span];

  // 几何
  if (b.b <= 100) r.errors.push(`截面宽 b=${b.b}mm 过小 (>100 推荐 >=200)`);
  if (b.h <= 200) r.errors.push(`截面高 h=${b.h}mm 过小 (>=300)`);
  if (b.cover < 15) r.errors.push(`保护层 c=${b.cover}mm 过小 (最小 15)`);
  if (b.cover < b.stirrup.diameter + b.bottom.diameter / 2)
    r.warnings.push(`保护层可能不足以覆盖箍筋+纵筋净距`);
  for (let i = 0; i < spans.length; i++) {
    if (spans[i] < 1000) r.errors.push(`第 ${i + 1} 跨净跨 ${spans[i]}mm 过小`);
    if (spans[i] > 20000) r.warnings.push(`第 ${i + 1} 跨净跨 ${spans[i]}mm 偏大`);
  }
  if (b.interiorSupports) {
    if (b.interiorSupports.length !== spans.length - 1)
      r.warnings.push(`中间支座数量与跨数不匹配,自动按 500mm 补齐`);
    for (const s of b.interiorSupports) {
      if (s.width < 200) r.warnings.push(`中间支座宽 ${s.width}mm 偏小`);
    }
  }
  if (b.leftSupport.width < 200) r.warnings.push(`左支座宽 ${b.leftSupport.width}mm 偏小`);
  if (b.rightSupport.width < 200) r.warnings.push(`右支座宽 ${b.rightSupport.width}mm 偏小`);

  // 变截面
  const h1 = b.h1 ?? b.h;
  if (h1 < 200) r.errors.push(`右端高 h₁=${h1}mm 过小`);
  if (Math.abs(h1 - b.h) > b.h * 0.5) r.warnings.push(`变截面落差过大 (>50%),受力复杂请复核`);

  // 配筋
  if (b.topThrough.count < 2) r.errors.push(`上部通长筋至少 2 根`);
  if (b.bottom.count < 2) r.errors.push(`下部纵筋至少 2 根`);
  if (b.stirrup.diameter >= b.bottom.diameter)
    r.warnings.push(`箍筋直径 ≥ 纵筋直径,通常应小于纵筋`);
  if (b.stirrup.spacingDense > b.stirrup.spacingSparse)
    r.errors.push(`加密区间距 (${b.stirrup.spacingDense}) 应 ≤ 非加密 (${b.stirrup.spacingSparse})`);
  if (b.stirrup.spacingDense <= 0 || b.stirrup.spacingSparse <= 0)
    r.errors.push(`箍筋间距必须 > 0`);
  if (b.stirrup.spacingDense > 200) r.warnings.push(`加密区间距 > 200mm,可能不满足抗震`);

  // 多跨需要支座负筋
  if (spans.length >= 2 && (!b.supportNeg || b.supportNeg.count <= 0))
    r.warnings.push(`多跨梁未配支座负筋,中间支座顶部抗负弯矩不足`);

  return r;
}

export function validateColumn(c: ColumnParams): ValidationResult {
  const r = empty();
  if (c.b < 200 || c.h < 200) r.errors.push(`柱截面 ${c.b}×${c.h} 过小 (>=300)`);
  if (c.cover < 15) r.errors.push(`保护层 c=${c.cover}mm 过小`);
  if (c.height < 1000) r.errors.push(`柱净高 Hn=${c.height}mm 过小`);
  if (c.longitudinal.nB < 2 || c.longitudinal.nH < 2)
    r.errors.push(`柱边纵筋至少 2 根(含角筋)`);
  if (c.stirrup.spacingDense > c.stirrup.spacingSparse)
    r.errors.push(`加密区间距 ≤ 非加密区间距`);
  if (c.stirrup.diameter < 6) r.warnings.push(`箍筋直径偏小 (建议 ≥ 8)`);
  return r;
}

export function validateWall(w: WallParams): ValidationResult {
  const r = empty();
  if (w.thickness < 160) r.warnings.push(`墙厚 t=${w.thickness}mm 偏小 (剪力墙建议 ≥160)`);
  if (w.vertical.spacing > 300) r.warnings.push(`竖向分布筋间距 > 300mm`);
  if (w.horizontal.spacing > 300) r.warnings.push(`水平分布筋间距 > 300mm`);
  if (w.cover < 10) r.errors.push(`保护层 c=${w.cover}mm 过小`);
  if (w.length < 500) r.errors.push(`墙长 L=${w.length}mm 过小`);
  return r;
}
