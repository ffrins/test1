import { useStore } from '@/store/useStore';
import { ConcreteGrade, RebarGrade, SeismicLevel } from '@/codes/rebar';

export function BeamForm() {
  const beam = useStore((s) => s.beam);
  const update = useStore((s) => s.updateBeam);

  return (
    <div className="space-y-2">
      <div className="section-title">基本信息</div>
      <Field label="编号">
        <input value={beam.id} onChange={(e) => update({ id: e.target.value })} />
      </Field>
      <Field label="净跨 Ln">
        <NumInput value={beam.span} onChange={(v) => update({ span: v })} suffix="mm" />
      </Field>
      <Field label="截面 b">
        <NumInput value={beam.b} onChange={(v) => update({ b: v })} suffix="mm" />
      </Field>
      <Field label="截面 h">
        <NumInput value={beam.h} onChange={(v) => update({ h: v })} suffix="mm" />
      </Field>
      <Field label="保护层 c">
        <NumInput value={beam.cover} onChange={(v) => update({ cover: v })} suffix="mm" />
      </Field>
      <Field label="混凝土">
        <select value={beam.concrete} onChange={(e) => update({ concrete: e.target.value as ConcreteGrade })}>
          {(['C25', 'C30', 'C35', 'C40', 'C45', 'C50'] as ConcreteGrade[]).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </Field>
      <Field label="抗震等级">
        <select
          value={String(beam.seismicLevel)}
          onChange={(e) => update({ seismicLevel: e.target.value === 'null' ? null : (Number(e.target.value) as SeismicLevel) })}
        >
          <option value="1">一级</option>
          <option value="2">二级</option>
          <option value="3">三级</option>
          <option value="4">四级</option>
          <option value="null">非抗震</option>
        </select>
      </Field>

      <div className="section-title">支座</div>
      <Field label="左支座宽">
        <NumInput value={beam.leftSupport.width} onChange={(v) => update({ leftSupport: { width: v } })} suffix="mm" />
      </Field>
      <Field label="右支座宽">
        <NumInput value={beam.rightSupport.width} onChange={(v) => update({ rightSupport: { width: v } })} suffix="mm" />
      </Field>

      <div className="section-title">上部通长筋</div>
      <RebarRow
        spec={beam.topThrough}
        onChange={(s) => update({ topThrough: s })}
      />

      <div className="section-title">下部纵筋</div>
      <RebarRow
        spec={beam.bottom}
        onChange={(s) => update({ bottom: s })}
      />

      <div className="section-title">箍筋</div>
      <Field label="等级">
        <GradeSelect value={beam.stirrup.grade} onChange={(g) => update({ stirrup: { ...beam.stirrup, grade: g } })} />
      </Field>
      <Field label="直径">
        <NumInput value={beam.stirrup.diameter} onChange={(v) => update({ stirrup: { ...beam.stirrup, diameter: v } })} suffix="mm" />
      </Field>
      <Field label="加密间距">
        <NumInput value={beam.stirrup.spacingDense} onChange={(v) => update({ stirrup: { ...beam.stirrup, spacingDense: v } })} suffix="mm" />
      </Field>
      <Field label="非加密间距">
        <NumInput value={beam.stirrup.spacingSparse} onChange={(v) => update({ stirrup: { ...beam.stirrup, spacingSparse: v } })} suffix="mm" />
      </Field>
      <Field label="肢数">
        <NumInput value={beam.stirrup.legs} onChange={(v) => update({ stirrup: { ...beam.stirrup, legs: v } })} />
      </Field>

      <div className="section-title">侧面构造筋 G (每侧)</div>
      <Field label="根数/侧">
        <NumInput
          value={beam.sideG?.countPerSide ?? 0}
          onChange={(v) => update({ sideG: { ...(beam.sideG ?? { grade: 'HRB400', diameter: 12, countPerSide: 0 }), countPerSide: v } })}
        />
      </Field>
      <Field label="规格">
        <div className="flex gap-1 flex-1">
          <GradeSelect
            value={beam.sideG?.grade ?? 'HRB400'}
            onChange={(g) => update({ sideG: { ...(beam.sideG ?? { countPerSide: 0, diameter: 12 }), grade: g } as any })}
          />
          <NumInput
            value={beam.sideG?.diameter ?? 12}
            onChange={(v) => update({ sideG: { ...(beam.sideG ?? { countPerSide: 0, grade: 'HRB400' }), diameter: v } as any })}
            suffix="mm"
          />
        </div>
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
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
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

function RebarRow({
  spec,
  onChange,
}: {
  spec: { grade: RebarGrade; diameter: number; count: number };
  onChange: (s: { grade: RebarGrade; diameter: number; count: number }) => void;
}) {
  return (
    <>
      <Field label="根数">
        <NumInput value={spec.count} onChange={(v) => onChange({ ...spec, count: v })} />
      </Field>
      <Field label="等级">
        <GradeSelect value={spec.grade} onChange={(g) => onChange({ ...spec, grade: g })} />
      </Field>
      <Field label="直径">
        <NumInput value={spec.diameter} onChange={(v) => onChange({ ...spec, diameter: v })} suffix="mm" />
      </Field>
    </>
  );
}
