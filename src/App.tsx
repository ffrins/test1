import { useStore } from '@/store/useStore';
import { Viewer } from '@/scene/Viewer';
import { BeamForm } from '@/ui/BeamForm';
import { ColumnForm } from '@/ui/ColumnForm';
import { PlainTextInput } from '@/ui/PlainTextInput';
import { Inspector } from '@/ui/Inspector';
import { ViewControls } from '@/ui/ViewControls';

export default function App() {
  const kind = useStore((s) => s.kind);
  const setKind = useStore((s) => s.setKind);

  return (
    <div className="h-full grid grid-cols-[360px_1fr_300px]">
      {/* 左侧：参数面板 */}
      <aside className="border-r border-slate-800 overflow-y-auto p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold">3D 钢筋平法</h1>
          <span className="text-[10px] text-slate-500">22G101-1 · MVP</span>
        </div>
        <div className="flex gap-2">
          <button className={'tab-btn ' + (kind === 'beam' ? 'active' : '')} onClick={() => setKind('beam')}>
            梁 KL
          </button>
          <button className={'tab-btn ' + (kind === 'column' ? 'active' : '')} onClick={() => setKind('column')}>
            柱 KZ
          </button>
        </div>

        {kind === 'beam' && (
          <>
            <PlainTextInput />
            <BeamForm />
          </>
        )}
        {kind === 'column' && <ColumnForm />}
      </aside>

      {/* 中央：3D */}
      <main className="relative">
        <div className="absolute top-3 left-3 z-10 bg-slate-900/80 backdrop-blur rounded px-3 py-2 border border-slate-800">
          <ViewControls />
        </div>
        <Viewer />
      </main>

      {/* 右侧：检查器 */}
      <aside className="border-l border-slate-800 overflow-y-auto p-3">
        <Inspector />
      </aside>
    </div>
  );
}
