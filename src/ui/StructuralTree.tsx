import { useStore } from '@/store/useStore';
import { Icon } from './Icon';

export function StructuralTree() {
  const kind = useStore((s) => s.kind);
  const setKind = useStore((s) => s.setKind);

  return (
    <aside className="flex flex-col h-full w-sidebar-width bg-surface-container-lowest/80 backdrop-blur-xl border-r border-outline-variant/20 shrink-0">
      <div className="p-4 border-b border-outline-variant/10">
        <div className="relative">
          <Icon name="search" className="!text-[18px] absolute left-2.5 top-2 text-outline" />
          <input
            type="text"
            placeholder="搜索结构构件…"
            className="w-full bg-surface-container-low border border-outline-variant/30 rounded py-1.5 pl-9 pr-3 text-xs focus:border-primary focus:ring-0 transition-colors outline-none"
          />
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto no-scrollbar py-2">
        <div className="px-4 py-1.5 text-[10px] font-bold tracking-widest text-outline">
          结构层级
        </div>

        <details className="group">
          <summary className="flex items-center gap-2 px-4 py-2 hover:bg-surface-variant/30 cursor-pointer text-on-surface-variant select-none">
            <Icon name="chevron_right" className="!text-[18px] text-outline group-open:rotate-90 transition-transform" />
            <Icon name="layers" className="!text-[18px] text-primary" />
            <span className="text-sm font-medium">基础</span>
          </summary>
        </details>

        <details className="group" open>
          <summary className="flex items-center gap-2 px-4 py-2 hover:bg-surface-variant/30 cursor-pointer text-on-surface select-none">
            <Icon name="chevron_right" className="!text-[18px] text-outline group-open:rotate-90 transition-transform" />
            <Icon name="apartment" className="!text-[18px] text-primary" />
            <span className="text-sm font-medium">一层</span>
          </summary>
          <div className="pl-6 border-l border-outline-variant/10 ml-6 mt-1 space-y-0.5">
            <TreeLeaf
              icon="horizontal_distribute"
              label="梁"
              count={12}
              active={kind === 'beam'}
              onClick={() => setKind('beam')}
            />
            <TreeLeaf
              icon="view_column"
              label="柱"
              count={8}
              active={kind === 'column'}
              onClick={() => setKind('column')}
            />
            <TreeLeaf icon="rectangle" label="墙" count={14} disabled />
          </div>
        </details>

        <details className="group">
          <summary className="flex items-center gap-2 px-4 py-2 hover:bg-surface-variant/30 cursor-pointer text-on-surface-variant select-none">
            <Icon name="chevron_right" className="!text-[18px] text-outline group-open:rotate-90 transition-transform" />
            <Icon name="apartment" className="!text-[18px]" />
            <span className="text-sm font-medium">二层</span>
          </summary>
        </details>
      </nav>
      <div className="p-3 border-t border-outline-variant/10 bg-surface-container-lowest">
        <button className="w-full py-2 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 rounded flex items-center justify-center gap-2 text-xs font-bold text-on-surface transition-all active:scale-95">
          <Icon name="add_box" className="!text-sm" />
          <span>导入 IFC / REVIT</span>
        </button>
      </div>
    </aside>
  );
}

function TreeLeaf({
  icon,
  label,
  count,
  active,
  disabled,
  onClick,
}: {
  icon: string;
  label: string;
  count: number;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  if (active) {
    return (
      <div
        onClick={onClick}
        className="tree-item-active flex items-center justify-between px-3 py-1.5 text-primary cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Icon name={icon} className="!text-[18px]" />
          <span className="text-sm">{label}</span>
        </div>
        <span className="text-[10px] bg-primary/20 px-1.5 rounded">{count}</span>
      </div>
    );
  }
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`flex items-center justify-between px-3 py-1.5 cursor-pointer transition-colors ${
        disabled
          ? 'text-outline opacity-60 cursor-not-allowed'
          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50'
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon name={icon} className="!text-[18px]" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-[10px] opacity-50">{count}</span>
    </div>
  );
}
