import { useAIStore } from '../store/ai-store';

export function ModelSelector() {
  const models = useAIStore((s) => s.models);
  const activeId = useAIStore((s) => s.activeModelId);
  const setActive = useAIStore((s) => s.setActiveModel);

  return (
    <select
      value={activeId}
      onChange={(e) => setActive(e.target.value)}
      className="bg-surface-container-low border border-outline-variant/30 rounded px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary/50"
      title="切换 AI 模型"
    >
      {models.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}
        </option>
      ))}
    </select>
  );
}
