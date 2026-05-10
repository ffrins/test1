import { useStore } from '@/store/useStore';
import { Icon } from './Icon';

/** 简化的 2D 截面图：根据当前梁/柱参数绘制混凝土框 + 钢筋点位 */
export function CrossSection() {
  const kind = useStore((s) => s.kind);
  const beam = useStore((s) => s.beam);
  const column = useStore((s) => s.column);

  const { b, h, cover, stirrupD, longTop, longBot, longD, label } = (() => {
    if (kind === 'beam') {
      return {
        b: beam.b,
        h: beam.h,
        cover: beam.cover,
        stirrupD: beam.stirrup.diameter,
        longTop: beam.topThrough.count,
        longBot: beam.bottom.count,
        longD: Math.max(beam.topThrough.diameter, beam.bottom.diameter),
        label: `${beam.id}  ${beam.b}×${beam.h}`,
      };
    }
    return {
      b: column.b,
      h: column.h,
      cover: column.cover,
      stirrupD: column.stirrup.diameter,
      longTop: column.longitudinal.nB,
      longBot: column.longitudinal.nB,
      longD: column.longitudinal.diameter,
      label: `${column.id}  ${column.b}×${column.h}`,
    };
  })();

  // 视口绘制：保持等比，留 padding
  const padding = 30;
  const W = 300;
  const H = 200;
  const scale = Math.min((W - padding * 2) / b, (H - padding * 2) / h);
  const bw = b * scale;
  const hh = h * scale;
  const x0 = (W - bw) / 2;
  const y0 = (H - hh) / 2;
  const cw = cover * scale;
  const sd = stirrupD * scale;
  const rd = Math.max(2.5, longD * scale * 0.5);

  // 上下排筋点位
  const ptYTop = y0 + cw + sd + rd;
  const ptYBot = y0 + hh - cw - sd - rd;
  const innerW = bw - 2 * (cw + sd + rd);
  const xs = (n: number) =>
    n === 1
      ? [x0 + bw / 2]
      : Array.from({ length: n }, (_, i) => x0 + cw + sd + rd + (innerW * i) / (n - 1));

  return (
    <div className="flex-1 border-r border-outline-variant/10 flex flex-col min-w-0">
      <div className="h-8 px-4 flex items-center justify-between border-b border-outline-variant/10 bg-surface-container-low shrink-0">
        <span className="text-[11px] font-bold text-on-surface-variant tracking-wider">
          截面图 · {label} · 比例 1:20
        </span>
        <button className="text-on-surface-variant hover:text-primary">
          <Icon name="fullscreen" className="!text-[16px]" />
        </button>
      </div>
      <div className="flex-1 relative bg-[#020617]/50 p-4 flex items-center justify-center">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" className="max-h-full">
          {/* 中心十字辅助线 */}
          <line x1={W / 2} y1={0} x2={W / 2} y2={H} stroke="#3e484f" strokeDasharray="2 3" strokeWidth="0.5" />
          <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="#3e484f" strokeDasharray="2 3" strokeWidth="0.5" />
          {/* 混凝土 */}
          <rect
            x={x0}
            y={y0}
            width={bw}
            height={hh}
            fill="rgba(141, 213, 255, 0.04)"
            stroke="#8ed5ff"
            strokeDasharray="4 2"
            strokeWidth="1.2"
          />
          {/* 箍筋 */}
          <rect
            x={x0 + cw}
            y={y0 + cw}
            width={bw - 2 * cw}
            height={hh - 2 * cw}
            fill="none"
            stroke="#bdc8d1"
            strokeWidth="0.8"
          />
          {/* 上排纵筋 */}
          {xs(longTop).map((cx, i) => (
            <circle key={`t${i}`} cx={cx} cy={ptYTop} r={rd} fill="#8ed5ff" />
          ))}
          {/* 下排纵筋 */}
          {xs(longBot).map((cx, i) => (
            <circle key={`b${i}`} cx={cx} cy={ptYBot} r={rd} fill="#8ed5ff" />
          ))}
          {/* 标尺：宽 b */}
          <g fill="#87929a" fontSize="9" fontFamily="JetBrains Mono">
            <line x1={x0} y1={y0 - 10} x2={x0 + bw} y2={y0 - 10} stroke="#87929a" strokeWidth="0.5" />
            <line x1={x0} y1={y0 - 13} x2={x0} y2={y0 - 7} stroke="#87929a" strokeWidth="0.5" />
            <line x1={x0 + bw} y1={y0 - 13} x2={x0 + bw} y2={y0 - 7} stroke="#87929a" strokeWidth="0.5" />
            <text x={W / 2} y={y0 - 13} textAnchor="middle">{b}</text>
            {/* 高 h */}
            <line x1={x0 + bw + 10} y1={y0} x2={x0 + bw + 10} y2={y0 + hh} stroke="#87929a" strokeWidth="0.5" />
            <line x1={x0 + bw + 7} y1={y0} x2={x0 + bw + 13} y2={y0} stroke="#87929a" strokeWidth="0.5" />
            <line x1={x0 + bw + 7} y1={y0 + hh} x2={x0 + bw + 13} y2={y0 + hh} stroke="#87929a" strokeWidth="0.5" />
            <text x={x0 + bw + 13} y={y0 + hh / 2 + 3}>{h}</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
