import { useStore } from '@/store/useStore';
import { Icon } from './Icon';

export function LandingPage() {
  const goStudio = useStore((s) => s.goStudio);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-surface text-on-surface overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-secondary/8 blur-[100px]" />
        <div className="absolute top-1/2 right-1/4 w-[250px] h-[250px] rounded-full bg-tertiary/6 blur-[80px]" />
      </div>

      {/* Top bar */}
      <header className="absolute top-0 left-0 right-0 flex items-center px-8 h-16 z-10">
        <div className="flex items-center gap-2">
          <Icon name="architecture" className="text-primary !text-2xl" />
          <span className="font-bold tracking-tight text-primary text-lg">
            智筋 <span className="font-normal text-on-surface-variant">3D</span>
          </span>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8">
          <Icon name="architecture" className="text-primary !text-[48px]" />
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-4">
          <span className="text-primary">智筋</span>{' '}
          <span className="text-on-surface-variant font-light">3D</span>
        </h1>

        <p className="text-lg text-on-surface-variant mb-2 tracking-wide">
          智能配筋 · 3D 可视化 · 22G101
        </p>

        <p className="text-sm text-on-surface-variant/70 leading-relaxed max-w-md mb-10">
          基于 22G101 图集的梁、柱、墙平法配筋 3D 工作台。
          实时参数化建模、自动校验、一键导出 BOM 下料单。
        </p>

        <button
          onClick={goStudio}
          className="group relative px-8 py-3.5 rounded-lg bg-primary text-on-primary font-bold text-base tracking-wider shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <span className="flex items-center gap-2">
            进入工作台
            <Icon name="arrow_forward" className="!text-[20px] group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>

        <div className="flex items-center gap-6 mt-12 text-xs text-on-surface-variant/50">
          <span className="flex items-center gap-1.5">
            <Icon name="view_in_ar" className="!text-sm" />
            梁 · 柱 · 墙
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="code" className="!text-sm" />
            平法标注解析
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="table_chart" className="!text-sm" />
            BOM 导出
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 flex justify-center py-4 z-10">
        <span className="text-[11px] text-on-surface-variant/40 tracking-wider">
          v0.1.0 · Rebar Detailing Studio
        </span>
      </footer>
    </div>
  );
}
