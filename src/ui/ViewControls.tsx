import { useStore } from '@/store/useStore';

export function ViewControls() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-xs text-slate-400">混凝土:</span>
      {(
        [
          ['transparent', '半透明'],
          ['wireframe', '线框'],
          ['hidden', '隐藏'],
          ['clip', '剖切'],
        ] as const
      ).map(([k, label]) => (
        <button
          key={k}
          className={'tab-btn ' + (view.concrete === k ? 'active' : '')}
          onClick={() => setView({ concrete: k })}
        >
          {label}
        </button>
      ))}
      <label className="text-xs text-slate-400 ml-2 flex items-center gap-1">
        <input
          type="checkbox"
          checked={view.showStirrups}
          onChange={(e) => setView({ showStirrups: e.target.checked })}
        />
        箍筋
      </label>
      <label className="text-xs text-slate-400 flex items-center gap-1">
        <input
          type="checkbox"
          checked={view.showLongitudinal}
          onChange={(e) => setView({ showLongitudinal: e.target.checked })}
        />
        纵筋
      </label>
    </div>
  );
}
