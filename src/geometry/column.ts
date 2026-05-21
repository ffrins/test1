import { computeLabE } from '@/codes/anchorage';
import { columnStirrupDenseZone } from '@/codes/seismic';
import { buildRectLoop, hookStraightLen } from './stirrupLoop';
import { BuiltGeometry, ColumnParams, RebarLine, StirrupShape } from './types';

/**
 * 柱坐标系：
 *   X: b 边 (-b/2 .. b/2)
 *   Y: 高度方向 (0 .. Hn)
 *   Z: h 边 (-h/2 .. h/2)
 */
export function buildColumn(p: ColumnParams): BuiltGeometry {
  const { b, h, height: Hn, cover, seismicLevel, longitudinal: lr } = p;
  const sd = p.stirrup.diameter;

  const rebars: RebarLine[] = [];
  const stirrups: StirrupShape[] = [];

  // —— 1. 纵筋 (沿柱周边布置) ——
  const usableX = b - 2 * (cover + sd + lr.diameter / 2);
  const usableZ = h - 2 * (cover + sd + lr.diameter / 2);
  const xs = lr.nB === 1 ? [0] : Array.from({ length: lr.nB }, (_, i) => -usableX / 2 + (usableX * i) / (lr.nB - 1));
  const zs = lr.nH === 1 ? [0] : Array.from({ length: lr.nH }, (_, i) => -usableZ / 2 + (usableZ * i) / (lr.nH - 1));

  // 顶部锚固 12d 弯锚 (中柱内简化向内弯)
  const labE = computeLabE(lr.grade, p.concrete, lr.diameter, seismicLevel);
  const topHook = 12 * lr.diameter;
  const bottomExt = Math.max(labE, 35 * lr.diameter); // 插筋延伸入下层 (简化)

  // 周边位置: 取 (xs × {z首末}) ∪ ({x首末} × zs) 去重
  const positions = new Set<string>();
  const list: { x: number; z: number; corner: boolean }[] = [];
  const addPos = (x: number, z: number, corner: boolean) => {
    const k = `${x.toFixed(2)},${z.toFixed(2)}`;
    if (!positions.has(k)) {
      positions.add(k);
      list.push({ x, z, corner });
    }
  };
  for (const x of xs) {
    addPos(x, zs[0], x === xs[0] || x === xs[xs.length - 1]);
    addPos(x, zs[zs.length - 1], x === xs[0] || x === xs[xs.length - 1]);
  }
  for (const z of zs) {
    addPos(xs[0], z, z === zs[0] || z === zs[zs.length - 1]);
    addPos(xs[xs.length - 1], z, z === zs[0] || z === zs[zs.length - 1]);
  }

  for (const { x, z, corner } of list) {
    // 顶部弯锚方向: 角筋朝柱内对角，其他朝邻边内
    const dirX = x > 0 ? -1 : x < 0 ? 1 : 0;
    const dirZ = z > 0 ? -1 : z < 0 ? 1 : 0;
    const hookEndX = x + dirX * topHook * (corner ? Math.SQRT1_2 : 1);
    const hookEndZ = z + dirZ * topHook * (corner ? Math.SQRT1_2 : 0);
    const pts: [number, number, number][] = [
      [x, -bottomExt, z],
      [x, Hn, z],
      [hookEndX, Hn, hookEndZ],
    ];
    rebars.push({
      grade: lr.grade,
      diameter: lr.diameter,
      points: pts,
      role: corner ? '柱角筋' : '柱中部纵筋',
      length: Hn + bottomExt + topHook,
    });
  }

  // —— 2. 箍筋分布（拆分加密 / 非加密） ——
  const denseLen = columnStirrupDenseZone(Hn, h, p.isBottom);
  const denseYs: number[] = [];
  const sparseYs: number[] = [];
  let y = 50;
  while (y < denseLen) { denseYs.push(y); y += p.stirrup.spacingDense; }
  while (y < Hn - denseLen) { sparseYs.push(y); y += p.stirrup.spacingSparse; }
  while (y <= Hn - 50) { denseYs.push(y); y += p.stirrup.spacingDense; }

  // —— 箍筋几何 ——
  // 柱坐标系: 箍筋 loop 点位于 XZ 平面(Y=0), 渲染时按 Y 方向 instancing
  // buildRectLoop 返回 YZ 平面 loop(X=0), 这里需将其映射: loop 的 y→x, z→z
  const sd_ = sd;
  const hookLen = hookStraightLen(sd_);
  const innerB = b - 2 * cover - sd_;
  const innerH = h - 2 * cover - sd_;

  // 把 stirrupLoop 模板(YZ平面)映射到柱的 XZ 平面: 点 [0, y, z] → [y - innerB/2, 0, z]
  const remap = (loop: [number, number, number][]): [number, number, number][] =>
    loop.map(([, y, z]) => [y - innerB / 2, 0, z]);

  const outerLoop = remap(buildRectLoop(innerB, innerH, hookLen, 'LT'));
  stirrups.push({ positions: denseYs, loop: outerLoop, diameter: sd_, grade: p.stirrup.grade, zone: 'dense' });
  stirrups.push({ positions: sparseYs, loop: outerLoop, diameter: sd_, grade: p.stirrup.grade, zone: 'sparse' });

  // 复合箍 (井字: 内部沿 b、h 各一道窄箍, 形成"井"字)
  if (p.stirrup.composite === 'jing') {
    // b 方向窄箍: 宽 = innerB/2, 高 = innerH
    const narrowB = remap(buildRectLoop(innerB / 2, innerH, hookLen, 'RB'));
    stirrups.push({ positions: denseYs, loop: narrowB, diameter: sd_, grade: p.stirrup.grade, zone: 'dense' });
    stirrups.push({ positions: sparseYs, loop: narrowB, diameter: sd_, grade: p.stirrup.grade, zone: 'sparse' });

    // h 方向窄箍: 宽 = innerB, 高 = innerH/2 — 在 z 中部居中
    const narrowH_template = buildRectLoop(innerB, innerH / 2, hookLen, 'LT');
    // 该 loop 高度为 innerH/2, 需要把它在 y 方向上抬 innerH/4 居中(中段)
    const shifted: [number, number, number][] = narrowH_template.map(
      ([x, y, z]) => [x, y + innerH / 4, z]
    );
    const narrowH = remap(shifted);
    stirrups.push({ positions: denseYs, loop: narrowH, diameter: sd_, grade: p.stirrup.grade, zone: 'dense' });
    stirrups.push({ positions: sparseYs, loop: narrowH, diameter: sd_, grade: p.stirrup.grade, zone: 'sparse' });
  }

  // 复合箍 (菱形: 旋转 45° 抱角箍, 折线闭合, 弯钩朝顶点外侧)
  if (p.stirrup.composite === 'diamond') {
    const halfX = innerB / 2;
    const halfZ = innerH / 2;
    const r = Math.min(halfX, halfZ) * 0.75;
    const hookOff = hookLen * Math.SQRT1_2;
    // 上顶点 (-z 方向) 处放置弯钩, 两个钩沿对角线斜向截面中心
    // 折线: 钩末端 → 上顶点 → 右顶点 → 下顶点 → 左顶点 → 上顶点(闭合) → 钩末端
    const diamondLoop: [number, number, number][] = [
      [0, 0, -r + hookOff], // 钩末端 (向中心稍偏)
      [0, 0, -r],           // 上顶点
      [r, 0, 0],            // 右顶点
      [0, 0, r],            // 下顶点
      [-r, 0, 0],           // 左顶点
      [0, 0, -r],           // 闭合回上顶点
      [hookOff * 0.5, 0, -r + hookOff * 0.5], // 第二钩末端(略偏 x 避免重合)
    ];
    stirrups.push({ positions: denseYs, loop: diamondLoop, diameter: sd_, grade: p.stirrup.grade, zone: 'dense' });
    stirrups.push({ positions: sparseYs, loop: diamondLoop, diameter: sd_, grade: p.stirrup.grade, zone: 'sparse' });
  }

  return {
    rebars,
    stirrups,
    concrete: {
      size: [b, Hn, h],
      center: [0, Hn / 2, 0],
    },
  };
}
