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

  // 默认（transparent / clip）：实心混凝土质感，略带半透便于查看内部钢筋
  return (
    <mesh position={center} castShadow receiveShadow>
      <boxGeometry args={[w, h, d]} />
      <meshPhysicalMaterial
        color="#c8c2b6"
        roughness={0.95}
        metalness={0.0}
        transparent
        opacity={0.78}
        depthWrite
        clearcoat={0.05}
      />
    </mesh>
  );
}
