import { Icon } from './Icon';

interface Props {
  open: boolean;
  onClose: () => void;
}

const GROUPS: { title: string; items: [string, string][] }[] = [
  {
    title: '构件',
    items: [
      ['1', '梁 KL'],
      ['2', '柱 KZ'],
      ['3', '剪力墙 Q'],
    ],
  },
  {
    title: '视图',
    items: [
      ['T', '混凝土半透明'],
      ['W', '线框'],
      ['H', '隐藏混凝土'],
      ['C', '剖切'],
      ['L', '切换纵筋显隐'],
      ['S', '切换箍筋显隐'],
      ['O', '切换轮廓线'],
    ],
  },
  {
    title: '导出',
    items: [
      ['P', '3D 截图 PNG'],
      ['E', 'BOM 导出 CSV'],
    ],
  },
  {
    title: '编辑',
    items: [
      ['Ctrl+Z', '撤销'],
      ['Ctrl+Y', '重做'],
      ['Ctrl+Shift+Z', '重做'],
    ],
  },
  {
    title: '其他',
    items: [['? / /', '打开本帮助']],
  },
];

export function ShortcutsHelp({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="glass-panel border border-outline-variant/30 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <Icon name="keyboard" className="text-primary" />
            <h2 className="text-sm font-bold text-on-surface">键盘快捷键</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-variant/50 text-on-surface-variant"
          >
            <Icon name="close" className="!text-[18px]" />
          </button>
        </div>
        <div className="p-5 grid grid-cols-2 gap-x-8 gap-y-5">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <div className="section-caps mb-2">{g.title}</div>
              <div className="space-y-1.5">
                {g.items.map(([k, label]) => (
                  <div key={k} className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant">{label}</span>
                    <kbd className="font-mono px-2 py-0.5 rounded bg-surface-container-high text-primary border border-outline-variant/30 text-[11px]">
                      {k}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-outline-variant/10 text-[11px] text-outline">
          焦点在输入框时快捷键不会触发。
        </div>
      </div>
    </div>
  );
}
