# 3D 钢筋平法可视化 (22G101-1)

纯前端 SPA，按 22G101-1 平法图集生成几何精确的梁(KL)/柱(KZ) 三维钢筋骨架与混凝土包裹体，支持参数表单与平法字符串解析双输入。

## 技术栈
- Vite + React 18 + TypeScript
- three.js + @react-three/fiber + @react-three/drei
- Tailwind CSS + zustand

## 快速开始
```bash
npm install
npm run dev
```
访问 http://127.0.0.1:5173

## 功能
- **梁 KL**：上部通长筋（端支座弯锚 0.4LabE + 15d）、下部纵筋、侧面构造筋 G、加密/非加密区箍筋（含 4 肢复合箍）、135° 弯钩
- **柱 KZ**：周边纵筋（顶部 12d 弯锚）、加密区（底层 Hn/3，其他 max(Hn/6, hc, 500)）、井字复合箍
- **平法字符串解析**：`KL2(2A) 300×700 Φ10@100/200(4) 2C25;4C25 G4C12`
- **视图模式**：混凝土半透明 / 线框 / 隐藏 / 沿轴剖切；箍筋/纵筋分别显隐
- **拾取**：点击钢筋查看规格与下料长度，自动统计构件用量
- **几何精度**：CatmullRom 曲线骨架 + TubeGeometry 圆管，箍筋 InstancedMesh 高性能批量

## 目录结构
```
src/
  codes/      22G101 规则引擎 (La/LaE 查表, 加密区, 弯钩)
  geometry/   生成钢筋曲线/箍筋阵列/混凝土
  parser/     平法字符串解析器
  scene/      R3F 3D 渲染组件
  store/      zustand 状态
  ui/         参数表单/检查器/视图控件
```

## 已实现简化项
- ζa = 1.0（受拉钢筋影响系数全部按 1.0 处理）
- 仅支持单跨直形矩形截面梁
- 复合箍菱形形式 TODO

## 部署
```bash
npm run build
# dist/ 静态托管即可
```
