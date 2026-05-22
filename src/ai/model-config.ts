import { AIModelConfig } from './types';

/**
 * 默认支持的 AI 模型列表 (OpenAI 兼容格式).
 * 用户可在设置中追加 / 修改, 持久化到 localStorage.
 */
export const DEFAULT_MODELS: AIModelConfig[] = [
  {
    name: 'DeepSeek V3 (chat)',
    id: 'deepseek-chat',
    provider: 'deepseek',
    baseUrl: 'https://api.deepseek.com/v1',
    contextLength: 64000,
  },
  {
    name: 'DeepSeek R1 (reasoner)',
    id: 'deepseek-reasoner',
    provider: 'deepseek',
    baseUrl: 'https://api.deepseek.com/v1',
    contextLength: 64000,
    supportsReasoning: true,
  },
  {
    name: 'Kimi (moonshot-v1-32k)',
    id: 'moonshot-v1-32k',
    provider: 'moonshot',
    baseUrl: 'https://api.moonshot.cn/v1',
    contextLength: 32000,
  },
  {
    name: '通义千问 Plus (qwen-plus)',
    id: 'qwen-plus',
    provider: 'qwen',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    contextLength: 32000,
  },
  {
    name: 'GLM-4 (glm-4-flash)',
    id: 'glm-4-flash',
    provider: 'glm',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    contextLength: 128000,
  },
];
