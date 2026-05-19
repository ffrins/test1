import { useEffect, useState } from 'react';
import { Icon } from './Icon';

const STORAGE_KEY = 'rebar3d_onboarding_done';

interface Step {
  target: string; // CSS selector
  title: string;
  content: string;
  position: 'bottom' | 'left' | 'right';
}

const STEPS: Step[] = [
  {
    target: '[data-tour="tree"]',
    title: '构件导航',
    content: '在这里切换梁 / 柱 / 墙，按 1 / 2 / 3 快速跳转。',
    position: 'right',
  },
  {
    target: '[data-tour="viewer"]',
    title: '3D 视口',
    content: '拖拽旋转、滚轮缩放。按 T / W / H / C 切换混凝土显示。',
    position: 'bottom',
  },
  {
    target: '[data-tour="inspector"]',
    title: '参数面板',
    content: '修改截面、钢筋参数，或用平法标注一键填充。修改自动记录，Ctrl+Z 可撤销。',
    position: 'left',
  },
];

export function OnboardingTooltip() {
  const [step, setStep] = useState(-1); // -1 = not started / done

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    // small delay so DOM is ready
    const timer = setTimeout(() => setStep(0), 800);
    return () => clearTimeout(timer);
  }, []);

  if (step < 0 || step >= STEPS.length) return null;

  const s = STEPS[step];
  const el = document.querySelector(s.target);
  const rect = el?.getBoundingClientRect();

  const finish = () => {
    setStep(-1);
    localStorage.setItem(STORAGE_KEY, '1');
  };

  const next = () => {
    if (step + 1 >= STEPS.length) {
      finish();
    } else {
      setStep(step + 1);
    }
  };

  // Fallback if target not found
  if (!rect) {
    next();
    return null;
  }

  // Position tooltip relative to target
  const gap = 12;
  let style: React.CSSProperties = {};
  let arrowCls = '';

  if (s.position === 'right') {
    style = { top: rect.top + rect.height / 2, left: rect.right + gap, transform: 'translateY(-50%)' };
    arrowCls = 'left-[-6px] top-1/2 -translate-y-1/2 border-r-primary border-l-0 border-t-transparent border-b-transparent border-r-[6px] border-t-[6px] border-b-[6px]';
  } else if (s.position === 'left') {
    style = { top: rect.top + rect.height / 2, left: rect.left - gap, transform: 'translate(-100%, -50%)' };
    arrowCls = 'right-[-6px] top-1/2 -translate-y-1/2 border-l-primary border-r-0 border-t-transparent border-b-transparent border-l-[6px] border-t-[6px] border-b-[6px]';
  } else {
    style = { top: rect.bottom + gap, left: rect.left + rect.width / 2, transform: 'translateX(-50%)' };
    arrowCls = 'top-[-6px] left-1/2 -translate-x-1/2 border-b-primary border-t-0 border-l-transparent border-r-transparent border-b-[6px] border-l-[6px] border-r-[6px]';
  }

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-none">
      {/* Highlight ring */}
      <div
        className="absolute rounded-md ring-2 ring-primary/60 ring-offset-2 ring-offset-surface transition-all duration-300"
        style={{ top: rect.top - 4, left: rect.left - 4, width: rect.width + 8, height: rect.height + 8 }}
      />
      {/* Tooltip */}
      <div
        className="absolute pointer-events-auto bg-surface-container border border-primary/40 rounded-lg shadow-xl p-4 w-64 transition-all duration-300"
        style={style}
      >
        <div className={`absolute w-0 h-0 ${arrowCls}`} />
        <div className="flex items-center gap-2 mb-1">
          <Icon name="school" className="text-primary !text-[16px]" />
          <span className="text-xs font-bold text-primary">{s.title}</span>
          <span className="ml-auto text-[10px] text-outline">{step + 1}/{STEPS.length}</span>
        </div>
        <p className="text-[12px] text-on-surface-variant leading-relaxed mb-3">{s.content}</p>
        <div className="flex justify-between items-center">
          <button
            onClick={finish}
            className="text-[11px] text-outline hover:text-on-surface-variant transition-colors"
          >
            跳过
          </button>
          <button
            onClick={next}
            className="btn-primary !py-1 !px-3 !text-[11px]"
          >
            {step + 1 < STEPS.length ? '下一步' : '开始使用'}
          </button>
        </div>
      </div>
    </div>
  );
}
