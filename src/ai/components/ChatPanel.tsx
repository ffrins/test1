import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/ui/Icon';
import { useStore } from '@/store/useStore';
import { useAIStore } from '../store/ai-store';
import { ModelSelector } from './ModelSelector';
import { ApiKeyConfig } from './ApiKeyConfig';
import { Markdown } from './Markdown';
import { streamChat, toApiMessages } from '../adapter';
import { buildSceneContext, buildSystemPrompt, decorateUserMessage } from '../context-builder';
import { ChatMessage } from '../types';

const SUGGESTIONS = [
  '当前梁的加密区是怎么算的？',
  '这个配筋符合 22G101 规范吗？',
  '一级抗震 KL 梁的箍筋肢距应≤多少？',
  '解释 LaE 抗震锚固长度的计算公式',
];

export function ChatPanel() {
  const open = useAIStore((s) => s.open);
  const setOpen = useAIStore((s) => s.setOpen);
  const messages = useAIStore((s) => s.messages);
  const append = useAIStore((s) => s.appendMessage);
  const update = useAIStore((s) => s.updateMessage);
  const clear = useAIStore((s) => s.clearMessages);
  const models = useAIStore((s) => s.models);
  const activeId = useAIStore((s) => s.activeModelId);
  const apiKeys = useAIStore((s) => s.apiKeys);
  const isStreaming = useAIStore((s) => s.isStreaming);
  const setStreaming = useAIStore((s) => s.setStreaming);
  const abortRef = useAIStore((s) => s.abortRef);
  const pending = useAIStore((s) => s.pendingInput);
  const setPending = useAIStore((s) => s.setPendingInput);

  const kind = useStore((s) => s.kind);
  const beam = useStore((s) => s.beam);
  const column = useStore((s) => s.column);
  const wall = useStore((s) => s.wall);
  const selected = useStore((s) => s.selected);

  const [input, setInput] = useState('');
  const [keyConfigOpen, setKeyConfigOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 处理外部预填 (来自 Inspector 的 "问 AI")
  useEffect(() => {
    if (pending) {
      setInput(pending);
      setPending('');
    }
  }, [pending, setPending]);

  // 自动滚到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!open) return null;

  const activeModel = models.find((m) => m.id === activeId);
  const apiKey = activeModel ? apiKeys[activeModel.provider] ?? '' : '';

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming || !activeModel) return;
    if (!apiKey) {
      setKeyConfigOpen(true);
      return;
    }
    const ctx = buildSceneContext({ kind, beam, column, wall, selected });
    const decorated = decorateUserMessage(text, ctx);
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: decorated,
      ts: Date.now(),
    };
    const aiMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: '',
      reasoning: '',
      streaming: true,
      ts: Date.now(),
    };
    append(userMsg);
    append(aiMsg);
    setInput('');
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const apiMsgs = toApiMessages(buildSystemPrompt(), [...messages, userMsg]);
    await streamChat(activeModel, apiKey, apiMsgs, {
      signal: ctrl.signal,
      onDelta: (d) => {
        // 使用最新值拼接
        const cur = useAIStore.getState().messages.find((m) => m.id === aiMsg.id);
        update(aiMsg.id, { content: (cur?.content ?? '') + d });
      },
      onReasoning: (d) => {
        const cur = useAIStore.getState().messages.find((m) => m.id === aiMsg.id);
        update(aiMsg.id, { reasoning: (cur?.reasoning ?? '') + d });
      },
      onDone: () => {
        update(aiMsg.id, { streaming: false });
        setStreaming(false);
        abortRef.current = null;
      },
      onError: (err) => {
        update(aiMsg.id, { streaming: false, error: err.message });
        setStreaming(false);
        abortRef.current = null;
      },
    });
  };

  const handleAbort = () => {
    abortRef.current?.abort();
  };

  return (
    <>
      <aside
        className="fixed right-0 top-0 h-full w-[420px] bg-surface-container-low border-l border-outline-variant/30 shadow-2xl flex flex-col z-40 animate-[slideIn_.2s_ease-out]"
        style={{ animation: 'slideIn .2s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-12 border-b border-outline-variant/20 shrink-0">
          <div className="flex items-center gap-2">
            <Icon name="smart_toy" className="text-primary !text-xl" />
            <span className="font-bold text-on-surface text-sm">智筋 AI · 平法学习助手</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 hover:bg-surface-variant rounded text-on-surface-variant hover:text-primary"
          >
            <Icon name="close" className="!text-[18px]" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-outline-variant/10 shrink-0">
          <ModelSelector />
          <button
            onClick={() => setKeyConfigOpen(true)}
            title="API Key"
            className="p-1.5 hover:bg-surface-variant rounded text-on-surface-variant hover:text-primary"
          >
            <Icon name="key" className="!text-[18px]" />
          </button>
          <div className="flex-1" />
          <button
            onClick={clear}
            title="清空对话"
            disabled={messages.length === 0}
            className="p-1.5 hover:bg-surface-variant rounded text-on-surface-variant hover:text-primary disabled:opacity-30"
          >
            <Icon name="delete_sweep" className="!text-[18px]" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-center mt-12 px-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                <Icon name="auto_awesome" className="text-primary !text-[32px]" />
              </div>
              <h3 className="text-sm font-bold text-on-surface mb-1">嗨，我是智筋 AI</h3>
              <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
                基于 22G101-1 图集知识库, 解答你关于平法、配筋、构造的疑问。
              </p>
              <div className="space-y-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="block w-full text-left text-xs text-on-surface-variant bg-surface-container-lowest hover:bg-surface-variant px-3 py-2 rounded border border-outline-variant/20 hover:border-primary/30 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => (
            <MessageBubble key={m.id} m={m} />
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-outline-variant/20 p-3 shrink-0">
          {!apiKey && (
            <div className="mb-2 text-xs text-tertiary flex items-center gap-1">
              <Icon name="info" className="!text-sm" />
              请先在 <button onClick={() => setKeyConfigOpen(true)} className="underline hover:text-primary">API Key 设置</button> 中填入 {activeModel?.name} 的 Key
            </div>
          )}
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="请输入你的问题... (Enter 发送, Shift+Enter 换行)"
              rows={2}
              className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50 resize-none"
            />
            {isStreaming ? (
              <button
                onClick={handleAbort}
                className="px-3 py-2 bg-tertiary text-on-surface rounded text-sm font-bold hover:opacity-90"
                title="中断"
              >
                <Icon name="stop" className="!text-[20px]" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="px-3 py-2 bg-primary text-on-primary rounded text-sm font-bold disabled:opacity-30 hover:shadow-md disabled:pointer-events-none"
                title="发送 (Enter)"
              >
                <Icon name="send" className="!text-[20px]" />
              </button>
            )}
          </div>
        </div>
      </aside>
      <ApiKeyConfig open={keyConfigOpen} onClose={() => setKeyConfigOpen(false)} />
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </>
  );
}

function MessageBubble({ m }: { m: ChatMessage }) {
  const isUser = m.role === 'user';
  // 用户消息可能含 "【当前场景上下文】" 段, 折叠显示
  const userMain = isUser ? extractUserMain(m.content) : m.content;
  const userCtx = isUser ? extractUserCtx(m.content) : null;

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] bg-primary/15 border border-primary/20 rounded-lg px-3 py-2 text-sm text-on-surface">
          {userCtx && (
            <details className="mb-1 text-[11px] text-on-surface-variant">
              <summary className="cursor-pointer hover:text-primary">📎 已附带场景上下文</summary>
              <pre className="mt-1 whitespace-pre-wrap font-mono text-[11px] opacity-80">{userCtx}</pre>
            </details>
          )}
          <div className="whitespace-pre-wrap break-words">{userMain}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-3 py-2">
        {m.reasoning && (
          <details className="mb-2 text-[11px] text-on-surface-variant border-l-2 border-secondary/30 pl-2">
            <summary className="cursor-pointer hover:text-secondary">💭 思考过程</summary>
            <div className="mt-1 whitespace-pre-wrap opacity-80">{m.reasoning}</div>
          </details>
        )}
        {m.content ? <Markdown text={m.content} /> : (
          m.streaming && <span className="text-on-surface-variant text-xs">思考中...</span>
        )}
        {m.error && (
          <div className="mt-2 text-xs text-tertiary border border-tertiary/30 bg-tertiary/10 rounded p-2">
            ⚠ {m.error}
          </div>
        )}
        {m.streaming && m.content && <span className="inline-block w-1.5 h-3.5 bg-primary ml-0.5 align-middle animate-pulse" />}
      </div>
    </div>
  );
}

function extractUserMain(s: string): string {
  const idx = s.indexOf('【用户提问】');
  if (idx >= 0) return s.slice(idx + '【用户提问】'.length).trim();
  return s;
}
function extractUserCtx(s: string): string | null {
  const start = s.indexOf('【当前场景上下文】');
  const end = s.indexOf('【用户提问】');
  if (start >= 0 && end > start) {
    return s.slice(start + '【当前场景上下文】'.length, end).trim();
  }
  return null;
}
