import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { buildBeam } from '@/geometry/beam';
import { buildColumn } from '@/geometry/column';
import { Icon } from './Icon';

const RHO = 7850e-9; // kg/mm³

/** 根据当前几何聚合 BOM */
export function BOMTable() {
  const kind = useStore((s) => s.kind);
  const beam = useStore((s) => s.beam);
  const column = useStore((s) => s.column);

  const rows = useMemo(() => {
    const built = kind === 'beam' ? buildBeam(beam) : buildColumn(column);
    type Row = {
      mark: string;
      grade: string;
      d: number;
      count: number;
      length: number; // 单根 mm
      mass: number; // kg/根
    };
    const map = new Map<string, Row>();
    let i = 1;
    for (const r of built.rebars) {
      const key = `${r.role}|${r.grade}|${r.diameter}|${Math.round(r.length)}`;
      const m = map.get(key);
      if (m) {
        m.count += 1;
      } else {
        map.set(key, {
          mark: `纵${String(i++).padStart(2, '0')}`,
          grade: r.grade,
          d: r.diameter,
          count: 1,
          length: Math.round(r.length),
          mass: (Math.PI * (r.diameter / 2) ** 2) * r.length * RHO,
        });
      }
    }
    let j = 1;
    for (const s of built.stirrups) {
      // 单根箍筋长度按 loop 折线总长
      let len = 0;
      for (let k = 1; k < s.loop.length; k++) {
        const a = s.loop[k - 1];
        const b = s.loop[k];
        len += Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
      }
      const key = `STR|${s.grade}|${s.diameter}|${Math.round(len)}`;
      const ex = map.get(key);
      if (ex) {
        ex.count += s.positions.length;
      } else {
        map.set(key, {
          mark: `箍${String(j++).padStart(2, '0')}`,
          grade: s.grade,
          d: s.diameter,
          count: s.positions.length,
          length: Math.round(len),
          mass: (Math.PI * (s.diameter / 2) ** 2) * len * RHO,
        });
      }
    }
    return Array.from(map.values());
  }, [kind, beam, column]);

  const totalMass = rows.reduce((a, r) => a + r.mass * r.count, 0);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="h-8 px-4 flex items-center justify-between border-b border-outline-variant/10 bg-surface-container-low shrink-0">
        <span className="text-[11px] font-bold text-on-surface-variant tracking-wider">
          钢筋明细表 · 当前选中
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-outline">
            合计 <span className="font-mono text-secondary">{totalMass.toFixed(1)} kg</span>
          </span>
          <button className="text-on-surface-variant hover:text-primary">
            <Icon name="download" className="!text-[16px]" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scroll-thin">
        <table className="w-full text-left font-mono text-[11px] border-collapse">
          <thead className="sticky top-0 bg-surface-container-high/95 backdrop-blur z-10 border-b border-outline-variant/20">
            <tr className="text-on-surface-variant tracking-tighter">
              <th className="px-4 py-2 font-semibold">编号</th>
              <th className="px-4 py-2 font-semibold">规格</th>
              <th className="px-4 py-2 font-semibold text-right">长度 (mm)</th>
              <th className="px-4 py-2 font-semibold text-right">数量</th>
              <th className="px-4 py-2 font-semibold text-right">重量 (kg)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {rows.map((r) => (
              <tr key={r.mark} className="hover:bg-primary/5 transition-colors">
                <td className="px-4 py-2 text-primary font-bold">{r.mark}</td>
                <td className="px-4 py-2">
                  {r.grade} d{r.d}
                </td>
                <td className="px-4 py-2 text-right">{r.length}</td>
                <td className="px-4 py-2 text-right">{r.count}</td>
                <td className="px-4 py-2 text-right">{(r.mass * r.count).toFixed(2)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-outline">
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
