import { describe, expect, it } from 'vitest';
import {
  computeLab,
  computeLabE,
  computeLa,
  computeLaE,
  zetaA,
  zetaAE,
} from '@/codes/anchorage';

describe('zetaAE 抗震修正系数', () => {
  it('一/二级 = 1.15', () => {
    expect(zetaAE(1)).toBe(1.15);
    expect(zetaAE(2)).toBe(1.15);
  });
  it('三级 = 1.05', () => {
    expect(zetaAE(3)).toBe(1.05);
  });
  it('四级/非抗震 = 1.0', () => {
    expect(zetaAE(4)).toBe(1.0);
    expect(zetaAE(null)).toBe(1.0);
  });
});

describe('computeLab 受拉基本锚固', () => {
  it('HRB400 + C30 + d=20 → 35d = 700mm', () => {
    expect(computeLab('HRB400', 'C30', 20)).toBe(700);
  });
  it('HPB300 + C25 + d=10 → 34d = 340mm', () => {
    expect(computeLab('HPB300', 'C25', 10)).toBe(340);
  });
  it('d > 25 时附加 +3d (大直径修正)', () => {
    // HRB400 C30: 35d, d=28 → (35+3)*28 = 1064
    expect(computeLab('HRB400', 'C30', 28)).toBe(1064);
  });
});

describe('computeLabE 抗震基本锚固', () => {
  it('= Lab * ζaE', () => {
    const lab = computeLab('HRB400', 'C30', 20); // 700
    expect(computeLabE('HRB400', 'C30', 20, 2)).toBe(Math.round(lab * 1.15));
  });
});

describe('zetaA 锚固修正系数', () => {
  it('默认 = 1.0', () => {
    expect(zetaA()).toBe(1.0);
  });
  it('机械锚固 = 0.6 (短路返回)', () => {
    expect(zetaA({ d: 25, mechAnchor: true })).toBe(0.6);
  });
  it('环氧涂层 *= 1.25', () => {
    expect(zetaA({ d: 20, epoxy: true })).toBeCloseTo(1.25, 3);
  });
  it('大直径 d=28 *= 1.10', () => {
    expect(zetaA({ d: 28 })).toBeCloseTo(1.1, 3);
  });
  it('保护层比 c/d ≥ 5 *= 0.6, ≥ 3 *= 0.8', () => {
    expect(zetaA({ d: 20, c: 60 })).toBeCloseTo(0.8, 3); // c/d = 3
    expect(zetaA({ d: 20, c: 100 })).toBeCloseTo(0.6, 3); // c/d = 5
  });
  it('叠加结果在 [0.6, 1.4] 之间', () => {
    expect(zetaA({ d: 28, epoxy: true, disturbed: true })).toBeLessThanOrEqual(1.4);
    expect(zetaA({ d: 12, c: 100 })).toBeGreaterThanOrEqual(0.6);
  });
});

describe('computeLa 与 extra 集成', () => {
  it('未传 extra 时 ζa=1.0 (向后兼容)', () => {
    expect(computeLa('HRB400', 'C30', 20)).toBe(700);
  });
  it('传机械锚固 ζa=0.6', () => {
    expect(computeLa('HRB400', 'C30', 20, { mechAnchor: true })).toBe(420);
  });
  it('LaE = La * ζaE', () => {
    const la = computeLa('HRB400', 'C30', 20, { epoxy: true });
    expect(computeLaE('HRB400', 'C30', 20, 2, { epoxy: true })).toBe(Math.round(la * 1.15));
  });
});
