import { useStore } from '@/store/useStore';

interface Props {
  size: [number, number, number];
  center: [number, number, number];
}

export function Concrete({ size, center }: Props) {
  const view = useStore((s) => s.view.concrete);
  if (view === 'hidden') return null;

  const [w, h, d] = size;

  if (view === 'wireframe') {
    return (
      <mesh position={center}>
        <boxGeometry args={[w, h, d]} />
        <meshBasicMaterial color="#cbd5e1" wireframe />
      </mesh>
    );
  }

  // transparent (默认) 与 clip 都用半透明，clip 走全局 clipping (在 Viewer 中处理)
  return (
    <mesh position={center} castShadow receiveShadow>
      <boxGeometry args={[w, h, d]} />
      <meshPhysicalMaterial
        color="#d6d3d1"
        roughness={0.85}
        metalness={0.0}
        transparent
        opacity={0.28}
        depthWrite={false}
      />
    </mesh>
  );
}
