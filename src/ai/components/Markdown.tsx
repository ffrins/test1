import { useMemo } from 'react';

/**
 * 极简 Markdown 渲染: 支持 ```code blocks```、`inline`、**bold**、*italic*、# 标题、- 列表。
 * 不依赖外部库, 满足 chat 场景基础需求。
 */
export function Markdown({ text }: { text: string }) {
  const blocks = useMemo(() => parse(text), [text]);
  return (
    <div className="text-sm leading-relaxed text-on-surface space-y-2">
      {blocks.map((b, i) => renderBlock(b, i))}
    </div>
  );
}

type Block =
  | { type: 'code'; lang?: string; content: string }
  | { type: 'h'; level: number; content: string }
  | { type: 'list'; items: string[] }
  | { type: 'p'; content: string };

function parse(text: string): Block[] {
  const blocks: Block[] = [];
  const lines = text.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // code block
    const m = line.match(/^```(\w*)\s*$/);
    if (m) {
      const lang = m[1] || undefined;
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      i++; // 跳过结尾 ```
      blocks.push({ type: 'code', lang, content: buf.join('\n') });
      continue;
    }
    // header
    const h = line.match(/^(#{1,6})\s+(.+)$/);
    if (h) {
      blocks.push({ type: 'h', level: h[1].length, content: h[2] });
      i++;
      continue;
    }
    // list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'list', items });
      continue;
    }
    // blank
    if (line.trim() === '') {
      i++;
      continue;
    }
    // paragraph (合并连续非空行)
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !/^```/.test(lines[i]) && !/^#{1,6}\s/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push({ type: 'p', content: buf.join('\n') });
  }
  return blocks;
}

function renderBlock(b: Block, key: number) {
  switch (b.type) {
    case 'code':
      return (
        <pre key={key} className="bg-surface-container-lowest border border-outline-variant/30 rounded p-2 overflow-x-auto text-xs font-mono text-on-surface">
          <code>{b.content}</code>
        </pre>
      );
    case 'h': {
      const sizes = ['text-lg', 'text-base', 'text-sm', 'text-sm', 'text-xs', 'text-xs'];
      const cls = `font-bold text-primary ${sizes[Math.min(b.level - 1, 5)]}`;
      return <div key={key} className={cls}>{renderInline(b.content)}</div>;
    }
    case 'list':
      return (
        <ul key={key} className="list-disc pl-5 space-y-0.5">
          {b.items.map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ))}
        </ul>
      );
    case 'p':
      return <p key={key} className="whitespace-pre-wrap break-words">{renderInline(b.content)}</p>;
  }
}

/** 行内格式: **bold**, *italic*, `code` */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\*([^*]+)\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<strong key={key++} className="font-semibold text-on-surface">{m[2]}</strong>);
    else if (m[3]) parts.push(<code key={key++} className="px-1 py-0.5 bg-surface-container-lowest rounded font-mono text-xs text-secondary">{m[4]}</code>);
    else if (m[5]) parts.push(<em key={key++}>{m[6]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
