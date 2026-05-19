import { ConcreteGrade, RebarGrade, SeismicLevel } from '@/codes/rebar';

export interface RebarLine {
  grade: RebarGrade;
  diameter: number;
  /** 多段折线（mm，世界坐标），按顺序连接，端点自动加弯钩需另行追加 */
  points: [number, number, number][];
  role: string; // 例如 "上部通长" / "下部纵筋" / "支座负筋" / "侧面构造筋"
  length: number; // 实际下料长度 mm
}

export interface StirrupShape {
  /** 沿梁长方向布置的中心 X 坐标 (mm) */
  positions: number[];
  /** 一根箍筋的闭合曲线点（在 YZ 截面平面内，外加 135° 弯钩段） */
  loop: [number, number, number][];
  diameter: number;
  grade: RebarGrade;
  /** 区段：加密 / 非加密（用于 3D 颜色区分） */
  zone?: 'dense' | 'sparse';
}

export interface BeamParams {
  id: string;
  type: 'KL' | 'L';
  /** 单跨净跨 Ln (mm)。当 spans 存在且非空时被忽略 */
  span: number;
  /** 多跨净跨数组。长度 ≥ 2 时启用多跨模式 */
  spans?: number[];
  /** 中间支座宽度数组。长度通常 = spans.length - 1; 不足时按 500mm 补齐 */
  interiorSupports?: { width: number }[];
  b: number; // 截面宽
  h: number; // 截面高(左端高)
  /** 变截面: 右端高 h1。仅当存在且 != h 时启用渐变 */
  h1?: number;
  /** 截面过渡形式 */
  transition?: 'linear' | 'step';
  cover: number; // 保护层 mm
  concrete: ConcreteGrade;
  seismicLevel: SeismicLevel;
  // 上部通长筋
  topThrough: { grade: RebarGrade; diameter: number; count: number };
  // 下部纵筋（一排）
  bottom: { grade: RebarGrade; diameter: number; count: number };
  // 侧面构造筋 G (每侧根数)
  sideG?: { grade: RebarGrade; diameter: number; countPerSide: number };
  /** 支座负筋(仅多跨中间支座, 简化: 单排, 自支座中心向两侧延伸 max(Ln_l,Ln_r)/3) */
  supportNeg?: { grade: RebarGrade; diameter: number; count: number };
  // 箍筋
  stirrup: {
    grade: RebarGrade;
    diameter: number;
    spacingDense: number;
    spacingSparse: number;
    legs: number; // 肢数
  };
  // 支座
  leftSupport: { width: number };
  rightSupport: { width: number };
}

export interface ColumnParams {
  id: string;
  type: 'KZ';
  height: number; // 楼层净高 Hn
  b: number;
  h: number;
  cover: number;
  concrete: ConcreteGrade;
  seismicLevel: SeismicLevel;
  longitudinal: {
    grade: RebarGrade;
    diameter: number;
    nB: number; // b 边根数 (含角筋)
    nH: number; // h 边根数 (含角筋)
  };
  stirrup: {
    grade: RebarGrade;
    diameter: number;
    spacingDense: number;
    spacingSparse: number;
    composite: 'rect' | 'jing' | 'diamond'; // 矩形 / 井字 / 菱形
  };
  isBottom: boolean;
}

export interface WallParams {
  id: string;
  type: 'Q';
  length: number; // 墙长 L (mm)
  height: number; // 墙高 H (mm)
  thickness: number; // 墙厚 t (mm)
  cover: number;
  concrete: ConcreteGrade;
  seismicLevel: SeismicLevel;
  /** 竖向分布筋(双排) */
  vertical: { grade: RebarGrade; diameter: number; spacing: number };
  /** 水平分布筋(双排) */
  horizontal: { grade: RebarGrade; diameter: number; spacing: number };
  /** 拉筋: 梅花布置, 水平/竖向间距 */
  tie: { grade: RebarGrade; diameter: number; spacingX: number; spacingY: number; enabled: boolean };
}

export interface BuiltGeometry {
  rebars: RebarLine[];
  stirrups: StirrupShape[];
  concrete: { size: [number, number, number]; center: [number, number, number] };
  /** 周边支座/相邻构件 (用于上下文显示，例如梁两端的柱) */
  supports?: { size: [number, number, number]; center: [number, number, number]; label?: string }[];
}
