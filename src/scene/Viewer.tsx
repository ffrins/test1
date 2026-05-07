import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, GizmoHelper, GizmoViewport, Grid } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { buildBeam } from '@/geometry/beam';
import { buildColumn } from '@/geometry/column';
import { Rebar } from './Rebar';
import { Stirrups } from './Stirrups';
import { Concrete } from './Concrete';

export function Viewer() {
  const kind = useStore((s) => s.kind);
  const beam = useStore((s) => s.beam);
  const column = useStore((s) => s.column);
  const view = useStore((s) => s.view);
  const setSelected = useStore((s) => s.setSelected);

  const built = useMemo(
    () => (kind === 'beam' ? buildBeam(beam) : buildColumn(column)),
    [kind, beam, column]
  );

  // 居中相机 / Grid 大小
  const dim = built.concrete.size;
  const center = built.concrete.center;
  const camDist = Math.max(...dim) * 1.8;
  const stirrupAxis: 'x' | 'y' = kind === 'beam' ? 'x' : 'y';

  // 剖切平面 (clip 模式: 沿梁长 1/3 处剖开)
  const clippingPlanes = useMemo(() => {
    if (view.concrete !== 'clip') return [];
    if (kind === 'beam') {
      return [new THREE.Plane(new THREE.Vector3(1, 0, 0), -dim[0] * 0.6)];
    }
    return [new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)];
  }, [view.concrete, kind, dim]);

  return (
    <Canvas
      shadows
      gl={{ localClippingEnabled: true, antialias: true }}
      camera={{ position: [center[0] + camDist * 0.7, camDist * 0.6, camDist * 0.9], fov: 35, near: 1, far: camDist * 20 }}
      onPointerMissed={() => setSelected(null)}
    >
      <color attach="background" args={['#0f172a']} />
      <hemisphereLight args={['#dbeafe', '#1e293b', 0.6]} />
      <directionalLight
        position={[center[0] + camDist, camDist, camDist]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <Environment preset="warehouse" />

      <ClipContext planes={clippingPlanes}>
        {view.concrete !== 'hidden' && <Concrete {...built.concrete} />}
        {view.showLongitudinal && built.rebars.map((r, i) => <Rebar key={i} rebar={r} />)}
        {view.showStirrups &&
          built.stirrups.map((s, i) => <Stirrups key={i} shape={s} axis={stirrupAxis} />)}
      </ClipContext>

      <Grid
        position={[center[0], 0, 0]}
        args={[Math.max(dim[0], 4000) * 1.5, Math.max(dim[2], 2000) * 3]}
        cellSize={100}
        sectionSize={1000}
        sectionColor="#475569"
        cellColor="#334155"
        fadeDistance={camDist * 5}
        infiniteGrid
      />
      <OrbitControls target={center} makeDefault />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport labelColor="white" axisHeadScale={1} />
      </GizmoHelper>
    </Canvas>
  );
}

function ClipContext({
  planes,
  children,
}: {
  planes: THREE.Plane[];
  children: React.ReactNode;
}) {
  // 给所有材质设置 clipping (通过 onUpdate 简化处理: 直接通过 useThree 也可)
  return (
    <group
      onUpdate={(g) => {
        g.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (mesh.material) {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            for (const m of mats) {
              (m as THREE.Material).clippingPlanes = planes.length ? planes : null;
              (m as THREE.Material).clipShadows = true;
            }
          }
        });
      }}
    >
      {children}
    </group>
  );
}
