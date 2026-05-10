import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { StirrupShape } from '@/geometry/types';

const GRADE_COLOR: Record<string, string> = {
  HPB300: '#9ca3af',
  HRB400: '#b22222',
  HRB500: '#7c3aed',
};

/** 加密区高亮（暖色），让用户一眼识别 */
const DENSE_COLOR = '#f59e0b';

interface Props {
  shape: StirrupShape;
  /** 沿哪个轴布置实例: 'x' 用于梁, 'y' 用于柱 */
  axis: 'x' | 'y';
}

export function Stirrups({ shape, axis }: Props) {
  const ref = useRef<THREE.InstancedMesh>(null!);

  const geometry = useMemo(() => {
    const vec = shape.loop.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const curve = new THREE.CatmullRomCurve3(vec, false, 'catmullrom', 0.0);
    let len = 0;
    for (let i = 1; i < vec.length; i++) len += vec[i].distanceTo(vec[i - 1]);
    const segments = Math.max(60, Math.floor(len / 20));
    return new THREE.TubeGeometry(curve, segments, shape.diameter / 2, 8, false);
  }, [shape]);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    shape.positions.forEach((p, i) => {
      dummy.position.set(0, 0, 0);
      if (axis === 'x') dummy.position.x = p;
      else dummy.position.y = p;
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.count = shape.positions.length;
    mesh.instanceMatrix.needsUpdate = true;
  }, [shape, axis]);

  const isDense = shape.zone === 'dense';
  const color = isDense ? DENSE_COLOR : GRADE_COLOR[shape.grade] ?? '#9ca3af';

  if (shape.positions.length === 0) return null;

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, undefined, shape.positions.length]}
      castShadow
    >
      <meshStandardMaterial
        color={color}
        metalness={0.6}
        roughness={0.5}
        emissive={isDense ? DENSE_COLOR : '#000000'}
        emissiveIntensity={isDense ? 0.25 : 0}
      />
    </instancedMesh>
  );
}
