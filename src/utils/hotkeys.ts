import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { captureScreenshot } from './screenshot';
import { toast } from '@/ui/Toast';

/** 全局快捷键挂载。挂在 App 顶层一次即可。 */
export function useGlobalHotkeys(onExportCSV: () => void, onOpenHelp: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // 忽略输入框 / 文本域 / 可编辑元素
      const t = e.target as HTMLElement | null;
      if (t) {
        const tag = t.tagName;
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          t.isContentEditable
        ) {
          return;
        }
      }

      // 不处理带修饰键的(留给浏览器/未来撤销重做)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const s = useStore.getState();
      const key = e.key.toLowerCase();
      switch (key) {
        case '1':
          s.setKind('beam');
          toast.info('切换到梁 KL');
          break;
        case '2':
          s.setKind('column');
          toast.info('切换到柱 KZ');
          break;
        case '3':
          s.setKind('wall');
          toast.info('切换到剪力墙 Q');
          break;
        case 'w':
          s.setView({ concrete: 'wireframe' });
          break;
        case 't':
          s.setView({ concrete: 'transparent' });
          break;
        case 'h':
          s.setView({ concrete: 'hidden' });
          break;
        case 'c':
          s.setView({ concrete: 'clip' });
          break;
        case 's':
          s.setView({ showStirrups: !s.view.showStirrups });
          break;
        case 'l':
          s.setView({ showLongitudinal: !s.view.showLongitudinal });
          break;
        case 'o':
          s.setView({ outline: !s.view.outline });
          break;
        case 'p':
          try {
            const id =
              s.kind === 'beam' ? s.beam.id : s.kind === 'column' ? s.column.id : s.wall.id;
            captureScreenshot(id);
            toast.success('已导出截图');
          } catch (err) {
            toast.error(`截图失败:${(err as Error).message}`);
          }
          break;
        case 'e':
          onExportCSV();
          break;
        case '?':
        case '/':
          onOpenHelp();
          break;
        default:
          return;
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onExportCSV, onOpenHelp]);
}
