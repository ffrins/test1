// 用 Vite 的 ?raw 后缀以纯字符串方式导入 markdown 文件
import anchorage from './anchorage.md?raw';
import beam from './beam-construction.md?raw';
import column from './column-construction.md?raw';
import stirrup from './stirrup-rules.md?raw';

export interface KnowledgeDoc {
  key: string;
  title: string;
  content: string;
}

export const KNOWLEDGE_BASE: KnowledgeDoc[] = [
  { key: 'anchorage', title: '锚固长度', content: anchorage },
  { key: 'beam', title: '梁配筋构造', content: beam },
  { key: 'column', title: '柱配筋构造', content: column },
  { key: 'stirrup', title: '箍筋规则', content: stirrup },
];

/** 把整个知识库拼成 system prompt 的引用部分 */
export function getKnowledgePrompt(): string {
  return KNOWLEDGE_BASE.map(
    (d) => `### ${d.title}\n\n${d.content.trim()}`
  ).join('\n\n---\n\n');
}
