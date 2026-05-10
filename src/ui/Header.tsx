import { Icon } from './Icon';

interface Props {
  fileName: string;
}

export function Header({ fileName }: Props) {
  return (
    <header className="flex flex-col w-full bg-surface-container-low border-b border-outline-variant/30 shrink-0">
      <div className="flex justify-between items-center px-4 h-12">
        <div className="flex items-center gap-3">
          <Icon name="architecture" className="text-primary !text-2xl" />
          <span className="font-bold tracking-tight text-primary text-lg">
            智筋 <span className="font-normal text-on-surface-variant">3D</span>
          </span>
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
          <div className="chip-success">
            <Icon name="check_circle" className="text-secondary !text-sm" filled />
            <span className="text-[11px] font-bold tracking-wider text-secondary">
              已校验
            </span>
          </div>
          <div className="flex gap-1">
            {['notifications', 'cloud_sync', 'settings'].map((n) => (
              <button
                key={n}
                className="p-1.5 hover:bg-surface-variant rounded transition-colors text-on-surface-variant"
              >
                <Icon name={n} className="!text-[20px]" />
              </button>
            ))}
          </div>
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
