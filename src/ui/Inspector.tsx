import { useStore } from '@/store/useStore';
import { useMemo } from 'react';
import { buildBeam } from '@/geometry/beam';
import { buildColumn } from '@/geometry/column';

export function Inspector() {
  const sel = useStore((s) => s.selected);
  const kind = useStore((s) => s.kind);
  const beam = useStore((s) => s.beam);
  const column = useStore((s) => s.column);

  const summary = useMemo(() => {
    const built = kind === 'beam' ? buildBeam(beam) : buildColumn(column);
    const totalRebarLen = built.rebars.reduce((a, r) => a + r.length, 0);
    const stirrupCount = built.stirrups.reduce((a, s) => a + s.positions.length, 0);
    return {
      rebarCount: built.rebars.length,
      stirrupCount,
      totalRebarLen,
    };
  }, [kind, beam, column]);

  return (
    <div className="space-y-3 text-sm">
      <div>
        <div className="section-title">选中钢筋</div>
        {sel ? (
          <div className="bg-slate-800 rounded p-2 space-y-1">
            <div className="flex justify-between"><span className="text-slate-400">类型</span><b>{sel.role}</b></div>
            <div className="flex justify-between"><span className="text-slate-400">规格</span><b>{sel.grade} d{sel.diameter}</b></div>
            <div className="flex justify-between"><span className="text-slate-400">下料长度</span><b>{sel.length} mm</b></div>
          </div>
        ) : (
          <div className="text-slate-500 text-xs">点击 3D 视图中的钢筋查看详情</div>
        )}
      </div>

      <div>
        <div className="section-title">统计</div>
        <div className="bg-slate-800 rounded p-2 space-y-1">
          <div className="flex justify-between"><span className="text-slate-400">纵筋根数</span><b>{summary.rebarCount}</b></div>
          <div className="flex justify-between"><span className="text-slate-400">箍筋数量</span><b>{summary.stirrupCount}</b></div>
          <div className="flex justify-between"><span className="text-slate-400">纵筋总长</span><b>{(summary.totalRebarLen / 1000).toFixed(2)} m</b></div>
        </div>
      </div>
    </div>
  );
}
