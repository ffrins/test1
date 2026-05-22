import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_MODELS } from '../model-config';
import { AIModelConfig, ChatMessage } from '../types';

interface AIStore {
  /** 面板是否打开 */
  open: boolean;
  setOpen: (v: boolean) => void;
  togglePanel: () => void;

  /** 模型列表 (持久化) */
  models: AIModelConfig[];
  /** 当前选中的模型 id */
  activeModelId: string;
  /** 各 provider 的 API Key (持久化) */
  apiKeys: Record<string, string>;
  setActiveModel: (id: string) => void;
  setApiKey: (provider: string, key: string) => void;
  upsertModel: (m: AIModelConfig) => void;
  removeModel: (id: string) => void;

  /** 当前会话消息 (不持久化, 刷新清空) */
  messages: ChatMessage[];
  appendMessage: (m: ChatMessage) => void;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
  clearMessages: () => void;

  /** 待发送的预填文本 (从 3D 选中后由 Inspector 触发) */
  pendingInput: string;
  setPendingInput: (v: string) => void;

  /** 当前是否正在请求 */
  isStreaming: boolean;
  setStreaming: (v: boolean) => void;
  /** 流式中断控制器 */
  abortRef: { current: AbortController | null };
}

const STORAGE_KEY = 'zhijin-ai-config-v1';

export const useAIStore = create<AIStore>()(
  persist(
    (set, get) => ({
      open: false,
      setOpen: (v) => set({ open: v }),
      togglePanel: () => set({ open: !get().open }),

      models: DEFAULT_MODELS,
      activeModelId: DEFAULT_MODELS[0].id,
      apiKeys: {},
      setActiveModel: (id) => set({ activeModelId: id }),
      setApiKey: (provider, key) => set({ apiKeys: { ...get().apiKeys, [provider]: key } }),
      upsertModel: (m) =>
        set((s) => {
          const idx = s.models.findIndex((x) => x.id === m.id);
          const next = [...s.models];
          if (idx >= 0) next[idx] = m;
          else next.push(m);
          return { models: next };
        }),
      removeModel: (id) =>
        set((s) => ({
          models: s.models.filter((m) => m.id !== id),
          activeModelId: s.activeModelId === id ? s.models[0]?.id ?? '' : s.activeModelId,
        })),

      messages: [],
      appendMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
      updateMessage: (id, patch) =>
        set((s) => ({
          messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      clearMessages: () => set({ messages: [] }),

      pendingInput: '',
      setPendingInput: (v) => set({ pendingInput: v }),

      isStreaming: false,
      setStreaming: (v) => set({ isStreaming: v }),
      abortRef: { current: null },
    }),
    {
      name: STORAGE_KEY,
      // 仅持久化模型列表 + apiKeys + activeModelId, 不持久化对话/UI 状态
      partialize: (s) => ({
        models: s.models,
        activeModelId: s.activeModelId,
        apiKeys: s.apiKeys,
      }) as any,
    }
  )
);
