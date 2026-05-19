/**
 * 平法标注示例库
 * 用于一键填入平法输入框,便于新手理解格式与快速验证功能。
 */
export interface PingfaSample {
  label: string;
  category: '单跨梁' | '多跨梁' | '变截面' | '柱';
  text: string;
}

export const PINGFA_SAMPLES: PingfaSample[] = [
  // —— 单跨梁 ——
  {
    label: 'KL1 标准单跨',
    category: '单跨梁',
    text: 'KL1(1) 300×700 Φ10@100/200(4) 2C25;4C25 G4C12',
  },
  {
    label: 'KL3 宽扁梁',
    category: '单跨梁',
    text: 'KL3(1) 600×400 Φ8@100/150(4) 3C20;6C20',
  },
  {
    label: 'L1 非抗震梁',
    category: '单跨梁',
    text: 'L1(1) 250×500 Φ8@150/200(2) 2C20;3C20',
  },

  // —— 多跨梁 ——
  {
    label: 'KL2 两跨等跨',
    category: '多跨梁',
    text: 'KL2(2) 6000,6000 300×700 Φ10@100/200(4) 2C25;4C25 G4C12',
  },
  {
    label: 'KL4 三跨不等',
    category: '多跨梁',
    text: 'KL4(3) 5000,6500,5000 300×650 Φ10@100/200(4) 2C25;4C25',
  },
  {
    label: 'KL5 四跨连续',
    category: '多跨梁',
    text: 'KL5(4) 6000,6000,6000,6000 350×750 Φ12@100/200(4) 3C25;5C25 G4C12',
  },

  // —— 变截面 ——
  {
    label: 'KL6 渐变截面 700→500',
    category: '变截面',
    text: 'KL6(1) 300×700 Φ10@100/200(4) 2C25;4C25',
  },
  {
    label: 'KL7 大截面渐变',
    category: '变截面',
    text: 'KL7(1) 400×900 Φ12@100/200(4) 3C28;6C28 G6C14',
  },

  // —— 柱(仅供对照格式) ——
  {
    label: 'KZ1 标准方柱',
    category: '柱',
    text: 'KZ1 600×600 C30 纵筋4C25 箍Φ10@100/200 井字',
  },
  {
    label: 'KZ2 矩形柱',
    category: '柱',
    text: 'KZ2 400×600 C35 纵筋4C22 箍Φ8@100/200 菱形',
  },
];
