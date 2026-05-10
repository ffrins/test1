import { useStore } from '@/store/useStore';
import { Viewer } from '@/scene/Viewer';
import { Header } from '@/ui/Header';
import { StructuralTree } from '@/ui/StructuralTree';
import { ViewportHUD } from '@/ui/ViewportHUD';
import { CrossSection } from '@/ui/CrossSection';
import { BOMTable } from '@/ui/BOMTable';
import { DetailingInspector } from '@/ui/DetailingInspector';
import { Gizmo } from '@/ui/Gizmo';

export default function App() {
  const kind = useStore((s) => s.kind);
  const beam = useStore((s) => s.beam);
  const column = useStore((s) => s.column);
  const fileName = kind === 'beam' ? `${beam.id}.筋` : `${column.id}.筋`;

  return (
    <div className="flex flex-col h-screen text-on-surface bg-surface">
      <Header fileName={fileName} />
      <div className="flex flex-1 overflow-hidden">
        <StructuralTree />
        <main className="flex-1 flex flex-col min-w-0 bg-surface overflow-hidden">
          {/* 上半：3D 视口 */}
          <section className="flex-[3] relative border-b border-outline-variant/20 overflow-hidden">
            <Viewer />
            <ViewportHUD />
            <Gizmo />
          </section>
          {/* 下半：截面 + BOM */}
          <section className="flex-[2] flex bg-surface-container-lowest overflow-hidden min-h-0">
            <CrossSection />
            <BOMTable />
          </section>
        </main>
        <DetailingInspector />
      </div>
    </div>
  );
}
