import React, { useEffect, useRef } from 'react'
import { Billboard, Text, RoundedBox, useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * IsometricOfficeGlb:
 * Memuat model 3D kantor GLB (office-3d/isometric_office (1).glb).
 * Skema warna dan tekstur yang diselaraskan:
 * - Lantai Utama (floor.001) -> Menggunakan pola asli model (parquet/tile layout) yang ditransformasikan
 *   dari warna cokelat lama menjadi warna Putih Bersih Scandinavian dengan sela nat abu-abu slate lembut (#FFFFFF / #D4DAE2).
 *   Mempertahankan 100% detail corak kayu/ubin asli model namun dengan palet putih cerah modern.
 * - Dinding Utama (Wall_material) -> Deep Navy Blue (#192A56) yang kontras dan profesional
 * - Seluruh Furnitur Kayu (wood, wood_4, wood.002, wood.004, wood.005) -> Soft Warm Cream / Off-White (#F5EFEB)
 * - Meja Resepsionis & Front Counters (Pam_desk) -> Sky Tech Blue (#0284c7)
 * - Lis Lantai (Baseboard_material) -> Dark Midnight Navy (#0E1A38)
 */
export function IsometricOfficeGlb() {
  const { scene } = useGLTF('/models/isometric_office.glb')
  const scandiWhiteTexture = useTexture('/models/white_scandi_floor.jpg')

  useEffect(() => {
    if (scandiWhiteTexture) {
      scandiWhiteTexture.wrapS = THREE.RepeatWrapping
      scandiWhiteTexture.wrapT = THREE.RepeatWrapping
      scandiWhiteTexture.repeat.set(1, 1)
      scandiWhiteTexture.needsUpdate = true
    }
  }, [scandiWhiteTexture])

  useEffect(() => {
    if (!scene) return

    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false
        child.receiveShadow = true

        if (child.material) {
          const mat = child.material

          // 1. Lantai Utama Kantor (floor.001): Pola Asli Model Parquet Putih Scandinavian dengan Corak Garis Tajam
          if (mat.name === 'floor.001') {
            if (scandiWhiteTexture) {
              mat.map = scandiWhiteTexture
            }
            mat.color = new THREE.Color('#FFFFFF')
            mat.roughness = 0.45
            mat.metalness = 0.02
            mat.needsUpdate = true
          }
          // 2. Elemen / aksesoris lantai pelengkap (floor)
          else if (mat.name === 'floor') {
            mat.color = new THREE.Color('#F1F5F9')
            mat.roughness = 0.35
          }
          // 3. Dinding Utama: Deep Navy Blue (#192A56)
          else if (mat.name === 'Wall_material') {
            mat.color = new THREE.Color('#192A56')
            mat.roughness = 0.65
            mat.metalness = 0.04
          } 
          // 4. Seluruh Furnitur Kayu: Warna Putih ke Cream-creaman (#F5EFEB)
          else if (
            mat.name === 'wood' || 
            mat.name === 'wood_4' || 
            mat.name === 'wood.002' || 
            mat.name === 'wood.004' || 
            mat.name === 'wood.005'
          ) {
            mat.color = new THREE.Color('#F5EFEB') // Elegan Warm Cream / Ivory
            mat.roughness = 0.38
            mat.metalness = 0.02
          }
          // 5. Meja Resepsionis & Front Counters: Sky Tech Blue (#0284c7)
          else if (mat.name === 'Pam_desk') {
            mat.color = new THREE.Color('#0284c7')
            mat.roughness = 0.35
            mat.metalness = 0.08
          } 
          // 6. Lis Bawah Dinding (Baseboard): Dark Midnight Navy (#0E1A38)
          else if (mat.name === 'Baseboard_material') {
            mat.color = new THREE.Color('#0E1A38')
            mat.roughness = 0.5
          } 
          // 7. Botol & Aksesoris Air
          else if (mat.name === 'Water_bottle') {
            mat.color = new THREE.Color('#38bdf8')
          }
          // 8. Elemen hijau lain (selain tanaman alami)
          else if (mat.color && mat.name !== 'Fronds' && mat.name !== 'Stalks' && mat.name !== 'Flowers') {
            const { r, g, b } = mat.color
            if (g > 0.18 && g > r * 1.25 && g > b * 1.25) {
              mat.color.setRGB(0.1, 0.35, 0.75)
            }
          }

          mat.needsUpdate = true
        }
      }
    })
  }, [scene, scandiWhiteTexture])

  return (
    <primitive object={scene} position={[0, 0, 0]} />
  )
}

useGLTF.preload('/models/isometric_office.glb')
useTexture.preload('/models/white_scandi_floor.jpg')

/**
 * FloatingBadge: Badge mengambang berbentuk pil putih bersih
 */
export function FloatingBadge({ position, title = 'Station', subtitle = '', dotColor = '#0284c7', visible = true }) {
  if (!visible) return null
  const maxLen = Math.max(title.length, subtitle.length)
  const width = Math.max(1.4, maxLen * 0.082 + 0.6)

  return (
    <Billboard position={position} follow={true}>
      <RoundedBox args={[width, 0.44, 0.03]} radius={0.16} smoothness={1}>
        <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.02} />
      </RoundedBox>

      <mesh position={[-width / 2 + 0.16, 0.02, 0.022]}>
        <sphereGeometry args={[0.042, 8, 8]} />
        <meshBasicMaterial color={dotColor} />
      </mesh>

      <group position={[0.08, 0, 0.022]}>
        <Text
          position={[0, subtitle ? 0.07 : 0, 0]}
          fontSize={0.118}
          color="#0f172a"
          anchorX="center"
          anchorY="middle"
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            position={[0, -0.09, 0]}
            fontSize={0.082}
            color="#64748b"
            anchorX="center"
            anchorY="middle"
          >
            {subtitle}
          </Text>
        )}
      </group>
    </Billboard>
  )
}

/**
 * Server Cluster & Data Vault: MSI Cubi NUC Stack
 */
export function MsiCubiServerClusterAndVault({ position = [-4.5, 0.55, 0.79], showLabels = true }) {
  return (
    <group position={position}>
      <FloatingBadge
        position={[0, 0.9, 0]}
        title="Server Vault"
        subtitle="MSI Cubi NUC"
        dotColor="#0284c7"
        visible={showLabels}
      />
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0, 0.04 + i * 0.09, 0]}>
          <mesh>
            <boxGeometry args={[0.38, 0.065, 0.38]} />
            <meshStandardMaterial color="#090d16" roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[0.13, 0.034, 0.13]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.014, 0.026, 12]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * KanbanGlassBoard: Layar Digital Konferensi di Ruang Rapat
 * Terintegrasi menyatu dengan layar presentasi dinding di ruang rapat (posisi X = -9.91, Y = 1.17, Z = 8.39, rotasi Y = 90 deg)
 * Menampilkan data sprint leads secara real-time dengan animasi visual interaktif.
 */
export function KanbanGlassBoard({
  position = [-9.91, 1.17, 8.39],
  rotation = [0, Math.PI / 2, 0],
  leads = [],
  activeLead = null,
  pitchResult = null,
  showLabels = true
}) {
  const glowMeshRef = useRef()

  useFrame((state) => {
    if (glowMeshRef.current) {
      const t = state.clock.getElapsedTime()
      glowMeshRef.current.material.opacity = 0.12 + Math.sin(t * 2.5) * 0.06
    }
  })

  const backlogLeads = leads
    .filter((l) => l.status_kontak === 'pending' && l.id_lead !== activeLead?.id_lead)
    .slice(0, 2)

  const inProgressLeads = activeLead ? [activeLead] : []
  const doneLeads = leads
    .filter((l) => l.status_kontak === 'dispatched' || l.status_kontak === 'approved')
    .slice(0, 2)

  return (
    <group position={position} rotation={rotation}>
      {/* Label Badge Mengambang Di Atas Layar */}
      <FloatingBadge
        position={[0, 0.88, 0.04]}
        title="Ruang Rapat // Live Screen"
        subtitle="MSI Sovereign Pipeline"
        dotColor="#38bdf8"
        visible={showLabels}
      />

      {/* Frame Bezel Monitor Layar Rapat */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.28, 1.38, 0.02]} />
        <meshStandardMaterial color="#0b1120" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Permukaan Layar OLED Bercahaya */}
      <mesh position={[0, 0, 0.012]}>
        <boxGeometry args={[2.22, 1.32, 0.005]} />
        <meshStandardMaterial 
          color="#0f172a" 
          roughness={0.1} 
          metalness={0.1} 
        />
      </mesh>

      {/* Ambient Glow Layar */}
      <mesh ref={glowMeshRef} position={[0, 0, 0.014]}>
        <planeGeometry args={[2.22, 1.32]} />
        <meshBasicMaterial 
          color="#38bdf8" 
          transparent 
          opacity={0.15} 
        />
      </mesh>

      {/* Header Layar Presentasi */}
      <group position={[0, 0.52, 0.02]}>
        <Text
          position={[-0.98, 0, 0]}
          fontSize={0.062}
          color="#38bdf8"
          anchorX="left"
          anchorY="middle"
          fontFamily="monospace"
        >
          LIVE KANBAN SPRINT
        </Text>
        <Text
          position={[0.98, 0, 0]}
          fontSize={0.048}
          color="#94a3b8"
          anchorX="right"
          anchorY="middle"
          fontFamily="monospace"
        >
          {leads.length} LEADS ACTIVE
        </Text>
        {/* Garis Pembatas Header */}
        <mesh position={[0, -0.06, 0]}>
          <boxGeometry args={[2.05, 0.008, 0.002]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Tiga Kolom: BACKLOG, ACTIVE SPRINT, DISPATCHED */}
      <group position={[0, 0.36, 0.02]}>
        {/* Judul Kolom */}
        <Text position={[-0.70, 0, 0]} fontSize={0.045} color="#fbbf24" anchorX="center" anchorY="middle" fontFamily="monospace">
          BACKLOG ({backlogLeads.length})
        </Text>
        <Text position={[0, 0, 0]} fontSize={0.045} color="#38bdf8" anchorX="center" anchorY="middle" fontFamily="monospace">
          IN PROGRESS ({inProgressLeads.length})
        </Text>
        <Text position={[0.70, 0, 0]} fontSize={0.045} color="#34d399" anchorX="center" anchorY="middle" fontFamily="monospace">
          COMPLETED ({doneLeads.length})
        </Text>

        {/* Garis Vertikal Pemisah Kolom */}
        <mesh position={[-0.36, -0.38, 0]}>
          <boxGeometry args={[0.006, 0.72, 0.002]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.36, -0.38, 0]}>
          <boxGeometry args={[0.006, 0.72, 0.002]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Kartu Leads di Kolom 1: BACKLOG */}
      {backlogLeads.map((lead, idx) => (
        <group key={lead.id_lead || idx} position={[-0.70, 0.16 - idx * 0.28, 0.02]}>
          <RoundedBox args={[0.62, 0.22, 0.012]} radius={0.03} smoothness={2}>
            <meshStandardMaterial color="#1e293b" roughness={0.3} />
          </RoundedBox>
          <mesh position={[-0.29, 0, 0.008]}>
            <boxGeometry args={[0.015, 0.18, 0.002]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
          <Text position={[-0.24, 0.04, 0.01]} fontSize={0.042} color="#f8fafc" anchorX="left" anchorY="middle" fontFamily="monospace">
            {(lead.nama || lead.id_lead || `LEAD-${idx + 1}`).substring(0, 14)}
          </Text>
          <Text position={[-0.24, -0.04, 0.01]} fontSize={0.032} color="#94a3b8" anchorX="left" anchorY="middle">
            {lead.minat ? `${lead.minat.substring(0, 15)}...` : 'Antrean Pending'}
          </Text>
        </group>
      ))}

      {/* Kartu Leads di Kolom 2: IN PROGRESS (Active Lead dengan Efek Pulse) */}
      {inProgressLeads.length > 0 ? (
        inProgressLeads.map((lead, idx) => (
          <group key={lead.id_lead || idx} position={[0, 0.16, 0.02]}>
            <RoundedBox args={[0.64, 0.24, 0.014]} radius={0.03} smoothness={2}>
              <meshStandardMaterial color="#0c4a6e" roughness={0.2} />
            </RoundedBox>
            <mesh position={[-0.30, 0, 0.009]}>
              <boxGeometry args={[0.018, 0.20, 0.002]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            <Text position={[-0.24, 0.05, 0.012]} fontSize={0.044} color="#ffffff" anchorX="left" anchorY="middle" fontFamily="monospace">
              {(lead.nama || lead.id_lead || 'ACTIVE LEAD').substring(0, 14)}
            </Text>
            <Text position={[-0.24, -0.04, 0.012]} fontSize={0.034} color="#7dd3fc" anchorX="left" anchorY="middle">
              {pitchResult ? 'Pitch Generated' : 'Scouting & AI Drafter'}
            </Text>
          </group>
        ))
      ) : (
        <group position={[0, 0.16, 0.02]}>
          <Text position={[0, 0, 0]} fontSize={0.036} color="#475569" anchorX="center" anchorY="middle" fontFamily="monospace">
            [ Standby Queue ]
          </Text>
        </group>
      )}

      {/* Kartu Leads di Kolom 3: COMPLETED / DISPATCHED */}
      {doneLeads.map((lead, idx) => (
        <group key={lead.id_lead || idx} position={[0.70, 0.16 - idx * 0.28, 0.02]}>
          <RoundedBox args={[0.62, 0.22, 0.012]} radius={0.03} smoothness={2}>
            <meshStandardMaterial color="#064e3b" roughness={0.3} />
          </RoundedBox>
          <mesh position={[-0.29, 0, 0.008]}>
            <boxGeometry args={[0.015, 0.18, 0.002]} />
            <meshBasicMaterial color="#34d399" />
          </mesh>
          <Text position={[-0.24, 0.04, 0.01]} fontSize={0.042} color="#ecfdf5" anchorX="left" anchorY="middle" fontFamily="monospace">
            {(lead.nama || lead.id_lead || `SENT-${idx + 1}`).substring(0, 14)}
          </Text>
          <Text position={[-0.24, -0.04, 0.01]} fontSize={0.032} color="#6ee7b7" anchorX="left" anchorY="middle">
            WhatsApp Dispatched
          </Text>
        </group>
      ))}

      {/* Status Bar Telemetri Bawah Layar */}
      <group position={[0, -0.52, 0.02]}>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[2.05, 0.006, 0.002]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
        <Text position={[-0.98, 0, 0]} fontSize={0.036} color="#38bdf8" anchorX="left" anchorY="middle" fontFamily="monospace">
          MSI CUBI PIPELINE: REALTIME SYNCED
        </Text>
        <Text position={[0.98, 0, 0]} fontSize={0.036} color="#10b981" anchorX="right" anchorY="middle" fontFamily="monospace">
          100% OPERATIONAL
        </Text>
      </group>
    </group>
  )
}
