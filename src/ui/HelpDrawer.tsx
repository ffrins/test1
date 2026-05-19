import { Icon } from './Icon';
import { computeLabE } from '@/codes/anchorage';
import type { ConcreteGrade, RebarGrade, SeismicLevel } from '@/codes/rebar';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CONCRETES: ConcreteGrade[] = ['C25', 'C30', 'C35', 'C40', 'C45', 'C50'];
const GRADES: RebarGrade[] = ['HPB300', 'HRB400', 'HRB500'];
const DIAMETERS = [12, 16, 20, 25];
const SEISMIC: SeismicLevel = 2;

export function HelpDrawer({ open, onClose }: Props) {
  return (
    <div
      className={`fixed inset-0 z-[9999] transition-opacity duration-200 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside
        className={`absolute right-0 top-0 h-full w-[460px] max-w-full bg-surface-container-low border-l border-outline-variant/30 shadow-2xl flex flex-col transition-transform duration-200 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/20 shrink-0">
          <div className="flex items-center gap-2">
            <Icon name="help" className="text-primary" />
            <h2 className="text-sm font-bold text-on-surface">帮助 · 规范速查</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-variant/50 text-on-surface-variant"
          >
            <Icon name="close" className="!text-[18px]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
          {/* 快速开始 */}
          <section>
            <h3 className="text-xs font-bold text-primary tracking-wider mb-2">快速开始</h3>
            <ol className="text-[12px] text-on-surface-variant leading-relaxed list-decimal pl-4 space-y-1">
              <li>左侧树形面板选择构件类型（梁 / 柱 / 墙），或按 1 / 2 / 3 快速切换。</li>
              <li>右侧面板修改参数后 3D 视图自动更新；也可在"平法标注"区域输入标注文字一键解析。</li>
              <li>按 T / W / H / C 切换混凝土显示模式。</li>
              <li>按 P 截图、E 导出 BOM 表。</li>
              <li>Ctrl+Z 撤销，Ctrl+Y 重做（最多 50 步）。</li>
            </ol>
          </section>

          {/* 平法标注格式 */}
          <section>
            <h3 className="text-xs font-bold text-primary tracking-wider mb-2">平法标注格式</h3>
            <div className="text-[11px] text-on-surface-variant space-y-2 font-mono bg-surface-container-high/50 p-3 rounded border border-outline-variant/10">
              <p className="text-on-surface font-sans font-bold text-[12px]">单跨梁示例</p>
              <p>KL2(2A) 300×700 Φ10@100/200(4) 2C25;4C25 G4C12</p>
              <p className="text-on-surface font-sans font-bold text-[12px] pt-2">三跨梁示例</p>
              <p>KL1(3) 6000,6500,6000 300×700 Φ10@100/200(4) 2C25;4C25</p>
              <p className="text-on-surface font-sans font-bold text-[12px] pt-2">格式说明</p>
              <p className="font-sans">
                编号(跨数) [跨度列表] 宽×高 箍筋 上部筋;下部筋 [侧面筋]
              </p>
            </div>
          </section>

          {/* LabE 速查表 */}
          <section>
            <h3 className="text-xs font-bold text-primary tracking-wider mb-2">
              LabE 锚固长度速查 (mm) · 抗震 {SEISMIC} 级
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] font-mono border-collapse">
                <thead>
                  <tr className="bg-surface-container-high/60 text-on-surface-variant">
                    <th className="p-1.5 text-left border border-outline-variant/20">级别 \ 混凝土</th>
                    <th className="p-1.5 text-center border border-outline-variant/20">d</th>
                    {CONCRETES.map((c) => (
                      <th key={c} className="p-1.5 text-center border border-outline-variant/20">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {GRADES.flatMap((g) =>
                    DIAMETERS.map((d, di) => (
                      <tr
                        key={`${g}-${d}`}
                        className={di === 0 ? 'border-t-2 border-outline-variant/30' : ''}
                      >
                        {di === 0 && (
                          <td
                            className="p-1.5 text-on-surface-variant font-bold border border-outline-variant/20"
                            rowSpan={DIAMETERS.length}
                          >
                            {g}
                          </td>
                        )}
                        <td className="p-1.5 text-center text-on-surface-variant border border-outline-variant/20">
                          {d}
                        </td>
                        {CONCRETES.map((c) => (
                          <td
                            key={c}
                            className="p-1.5 text-center text-on-surface border border-outline-variant/20"
                          >
                            {computeLabE(g, c, d, SEISMIC)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-outline mt-1">
              数据来源: 22G101-1 表 1.0.4-1，ζaE={1.15}（1/2 级）
            </p>
          </section>

          {/* ζa 修正系数 */}
          <section>
            <h3 className="text-xs font-bold text-primary tracking-wider mb-2">ζa 锚固修正系数</h3>
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="bg-surface-container-high/60 text-on-surface-variant">
                  <th className="p-1.5 text-left border border-outline-variant/20">条件</th>
                  <th className="p-1.5 text-center border border-outline-variant/20">系数</th>
                </tr>
              </thead>
              <tbody className="text-on-surface-variant">
                <tr>
                  <td className="p-1.5 border border-outline-variant/20">d &gt; 25mm</td>
                  <td className="p-1.5 text-center border border-outline-variant/20">×1.10</td>
                </tr>
                <tr>
                  <td className="p-1.5 border border-outline-variant/20">环氧涂层</td>
                  <td className="p-1.5 text-center border border-outline-variant/20">×1.25</td>
                </tr>
                <tr>
                  <td className="p-1.5 border border-outline-variant/20">施工扰动</td>
                  <td className="p-1.5 text-center border border-outline-variant/20">×1.10</td>
                </tr>
                <tr>
                  <td className="p-1.5 border border-outline-variant/20">c/d ≥ 3</td>
                  <td className="p-1.5 text-center border border-outline-variant/20">×0.80</td>
                </tr>
                <tr>
                  <td className="p-1.5 border border-outline-variant/20">c/d ≥ 5</td>
                  <td className="p-1.5 text-center border border-outline-variant/20">×0.60</td>
                </tr>
                <tr>
                  <td className="p-1.5 border border-outline-variant/20">机械锚固</td>
                  <td className="p-1.5 text-center border border-outline-variant/20">0.60</td>
                </tr>
              </tbody>
            </table>
            <p className="text-[10px] text-outline mt-1">综合后 ζa 取值范围 0.60 ~ 1.40</p>
          </section>
        </div>
      </aside>
    </div>
  );
}
