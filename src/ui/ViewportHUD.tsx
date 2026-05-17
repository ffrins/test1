import { useStore } from '@/store/useStore';
import { Icon } from './Icon';
import { captureScreenshot } from '@/utils/screenshot';
import { toast } from './Toast';
import { exportCurrentBOM } from '@/utils/exportBom';

export function ViewportHUD() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const kind = useStore((s) => s.kind);
  const beamId = useStore((s) => s.beam.id);
  const columnId = useStore((s) => s.column.id);
  const wallId = useStore((s) => s.wall.id);

  const onShot = () => {
    try {
      captureScreenshot(kind === 'beam' ? beamId : kind === 'column' ? columnId : wallId);
      toast.success('已导出截图');
    } catch (e) {
      toast.error(`截图失败:${(e as Error).message}`);
    }
  };

  return (
    <>
      {/* 左上：视图模式 + Live Engine */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        <div className="glass-panel p-1 rounded flex gap-1 shadow-2xl">
          <HudBtn
            icon="view_in_ar"
            active={view.concrete === 'transparent'}
            onClick={() => setView({ concrete: 'transparent' })}
            title="混凝土半透明"
          />
          <HudBtn
            icon="grid_4x4"
            active={view.concrete === 'wireframe'}
            onClick={() => setView({ concrete: 'wireframe' })}
            title="线框"
          />
          <HudBtn
            icon="visibility_off"
            active={view.concrete === 'hidden'}
            onClick={() => setView({ concrete: 'hidden' })}
            title="隐藏混凝土"
          />
          <HudBtn
            icon="content_cut"
            active={view.concrete === 'clip'}
            onClick={() => setView({ concrete: 'clip' })}
            title="剖切"
          />
        </div>
        <div className="glass-panel p-1 rounded flex gap-1 shadow-2xl">
          <HudBtn
            icon="dashboard"
            active={view.showLongitudinal}
            onClick={() => setView({ showLongitudinal: !view.showLongitudinal })}
            title="纵筋"
          />
          <HudBtn
            icon="reorder"
            active={view.showStirrups}
            onClick={() => setView({ showStirrups: !view.showStirrups })}
            title="箍筋"
          />
        </div>
        <div className="glass-panel p-1 rounded flex gap-1 shadow-2xl">
          <HudBtn icon="photo_camera" onClick={onShot} title="截图 PNG (P)" />
          <HudBtn icon="download" onClick={exportCurrentBOM} title="导出 BOM CSV (E)" />
        </div>
        <div className="glass-panel px-3 py-1 rounded flex items-center gap-4 shadow-2xl">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_#4edea3]" />
            <span className="text-[10px] font-bold text-secondary tracking-widest">
              实时渲染
            </span>
          </div>
          <span className="font-mono text-[10px] text-on-surface-variant">帧率 60</span>
        </div>
      </div>

      {/* 右下：缩放 */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <div className="glass-panel flex flex-col p-1 rounded shadow-2xl">
          <button className="p-2 hover:bg-surface-variant/50 text-on-surface-variant rounded">
            <Icon name="zoom_in" />
          </button>
          <div className="h-px bg-outline-variant/20 mx-2" />
          <button className="p-2 hover:bg-surface-variant/50 text-on-surface-variant rounded">
            <Icon name="zoom_out" />
          </button>
          <div className="h-px bg-outline-variant/20 mx-2" />
          <button className="p-2 hover:bg-surface-variant/50 text-on-surface-variant rounded">
            <Icon name="refresh" />
          </button>
        </div>
      </div>
    </>
  );
}

function HudBtn({
  icon,
  active,
  onClick,
  title,
}: {
  icon: string;
  active?: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-primary/20 text-primary'
          : 'hover:bg-surface-variant/50 text-on-surface-variant'
      }`}
    >
      <Icon name={icon} className="!text-[20px]" />
    </button>
  );
}
