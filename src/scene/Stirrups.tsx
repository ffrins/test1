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
    // 折线 + 圆弧过渡: 在每个内部拐角处插入小圆弧, 避免 CatmullRom 在闭合处的扭曲
    const curve = buildPolylineWithArcs(vec, Math.max(shape.diameter * 1.5, 8));
    let len = 0;
    for (let i = 1; i < vec.length; i++) len += vec[i].distanceTo(vec[i - 1]);
    const segments = Math.max(80, Math.floor(len / 15));
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

/**
 * 构建带圆弧过渡的折线曲线: 在内部拐角处用小圆弧光滑连接, 端点保持锐利。
 * 使用 CurvePath + LineCurve3 + QuadraticBezierCurve3 组合, 避免 CatmullRom 在闭合点处的过冲扭曲。
 */
function buildPolylineWithArcs(pts: THREE.Vector3[], radius: number): THREE.Curve<THREE.Vector3> {
  const path = new THREE.CurvePath<THREE.Vector3>();
  if (pts.length < 2) return path;

  // 对每个内部拐角 i (1..n-2), 在前段终点前 r、后段起点后 r 处, 用 QuadraticBezier 圆弧过渡
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const segLen = a.distanceTo(b);
    if (segLen < 1e-3) continue;

    // 起点位置: 若 i 是内部拐角, 从 a 沿 a→b 方向偏移 r
    let from = a.clone();
    if (i > 0) {
      const dir = new THREE.Vector3().subVectors(b, a).normalize();
      const r = Math.min(radius, segLen / 2);
      from = a.clone().addScaledVector(dir, r);
    }
    // 终点位置: 若 i+1 是内部拐角, 从 b 沿 b→a 方向偏移 r
    let to = b.clone();
    if (i < pts.length - 2) {
      const dir = new THREE.Vector3().subVectors(a, b).normalize();
      const r = Math.min(radius, segLen / 2);
      to = b.clone().addScaledVector(dir, r);
    }

    if (from.distanceTo(to) > 1e-3) {
      path.add(new THREE.LineCurve3(from, to));
    }

    // 拐角圆弧: 从 to (b 之前 r 处) 经过 b 到下一段 r 处
    if (i < pts.length - 2) {
      const c = pts[i + 2];
      const segLenNext = b.distanceTo(c);
      if (segLenNext > 1e-3) {
        const dirNext = new THREE.Vector3().subVectors(c, b).normalize();
        const rNext = Math.min(radius, segLenNext / 2);
        const arcEnd = b.clone().addScaledVector(dirNext, rNext);
        path.add(new THREE.QuadraticBezierCurve3(to, b.clone(), arcEnd));
      }
    }
  }

  return path;
}
