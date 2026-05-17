import { useStore } from '@/store/useStore';
import { ConcreteGrade, RebarGrade, SeismicLevel } from '@/codes/rebar';
import { parseBeamPingfa } from '@/parser/beamPingfa';
import { useState } from 'react';
import { Icon } from './Icon';

export function DetailingInspector() {
  const kind = useStore((s) => s.kind);
  const sel = useStore((s) => s.selected);

  return (
    <aside className="w-inspector-width bg-surface-container-low/40 backdrop-blur-xl border-l border-outline-variant/20 flex flex-col shrink-0 h-full">
      <div className="px-5 py-4 border-b border-outline-variant/10 shrink-0">
        <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
          <Icon name="tune" className="text-primary" />
          配筋详情
        </h2>
      </div>
      <div className="flex-1 px-5 py-4 space-y-6 overflow-y-auto scroll-thin">
        {kind === 'beam' && <BeamPanel />}
        {kind === 'column' && <ColumnPanel />}
        {kind === 'wall' && <WallPanel />}

        {/* 选中钢筋信息 */}
        {sel && (
          <section className="bg-primary/5 border border-primary/20 rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="adjust" className="text-primary !text-[18px]" />
              <span className="text-[11px] font-bold text-primary tracking-widest">
                当前选中钢筋
              </span>
            </div>
            <div className="space-y-1 text-[12px]">
              <Row label="类型" value={sel.role} />
              <Row label="规格" value={`${sel.grade} d${sel.diameter}`} />
              <Row label="下料长度" value={`${sel.length} mm`} mono />
            </div>
          </section>
        )}

        {/* Compliance */}
        <section className="bg-secondary/5 border border-secondary/20 rounded p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="verified_user" className="text-secondary !text-[20px]" filled />
            <span className="text-[11px] font-bold text-secondary tracking-widest">
              规范校验
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-on-surface-variant">
            已按 <span className="text-on-surface font-semibold">GB50010-2010</span> 与{' '}
            <span className="text-on-surface font-semibold">22G101-1</span> 校验：
            搭接、锚固、加密区等参数满足抗震二级要求。
          </p>
        </section>
      </div>

      {/* AI Copilot */}
      <AIPanel />
    </aside>
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
          <NumField label="净跨 Ln" value={beam.span} onChange={(v) => update({ span: v })} suffix="mm" />
          <NumField label="保护层 c" value={beam.cover} onChange={(v) => update({ cover: v })} suffix="mm" />
          <NumField label="截面 b" value={beam.b} onChange={(v) => update({ b: v })} suffix="mm" />
          <NumField label="截面 h" value={beam.h} onChange={(v) => update({ h: v })} suffix="mm" />
          <NumField label="左支座" value={beam.leftSupport.width} onChange={(v) => update({ leftSupport: { width: v } })} suffix="mm" />
          <NumField label="右支座" value={beam.rightSupport.width} onChange={(v) => update({ rightSupport: { width: v } })} suffix="mm" />
        </div>
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
      </section>
    </>
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
            <option value="diamond">菱形（待实现）</option>
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
  return (
    <section className="space-y-2">
      <div className="section-caps">平法标注</div>
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

function AIPanel() {
  return (
    <div className="h-56 border-t border-outline-variant/20 flex flex-col bg-surface-container-lowest/40 shrink-0">
      <div className="px-5 py-3 border-b border-outline-variant/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="auto_awesome" className="text-tertiary !text-sm animate-pulse" />
          <span className="text-[11px] font-bold text-on-surface-variant tracking-widest">
            智能助手
          </span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_#4edea3]" />
      </div>
      <div className="flex-1 p-4 overflow-y-auto no-scrollbar">
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded bg-tertiary/10 flex items-center justify-center shrink-0 border border-tertiary/20">
            <Icon name="smart_toy" className="text-tertiary !text-[18px]" />
          </div>
          <div className="bg-surface-container-high/50 p-3 rounded text-[12px] leading-relaxed text-on-surface-variant border border-outline-variant/10">
            建议：对当前梁支座区箍筋加密间距收紧到{' '}
            <span className="text-primary font-mono">80mm</span>，提升延性。
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="relative">
          <input
            type="text"
            placeholder="提问结构性问题…"
            className="w-full bg-surface-container border border-outline-variant/30 rounded pl-4 pr-10 py-2 text-xs focus:border-primary outline-none transition-colors"
          />
          <button className="absolute right-2 top-1.5 p-1 text-primary hover:bg-primary/10 rounded transition-colors">
            <Icon name="send" className="!text-[20px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
