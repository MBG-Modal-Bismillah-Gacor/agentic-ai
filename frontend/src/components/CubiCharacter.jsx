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
  scale = null,
  isTyping = false,
  isScanning = false,
  isWalking = false,
  isBoss = false,
  isSitting = false,
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
  const antennaBeaconRef = useRef()
  const haloRef = useRef()
  const scanBeamRef = useRef()

  // Hash id untuk offset fase napas independen tiap karakter
  const phaseOffset = useRef(
    (id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 1.37) % (Math.PI * 2)
  ).current

  const destPos = useRef(new THREE.Vector3(
    Array.isArray(targetPosition?.[0]) ? targetPosition[0][0] : (targetPosition?.[0] ?? position[0]),
    Array.isArray(targetPosition?.[0]) ? targetPosition[0][1] : (targetPosition?.[1] ?? position[1]),
    Array.isArray(targetPosition?.[0]) ? targetPosition[0][2] : (targetPosition?.[2] ?? position[2])
  ))

  const waypointIdxRef = useRef(0)
  const lastTargetPosRef = useRef(null)

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime() + phaseOffset

    // 1. Waypoint & Posisi Target Navigation
    const isMultiWaypoint = Array.isArray(targetPosition) && Array.isArray(targetPosition[0])
    
    if (isMultiWaypoint) {
      if (lastTargetPosRef.current !== targetPosition) {
        lastTargetPosRef.current = targetPosition
        waypointIdxRef.current = 0
      }
      const currentWp = targetPosition[waypointIdxRef.current] || targetPosition[targetPosition.length - 1]
      destPos.current.set(currentWp[0], currentWp[1], currentWp[2])
      
      const distToCurrentWp = Math.hypot(
        destPos.current.x - groupRef.current.position.x,
        destPos.current.z - groupRef.current.position.z
      )
      if (distToCurrentWp < 0.28 && waypointIdxRef.current < targetPosition.length - 1) {
        waypointIdxRef.current += 1
        const nextWp = targetPosition[waypointIdxRef.current]
        destPos.current.set(nextWp[0], nextWp[1], nextWp[2])
      }
    } else if (targetPosition) {
      destPos.current.set(targetPosition[0], targetPosition[1], targetPosition[2])
    } else {
      destPos.current.set(position[0], position[1], position[2])
    }

    const distToTarget = groupRef.current.position.distanceTo(destPos.current)
    const isMovingToTarget = isMultiWaypoint ? (waypointIdxRef.current < targetPosition.length - 1 || distToTarget > 0.12) : distToTarget > 0.10
    const moving = isMovingToTarget

    // 2. Perpindahan Halus, Stabil & Rotasi Presisi
    if (isMovingToTarget) {
      const dirX = destPos.current.x - groupRef.current.position.x
      const dirZ = destPos.current.z - groupRef.current.position.z
      const dist = Math.hypot(dirX, dirZ)

      if (dist > 0.04) {
        // Kecepatan jalan normal berbobot alami (bukan super cepat seperti The Flash)
        const speed = Math.min(0.035, (delta || 0.016) * 1.35)
        const step = Math.min(speed, dist)
        groupRef.current.position.x += (dirX / dist) * step
        groupRef.current.position.z += (dirZ / dist) * step
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, destPos.current.y, 0.08)

        // Menghadap arah jalan secara mantap & halus
        const moveAngle = Math.atan2(dirX, dirZ)
        let diff = (moveAngle - groupRef.current.rotation.y) % (Math.PI * 2)
        if (diff < -Math.PI) diff += Math.PI * 2
        if (diff > Math.PI) diff -= Math.PI * 2
        groupRef.current.rotation.y += diff * 0.08
      }
    } else {
      // Tiba di tujuan: Kunci koordinat X & Z secara halus tanpa snapping
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, destPos.current.x, 0.08)
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, destPos.current.z, 0.08)
      
      // Menghadap ke stasiun kerja dengan mantap, atau menghadap ke user saat dipilih
      let finalTargetRot = rotationY
      if (isSelected) {
        // Saat diklik/terpilih: Menoleh ramah menghadap sudut pandang kamera (Isometric [26, 22, 26])
        finalTargetRot = Math.atan2(26 - groupRef.current.position.x, 26 - groupRef.current.position.z)
      } else if (isTyping) {
        finalTargetRot = Math.PI
      }

      let diff = (finalTargetRot - groupRef.current.rotation.y) % (Math.PI * 2)
      if (diff < -Math.PI) diff += Math.PI * 2
      if (diff > Math.PI) diff -= Math.PI * 2
      groupRef.current.rotation.y += diff * 0.08
    }

    // 3. Animasi Bodi, Kepala, Tangan, dan Kaki (Gerakan Tenang, Berbobot, Alami & Realistis)
    if (bodyRef.current) {
      if (moving) {
        // Mode Berjalan: Langkah mantap & santai, bobbing berbobot
        const walkSpeed = 4.2
        const step = Math.sin(t * walkSpeed)
        bodyRef.current.position.y = 0.52 + Math.abs(step) * 0.035
        bodyRef.current.position.z = 0
        bodyRef.current.rotation.z = Math.sin(t * (walkSpeed / 2)) * 0.025
        bodyRef.current.rotation.x = 0.04

        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.position.set(-0.25, 0.04, 0)
          rightArmRef.current.position.set(0.25, 0.04, 0)
          leftArmRef.current.rotation.x = -Math.sin(t * walkSpeed) * 0.38
          rightArmRef.current.rotation.x = Math.sin(t * walkSpeed) * 0.38
          leftArmRef.current.rotation.z = 0.12
          rightArmRef.current.rotation.z = -0.12
        }

        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.position.set(-0.12, -0.24, 0)
          rightLegRef.current.position.set(0.12, -0.24, 0)
          leftLegRef.current.rotation.x = Math.sin(t * walkSpeed) * 0.38
          rightLegRef.current.rotation.x = -Math.sin(t * walkSpeed) * 0.38
          leftLegRef.current.rotation.z = 0
          rightLegRef.current.rotation.z = 0
        }

        if (headRef.current) {
          headRef.current.rotation.x = 0.04
          headRef.current.rotation.y = Math.sin(t * (walkSpeed / 2)) * 0.06
          headRef.current.rotation.z = 0
        }
      } else if (isSitting) {
        // =========================================================
        // MODE DUDUK DI KURSI (Duduk Santai di Atas Dudukan Kursi)
        // Kaki menekuk 90 derajat mendatar ke depan, bodi bersandar di sandaran kursi
        // =========================================================
        const baseSittingY = isBoss ? 0.38 : 0.42

        if (isSelected) {
          // Duduk sambil melambai ramah ke user (Tempo lambat, realistis)
          const cheerSpeed = 3.2
          bodyRef.current.position.y = baseSittingY + Math.abs(Math.sin(t * cheerSpeed)) * 0.035
          bodyRef.current.position.z = -0.06
          bodyRef.current.rotation.x = -0.04
          bodyRef.current.rotation.z = Math.sin(t * (cheerSpeed * 0.5)) * 0.02

          if (rightArmRef.current) {
            rightArmRef.current.position.set(0.24, 0.18, 0.12)
            rightArmRef.current.rotation.x = -1.25 + Math.sin(t * cheerSpeed) * 0.18
            rightArmRef.current.rotation.z = -0.35 + Math.cos(t * cheerSpeed) * 0.12
          }

          if (leftArmRef.current) {
            leftArmRef.current.position.set(-0.25, 0.06, 0.06)
            leftArmRef.current.rotation.x = 0.1
            leftArmRef.current.rotation.z = 0.18
          }

          if (leftLegRef.current && rightLegRef.current) {
            leftLegRef.current.position.set(-0.12, -0.16, 0.08)
            rightLegRef.current.position.set(0.12, -0.16, 0.08)
            leftLegRef.current.rotation.x = -1.45 + Math.sin(t * cheerSpeed) * 0.08
            rightLegRef.current.rotation.x = -1.45 - Math.sin(t * cheerSpeed) * 0.08
            leftLegRef.current.rotation.z = 0.04
            rightLegRef.current.rotation.z = -0.04
          }

          if (headRef.current) {
            headRef.current.rotation.x = -0.08 + Math.sin(t * cheerSpeed * 0.5) * 0.03
            headRef.current.rotation.y = Math.sin(t * 1.5) * 0.15
            headRef.current.rotation.z = Math.sin(t * cheerSpeed * 0.5) * 0.04
          }
        } else if (isTyping) {
          // Duduk Mengetik di Workstation Desk 01 (Cubi Scout): Ritme mengetik alami
          const typingSpeed = 3.8
          bodyRef.current.position.y = baseSittingY + Math.sin(t * 1.5) * 0.015
          bodyRef.current.position.z = -0.05
          bodyRef.current.rotation.x = 0.04
          bodyRef.current.rotation.z = Math.sin(t * 1.0) * 0.012

          if (leftArmRef.current && rightArmRef.current) {
            leftArmRef.current.position.set(-0.16, 0.03 + Math.sin(t * typingSpeed) * 0.015, 0.24)
            rightArmRef.current.position.set(0.16, 0.03 + Math.cos(t * typingSpeed) * 0.015, 0.24)
            leftArmRef.current.rotation.x = -0.85 + Math.sin(t * typingSpeed) * 0.14
            rightArmRef.current.rotation.x = -0.85 + Math.cos(t * typingSpeed) * 0.14
            leftArmRef.current.rotation.z = 0.10
            rightArmRef.current.rotation.z = -0.10
          }

          if (leftLegRef.current && rightLegRef.current) {
            leftLegRef.current.position.set(-0.12, -0.16, 0.08)
            rightLegRef.current.position.set(0.12, -0.16, 0.08)
            leftLegRef.current.rotation.x = -1.45
            rightLegRef.current.rotation.x = -1.45
            leftLegRef.current.rotation.z = 0.04
            rightLegRef.current.rotation.z = -0.04
          }

          if (headRef.current) {
            headRef.current.rotation.x = 0.10 + Math.sin(t * 1.5) * 0.04
            headRef.current.rotation.y = Math.sin(t * 0.8) * 0.18
            headRef.current.rotation.z = Math.sin(t * 1.0) * 0.02
          }
        } else if (isBoss || id === 'boss') {
          // Duduk di Kursi Kulit Direktur (Pak Alfa): Postur berwibawa, menatap santai mengawasi ruangan
          bodyRef.current.position.y = baseSittingY + Math.sin(t * 2.0) * 0.03
          bodyRef.current.position.z = -0.07
          bodyRef.current.rotation.x = -0.06
          bodyRef.current.rotation.z = Math.sin(t * 1.4) * 0.025

          if (leftArmRef.current && rightArmRef.current) {
            leftArmRef.current.position.set(-0.26, 0.06, 0.08)
            leftArmRef.current.rotation.x = -0.32 + Math.cos(t * 1.4) * 0.08
            leftArmRef.current.rotation.z = 0.22

            rightArmRef.current.position.set(0.24, 0.08, 0.12)
            rightArmRef.current.rotation.x = -0.58 + Math.sin(t * 1.6) * 0.28
            rightArmRef.current.rotation.z = -0.18
          }

          if (leftLegRef.current && rightLegRef.current) {
            leftLegRef.current.position.set(-0.12, -0.16, 0.08)
            rightLegRef.current.position.set(0.12, -0.16, 0.08)
            leftLegRef.current.rotation.x = -1.45 + Math.sin(t * 2.0) * 0.04
            rightLegRef.current.rotation.x = -1.45 + Math.cos(t * 2.0) * 0.04
            leftLegRef.current.rotation.z = 0.06
            rightLegRef.current.rotation.z = -0.06
          }

          if (headRef.current) {
            headRef.current.rotation.y = Math.sin(t * 0.9) * 0.45
            headRef.current.rotation.x = 0.05 + Math.sin(t * 1.5) * 0.08
            headRef.current.rotation.z = Math.sin(t * 1.1) * 0.03
          }
        } else {
          // Duduk Tenang Santai Lainnya
          bodyRef.current.position.y = baseSittingY + Math.sin(t * 2.2) * 0.035
          bodyRef.current.position.z = -0.06
          bodyRef.current.rotation.x = -0.06
          bodyRef.current.rotation.z = Math.sin(t * 1.6) * 0.025

          if (leftArmRef.current && rightArmRef.current) {
            leftArmRef.current.position.set(-0.25, 0.05, 0.06)
            rightArmRef.current.position.set(0.25, 0.05, 0.06)
            leftArmRef.current.rotation.x = -0.35 + Math.sin(t * 2.2) * 0.15
            rightArmRef.current.rotation.x = -0.35 + Math.cos(t * 2.2) * 0.15
            leftArmRef.current.rotation.z = 0.20
            rightArmRef.current.rotation.z = -0.20
          }

          if (leftLegRef.current && rightLegRef.current) {
            leftLegRef.current.position.set(-0.12, -0.16, 0.08)
            rightLegRef.current.position.set(0.12, -0.16, 0.08)
            leftLegRef.current.rotation.x = -1.45 + Math.sin(t * 2.2) * 0.05
            rightLegRef.current.rotation.x = -1.45 + Math.cos(t * 2.2) * 0.05
            leftLegRef.current.rotation.z = 0.06
            rightLegRef.current.rotation.z = -0.06
          }

          if (headRef.current) {
            headRef.current.rotation.y = Math.sin(t * 1.0) * 0.38 + Math.cos(t * 0.4) * 0.15
            headRef.current.rotation.x = 0.06 + Math.sin(t * 1.8) * 0.08
            headRef.current.rotation.z = Math.sin(t * 0.9) * 0.06
          }
        }
      } else {
        // =========================================================
        // MODE BERDIRI AKTIF (Posisi Tegak di Stasiun Masing-Masing)
        // Gerakan Sangat Terlihat & Hidup dari Kamera Isometrik Jauh
        // =========================================================
        bodyRef.current.position.z = 0

        // Reset posisi pangkal kaki ke bawah bodi
        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.position.set(-0.12, -0.24, 0)
          rightLegRef.current.position.set(0.12, -0.24, 0)
          leftLegRef.current.rotation.z = 0
          rightLegRef.current.rotation.z = 0
        }

        if (isSelected) {
          // Berdiri sambil melambai ramah ke user (Tempo lambat, realistis)
          const cheerSpeed = 3.0
          bodyRef.current.position.y = 0.52 + Math.abs(Math.sin(t * cheerSpeed)) * 0.035
          bodyRef.current.rotation.z = Math.sin(t * (cheerSpeed * 0.5)) * 0.02
          bodyRef.current.rotation.x = 0.02

          if (rightArmRef.current) {
            rightArmRef.current.position.set(0.24, 0.16, 0.12)
            rightArmRef.current.rotation.x = -1.25 + Math.sin(t * cheerSpeed) * 0.18
            rightArmRef.current.rotation.z = -0.35 + Math.cos(t * cheerSpeed) * 0.12
          }

          if (leftArmRef.current) {
            leftArmRef.current.position.set(-0.25, 0.04, 0)
            leftArmRef.current.rotation.x = 0.10
            leftArmRef.current.rotation.z = 0.16
          }

          if (leftLegRef.current && rightLegRef.current) {
            leftLegRef.current.rotation.x = Math.sin(t * cheerSpeed) * 0.06
            rightLegRef.current.rotation.x = -Math.sin(t * cheerSpeed) * 0.06
          }

          if (headRef.current) {
            headRef.current.rotation.x = -0.06 + Math.sin(t * cheerSpeed * 0.5) * 0.03
            headRef.current.rotation.y = Math.sin(t * 1.2) * 0.14
            headRef.current.rotation.z = Math.sin(t * cheerSpeed * 0.5) * 0.03
          }
        } else if (isScanning) {
          // Mode Scanner Holografik: Menoleh luas meneliti data, tangan mengkalibrasi hologram secara halus
          bodyRef.current.position.y = 0.52 + Math.sin(t * 1.2) * 0.02
          bodyRef.current.rotation.z = 0
          bodyRef.current.rotation.x = 0

          if (leftArmRef.current && rightArmRef.current) {
            leftArmRef.current.position.set(-0.25, 0.04, 0)
            leftArmRef.current.rotation.x = 0.10
            leftArmRef.current.rotation.z = 0.14

            rightArmRef.current.position.set(0.20, 0.12, 0.18)
            rightArmRef.current.rotation.x = -0.75 + Math.sin(t * 1.2) * 0.12
            rightArmRef.current.rotation.z = -0.16
          }

          if (headRef.current) {
            headRef.current.rotation.y = Math.sin(t * 1.1) * 0.32
            headRef.current.rotation.x = 0.08
            headRef.current.rotation.z = 0
          }

          if (scanBeamRef.current) {
            scanBeamRef.current.rotation.y = Math.sin(t * 1.5) * 0.15
          }
        } else if (id === 'purple-agent') {
          // Stasiun Kanban (Scribe): Gerakan Luwes & Alami menata task card di board kaca
          bodyRef.current.position.y = 0.52 + Math.sin(t * 1.2) * 0.025
          bodyRef.current.rotation.z = Math.sin(t * 0.9) * 0.02
          bodyRef.current.rotation.x = 0.02

          if (leftArmRef.current && rightArmRef.current) {
            // Tangan kiri memegang smart tablet di pinggang
            leftArmRef.current.position.set(-0.22, 0.08, 0.14)
            leftArmRef.current.rotation.x = -0.45 + Math.cos(t * 1.1) * 0.12
            leftArmRef.current.rotation.z = 0.18

            // Tangan kanan mengayun santai menunjuk kartu Kanban di papan
            rightArmRef.current.position.set(0.22, 0.14, 0.18)
            rightArmRef.current.rotation.x = -0.95 + Math.sin(t * 1.1) * 0.22
            rightArmRef.current.rotation.z = -0.20 + Math.cos(t * 0.9) * 0.12
          }

          if (leftLegRef.current && rightLegRef.current) {
            leftLegRef.current.rotation.x = Math.sin(t * 1.0) * 0.03
            rightLegRef.current.rotation.x = -Math.sin(t * 1.0) * 0.03
          }

          if (headRef.current) {
            headRef.current.rotation.x = -0.12 + Math.sin(t * 1.0) * 0.08
            headRef.current.rotation.y = Math.sin(t * 0.7) * 0.22
            headRef.current.rotation.z = Math.sin(t * 0.8) * 0.02
          }
        } else if (id === 'green-agent') {
          // Stasiun Gatekeeper (Cubi Gate): Sangat hidup & aktif - Siklus Memantau, Menyapa Tamu, & Verifikasi
          const gateCycle = t % 15

          if (antennaBeaconRef.current) {
            antennaBeaconRef.current.material.emissiveIntensity = 2.2 + Math.sin(t * 6.0) * 1.5
          }

          if (gateCycle < 5) {
            // Fase 1: Memantau pintu masuk resepsionis secara seksama (Attentive Scan)
            bodyRef.current.position.y = 0.52 + Math.sin(t * 1.2) * 0.02
            bodyRef.current.rotation.z = Math.sin(t * 0.8) * 0.02
            bodyRef.current.rotation.x = 0

            if (leftArmRef.current && rightArmRef.current) {
              leftArmRef.current.position.set(-0.24, 0.04, 0.05)
              leftArmRef.current.rotation.x = -0.3 + Math.cos(t * 0.9) * 0.06
              leftArmRef.current.rotation.z = 0.16

              rightArmRef.current.position.set(0.24, 0.06, 0.10)
              rightArmRef.current.rotation.x = -0.45 + Math.sin(t * 1.1) * 0.10
              rightArmRef.current.rotation.z = -0.18
            }

            if (headRef.current) {
              headRef.current.rotation.y = Math.sin(t * 0.75) * 0.42
              headRef.current.rotation.x = 0.04 + Math.sin(t * 1.2) * 0.03
              headRef.current.rotation.z = Math.sin(t * 0.6) * 0.04
            }
          } else if (gateCycle < 10) {
            // Fase 2: Melambaikan tangan ramah menyapa pengunjung yang masuk (Friendly Greeting Wave)
            bodyRef.current.position.y = 0.53 + Math.sin(t * 1.5) * 0.025
            bodyRef.current.rotation.z = Math.sin(t * 0.8) * 0.025
            bodyRef.current.rotation.x = 0.02

            if (leftArmRef.current) {
              leftArmRef.current.position.set(-0.25, 0.03, 0)
              leftArmRef.current.rotation.x = -0.2
              leftArmRef.current.rotation.z = 0.18
            }

            if (rightArmRef.current) {
              rightArmRef.current.position.set(0.26, 0.20, 0.08)
              rightArmRef.current.rotation.x = -0.35 + Math.sin(t * 1.5) * 0.10
              rightArmRef.current.rotation.z = -1.15 + Math.sin(t * 6.5) * 0.28
            }

            if (headRef.current) {
              headRef.current.rotation.y = 0.15 + Math.sin(t * 1.2) * 0.15
              headRef.current.rotation.x = -0.05
              headRef.current.rotation.z = 0.12 + Math.sin(t * 2.5) * 0.04
            }
          } else {
            // Fase 3: Mengetik & mengecek verifikasi tiket approval di konsol meja resepsionis (Active Dispatch Typing)
            bodyRef.current.position.y = 0.51 + Math.sin(t * 2.0) * 0.015
            bodyRef.current.rotation.z = 0
            bodyRef.current.rotation.x = 0.05

            if (leftArmRef.current && rightArmRef.current) {
              leftArmRef.current.position.set(-0.16, 0.08, 0.20)
              leftArmRef.current.rotation.x = -0.85 + Math.sin(t * 8.5) * 0.12
              leftArmRef.current.rotation.z = 0.12

              rightArmRef.current.position.set(0.16, 0.08, 0.20)
              rightArmRef.current.rotation.x = -0.85 + Math.cos(t * 8.5) * 0.12
              rightArmRef.current.rotation.z = -0.12
            }

            if (headRef.current) {
              headRef.current.rotation.y = Math.sin(t * 1.2) * 0.12
              headRef.current.rotation.x = 0.22 + Math.sin(t * 1.8) * 0.04
              headRef.current.rotation.z = 0
            }
          }

          if (leftLegRef.current && rightLegRef.current) {
            leftLegRef.current.rotation.x = Math.sin(t * 1.1) * 0.02
            rightLegRef.current.rotation.x = -Math.sin(t * 1.1) * 0.02
          }
        } else if (id === 'orange-agent') {
          // Stasiun Vault Server (Vault): Tenang memeriksa server
          bodyRef.current.position.y = 0.52 + Math.sin(t * 1.2) * 0.025
          bodyRef.current.rotation.z = Math.sin(t * 0.9) * 0.02
          bodyRef.current.rotation.x = 0.02

          if (leftArmRef.current && rightArmRef.current) {
            leftArmRef.current.position.set(-0.20, 0.10, 0.18)
            leftArmRef.current.rotation.x = -0.75 + Math.sin(t * 1.2) * 0.18
            leftArmRef.current.rotation.z = 0.15

            rightArmRef.current.position.set(0.20, 0.12, 0.18)
            rightArmRef.current.rotation.x = -0.85 + Math.cos(t * 1.0) * 0.20
            rightArmRef.current.rotation.z = -0.15
          }

          if (leftLegRef.current && rightLegRef.current) {
            leftLegRef.current.rotation.x = Math.sin(t * 1.2) * 0.025
            rightLegRef.current.rotation.x = -Math.sin(t * 1.2) * 0.025
          }

          if (headRef.current) {
            headRef.current.rotation.x = -0.15 + Math.sin(t * 0.9) * 0.12
            headRef.current.rotation.y = Math.sin(t * 0.7) * 0.20
            headRef.current.rotation.z = 0
          }
        } else {
          // Mode Berdiri Idle Default
          const idleBreathing = Math.sin(t * 2.2) * 0.075
          bodyRef.current.position.y = 0.52 + idleBreathing
          bodyRef.current.rotation.z = Math.sin(t * 1.4) * 0.045
          bodyRef.current.rotation.x = Math.sin(t * 1.8) * 0.03

          if (leftArmRef.current && rightArmRef.current) {
            leftArmRef.current.position.set(-0.25, 0.04, 0)
            rightArmRef.current.position.set(0.25, 0.04, 0)
            leftArmRef.current.rotation.x = Math.sin(t * 2.2) * 0.35
            rightArmRef.current.rotation.x = -Math.sin(t * 2.2) * 0.35
            leftArmRef.current.rotation.z = 0.22 + Math.cos(t * 1.8) * 0.10
            rightArmRef.current.rotation.z = -0.22 - Math.cos(t * 1.8) * 0.10
          }

          if (leftLegRef.current && rightLegRef.current) {
            leftLegRef.current.rotation.x = Math.sin(t * 2.2) * 0.06
            rightLegRef.current.rotation.x = -Math.sin(t * 2.2) * 0.06
          }

          if (headRef.current) {
            headRef.current.rotation.y = Math.sin(t * 1.0) * 0.45 + Math.cos(t * 0.4) * 0.18
            headRef.current.rotation.x = 0.06 + Math.sin(t * 1.8) * 0.10
            headRef.current.rotation.z = Math.sin(t * 0.9) * 0.08
          }
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

  const effectiveScale = scale !== null ? scale : (isBoss ? 0.48 : 0.40)

  return (
    <group
      ref={groupRef}
      position={position}
      scale={effectiveScale}
      onClick={(e) => {
        e.stopPropagation()
        if (onClick) onClick(id)
      }}
      cursor="pointer"
    >
      {/* Floating Blueprint Badge (Tampil Rapi Saat Terpilih / Aktif, Disembunyikan di Mode Pure Fullscreen) */}
      {showBadge && !hideBadge && (
        <Billboard position={[0, isBoss ? 1.45 : 1.35, 0]} follow={true}>
          <RoundedBox args={[badgeText.length * 0.075 + 0.45, 0.26, 0.02]} radius={0.06} smoothness={3}>
            <meshStandardMaterial color="#FFFFFF" roughness={0.15} />
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

          {/* Antena Radio untuk Green Agent (WhatsApp Gate) - Lampu Indikator Beacon Hidup Berkedip */}
          {!isBoss && id === 'green-agent' && (
            <group position={[0, 0.30, 0]}>
              <mesh position={[0, 0.06, 0]}>
                <cylinderGeometry args={[0.01, 0.015, 0.13, 8]} />
                <meshStandardMaterial color="#334155" metalness={0.8} />
              </mesh>
              <mesh ref={antennaBeaconRef} position={[0, 0.14, 0]}>
                <sphereGeometry args={[0.034, 12, 12]} />
                <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={3.2} />
              </mesh>
              <pointLight color="#22c55e" intensity={1.5} distance={1.2} />
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
