import { computeLabE } from '@/codes/anchorage';
import { stirrupHookStraight } from '@/codes/rebar';
import { columnStirrupDenseZone } from '@/codes/seismic';
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

  // 外箍闭合矩形 + 135° 弯钩
  const halfX = b / 2 - cover - sd / 2;
  const halfZ = h / 2 - cover - sd / 2;
  const hookLen = stirrupHookStraight(sd);
  const hookD = hookLen * Math.SQRT1_2;
  const loop: [number, number, number][] = [
    [-halfX + hookD, 0, -halfZ + hookD],
    [-halfX, 0, -halfZ],
    [halfX, 0, -halfZ],
    [halfX, 0, halfZ],
    [-halfX, 0, halfZ],
    [-halfX, 0, -halfZ],
    [-halfX + hookD, 0, -halfZ + hookD],
  ];
  stirrups.push({ positions: denseYs, loop, diameter: sd, grade: p.stirrup.grade, zone: 'dense' });
  stirrups.push({ positions: sparseYs, loop, diameter: sd, grade: p.stirrup.grade, zone: 'sparse' });

  // 复合箍 (井字: 加内部 H 边一道 + V 边一道)
  if (p.stirrup.composite === 'jing') {
    const innerHalfX = halfX / 2;
    const innerLoop: [number, number, number][] = [
      [-innerHalfX + hookD, 0, -halfZ + hookD],
      [-innerHalfX, 0, -halfZ],
      [innerHalfX, 0, -halfZ],
      [innerHalfX, 0, halfZ],
      [-innerHalfX, 0, halfZ],
      [-innerHalfX, 0, -halfZ],
      [-innerHalfX + hookD, 0, -halfZ + hookD],
    ];
    stirrups.push({ positions: denseYs, loop: innerLoop, diameter: sd, grade: p.stirrup.grade, zone: 'dense' });
    stirrups.push({ positions: sparseYs, loop: innerLoop, diameter: sd, grade: p.stirrup.grade, zone: 'sparse' });
  }

  // 复合箍 (菱形: 沿截面对角线方向旋转 45° 的内菱形抱角)
  if (p.stirrup.composite === 'diamond') {
    // 菱形顶点取截面内圆相切位置(到边距相同)
    const r = Math.min(halfX, halfZ) * 0.75;
    // 弯钩起点取上顶点旁,沿对角线伸出
    const hookOff = hookLen / 2; // 较小弯钩
    const diamondLoop: [number, number, number][] = [
      [0, 0, -r + hookOff], // 弯钩末端
      [0, 0, -r],           // 上顶点(沿 z 负)
      [r, 0, 0],            // 右顶点
      [0, 0, r],            // 下顶点
      [-r, 0, 0],           // 左顶点
      [0, 0, -r],           // 回到上顶点
      [0, 0, -r + hookOff], // 弯钩末端
    ];
    stirrups.push({ positions: denseYs, loop: diamondLoop, diameter: sd, grade: p.stirrup.grade, zone: 'dense' });
    stirrups.push({ positions: sparseYs, loop: diamondLoop, diameter: sd, grade: p.stirrup.grade, zone: 'sparse' });
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
