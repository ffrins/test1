import { useStore } from '@/store/useStore';
import { useAIStore } from '@/ai/store/ai-store';
import { Icon } from './Icon';


interface Props {
  fileName: string;
  onOpenHelp?: () => void;
  onOpenDrawer?: () => void;
}

export function Header({ fileName, onOpenHelp, onOpenDrawer }: Props) {
  const canUndo = useStore((s) => s.canUndo);
  const canRedo = useStore((s) => s.canRedo);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const goLanding = useStore((s) => s.goLanding);
  const toggleAI = useAIStore((s) => s.togglePanel);
  const aiOpen = useAIStore((s) => s.open);
  return (
    <header className="flex flex-col w-full bg-surface-container-low border-b border-outline-variant/30 shrink-0">
      <div className="flex justify-between items-center px-4 h-12">
        <div className="flex items-center gap-3">
          <button
            onClick={goLanding}
            title="返回首页"
            className="flex items-center gap-2 hover:opacity-80 active:opacity-60 transition-opacity"
          >
            <Icon name="architecture" className="text-primary !text-2xl" />
            <span className="font-bold tracking-tight text-primary text-lg">
              智筋 <span className="font-normal text-on-surface-variant">3D</span>
            </span>
          </button>
          <div className="h-4 w-px bg-outline-variant mx-2" />
          <div className="flex items-center gap-1 text-xs font-medium text-on-surface-variant">
            <span>项目</span>
            <Icon name="chevron_right" className="!text-xs" />
            <span className="text-on-surface">天际塔</span>
            <Icon name="chevron_right" className="!text-xs" />
            <span className="text-on-surface">{fileName}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-0.5">
            <button
              onClick={undo}
              disabled={!canUndo}
              title="撤销 (Ctrl+Z)"
              className="p-1.5 hover:bg-surface-variant rounded transition-colors text-on-surface-variant hover:text-primary disabled:opacity-30 disabled:pointer-events-none"
            >
              <Icon name="undo" className="!text-[20px]" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title="重做 (Ctrl+Y)"
              className="p-1.5 hover:bg-surface-variant rounded transition-colors text-on-surface-variant hover:text-primary disabled:opacity-30 disabled:pointer-events-none"
            >
              <Icon name="redo" className="!text-[20px]" />
            </button>
          </div>
          <div className="chip-success">
            <Icon name="check_circle" className="text-secondary !text-sm" filled />
            <span className="text-[11px] font-bold tracking-wider text-secondary">
              已校验
            </span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={onOpenHelp}
              title="键盘快捷键 (?)"
              className="p-1.5 hover:bg-surface-variant rounded transition-colors text-on-surface-variant hover:text-primary"
            >
              <Icon name="keyboard" className="!text-[20px]" />
            </button>
            <button
              onClick={onOpenDrawer}
              title="帮助 · 规范速查"
              className="p-1.5 hover:bg-surface-variant rounded transition-colors text-on-surface-variant hover:text-primary"
            >
              <Icon name="help" className="!text-[20px]" />
            </button>
            {['notifications', 'cloud_sync', 'settings'].map((n) => (
              <button
                key={n}
                className="p-1.5 hover:bg-surface-variant rounded transition-colors text-on-surface-variant"
              >
                <Icon name={n} className="!text-[20px]" />
              </button>
            ))}
          </div>
          <button
            onClick={toggleAI}
            title="开启/关闭 AI 助手"
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold border transition-colors ${
              aiOpen
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
            }`}
          >
            <Icon name="auto_awesome" className="!text-[16px]" />
            AI 助手
          </button>
          <button className="btn-primary">同步模型</button>
        </div>
      </div>
      {/* File Tabs */}
      <div className="flex items-center px-4 h-9 bg-surface-container-lowest gap-px border-t border-outline-variant/10">
        <FileTab name={fileName} active />
        <FileTab name="一段-柱-04.筋" />
        <FileTab name="一段-墙-02.筋" />
        <button className="px-3 h-full flex items-center text-on-surface-variant hover:text-primary transition-colors">
          <Icon name="add" className="!text-[18px]" />
        </button>
      </div>
    </header>
  );
}

function FileTab({ name, active }: { name: string; active?: boolean }) {
  if (active) {
    return (
      <div className="flex h-full items-center px-4 bg-surface-container-low border-x border-outline-variant/20 text-xs font-medium text-primary cursor-default relative">
        <span>{name}</span>
        <Icon name="close" className="!text-[14px] ml-2 cursor-pointer hover:text-white" />
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
      </div>
    );
  }
  return (
    <div className="flex h-full items-center px-4 text-xs font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer border-r border-outline-variant/10">
      <span>{name}</span>
    </div>
  );
}
