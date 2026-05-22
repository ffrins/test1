import { useState } from 'react';
import { useAIStore } from '../store/ai-store';
import { Icon } from '@/ui/Icon';

interface Props {
  open: boolean;
  onClose: () => void;
}

const PROVIDER_LABEL: Record<string, string> = {
  deepseek: 'DeepSeek',
  moonshot: 'Kimi (Moonshot)',
  qwen: '通义千问 (DashScope)',
  glm: '智谱 GLM',
  baidu: '百度文心',
  custom: '自定义',
};

export function ApiKeyConfig({ open, onClose }: Props) {
  const apiKeys = useAIStore((s) => s.apiKeys);
  const setApiKey = useAIStore((s) => s.setApiKey);
  const models = useAIStore((s) => s.models);
  const [reveal, setReveal] = useState<Record<string, boolean>>({});

  if (!open) return null;
  // 出现过的 provider 列表
  const providers = Array.from(new Set(models.map((m) => m.provider)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-[520px] max-h-[80vh] overflow-auto bg-surface-container-low border border-outline-variant/30 rounded-lg shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Icon name="key" className="text-primary !text-xl" />
            <h2 className="text-base font-bold text-on-surface">API Key 配置</h2>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-primary p-1 rounded">
            <Icon name="close" className="!text-[18px]" />
          </button>
        </div>

        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
          API Key 仅保存在浏览器 localStorage 中, 不会上传到任何服务器。模型调用为前端直连官方端点 (HTTPS)。
        </p>

        <div className="space-y-3">
          {providers.map((p) => (
            <div key={p}>
              <label className="block text-xs text-on-surface-variant mb-1">
                {PROVIDER_LABEL[p] ?? p}
              </label>
              <div className="flex gap-1">
                <input
                  type={reveal[p] ? 'text' : 'password'}
                  value={apiKeys[p] ?? ''}
                  onChange={(e) => setApiKey(p, e.target.value)}
                  placeholder="sk-..."
                  className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50 font-mono"
                />
                <button
                  onClick={() => setReveal((r) => ({ ...r, [p]: !r[p] }))}
                  className="px-2 text-on-surface-variant hover:text-primary"
                  title={reveal[p] ? '隐藏' : '显示'}
                >
                  <Icon name={reveal[p] ? 'visibility_off' : 'visibility'} className="!text-[18px]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="btn-primary">
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
