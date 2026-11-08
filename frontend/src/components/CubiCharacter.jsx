import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'

/**
 * CubiCharacter: Karakter Robot Maskot 3D AICREW yang Identik dengan Landing Page
 * Menggunakan proporsi rounded monitor-head, face bezel warna aksen, digital glowing eyes,
 * spherical neck joint, dan white ceramic chassis halus.
 */
export function CubiCharacter({
  id = 'cubi-agent',
  name = 'Cubi Bot',
  role = 'Agent',
  color = '#0284c7',
  emoji = '🤖',
  vibe = '',
  personaId = '',
  position = [0, 0, 0],
  targetPosition = null,
  rotationY = 0,
  isTyping = false,
  isScanning = false,
  isWalking = false,
  isBoss = false,
  isSelected = false,
  hideBadge = false,
  onClick,
}) {
  const groupRef = useRef()
  const bodyRef = useRef()
  const headRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()
  const leftLegRef = useRef()
  const rightLegRef = useRef()
  const leftEyeRef = useRef()
  const rightEyeRef = useRef()
  const haloRef = useRef()
  const scanBeamRef = useRef()

  // Hash id untuk offset fase napas independen tiap karakter
  const phaseOffset = useRef(
    (id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 1.37) % (Math.PI * 2)
  ).current

  const destPos = useRef(new THREE.Vector3(...(targetPosition || position)))

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime() + phaseOffset

    // 1. Update Posisi Target
    if (targetPosition) {
      destPos.current.set(targetPosition[0], targetPosition[1], targetPosition[2])
    } else {
      destPos.current.set(position[0], position[1], position[2])
    }

    const distToTarget = groupRef.current.position.distanceTo(destPos.current)
    const isMovingToTarget = distToTarget > 0.12
    const moving = isMovingToTarget

    // 2. Perpindahan Halus & Rotasi (Menggunakan interpolasi sudut terpendek untuk mencegah glitch 360 derajat)
    if (isMovingToTarget) {
      groupRef.current.position.lerp(destPos.current, 0.065)

      // Menghadap arah jalan saat bergerak
      const dirX = destPos.current.x - groupRef.current.position.x
      const dirZ = destPos.current.z - groupRef.current.position.z
      if (Math.hypot(dirX, dirZ) > 0.08) {
        const moveAngle = Math.atan2(dirX, dirZ)
        let diff = (moveAngle - groupRef.current.rotation.y) % (Math.PI * 2)
        if (diff < -Math.PI) diff += Math.PI * 2
        if (diff > Math.PI) diff -= Math.PI * 2
        groupRef.current.rotation.y += diff * 0.12
      }
    } else {
      // Tiba di tujuan: Kunci koordinat X & Z secara halus
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, destPos.current.x, 0.15)
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, destPos.current.z, 0.15)
      
      // Rotasi tenang menghadap sudut stasiun kerja tanpa putaran acak
      // Jika agen sedang mengetik/bekerja di meja, selalu pastikan menghadap meja (Math.PI) dan tidak pernah menghadap belakang kursi
      const finalTargetRot = isTyping ? Math.PI : rotationY
      let diff = (finalTargetRot - groupRef.current.rotation.y) % (Math.PI * 2)
      if (diff < -Math.PI) diff += Math.PI * 2
      if (diff > Math.PI) diff -= Math.PI * 2
      groupRef.current.rotation.y += diff * 0.08
    }

    // 3. Animasi Bodi, Kepala, Tangan, dan Kaki (Organik & Hidup)
    if (bodyRef.current) {
      if (moving) {
        // Gerakan Melangkah Halus & Mantap (Kecepatan natural)
        const walkSpeed = 7.5
        const step = Math.sin(t * walkSpeed)
        bodyRef.current.position.y = 0.52 + Math.abs(step) * 0.025
        bodyRef.current.rotation.z = Math.sin(t * (walkSpeed / 2)) * 0.035
        bodyRef.current.rotation.x = 0.045

        // Tangan mengayun seirama langkah
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.position.set(-0.25, 0.04, 0)
          rightArmRef.current.position.set(0.25, 0.04, 0)
          leftArmRef.current.rotation.x = -Math.sin(t * walkSpeed) * 0.4
          rightArmRef.current.rotation.x = Math.sin(t * walkSpeed) * 0.4
          leftArmRef.current.rotation.z = 0.14
          rightArmRef.current.rotation.z = -0.14
        }

        // Kaki melangkah bergantian
        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.rotation.x = Math.sin(t * walkSpeed) * 0.42
          rightLegRef.current.rotation.x = -Math.sin(t * walkSpeed) * 0.42
        }

        if (headRef.current) {
          headRef.current.rotation.x = 0.03
          headRef.current.rotation.y = Math.sin(t * (walkSpeed / 2)) * 0.05
        }
      } else if (isTyping) {
        // Mengetik Cerdas Berirama: 3.5s mengetik, 1.2s membaca monitor
        const typingCycle = (t * 1.5) % 5
        const isTypingActive = typingCycle < 3.8

        bodyRef.current.position.y = 0.47 + Math.sin(t * 2.0) * 0.005
        bodyRef.current.rotation.z = 0
        bodyRef.current.rotation.x = 0.06

        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.position.set(-0.16, 0.02, 0.22)
          rightArmRef.current.position.set(0.16, 0.02, 0.22)

          if (isTypingActive) {
            leftArmRef.current.rotation.x = -0.72 + Math.sin(t * 13) * 0.12
            rightArmRef.current.rotation.x = -0.72 + Math.cos(t * 13) * 0.12
          } else {
            // Tangan istirahat sejenak di atas meja
            leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -0.65, 0.1)
            rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.65, 0.1)
          }
          leftArmRef.current.rotation.z = 0.12
          rightArmRef.current.rotation.z = -0.12
        }

        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.rotation.x = 0
          rightLegRef.current.rotation.x = 0
        }

        if (headRef.current) {
          if (isTypingActive) {
            headRef.current.rotation.x = 0.12 + Math.sin(t * 2.5) * 0.02
            headRef.current.rotation.y = Math.sin(t * 1.2) * 0.03
          } else {
            // Menatap layar lebih tinggi membaca kode/penawaran
            headRef.current.rotation.x = 0.05
            headRef.current.rotation.y = Math.sin(t * 0.8) * 0.06
          }
        }
      } else if (isScanning) {
        // Mode Scanner Keamanan: Berdiri tegak, kepala menoleh teliti
        bodyRef.current.position.y = 0.52 + Math.sin(t * 1.5) * 0.008
        bodyRef.current.rotation.z = 0
        bodyRef.current.rotation.x = 0

        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.position.set(-0.25, 0.04, 0)
          rightArmRef.current.position.set(0.25, 0.04, 0)
          leftArmRef.current.rotation.x = 0.1
          rightArmRef.current.rotation.x = 0.1
          leftArmRef.current.rotation.z = 0.18
          rightArmRef.current.rotation.z = -0.18
        }

        if (headRef.current) {
          headRef.current.rotation.y = Math.sin(t * 2.2) * 0.35
          headRef.current.rotation.x = 0.12
        }

        if (scanBeamRef.current) {
          scanBeamRef.current.rotation.y = Math.sin(t * 3) * 0.2
        }
      } else {
        // Mode Tenang Idle: Napas organik & sesekali menoleh lembut
        const idleBreathing = Math.sin(t * 1.8) * 0.012
        bodyRef.current.position.y = 0.52 + idleBreathing
        bodyRef.current.rotation.z = 0
        bodyRef.current.rotation.x = 0

        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.position.set(-0.25, 0.04, 0)
          rightArmRef.current.position.set(0.25, 0.04, 0)
          leftArmRef.current.rotation.x = Math.sin(t * 1.6) * 0.04
          rightArmRef.current.rotation.x = Math.sin(t * 1.6) * 0.04
          leftArmRef.current.rotation.z = 0.16
          rightArmRef.current.rotation.z = -0.16
        }

        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.rotation.x = 0
          rightLegRef.current.rotation.x = 0
        }

        if (headRef.current) {
          headRef.current.rotation.y = Math.sin(t * 0.6) * 0.14
          headRef.current.rotation.x = Math.sin(t * 0.9) * 0.04
        }
      }
    }

    // 4. Kedipan Mata Digital Halus
    const blinkCycle = t % 4.5
    const isBlinking = blinkCycle > 4.2 && blinkCycle < 4.38
    const eyeScaleY = isBlinking ? 0.12 : 1.0

    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.scale.y = eyeScaleY
      rightEyeRef.current.scale.y = eyeScaleY
    }

    // 5. Cincin Seleksi Berputar Pelan
    if (haloRef.current) {
      haloRef.current.rotation.y += 0.02
    }
  })

  const accentColor = isBoss ? '#192A56' : color || '#0284c7'
  const eyeColor = '#FFFFFF'
  const showBadge = isSelected || isWalking || isScanning

  const badgeText = isWalking
    ? `${name} • Moving`
    : isTyping
    ? `${name} • Working`
    : isScanning
    ? `${name} • Scanning`
    : `${name} • ${role}`

  return (
    <group
      ref={groupRef}
      position={position}
      scale={isBoss ? 1.4 : 1.25}
      onClick={(e) => {
        e.stopPropagation()
        if (onClick) onClick(id)
      }}
      cursor="pointer"
    >
      {/* Floating Blueprint Badge (Tampil Rapi Saat Terpilih / Aktif, Disembunyikan di Mode Pure Fullscreen) */}
      {showBadge && !hideBadge && (
        <Billboard position={[0, isBoss ? 1.55 : 1.45, 0]} follow={true}>
          <RoundedBox args={[badgeText.length * 0.075 + 0.45, 0.26, 0.02]} radius={0.06} smoothness={3}>
            <meshStandardMaterial color="#F8F5EC" roughness={0.15} />
          </RoundedBox>
          <mesh position={[-(badgeText.length * 0.075 + 0.45) / 2 + 0.12, 0, 0.015]}>
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={2.5}
            />
          </mesh>
          <Text
            position={[0.06, 0, 0.015]}
            fontSize={0.10}
            color="#192A56"
            anchorX="center"
            anchorY="middle"
            fontFamily="monospace"
          >
            {badgeText}
          </Text>
        </Billboard>
      )}

      {/* Cincin Seleksi Bercahaya di Lantai */}
      {isSelected && (
        <group ref={haloRef} position={[0, 0.02, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.48, 0.58, 32]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={2.2}
              transparent
              opacity={0.85}
            />
          </mesh>
          <pointLight position={[0, 0.2, 0]} intensity={1.2} distance={1.8} color={accentColor} />
        </group>
      )}

      {/* Bayangan Kontak Halus di Lantai */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.32, 24]} />
        <meshBasicMaterial color="#192A56" transparent opacity={0.18} />
      </mesh>

      {/* Bodi Utama Karakter Robot Maskot AICREW */}
      <group ref={bodyRef} position={[0, 0.52, 0]}>
        
        {/* ========================================================= */}
        {/* 1. KEPALA MONITOR ROUNDED SQUIRCLE (Identik Landing Page) */}
        {/* ========================================================= */}
        <group ref={headRef} position={[0, 0.42, 0]}>
          
          {/* Casing Luar Putih Mulus */}
          <RoundedBox
            args={[0.68, 0.58, 0.52]}
            radius={0.13}
            smoothness={4}
            castShadow
          >
            <meshStandardMaterial color="#FFFFFF" roughness={0.18} metalness={0.08} />
          </RoundedBox>

          {/* Bezel Aksen Deep Navy / Warna Agen */}
          <group position={[0, 0, 0.25]}>
            <RoundedBox args={[0.56, 0.46, 0.03]} radius={0.09} smoothness={3}>
              <meshStandardMaterial color={accentColor} roughness={0.25} metalness={0.2} />
            </RoundedBox>
          </group>

          {/* Layar Kaca Hitam Mengkilap di Depan */}
          <group position={[0, 0, 0.265]}>
            <RoundedBox args={[0.50, 0.40, 0.02]} radius={0.07} smoothness={3}>
              <meshStandardMaterial color="#0A0E1A" roughness={0.08} metalness={0.88} />
            </RoundedBox>
          </group>

          {/* Mata LED Kapsul Digital Putih Kiri */}
          <mesh ref={leftEyeRef} position={[-0.11, 0.025, 0.28]}>
            <capsuleGeometry args={[0.026, 0.055, 10, 14]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={2.8} />
          </mesh>

          {/* Mata LED Kapsul Digital Putih Kanan */}
          <mesh ref={rightEyeRef} position={[0.11, 0.025, 0.28]}>
            <capsuleGeometry args={[0.026, 0.055, 10, 14]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={2.8} />
          </mesh>

          {/* Dial / Antena Samping Membulat */}
          <mesh position={[-0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.055, 0.055, 0.05, 16]} />
            <meshStandardMaterial color={accentColor} roughness={0.25} metalness={0.3} />
          </mesh>
          <mesh position={[0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.055, 0.055, 0.05, 16]} />
            <meshStandardMaterial color={accentColor} roughness={0.25} metalness={0.3} />
          </mesh>

          {/* Mahkota Mini Platinum Eksklusif untuk Bos / Direktur */}
          {isBoss && (
            <group position={[0, 0.32, 0]}>
              <mesh position={[0, 0.02, 0]}>
                <cylinderGeometry args={[0.13, 0.11, 0.04, 16]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.18} />
              </mesh>
              {[-0.07, 0.07].map((x) =>
                [-0.07, 0.07].map((z) => (
                  <mesh key={`${x}-${z}`} position={[x, 0.06, z]}>
                    <coneGeometry args={[0.025, 0.07, 8]} />
                    <meshStandardMaterial color="#192A56" metalness={0.8} roughness={0.2} />
                  </mesh>
                ))
              )}
              <mesh position={[0, 0.04, 0.11]}>
                <sphereGeometry args={[0.02, 10, 10]} />
                <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={2.2} />
              </mesh>
            </group>
          )}

          {/* Antena Radio untuk Green Agent (WhatsApp Gate) */}
          {!isBoss && id === 'green-agent' && (
            <group position={[0, 0.30, 0]}>
              <mesh position={[0, 0.06, 0]}>
                <cylinderGeometry args={[0.01, 0.015, 0.13, 8]} />
                <meshStandardMaterial color="#334155" metalness={0.8} />
              </mesh>
              <mesh position={[0, 0.14, 0]}>
                <sphereGeometry args={[0.03, 12, 12]} />
                <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2.8} />
              </mesh>
            </group>
          )}

          {/* Scanner Holografik Beam saat inspeksi */}
          {isScanning && (
            <group position={[0, 0, 0.30]} rotation={[0.45, 0, 0]}>
              <mesh ref={scanBeamRef} position={[0, -0.65, 0.4]}>
                <coneGeometry args={[0.45, 1.2, 20, 1, true]} />
                <meshBasicMaterial
                  color="#38bdf8"
                  transparent
                  opacity={0.3}
                  side={THREE.DoubleSide}
                />
              </mesh>
              <pointLight color="#38bdf8" intensity={1.8} distance={2.0} />
            </group>
          )}
        </group>

        {/* Sendi Leher Bola Sferis */}
        <mesh position={[0, 0.14, 0]}>
          <sphereGeometry args={[0.075, 14, 14]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* ========================================================= */}
        {/* 2. TORSO / BADAN ROBOT BULAT HALUS                        */}
        {/* ========================================================= */}
        <group position={[0, -0.04, 0]}>
          {/* Casing Badan Putih Mulus */}
          <RoundedBox
            args={[0.46, 0.38, 0.34]}
            radius={0.10}
            smoothness={4}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#FFFFFF" roughness={0.18} metalness={0.08} />
          </RoundedBox>

          {/* Indikator Garis / Pill Status di Dada */}
          <mesh position={[0, 0.04, 0.175]}>
            <capsuleGeometry args={[0.018, 0.09, 8, 12]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={2.4}
            />
          </mesh>

          {/* Aksen Dasi / Medali Eksekutif untuk Direktur */}
          {isBoss && (
            <group position={[0, -0.06, 0.18]}>
              <mesh>
                <coneGeometry args={[0.04, 0.10, 4]} rotation={[0, 0, Math.PI]} />
                <meshStandardMaterial color="#192A56" metalness={0.8} roughness={0.2} />
              </mesh>
            </group>
          )}

          {/* Dual Storage Pods untuk Cubi Vault */}
          {!isBoss && id === 'orange-agent' && (
            <group position={[0, 0, -0.19]}>
              <mesh position={[-0.08, 0, 0]}>
                <boxGeometry args={[0.07, 0.18, 0.04]} />
                <meshStandardMaterial color="#334155" metalness={0.85} />
              </mesh>
              <mesh position={[0.08, 0, 0]}>
                <boxGeometry args={[0.07, 0.18, 0.04]} />
                <meshStandardMaterial color="#334155" metalness={0.85} />
              </mesh>
            </group>
          )}
        </group>

        {/* ========================================================= */}
        {/* 3. TANGAN KIRI & KANAN                                    */}
        {/* ========================================================= */}
        {/* Tangan Kiri */}
        <group ref={leftArmRef} position={[-0.25, 0.04, 0]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.042, 12, 12]} />
            <meshStandardMaterial color={accentColor} metalness={0.3} roughness={0.25} />
          </mesh>
          <mesh position={[-0.02, -0.08, 0]}>
            <capsuleGeometry args={[0.032, 0.08, 8, 12]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.1} />
          </mesh>
          <mesh position={[-0.02, -0.15, 0]}>
            <sphereGeometry args={[0.036, 12, 12]} />
            <meshStandardMaterial color={accentColor} roughness={0.25} />
          </mesh>
        </group>

        {/* Tangan Kanan */}
        <group ref={rightArmRef} position={[0.25, 0.04, 0]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.042, 12, 12]} />
            <meshStandardMaterial color={accentColor} metalness={0.3} roughness={0.25} />
          </mesh>
          <mesh position={[0.02, -0.08, 0]}>
            <capsuleGeometry args={[0.032, 0.08, 8, 12]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.1} />
          </mesh>
          <mesh position={[0.02, -0.15, 0]}>
            <sphereGeometry args={[0.036, 12, 12]} />
            <meshStandardMaterial color={accentColor} roughness={0.25} />
          </mesh>
        </group>

        {/* ========================================================= */}
        {/* 4. KAKI KIRI & KANAN                                      */}
        {/* ========================================================= */}
        {/* Kaki Kiri */}
        <group ref={leftLegRef} position={[-0.12, -0.24, 0]}>
          <mesh position={[0, -0.06, 0]}>
            <cylinderGeometry args={[0.038, 0.046, 0.12, 12]} />
            <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.5} />
          </mesh>
          <mesh position={[0, -0.13, 0.02]}>
            <capsuleGeometry args={[0.038, 0.08, 8, 12]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.1} />
          </mesh>
        </group>

        {/* Kaki Kanan */}
        <group ref={rightLegRef} position={[0.12, -0.24, 0]}>
          <mesh position={[0, -0.06, 0]}>
            <cylinderGeometry args={[0.038, 0.046, 0.12, 12]} />
            <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.5} />
          </mesh>
          <mesh position={[0, -0.13, 0.02]}>
            <capsuleGeometry args={[0.038, 0.08, 8, 12]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.1} />
          </mesh>
        </group>

      </group>
    </group>
  )
}
