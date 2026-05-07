import { computeLabE } from '@/codes/anchorage';
import { stirrupHookStraight } from '@/codes/rebar';
import { beamStirrupDenseZone } from '@/codes/seismic';
import { BeamParams, BuiltGeometry, RebarLine, StirrupShape } from './types';

/**
 * 坐标系：
 *   X: 梁长方向，0 = 左支座外边缘
 *   Y: 竖直方向，0 = 梁底
 *   Z: 截面宽度方向，0 = 梁中
 *
 * 梁总长 = leftSupport + span + rightSupport
 */
export function buildBeam(p: BeamParams): BuiltGeometry {
  const { b, h, cover, span, leftSupport, rightSupport, seismicLevel } = p;
  const totalLen = leftSupport.width + span + rightSupport.width;

  const rebars: RebarLine[] = [];
  const stirrups: StirrupShape[] = [];

  // —— 1. 上部通长筋 + 端支座弯锚 ——
  // 弯锚: 水平段 ≥ 0.4 LabE, 弯钩段 15d 向下
  const top = p.topThrough;
  const labE = computeLabE(top.grade, p.concrete, top.diameter, seismicLevel);
  const hookV = 15 * top.diameter;
  const horizAnchor = Math.max(0.4 * labE, leftSupport.width - cover);
  const yTop = h - cover - p.stirrup.diameter - top.diameter / 2;

  // 上部钢筋在截面上沿 z 方向均匀分布
  const topZs = distributeZ(top.count, b, cover, p.stirrup.diameter, top.diameter);
  for (const z of topZs) {
    const xStart = leftSupport.width - horizAnchor;
    const xEnd = leftSupport.width + span + rightSupport.width - (rightSupport.width - horizAnchor);
    // 实际左侧弯锚: 从 xStart 起水平到内侧再向下 15d
    const pts: [number, number, number][] = [
      [xStart, yTop - hookV, z], // 左弯钩末端 (向下)
      [xStart, yTop, z],         // 转折 (左)
      [xEnd, yTop, z],           // 转折 (右)
      [xEnd, yTop - hookV, z],   // 右弯钩末端
    ];
    rebars.push({
      grade: top.grade,
      diameter: top.diameter,
      points: pts,
      role: '上部通长筋',
      length: (xEnd - xStart) + 2 * hookV,
    });
  }

  // —— 2. 下部纵筋 + 端支座弯锚（向上 15d） ——
  const bot = p.bottom;
  const labEb = computeLabE(bot.grade, p.concrete, bot.diameter, seismicLevel);
  const hookVb = 15 * bot.diameter;
  const horizAnchorB = Math.max(0.4 * labEb, leftSupport.width - cover);
  const yBot = cover + p.stirrup.diameter + bot.diameter / 2;
  const botZs = distributeZ(bot.count, b, cover, p.stirrup.diameter, bot.diameter);
  for (const z of botZs) {
    const xStart = leftSupport.width - horizAnchorB;
    const xEnd = totalLen - (rightSupport.width - horizAnchorB);
    const pts: [number, number, number][] = [
      [xStart, yBot + hookVb, z],
      [xStart, yBot, z],
      [xEnd, yBot, z],
      [xEnd, yBot + hookVb, z],
    ];
    rebars.push({
      grade: bot.grade,
      diameter: bot.diameter,
      points: pts,
      role: '下部纵筋',
      length: (xEnd - xStart) + 2 * hookVb,
    });
  }

  // —— 3. 侧面构造筋 G（贯通，端部不弯锚，简化伸入支座 15d） ——
  if (p.sideG && p.sideG.countPerSide > 0) {
    const g = p.sideG;
    const ext = 15 * g.diameter;
    const innerH = h - 2 * cover - 2 * p.stirrup.diameter;
    // 在上下纵筋之间均匀分布
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

  // —— 4. 箍筋分布 ——
  const denseZone = beamStirrupDenseZone(h, seismicLevel);
  const xPositions: number[] = collectStirrupX(
    leftSupport.width,
    leftSupport.width + span,
    p.stirrup.spacingDense,
    p.stirrup.spacingSparse,
    denseZone,
    50 // 距支座边起步 50mm
  );

  // 一根箍筋外轮廓 (闭合矩形 + 135° 斜弯钩)
  const sd = p.stirrup.diameter;
  const halfB = b / 2 - cover - sd / 2;
  const innerYTop = h - cover - sd / 2;
  const innerYBot = cover + sd / 2;
  const hookLen = stirrupHookStraight(sd);
  // 弯钩 45° 方向 (向梁内)
  const hookDx = (hookLen * Math.SQRT1_2);
  // 在 YZ 平面 (x=0) 上画箍筋, 之后箍筋实例化只平移 x
  const loop: [number, number, number][] = [
    // 起点上左 + 弯钩
    [0, innerYTop - hookDx, -halfB + hookDx],
    [0, innerYTop, -halfB],
    // 上右
    [0, innerYTop, halfB],
    // 下右
    [0, innerYBot, halfB],
    // 下左
    [0, innerYBot, -halfB],
    // 回到起点
    [0, innerYTop, -halfB],
    // 终点弯钩
    [0, innerYTop - hookDx, -halfB + hookDx],
  ];
  stirrups.push({
    positions: xPositions,
    loop,
    diameter: sd,
    grade: p.stirrup.grade,
  });

  // —— 5. 复合箍 (4 肢: 内部增加一个小矩形抱住中间纵筋) ——
  if (p.stirrup.legs >= 4 && bot.count >= 4) {
    // 内箍宽度: 取下部最外两根之间的中间两根之间距离
    const innerHalf = halfB / 2;
    const innerLoop: [number, number, number][] = [
      [0, innerYTop - hookDx, -innerHalf + hookDx],
      [0, innerYTop, -innerHalf],
      [0, innerYTop, innerHalf],
      [0, innerYBot, innerHalf],
      [0, innerYBot, -innerHalf],
      [0, innerYTop, -innerHalf],
      [0, innerYTop - hookDx, -innerHalf + hookDx],
    ];
    stirrups.push({
      positions: xPositions,
      loop: innerLoop,
      diameter: sd,
      grade: p.stirrup.grade,
    });
  }

  return {
    rebars,
    stirrups,
    concrete: {
      size: [totalLen, h, b],
      center: [totalLen / 2, h / 2, 0],
    },
  };
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

/** 按加密区分布生成箍筋 X 坐标 */
function collectStirrupX(
  xL: number, // 净跨左端 = leftSupport.width
  xR: number, // 净跨右端
  sDense: number,
  sSparse: number,
  denseZone: number,
  startOffset: number
): number[] {
  const out: number[] = [];
  // 左加密区
  let x = xL + startOffset;
  while (x < xL + denseZone) {
    out.push(x);
    x += sDense;
  }
  // 非加密区
  while (x < xR - denseZone) {
    out.push(x);
    x += sSparse;
  }
  // 右加密区
  while (x <= xR - startOffset) {
    out.push(x);
    x += sDense;
  }
  return out;
}
