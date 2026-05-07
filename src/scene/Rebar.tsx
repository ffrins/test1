import { useMemo } from 'react';
import * as THREE from 'three';
import { RebarLine } from '@/geometry/types';
import { useStore } from '@/store/useStore';

const GRADE_COLOR: Record<string, string> = {
  HPB300: '#9ca3af',
  HRB400: '#b22222',
  HRB500: '#7c3aed',
};

interface Props {
  rebar: RebarLine;
}

export function Rebar({ rebar }: Props) {
  const { geometry, length } = useMemo(() => {
    const vec = rebar.points.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    // 用 CatmullRom 在折线拐角形成轻微圆弧 (更接近真实弯曲半径)
    const curve = new THREE.CatmullRomCurve3(vec, false, 'catmullrom', 0.0);
    // 折线总长
    let len = 0;
    for (let i = 1; i < vec.length; i++) len += vec[i].distanceTo(vec[i - 1]);
    const segments = Math.max(40, Math.floor(len / 30));
    const radial = rebar.diameter >= 18 ? 12 : 8;
    const geom = new THREE.TubeGeometry(curve, segments, rebar.diameter / 2, radial, false);
    return { geometry: geom, length: len };
  }, [rebar]);

  const setSelected = useStore((s) => s.setSelected);
  const color = GRADE_COLOR[rebar.grade] ?? '#b22222';

  return (
    <mesh
      geometry={geometry}
      castShadow
      onPointerDown={(e) => {
        e.stopPropagation();
        setSelected({
          role: rebar.role,
          length: Math.round(length),
          diameter: rebar.diameter,
          grade: rebar.grade,
        });
      }}
    >
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.45} />
    </mesh>
  );
}
