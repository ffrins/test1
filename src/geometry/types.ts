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
}

export interface BeamParams {
  id: string;
  type: 'KL' | 'L';
  span: number; // 净跨 Ln (mm)
  b: number; // 截面宽
  h: number; // 截面高
  cover: number; // 保护层 mm
  concrete: ConcreteGrade;
  seismicLevel: SeismicLevel;
  // 上部通长筋
  topThrough: { grade: RebarGrade; diameter: number; count: number };
  // 下部纵筋（一排）
  bottom: { grade: RebarGrade; diameter: number; count: number };
  // 侧面构造筋 G (每侧根数)
  sideG?: { grade: RebarGrade; diameter: number; countPerSide: number };
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

export interface BuiltGeometry {
  rebars: RebarLine[];
  stirrups: StirrupShape[];
  concrete: { size: [number, number, number]; center: [number, number, number] };
}
