import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function AiCoreMascot() {
  const coreRef = useRef()
  const ring1Ref = useRef()
  const ring2Ref = useRef()
  const ring3Ref = useRef()
  const particlesRef = useRef()

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()

    // Rotasi Cincin Orbital dengan kecepatan berbeda
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.7
    if (ring1Ref.current) ring1Ref.current.rotation.x = Math.sin(t * 0.5) * 0.3

    if (ring2Ref.current) ring2Ref.current.rotation.y += delta * 0.9
    if (ring2Ref.current) ring2Ref.current.rotation.z = Math.cos(t * 0.6) * 0.4

    if (ring3Ref.current) ring3Ref.current.rotation.x -= delta * 0.8
    if (ring3Ref.current) ring3Ref.current.rotation.y += delta * 0.5

    // Inti Pusat Faceted berdenyut pelan
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.4
      coreRef.current.rotation.x += delta * 0.2
      const scale = 1 + Math.sin(t * 2.2) * 0.04
      coreRef.current.scale.set(scale, scale, scale)
    }

    // Partikel Data mengalir ke atas
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.15
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Inti AI Core Pusat (Crimson Reactor Cube / Octahedron) */}
      <mesh ref={coreRef} position={[0, 0, 0]} castShadow>
        <octahedronGeometry args={[0.75, 0]} />
        <meshStandardMaterial
          color="#0E1013"
          roughness={0.15}
          metalness={0.9}
        />
      </mesh>

      {/* Inti Glowing Crimson di dalam */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.38, 24, 24]} />
        <meshStandardMaterial
          color="#192A56"
          emissive="#192A56"
          emissiveIntensity={2.8}
          roughness={0.1}
        />
      </mesh>

      {/* Pointlight Merah di dalam Inti */}
      <pointLight color="#192A56" intensity={3.5} distance={3.5} />

      {/* 2. Cincin Orbital Cybernetic 1 */}
      <group ref={ring1Ref}>
        <mesh>
          <torusGeometry args={[1.35, 0.035, 16, 64]} />
          <meshStandardMaterial color="#0E1013" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Node Sensor pada Cincin 1 */}
        <mesh position={[1.35, 0, 0]}>
          <boxGeometry args={[0.08, 0.14, 0.08]} />
          <meshStandardMaterial color="#192A56" emissive="#192A56" emissiveIntensity={1.5} />
        </mesh>
        <mesh position={[-1.35, 0, 0]}>
          <boxGeometry args={[0.08, 0.14, 0.08]} />
          <meshStandardMaterial color="#192A56" emissive="#192A56" emissiveIntensity={1.5} />
        </mesh>
      </group>

      {/* 3. Cincin Orbital Cybernetic 2 */}
      <group ref={ring2Ref}>
        <mesh>
          <torusGeometry args={[1.65, 0.028, 16, 64]} />
          <meshStandardMaterial color="#5D6470" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.65, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#192A56" emissive="#192A56" emissiveIntensity={1.8} />
        </mesh>
      </group>

      {/* 4. Cincin Orbital Cybernetic 3 (Tipis Terluar) */}
      <group ref={ring3Ref}>
        <mesh>
          <torusGeometry args={[1.95, 0.02, 16, 64]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* 5. Data Flow Orbs / Partikel Floating */}
      <group ref={particlesRef}>
        {[-1.2, -0.6, 0.4, 1.1, 1.7].map((y, i) => (
          <mesh
            key={i}
            position={[
              Math.sin(i * 1.7) * 0.85,
              y,
              Math.cos(i * 1.7) * 0.85,
            ]}
          >
            <sphereGeometry args={[0.04, 10, 10]} />
            <meshStandardMaterial
              color="#192A56"
              emissive="#192A56"
              emissiveIntensity={2.0}
            />
          </mesh>
        ))}
      </group>

      {/* Kolom Tabung Kaca Dalam Refraksi Lembut */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[2.2, 2.2, 4.4, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          transparent
          opacity={0.12}
          roughness={0.1}
          metalness={0.1}
          transmission={0.85}
          ior={1.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

export function CentralTubeCore3D() {
  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.2} color="#ffffff" />
        <directionalLight position={[10, 12, 10]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-8, -10, -5]} intensity={0.6} color="#192A56" />

        <Float
          speed={2.4}
          rotationIntensity={0.4}
          floatIntensity={0.6}
          floatingRange={[-0.12, 0.12]}
        >
          <AiCoreMascot />
        </Float>
      </Canvas>
    </div>
  )
}
