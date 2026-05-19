import { create } from 'zustand';
import { BeamParams, ColumnParams, WallParams } from '@/geometry/types';

export type MemberKind = 'beam' | 'column' | 'wall';
export type ConcreteView = 'transparent' | 'wireframe' | 'hidden' | 'clip';

/** 可撤销的数据快照(不含 view/selected 等 UI 状态) */
interface Snapshot {
  kind: MemberKind;
  beam: BeamParams;
  column: ColumnParams;
  wall: WallParams;
}

const MAX_HISTORY = 50;

interface AppState {
  kind: MemberKind;
  beam: BeamParams;
  column: ColumnParams;
  wall: WallParams;
  view: {
    concrete: ConcreteView;
    showStirrups: boolean;
    showLongitudinal: boolean;
    outline: boolean;
  };
  selected: { role: string; length: number; diameter: number; grade: string } | null;

  // history
  _past: Snapshot[];
  _future: Snapshot[];
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  setKind: (k: MemberKind) => void;
  updateBeam: (patch: Partial<BeamParams>) => void;
  updateColumn: (patch: Partial<ColumnParams>) => void;
  updateWall: (patch: Partial<WallParams>) => void;
  setView: (patch: Partial<AppState['view']>) => void;
  setSelected: (s: AppState['selected']) => void;
}

const defaultBeam: BeamParams = {
  id: 'KL1',
  type: 'KL',
  span: 6000,
  spans: undefined, // 单跨模式 (向后兼容)
  interiorSupports: undefined,
  b: 300,
  h: 700,
  h1: undefined, // 等截面
  transition: 'linear',
  cover: 25,
  concrete: 'C30',
  seismicLevel: 2,
  topThrough: { grade: 'HRB400', diameter: 25, count: 2 },
  bottom: { grade: 'HRB400', diameter: 25, count: 4 },
  sideG: { grade: 'HRB400', diameter: 12, countPerSide: 2 },
  supportNeg: { grade: 'HRB400', diameter: 25, count: 2 },
  stirrup: {
    grade: 'HPB300',
    diameter: 10,
    spacingDense: 100,
    spacingSparse: 200,
    legs: 4,
  },
  leftSupport: { width: 500 },
  rightSupport: { width: 500 },
};

const defaultColumn: ColumnParams = {
  id: 'KZ1',
  type: 'KZ',
  height: 3600,
  b: 600,
  h: 600,
  cover: 25,
  concrete: 'C30',
  seismicLevel: 2,
  longitudinal: { grade: 'HRB400', diameter: 25, nB: 4, nH: 4 },
  stirrup: {
    grade: 'HPB300',
    diameter: 10,
    spacingDense: 100,
    spacingSparse: 200,
    composite: 'jing',
  },
  isBottom: true,
};

const defaultWall: WallParams = {
  id: 'Q1',
  type: 'Q',
  length: 4000,
  height: 3600,
  thickness: 200,
  cover: 15,
  concrete: 'C30',
  seismicLevel: 2,
  vertical: { grade: 'HRB400', diameter: 12, spacing: 200 },
  horizontal: { grade: 'HRB400', diameter: 10, spacing: 200 },
  tie: { grade: 'HPB300', diameter: 6, spacingX: 600, spacingY: 600, enabled: true },
};

function snap(s: AppState): Snapshot {
  return { kind: s.kind, beam: s.beam, column: s.column, wall: s.wall };
}

function pushHistory(s: AppState): Partial<AppState> {
  const past = [...s._past, snap(s)].slice(-MAX_HISTORY);
  return { _past: past, _future: [], canUndo: true, canRedo: false };
}

export const useStore = create<AppState>((set) => ({
  kind: 'beam',
  beam: defaultBeam,
  column: defaultColumn,
  wall: defaultWall,
  view: {
    concrete: 'transparent',
    showStirrups: true,
    showLongitudinal: true,
    outline: true,
  },
  selected: null,
  _past: [],
  _future: [],
  canUndo: false,
  canRedo: false,

  undo: () =>
    set((s) => {
      if (s._past.length === 0) return s;
      const prev = s._past[s._past.length - 1];
      const past = s._past.slice(0, -1);
      const future = [snap(s), ...s._future].slice(0, MAX_HISTORY);
      return { ...prev, _past: past, _future: future, canUndo: past.length > 0, canRedo: true };
    }),

  redo: () =>
    set((s) => {
      if (s._future.length === 0) return s;
      const next = s._future[0];
      const future = s._future.slice(1);
      const past = [...s._past, snap(s)].slice(-MAX_HISTORY);
      return { ...next, _past: past, _future: future, canUndo: true, canRedo: future.length > 0 };
    }),

  setKind: (k) => set((s) => ({ ...pushHistory(s), kind: k, selected: null })),
  updateBeam: (patch) => set((s) => ({ ...pushHistory(s), beam: deepMerge(s.beam, patch) })),
  updateColumn: (patch) => set((s) => ({ ...pushHistory(s), column: deepMerge(s.column, patch) })),
  updateWall: (patch) => set((s) => ({ ...pushHistory(s), wall: deepMerge(s.wall, patch) })),
  setView: (patch) => set((s) => ({ view: { ...s.view, ...patch } })),
  setSelected: (sel) => set({ selected: sel }),
}));

function deepMerge<T>(base: T, patch: Partial<T>): T {
  const out: any = { ...base };
  for (const k in patch) {
    const v: any = (patch as any)[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = { ...(base as any)[k], ...v };
    } else {
      out[k] = v;
    }
  }
  return out;
}
