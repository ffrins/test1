import { useEffect, useState } from 'react';
import { Icon } from './Icon';

export type ToastType = 'info' | 'success' | 'warn' | 'error';
interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

type Listener = (items: ToastItem[]) => void;
const listeners = new Set<Listener>();
let items: ToastItem[] = [];
let nextId = 1;

function emit() {
  for (const l of listeners) l(items);
}

export const toast = {
  show(message: string, type: ToastType = 'info', durationMs = 2600) {
    const id = nextId++;
    items = [...items, { id, type, message }];
    emit();
    window.setTimeout(() => {
      items = items.filter((t) => t.id !== id);
      emit();
    }, durationMs);
  },
  info: (m: string) => toast.show(m, 'info'),
  success: (m: string) => toast.show(m, 'success'),
  warn: (m: string) => toast.show(m, 'warn'),
  error: (m: string) => toast.show(m, 'error', 4200),
};

const ICONS: Record<ToastType, string> = {
  info: 'info',
  success: 'check_circle',
  warn: 'warning',
  error: 'error',
};
const COLORS: Record<ToastType, string> = {
  info: 'text-primary border-primary/40',
  success: 'text-secondary border-secondary/40',
  warn: 'text-tertiary border-tertiary/40',
  error: 'text-error border-error/40',
};

export function ToastHost() {
  const [list, setList] = useState<ToastItem[]>(items);
  useEffect(() => {
    const l: Listener = (next) => setList(next);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
      {list.map((t) => (
        <div
          key={t.id}
          className={`glass-panel border ${COLORS[t.type]} px-4 py-2 rounded shadow-2xl flex items-center gap-2 text-xs font-medium animate-fadeIn pointer-events-auto`}
        >
          <Icon name={ICONS[t.type]} className="!text-[16px]" />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
