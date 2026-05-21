import { computeLabE } from '@/codes/anchorage';
import { beamStirrupDenseZone } from '@/codes/seismic';
import { buildBeamStirrupShapes } from './stirrupLoop';
import { BeamParams, BuiltGeometry, RebarLine, StirrupShape } from './types';

/**
 * 坐标系：
 *   X: 梁长方向，0 = 左支座外边缘
 *   Y: 竖直方向，0 = 梁底
 *   Z: 截面宽度方向，0 = 梁中
 *
 * 梁总长 = leftSupport + Σ spans + Σ interiorSupports.width + rightSupport
 */
export function buildBeam(p: BeamParams): BuiltGeometry {
  // —— 归一化:把单跨/多跨统一成 spans[] + interior[] ——
  const r = resolveSpans(p);
  const { spans, interior, totalLen, spanRanges, supportRanges } = r;

  const { b, h, cover, leftSupport, rightSupport, seismicLevel } = p;
  const h1 = p.h1 ?? h;
  const isVariable = Math.abs(h1 - h) > 1e-3;
  // 沿 X 的梁高函数(线性渐变;阶梯过渡此处简化为线性,后续可改)
  const hAt = (x: number): number => {
    if (!isVariable) return h;
    const t = Math.max(0, Math.min(1, x / totalLen));
    if (p.transition === 'step') {
      // 阶梯: 中点切换
      return t < 0.5 ? h : h1;
    }
    return h + (h1 - h) * t;
  };

  const rebars: RebarLine[] = [];
  const stirrups: StirrupShape[] = [];

  // —— 1. 上部通长筋 + 端支座弯锚 ——
  const top = p.topThrough;
  const labE = computeLabE(top.grade, p.concrete, top.diameter, seismicLevel);
  const hookV = 15 * top.diameter;
  const horizAnchor = Math.max(0.4 * labE, leftSupport.width - cover);
  const yTopAt = (x: number) => hAt(x) - cover - p.stirrup.diameter - top.diameter / 2;
  const topZs = distributeZ(top.count, b, cover, p.stirrup.diameter, top.diameter);
  for (const z of topZs) {
    const xStart = leftSupport.width - horizAnchor;
    const xEnd = totalLen - (rightSupport.width - horizAnchor);
    const pts: [number, number, number][] = isVariable
      ? sampleTopProfile(xStart, xEnd, yTopAt, z, hookV)
      : [
          [xStart, yTopAt(xStart) - hookV, z],
          [xStart, yTopAt(xStart), z],
          [xEnd, yTopAt(xEnd), z],
          [xEnd, yTopAt(xEnd) - hookV, z],
        ];
    rebars.push({
      grade: top.grade,
      diameter: top.diameter,
      points: pts,
      role: '上部通长筋',
      length: polylineLen(pts),
    });
  }

  // —— 2. 下部纵筋(逐跨独立, 端跨入端支座, 中间支座搭接) ——
  const bot = p.bottom;
  const labEb = computeLabE(bot.grade, p.concrete, bot.diameter, seismicLevel);
  const hookVb = 15 * bot.diameter;
  const yBot = cover + p.stirrup.diameter + bot.diameter / 2;
  const botZs = distributeZ(bot.count, b, cover, p.stirrup.diameter, bot.diameter);
  for (let si = 0; si < spans.length; si++) {
    const [xL, xR] = spanRanges[si];
    const isFirst = si === 0;
    const isLast = si === spans.length - 1;
    // 端跨锚入端支座, 中间跨锚入相邻中间支座(简化: 伸入支座 LaE)
    const xStart = isFirst
      ? leftSupport.width - Math.max(0.4 * labEb, leftSupport.width - cover)
      : xL - labEb;
    const xEnd = isLast
      ? totalLen - (rightSupport.width - Math.max(0.4 * labEb, rightSupport.width - cover))
      : xR + labEb;

    for (const z of botZs) {
      const pts: [number, number, number][] = [];
      if (isFirst) pts.push([xStart, yBot + hookVb, z]); // 左端弯钩
      pts.push([xStart, yBot, z]);
      pts.push([xEnd, yBot, z]);
      if (isLast) pts.push([xEnd, yBot + hookVb, z]); // 右端弯钩
      rebars.push({
        grade: bot.grade,
        diameter: bot.diameter,
        points: pts,
        role: spans.length > 1 ? `第${si + 1}跨下部纵筋` : '下部纵筋',
        length: polylineLen(pts),
      });
    }
  }

  // —— 3. 侧面构造筋 G(贯通整梁) ——
  if (p.sideG && p.sideG.countPerSide > 0) {
    const g = p.sideG;
    const ext = 15 * g.diameter;
    // 取梁中点高度作侧筋分布参考(变截面时按平均高)
    const hMid = (h + h1) / 2;
    const innerH = hMid - 2 * cover - 2 * p.stirrup.diameter;
    for (let side = -1; side <= 1; side += 2) {
      const z = side * (b / 2 - cover - p.stirrup.diameter - g.diameter / 2);
      for (let i = 1; i <= g.countPerSide; i++) {
        const y = yBot + (innerH * i) / (g.countPerSide + 1);
        const pts: [number, number, number][] = [
          [leftSupport.width - ext, y, z],
          [totalLen - rightSupport.width + ext, y, z],
        ];
        rebars.push({
          grade: g.grade,
          diameter: g.diameter,
          points: pts,
          role: '侧面构造筋 G',
          length: pts[1][0] - pts[0][0],
        });
      }
    }
  }

  // —— 4. 支座负筋(仅多跨中间支座) ——
  if (spans.length >= 2 && p.supportNeg && p.supportNeg.count > 0) {
    const sn = p.supportNeg;
    const negZs = distributeZ(sn.count, b, cover, p.stirrup.diameter, sn.diameter);
    for (let i = 0; i < interior.length; i++) {
      const [sxL, sxR] = supportRanges[i + 1]; // supportRanges[0]=left end, [last]=right end
      const xc = (sxL + sxR) / 2;
      const lnL = spans[i];
      const lnR = spans[i + 1];
      const extend = Math.max(lnL, lnR) / 3;
      const xStart = xc - extend;
      const xEnd = xc + extend;
      for (const z of negZs) {
        const yT = yTopAt(xc);
        const pts: [number, number, number][] = [
          [xStart, yT, z],
          [xEnd, yT, z],
        ];
        rebars.push({
          grade: sn.grade,
          diameter: sn.diameter,
          points: pts,
          role: `第${i + 1}支座负筋`,
          length: xEnd - xStart,
        });
      }
    }
  }

  // —— 5. 箍筋(逐跨独立加密区, 含多肢复合箍) ——
  const sd = p.stirrup.diameter;

  const allDense: number[] = [];
  const allSparse: number[] = [];
  for (let si = 0; si < spans.length; si++) {
    const [xL, xR] = spanRanges[si];
    const denseZone = beamStirrupDenseZone(hAt((xL + xR) / 2), seismicLevel);
    const { dense, sparse } = collectStirrupSplit(
      xL,
      xR,
      p.stirrup.spacingDense,
      p.stirrup.spacingSparse,
      denseZone,
      50
    );
    allDense.push(...dense);
    allSparse.push(...sparse);
  }

  if (!isVariable) {
    // 等截面：所有箍筋共享同一组 loop
    const shapes = buildBeamStirrupShapes(
      p.stirrup.legs, b, h, cover, sd, p.stirrup.grade,
      allDense, allSparse
    );
    stirrups.push(...shapes);
  } else {
    // 变截面：每根箍筋按其 x 处高度独立生成 loop
    for (const x of allDense) {
      const shapes = buildBeamStirrupShapes(
        p.stirrup.legs, b, hAt(x), cover, sd, p.stirrup.grade,
        [x], []
      );
      stirrups.push(...shapes);
    }
    for (const x of allSparse) {
      const shapes = buildBeamStirrupShapes(
        p.stirrup.legs, b, hAt(x), cover, sd, p.stirrup.grade,
        [], [x]
      );
      stirrups.push(...shapes);
    }
  }

  // —— 7. 支座上下文 (端柱 + 中间柱) ——
  const colDepth = Math.max(b * 1.4, 400);
  const supports: NonNullable<BuiltGeometry['supports']> = [];
  // 左端
  {
    const [xL, xR] = supportRanges[0];
    const hl = hAt(xL);
    supports.push({
      size: [xR - xL, hl * 2, colDepth],
      center: [(xL + xR) / 2, hl / 2, 0],
      label: '左支座柱',
    });
  }
  // 中间
  for (let i = 0; i < interior.length; i++) {
    const [xL, xR] = supportRanges[i + 1];
    const hx = hAt((xL + xR) / 2);
    supports.push({
      size: [xR - xL, hx * 2, colDepth],
      center: [(xL + xR) / 2, hx / 2, 0],
      label: `中间支座柱-${i + 1}`,
    });
  }
  // 右端
  {
    const [xL, xR] = supportRanges[supportRanges.length - 1];
    const hr = hAt(xR);
    supports.push({
      size: [xR - xL, hr * 2, colDepth],
      center: [(xL + xR) / 2, hr / 2, 0],
      label: '右支座柱',
    });
  }

  // —— 混凝土包围盒(变截面取平均高;3D 渲染由 Concrete 自己处理) ——
  const hMax = Math.max(h, h1);
  return {
    rebars,
    stirrups,
    supports,
    concrete: {
      size: [totalLen, hMax, b],
      center: [totalLen / 2, hMax / 2, 0],
    },
  };
}

// —— 工具函数 ——

interface ResolvedSpans {
  spans: number[];
  interior: { width: number }[];
  totalLen: number;
  /** 每跨净跨范围 [xL, xR] */
  spanRanges: [number, number][];
  /** 每段支座范围 [xL, xR],长度 = spans.length + 1 */
  supportRanges: [number, number][];
}

function resolveSpans(p: BeamParams): ResolvedSpans {
  const spans = p.spans && p.spans.length > 0 ? p.spans.slice() : [p.span];
  const interior = (p.interiorSupports ?? []).slice();
  while (interior.length < spans.length - 1) interior.push({ width: 500 });
  if (interior.length > spans.length - 1) interior.length = spans.length - 1;

  const supportRanges: [number, number][] = [];
  const spanRanges: [number, number][] = [];
  let x = 0;
  supportRanges.push([x, x + p.leftSupport.width]);
  x += p.leftSupport.width;
  for (let i = 0; i < spans.length; i++) {
    spanRanges.push([x, x + spans[i]]);
    x += spans[i];
    if (i < spans.length - 1) {
      supportRanges.push([x, x + interior[i].width]);
      x += interior[i].width;
    }
  }
  supportRanges.push([x, x + p.rightSupport.width]);
  x += p.rightSupport.width;
  return { spans, interior, totalLen: x, spanRanges, supportRanges };
}

/** 变截面下顶筋按高度变化采样(每 500mm 一段) */
function sampleTopProfile(
  xStart: number,
  xEnd: number,
  yAt: (x: number) => number,
  z: number,
  hookV: number
): [number, number, number][] {
  const pts: [number, number, number][] = [];
  pts.push([xStart, yAt(xStart) - hookV, z]);
  const step = 500;
  for (let x = xStart; x <= xEnd; x += step) {
    pts.push([x, yAt(x), z]);
  }
  pts.push([xEnd, yAt(xEnd), z]);
  pts.push([xEnd, yAt(xEnd) - hookV, z]);
  return pts;
}

function polylineLen(pts: [number, number, number][]): number {
  let l = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    l += Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  }
  return l;
}

/** 截面 z 方向均布 */
function distributeZ(
  count: number,
  b: number,
  cover: number,
  stirrupD: number,
  d: number
): number[] {
  if (count <= 0) return [];
  const usable = b - 2 * (cover + stirrupD + d / 2);
  const left = -usable / 2;
  if (count === 1) return [0];
  const step = usable / (count - 1);
  return Array.from({ length: count }, (_, i) => left + i * step);
}

/** 按加密区分布生成箍筋 X 坐标，分别返回加密区与非加密区 */
function collectStirrupSplit(
  xL: number,
  xR: number,
  sDense: number,
  sSparse: number,
  denseZone: number,
  startOffset: number
): { dense: number[]; sparse: number[] } {
  const dense: number[] = [];
  const sparse: number[] = [];
  // 安全保护:避免无效间距导致死循环
  if (sDense <= 0 || sSparse <= 0) return { dense, sparse };
  let x = xL + startOffset;
  while (x < xL + denseZone && x < xR) {
    dense.push(x);
    x += sDense;
  }
  while (x < xR - denseZone) {
    sparse.push(x);
    x += sSparse;
  }
  while (x <= xR - startOffset) {
    dense.push(x);
    x += sDense;
  }
  return { dense, sparse };
}
