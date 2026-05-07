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

  // —— 2. 箍筋分布 ——
  const denseLen = columnStirrupDenseZone(Hn, h, p.isBottom);
  const ys: number[] = [];
  // 底部加密
  let y = 50;
  while (y < denseLen) { ys.push(y); y += p.stirrup.spacingDense; }
  // 中部非加密
  while (y < Hn - denseLen) { ys.push(y); y += p.stirrup.spacingSparse; }
  // 顶部加密
  while (y <= Hn - 50) { ys.push(y); y += p.stirrup.spacingDense; }

  // 外箍闭合矩形 + 135° 弯钩
  const halfX = b / 2 - cover - sd / 2;
  const halfZ = h / 2 - cover - sd / 2;
  const hookLen = stirrupHookStraight(sd);
  const hookD = hookLen * Math.SQRT1_2;
  const loop: [number, number, number][] = [
    [-halfX + hookD, 0, -halfZ + hookD], // 起弯钩
    [-halfX, 0, -halfZ],
    [halfX, 0, -halfZ],
    [halfX, 0, halfZ],
    [-halfX, 0, halfZ],
    [-halfX, 0, -halfZ],
    [-halfX + hookD, 0, -halfZ + hookD],
  ];
  stirrups.push({
    positions: ys,
    loop,
    diameter: sd,
    grade: p.stirrup.grade,
  });

  // 复合箍 (井字: 加内部 H 边一道 + V 边一道)
  if (p.stirrup.composite === 'jing') {
    const innerHalfX = halfX / 2;
    const innerHalfZ = halfZ / 2;
    // 横向小箍
    stirrups.push({
      positions: ys,
      loop: [
        [-innerHalfX + hookD, 0, -halfZ + hookD],
        [-innerHalfX, 0, -halfZ],
        [innerHalfX, 0, -halfZ],
        [innerHalfX, 0, halfZ],
        [-innerHalfX, 0, halfZ],
        [-innerHalfX, 0, -halfZ],
        [-innerHalfX + hookD, 0, -halfZ + hookD],
      ],
      diameter: sd,
      grade: p.stirrup.grade,
    });
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
