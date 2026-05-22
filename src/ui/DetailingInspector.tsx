import { useStore } from '@/store/useStore';
import { useAIStore } from '@/ai/store/ai-store';
import { ConcreteGrade, RebarGrade, SeismicLevel } from '@/codes/rebar';
import { parseBeamPingfa } from '@/parser/beamPingfa';
import { validateBeam, validateColumn, validateWall } from '@/utils/validate';
import { PINGFA_SAMPLES } from '@/data/pingfaSamples';
import { useMemo, useState } from 'react';
import { Icon } from './Icon';

export function DetailingInspector() {
  const kind = useStore((s) => s.kind);
  const sel = useStore((s) => s.selected);

  return (
    <aside data-tour="inspector" className="w-inspector-width bg-surface-container-low/40 backdrop-blur-xl border-l border-outline-variant/20 flex flex-col shrink-0 h-full">
      <div className="px-5 py-4 border-b border-outline-variant/10 shrink-0">
        <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
          <Icon name="tune" className="text-primary" />
          配筋详情
        </h2>
      </div>
      <div className="flex-1 px-5 py-4 space-y-6 overflow-y-auto scroll-thin">
        <ValidationBanner />
        {kind === 'beam' && <BeamPanel />}
        {kind === 'column' && <ColumnPanel />}
        {kind === 'wall' && <WallPanel />}

        {/* 选中钢筋信息 */}
        {sel && <SelectedRebarCard sel={sel} />}

      </div>

      {/* AI Copilot */}
      <AIPanel />
    </aside>
  );
}

function ValidationBanner() {
  const kind = useStore((s) => s.kind);
  const beam = useStore((s) => s.beam);
  const column = useStore((s) => s.column);
  const wall = useStore((s) => s.wall);
  const result = useMemo(() => {
    if (kind === 'beam') return validateBeam(beam);
    if (kind === 'column') return validateColumn(column);
    return validateWall(wall);
  }, [kind, beam, column, wall]);

  const [expanded, setExpanded] = useState(false);
  const errCount = result.errors.length;
  const warnCount = result.warnings.length;

  if (errCount === 0 && warnCount === 0) {
    return (
      <section className="bg-secondary/5 border border-secondary/20 rounded p-3 flex items-center gap-2">
        <Icon name="verified_user" className="text-secondary !text-[18px]" filled />
        <span className="text-[12px] text-on-surface-variant">参数已通过 22G101-1 基础校验</span>
      </section>
    );
  }

  const tone = errCount > 0 ? 'error' : 'warning';
  const bg = tone === 'error' ? 'bg-red-500/10 border-red-500/40' : 'bg-amber-500/10 border-amber-500/40';
  const fg = tone === 'error' ? 'text-red-400' : 'text-amber-400';
  const icon = tone === 'error' ? 'error' : 'warning';

  return (
    <section className={`rounded p-3 border ${bg}`}>
      <button
        className="w-full flex items-center gap-2 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <Icon name={icon} className={`!text-[18px] ${fg}`} filled />
        <span className={`text-[12px] font-semibold ${fg}`}>
          {errCount > 0 && `${errCount} 个错误`}
          {errCount > 0 && warnCount > 0 && '  ·  '}
          {warnCount > 0 && `${warnCount} 个警告`}
        </span>
        <span className="ml-auto text-[10px] text-on-surface-variant">
          {expanded ? '收起' : '展开'}
        </span>
      </button>
      {expanded && (
        <ul className="mt-2 space-y-1 text-[11px] leading-snug">
          {result.errors.map((e, i) => (
            <li key={'e' + i} className="text-red-300 flex gap-1">
              <span>•</span>
              <span>{e}</span>
            </li>
          ))}
          {result.warnings.map((w, i) => (
            <li key={'w' + i} className="text-amber-300 flex gap-1">
              <span>•</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-on-surface-variant">{label}</span>
      <b className={mono ? 'font-mono text-on-surface' : 'text-on-surface'}>{value}</b>
    </div>
  );
}

function GradeSelect({
  value,
  onChange,
}: {
  value: RebarGrade;
  onChange: (g: RebarGrade) => void;
}) {
  return (
    <select className="field-input appearance-none" value={value} onChange={(e) => onChange(e.target.value as RebarGrade)}>
      <option value="HPB300">HPB300 (Φ)</option>
      <option value="HRB400">HRB400 (C)</option>
      <option value="HRB500">HRB500 (D)</option>
    </select>
  );
}

function NumField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <div className="flex gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="field-input"
        />
        {suffix && <span className="field-suffix">{suffix}</span>}
      </div>
    </label>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  suffix?: string;
}) {
  return (
    <label className="block group">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors">
          {label}
        </span>
        <span className="font-mono text-xs text-primary">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </label>
  );
}

function BeamPanel() {
  const beam = useStore((s) => s.beam);
  const update = useStore((s) => s.updateBeam);
  return (
    <>
      <PingfaInput />

      <section className="space-y-3">
        <div className="section-caps">几何尺寸</div>
        <div className="grid grid-cols-2 gap-3">
          <NumField label="保护层 c" value={beam.cover} onChange={(v) => update({ cover: v })} suffix="mm" />
          <NumField label="截面 b" value={beam.b} onChange={(v) => update({ b: v })} suffix="mm" />
          <NumField label="左端 h" value={beam.h} onChange={(v) => update({ h: v })} suffix="mm" />
          <NumField
            label="右端 h₁"
            value={beam.h1 ?? beam.h}
            onChange={(v) => update({ h1: v === beam.h ? undefined : v })}
            suffix="mm"
          />
          <NumField label="左支座" value={beam.leftSupport.width} onChange={(v) => update({ leftSupport: { width: v } })} suffix="mm" />
          <NumField label="右支座" value={beam.rightSupport.width} onChange={(v) => update({ rightSupport: { width: v } })} suffix="mm" />
        </div>
        {beam.h1 != null && beam.h1 !== beam.h && (
          <label className="block">
            <span className="field-label">过渡形式</span>
            <select
              className="field-input appearance-none"
              value={beam.transition ?? 'linear'}
              onChange={(e) => update({ transition: e.target.value as 'linear' | 'step' })}
            >
              <option value="linear">线性渐变</option>
              <option value="step">中点阶梯</option>
            </select>
          </label>
        )}
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="field-label">混凝土</span>
            <select
              className="field-input appearance-none"
              value={beam.concrete}
              onChange={(e) => update({ concrete: e.target.value as ConcreteGrade })}
            >
              {(['C25', 'C30', 'C35', 'C40', 'C45', 'C50'] as ConcreteGrade[]).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">抗震等级</span>
            <select
              className="field-input appearance-none"
              value={String(beam.seismicLevel)}
              onChange={(e) =>
                update({
                  seismicLevel: e.target.value === 'null' ? null : (Number(e.target.value) as SeismicLevel),
                })
              }
            >
              <option value="1">一级</option>
              <option value="2">二级</option>
              <option value="3">三级</option>
              <option value="4">四级</option>
              <option value="null">非抗震</option>
            </select>
          </label>
        </div>
      </section>

      <SpansEditor />

      <section className="space-y-3">
        <div className="section-caps">配筋参数</div>
        <SliderField
          label="箍筋加密间距 s₁"
          value={beam.stirrup.spacingDense}
          onChange={(v) => update({ stirrup: { ...beam.stirrup, spacingDense: v } })}
          min={50}
          max={200}
          suffix="mm"
        />
        <SliderField
          label="箍筋非加密 s₂"
          value={beam.stirrup.spacingSparse}
          onChange={(v) => update({ stirrup: { ...beam.stirrup, spacingSparse: v } })}
          min={100}
          max={300}
          suffix="mm"
        />
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="field-label">箍筋等级</span>
            <GradeSelect
              value={beam.stirrup.grade}
              onChange={(g) => update({ stirrup: { ...beam.stirrup, grade: g } })}
            />
          </label>
          <NumField
            label="箍筋直径"
            value={beam.stirrup.diameter}
            onChange={(v) => update({ stirrup: { ...beam.stirrup, diameter: v } })}
            suffix="mm"
          />
          <NumField
            label="肢数"
            value={beam.stirrup.legs}
            onChange={(v) => update({ stirrup: { ...beam.stirrup, legs: v } })}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <NumField label="上部根数" value={beam.topThrough.count} onChange={(v) => update({ topThrough: { ...beam.topThrough, count: v } })} />
          <NumField label="上部直径" value={beam.topThrough.diameter} onChange={(v) => update({ topThrough: { ...beam.topThrough, diameter: v } })} suffix="mm" />
          <label className="block">
            <span className="field-label">上部等级</span>
            <GradeSelect
              value={beam.topThrough.grade}
              onChange={(g) => update({ topThrough: { ...beam.topThrough, grade: g } })}
            />
          </label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <NumField label="下部根数" value={beam.bottom.count} onChange={(v) => update({ bottom: { ...beam.bottom, count: v } })} />
          <NumField label="下部直径" value={beam.bottom.diameter} onChange={(v) => update({ bottom: { ...beam.bottom, diameter: v } })} suffix="mm" />
          <label className="block">
            <span className="field-label">下部等级</span>
            <GradeSelect
              value={beam.bottom.grade}
              onChange={(g) => update({ bottom: { ...beam.bottom, grade: g } })}
            />
          </label>
        </div>
        {(beam.spans?.length ?? 1) > 1 && (
          <>
            <div className="text-[11px] text-on-surface-variant pt-1">支座负筋(中间支座)</div>
            <div className="grid grid-cols-3 gap-2">
              <NumField
                label="根数"
                value={beam.supportNeg?.count ?? 2}
                onChange={(v) =>
                  update({
                    supportNeg: {
                      grade: beam.supportNeg?.grade ?? 'HRB400',
                      diameter: beam.supportNeg?.diameter ?? 25,
                      count: v,
                    },
                  })
                }
              />
              <NumField
                label="直径"
                value={beam.supportNeg?.diameter ?? 25}
                onChange={(v) =>
                  update({
                    supportNeg: {
                      grade: beam.supportNeg?.grade ?? 'HRB400',
                      count: beam.supportNeg?.count ?? 2,
                      diameter: v,
                    },
                  })
                }
                suffix="mm"
              />
              <label className="block">
                <span className="field-label">等级</span>
                <GradeSelect
                  value={beam.supportNeg?.grade ?? 'HRB400'}
                  onChange={(g) =>
                    update({
                      supportNeg: {
                        diameter: beam.supportNeg?.diameter ?? 25,
                        count: beam.supportNeg?.count ?? 2,
                        grade: g,
                      },
                    })
                  }
                />
              </label>
            </div>
          </>
        )}
      </section>
    </>
  );
}

/** 多跨编辑器:展示每跨净跨 + 中间支座宽,支持 + / − */
function SpansEditor() {
  const beam = useStore((s) => s.beam);
  const update = useStore((s) => s.updateBeam);
  const spans = beam.spans && beam.spans.length > 0 ? beam.spans : [beam.span];
  const interior = beam.interiorSupports ?? [];

  const setSpan = (i: number, v: number) => {
    const next = spans.slice();
    next[i] = v;
    update({ spans: next, span: next[0] });
  };
  const setInterior = (i: number, v: number) => {
    const next = interior.slice();
    while (next.length < spans.length - 1) next.push({ width: 500 });
    next[i] = { width: v };
    update({ interiorSupports: next });
  };
  const addSpan = () => {
    const next = [...spans, spans[spans.length - 1] ?? 6000];
    const ni = interior.slice();
    while (ni.length < next.length - 1) ni.push({ width: 500 });
    update({ spans: next, interiorSupports: ni });
  };
  const removeSpan = () => {
    if (spans.length <= 1) return;
    const next = spans.slice(0, -1);
    const ni = interior.slice(0, -1);
    update({
      spans: next.length === 1 ? undefined : next,
      interiorSupports: ni.length === 0 ? undefined : ni,
      span: next[0],
    });
  };

  return (
    <section className="space-y-3">
      <div className="section-caps flex justify-between items-center">
        <span>跨设置({spans.length} 跨)</span>
        <div className="flex gap-1 normal-case tracking-normal">
          <button
            className="p-1 rounded hover:bg-surface-variant/40 text-on-surface-variant disabled:opacity-30"
            onClick={removeSpan}
            disabled={spans.length <= 1}
            title="删除最后一跨"
          >
            <Icon name="remove" className="!text-[16px]" />
          </button>
          <button
            className="p-1 rounded hover:bg-surface-variant/40 text-primary"
            onClick={addSpan}
            title="添加一跨"
          >
            <Icon name="add" className="!text-[16px]" />
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {spans.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-10 text-[11px] text-outline shrink-0">第{i + 1}跨</span>
            <NumField label="" value={s} onChange={(v) => setSpan(i, v)} suffix="mm" />
            {i < spans.length - 1 && (
              <>
                <span className="text-[11px] text-outline shrink-0">支座</span>
                <NumField
                  label=""
                  value={interior[i]?.width ?? 500}
                  onChange={(v) => setInterior(i, v)}
                  suffix="mm"
                />
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ColumnPanel() {
  const c = useStore((s) => s.column);
  const update = useStore((s) => s.updateColumn);
  return (
    <>
      <section className="space-y-3">
        <div className="section-caps">几何尺寸</div>
        <div className="grid grid-cols-2 gap-3">
          <NumField label="净高 Hn" value={c.height} onChange={(v) => update({ height: v })} suffix="mm" />
          <NumField label="保护层 c" value={c.cover} onChange={(v) => update({ cover: v })} suffix="mm" />
          <NumField label="截面 b" value={c.b} onChange={(v) => update({ b: v })} suffix="mm" />
          <NumField label="截面 h" value={c.h} onChange={(v) => update({ h: v })} suffix="mm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="field-label">混凝土</span>
            <select
              className="field-input appearance-none"
              value={c.concrete}
              onChange={(e) => update({ concrete: e.target.value as ConcreteGrade })}
            >
              {(['C25', 'C30', 'C35', 'C40', 'C45', 'C50'] as ConcreteGrade[]).map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">楼层位置</span>
            <select
              className="field-input appearance-none"
              value={String(c.isBottom)}
              onChange={(e) => update({ isBottom: e.target.value === 'true' })}
            >
              <option value="true">底层柱根</option>
              <option value="false">中间/顶层</option>
            </select>
          </label>
        </div>
      </section>
      <section className="space-y-3">
        <div className="section-caps">配筋参数</div>
        <SliderField
          label="箍筋加密间距 s₁"
          value={c.stirrup.spacingDense}
          onChange={(v) => update({ stirrup: { ...c.stirrup, spacingDense: v } })}
          min={50}
          max={200}
          suffix="mm"
        />
        <SliderField
          label="箍筋非加密 s₂"
          value={c.stirrup.spacingSparse}
          onChange={(v) => update({ stirrup: { ...c.stirrup, spacingSparse: v } })}
          min={100}
          max={300}
          suffix="mm"
        />
        <div className="grid grid-cols-2 gap-3">
          <NumField label="b 边根数" value={c.longitudinal.nB} onChange={(v) => update({ longitudinal: { ...c.longitudinal, nB: v } })} />
          <NumField label="h 边根数" value={c.longitudinal.nH} onChange={(v) => update({ longitudinal: { ...c.longitudinal, nH: v } })} />
          <NumField label="纵筋直径" value={c.longitudinal.diameter} onChange={(v) => update({ longitudinal: { ...c.longitudinal, diameter: v } })} suffix="mm" />
          <label className="block">
            <span className="field-label">纵筋等级</span>
            <GradeSelect
              value={c.longitudinal.grade}
              onChange={(g) => update({ longitudinal: { ...c.longitudinal, grade: g } })}
            />
          </label>
        </div>
        <label className="block">
          <span className="field-label">复合形式</span>
          <select
            className="field-input appearance-none"
            value={c.stirrup.composite}
            onChange={(e) => update({ stirrup: { ...c.stirrup, composite: e.target.value as any } })}
          >
            <option value="rect">矩形单箍</option>
            <option value="jing">井字复合箍</option>
            <option value="diamond">菱形抱角箍</option>
          </select>
        </label>
      </section>
    </>
  );
}

function WallPanel() {
  const w = useStore((s) => s.wall);
  const update = useStore((s) => s.updateWall);
  return (
    <>
      <section className="space-y-3">
        <div className="section-caps">几何尺寸</div>
        <div className="grid grid-cols-2 gap-3">
          <NumField label="墙长 L" value={w.length} onChange={(v) => update({ length: v })} suffix="mm" />
          <NumField label="墙高 H" value={w.height} onChange={(v) => update({ height: v })} suffix="mm" />
          <NumField label="墙厚 t" value={w.thickness} onChange={(v) => update({ thickness: v })} suffix="mm" />
          <NumField label="保护层 c" value={w.cover} onChange={(v) => update({ cover: v })} suffix="mm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="field-label">混凝土</span>
            <select
              className="field-input appearance-none"
              value={w.concrete}
              onChange={(e) => update({ concrete: e.target.value as ConcreteGrade })}
            >
              {(['C25', 'C30', 'C35', 'C40', 'C45', 'C50'] as ConcreteGrade[]).map((x) => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">抗震等级</span>
            <select
              className="field-input appearance-none"
              value={String(w.seismicLevel)}
              onChange={(e) =>
                update({
                  seismicLevel:
                    e.target.value === 'null' ? null : (Number(e.target.value) as SeismicLevel),
                })
              }
            >
              <option value="1">一级</option>
              <option value="2">二级</option>
              <option value="3">三级</option>
              <option value="4">四级</option>
              <option value="null">非抗震</option>
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <div className="section-caps">竖向分布筋</div>
        <div className="grid grid-cols-3 gap-2">
          <NumField
            label="直径"
            value={w.vertical.diameter}
            onChange={(v) => update({ vertical: { ...w.vertical, diameter: v } })}
            suffix="mm"
          />
          <NumField
            label="间距"
            value={w.vertical.spacing}
            onChange={(v) => update({ vertical: { ...w.vertical, spacing: v } })}
            suffix="mm"
          />
          <label className="block">
            <span className="field-label">等级</span>
            <GradeSelect
              value={w.vertical.grade}
              onChange={(g) => update({ vertical: { ...w.vertical, grade: g } })}
            />
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <div className="section-caps">水平分布筋</div>
        <div className="grid grid-cols-3 gap-2">
          <NumField
            label="直径"
            value={w.horizontal.diameter}
            onChange={(v) => update({ horizontal: { ...w.horizontal, diameter: v } })}
            suffix="mm"
          />
          <NumField
            label="间距"
            value={w.horizontal.spacing}
            onChange={(v) => update({ horizontal: { ...w.horizontal, spacing: v } })}
            suffix="mm"
          />
          <label className="block">
            <span className="field-label">等级</span>
            <GradeSelect
              value={w.horizontal.grade}
              onChange={(g) => update({ horizontal: { ...w.horizontal, grade: g } })}
            />
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <div className="section-caps flex justify-between items-center">
          <span>拉筋(梅花布置)</span>
          <label className="flex items-center gap-1 normal-case tracking-normal cursor-pointer">
            <input
              type="checkbox"
              checked={w.tie.enabled}
              onChange={(e) => update({ tie: { ...w.tie, enabled: e.target.checked } })}
            />
            <span className="text-[10px] text-on-surface-variant">启用</span>
          </label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <NumField
            label="直径"
            value={w.tie.diameter}
            onChange={(v) => update({ tie: { ...w.tie, diameter: v } })}
            suffix="mm"
          />
          <NumField
            label="水平间距"
            value={w.tie.spacingX}
            onChange={(v) => update({ tie: { ...w.tie, spacingX: v } })}
            suffix="mm"
          />
          <NumField
            label="竖向间距"
            value={w.tie.spacingY}
            onChange={(v) => update({ tie: { ...w.tie, spacingY: v } })}
            suffix="mm"
          />
        </div>
      </section>
    </>
  );
}

function PingfaInput() {
  const update = useStore((s) => s.updateBeam);
  const [text, setText] = useState('KL2(2A) 300×700  Φ10@100/200(4)  2C25;4C25  G4C12');
  const [warns, setWarns] = useState<string[]>([]);
  const apply = () => {
    const r = parseBeamPingfa(text);
    update(r.patch);
    setWarns(r.warnings);
  };
  const beamSamples = PINGFA_SAMPLES.filter((s) => s.category !== '柱');
  return (
    <section className="space-y-2">
      <div className="section-caps flex justify-between items-center">
        <span>平法标注</span>
        <select
          className="text-[10px] bg-surface-container border border-outline-variant/30 rounded px-1.5 py-0.5 text-on-surface-variant normal-case tracking-normal"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) {
              setText(e.target.value);
              const r = parseBeamPingfa(e.target.value);
              update(r.patch);
              setWarns(r.warnings);
            }
          }}
        >
          <option value="" disabled>
            示例…
          </option>
          {beamSamples.map((s, i) => (
            <option key={i} value={s.text}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <textarea
        className="field-input font-mono !text-[11px] h-16 resize-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="btn-primary w-full" onClick={apply}>
        解析并应用
      </button>
      {warns.length > 0 && (
        <ul className="text-[10px] text-tertiary list-disc pl-5 space-y-0.5">
          {warns.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SelectedRebarCard({
  sel,
}: {
  sel: { role: string; length: number; diameter: number; grade: string };
}) {
  const setOpen = useAIStore((s) => s.setOpen);
  const setPending = useAIStore((s) => s.setPendingInput);
  const askAI = () => {
    setPending(
      `帮我解释当前选中的钢筋：${sel.role} (等级 ${sel.grade}, d=${sel.diameter}mm, 下料长度 ${sel.length}mm)。它的错固、构造要求是什么？根据 22G101 是否有问题？`
    );
    setOpen(true);
  };
  return (
    <section className="bg-primary/5 border border-primary/20 rounded p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon name="adjust" className="text-primary !text-[18px]" />
          <span className="text-[11px] font-bold text-primary tracking-widest">
            当前选中钢筋
          </span>
        </div>
        <button
          onClick={askAI}
          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors"
          title="让 AI 解释这根钢筋"
        >
          <Icon name="auto_awesome" className="!text-[12px]" />
          问 AI
        </button>
      </div>
      <div className="space-y-1 text-[12px]">
        <Row label="类型" value={sel.role} />
        <Row label="规格" value={`${sel.grade} d${sel.diameter}`} />
        <Row label="下料长度" value={`${sel.length} mm`} mono />
      </div>
    </section>
  );
}

function AIPanel() {
  const togglePanel = useAIStore((s) => s.togglePanel);
  return (
    <div className="border-t border-outline-variant/20 bg-surface-container-lowest/40 shrink-0 p-3">
      <button
        onClick={togglePanel}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-gradient-to-r from-primary/15 to-tertiary/15 hover:from-primary/25 hover:to-tertiary/25 border border-primary/20 text-primary text-xs font-bold transition-colors"
      >
        <Icon name="auto_awesome" className="!text-[18px]" />
        打开智筋 AI 助手
      </button>
      <p className="text-[10px] text-on-surface-variant/70 text-center mt-2">
        基于 22G101-1 知识库 · 支持 DeepSeek / Kimi / 通义千问
      </p>
    </div>
  );
}
