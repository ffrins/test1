/**
 * AI 平法学习助手 - 类型定义
 */

export interface AIModelConfig {
  /** 显示名 */
  name: string;
  /** 调用 model 字段, 如 "deepseek-chat" */
  id: string;
  /** 服务商标识 */
  provider: 'deepseek' | 'moonshot' | 'qwen' | 'glm' | 'baidu' | 'custom';
  /** OpenAI 兼容 baseUrl, 末尾不带 /chat/completions */
  baseUrl: string;
  /** 上下文最大 token */
  contextLength: number;
  /** 是否支持深度推理 */
  supportsReasoning?: boolean;
}

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  /** reasoner 模型的思考链 */
  reasoning?: string;
  /** 是否仍在流式生成 */
  streaming?: boolean;
  /** 错误信息 */
  error?: string;
  /** 创建时间戳 */
  ts: number;
}

/** 当前 3D 场景中选中钢筋/构件的上下文片段 */
export interface SceneContext {
  kind: 'beam' | 'column' | 'wall';
  memberId: string;
  /** 当前选中钢筋的角色, 如 "上部通长筋", "支座负筋" */
  selectedRole?: string;
  /** 选中钢筋直径 mm */
  selectedDiameter?: number;
  /** 选中钢筋等级 */
  selectedGrade?: string;
  /** 选中钢筋长度 mm */
  selectedLength?: number;
  /** 构件主要参数摘要 (one-line) */
  summary: string;
}
