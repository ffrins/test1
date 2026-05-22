import { BeamParams, ColumnParams, WallParams } from '@/geometry/types';
import { getKnowledgePrompt } from './knowledge';
import { SceneContext } from './types';

/** 系统级 prompt: 角色 + 行为约束 + 知识库注入 */
export function buildSystemPrompt(): string {
  return [
    `你是【智筋 AI】, 一名精通 22G101-1《混凝土结构施工图平面整体表示方法制图规则和构造详图》的结构工程助手。`,
    ``,
    `回答原则:`,
    `1. 优先依据下方"参考知识库"作答; 必要时给出图集条号或公式推导。`,
    `2. 涉及具体构件时, 务必引用用户提供的"当前场景上下文"中的实测数值。`,
    `3. 计算结果给出公式 + 代入 + 数值; 不确定时明确说明。`,
    `4. 回答末尾追加一行小字: "*以上回答仅供参考, 应以 22G101-1 图集原文为准。*"`,
    `5. 使用 Markdown 输出, 中文为主。`,
    ``,
    `## 参考知识库`,
    ``,
    getKnowledgePrompt(),
  ].join('\n');
}

/** 把 store 中当前选中的构件参数压成上下文摘要 */
export function buildSceneContext(args: {
  kind: 'beam' | 'column' | 'wall';
  beam: BeamParams;
  column: ColumnParams;
  wall: WallParams;
  selected: { role: string; length: number; diameter: number; grade: string } | null;
}): SceneContext {
  const { kind, beam, column, wall, selected } = args;
  let summary = '';
  let memberId = '';
  if (kind === 'beam') {
    memberId = beam.id;
    summary = `${beam.type} ${beam.id}, b×h=${beam.b}×${beam.h}, 跨${beam.span}, ${beam.concrete}, 抗震${beam.seismicLevel}级, 保护层${beam.cover}; 上部通长${beam.topThrough.count}${beam.topThrough.grade.replace('HRB', 'C').replace('HPB', 'A')}${beam.topThrough.diameter}, 下部${beam.bottom.count}${beam.bottom.grade.replace('HRB', 'C').replace('HPB', 'A')}${beam.bottom.diameter}, 箍${beam.stirrup.diameter}@${beam.stirrup.spacingDense}/${beam.stirrup.spacingSparse}(${beam.stirrup.legs}肢)`;
  } else if (kind === 'column') {
    memberId = column.id;
    summary = `${column.type} ${column.id}, b×h=${column.b}×${column.h}, 高${column.height}, ${column.concrete}, 抗震${column.seismicLevel}级, 保护层${column.cover}; 纵筋b边${column.longitudinal.nB}×h边${column.longitudinal.nH}根 d=${column.longitudinal.diameter} ${column.longitudinal.grade}, 箍${column.stirrup.diameter}@${column.stirrup.spacingDense}/${column.stirrup.spacingSparse}(${column.stirrup.composite ?? '普通'})`;
  } else {
    memberId = wall.id;
    summary = `${wall.type} ${wall.id}, L×H×t=${wall.length}×${wall.height}×${wall.thickness}, ${wall.concrete}, 抗震${wall.seismicLevel}级; 竖向${wall.vertical.grade} d${wall.vertical.diameter}@${wall.vertical.spacing}, 水平${wall.horizontal.grade} d${wall.horizontal.diameter}@${wall.horizontal.spacing}`;
  }
  return {
    kind,
    memberId,
    selectedRole: selected?.role,
    selectedDiameter: selected?.diameter,
    selectedGrade: selected?.grade,
    selectedLength: selected?.length,
    summary,
  };
}

/** 在用户消息前插入一段 "当前场景上下文" 让模型对齐 */
export function decorateUserMessage(input: string, ctx: SceneContext | null): string {
  if (!ctx) return input;
  const lines = [
    `【当前场景上下文】`,
    `构件: ${ctx.summary}`,
  ];
  if (ctx.selectedRole) {
    lines.push(
      `选中钢筋: ${ctx.selectedRole} (d=${ctx.selectedDiameter}mm, 等级=${ctx.selectedGrade}${ctx.selectedLength ? `, 长度=${ctx.selectedLength}mm` : ''})`
    );
  }
  lines.push(``, `【用户提问】`, input);
  return lines.join('\n');
}
