import { AIModelConfig, ChatMessage } from './types';

interface StreamCallbacks {
  /** 主回答增量 */
  onDelta: (delta: string) => void;
  /** Reasoner 思考链增量 (deepseek-reasoner) */
  onReasoning?: (delta: string) => void;
  onDone: () => void;
  onError: (err: Error) => void;
  /** 用于外部取消 */
  signal?: AbortSignal;
}

/**
 * 调用 OpenAI 兼容 /chat/completions 流式接口.
 * 国内 DeepSeek / Kimi / Qwen / GLM 全部兼容此协议.
 */
export async function streamChat(
  config: AIModelConfig,
  apiKey: string,
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  cb: StreamCallbacks
): Promise<void> {
  if (!apiKey) {
    cb.onError(new Error(`未配置 ${config.name} 的 API Key`));
    return;
  }
  const url = `${config.baseUrl.replace(/\/$/, '')}/chat/completions`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.id,
        messages,
        stream: true,
        temperature: 0.3,
      }),
      signal: cb.signal,
    });

    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => '');
      cb.onError(new Error(`HTTP ${res.status} ${res.statusText}\n${text}`));
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      // SSE 按 \n\n 分割 event
      const parts = buffer.split('\n\n');
      buffer = parts.pop() ?? '';
      for (const part of parts) {
        const line = part.trim();
        if (!line || !line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (payload === '[DONE]') {
          cb.onDone();
          return;
        }
        try {
          const json = JSON.parse(payload);
          const choice = json.choices?.[0];
          const delta = choice?.delta;
          if (delta?.reasoning_content && cb.onReasoning) {
            cb.onReasoning(delta.reasoning_content);
          }
          if (delta?.content) {
            cb.onDelta(delta.content);
          }
        } catch {
          // 部分 chunk 可能不完整, 忽略
        }
      }
    }
    cb.onDone();
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      cb.onDone();
    } else {
      cb.onError(e instanceof Error ? e : new Error(String(e)));
    }
  }
}

/** 把内部 ChatMessage[] 转为 OpenAI 标准格式 */
export function toApiMessages(
  systemPrompt: string,
  history: ChatMessage[]
): { role: 'system' | 'user' | 'assistant'; content: string }[] {
  const arr: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemPrompt },
  ];
  for (const m of history) {
    if (m.role === 'system') continue;
    if (m.error) continue;
    arr.push({ role: m.role, content: m.content });
  }
  return arr;
}
