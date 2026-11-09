import React, { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import {
  Layers,
  Compass,
  ShieldCheck,
  Cpu,
  Terminal,
  HardDrive,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react'
import { 
  DioramaRoom, 
  WhiteboardElement,
  ExecutiveBossSuite,
  ModernDeskWorkstation, 
  MsiCubiServerClusterAndVault, 
  KanbanGlassBoard, 
  SecurityTurnstileGate, 
  ExecutiveLounge, 
  PottedPlant,
  CenterHoloHub,
  CoffeeAndRefreshmentStation,
  ArchitecturalFloorDetails
} from './OfficeElements'
import { CubiCharacter } from './CubiCharacter'

// Preset Sudut Pandang (POV) Fleksibel di Ruangan Kantor 3D (Skala Lebih Besar & Nyata)
const POV_PRESETS = {
  overview: {
    label: 'Isometrik 3D',
    icon: Layers,
    pos: [26, 22, 26],
    lookAt: [0, 0.8, 0],
    zoom: 48,
  },
  topdown: {
    label: 'Blueprint Atas',
    icon: Compass,
    pos: [0.01, 40, 0.01],
    lookAt: [0, 0.8, 0],
    zoom: 48,
  },
  boss: {
    label: 'Meja Direktur',
    icon: ShieldCheck,
    pos: [-1.8, 12, 9],
    lookAt: [-5.8, 0.8, 2.3],
    zoom: 65,
  },
  workstation: {
    label: 'Workstations',
    icon: Cpu,
    pos: [2.5, 10, 8],
    lookAt: [-1.2, 0.8, 0.5],
    zoom: 62,
  },
  kanban: {
    label: 'Kanban Wall',
    icon: Terminal,
    pos: [3.2, 8, 3.2],
    lookAt: [2.4, 1.4, -3.8],
    zoom: 62,
  },
  vault: {
    label: 'Server Vault',
    icon: HardDrive,
    pos: [-2.2, 8, 2.2],
    lookAt: [-5.2, 1.4, -3.8],
    zoom: 62,
  },
}

// CameraController Fleksibel: Hanya melakukan lerp transisi saat diminta, TIDAK mengunci OrbitControls
function CameraController({ targetPOV, transitionTrigger, isEntranceOpen, controlsRef, isPure3DMode = false }) {
  const { camera } = useThree()
  const isTransitioning = useRef(false)
  const targetPos = useRef(new THREE.Vector3(26, 22, 26))
  const targetLookAt = useRef(new THREE.Vector3(0, 0.8, 0))
  const targetZoom = useRef(isPure3DMode ? 66 : 48)

  useEffect(() => {
    if (isEntranceOpen) {
      targetPos.current.set(15, 13, 17)
      targetLookAt.current.set(0, 0.8, 0)
      targetZoom.current = 52
      isTransitioning.current = true
      return
    }

    const cfg = POV_PRESETS[targetPOV] || POV_PRESETS.overview
    targetPos.current.set(...cfg.pos)
    targetLookAt.current.set(...cfg.lookAt)
    // Di mode Pure Fullscreen, tingkatkan zoom agar kantor memenuhi layar penuh edge-to-edge
    targetZoom.current = isPure3DMode ? Math.round(cfg.zoom * 1.35) : cfg.zoom
    isTransitioning.current = true
  }, [targetPOV, transitionTrigger, isEntranceOpen, isPure3DMode])

  useFrame(() => {
    if (!isTransitioning.current) return

    camera.position.lerp(targetPos.current, 0.08)
    camera.zoom = THREE.MathUtils.lerp(camera.zoom, targetZoom.current, 0.08)
    camera.updateProjectionMatrix()

    if (controlsRef?.current) {
      controlsRef.current.target.lerp(targetLookAt.current, 0.08)
      controlsRef.current.update()
    }

    const posDist = camera.position.distanceTo(targetPos.current)
    const zoomDist = Math.abs(camera.zoom - targetZoom.current)

    // Selesai transisi: matikan flag sehingga OrbitControls bebas bergerak (zoom, rotate, pan)
    if (posDist < 0.05 && zoomDist < 0.2) {
      camera.position.copy(targetPos.current)
      camera.zoom = targetZoom.current
      camera.updateProjectionMatrix()
      if (controlsRef?.current) {
        controlsRef.current.target.copy(targetLookAt.current)
        controlsRef.current.update()
      }
      isTransitioning.current = false
    }
  })

  return null
}

export function OfficeScene({
  agents,
  bossConfig,
  selectedAgentId,
  onSelectAgent,
  leads = [],
  activeLead = null,
  pitchResult = null,
  isEntranceOpen = false,
  activePOV = 'overview',
  transitionTrigger = 0,
  controlsRef = null,
  isPure3DMode = false,
}) {
  const internalControlsRef = useRef(null)
  const effectiveControlsRef = controlsRef || internalControlsRef

  const boss = bossConfig || {
    name: 'Pak Alfa',
    role: 'Sales Director',
    color: '#192A56',
    pos: [-5.8, 0.18, 2.25],
    targetPos: [-5.8, 0.18, 2.25],
    rotationY: Math.PI,
    isTyping: false,
    isWalking: false,
  }

  const blueAgent = agents?.['blue-agent'] || {
    id: 'blue-agent',
    name: 'Cubi Scout',
    role: 'Compute',
    color: '#0284c7',
    pos: [-3.2, 0.18, 1.85],
    targetPos: [-3.2, 0.18, 1.85],
    isTyping: true,
    isWalking: false,
  }

  const purpleAgent = agents?.['purple-agent'] || {
    id: 'purple-agent',
    name: 'Cubi Scribe',
    role: 'AI Drafter',
    color: '#4F46E5',
    pos: [3.2, 0.18, -2.6],
    targetPos: [3.2, 0.18, -2.6],
    isTyping: false,
    isWalking: false,
  }

  const orangeAgent = agents?.['orange-agent'] || {
    id: 'orange-agent',
    name: 'Cubi Vault',
    role: 'Archivist',
    color: '#334155',
    pos: [-4.5, 0.18, -2.6],
    targetPos: [-4.5, 0.18, -2.6],
    isTyping: false,
    isWalking: false,
  }

  const greenAgent = agents?.['green-agent'] || {
    id: 'green-agent',
    name: 'Cubi Gate',
    role: 'Gatekeeper',
    color: '#16a34a',
    pos: [2.2, 0.18, 0.8],
    targetPos: [2.2, 0.18, 0.8],
    isTyping: false,
    isWalking: false,
  }

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing bg-gradient-to-br from-slate-200 via-slate-100 to-blue-50/70">
      <Canvas
        shadows
        orthographic
        camera={{
          position: [26, 22, 26],
          zoom: 46,
          near: 0.1,
          far: 500,
        }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <OrbitControls
          ref={effectiveControlsRef}
          enableRotate={true}
          enableZoom={true}
          enablePan={true}
          screenSpacePanning={true}
          enableDamping={true}
          dampingFactor={0.08}
          rotateSpeed={0.85}
          zoomSpeed={1.2}
          panSpeed={1.0}
          maxPolarAngle={Math.PI / 2.05}
          minPolarAngle={0.05}
          minZoom={10}
          maxZoom={120}
          target={[0, 0.8, 0]}
        />

        {/* Kontrol Kamera Transisi Halus (Bebas Bergerak setelah Transisi Selesai) */}
        <CameraController
          targetPOV={activePOV}
          transitionTrigger={transitionTrigger}
          isEntranceOpen={isEntranceOpen}
          controlsRef={effectiveControlsRef}
          isPure3DMode={isPure3DMode}
        />

        {/* Pencahayaan Studio Alami yang Bersih & Terang */}
        <ambientLight intensity={1.4} color="#ffffff" />
        
        {/* Lampu Utama Matahari / Keylight dengan Bayangan Halus */}
        <directionalLight
          position={[22, 32, 22]}
          intensity={1.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={80}
          shadow-camera-left={-16}
          shadow-camera-right={16}
          shadow-camera-top={16}
          shadow-camera-bottom={-16}
          shadow-bias={-0.0001}
          color="#ffffff"
        />

        {/* Lampu Fill Ambient Lembut */}
        <pointLight position={[-10, 10, 10]} intensity={0.5} color="#e0f2fe" />
        <pointLight position={[10, 8, -8]} intensity={0.4} color="#fef3c7" />

        {/* 1. Komponen Ruangan Diorama (Lantai Porselen Bersih) */}
        <DioramaRoom />

        {/* 1.1 Architectural Floor Details (Karpet, Jalur Kabel Data & Hazard Tape) */}
        <ArchitecturalFloorDetails />

        {/* Bayangan Kontak Halus di Permukaan Lantai */}
        <ContactShadows
          position={[0, 0.185, 0]}
          opacity={0.45}
          scale={22}
          blur={2.2}
          far={4.0}
        />

        {/* 2. VAULT: Brankas Baja & Server Cluster MSI Cubi NUC (Kiri Belakang) */}
        <MsiCubiServerClusterAndVault position={[-5.2, 0.18, -3.8]} showLabels={!isPure3DMode} />

        {/* 3. WHITEBOARD: Papan Ide & Planning (Tengah Kiri Belakang - Sesuai referensi1.png) */}
        <WhiteboardElement position={[-1.2, 0.18, -3.8]} showLabels={!isPure3DMode} />

        {/* 3.5 REFRESHMENT: Espresso Coffee Bar & Dispenser (Kanan Belakang) */}
        <CoffeeAndRefreshmentStation position={[5.4, 0.18, -3.8]} />

        {/* 4. KANBAN WALL: Papan Kaca Kanban Dinamis (Kanan Belakang) */}
        <KanbanGlassBoard
          position={[2.4, 0.18, -3.8]}
          leads={leads}
          activeLead={activeLead}
          pitchResult={pitchResult}
          showLabels={!isPure3DMode}
        />

        {/* 4.5 CENTER HOLO HUB: Meja Bundar Telemetri AI Swarm Pusat Ruangan (Mengisi Kekosongan Tengah Ruang) */}
        <CenterHoloHub position={[0, 0.18, 0]} />

        {/* 5. DESK 01: Workstation Modern Meja Kayu Walnut & Dual Monitor (Kiri Depan) */}
        <ModernDeskWorkstation
          position={[-3.2, 0.18, 1.2]}
          isTyping={blueAgent.isTyping}
          showLabels={!isPure3DMode}
        />

        {/* 5.5 DESK 02: Workstation Meja Kedua untuk Drafter (Kanan Tengah) */}
        <ModernDeskWorkstation
          position={[3.2, 0.18, -1.2]}
          isTyping={purpleAgent.isTyping}
          showLabels={!isPure3DMode}
        />

        {/* 6. EXECUTIVE SUITE: Meja Eksekutif Direktur Pak Alfa */}
        <ExecutiveBossSuite
          position={[-5.8, 0.18, 1.8]}
          bossName={boss.name || 'Pak Alfa'}
          bossRole={boss.role || 'Sales Director'}
          showLabels={!isPure3DMode}
        />

        {/* 7. SECURITY GATE: Gerbang Turnstile & WhatsApp Dispatch (Kanan Depan) */}
        <SecurityTurnstileGate position={[2.2, 0.18, 1.8]} showLabels={!isPure3DMode} />

        {/* 8. EXECUTIVE LOUNGE: Area Santai Sofa & Coffee Table (Kanan Jauh) */}
        <ExecutiveLounge position={[5.5, 0.18, 1.2]} />

        {/* 9. Tanaman Hias Hijau Segar Minimalis di Sudut */}
        <PottedPlant position={[7.8, 0.18, -5.8]} scale={1.1} />
        <PottedPlant position={[-7.8, 0.18, 5.2]} scale={0.9} />
        <PottedPlant position={[7.6, 0.18, 5.2]} scale={0.9} />
        <PottedPlant position={[-7.8, 0.18, -5.8]} scale={0.95} />

        {/* 10. KARAKTER CUBI BOT MINI (Tenang & Rapi) */}

        {/* Karakter 1: BOS CUBI (Pak Alfa / Deal Strategist) Duduk Santai di Kursi Meja Eksekutif */}
        <CubiCharacter
          id="boss"
          name={boss.name || 'Pak Alfa'}
          role={boss.role || 'Sales Director'}
          color={boss.color || '#192A56'}
          emoji={boss.emoji || '👑'}
          vibe={boss.vibe}
          personaId={boss.personaId}
          position={boss.pos || [-5.8, 0.18, 2.35]}
          targetPosition={boss.targetPos || [-5.8, 0.18, 2.35]}
          rotationY={boss.rotationY ?? Math.PI}
          hideBadge={isPure3DMode}
          isBoss={true}
          isSitting={!boss.isWalking}
          isWalking={boss.isWalking}
          isTyping={boss.isTyping}
          isSelected={selectedAgentId === 'boss'}
          onClick={onSelectAgent}
        />

        {/* Karakter 2: CUBI SCOUT / SALES ENGINEER (Biru - Compute) Duduk di Kursi Kerja Desk 01 */}
        <CubiCharacter
          id="blue-agent"
          name={blueAgent.name || 'Cubi Scout'}
          role={blueAgent.role || 'Compute & Stock'}
          color={blueAgent.color || '#0284c7'}
          emoji={blueAgent.emoji || '🤖'}
          vibe={blueAgent.vibe}
          personaId={blueAgent.personaId}
          position={blueAgent.pos || [-3.2, 0.18, 1.85]}
          targetPosition={blueAgent.targetPos || [-3.2, 0.18, 1.85]}
          rotationY={blueAgent.rotationY ?? Math.PI}
          hideBadge={isPure3DMode}
          isSitting={!blueAgent.isWalking}
          isWalking={blueAgent.isWalking}
          isTyping={blueAgent.isTyping ?? true}
          isScanning={blueAgent.isScanning}
          isSelected={selectedAgentId === 'blue-agent'}
          onClick={onSelectAgent}
        />

        {/* Karakter 3: CUBI SCRIBE / OUTBOUND STRATEGIST (Ungu - AI Drafter) Berdiri Aktif di Depan Kanban Wall */}
        <CubiCharacter
          id="purple-agent"
          name={purpleAgent.name || 'Cubi Scribe'}
          role={purpleAgent.role || 'AI Pitch Drafter'}
          color={purpleAgent.color || '#9333ea'}
          emoji={purpleAgent.emoji || '✍️'}
          vibe={purpleAgent.vibe}
          personaId={purpleAgent.personaId}
          position={purpleAgent.pos || [3.2, 0.18, -2.6]}
          targetPosition={purpleAgent.targetPos || [3.2, 0.18, -2.6]}
          rotationY={purpleAgent.rotationY ?? (Math.PI * 0.82)}
          hideBadge={isPure3DMode}
          isSitting={false}
          isWalking={purpleAgent.isWalking}
          isTyping={purpleAgent.isTyping}
          isSelected={selectedAgentId === 'purple-agent'}
          onClick={onSelectAgent}
        />

        {/* Karakter 4: CUBI GATE / PIPELINE ANALYST (Hijau - Gatekeeper) Berdiri Siaga di Security Gate */}
        <CubiCharacter
          id="green-agent"
          name={greenAgent.name || 'Cubi Gate'}
          role={greenAgent.role || 'Approval & Dispatch'}
          color={greenAgent.color || '#16a34a'}
          emoji={greenAgent.emoji || '🛡️'}
          vibe={greenAgent.vibe}
          personaId={greenAgent.personaId}
          position={greenAgent.pos || [2.2, 0.18, 0.8]}
          targetPosition={greenAgent.targetPos || [2.2, 0.18, 0.8]}
          rotationY={greenAgent.rotationY ?? 0.12}
          hideBadge={isPure3DMode}
          isSitting={false}
          isWalking={greenAgent.isWalking}
          isSelected={selectedAgentId === 'green-agent'}
          onClick={onSelectAgent}
        />

        {/* Karakter 5: CUBI VAULT / ACCOUNT STRATEGIST (Slate - Archivist) Berdiri Aktif di Depan Server Vault */}
        <CubiCharacter
          id="orange-agent"
          name={orangeAgent.name || 'Cubi Vault'}
          role={orangeAgent.role || 'Data Archivist'}
          color={orangeAgent.color || '#334155'}
          emoji={orangeAgent.emoji || '💾'}
          vibe={orangeAgent.vibe}
          personaId={orangeAgent.personaId}
          position={orangeAgent.pos || [-4.5, 0.18, -2.6]}
          targetPosition={orangeAgent.targetPos || [-4.5, 0.18, -2.6]}
          rotationY={orangeAgent.rotationY ?? (-Math.PI * 0.65)}
          hideBadge={isPure3DMode}
          isSitting={false}
          isWalking={orangeAgent.isWalking}
          isSelected={selectedAgentId === 'orange-agent'}
          onClick={onSelectAgent}
        />
      </Canvas>
    </div>
  )
}
