import React, { useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { 
  IsometricOfficeGlb, 
  FloatingBadge, 
  KanbanGlassBoard, 
  MsiCubiServerClusterAndVault,
  CctvCameraMesh
} from './OfficeElements'
import { CubiCharacter } from './CubiCharacter'

// Skala pembesaran kantor agar ruangan luas, megah, dan proporsional terhadap karakter
const OFFICE_SCALE = 2.1

// Lokasi Stasiun yang Memiliki Kursi Nyata di Model Kantor GLB
const CHAIR_LOCATIONS = [
  [-8.36, 0.36], // Kursi Meja Direktur
  [-5.32, 3.39], // Kursi Workstation 01 (Scout)
  [-4.09, 5.42], // Kursi Workstation 02 (Scribe)
  [-7.58, 9.65], // Kursi Meja Rapat (Boss)
  [-8.65, 8.63], // Kursi Meja Rapat (Blue)
  [-6.55, 8.63], // Kursi Meja Rapat (Purple)
  [-7.58, 7.62], // Kursi Meja Rapat (Green)
  [-8.35, 7.85], // Kursi Meja Rapat (Orange)
]

function hasChairAt(pos) {
  if (!pos) return false
  const p = Array.isArray(pos[0]) ? pos[pos.length - 1] : pos
  return CHAIR_LOCATIONS.some(([cx, cz]) => Math.hypot(p[0] - cx, p[2] - cz) < 0.65)
}

/**
 * Preset Sudut Pandang (POV) Kamera Arsitektural untuk Model GLB Kantor Luas (OFFICE_SCALE = 2.1)
 * Titik tengah GLB berada di [-10.6, 1.2, 10.4]
 */
export const POV_PRESETS = {
  overview: {
    label: 'Seluruh Kantor',
    pos: [14.0, 24.0, 32.0],
    lookAt: [-10.6, 1.2, 10.4],
    zoom: 26,
  },
  topdown: {
    label: 'Tampak Atas',
    pos: [-10.6, 42.0, 10.4],
    lookAt: [-10.6, 1.2, 10.4],
    zoom: 24,
  },
  boss: {
    label: 'Meja Direktur',
    pos: [-13.5, 5.5, -3.2],
    lookAt: [-17.55, 1.2, 0.75],
    zoom: 54,
  },
  workstation: {
    label: 'Workstation',
    pos: [-6.5, 6.5, 11.5],
    lookAt: [-11.17, 1.2, 7.12],
    zoom: 54,
  },
  reception: {
    label: 'Meja Resepsionis',
    pos: [3.8, 5.5, 14.5],
    lookAt: [-1.45, 1.2, 10.22],
    zoom: 52,
  },
  meeting: {
    label: 'Ruang Rapat & Live Screen',
    pos: [-7.0, 5.5, 17.5],
    lookAt: [-16.0, 1.4, 17.5],
    zoom: 50,
  },
  vault: {
    label: 'Server Vault',
    pos: [-6.0, 5.5, -3.5],
    lookAt: [-10.62, 1.2, 0.95],
    zoom: 54,
  },
  cctv_boss: {
    label: 'CAM 01: Ruang Direktur',
    // POV CCTV Sudut Dinding Dalam Ruang Direktur, Menatap Langsung Meja Eksekutif
    pos: [-15.2, 3.2, -1.2],
    lookAt: [-17.55, 0.8, 1.2],
    zoom: 72,
    isCctv: true,
    camNumber: '01',
    cctvName: 'CAM 01 // RUANG EKSEKUTIF DIREKTUR',
  },
  cctv_workstation: {
    label: 'CAM 02: Workstation AI',
    // POV CCTV Sudut Dinding Dalam Workstation, Menatap Scout & Scribe
    pos: [-7.2, 3.2, 5.8],
    lookAt: [-9.88, 0.8, 9.25],
    zoom: 68,
    isCctv: true,
    camNumber: '02',
    cctvName: 'CAM 02 // WORKSTATION COMPUTE & AI DRAFTER',
  },
  cctv_reception: {
    label: 'CAM 03: Resepsionis',
    // POV CCTV Dinding Sudut Dalam Resepsionis, Menatap Konter & Pintu Gate
    pos: [0.6, 3.0, 7.2],
    lookAt: [-1.45, 0.8, 10.22],
    zoom: 68,
    isCctv: true,
    camNumber: '03',
    cctvName: 'CAM 03 // RESEPSIONIS & TURNSTILE GATE',
  },
  cctv_vault: {
    label: 'CAM 04: Server Vault',
    // POV CCTV Dinding Sudut Dalam Ruang Server, Menatap Server NUC & Brankas
    pos: [-8.2, 3.0, -0.8],
    lookAt: [-10.2, 0.8, 1.3],
    zoom: 72,
    isCctv: true,
    camNumber: '04',
    cctvName: 'CAM 04 // SERVER VAULT & DATABASE NVMe',
  },
  cctv_meeting: {
    label: 'CAM 05: Ruang Rapat',
    // POV CCTV Sudut Dinding Dalam Ruang Rapat, Menatap Meja Konferensi & Layar Digital
    pos: [-13.2, 3.2, 14.8],
    lookAt: [-16.5, 0.8, 18.0],
    zoom: 66,
    isCctv: true,
    camNumber: '05',
    cctvName: 'CAM 05 // RUANG RAPAT & LIVE KANBAN',
  },
}

// CameraController: Transisi halus menuju sudut pandang POV terpilih tanpa mengunci kontrol manual pengguna
function CameraController({ targetPOV, transitionTrigger, isEntranceOpen, controlsRef, isPure3DMode = false }) {
  const { camera } = useThree()
  const isTransitioning = useRef(false)
  const transitionStartTime = useRef(0)
  const targetPos = useRef(new THREE.Vector3(14.0, 24.0, 32.0))
  const targetLookAt = useRef(new THREE.Vector3(-10.6, 1.2, 10.4))
  const targetZoom = useRef(isPure3DMode ? 32 : 26)

  // Ketika pengguna mulai berinteraksi secara manual (klik/drag/pan/scroll), segera lepaskan kontrol transisi
  useEffect(() => {
    const controls = controlsRef?.current
    if (!controls) return
    const handleControlStart = () => {
      isTransitioning.current = false
    }
    controls.addEventListener('start', handleControlStart)
    return () => {
      controls.removeEventListener('start', handleControlStart)
    }
  }, [controlsRef])

  useEffect(() => {
    if (isEntranceOpen) {
      targetPos.current.set(3.8, 5.5, 14.5)
      targetLookAt.current.set(-1.45, 1.2, 10.22)
      targetZoom.current = 38
      transitionStartTime.current = performance.now()
      isTransitioning.current = true
      return
    }

    const cfg = POV_PRESETS[targetPOV] || POV_PRESETS.overview
    targetPos.current.set(...cfg.pos)
    targetLookAt.current.set(...cfg.lookAt)
    targetZoom.current = isPure3DMode ? Math.round(cfg.zoom * 1.22) : cfg.zoom
    transitionStartTime.current = performance.now()
    isTransitioning.current = true
  }, [targetPOV, transitionTrigger, isEntranceOpen, isPure3DMode])

  useFrame(() => {
    if (!isTransitioning.current) return

    // Batas waktu transisi maksimal 1.2 detik agar kamera selalu responsif terhadap input pengguna
    if (performance.now() - transitionStartTime.current > 1200) {
      isTransitioning.current = false
      return
    }

    camera.position.lerp(targetPos.current, 0.08)
    camera.zoom = THREE.MathUtils.lerp(camera.zoom, targetZoom.current, 0.08)
    camera.updateProjectionMatrix()

    if (controlsRef?.current) {
      controlsRef.current.target.lerp(targetLookAt.current, 0.08)
      controlsRef.current.update()
    }

    const posDist = camera.position.distanceTo(targetPos.current)
    const zoomDist = Math.abs(camera.zoom - targetZoom.current)

    if (posDist < 0.08 && zoomDist < 0.3) {
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
  onChangePOV = null,
  isCctvAutoScanning = false,
}) {
  const internalControlsRef = useRef(null)
  const effectiveControlsRef = controlsRef || internalControlsRef

  // Karakter ditempatkan presisi di atas kursi/meja model GLB
  const boss = bossConfig || {
    name: 'Pak Alfa',
    role: 'Sales Director',
    color: '#192A56',
    pos: [-8.36, 0.33, 0.36],
    targetPos: [-8.36, 0.33, 0.36],
    rotationY: 0,
    isTyping: false,
    isWalking: false,
  }

  const blueAgent = agents?.['blue-agent'] || {
    id: 'blue-agent',
    name: 'Cubi Scout',
    role: 'Compute & Stock',
    color: '#0284c7',
    pos: [-5.32, 0.33, 3.39],
    targetPos: [-5.32, 0.33, 3.39],
    rotationY: 0,
    isTyping: true,
    isWalking: false,
  }

  const purpleAgent = agents?.['purple-agent'] || {
    id: 'purple-agent',
    name: 'Cubi Scribe',
    role: 'AI Pitch Drafter',
    color: '#9333ea',
    pos: [-4.09, 0.33, 5.42],
    targetPos: [-4.09, 0.33, 5.42],
    rotationY: Math.PI,
    isTyping: true,
    isWalking: false,
  }

  const greenAgent = agents?.['green-agent'] || {
    id: 'green-agent',
    name: 'Cubi Gate',
    role: 'Gatekeeper',
    color: '#16a34a',
    pos: [-0.69, 0.33, 4.87],
    targetPos: [-0.69, 0.33, 4.87],
    rotationY: -Math.PI / 2,
    isTyping: false,
    isWalking: false,
  }

  const orangeAgent = agents?.['orange-agent'] || {
    id: 'orange-agent',
    name: 'Cubi Vault',
    role: 'Archivist',
    color: '#334155',
    pos: [-5.06, 0.33, 0.45],
    targetPos: [-5.06, 0.33, 0.45],
    rotationY: 0,
    isTyping: false,
    isWalking: false,
  }

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing bg-[#f8fafc]">
      <Canvas
        orthographic
        dpr={[1, 1.25]}
        camera={{
          position: [14.0, 24.0, 32.0],
          zoom: 26,
          near: 0.1,
          far: 600,
        }}
        gl={{ 
          antialias: true, 
          alpha: true, 
          powerPreference: 'high-performance', 
          stencil: false,
          depth: true
        }}
      >
        <OrbitControls
          ref={effectiveControlsRef}
          enableRotate={true}
          enableZoom={true}
          enablePan={true}
          autoRotate={isCctvAutoScanning}
          autoRotateSpeed={2.2}
          screenSpacePanning={true}
          enableDamping={true}
          dampingFactor={0.08}
          rotateSpeed={0.85}
          zoomSpeed={1.2}
          panSpeed={1.0}
          maxPolarAngle={Math.PI / 2.05}
          minPolarAngle={0.05}
          minZoom={12}
          maxZoom={160}
          target={[-10.6, 1.2, 10.4]}
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
          }}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
        />

        {/* Kontrol Kamera Transisi Halus Menuju POV Terpilih */}
        <CameraController
          targetPOV={activePOV}
          transitionTrigger={transitionTrigger}
          isEntranceOpen={isEntranceOpen}
          controlsRef={effectiveControlsRef}
          isPure3DMode={isPure3DMode}
        />

        {/* Pencahayaan Studio Putih Bersih & Presisi (Mencegah Over-Exposure Tekstur Lantai) */}
        <ambientLight intensity={1.30} color="#ffffff" />
        <directionalLight position={[24, 36, 30]} intensity={1.35} color="#ffffff" />
        <directionalLight position={[-24, 26, -16]} intensity={0.65} color="#e0f2fe" />

        {/* ======================================================== */}
        {/* GROUP UTAMA KANTOR GLB & KARAKTER (SKALA DIPERBESAR 2.1x) */}
        {/* ======================================================== */}
        <group scale={[OFFICE_SCALE, OFFICE_SCALE, OFFICE_SCALE]}>
          {/* Model 3D Kantor GLB (Isometric Office) Berwarna Biru Modern Website */}
          <Suspense fallback={null}>
            <IsometricOfficeGlb />

            {/* Layar Digital Konferensi Ruang Rapat (Menyatu pada dinding monitor display paling kiri) */}
            <KanbanGlassBoard
              position={[-9.91, 1.17, 8.39]}
              rotation={[0, Math.PI / 2, 0]}
              leads={leads}
              activeLead={activeLead}
              pitchResult={pitchResult}
              showLabels={!isPure3DMode}
            />

            {/* Brankas Server MSI Cubi NUC di Area Arsip & Server */}
            <MsiCubiServerClusterAndVault
              position={[-4.5, 0.55, 0.79]}
              showLabels={!isPure3DMode}
            />

            {/* Model 3D CCTV Kamera Pengawas di Dinding Dalam Tiap Ruangan Kantor */}
            {/* CCTV 01: Ruang Direktur Eksekutif (Menempel pada Dinding Dalam Belakang) */}
            <CctvCameraMesh
              id="cctv_boss"
              camNumber="01"
              roomName="Ruang Direktur Eksekutif"
              position={[-8.8, 1.85, 0.16]}
              rotation={[0, 0.25, 0]}
              isActive={activePOV === 'cctv_boss'}
              onClick={onChangePOV}
            />

            {/* CCTV 02: Workstation Utama Scout & Scribe (Menempel pada Dinding Partisi Dalam) */}
            <CctvCameraMesh
              id="cctv_workstation"
              camNumber="02"
              roomName="Workstation AI Swarm"
              position={[-3.8, 1.85, 2.65]}
              rotation={[0, -2.1, 0]}
              isActive={activePOV === 'cctv_workstation'}
              onClick={onChangePOV}
            />

            {/* CCTV 03: Meja Resepsionis & Pintu Masuk (Menempel pada Dinding Dalam Area Depan) */}
            <CctvCameraMesh
              id="cctv_reception"
              camNumber="03"
              roomName="Resepsionis & Turnstile Gate"
              position={[-0.38, 1.85, 3.8]}
              rotation={[0, -1.8, 0]}
              isActive={activePOV === 'cctv_reception'}
              onClick={onChangePOV}
            />

            {/* CCTV 04: Server Vault & Arsip Data (Menempel pada Dinding Dalam Belakang Ruang Server) */}
            <CctvCameraMesh
              id="cctv_vault"
              camNumber="04"
              roomName="Server Vault & Database"
              position={[-4.8, 1.85, 0.16]}
              rotation={[0, 0.2, 0]}
              isActive={activePOV === 'cctv_vault'}
              onClick={onChangePOV}
            />

            {/* CCTV 05: Ruang Rapat & Layar Presentasi (Menempel pada Dinding Dalam Ruang Rapat) */}
            <CctvCameraMesh
              id="cctv_meeting"
              camNumber="05"
              roomName="Ruang Rapat & Screen"
              position={[-6.8, 1.85, 9.72]}
              rotation={[0, 2.8, 0]}
              isActive={activePOV === 'cctv_meeting'}
              onClick={onChangePOV}
            />
          </Suspense>

          {/* ======================================================== */}
          {/* KARAKTER CUBI BOT (Skala Proporsional & Duduk Alami)      */}
          {/* ======================================================== */}

          {/* Karakter 1: PAK ALFA (BOS DIREKTUR) - Di Meja Ruang Eksekutif Pribadi */}
          <CubiCharacter
            id="boss"
            name={boss.name || 'Pak Alfa'}
            role={boss.role || 'Sales Director'}
            color={boss.color || '#192A56'}
            emoji={boss.emoji || '👑'}
            vibe={boss.vibe}
            personaId={boss.personaId}
            position={boss.pos || [-8.36, 0.33, 0.36]}
            targetPosition={boss.targetPos || [-8.36, 0.33, 0.36]}
            rotationY={boss.rotationY ?? 0}
            scale={0.88}
            hideBadge={isPure3DMode}
            isBoss={true}
            isSitting={!boss.isWalking && hasChairAt(boss.targetPos || boss.pos)}
            isWalking={boss.isWalking}
            isTyping={boss.isTyping}
            isSelected={!isPure3DMode && selectedAgentId === 'boss'}
            onClick={onSelectAgent}
          />

          {/* Karakter 2: CUBI SCOUT (Biru - Compute & Stock) - Di Meja Workstation 01 */}
          <CubiCharacter
            id="blue-agent"
            name={blueAgent.name || 'Cubi Scout'}
            role={blueAgent.role || 'Compute & Stock'}
            color={blueAgent.color || '#0284c7'}
            emoji={blueAgent.emoji || '🤖'}
            vibe={blueAgent.vibe}
            personaId={blueAgent.personaId}
            position={blueAgent.pos || [-5.32, 0.33, 3.39]}
            targetPosition={blueAgent.targetPos || [-5.32, 0.33, 3.39]}
            rotationY={blueAgent.rotationY ?? 0}
            scale={0.78}
            hideBadge={isPure3DMode}
            isSitting={!blueAgent.isWalking && hasChairAt(blueAgent.targetPos || blueAgent.pos)}
            isWalking={blueAgent.isWalking}
            isTyping={blueAgent.isTyping ?? true}
            isScanning={blueAgent.isScanning}
            isSelected={!isPure3DMode && selectedAgentId === 'blue-agent'}
            onClick={onSelectAgent}
          />

          {/* Karakter 3: CUBI SCRIBE (Ungu - AI Drafter) - Di Meja Workstation 02 */}
          <CubiCharacter
            id="purple-agent"
            name={purpleAgent.name || 'Cubi Scribe'}
            role={purpleAgent.role || 'AI Pitch Drafter'}
            color={purpleAgent.color || '#9333ea'}
            emoji={purpleAgent.emoji || '✍️'}
            vibe={purpleAgent.vibe}
            personaId={purpleAgent.personaId}
            position={purpleAgent.pos || [-4.09, 0.33, 5.42]}
            targetPosition={purpleAgent.targetPos || [-4.09, 0.33, 5.42]}
            rotationY={purpleAgent.rotationY ?? Math.PI}
            scale={0.78}
            hideBadge={isPure3DMode}
            isSitting={!purpleAgent.isWalking && hasChairAt(purpleAgent.targetPos || purpleAgent.pos)}
            isWalking={purpleAgent.isWalking}
            isTyping={purpleAgent.isTyping ?? true}
            isSelected={!isPure3DMode && selectedAgentId === 'purple-agent'}
            onClick={onSelectAgent}
          />

          {/* Karakter 4: CUBI GATE (Hijau - Gatekeeper) - Di Meja Resepsionis & Pintu Masuk */}
          <CubiCharacter
            id="green-agent"
            name={greenAgent.name || 'Cubi Gate'}
            role={greenAgent.role || 'Approval & Dispatch'}
            color={greenAgent.color || '#16a34a'}
            emoji={greenAgent.emoji || '🛡️'}
            vibe={greenAgent.vibe}
            personaId={greenAgent.personaId}
            position={greenAgent.pos || [-0.69, 0.33, 4.87]}
            targetPosition={greenAgent.targetPos || [-0.69, 0.33, 4.87]}
            rotationY={greenAgent.rotationY ?? (-Math.PI / 2)}
            scale={0.78}
            hideBadge={isPure3DMode}
            isSitting={!greenAgent.isWalking && hasChairAt(greenAgent.targetPos || greenAgent.pos)}
            isWalking={greenAgent.isWalking}
            isSelected={!isPure3DMode && selectedAgentId === 'green-agent'}
            onClick={onSelectAgent}
          />

          {/* Karakter 5: CUBI VAULT (Slate - Archivist) - Di Meja Server & Database */}
          <CubiCharacter
            id="orange-agent"
            name={orangeAgent.name || 'Cubi Vault'}
            role={orangeAgent.role || 'Data Archivist'}
            color={orangeAgent.color || '#334155'}
            emoji={orangeAgent.emoji || '💾'}
            vibe={orangeAgent.vibe}
            personaId={orangeAgent.personaId}
            position={orangeAgent.pos || [-5.06, 0.33, 0.45]}
            targetPosition={orangeAgent.targetPos || [-5.06, 0.33, 0.45]}
            rotationY={orangeAgent.rotationY ?? 0}
            scale={0.78}
            hideBadge={isPure3DMode}
            isSitting={!orangeAgent.isWalking && hasChairAt(orangeAgent.targetPos || orangeAgent.pos)}
            isWalking={orangeAgent.isWalking}
            isSelected={!isPure3DMode && selectedAgentId === 'orange-agent'}
            onClick={onSelectAgent}
          />
        </group>

        {/* Bayangan Halus Dasar Lantai */}
        <ContactShadows
          position={[-10.6, -0.06, 10.4]}
          opacity={0.35}
          scale={50}
          blur={2.4}
          far={6.0}
          resolution={256}
          frames={1}
        />
      </Canvas>
    </div>
  )
}
