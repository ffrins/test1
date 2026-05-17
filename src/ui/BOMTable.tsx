import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Icon } from './Icon';
import { computeBOM, bomTotalMass } from '@/utils/bom';
import { exportCurrentBOM } from '@/utils/exportBom';

/** 根据当前几何聚合 BOM */
export function BOMTable() {
  const kind = useStore((s) => s.kind);
  const beam = useStore((s) => s.beam);
  const column = useStore((s) => s.column);
  const wall = useStore((s) => s.wall);

  const rows = useMemo(() => computeBOM(kind, beam, column, wall), [kind, beam, column, wall]);
  const totalMass = bomTotalMass(rows);

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
          <button
            className="text-on-surface-variant hover:text-primary"
            title="导出 CSV (E)"
            onClick={exportCurrentBOM}
          >
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
