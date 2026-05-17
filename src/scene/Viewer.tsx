import { Canvas } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { buildBeam } from '@/geometry/beam';
import { buildColumn } from '@/geometry/column';
import { buildWall } from '@/geometry/wall';
import { Rebar } from './Rebar';
import { Stirrups } from './Stirrups';
import { Concrete } from './Concrete';
import { bindRenderer } from '@/utils/screenshot';

export function Viewer() {
  const kind = useStore((s) => s.kind);
  const beam = useStore((s) => s.beam);
  const column = useStore((s) => s.column);
  const wall = useStore((s) => s.wall);
  const view = useStore((s) => s.view);
  const setSelected = useStore((s) => s.setSelected);

  const built = useMemo(() => {
    if (kind === 'beam') return buildBeam(beam);
    if (kind === 'column') return buildColumn(column);
    return buildWall(wall);
  }, [kind, beam, column, wall]);

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
      gl={{ localClippingEnabled: true, antialias: true, preserveDrawingBuffer: true }}
      camera={{ position: [center[0] + camDist * 0.7, camDist * 0.6, camDist * 0.9], fov: 35, near: 1, far: camDist * 20 }}
      onCreated={({ gl, scene, camera }) => bindRenderer(gl, scene, camera)}
      onPointerMissed={() => setSelected(null)}
    >
      <color attach="background" args={['#020617']} />
      <hemisphereLight args={['#dbeafe', '#1e293b', 0.6]} />
      <directionalLight
        position={[center[0] + camDist, camDist, camDist]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <ClipContext planes={clippingPlanes}>
        {view.concrete !== 'hidden' && <Concrete {...built.concrete} />}
        {view.concrete !== 'hidden' &&
          built.supports?.map((s, i) => (
            <Concrete key={`sp${i}`} size={s.size} center={s.center} />
          ))}
        {view.showLongitudinal && built.rebars.map((r, i) => <Rebar key={i} rebar={r} />)}
        {view.showStirrups &&
          built.stirrups.map((s, i) => <Stirrups key={i} shape={s} axis={stirrupAxis} />)}
      </ClipContext>

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
