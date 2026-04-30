'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function CellCore() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.15;
      meshRef.current.rotation.y = time * 0.2;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.8, 12]} />
        <MeshDistortMaterial
          color="#2563eb"
          speed={4}
          distort={0.45}
          radius={1}
          transmission={1}
          thickness={2.0}
          roughness={0}
          clearcoat={1}
          clearcoatRoughness={0}
          metalness={0.1}
          ior={1.5}
        />
      </mesh>
    </Float>
  );
}

export default function Specimen() {
  return (
    <div className="w-full h-[500px] min-h-[500px] flex items-center justify-center relative z-20">
      <Canvas 
        camera={{ position: [0, 0, 6], fov: 40 }}
        dpr={[1, 2]} // High DPI support
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.8} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <directionalLight position={[0, 5, 5]} intensity={0.8} />
        
        <CellCore />
        
        <ContactShadows 
          position={[0, -2.5, 0]} 
          opacity={0.3} 
          scale={10} 
          blur={2.5} 
          far={4} 
        />
        
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
