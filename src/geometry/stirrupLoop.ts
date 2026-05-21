import { RebarGrade } from '@/codes/rebar';
import { StirrupShape } from './types';

/**
 * 135° 弯钩平直段长度 (22G101: max(10d, 75mm))
 */
export function hookStraightLen(d: number): number {
  return Math.max(10 * d, 75);
}

export type HookCorner = 'LT' | 'RT' | 'RB' | 'LB';

/**
 * 生成矩形箍筋闭合折线（YZ 平面，X=0），含两端 135° 弯钩。
 *
 * @param innerW  箍筋内净宽 (Z 方向)
 * @param innerH  箍筋内净高 (Y 方向)
 * @param hookLen 弯钩平直段长度
 * @param corner  弯钩所在角（默认 LT=左上）
 * @returns 折线点列表 [x,y,z][]，首尾为弯钩端点
 */
export function buildRectLoop(
  innerW: number,
  innerH: number,
  hookLen: number,
  corner: HookCorner = 'LT'
): [number, number, number][] {
  const halfW = innerW / 2;
  // Y 坐标：底部 = yBot, 顶部 = yTop
  const yBot = 0;
  const yTop = innerH;

  // 四角坐标 (Y, Z)
  const LT: [number, number] = [yTop, -halfW];
  const RT: [number, number] = [yTop, halfW];
  const RB: [number, number] = [yBot, halfW];
  const LB: [number, number] = [yBot, -halfW];

  // 从弯钩角开始，顺时针遍历矩形
  const corners: Record<HookCorner, [number, number][]> = {
    LT: [LT, RT, RB, LB, LT],
    RT: [RT, RB, LB, LT, RT],
    RB: [RB, LB, LT, RT, RB],
    LB: [LB, LT, RT, RB, LB],
  };
  const path = corners[corner];

  // 弯钩方向：从角点朝截面核心方向 135° (即沿对角线 45° 向内)
  const hookDir = getHookDir(corner);
  const hookDy = hookDir[0] * hookLen * Math.SQRT1_2;
  const hookDz = hookDir[1] * hookLen * Math.SQRT1_2;

  const startCorner = path[0];
  const hookStart: [number, number, number] = [
    0,
    startCorner[0] + hookDy,
    startCorner[1] + hookDz,
  ];
  const hookEnd: [number, number, number] = [
    0,
    startCorner[0] + hookDy,
    startCorner[1] + hookDz,
  ];

  const pts: [number, number, number][] = [hookStart];
  for (const [y, z] of path) {
    pts.push([0, y, z]);
  }
  pts.push(hookEnd);

  return pts;
}

/**
 * 生成 U 形拉筋折线（用于奇数肢的中部拉筋）
 * 拉筋沿 Z 方向跨越 innerH，位于指定 zPos，两端有 135° 弯钩
 */
export function buildTieBar(
  innerH: number,
  zPos: number,
  hookLen: number
): [number, number, number][] {
  const yBot = 0;
  const yTop = innerH;
  const hookDy = hookLen * Math.SQRT1_2;

  return [
    [0, yBot - hookDy, zPos], // 底部弯钩向下
    [0, yBot, zPos],
    [0, yTop, zPos],
    [0, yTop + hookDy, zPos], // 顶部弯钩向上
  ];
}

/**
 * 弯钩方向向量 (dy, dz)，从角点指向截面中心
 */
function getHookDir(corner: HookCorner): [number, number] {
  switch (corner) {
    case 'LT': return [-1, 1];  // 向下、向右(内)
    case 'RT': return [-1, -1]; // 向下、向左(内)
    case 'RB': return [1, -1];  // 向上、向左(内)
    case 'LB': return [1, 1];   // 向上、向右(内)
  }
}

export interface CompositeResult {
  loops: [number, number, number][][];
  /** 拉筋折线（3 肢/5 肢时生成） */
  ties: [number, number, number][][];
}

/**
 * 按肢数生成复合箍组合。
 *
 * @param legs      肢数 (2~6)
 * @param b         截面宽
 * @param h         截面高（或该 x 处梁高）
 * @param cover     保护层
 * @param sd        箍筋直径
 * @returns 大箍 + 内箍/拉筋 loop 列表
 */
export function buildCompositeLoops(
  legs: number,
  b: number,
  h: number,
  cover: number,
  sd: number
): CompositeResult {
  const hookLen = hookStraightLen(sd);
  const innerW = b - 2 * cover - sd; // 箍筋中心线间距(Z方向)
  const innerH = h - 2 * cover - sd; // 箍筋中心线间距(Y方向)

  const outerLoop = buildRectLoop(innerW, innerH, hookLen, 'LT');

  if (legs <= 2) {
    return { loops: [outerLoop], ties: [] };
  }

  if (legs === 3) {
    // 大箍 + 中部 1 道拉筋
    const tie = buildTieBar(innerH, 0, hookLen);
    return { loops: [outerLoop], ties: [tie] };
  }

  if (legs === 4) {
    // 大箍 + 1 道内箍（宽度 = 内净宽/2，高同大箍）
    const innerLoopW = innerW / 2;
    const innerLoop = buildRectLoop(innerLoopW, innerH, hookLen, 'RB');
    return { loops: [outerLoop, innerLoop], ties: [] };
  }

  if (legs === 5) {
    // 大箍 + 2 道拉筋（三等分位置）
    const zStep = innerW / 3;
    const tie1 = buildTieBar(innerH, -innerW / 2 + zStep, hookLen);
    const tie2 = buildTieBar(innerH, -innerW / 2 + 2 * zStep, hookLen);
    return { loops: [outerLoop], ties: [tie1, tie2] };
  }

  // legs >= 6: 大箍 + 2 道内箍（三等分）
  const segW = innerW / 3;
  const inner1 = buildRectLoop(segW, innerH, hookLen, 'RB');
  // 偏移 inner1 到左 1/3 区
  const inner1Shifted = shiftLoopZ(inner1, -segW);
  // 偏移到右 1/3 区
  const inner2Shifted = shiftLoopZ(buildRectLoop(segW, innerH, hookLen, 'LT'), segW);
  return { loops: [outerLoop, inner1Shifted, inner2Shifted], ties: [] };
}

/**
 * 将 loop 所有点在 Z 方向平移 dz
 */
function shiftLoopZ(
  loop: [number, number, number][],
  dz: number
): [number, number, number][] {
  return loop.map(([x, y, z]) => [x, y, z + dz]);
}

/**
 * 将 loop 所有点做 Y 方向偏移（用于给定截面高度的 yBot 定位）
 */
export function shiftLoopY(
  loop: [number, number, number][],
  dy: number
): [number, number, number][] {
  return loop.map(([x, y, z]) => [x, y + dy, z]);
}

/**
 * 便捷: 按梁截面参数生成完整箍筋 StirrupShape 列表
 */
export function buildBeamStirrupShapes(
  legs: number,
  b: number,
  h: number,
  cover: number,
  sd: number,
  grade: RebarGrade,
  densePositions: number[],
  sparsePositions: number[]
): StirrupShape[] {
  const yBot = cover + sd / 2;
  const { loops, ties } = buildCompositeLoops(legs, b, h, cover, sd);

  const shapes: StirrupShape[] = [];

  for (const loop of loops) {
    const shifted = shiftLoopY(loop, yBot);
    if (densePositions.length > 0) {
      shapes.push({ positions: densePositions, loop: shifted, diameter: sd, grade, zone: 'dense' });
    }
    if (sparsePositions.length > 0) {
      shapes.push({ positions: sparsePositions, loop: shifted, diameter: sd, grade, zone: 'sparse' });
    }
  }

  for (const tie of ties) {
    const shifted = shiftLoopY(tie, yBot);
    if (densePositions.length > 0) {
      shapes.push({ positions: densePositions, loop: shifted, diameter: sd, grade, zone: 'dense' });
    }
    if (sparsePositions.length > 0) {
      shapes.push({ positions: sparsePositions, loop: shifted, diameter: sd, grade, zone: 'sparse' });
    }
  }

  return shapes;
}
