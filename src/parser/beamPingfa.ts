import { GRADE_SYMBOL, RebarGrade } from '@/codes/rebar';
import { BeamParams } from '@/geometry/types';

/**
 * 解析平法标注字符串，例如:
 *   KL2(2A) 300×700  Φ10@100/200(4)  2C25;4C25  G4C12
 *
 * 支持:
 *   - 编号: KL2 / L1 / 跨数(2)/(2A)/(3B)
 *   - 截面 b×h: 300×700 或 300x700
 *   - 箍筋: Φ10@100/200(4) 或 A10@100(4)
 *   - 上下纵筋: 2C25;4C25 (用 ; 分隔上部与下部)
 *   - 侧面构造筋 G: G4C12 (每侧根数后接规格)
 *
 * 解析失败的字段会抛出友好错误。
 */
export interface ParseResult {
  patch: Partial<BeamParams>;
  warnings: string[];
}

export function parseBeamPingfa(input: string): ParseResult {
  const warnings: string[] = [];
  const text = input.replace(/\s+/g, ' ').trim();
  const patch: Partial<BeamParams> = {};

  // 编号 + 跨数
  const idMatch = text.match(/(KL|L|WKL|XL)\s*(\d+)\s*(?:\((\d+[AB]?)\))?/);
  if (idMatch) {
    patch.id = idMatch[1] + idMatch[2];
    patch.type = idMatch[1].startsWith('K') ? 'KL' : 'L';
  } else {
    warnings.push('未识别梁编号 (KLn/Ln)');
  }

  // 截面尺寸 b×h
  const secMatch = text.match(/(\d{2,4})\s*[×x*]\s*(\d{2,4})/);
  if (secMatch) {
    patch.b = parseInt(secMatch[1], 10);
    patch.h = parseInt(secMatch[2], 10);
  } else {
    warnings.push('未识别截面尺寸 b×h');
  }

  // 箍筋 Φ10@100/200(4) 或 A10@100(4)
  const stMatch = text.match(/([ΦφABCDE])\s*(\d{1,2})\s*@\s*(\d{2,3})(?:\s*\/\s*(\d{2,3}))?\s*(?:\((\d)\))?/);
  if (stMatch) {
    const grade = GRADE_SYMBOL[stMatch[1]] ?? 'HPB300';
    const d = parseInt(stMatch[2], 10);
    const sd = parseInt(stMatch[3], 10);
    const ss = stMatch[4] ? parseInt(stMatch[4], 10) : sd;
    const legs = stMatch[5] ? parseInt(stMatch[5], 10) : 2;
    patch.stirrup = {
      grade,
      diameter: d,
      spacingDense: sd,
      spacingSparse: ss,
      legs,
    };
  } else {
    warnings.push('未识别箍筋');
  }

  // 上下部纵筋: 形如 "2C25;4C25" 或 "2C25/4C25"
  const lrMatch = text.match(/(\d+[ABCDE]\d{1,2}(?:\+\d+[ABCDE]\d{1,2})?)\s*[;；\/]\s*(\d+[ABCDE]\d{1,2}(?:\+\d+[ABCDE]\d{1,2})?)/);
  if (lrMatch) {
    const top = parseRebarGroup(lrMatch[1]);
    const bot = parseRebarGroup(lrMatch[2]);
    if (top) patch.topThrough = top;
    if (bot) patch.bottom = bot;
  } else {
    warnings.push('未识别上/下部纵筋 (例如 2C25;4C25)');
  }

  // 侧面构造筋 G: G4C12
  const gMatch = text.match(/\bG\s*(\d+)\s*([ABCDE])\s*(\d{1,2})/);
  if (gMatch) {
    patch.sideG = {
      countPerSide: Math.ceil(parseInt(gMatch[1], 10) / 2),
      grade: GRADE_SYMBOL[gMatch[2]] ?? 'HRB400',
      diameter: parseInt(gMatch[3], 10),
    };
  }

  return { patch, warnings };
}

function parseRebarGroup(s: string): { grade: RebarGrade; diameter: number; count: number } | null {
  // 取首段 (忽略 + 后续叠加，简化)
  const m = s.match(/(\d+)([ABCDE])(\d{1,2})/);
  if (!m) return null;
  return {
    count: parseInt(m[1], 10),
    grade: GRADE_SYMBOL[m[2]] ?? 'HRB400',
    diameter: parseInt(m[3], 10),
  };
}
