import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'

/**
 * FloatingBadge: Badge mengambang berbentuk pil putih bersih sesuai referensi (referensi1.png)
 * - Baris 1: Judul Stasiun (Teks tebal gelap, misal: Desk 01, Vault, Kanban Wall, Whiteboard, Security Gate)
 * - Baris 2: Sub-label fungsi (Teks abu-abu elegan, misal: Active Compute, Secure Storage, Ideas & Planning)
 * - Titik status bercahaya di sebelah kiri
 */
export function FloatingBadge({ position, title = 'Station', subtitle = '', dotColor = '#0284c7', visible = true }) {
  if (!visible) return null
  const maxLen = Math.max(title.length, subtitle.length)
  const width = Math.max(1.4, maxLen * 0.082 + 0.6)

  return (
    <Billboard position={position} follow={true}>
      {/* Kapsul Pil Putih Bersih */}
      <RoundedBox args={[width, 0.44, 0.03]} radius={0.16} smoothness={4}>
        <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.02} />
      </RoundedBox>

      {/* Titik Status Bercahaya */}
      <mesh position={[-width / 2 + 0.16, 0.02, 0.022]}>
        <sphereGeometry args={[0.042, 16, 16]} />
        <meshStandardMaterial color={dotColor} emissive={dotColor} emissiveIntensity={2.4} />
      </mesh>

      {/* Teks Judul & Subtitle */}
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
 * 1. DIORAMA ROOM: Lantai Monolitik Halus & Dinding Kaca Bersih (Sesuai referensi1.png)
 * - Lantai porselen off-white bersih & menyatu (tanpa potongan kayu janggal atau garis grid kasar).
 * - Podium tebal dengan sudut rounded halus dan bayangan jatuh lembut di bawahnya.
 * - Dinding kaca buram berbingkai minimalis di latar belakang.
 */
export function DioramaRoom() {
  return (
    <group position={[0, 0, 0]}>
      {/* Skirting / Lis Bawah Platform Navy Arsitektural */}
      <RoundedBox
        receiveShadow
        args={[19.4, 0.42, 15.4]}
        radius={0.14}
        smoothness={4}
        position={[0, -0.42, 0]}
      >
        <meshStandardMaterial color="#192A56" roughness={0.35} />
      </RoundedBox>

      {/* Slab Lantai Utama Keramik Putih Bersih Modern (#FFFFFF) */}
      <RoundedBox
        receiveShadow
        args={[19.2, 0.46, 15.2]}
        radius={0.14}
        smoothness={4}
        position={[0, -0.05, 0]}
      >
        <meshStandardMaterial color="#FFFFFF" roughness={0.24} metalness={0.02} />
      </RoundedBox>

      {/* Dinding Belakang: Solid Architectural Drywall Warna Putih Bersih (#FFFFFF) */}
      <group position={[0, 3.2, -7.3]}>
        <RoundedBox receiveShadow castShadow args={[19, 6.0, 0.22]} radius={0.04} smoothness={3}>
          <meshStandardMaterial
            color="#FFFFFF"
            roughness={0.82}
            metalness={0.03}
          />
        </RoundedBox>

        {/* Lis Plint Bawah Dinding Belakang (Navy Elegan) */}
        <mesh position={[0, -2.86, 0.12]}>
          <boxGeometry args={[19, 0.24, 0.04]} />
          <meshStandardMaterial color="#192A56" roughness={0.3} />
        </mesh>

        {/* Garis-Garis Panel Vertikal Arsitektural (Vertical Hairline Panel Slats) */}
        {[-7.2, -4.8, -2.4, 0, 2.4, 4.8, 7.2].map((x, i) => (
          <mesh key={i} position={[x, 0, 0.115]}>
            <boxGeometry args={[0.025, 5.7, 0.01]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Dinding Kiri: Warna Putih (#FFFFFF) dengan Jendela Arsitektural Natural */}
      <group position={[-9.3, 3.2, 0]}>
        <RoundedBox receiveShadow castShadow args={[0.22, 6.0, 15]} radius={0.04} smoothness={3}>
          <meshStandardMaterial
            color="#FFFFFF"
            roughness={0.82}
            metalness={0.03}
          />
        </RoundedBox>

        {/* Lis Plint Bawah Dinding Kiri */}
        <mesh position={[0.12, -2.86, 0]}>
          <boxGeometry args={[0.04, 0.24, 15]} />
          <meshStandardMaterial color="#192A56" roughness={0.3} />
        </mesh>

        {/* Bukaan Jendela Kaca Besar dengan Kusen Navy */}
        <group position={[0.1, 0.3, 0]}>
          {/* Kaca Jendela dengan Transmisi Cahaya Alami */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[13.2, 4.2]} rotation={[0, Math.PI / 2, 0]} />
            <meshPhysicalMaterial
              transmission={0.92}
              roughness={0.15}
              color="#FFFDF7"
              transparent
              thickness={0.3}
            />
          </mesh>
          {/* Kusen Jendela Horizontal */}
          {[-2.1, 0, 2.1].map((y, i) => (
            <mesh key={i} position={[0, y, 0]}>
              <boxGeometry args={[0.06, 0.05, 13.2]} />
              <meshStandardMaterial color="#192A56" metalness={0.6} roughness={0.25} />
            </mesh>
          ))}
          {/* Kusen Jendela Vertikal */}
          {[-4.4, 0, 4.4].map((z, i) => (
            <mesh key={i} position={[0, 0, z]}>
              <boxGeometry args={[0.06, 4.2, 0.05]} />
              <meshStandardMaterial color="#192A56" metalness={0.6} roughness={0.25} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Bayangan Halus di Bawah Platform Slab */}
      <mesh position={[0, -0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[23, 19]} />
        <meshBasicMaterial color="#192A56" transparent opacity={0.18} />
      </mesh>
    </group>
  )
}

/**
 * 2. WHITEBOARD: Papan Ide & Perencanaan Agile (Tepat Sesuai referensi1.png)
 * - Terletak di antara Vault dan Kanban Wall
 * - Rangka aluminium berdiri dengan diagram alur arsitektur sales AI & post-it notes ide
 */
export function WhiteboardElement({ position = [-1.2, 0.18, -3.8], showLabels = true }) {
  return (
    <group position={position}>
      {/* Floating Badge sesuai referensi1.png */}
      <FloatingBadge
        position={[0, 2.5, 0]}
        title="Whiteboard"
        subtitle="Ideas & Planning"
        dotColor="#192A56"
        visible={showLabels}
      />

      {/* Tiang Penyangga Kiri & Kanan */}
      <mesh position={[-1.4, 1.1, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 2.2, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[1.4, 1.1, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 2.2, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Kaki Roda Stand Whiteboard */}
      <mesh position={[-1.4, 0.04, 0]}>
        <boxGeometry args={[0.08, 0.06, 0.7]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} />
      </mesh>
      <mesh position={[1.4, 0.04, 0]}>
        <boxGeometry args={[0.08, 0.06, 0.7]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} />
      </mesh>

      {/* Papan Kaca Putih Mengkilap */}
      <RoundedBox args={[2.9, 1.7, 0.04]} radius={0.03} smoothness={3} position={[0, 1.3, 0]}>
        <meshStandardMaterial color="#ffffff" roughness={0.12} />
      </RoundedBox>

      {/* Bingkai Tipis Aluminium */}
      <mesh position={[0, 1.3, -0.01]}>
        <boxGeometry args={[2.96, 1.76, 0.02]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
      </mesh>

      {/* Ilustrasi Diagram Alur Sistem di Whiteboard */}
      <group position={[0, 1.35, 0.025]}>
        {/* Diagram Box 1: Inbound Lead */}
        <mesh position={[-0.9, 0.35, 0]}>
          <planeGeometry args={[0.55, 0.28]} />
          <meshStandardMaterial color="#e0f2fe" />
        </mesh>
        <Billboard position={[-0.9, 0.35, 0.005]} follow={false}>
          <Text fontSize={0.055} color="#0369a1" anchorX="center" anchorY="middle">
            Inbound Leads
          </Text>
        </Billboard>

        {/* Panah Penghubung 1 */}
        <mesh position={[-0.45, 0.35, 0]}>
          <planeGeometry args={[0.2, 0.02]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>

        {/* Diagram Box 2: Stock Match */}
        <mesh position={[0, 0.35, 0]}>
          <planeGeometry args={[0.55, 0.28]} />
          <meshStandardMaterial color="#fef3c7" />
        </mesh>
        <Billboard position={[0, 0.35, 0.005]} follow={false}>
          <Text fontSize={0.055} color="#92400e" anchorX="center" anchorY="middle">
            Cubi Compute
          </Text>
        </Billboard>

        {/* Panah Penghubung 2 */}
        <mesh position={[0.45, 0.35, 0]}>
          <planeGeometry args={[0.2, 0.02]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>

        {/* Diagram Box 3: Qwen 2.5 Pitch */}
        <mesh position={[0.9, 0.35, 0]}>
          <planeGeometry args={[0.55, 0.28]} />
          <meshStandardMaterial color="#f3e8ff" />
        </mesh>
        <Billboard position={[0.9, 0.35, 0.005]} follow={false}>
          <Text fontSize={0.055} color="#6b21a8" anchorX="center" anchorY="middle">
            Qwen 2.5 Drafter
          </Text>
        </Billboard>

        {/* Post-It Notes Warna-Warni di Bawah */}
        {[-0.8, -0.25, 0.3, 0.85].map((x, i) => {
          const colors = ['#fef08a', '#bbf7d0', '#bae6fd', '#fed7aa']
          const notes = ['SLA < 3m', 'DP > 3.5jt Hot', 'Auto WhatsApp', 'Audit Logs']
          return (
            <group key={i} position={[x, -0.22, 0]}>
              <mesh>
                <planeGeometry args={[0.38, 0.38]} />
                <meshStandardMaterial color={colors[i]} roughness={0.7} />
              </mesh>
              <Billboard position={[0, 0, 0.005]} follow={false}>
                <Text fontSize={0.048} color="#1e293b" anchorX="center" anchorY="middle">
                  {notes[i]}
                </Text>
              </Billboard>
            </group>
          )
        })}
      </group>

      {/* Tempat Spidol & Penghapus di Bawah Papan */}
      <mesh position={[0, 0.46, 0.06]}>
        <boxGeometry args={[1.6, 0.03, 0.08]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
      </mesh>
    </group>
  )
}

/**
 * 3. DESK 01: Modern Workstation Meja Kayu Walnut, Dual Monitor Ultrawide & MSI Cubi NUC (Sesuai referensi1.png)
 * - Tempat Cubi Scout (Biru) bekerja
 * - Meja kayu mewah chamfered, kursi kantor ergonomis putih, dual monitor lengkung
 */
export function ModernDeskWorkstation({ position = [-3.2, 0.18, 1.2], isTyping = true, showLabels = true }) {
  return (
    <group position={position}>
      {/* Floating Badge Sesuai referensi1.png */}
      <FloatingBadge
        position={[0, 2.25, 0]}
        title="Desk 01"
        subtitle="Active Compute"
        dotColor="#0284c7"
        visible={showLabels}
      />

      {/* Daun Meja Kayu Walnut Hangat */}
      <RoundedBox
        castShadow
        receiveShadow
        args={[2.5, 0.09, 1.15]}
        radius={0.04}
        smoothness={4}
        position={[0, 0.74, 0]}
      >
        <meshStandardMaterial color="#78350f" roughness={0.35} metalness={0.08} />
      </RoundedBox>

      {/* Modesty Panel Kayu di Bawah Meja */}
      <mesh position={[0, 0.42, -0.48]} castShadow>
        <boxGeometry args={[2.3, 0.6, 0.03]} />
        <meshStandardMaterial color="#451a03" roughness={0.4} />
      </mesh>

      {/* Kaki Meja Logam Hitam Minimalis */}
      {[-1.15, 1.15].map((x, i) => (
        <group key={i} position={[x, 0.36, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.06, 0.72, 1.05]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Dual Curved Ultrawide Monitors pada Stand Monitor Kokoh */}
      <group position={[0, 0.8, -0.22]}>
        {/* Tiang Dudukan Monitor */}
        <mesh castShadow position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.44, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.02, 20]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} />
        </mesh>

        {/* Monitor 1 (Kiri) - Sedikit Menghadap ke Dalam */}
        <group position={[-0.62, 0.34, 0]} rotation={[0, 0.16, 0]}>
          <RoundedBox args={[1.15, 0.46, 0.04]} radius={0.02} smoothness={3} castShadow>
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
          </RoundedBox>
          {/* Layar Tampilan Kode & Log Data Terminal */}
          <mesh position={[0, 0, 0.022]}>
            <planeGeometry args={[1.1, 0.41]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#0369a1"
              emissiveIntensity={1.2}
              roughness={0.2}
            />
          </mesh>
        </group>

        {/* Monitor 2 (Kanan) - Sedikit Menghadap ke Dalam */}
        <group position={[0.62, 0.34, 0]} rotation={[0, -0.16, 0]}>
          <RoundedBox args={[1.15, 0.46, 0.04]} radius={0.02} smoothness={3} castShadow>
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
          </RoundedBox>
          {/* Layar Tampilan Grafik Stock Real-time */}
          <mesh position={[0, 0, 0.022]}>
            <planeGeometry args={[1.1, 0.41]} />
            <meshStandardMaterial
              color="#0f766e"
              emissive="#0d9488"
              emissiveIntensity={1.2}
              roughness={0.2}
            />
          </mesh>
        </group>
      </group>

      {/* MSI Cubi NUC Mini PC di Atas Meja dengan Cincin Power LED Biru */}
      <group position={[0.95, 0.81, 0.18]}>
        <RoundedBox args={[0.26, 0.06, 0.26]} radius={0.025} smoothness={3} castShadow>
          <meshStandardMaterial color="#090d16" roughness={0.15} metalness={0.85} />
        </RoundedBox>
        {/* Tombol Power LED Cincin MSI Cubi */}
        <mesh position={[0.07, 0.032, 0.07]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.012, 0.022, 16]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2.5} />
        </mesh>
      </group>

      {/* Desk Mat Hitam & Keyboard Mekanikal */}
      <group position={[0, 0.79, 0.18]}>
        {/* Mat Meja */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.3, 0.005, 0.55]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        {/* Keyboard Minimalis */}
        <mesh position={[-0.1, 0.008, 0.05]} castShadow>
          <boxGeometry args={[0.55, 0.015, 0.18]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {/* Mouse Pad & Wireless Mouse */}
        <mesh position={[0.35, 0.012, 0.05]} castShadow>
          <boxGeometry args={[0.08, 0.02, 0.13]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
      </group>

      {/* Kursi Kantor Ergonomis Putih Modern (Tempat Duduk Cubi Scout) */}
      <group position={[0, 0, 0.65]} rotation={[0, Math.PI, 0]}>
        {/* Kaki Roda Bintang 5 Kursi */}
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.12, 12]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        {/* Bantalan Dudukan Putih Nyaman */}
        <RoundedBox args={[0.62, 0.1, 0.58]} radius={0.04} smoothness={3} position={[0, 0.44, 0]} castShadow>
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </RoundedBox>
        {/* Sandaran Punggung Ergonomis Mesh Putih */}
        <RoundedBox args={[0.58, 0.62, 0.06]} radius={0.04} smoothness={3} position={[0, 0.78, -0.26]} castShadow>
          <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
        </RoundedBox>
        {/* Sandaran Tangan Kiri & Kanan */}
        {[-0.32, 0.32].map((x, i) => (
          <group key={i} position={[x, 0.58, -0.05]}>
            <mesh>
              <boxGeometry args={[0.05, 0.03, 0.32]} />
              <meshStandardMaterial color="#334155" metalness={0.7} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

/**
 * 4. VAULT: Brankas Baja & Server Cluster MSI Cubi NUC (Sesuai referensi1.png)
 * - Terletak di sudut kiri belakang
 * - Pintu brankas baja terbuka, menampilkan rak blade server MSI Cubi NUC dengan status LED tenang
 */
export function MsiCubiServerClusterAndVault({ position = [-5.2, 0.18, -3.8], showLabels = true }) {
  return (
    <group position={position}>
      {/* Floating Badge Sesuai referensi1.png */}
      <FloatingBadge
        position={[0, 2.5, 0]}
        title="Vault"
        subtitle="Secure Storage"
        dotColor="#334155"
        visible={showLabels}
      />

      {/* Bodi Kabinet Brankas Baja Abu-abu Titanium */}
      <group position={[0, 0.95, 0]}>
        <RoundedBox args={[1.8, 1.9, 1.5]} radius={0.08} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.25} />
        </RoundedBox>

        {/* Rongga Interior Brankas */}
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[1.55, 1.65, 1.35]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>

        {/* Rak Blade Server MSI Cubi NUC di Dalam Brankas */}
        {[-0.45, 0, 0.45].map((y, idx) => (
          <group key={idx} position={[0, y, 0.2]}>
            {/* Tray Rak Besi */}
            <mesh position={[0, -0.08, 0]}>
              <boxGeometry args={[1.45, 0.02, 1.1]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} />
            </mesh>
            {/* Unit Server MSI Cubi NUC Pro */}
            <RoundedBox args={[0.95, 0.14, 0.7]} radius={0.025} smoothness={3}>
              <meshStandardMaterial color="#0b0f19" roughness={0.2} metalness={0.8} />
            </RoundedBox>
            {/* Lampu Status LED Tenang */}
            <mesh position={[-0.35, 0, 0.36]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2.5} />
            </mesh>
            <mesh position={[-0.25, 0, 0.36]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2.5} />
            </mesh>
            <mesh position={[0.25, 0, 0.36]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={2.5} />
            </mesh>
          </group>
        ))}

        {/* Pintu Brankas Baja Tebal yang Terbuka ke Kanan (~50 derajat) */}
        <group position={[0.9, 0, 0.75]} rotation={[0, 0.85, 0]}>
          <RoundedBox args={[1.65, 1.85, 0.16]} radius={0.06} smoothness={3} position={[-0.82, 0, 0]} castShadow>
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
          </RoundedBox>
          {/* Roda Kunci Brankas Kuningan */}
          <mesh position={[-0.82, 0, 0.11]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.22, 0.038, 16, 24]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.15} />
          </mesh>
          {/* Keypad Digital dengan Lampu Indikator Hijau */}
          <mesh position={[-0.82, 0.42, 0.09]}>
            <boxGeometry args={[0.16, 0.22, 0.02]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2.0} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

/**
 * 5. KANBAN WALL: Papan Kaca Buram dengan Kartu Prospek Real-Time (Sesuai referensi1.png)
 * - Papan transparan besar dengan 3 kolom rapi: BACKLOG, IN PROGRESS, DONE
 * - Kartu task post-it warna-warni yang merepresentasikan leads dari backend
 */
export function KanbanGlassBoard({
  position = [3.2, 0.18, -3.8],
  leads = [],
  activeLead = null,
  pitchResult = null,
  showLabels = true
}) {
  const backlogLeads = leads
    .filter((l) => l.status_kontak === 'pending' && l.id_lead !== activeLead?.id_lead)
    .slice(0, 3)

  const inProgressLeads = activeLead ? [activeLead] : []
  const doneLeads = leads
    .filter((l) => l.status_kontak === 'dispatched' || l.status_kontak === 'approved')
    .slice(0, 3)

  return (
    <group position={position}>
      {/* Floating Badge Sesuai referensi1.png */}
      <FloatingBadge
        position={[0, 2.5, 0]}
        title="Kanban Wall"
        subtitle="Work Items • Active"
        dotColor="#9333ea"
        visible={showLabels}
      />

      {/* Tiang Penyangga Kaca Stainless Steel */}
      <mesh position={[-1.85, 1.15, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 2.3, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[1.85, 1.15, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 2.3, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Papan Kaca Frosted Transparan Besar dengan Glow Halus */}
      <RoundedBox args={[3.8, 1.85, 0.05]} radius={0.04} smoothness={4} position={[0, 1.25, 0]}>
        <meshPhysicalMaterial
          transmission={0.85}
          roughness={0.18}
          transparent={true}
          thickness={0.3}
          color="#f8fafc"
        />
      </RoundedBox>

      {/* Header Kolom Kanban Teks Bersih */}
      <Billboard position={[0, 1.96, 0.035]} follow={false}>
        <Text fontSize={0.11} color="#0f172a" anchorX="center" anchorY="middle">
          BACKLOG                  IN PROGRESS                  DONE
        </Text>
      </Billboard>

      {/* Garis Pemisah Kolom Vertikal Halus */}
      {[-0.65, 0.65].map((x, i) => (
        <mesh key={i} position={[x, 1.15, 0.032]}>
          <boxGeometry args={[0.015, 1.35, 0.01]} />
          <meshBasicMaterial color="#cbd5e1" />
        </mesh>
      ))}

      {/* Kolom 1: BACKLOG (Kuning Pastel) */}
      {backlogLeads.map((lead, idx) => (
        <group key={lead.id_lead || idx} position={[-1.25, 1.48 - idx * 0.42, 0.04]}>
          <RoundedBox args={[0.55, 0.32, 0.015]} radius={0.015}>
            <meshStandardMaterial color="#fef08a" roughness={0.5} />
          </RoundedBox>
          <Billboard position={[0, 0, 0.012]} follow={false}>
            <Text fontSize={0.056} color="#854d0e" anchorX="center" anchorY="middle">
              {lead.id_lead || `LD-0${idx + 1}`}
            </Text>
            <Text position={[0, -0.075, 0]} fontSize={0.042} color="#713f12" anchorX="center" anchorY="middle">
              {(lead.nama || '').slice(0, 10)}
            </Text>
          </Billboard>
        </group>
      ))}

      {/* Kolom 2: IN PROGRESS (Biru / Ungu) */}
      {inProgressLeads.map((lead, idx) => (
        <group key={lead.id_lead || idx} position={[0, 1.48, 0.04]}>
          <RoundedBox args={[0.55, 0.32, 0.015]} radius={0.015}>
            <meshStandardMaterial color="#bae6fd" roughness={0.4} />
          </RoundedBox>
          <Billboard position={[0, 0, 0.012]} follow={false}>
            <Text fontSize={0.056} color="#0369a1" anchorX="center" anchorY="middle">
              {lead.id_lead}
            </Text>
            <Text position={[0, -0.075, 0]} fontSize={0.042} color="#075985" anchorX="center" anchorY="middle">
              {pitchResult ? 'Draft Ready' : 'AI Drafting'}
            </Text>
          </Billboard>
        </group>
      ))}

      {/* Kolom 3: DONE (Hijau Mint) */}
      {doneLeads.map((lead, idx) => (
        <group key={lead.id_lead || idx} position={[1.25, 1.48 - idx * 0.42, 0.04]}>
          <RoundedBox args={[0.55, 0.32, 0.015]} radius={0.015}>
            <meshStandardMaterial color="#bbf7d0" roughness={0.4} />
          </RoundedBox>
          <Billboard position={[0, 0, 0.012]} follow={false}>
            <Text fontSize={0.056} color="#14532d" anchorX="center" anchorY="middle">
              {lead.id_lead} ✓
            </Text>
            <Text position={[0, -0.075, 0]} fontSize={0.042} color="#166534" anchorX="center" anchorY="middle">
              Dispatched
            </Text>
          </Billboard>
        </group>
      ))}
    </group>
  )
}

/**
 * 6. SECURITY GATE: Gerbang Turnstile & WhatsApp Dispatch Gateway (Sesuai referensi1.png)
 * - Terletak di area kanan tengah
 * - Tiang pedestal stainless steel kembar dengan palang akrilik bercahaya hijau
 */
export function SecurityTurnstileGate({ position = [2.2, 0.18, 1.8], showLabels = true }) {
  return (
    <group position={position}>
      {/* Floating Badge Sesuai referensi1.png */}
      <FloatingBadge
        position={[0, 2.3, 0]}
        title="Security Gate"
        subtitle="Access Control"
        dotColor="#16a34a"
        visible={showLabels}
      />

      {/* Pedestal Kiri Stainless Steel */}
      <RoundedBox args={[0.26, 0.95, 0.85]} radius={0.04} smoothness={3} position={[-0.65, 0.48, 0]}>
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
      </RoundedBox>

      {/* Pedestal Kanan Stainless Steel */}
      <RoundedBox args={[0.26, 0.95, 0.85]} radius={0.04} smoothness={3} position={[0.65, 0.48, 0]}>
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
      </RoundedBox>

      {/* Palang Akrilik Kaca Hijau Elegan di Tengah */}
      <group position={[0, 0.52, 0]}>
        <mesh>
          <boxGeometry args={[1.05, 0.42, 0.035]} />
          <meshPhysicalMaterial
            transmission={0.8}
            roughness={0.1}
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={0.6}
            transparent
          />
        </mesh>
      </group>

      {/* Tiang Beacon Status Gateway Tenang */}
      <group position={[0.65, 0.95, 0]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.012, 0.016, 0.8, 12]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.82, 0]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2.5} />
        </mesh>
      </group>
    </group>
  )
}

/**
 * 7. EXECUTIVE BOSS SUITE: Meja Direktur Kayu Walnut, Nameplate Emas & Kursi Kulit
 */
export function ExecutiveBossSuite({
  position = [-5.8, 0.18, 1.8],
  bossName = 'Pak Alfa',
  bossRole = 'Sales Director',
  showLabels = true
}) {
  return (
    <group position={position}>
      {/* Floating Badge Sesuai Format Rapi */}
      <FloatingBadge
        position={[0, 2.3, 0]}
        title={bossName || 'Pak Alfa'}
        subtitle={bossRole || 'Sales Director'}
        dotColor="#192A56"
        visible={showLabels}
      />

      {/* Meja Eksekutif Curved Kayu Walnut */}
      <group position={[0, 0, 0]}>
        <RoundedBox
          castShadow
          receiveShadow
          args={[2.2, 0.1, 1.05]}
          radius={0.04}
          smoothness={4}
          position={[0, 0.74, 0]}
        >
          <meshStandardMaterial color="#451a03" roughness={0.3} metalness={0.1} />
        </RoundedBox>

        {/* Panel Depan Meja */}
        <mesh position={[0, 0.38, -0.45]} castShadow>
          <boxGeometry args={[2.0, 0.6, 0.04]} />
          <meshStandardMaterial color="#2d1305" roughness={0.4} />
        </mesh>

        {/* Kaki Kiri & Kanan Meja Tebal */}
        <mesh position={[-0.95, 0.36, 0]} castShadow>
          <boxGeometry args={[0.12, 0.7, 0.85]} />
          <meshStandardMaterial color="#2d1305" roughness={0.4} />
        </mesh>
        <mesh position={[0.95, 0.36, 0]} castShadow>
          <boxGeometry args={[0.12, 0.7, 0.85]} />
          <meshStandardMaterial color="#2d1305" roughness={0.4} />
        </mesh>

        {/* Nameplate Akrilik & Kuningan di Meja Bos */}
        <group position={[0.55, 0.82, -0.2]} rotation={[0, -0.2, 0]}>
          <RoundedBox args={[0.72, 0.12, 0.16]} radius={0.02} smoothness={3}>
            <meshPhysicalMaterial transmission={0.8} roughness={0.1} color="#ffffff" transparent />
          </RoundedBox>
          <mesh position={[0, 0.01, 0.07]}>
            <boxGeometry args={[0.66, 0.09, 0.01]} />
            <meshStandardMaterial color="#192A56" metalness={0.8} roughness={0.2} />
          </mesh>
          <Billboard position={[0, 0.015, 0.08]} follow={false}>
            <Text fontSize={0.042} color="#192A56" anchorX="center" anchorY="middle">
              {bossName.toUpperCase()}
            </Text>
          </Billboard>
        </group>

        {/* Monitor Ultrawide Lengkung Eksekutif */}
        <group position={[-0.2, 0.8, -0.2]}>
          <mesh castShadow position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.24, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
          <RoundedBox position={[0, 0.36, 0]} args={[1.2, 0.42, 0.04]} radius={0.02} smoothness={3} castShadow>
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
          </RoundedBox>
          <mesh position={[0, 0.36, 0.022]}>
            <planeGeometry args={[1.15, 0.38]} />
            <meshStandardMaterial color="#192A56" emissive="#0f172a" emissiveIntensity={0.8} roughness={0.2} />
          </mesh>
        </group>

        {/* Piala Prestasi Dealer */}
        <group position={[-0.85, 0.81, 0.2]}>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.04, 0.02, 0.14, 12]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>

        {/* Kursi Kulit Eksekutif Bos */}
        <group position={[0, 0, 0.55]} rotation={[0, Math.PI, 0]}>
          <RoundedBox args={[0.66, 0.12, 0.62]} radius={0.04} smoothness={3} position={[0, 0.44, 0]} castShadow>
            <meshStandardMaterial color="#1e293b" roughness={0.4} />
          </RoundedBox>
          <RoundedBox args={[0.62, 0.72, 0.08]} radius={0.04} smoothness={3} position={[0, 0.84, -0.28]} castShadow>
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </RoundedBox>
        </group>
      </group>
    </group>
  )
}

/**
 * 8. EXECUTIVE LOUNGE & REFRESHMENT AREA
 */
export function ExecutiveLounge({ position = [5.5, 0.18, 1.2] }) {
  return (
    <group position={position}>
      <mesh receiveShadow position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.7, 32]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
      </mesh>

      {/* Sofa Slate Modern */}
      <group position={[0, 0, 0.35]}>
        <RoundedBox args={[2.0, 0.3, 0.8]} radius={0.06} smoothness={3} position={[0, 0.2, 0]}>
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </RoundedBox>
        <RoundedBox args={[2.0, 0.52, 0.22]} radius={0.06} smoothness={3} position={[0, 0.52, 0.3]}>
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </RoundedBox>
        <RoundedBox args={[0.32, 0.3, 0.1]} radius={0.04} smoothness={3} position={[-0.5, 0.42, 0.18]}>
          <meshStandardMaterial color="#192A56" roughness={0.6} />
        </RoundedBox>
      </group>

      {/* Meja Kopi Skandinavia Bulat */}
      <group position={[0, 0, -0.55]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.035, 24]} />
          <meshStandardMaterial color="#e2d4c0" roughness={0.4} />
        </mesh>
        {[-0.25, 0.25].map((x, i) => (
          <mesh key={i} position={[x, 0.11, 0]}>
            <cylinderGeometry args={[0.02, 0.015, 0.22, 10]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/**
 * 9. POTTED PLANTS: Tanaman Hias Hijau Segar
 */
export function PottedPlant({ position = [0, 0, 0], scale = 1.0 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.18, 0.48, 20]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 20]} />
        <meshStandardMaterial color="#291e14" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <sphereGeometry args={[0.38, 14, 14]} />
        <meshStandardMaterial color="#15803d" roughness={0.5} />
      </mesh>
      <mesh position={[0.12, 0.9, 0.08]} castShadow>
        <sphereGeometry args={[0.26, 14, 14]} />
        <meshStandardMaterial color="#16a34a" roughness={0.5} />
      </mesh>
    </group>
  )
}

/**
 * 10. CENTER HOLO HUB: Meja Bundar Telemetri Swarm Pusat Ruangan (Animasi Hidup)
 */
export function CenterHoloHub({ position = [0, 0.18, 0] }) {
  const holoCoreRef = useRef()
  const ring1Ref = useRef()
  const ring2Ref = useRef()
  const lightRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (holoCoreRef.current) {
      holoCoreRef.current.rotation.x = t * 0.4
      holoCoreRef.current.rotation.y = t * 0.7
      holoCoreRef.current.position.y = 0.78 + Math.sin(t * 2) * 0.025
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = -t * 0.5
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = t * 0.35
      ring2Ref.current.rotation.y = t * 0.45
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.2 + Math.sin(t * 3.5) * 0.4
    }
  })

  return (
    <group position={position}>
      {/* Cincin Lantai Holografik Biru/Navy */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.58, 48]} />
        <meshBasicMaterial color="#192A56" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 0.94, 36]} />
        <meshBasicMaterial color="#FF5B00" transparent opacity={0.6} />
      </mesh>

      {/* Meja Bundar Pusat */}
      <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 0.95, 0.08, 36]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.15} metalness={0.1} />
      </mesh>
      {/* Bezel Ring Aksen Navy */}
      <mesh position={[0, 0.435, 0]}>
        <cylinderGeometry args={[0.97, 0.97, 0.02, 36]} />
        <meshStandardMaterial color="#192A56" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Tiang Tengah Meja */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.35, 0.44, 24]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Proyektor Hologram Mini di Tengah Meja */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.04, 24]} />
        <meshStandardMaterial color="#192A56" metalness={0.9} />
      </mesh>
      {/* Cincin Emissive Hologram Biru Neon */}
      <mesh position={[0, 0.53, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.13, 24]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      {/* Kubus Data Mengambang / Wireframe Node Beranimasi */}
      <mesh ref={holoCoreRef} position={[0, 0.78, 0]}>
        <octahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial color="#38bdf8" wireframe emissive="#0284c7" emissiveIntensity={1.4} />
      </mesh>

      {/* Cincin Orbit Hologram 1 */}
      <mesh ref={ring1Ref} position={[0, 0.78, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[0.24, 0.26, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>

      {/* Cincin Orbit Hologram 2 */}
      <mesh ref={ring2Ref} position={[0, 0.78, 0]} rotation={[0, Math.PI / 4, Math.PI / 3]}>
        <ringGeometry args={[0.32, 0.34, 32]} />
        <meshBasicMaterial color="#FF5B00" transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>

      {/* Dynamic Light Beam from Center Hologram */}
      <pointLight ref={lightRef} position={[0, 0.8, 0]} color="#38bdf8" distance={2.8} />

      {/* 4 Kursi Swarm Modern di Sekeliling Meja */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, idx) => {
        const radius = 1.35
        const cx = Math.sin(angle) * radius
        const cz = Math.cos(angle) * radius
        return (
          <group key={idx} position={[cx, 0, cz]} rotation={[0, angle + Math.PI, 0]}>
            {/* Roda Kaki Kursi */}
            <mesh position={[0, 0.03, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.02, 8]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.18, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.28, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.9} />
            </mesh>
            {/* Dudukan Kursi */}
            <RoundedBox args={[0.36, 0.06, 0.36]} radius={0.02} position={[0, 0.34, 0]} castShadow>
              <meshStandardMaterial color="#192A56" roughness={0.4} />
            </RoundedBox>
            {/* Sandaran Kursi */}
            <RoundedBox args={[0.34, 0.36, 0.04]} radius={0.02} position={[0, 0.54, 0.16]} castShadow>
              <meshStandardMaterial color="#192A56" roughness={0.4} />
            </RoundedBox>
          </group>
        )
      })}
    </group>
  )
}

/**
 * 11. COFFEE & REFRESHMENT STATION: Pojok Espresso Bar & Dispenser
 */
export function CoffeeAndRefreshmentStation({ position = [5.5, 0.18, -3.8] }) {
  return (
    <group position={position}>
      {/* Meja Bar Kayu Solid */}
      <RoundedBox args={[1.4, 0.85, 0.6]} radius={0.03} position={[0, 0.425, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#e2d4c0" roughness={0.35} />
      </RoundedBox>
      {/* Top Counter Granit Hitam */}
      <RoundedBox args={[1.44, 0.05, 0.64]} radius={0.02} position={[0, 0.875, 0]} castShadow>
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.1} />
      </RoundedBox>

      {/* Mesin Espresso Modern Stainless Steel */}
      <group position={[-0.32, 0.9, 0]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[0.38, 0.42, 0.34]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Cerobong & Cup tray */}
        <mesh position={[0, 0.06, 0.18]}>
          <boxGeometry args={[0.34, 0.04, 0.12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        {/* Lampu Status Mesin Espresso */}
        <mesh position={[0.1, 0.36, 0.18]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
        {/* Cangkir Espresso Keramik Putih */}
        <mesh position={[-0.06, 0.12, 0.18]}>
          <cylinderGeometry args={[0.038, 0.032, 0.07, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
        </mesh>
      </group>

      {/* Dispenser Air Galon Minimalis */}
      <group position={[0.38, 0.9, 0]}>
        <mesh position={[0, 0.28, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.14, 0.52, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} />
        </mesh>
        {/* Galon Air Transparan Biru */}
        <mesh position={[0, 0.66, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.28, 16]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.65} roughness={0.1} />
        </mesh>
      </group>
    </group>
  )
}

/**
 * 12. ARCHITECTURAL FLOOR MARKINGS & CABLES: Garis Saluran Data LAN & Hazard Tape
 */
export function ArchitecturalFloorDetails() {
  return (
    <group position={[0, 0.182, 0]}>
      {/* Garis Hazard Belang Kuning-Hitam di Depan Vault */}
      <mesh position={[-5.2, 0.001, -2.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 0.14]} />
        <meshBasicMaterial color="#FF5B00" transparent opacity={0.75} />
      </mesh>

      {/* Jalur Saluran Data Logis (Conduit LAN) Menghubungkan Vault ke Workstation */}
      <mesh position={[-4.2, 0.001, -0.8]} rotation={[-Math.PI / 2, 0, 0.5]}>
        <planeGeometry args={[3.2, 0.06]} />
        <meshBasicMaterial color="#192A56" transparent opacity={0.35} />
      </mesh>

      {/* Area Karpet Minimalis di Bawah Meja Bos Pak Alfa */}
      <mesh position={[-5.8, 0.001, 1.8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.6, 2.4]} />
        <meshStandardMaterial color="#ECE8DC" roughness={0.9} />
      </mesh>

      {/* Area Karpet Minimalis di Bawah Workstation Desk */}
      <mesh position={[-3.2, 0.001, 1.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.6, 2.2]} />
        <meshStandardMaterial color="#ECE8DC" roughness={0.9} />
      </mesh>
    </group>
  )
}
