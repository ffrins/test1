import { useStore } from '@/store/useStore';
import { ConcreteGrade, RebarGrade, SeismicLevel } from '@/codes/rebar';

export function ColumnForm() {
  const c = useStore((s) => s.column);
  const update = useStore((s) => s.updateColumn);

  return (
    <div className="space-y-2">
      <div className="section-title">基本信息</div>
      <Field label="编号">
        <input value={c.id} onChange={(e) => update({ id: e.target.value })} />
      </Field>
      <Field label="净高 Hn">
        <NumInput value={c.height} onChange={(v) => update({ height: v })} suffix="mm" />
      </Field>
      <Field label="截面 b">
        <NumInput value={c.b} onChange={(v) => update({ b: v })} suffix="mm" />
      </Field>
      <Field label="截面 h">
        <NumInput value={c.h} onChange={(v) => update({ h: v })} suffix="mm" />
      </Field>
      <Field label="保护层 c">
        <NumInput value={c.cover} onChange={(v) => update({ cover: v })} suffix="mm" />
      </Field>
      <Field label="混凝土">
        <select value={c.concrete} onChange={(e) => update({ concrete: e.target.value as ConcreteGrade })}>
          {(['C25', 'C30', 'C35', 'C40', 'C45', 'C50'] as ConcreteGrade[]).map((x) => (
            <option key={x} value={x}>{x}</option>
          ))}
        </select>
      </Field>
      <Field label="抗震等级">
        <select
          value={String(c.seismicLevel)}
          onChange={(e) => update({ seismicLevel: e.target.value === 'null' ? null : (Number(e.target.value) as SeismicLevel) })}
        >
          <option value="1">一级</option>
          <option value="2">二级</option>
          <option value="3">三级</option>
          <option value="4">四级</option>
          <option value="null">非抗震</option>
        </select>
      </Field>
      <Field label="楼层位置">
        <select value={String(c.isBottom)} onChange={(e) => update({ isBottom: e.target.value === 'true' })}>
          <option value="true">底层柱根</option>
          <option value="false">中间/顶层</option>
        </select>
      </Field>

      <div className="section-title">纵筋</div>
      <Field label="b 边根数">
        <NumInput value={c.longitudinal.nB} onChange={(v) => update({ longitudinal: { ...c.longitudinal, nB: v } })} />
      </Field>
      <Field label="h 边根数">
        <NumInput value={c.longitudinal.nH} onChange={(v) => update({ longitudinal: { ...c.longitudinal, nH: v } })} />
      </Field>
      <Field label="等级">
        <GradeSelect value={c.longitudinal.grade} onChange={(g) => update({ longitudinal: { ...c.longitudinal, grade: g } })} />
      </Field>
      <Field label="直径">
        <NumInput value={c.longitudinal.diameter} onChange={(v) => update({ longitudinal: { ...c.longitudinal, diameter: v } })} suffix="mm" />
      </Field>

      <div className="section-title">箍筋</div>
      <Field label="等级">
        <GradeSelect value={c.stirrup.grade} onChange={(g) => update({ stirrup: { ...c.stirrup, grade: g } })} />
      </Field>
      <Field label="直径">
        <NumInput value={c.stirrup.diameter} onChange={(v) => update({ stirrup: { ...c.stirrup, diameter: v } })} suffix="mm" />
      </Field>
      <Field label="加密间距">
        <NumInput value={c.stirrup.spacingDense} onChange={(v) => update({ stirrup: { ...c.stirrup, spacingDense: v } })} suffix="mm" />
      </Field>
      <Field label="非加密间距">
        <NumInput value={c.stirrup.spacingSparse} onChange={(v) => update({ stirrup: { ...c.stirrup, spacingSparse: v } })} suffix="mm" />
      </Field>
      <Field label="复合形式">
        <select value={c.stirrup.composite} onChange={(e) => update({ stirrup: { ...c.stirrup, composite: e.target.value as any } })}>
          <option value="rect">矩形单箍</option>
          <option value="jing">井字复合箍</option>
          <option value="diamond">菱形 (TODO)</option>
        </select>
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field-row">
      <label>{label}</label>
      {children}
    </div>
  );
}
function NumInput({ value, onChange, suffix }: { value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div className="flex-1 flex items-center gap-1">
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
      {suffix && <span className="text-slate-500 text-xs">{suffix}</span>}
    </div>
  );
}
function GradeSelect({ value, onChange }: { value: RebarGrade; onChange: (g: RebarGrade) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as RebarGrade)}>
      <option value="HPB300">HPB300 (Φ)</option>
      <option value="HRB400">HRB400 (C)</option>
      <option value="HRB500">HRB500 (D)</option>
    </select>
  );
}
