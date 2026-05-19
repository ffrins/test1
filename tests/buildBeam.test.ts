import { describe, expect, it } from 'vitest';
import { buildBeam } from '@/geometry/beam';
import type { BeamParams } from '@/geometry/types';

const base: BeamParams = {
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

describe('buildBeam - 单跨', () => {
  it('总长 = 左支座 + 净跨 + 右支座 = 7000', () => {
    const g = buildBeam(base);
    expect(g.concrete.size[0]).toBe(7000);
  });
  it('生成 2 根上部通长 + 4 根下部纵筋 + 4 根侧面构造 = 10 根纵筋', () => {
    const g = buildBeam(base);
    expect(g.rebars.length).toBe(10);
  });
  it('单跨不生成支座负筋', () => {
    const g = buildBeam(base);
    const negs = g.rebars.filter((r) => r.role.includes('支座负筋'));
    expect(negs.length).toBe(0);
  });
  it('两端支座 = 2 个 supports', () => {
    const g = buildBeam(base);
    expect(g.supports?.length).toBe(2);
  });
});

describe('buildBeam - 多跨', () => {
  const multi: BeamParams = {
    ...base,
    spans: [6000, 6500, 6000],
    interiorSupports: [{ width: 500 }, { width: 500 }],
  };
  it('总长 = 500 + 6000 + 500 + 6500 + 500 + 6000 + 500 = 20500', () => {
    const g = buildBeam(multi);
    expect(g.concrete.size[0]).toBe(20500);
  });
  it('3 跨 -> 4 个支座 (2 端 + 2 中间)', () => {
    const g = buildBeam(multi);
    expect(g.supports?.length).toBe(4);
  });
  it('支座负筋:每个中间支座 2 根 -> 4 根', () => {
    const g = buildBeam(multi);
    const negs = g.rebars.filter((r) => r.role.includes('支座负筋'));
    expect(negs.length).toBe(4);
  });
  it('下部纵筋按跨拆分,role 含跨号', () => {
    const g = buildBeam(multi);
    const span1 = g.rebars.filter((r) => r.role === '第1跨下部纵筋');
    const span2 = g.rebars.filter((r) => r.role === '第2跨下部纵筋');
    const span3 = g.rebars.filter((r) => r.role === '第3跨下部纵筋');
    expect(span1.length).toBe(4);
    expect(span2.length).toBe(4);
    expect(span3.length).toBe(4);
  });
});

describe('buildBeam - 变截面', () => {
  it('h1 != h 时混凝土包围盒高度取较大', () => {
    const g = buildBeam({ ...base, h1: 500 });
    expect(g.concrete.size[1]).toBe(700);
  });
  it('变截面下每根箍筋独立 (positions=1)', () => {
    const g = buildBeam({ ...base, h1: 500 });
    // 每个 StirrupShape 仅含 1 个 position
    for (const s of g.stirrups) expect(s.positions.length).toBe(1);
  });
  it('等截面下箍筋按组合并 (positions > 1)', () => {
    const g = buildBeam(base);
    const someMulti = g.stirrups.some((s) => s.positions.length > 1);
    expect(someMulti).toBe(true);
  });
});

describe('buildBeam - 健壮性', () => {
  it('箍筋间距 0 不死循环', () => {
    const g = buildBeam({
      ...base,
      stirrup: { ...base.stirrup, spacingDense: 0, spacingSparse: 0 },
    });
    // 不抛出,生成 0 根箍筋
    const total = g.stirrups.reduce((a, s) => a + s.positions.length, 0);
    expect(total).toBe(0);
  });
});
