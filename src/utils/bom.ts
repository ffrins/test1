import { buildBeam } from '@/geometry/beam';
import { buildColumn } from '@/geometry/column';
import { buildWall } from '@/geometry/wall';
import type { BeamParams, ColumnParams, WallParams } from '@/geometry/types';
import type { MemberKind } from '@/store/useStore';

const RHO = 7850e-9; // kg/mm³

export interface BomRow {
  mark: string;
  role: string;
  grade: string;
  d: number;
  count: number;
  length: number; // mm,单根
  mass: number; // kg/根
}

export function computeBOM(
  kind: MemberKind,
  beam: BeamParams,
  column: ColumnParams,
  wall: WallParams
): BomRow[] {
  const built =
    kind === 'beam' ? buildBeam(beam) : kind === 'column' ? buildColumn(column) : buildWall(wall);
  const map = new Map<string, BomRow>();
  let i = 1;
  for (const r of built.rebars) {
    const key = `${r.role}|${r.grade}|${r.diameter}|${Math.round(r.length)}`;
    const m = map.get(key);
    if (m) m.count += 1;
    else
      map.set(key, {
        mark: `纵${String(i++).padStart(2, '0')}`,
        role: r.role,
        grade: r.grade,
        d: r.diameter,
        count: 1,
        length: Math.round(r.length),
        mass: Math.PI * (r.diameter / 2) ** 2 * r.length * RHO,
      });
  }
  let j = 1;
  for (const s of built.stirrups) {
    let len = 0;
    for (let k = 1; k < s.loop.length; k++) {
      const a = s.loop[k - 1];
      const b = s.loop[k];
      len += Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    }
    const key = `STR|${s.grade}|${s.diameter}|${Math.round(len)}`;
    const ex = map.get(key);
    if (ex) ex.count += s.positions.length;
    else
      map.set(key, {
        mark: `箍${String(j++).padStart(2, '0')}`,
        role: s.zone === 'dense' ? '箍筋(加密)' : '箍筋(非加密)',
        grade: s.grade,
        d: s.diameter,
        count: s.positions.length,
        length: Math.round(len),
        mass: Math.PI * (s.diameter / 2) ** 2 * len * RHO,
      });
  }
  return Array.from(map.values());
}

export function bomTotalMass(rows: BomRow[]) {
  return rows.reduce((a, r) => a + r.mass * r.count, 0);
}
