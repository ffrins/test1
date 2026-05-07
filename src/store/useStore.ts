import { create } from 'zustand';
import { BeamParams, ColumnParams } from '@/geometry/types';

export type MemberKind = 'beam' | 'column';
export type ConcreteView = 'transparent' | 'wireframe' | 'hidden' | 'clip';

interface AppState {
  kind: MemberKind;
  beam: BeamParams;
  column: ColumnParams;
  view: {
    concrete: ConcreteView;
    showStirrups: boolean;
    showLongitudinal: boolean;
    outline: boolean;
  };
  selected: { role: string; length: number; diameter: number; grade: string } | null;
  setKind: (k: MemberKind) => void;
  updateBeam: (patch: Partial<BeamParams>) => void;
  updateColumn: (patch: Partial<ColumnParams>) => void;
  setView: (patch: Partial<AppState['view']>) => void;
  setSelected: (s: AppState['selected']) => void;
}

const defaultBeam: BeamParams = {
  id: 'KL1',
  type: 'KL',
  span: 6000,
  b: 300,
  h: 700,
  cover: 25,
  concrete: 'C30',
  seismicLevel: 2,
  topThrough: { grade: 'HRB400', diameter: 25, count: 2 },
  bottom: { grade: 'HRB400', diameter: 25, count: 4 },
  sideG: { grade: 'HRB400', diameter: 12, countPerSide: 2 },
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

export const useStore = create<AppState>((set) => ({
  kind: 'beam',
  beam: defaultBeam,
  column: defaultColumn,
  view: {
    concrete: 'transparent',
    showStirrups: true,
    showLongitudinal: true,
    outline: true,
  },
  selected: null,
  setKind: (k) => set({ kind: k, selected: null }),
  updateBeam: (patch) => set((s) => ({ beam: deepMerge(s.beam, patch) })),
  updateColumn: (patch) => set((s) => ({ column: deepMerge(s.column, patch) })),
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
