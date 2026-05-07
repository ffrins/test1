import { useState } from 'react';
import { parseBeamPingfa } from '@/parser/beamPingfa';
import { useStore } from '@/store/useStore';

const EXAMPLES = [
  'KL2(2A) 300×700  Φ10@100/200(4)  2C25;4C25  G4C12',
  'KL1(1) 250×600 Φ8@100/200(2) 2C22;3C22',
  'KL3(3) 350×750 C10@100/200(4) 2C25;5C25 G6C14',
];

export function PlainTextInput() {
  const update = useStore((s) => s.updateBeam);
  const [text, setText] = useState(EXAMPLES[0]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const apply = () => {
    const { patch, warnings } = parseBeamPingfa(text);
    update(patch);
    setWarnings(warnings);
  };

  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-400">粘贴平法标注，自动填表 (仅梁)</div>
      <textarea
        className="w-full h-20 bg-slate-800 border border-slate-700 rounded p-2 text-sm font-mono"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={apply}>解析并应用</button>
        <select
          className="bg-slate-800 border border-slate-700 rounded px-2 text-xs"
          onChange={(e) => setText(e.target.value)}
          value=""
        >
          <option value="" disabled>插入示例…</option>
          {EXAMPLES.map((ex) => (
            <option key={ex} value={ex}>{ex}</option>
          ))}
        </select>
      </div>
      {warnings.length > 0 && (
        <ul className="text-xs text-amber-400 list-disc pl-5">
          {warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
