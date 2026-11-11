import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'

/**
 * 5. Karakter AI Robot Mini (Reusable Capsule Bot Component):
 * - Tubuh: CapsuleGeometry glossy halus sesuai warna parameter.
 * - Wajah/Visor: Lekukan warna hitam pekat di bagian depan atas.
 * - Mata digital: Dua titik bola kecil dengan warna cyan menyala (emissive="#00f3ff").
 * - Tangan dan kaki mini silinder sederhana.
 * - Animasi: Animasi idle mengapung/bernapas naik-turun halus menggunakan hook useFrame.
 *   Jika isTyping, posisikan robot sedang duduk mengetik di depan monitor.
 * - 6. Floating UI Badge (Billboard Pill Shape) di atas kepala robot.
 */
export function RobotAgent({
  color = '#0284c7',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  isTyping = false,
  label = 'Robot Agent',
  status = 'Active',
  isSelected = false
}) {
  const groupRef = useRef()
  const bodyRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()
  const leftLegRef = useRef()
  const rightLegRef = useRef()
  const haloRef = useRef()

  const targetVec = useRef(new THREE.Vector3(...position))

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()

    // Interpolasi posisi halus menuju target
    targetVec.current.set(position[0], position[1], position[2])
    groupRef.current.position.lerp(targetVec.current, 0.08)

    // Rotasi
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      rotation[1] || 0,
      0.1
    )

    if (bodyRef.current) {
      if (isTyping) {
        // Posisi duduk mengetik di depan meja
        bodyRef.current.position.y = 0.58 + Math.sin(t * 14) * 0.015
        bodyRef.current.rotation.x = 0.05

        // Tangan mengetik aktif bolak-balik
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.x = -0.7 + Math.sin(t * 22) * 0.12
          rightArmRef.current.rotation.x = -0.7 + Math.cos(t * 22) * 0.12
          leftArmRef.current.position.z = 0.18 + Math.sin(t * 22) * 0.04
          rightArmRef.current.position.z = 0.18 + Math.cos(t * 22) * 0.04
        }
        // Kaki posisi duduk horizontal
        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.rotation.x = -Math.PI / 2.2
          rightLegRef.current.rotation.x = -Math.PI / 2.2
        }
      } else {
        // Animasi idle mengapung / bernapas naik-turun halus
        bodyRef.current.position.y = 0.65 + Math.sin(t * 2.8) * 0.04
        bodyRef.current.rotation.x = 0
        bodyRef.current.rotation.z = Math.sin(t * 1.5) * 0.02

        // Tangan santai di samping
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.1)
          rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.1)
          leftArmRef.current.position.z = 0
          rightArmRef.current.position.z = 0
        }
        // Kaki tegak
        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.rotation.x = 0
          rightLegRef.current.rotation.x = 0
        }
      }
    }

    // Animasi pendaran halo cincin di lantai jika dipilih
    if (haloRef.current) {
      haloRef.current.scale.setScalar(1 + Math.sin(t * 4) * 0.06)
    }
  })

  const badgeText = isTyping ? `${label} • Typing` : `${label} • ${status}`
  const badgeWidth = badgeText.length * 0.11 + 0.55

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* 6. Floating UI Badge (Billboard Pill Shape) */}
      <Billboard position={[0, 1.45, 0]} follow={true}>
        <RoundedBox args={[badgeWidth, 0.34, 0.03]} radius={0.15} smoothness={3}>
          <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.05} />
        </RoundedBox>
        <mesh position={[-badgeWidth / 2 + 0.2, 0, 0.025]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.0} />
        </mesh>
        <Text
          position={[0.08, 0, 0.025]}
          fontSize={0.12}
          color="#0f172a"
          anchorX="center"
          anchorY="middle"
        >
          {badgeText}
        </Text>
      </Billboard>
      {/* Cincin Seleksi Bercahaya di Lantai */}
      {isSelected && (
        <group ref={haloRef} position={[0, 0.02, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.55, 0.68, 32]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={2.0}
              transparent
              opacity={0.8}
            />
          </mesh>
          <pointLight position={[0, 0.2, 0]} intensity={0.8} distance={1.8} color={color} />
        </group>
      )}

      {/* Bayangan Kontak Halus di Lantai */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 24]} />
        <meshBasicMaterial color="#94a3b8" transparent opacity={0.3} />
      </mesh>

      {/* Hirarki Tubuh Bodi Robot */}
      <group ref={bodyRef} position={[0, 0.65, 0]}>
        {/* Tubuh: CapsuleGeometry glossy halus sesuai warna parameter */}
        <mesh castShadow>
          <capsuleGeometry args={[0.26, 0.35, 24, 32]} />
          <meshStandardMaterial
            color={color}
            roughness={0.12}
            metalness={0.08}
          />
        </mesh>

        {/* Wajah/Visor: Lekukan warna hitam pekat di bagian depan atas */}
        <mesh position={[0, 0.16, 0.2]}>
          <boxGeometry args={[0.38, 0.18, 0.12]} />
          <meshStandardMaterial
            color="#050811"
            roughness={0.15}
            metalness={0.85}
          />
        </mesh>

        {/* Mata Digital: Dua titik bola kecil dengan warna cyan menyala (emissive="#00f3ff") */}
        <mesh position={[-0.09, 0.17, 0.27]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial
            color="#00f3ff"
            emissive="#00f3ff"
            emissiveIntensity={2.5}
          />
        </mesh>
        <mesh position={[0.09, 0.17, 0.27]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial
            color="#00f3ff"
            emissive="#00f3ff"
            emissiveIntensity={2.5}
          />
        </mesh>

        {/* Tangan Kiri: Silinder sederhana */}
        <group ref={leftArmRef} position={[-0.34, 0.02, 0]}>
          <mesh castShadow position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.22, 12]} />
            <meshStandardMaterial color={color} roughness={0.15} />
          </mesh>
        </group>

        {/* Tangan Kanan: Silinder sederhana */}
        <group ref={rightArmRef} position={[0.34, 0.02, 0]}>
          <mesh castShadow position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.22, 12]} />
            <meshStandardMaterial color={color} roughness={0.15} />
          </mesh>
        </group>

        {/* Kaki Kiri: Silinder sederhana */}
        <group ref={leftLegRef} position={[-0.12, -0.28, 0]}>
          <mesh castShadow position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.22, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} />
          </mesh>
        </group>

        {/* Kaki Kanan: Silinder sederhana */}
        <group ref={rightLegRef} position={[0.12, -0.28, 0]}>
          <mesh castShadow position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.22, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
