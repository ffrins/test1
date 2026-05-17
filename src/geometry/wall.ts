import { BuiltGeometry, RebarLine, WallParams } from './types';

/**
 * 剪力墙 Q 坐标系:
 *   X: 沿墙长 (0..L)
 *   Y: 竖向 (0..H)
 *   Z: 沿墙厚 (-t/2 .. t/2)
 *
 * 简化模型:
 *  - 双排竖向分布筋 (z = ±zLayer)
 *  - 双排水平分布筋 (z = ±zLayer)
 *  - 拉筋: 梅花布置, 连接两排
 *  - 顶/底简化: 竖向钢筋伸入楼板锚固 (此处仅延伸 max(35d, 500))
 */
export function buildWall(p: WallParams): BuiltGeometry {
  const { length: L, height: H, thickness: t, cover: c, vertical: V, horizontal: HZ, tie: T } = p;
  const rebars: RebarLine[] = [];

  // 双排筋平面在厚度方向的 z 坐标
  // 外侧:水平筋在外 (贴保护层),竖向筋在内
  const zHoriz = t / 2 - c - HZ.diameter / 2;
  const zVert = zHoriz - HZ.diameter / 2 - V.diameter / 2;
  const layersZ = [-zVert, zVert];
  const layersZH = [-zHoriz, zHoriz];

  // 端部锚固延伸 (简化)
  const anchorExt = Math.max(35 * V.diameter, 500);

  // —— 1. 竖向分布筋(双排,沿 X 等间距) ——
  const xStart = c + V.diameter / 2;
  const xEnd = L - c - V.diameter / 2;
  const usableX = xEnd - xStart;
  const nV = Math.max(2, Math.floor(usableX / V.spacing) + 1);
  const stepV = nV > 1 ? usableX / (nV - 1) : 0;
  for (const z of layersZ) {
    for (let i = 0; i < nV; i++) {
      const x = xStart + i * stepV;
      const pts: [number, number, number][] = [
        [x, -anchorExt, z],
        [x, H + anchorExt, z],
      ];
      rebars.push({
        grade: V.grade,
        diameter: V.diameter,
        points: pts,
        role: '竖向分布筋',
        length: H + 2 * anchorExt,
      });
    }
  }

  // —— 2. 水平分布筋(双排,沿 Y 等间距) ——
  const yStart = c + HZ.diameter / 2;
  const yEnd = H - c - HZ.diameter / 2;
  const usableY = yEnd - yStart;
  const nH = Math.max(2, Math.floor(usableY / HZ.spacing) + 1);
  const stepH = nH > 1 ? usableY / (nH - 1) : 0;
  const xH0 = c;
  const xH1 = L - c;
  for (const z of layersZH) {
    for (let i = 0; i < nH; i++) {
      const y = yStart + i * stepH;
      const pts: [number, number, number][] = [
        [xH0, y, z],
        [xH1, y, z],
      ];
      rebars.push({
        grade: HZ.grade,
        diameter: HZ.diameter,
        points: pts,
        role: '水平分布筋',
        length: xH1 - xH0,
      });
    }
  }

  // —— 3. 拉筋(梅花布置,沿厚度方向连接两排) ——
  if (T.enabled) {
    const tieZ0 = -t / 2 + c + T.diameter / 2;
    const tieZ1 = t / 2 - c - T.diameter / 2;
    // 弯钩简化:沿 Z 端各加 10d 端弯钩
    const hook = 10 * T.diameter;
    const nTX = Math.max(1, Math.floor(usableX / T.spacingX));
    const nTY = Math.max(1, Math.floor(usableY / T.spacingY));
    const sxStep = usableX / nTX;
    const syStep = usableY / nTY;
    for (let iy = 0; iy <= nTY; iy++) {
      const y = yStart + iy * syStep;
      // 梅花:奇偶行 x 偏移 1/2
      const xOff = iy % 2 === 0 ? 0 : sxStep / 2;
      for (let ix = 0; ix <= nTX; ix++) {
        const x = xStart + xOff + ix * sxStep;
        if (x > xEnd + 1) continue;
        const pts: [number, number, number][] = [
          [x, y + hook, tieZ0],
          [x, y, tieZ0],
          [x, y, tieZ1],
          [x, y + hook, tieZ1],
        ];
        rebars.push({
          grade: T.grade,
          diameter: T.diameter,
          points: pts,
          role: '拉筋',
          length: t - 2 * c + 2 * hook,
        });
      }
    }
  }

  return {
    rebars,
    stirrups: [],
    concrete: {
      size: [L, H, t],
      center: [L / 2, H / 2, 0],
    },
  };
}
