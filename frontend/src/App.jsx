import React, { useState, useEffect, useRef, Suspense, lazy } from 'react'
import { Minimize2, Compass, Plus, Minus } from 'lucide-react'
import { DashboardOverlay } from './components/DashboardOverlay'
import { DeviceSecurityModal } from './components/DeviceSecurityModal'

// Lazy-loaded routes & heavy components to drastically reduce initial memory & bundle footprint
const OfficeScene = lazy(() => import('./components/OfficeScene').then(m => ({ default: m.OfficeScene })))
const LandingPage = lazy(() => import('./components/LandingPage').then(m => ({ default: m.LandingPage })))
const DashboardView = lazy(() => import('./components/DashboardView').then(m => ({ default: m.DashboardView })))
const TeamSetupModal = lazy(() => import('./components/TeamSetupModal').then(m => ({ default: m.TeamSetupModal })))
const CreateLeadModal = lazy(() => import('./components/CreateLeadModal').then(m => ({ default: m.CreateLeadModal })))
const OfficeEntranceModal = lazy(() => import('./components/OfficeEntranceModal').then(m => ({ default: m.OfficeEntranceModal })))

function RouteLoadingFallback() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-white text-[#192A56] font-mono select-none">
      <div className="w-9 h-9 border-2 border-[#192A56] border-t-transparent rounded-full animate-spin mb-3" />
      <span className="text-xs uppercase tracking-widest font-bold">Memuat Modul Sistem...</span>
    </div>
  )
}

const API_BASE = 'http://127.0.0.1:8000'

// Inisialisasi rute dari path URL browser
function getInitialRoute() {
  if (typeof window === 'undefined') return 'landing'
  const path = window.location.pathname.toLowerCase()
  if (path === '/office' || path === '/kantor') return 'office'
  if (path === '/dashboard') return 'dashboard'
  return 'landing'
}

// Titik Koordinat Stasiun Kerja di Model GLB Kantor (office-3d/isometric_office (1).glb)
const STATIONS = {
  boss_desk: [-8.36, 0.33, 0.36],
  workstation_desk: [-5.32, 0.33, 3.39],
  workstation_desk_02: [-4.09, 0.33, 5.42],
  kanban_board: [-7.58, 0.33, 9.85],
  whiteboard: [-7.58, 0.33, 9.85],
  security_gate: [-0.69, 0.33, 4.87],
  data_vault: [-5.06, 0.33, 0.45],
  center_hall: [-4.8, 0.33, 3.8],
  // Posisi Duduk Melingkar di Meja Rapat Konferensi (Meeting_table_490)
  meeting_boss: [-7.58, 0.33, 9.65],
  meeting_blue: [-8.65, 0.33, 8.63],
  meeting_purple: [-6.55, 0.33, 8.63],
  meeting_green: [-7.58, 0.33, 7.62],
  meeting_orange: [-8.35, 0.33, 7.85],
}

const DEFAULT_BOSS = {
  name: 'Deal Strategist',
  role: 'Deal Strategist & Closing Architect',
  color: '#1B4D3E',
  emoji: 'DIRECTOR',
  vibe: 'Qualifies deals like a surgeon and kills happy ears on contact.',
  personaId: 'sales-deal-strategist',
  badge: 'DIRECTOR',
  pos: STATIONS.boss_desk,
  targetPos: STATIONS.boss_desk,
  rotationY: 0,
  isWalking: false,
  isTyping: false,
  statusText: 'Supervising Office & Deals',
}

const DEFAULT_AGENTS = {
  'blue-agent': {
    id: 'blue-agent',
    name: 'Sales Engineer',
    role: 'Compute & Stock Analyzer',
    color: '#192A56',
    emoji: 'COMPUTE',
    vibe: 'Connects technical specs directly to customer ROI.',
    personaId: 'sales-engineer',
    pos: STATIONS.workstation_desk,
    targetPos: STATIONS.workstation_desk,
    rotationY: 0,
    isWalking: false,
    isTyping: true,
    isScanning: false,
    statusText: 'Monitoring Stock & Catalog',
    station: 'Workstation 01',
  },
  'purple-agent': {
    id: 'purple-agent',
    name: 'Outbound Strategist',
    role: 'AI Pitch Drafter',
    color: '#4F46E5',
    emoji: 'DRAFTER',
    vibe: 'Turns buying signals into booked meetings before competition notices.',
    personaId: 'sales-outbound-strategist',
    pos: STATIONS.workstation_desk_02,
    targetPos: STATIONS.workstation_desk_02,
    rotationY: Math.PI,
    isWalking: false,
    isTyping: true,
    isScanning: false,
    statusText: 'Sprint Task Ready',
    station: 'Workstation 02',
  },
  'green-agent': {
    id: 'green-agent',
    name: 'Pipeline Analyst',
    role: 'Approval & Dispatch',
    color: '#059669',
    emoji: 'GATE',
    vibe: 'Tells you your forecast is wrong before you realize it yourself.',
    personaId: 'sales-pipeline-analyst',
    pos: STATIONS.security_gate,
    targetPos: STATIONS.security_gate,
    rotationY: -Math.PI / 2,
    isWalking: false,
    isTyping: false,
    isScanning: false,
    statusText: 'WhatsApp Gateway Standby',
    station: 'Meja Resepsionis',
  },
  'orange-agent': {
    id: 'orange-agent',
    name: 'Account Strategist',
    role: 'Data & Deal Archivist',
    color: '#334155',
    emoji: 'VAULT',
    vibe: 'Expands customer lifetime value through proactive account mastery.',
    personaId: 'sales-account-strategist',
    pos: STATIONS.data_vault,
    targetPos: STATIONS.data_vault,
    rotationY: 0,
    isWalking: false,
    isTyping: false,
    isScanning: false,
    statusText: 'Database & Inventory Synced',
    station: 'Server Vault & Data Archive',
  },
}

class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, showDetails: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('RouteErrorBoundary caught an error:', error, errorInfo)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentRoute !== this.props.currentRoute && this.state.hasError) {
      this.setState({ hasError: false, error: null })
    }
  }

  handleNavigate(route) {
    this.setState({ hasError: false, error: null }, () => {
      if (this.props.onNavigate) {
        this.props.onNavigate(route)
      } else {
        const path = route === 'landing' ? '/' : `/${route}`
        window.history.pushState({}, '', path)
        window.location.reload()
      }
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-white text-[#192A56] p-6 font-mono select-none">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 bg-[#192A56] text-white flex items-center justify-center font-bold text-xl mx-auto rounded-xl shadow-sm">
              !
            </div>
            <h2 className="text-base font-bold uppercase tracking-wider text-[#192A56]">
              Pemulihan Tampilan Aplikasi
            </h2>
            <p className="text-xs text-[#576574] leading-relaxed">
              Terjadi penyesuaian grafis atau kendala render pada rute ini. Pilih salah satu menu navigasi di bawah untuk melanjutkan:
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 rounded-xl bg-[#192A56] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#0E1A38] transition cursor-pointer shadow-sm"
              >
                Coba Lagi
              </button>
              <button
                type="button"
                onClick={() => this.handleNavigate('landing')}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-[#192A56] font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer shadow-xs"
              >
                Beranda
              </button>
              <button
                type="button"
                onClick={() => this.handleNavigate('office')}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-[#192A56] font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer shadow-xs"
              >
                Kantor 3D
              </button>
              <button
                type="button"
                onClick={() => this.handleNavigate('dashboard')}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-[#192A56] font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer shadow-xs"
              >
                Dashboard
              </button>
            </div>

            {/* Error Detail Toggle */}
            {this.state.error && (
              <div className="pt-4 border-t border-slate-100 text-left">
                <button
                  type="button"
                  onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  {this.state.showDetails ? 'Sembunyikan Detail Teknis' : 'Lihat Detail Teknis'}
                </button>
                {this.state.showDetails && (
                  <pre className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-rose-600 overflow-x-auto max-h-36 select-text whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(getInitialRoute)
  const [officeName, setOfficeName] = useState('MSI Cubi Sovereign AI HQ')
  const [isOfficeSetupDone, setIsOfficeSetupDone] = useState(false)
  const [bossConfig, setBossConfig] = useState(DEFAULT_BOSS)
  const [agents, setAgents] = useState(DEFAULT_AGENTS)
  const [selectedAgentId, setSelectedAgentId] = useState('boss')
  const [systemInfo, setSystemInfo] = useState(null)
  const [isBackendConnected, setIsBackendConnected] = useState(false)
  const [leads, setLeads] = useState([])
  const [activities, setActivities] = useState([])
  const [activeLead, setActiveLead] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [pitchResult, setPitchResult] = useState(null)

  // Device Detection & Security Authentication State
  const [deviceProfile, setDeviceProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('aicrew_device_auth')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('aicrew_device_auth')
      return !saved // Jika belum ada profil autentikasi di perangkat ini, buka modal setup di awal
    } catch {
      return true
    }
  })
  const [deviceModalMode, setDeviceModalMode] = useState(() => {
    try {
      const saved = localStorage.getItem('aicrew_device_auth')
      return saved ? 'profile' : 'setup'
    } catch {
      return 'setup'
    }
  })

  // Sinkronkan nama pengguna ke Boss jika sudah ada profil tersimpan
  useEffect(() => {
    if (deviceProfile?.name) {
      setBossConfig((prev) => ({
        ...prev,
        name: deviceProfile.name,
        role: deviceProfile.role || prev.role,
      }))
    }
  }, [deviceProfile])

  const handleSaveDeviceProfile = (newProfile) => {
    localStorage.setItem('aicrew_device_auth', JSON.stringify(newProfile))
    setDeviceProfile(newProfile)
    if (newProfile?.name) {
      setBossConfig((prev) => ({
        ...prev,
        name: newProfile.name,
        role: newProfile.role || prev.role,
      }))
    }
  }

  const handleResetDevice = () => {
    localStorage.removeItem('aicrew_device_auth')
    setDeviceProfile(null)
    setDeviceModalMode('setup')
    setIsDeviceModalOpen(true)
  }

  // 3D Office Camera & POV States
  const [activePOV, setActivePOV] = useState('overview')
  const [transitionTrigger, setTransitionTrigger] = useState(0)
  const [isPure3DMode, setIsPure3DMode] = useState(false)
  const officeControlsRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isPure3DMode) {
        setIsPure3DMode(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPure3DMode])

  const handleChangePOV = (pov, preserveAgentId = null) => {
    setActivePOV(pov)
    setTransitionTrigger(Date.now())
    if (preserveAgentId) {
      setSelectedAgentId(preserveAgentId)
      return
    }
    if (pov === 'boss') setSelectedAgentId('boss')
    else if (pov === 'workstation') {
      setSelectedAgentId((prev) => (prev === 'purple-agent' ? 'purple-agent' : 'blue-agent'))
    }
    else if (pov === 'reception') setSelectedAgentId('green-agent')
    else if (pov === 'vault') setSelectedAgentId('orange-agent')
  }

  const handleSelectAgent = (agentId) => {
    setSelectedAgentId(agentId)
    if (agentId === 'boss') handleChangePOV('boss', 'boss')
    else if (agentId === 'blue-agent') handleChangePOV('workstation', 'blue-agent')
    else if (agentId === 'purple-agent') handleChangePOV('workstation', 'purple-agent')
    else if (agentId === 'green-agent') handleChangePOV('reception', 'green-agent')
    else if (agentId === 'orange-agent') handleChangePOV('vault', 'orange-agent')
  }

  // Eksekutor Perintah Interaktif Terminal Kantor 3D
  const handleExecuteOfficeCommand = (commandStr) => {
    if (!commandStr || !commandStr.trim()) return { success: false, feedback: 'Perintah kosong' }
    const cmd = commandStr.trim().toLowerCase()

    // 1. Perintah Rapat / Meeting / Kumpul / Briefing
    if (
      cmd.includes('rapat') ||
      cmd.includes('meeting') ||
      cmd.includes('kumpul') ||
      cmd.includes('briefing') ||
      cmd.includes('diskusi')
    ) {
      setBossConfig((prev) => ({
        ...prev,
        targetPos: STATIONS.meeting_boss,
        rotationY: Math.PI,
        isWalking: true,
        isTyping: false,
        statusText: 'Memimpin Sesi Rapat Strategis Tim',
      }))

      setAgents((prev) => ({
        ...prev,
        'blue-agent': {
          ...prev['blue-agent'],
          targetPos: STATIONS.meeting_blue,
          rotationY: -Math.PI / 2,
          isWalking: true,
          isTyping: false,
          statusText: 'Diskusi Hardware & Stok di Meja Rapat',
        },
        'purple-agent': {
          ...prev['purple-agent'],
          targetPos: STATIONS.meeting_purple,
          rotationY: Math.PI / 2,
          isWalking: true,
          isTyping: false,
          statusText: 'Review AI Pitch Deck di Meja Rapat',
        },
        'green-agent': {
          ...prev['green-agent'],
          targetPos: STATIONS.meeting_green,
          rotationY: 0,
          isWalking: true,
          isTyping: false,
          statusText: 'Laporan Gateway WhatsApp di Meja Rapat',
        },
        'orange-agent': {
          ...prev['orange-agent'],
          targetPos: STATIONS.meeting_orange,
          rotationY: Math.PI / 4,
          isWalking: true,
          isTyping: false,
          statusText: 'Laporan Sinkronisasi Data di Meja Rapat',
        },
      }))

      handleChangePOV('meeting')

      return {
        success: true,
        feedback: '[RAPAT DIMULAI]: Seluruh tim AI berkumpul di Meja Rapat. Kamera beralih ke Ruang Konferensi.',
      }
    }

    // 2. Perintah Kembali / Kerja / Bubar / Selesai / Stasiun
    if (
      cmd.includes('kembali') ||
      cmd.includes('kerja') ||
      cmd.includes('bubar') ||
      cmd.includes('selesai') ||
      cmd.includes('stasiun') ||
      cmd.includes('meja')
    ) {
      setBossConfig((prev) => ({
        ...prev,
        targetPos: STATIONS.boss_desk,
        rotationY: 0,
        isWalking: true,
        isTyping: false,
        statusText: 'Supervising Office & Deals',
      }))

      setAgents((prev) => ({
        ...prev,
        'blue-agent': {
          ...prev['blue-agent'],
          targetPos: STATIONS.workstation_desk,
          rotationY: 0,
          isWalking: true,
          isTyping: true,
          statusText: 'Monitoring Stock & Catalog',
        },
        'purple-agent': {
          ...prev['purple-agent'],
          targetPos: STATIONS.workstation_desk_02,
          rotationY: Math.PI,
          isWalking: true,
          isTyping: true,
          statusText: 'Sprint Task Ready',
        },
        'green-agent': {
          ...prev['green-agent'],
          targetPos: STATIONS.security_gate,
          rotationY: -Math.PI / 2,
          isWalking: true,
          isTyping: false,
          statusText: 'WhatsApp Gateway Standby',
        },
        'orange-agent': {
          ...prev['orange-agent'],
          targetPos: STATIONS.data_vault,
          rotationY: 0,
          isWalking: true,
          isTyping: false,
          statusText: 'Database & Inventory Synced',
        },
      }))

      handleChangePOV('overview')

      return {
        success: true,
        feedback: '[SELESAI]: Rapat berakhir. Seluruh agen AI kembali ke stasiun kerja masing-masing.',
      }
    }

    // 3. Perintah Cek Server / Vault / Database
    if (
      cmd.includes('server') ||
      cmd.includes('vault') ||
      cmd.includes('database') ||
      cmd.includes('db') ||
      cmd.includes('cluster')
    ) {
      setAgents((prev) => ({
        ...prev,
        'orange-agent': {
          ...prev['orange-agent'],
          targetPos: [-4.6, 0.33, 1.15],
          rotationY: Math.PI / 2,
          isWalking: true,
          statusText: 'Menginspeksi Kluster Server NUC & Data Vault',
        },
      }))

      handleChangePOV('vault', 'orange-agent')

      return {
        success: true,
        feedback: '[SERVER CHECK]: Cubi Vault menginspeksi kluster Server NUC.',
      }
    }

    // 4. Perintah Resepsionis / Tamu / Gateway WhatsApp
    if (
      cmd.includes('resepsionis') ||
      cmd.includes('reception') ||
      cmd.includes('tamu') ||
      cmd.includes('pintu') ||
      cmd.includes('gate') ||
      cmd.includes('whatsapp')
    ) {
      setAgents((prev) => ({
        ...prev,
        'green-agent': {
          ...prev['green-agent'],
          targetPos: STATIONS.security_gate,
          rotationY: -Math.PI / 2,
          isWalking: true,
          statusText: 'Siaga Tamu & WhatsApp Dispatch',
        },
      }))

      handleChangePOV('reception', 'green-agent')

      return {
        success: true,
        feedback: '[GATEWAY]: Cubi Gatekeeper siaga di Meja Resepsionis & Pintu Depan.',
      }
    }

    // 5. Perintah Workstation / Analisis Hardware / Drafting Pitch
    if (
      cmd.includes('workstation') ||
      cmd.includes('analisis') ||
      cmd.includes('hardware') ||
      cmd.includes('draft') ||
      cmd.includes('koding')
    ) {
      setAgents((prev) => ({
        ...prev,
        'blue-agent': {
          ...prev['blue-agent'],
          targetPos: STATIONS.workstation_desk,
          rotationY: 0,
          isWalking: true,
          isTyping: true,
          statusText: 'Komputasi & Analisis Spek Hardware',
        },
        'purple-agent': {
          ...prev['purple-agent'],
          targetPos: STATIONS.workstation_desk_02,
          rotationY: Math.PI,
          isWalking: true,
          isTyping: true,
          statusText: 'Menyusun Penawaran Otomatis (Qwen 2.5)',
        },
      }))

      handleChangePOV('workstation', selectedAgentId === 'purple-agent' ? 'purple-agent' : 'blue-agent')

      return {
        success: true,
        feedback: '[WORKSTATION]: Tim Workstation aktif memproses komputasi & draft pitch.',
      }
    }

    // 6. Perintah Auto Pipeline / Proses Prospek
    if (
      cmd.includes('auto') ||
      cmd.includes('pipeline') ||
      cmd.includes('proses') ||
      cmd.includes('sprint')
    ) {
      handleRunAutoPipeline?.()
      return {
        success: true,
        feedback: '[AUTO PIPELINE]: Menjalankan proses pipeline prospek otomatis...',
      }
    }

    // 7. Perintah Sinkronisasi Data / Refresh
    if (
      cmd.includes('sync') ||
      cmd.includes('sinkron') ||
      cmd.includes('refresh')
    ) {
      fetchData?.()
      return {
        success: true,
        feedback: '[SYNC]: Sinkronisasi data sistem dan status real-time berhasil.',
      }
    }

    return {
      success: true,
      feedback: `[PERINTAH DITERIMA]: "${commandStr}" -> Dikoordinasikan ke ${bossConfig?.name || 'Direktur'} & Tim AI.`,
    }
  }

  const handleManualZoom = (delta) => {
    if (officeControlsRef.current?.object) {
      const cam = officeControlsRef.current.object
      const nextZoom = Math.min(120, Math.max(10, cam.zoom + delta))
      cam.zoom = nextZoom
      cam.updateProjectionMatrix()
    }
  }

  const handleResetPOV = () => {
    setActivePOV('overview')
    setTransitionTrigger(Date.now())
  }

  const handleTogglePure3D = () => {
    setIsPure3DMode((prev) => !prev)
  }

  const handleExitPure3D = () => {
    setIsPure3DMode(false)
  }

  // Modals state: Office setup dibuka sesuai kebutuhan, tidak memaksa loading ulang saat rute pertama
  const [isEntranceOpen, setIsEntranceOpen] = useState(false)
  const [isTeamSetupOpen, setIsTeamSetupOpen] = useState(false)
  const [isCreateLeadOpen, setIsCreateLeadOpen] = useState(false)

  // Router Navigator: Mengarahkan rute secara instan tanpa loading berulang
  const navigate = (route, params = {}) => {
    if (params?.agentId) {
      setSelectedAgentId(params.agentId)
    }
    if (route !== 'office') {
      setIsEntranceOpen(false)
    }
    setCurrentRoute(route)
    const path = route === 'landing' ? '/' : `/${route}`
    window.history.pushState({}, '', path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase()
      if (path === '/office' || path === '/kantor') {
        setCurrentRoute('office')
      } else if (path === '/dashboard') {
        setCurrentRoute('dashboard')
      } else {
        setCurrentRoute('landing')
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Atur overflow body: scrollable untuk Landing Page & Dashboard, locked untuk 3D Office
  useEffect(() => {
    if (currentRoute === 'office') {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [currentRoute])

  // Patroli Otonom Agen (Simulasi Kehidupan Kantor 3D yang Dinamis & Alami)
  useEffect(() => {
    if (currentRoute !== 'office' || isEntranceOpen || isGenerating || pitchResult) return

    const PATROL_ACTIONS = [
      {
        agentId: 'purple-agent',
        // Melangkah ke koridor terbuka samping workstation tanpa menembus sekat
        destination: [[-4.09, 0.33, 4.3]],
        rotationY: Math.PI,
        status: 'Koordinasi materi presentasi di Ruang Rapat 📊',
        stayMs: 6000,
        homePos: [STATIONS.workstation_desk_02],
        finalHomePos: STATIONS.workstation_desk_02,
        homeRot: Math.PI,
        homeStatus: 'Sprint Task Ready',
        resumeTyping: true,
      },
      {
        agentId: 'green-agent',
        // Melangkah ke area terbuka lobby resepsionis tanpa menembus meja
        destination: [[-1.25, 0.33, 4.1]],
        rotationY: 0,
        status: 'Memantau tamu masuk di lobby resepsionis 🌐',
        stayMs: 6500,
        homePos: [STATIONS.security_gate],
        finalHomePos: STATIONS.security_gate,
        homeRot: -Math.PI / 2,
        homeStatus: 'WhatsApp Gateway Standby',
      },
      {
        agentId: 'orange-agent',
        // Melangkah di koridor depan rak arsip & server vault
        destination: [[-4.5, 0.33, 1.2]],
        rotationY: Math.PI / 2,
        status: 'Sinkronisasi database arsip di Server Vault 💾',
        stayMs: 6000,
        homePos: [STATIONS.data_vault],
        finalHomePos: STATIONS.data_vault,
        homeRot: 0,
        homeStatus: 'Database & Inventory Synced',
      },
      {
        agentId: 'blue-agent',
        // Melangkah ke lorong tengah terbuka stasiun kerja
        destination: [[-5.32, 0.33, 2.5]],
        rotationY: 0,
        status: 'Inspeksi performa NPU & kluster komputasi 💻',
        stayMs: 5500,
        homePos: [STATIONS.workstation_desk],
        finalHomePos: STATIONS.workstation_desk,
        homeRot: 0,
        homeStatus: 'Monitoring Stock & Catalog',
        resumeTyping: true,
      },
    ]

    const interval = setInterval(() => {
      setAgents((currentAgents) => {
        // Pilih agen yang sedang standby di stasiunnya dan tidak sedang dipilih user
        const eligible = PATROL_ACTIONS.filter(
          (act) => act.agentId !== selectedAgentId && !currentAgents[act.agentId]?.isWalking
        )
        if (eligible.length === 0) return currentAgents

        const chosen = eligible[Math.floor(Math.random() * eligible.length)]

        // Mulai berjalan ke titik tujuan
        setTimeout(() => {
          setAgents((prev) => ({
            ...prev,
            [chosen.agentId]: {
              ...prev[chosen.agentId],
              isWalking: true,
              isTyping: false,
              targetPos: chosen.destination,
              rotationY: chosen.rotationY,
              statusText: chosen.status,
            },
          }))

          // Tiba di tujuan: berhenti berjalan dan mengamati/bekerja
          setTimeout(() => {
            setAgents((prev) => ({
              ...prev,
              [chosen.agentId]: {
                ...prev[chosen.agentId],
                isWalking: false,
              },
            }))

            // Selesai di tujuan: kembali ke stasiun kerja
            setTimeout(() => {
              setAgents((prev) => ({
                ...prev,
                [chosen.agentId]: {
                  ...prev[chosen.agentId],
                  isWalking: true,
                  targetPos: chosen.homePos,
                  rotationY: chosen.homeRot,
                  statusText: 'Kembali ke stasiun kerja...',
                },
              }))

              // Tiba kembali di stasiun kerja
              setTimeout(() => {
                setAgents((prev) => ({
                  ...prev,
                  [chosen.agentId]: {
                    ...prev[chosen.agentId],
                    isWalking: false,
                    isTyping: !!chosen.resumeTyping,
                    targetPos: chosen.finalHomePos || chosen.homePos,
                    rotationY: chosen.homeRot,
                    statusText: chosen.homeStatus,
                  },
                }))
              }, 3800)
            }, chosen.stayMs)
          }, 3800)
        }, 0)

        return currentAgents
      })
    }, 13000)

    return () => clearInterval(interval)
  }, [currentRoute, isEntranceOpen, isGenerating, pitchResult, selectedAgentId])

  // Fetch data dari FastAPI Backend secara Riil
  const fetchData = async () => {
    try {
      // 1. Health Check Riil
      const healthRes = await fetch(`${API_BASE}/api/v1/system/health`)
      if (healthRes.ok) {
        const data = await healthRes.json()
        setSystemInfo(data)
        setIsBackendConnected(true)
      } else {
        setIsBackendConnected(false)
        setSystemInfo(null)
      }

      // 2. Team Config Riil
      const teamRes = await fetch(`${API_BASE}/api/v1/team/config`)
      if (teamRes.ok) {
        const teamData = await teamRes.json()
        if (teamData.boss) {
          setBossConfig((prev) => ({ ...prev, ...teamData.boss }))
        }
        if (teamData.agents) {
          setAgents((prev) => {
            const next = { ...prev }
            for (const [k, v] of Object.entries(teamData.agents)) {
              if (next[k]) {
                next[k] = { ...next[k], ...v }
              }
            }
            return next
          })
        }
      }

      // 3. Leads Riil dari workspace/leads_mentah.csv
      const leadsRes = await fetch(`${API_BASE}/api/v1/leads/queue`)
      if (leadsRes.ok) {
        const leadsData = await leadsRes.json()
        setLeads(leadsData.leads || [])
      }

      // 4. Activities Riil
      const actRes = await fetch(`${API_BASE}/api/v1/system/activities`)
      if (actRes.ok) {
        const actData = await actRes.json()
        setActivities(actData.activities || [])
      }
    } catch {
      // Backend sedang Offline (Status Riil Disconnected)
      setIsBackendConnected(false)
      setSystemInfo(null)

      // Hanya isi sampel awal jika daftar prospek masih kosong agar 3D scene tetap tampil
      setLeads((prev) => {
        if (prev.length > 0) return prev
        return [
          {
            id_lead: 'LD-001',
            nama: 'Budi Santoso',
            nomor_wa: '6281234567801',
            minat: 'harian lincah hemat irit komuter',
            budget_dp: '2500000',
            domisili: 'Purwokerto Timur',
            status_kontak: 'pending',
            score_priority: 'Warm',
          },
          {
            id_lead: 'LD-002',
            nama: 'Hendra Pratama',
            nomor_wa: '6281234567802',
            minat: 'touring jarak jauh nyaman',
            budget_dp: '5000000',
            domisili: 'Purwokerto Timur',
            status_kontak: 'pending',
            score_priority: 'Hot',
          },
          {
            id_lead: 'LD-003',
            nama: 'Siti Aminah',
            nomor_wa: '6281234567803',
            minat: 'sporty komuter kencang',
            budget_dp: '3500000',
            domisili: 'Banyumas Kota',
            status_kontak: 'pending',
            score_priority: 'Hot',
          },
        ]
      })
    }
  }

  useEffect(() => {
    fetchData()
    // Polling berkala setiap 3.5 detik untuk sinkronisasi realtime
    const interval = setInterval(() => {
      fetchData()
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  // Simpan Konfigurasi Tim ke Backend & LocalStorage
  const handleSaveTeamConfig = async (newConfig) => {
    localStorage.setItem('cubi_team_setup_done', 'true')
    setBossConfig((prev) => ({ ...prev, ...newConfig.boss }))
    setAgents((prev) => {
      const next = { ...prev }
      for (const [k, v] of Object.entries(newConfig.agents || {})) {
        if (next[k]) {
          next[k] = { ...next[k], ...v }
        }
      }
      return next
    })

    try {
      await fetch(`${API_BASE}/api/v1/team/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      })
      fetchData()
    } catch {
      // offline mode
    }
  }

  // Tambah Lead Baru ke Backend
  const handleCreateLead = async (leadData) => {
    try {
      await fetch(`${API_BASE}/api/v1/leads/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      })
      fetchData()
    } catch {
      // Offline fallback
      setLeads((prev) => [
        ...prev,
        {
          id_lead: `LD-${String(prev.length + 1).padStart(3, '0')}`,
          ...leadData,
          status_kontak: 'pending',
          score_priority: leadData.budget_dp >= 3500000 ? 'Hot' : 'Warm',
        },
      ])
    }
  }

  // Koreografi Eksekusi & Gerakan Berjalan Robot Sesuai Logika BE
  const handleSelectLead = async (lead) => {
    setActiveLead(lead)
    setIsGenerating(true)
    setPitchResult(null)

    const bossName = bossConfig.name || 'Pak Alfa'
    const scoutName = agents['blue-agent']?.name || 'Cubi Scout'
    const scribeName = agents['purple-agent']?.name || 'Cubi Scribe'
    const gateName = agents['green-agent']?.name || 'Cubi Gate'
    const vaultName = agents['orange-agent']?.name || 'Cubi Vault'

    // LANGKAH 1: Bos menugaskan tim dari meja eksekutif
    setSelectedAgentId('boss')
    setBossConfig((prev) => ({
      ...prev,
      statusText: `Menugaskan prospek ${lead.nama} ke tim AICREW`,
    }))

    // LANGKAH 2: Cubi Scout (Sales Engineer) memproses komputasi spesifikasi & stok dari Meja Kerja 01
    setTimeout(() => {
      setSelectedAgentId('blue-agent')
      setAgents((prev) => ({
        ...prev,
        'blue-agent': {
          ...prev['blue-agent'],
          isTyping: true,
          isScanning: true,
          statusText: `Menganalisis stok cabang & unit rekomendasi untuk ${lead.nama}...`,
        },
      }))
    }, 800)

    // LANGKAH 3: Cubi Vault memvalidasi histori prospek & aturan bundling di Server Vault
    setTimeout(() => {
      setSelectedAgentId('orange-agent')
      setAgents((prev) => ({
        ...prev,
        'orange-agent': {
          ...prev['orange-agent'],
          isScanning: true,
          statusText: `Memvalidasi database & aturan bundling untuk ${lead.minat}...`,
        },
      }))
    }, 2200)

    // LANGKAH 4: Cubi Scribe (AI Drafter) menyusun draf penawaran via Qwen 2.5 di Kanban Wall
    setTimeout(async () => {
      setSelectedAgentId('purple-agent')
      setAgents((prev) => ({
        ...prev,
        'purple-agent': {
          ...prev['purple-agent'],
          isTyping: true,
          statusText: `Menyusun draf WhatsApp personal via model Qwen 2.5...`,
        },
        'blue-agent': {
          ...prev['blue-agent'],
          isScanning: false,
          isTyping: true,
          statusText: `Analisis spesifikasi & stok selesai. Unit siap!`,
        },
        'orange-agent': {
          ...prev['orange-agent'],
          isScanning: false,
          statusText: `Histori & bundling siap dipakai.`,
        },
      }))

      // Panggil API Backend Generate Pitch
      try {
        const res = await fetch(`${API_BASE}/api/v1/leads/generate-pitch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_lead: lead.id_lead,
            nama: lead.nama,
            minat: lead.minat,
            domisili: lead.domisili,
            persona_id: agents['purple-agent']?.personaId || 'sales-outbound-strategist',
            persona_name: agents['purple-agent']?.name || 'Outbound Strategist',
            persona_vibe: agents['purple-agent']?.vibe || '',
          }),
        })

        let data
        if (res.ok) {
          data = await res.json()
        } else {
          throw new Error('API Generate Failed')
        }

        setPitchResult(data)
        setIsGenerating(false)
        setSelectedAgentId('green-agent')

        // LANGKAH 5: Cubi Gate siap di gerbang turnstile menunggu persetujuan Direktur
        setAgents((prev) => ({
          ...prev,
          'purple-agent': {
            ...prev['purple-agent'],
            isTyping: false,
            statusText: `Draf pitch selesai disusun untuk ${lead.nama}`,
          },
          'green-agent': {
            ...prev['green-agent'],
            isScanning: true,
            statusText: `Draf siap! Menunggu otorisasi Direktur untuk WhatsApp Dispatch`,
          },
        }))
        fetchData()
      } catch {
        // Fallback cerdas saat backend offline
        const fallbackData = {
          id_lead: lead.id_lead,
          unit_rekomendasi: 'Beat Street CBS',
          bundling_promo: 'Helm Retro Astra & Voucher Gratis Servis 1 Tahun',
          stok_info: `Ready di Cabang ${lead.domisili}`,
          draft_pitch: `Halo Kak ${lead.nama}, salam hangat dari Astra Motor! Kami perhatikan Kakak sedang mencari kendaraan untuk ${lead.minat}. Unit Beat Street CBS sedang ready di cabang ${lead.domisili} lengkap dengan promo bundling Helm Retro & Gratis Servis 1 Tahun serta diskon DP spesial. Apakah berkenan kami kirimkan rincian simulasi angsurannya?`,
          approval_required: true,
        }
        setPitchResult(fallbackData)
        setIsGenerating(false)
        setSelectedAgentId('green-agent')

        setAgents((prev) => ({
          ...prev,
          'purple-agent': {
            ...prev['purple-agent'],
            isTyping: false,
            statusText: `Draf pitch siap (Simulated)`,
          },
          'green-agent': {
            ...prev['green-agent'],
            isScanning: true,
            statusText: `Draf siap! Menunggu otorisasi Direktur untuk WhatsApp Dispatch`,
          },
        }))
      }
    }, 3800)
  }

  // Aksi: Setujui & Dispatch WhatsApp ke Calon Konsumen
  const handleApprovePitch = async (payload) => {
    if (!payload) {
      setPitchResult(null)
      setAgents((prev) => ({
        ...prev,
        'green-agent': {
          ...prev['green-agent'],
          statusText: 'WhatsApp Gateway Standby',
          targetPos: STATIONS.security_gate,
        },
      }))
      return
    }

    // Cubi Gate mengaktifkan transmisi pengiriman WhatsApp
    setSelectedAgentId('green-agent')
    setAgents((prev) => ({
      ...prev,
      'green-agent': {
        ...prev['green-agent'],
        isScanning: true,
        statusText: `Mengirim pesan via WhatsApp Gateway ke ${payload.nomor_wa}...`,
      },
      'orange-agent': {
        ...prev['orange-agent'],
        isScanning: true,
        statusText: `Mengarsipkan data deal prospek ${payload.id_lead} ke CSV Data Vault...`,
      },
    }))

    try {
      await fetch(`${API_BASE}/api/v1/leads/approve-and-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch {
      // offline
    }

    setPitchResult(null)
    setActiveLead(null)

    // Kembalikan semua agen ke stasiun semula dengan status sukses
    setTimeout(() => {
      fetchData()
      setBossConfig((prev) => ({
        ...prev,
        statusText: `Deal prospek ${payload.id_lead} berhasil didispatch!`,
      }))
      setAgents((prev) => ({
        ...prev,
        'green-agent': {
          ...prev['green-agent'],
          isWalking: false,
          isScanning: false,
          targetPos: STATIONS.security_gate,
          rotationY: Math.PI * 0.8,
          statusText: 'Pesan terkirim ke WhatsApp Gateway!',
        },
        'orange-agent': {
          ...prev['orange-agent'],
          isWalking: false,
          isScanning: false,
          targetPos: STATIONS.data_vault,
          rotationY: 0,
          statusText: 'Data prospek berhasil diperbarui di database.',
        },
        'purple-agent': {
          ...prev['purple-agent'],
          isWalking: false,
          isTyping: true,
          targetPos: STATIONS.workstation_desk_02,
          rotationY: -Math.PI / 2,
          statusText: 'Siap untuk prospek berikutnya',
        },
        'blue-agent': {
          ...prev['blue-agent'],
          isWalking: false,
          isTyping: true,
          targetPos: STATIONS.workstation_desk,
          rotationY: Math.PI / 2,
          statusText: 'Monitoring Stock & Catalog',
        },
      }))
    }, 2000)
  }

  // Otomatisasi Pipeline untuk Memproses Semua Antrean Leads yang Belum Dispatched
  const handleRunAutoPipeline = async () => {
    const pendingLeads = leads.filter(
      (l) => l.status_kontak !== 'dispatched' && l.status_kontak !== 'approved'
    )
    if (pendingLeads.length === 0) {
      alert('Semua prospek dalam antrean sudah selesai diproses!')
      return
    }
    // Proses lead pertama yang pending
    handleSelectLead(pendingLeads[0])
  }

  const handleEnterOffice = (setupData) => {
    if (setupData) {
      if (setupData.officeName) setOfficeName(setupData.officeName)
      if (setupData.bossName) {
        setBossConfig((prev) => ({
          ...prev,
          name: setupData.bossName,
          role: setupData.bossRole || prev.role,
        }))
      }
    }
    setIsOfficeSetupDone(true)
    setIsEntranceOpen(false)
  }

  return (
    <>
      <RouteErrorBoundary currentRoute={currentRoute} onNavigate={navigate}>
        <Suspense fallback={<RouteLoadingFallback />}>
          {/* 1. RUTE: LANDING PAGE (SAMS-Style Showcase) */}
          {currentRoute === 'landing' && (
            <LandingPage
              onNavigate={navigate}
              isBackendConnected={isBackendConnected}
              systemInfo={systemInfo}
              bossConfig={bossConfig}
              agents={agents}
              leads={leads}
            />
          )}

          {/* 2. RUTE: DASHBOARD SAAS (Full Analytics & Leads Management) */}
          {currentRoute === 'dashboard' && (
            <DashboardView
              onNavigate={navigate}
              isBackendConnected={isBackendConnected}
              systemInfo={systemInfo}
              bossConfig={bossConfig}
              agents={agents}
              leads={leads}
              activities={activities}
              onSelectLead={handleSelectLead}
              onApprovePitch={handleApprovePitch}
              onRefresh={fetchData}
              onOpenTeamSetup={() => setIsTeamSetupOpen(true)}
              onOpenCreateLead={() => setIsCreateLeadOpen(true)}
              onRunAutoPipeline={handleRunAutoPipeline}
              isGenerating={isGenerating}
              pitchResult={pitchResult}
            />
          )}

          {/* 3. RUTE: VIRTUAL OFFICE 3D (Architectural Blueprint Canvas & Clean Studio Aesthetic) */}
          {currentRoute === 'office' && (
            <main className="w-screen h-screen relative bg-[#f8fafc] overflow-hidden select-none">
              {/* Studio Canvas Subtle Ambient Gradient */}
              <div className={`fixed inset-0 pointer-events-none z-0 bg-light-office-bg ${isPure3DMode ? "opacity-0" : "opacity-80"}`} aria-hidden="true" />
              {/* 3D Diorama Kantor Virtual Sesuai Referensi (ai/ref kantor.png) */}
              <OfficeScene
                agents={agents}
                bossConfig={bossConfig}
                selectedAgentId={selectedAgentId}
                onSelectAgent={handleSelectAgent}
                leads={leads}
                activeLead={activeLead}
                pitchResult={pitchResult}
                isEntranceOpen={isEntranceOpen}
                activePOV={activePOV}
                transitionTrigger={transitionTrigger}
                controlsRef={officeControlsRef}
                isPure3DMode={isPure3DMode}
              />

              {/* Mode Fullscreen 3D Immersive: Bersih, Minimalis & Bebas Elemen / Icon Default AI */}
              {isPure3DMode && (
                <div className="absolute top-4 right-4 z-50 pointer-events-auto">
                  <button
                    type="button"
                    onClick={handleExitPure3D}
                    style={{ backgroundColor: '#192A56', color: '#FFFFFF' }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#192A56] hover:bg-[#0E1A38] text-white text-xs font-semibold shadow-md flex items-center gap-2 cursor-pointer transition active:scale-95 border border-white/10"
                    title="Keluar dari Fullscreen (ESC)"
                  >
                    <Minimize2 className="w-3.5 h-3.5 text-white" />
                    <span>Keluar (ESC)</span>
                  </button>
                </div>
              )}

              {/* Glassmorphism Dashboard SaaS HUD (Disembunyikan Saat Mode Fullscreen Murni) */}
              {!isPure3DMode && (
                <DashboardOverlay
                  agents={agents}
                  bossConfig={bossConfig}
                  officeName={officeName}
                  selectedAgentId={selectedAgentId}
                  onSelectAgent={handleSelectAgent}
                  leads={leads}
                  activities={activities}
                  systemInfo={systemInfo}
                  isBackendConnected={isBackendConnected}
                  activeLead={activeLead}
                  isGenerating={isGenerating}
                  pitchResult={pitchResult}
                  onSelectLead={handleSelectLead}
                  onApprovePitch={handleApprovePitch}
                  onRefresh={fetchData}
                  onOpenTeamSetup={() => setIsTeamSetupOpen(true)}
                  onOpenOfficeSetup={() => setIsEntranceOpen(true)}
                  onOpenCreateLead={() => setIsCreateLeadOpen(true)}
                  onRunAutoPipeline={handleRunAutoPipeline}
                  onOpenEntrance={() => setIsEntranceOpen(true)}
                  onNavigate={navigate}
                  activePOV={activePOV}
                  onChangePOV={handleChangePOV}
                  onExecuteCommand={handleExecuteOfficeCommand}
                  onZoom={handleManualZoom}
                  onResetPOV={handleResetPOV}
                  onTogglePure3D={handleTogglePure3D}
                  userProfile={deviceProfile}
                  onOpenProfileSettings={() => {
                    setDeviceModalMode('profile')
                    setIsDeviceModalOpen(true)
                  }}
                />
              )}

              {/* Setup Kantor Otonom AI & Sambutan Gerbang (Office Setup Wizard) */}
              {isEntranceOpen && (
                <OfficeEntranceModal
                  isOpen={isEntranceOpen}
                  onEnterOffice={handleEnterOffice}
                  isBackendConnected={isBackendConnected}
                  systemInfo={systemInfo}
                  bossConfig={bossConfig}
                  currentOfficeName={officeName}
                  agents={agents}
                />
              )}
            </main>
          )}
        </Suspense>
      </RouteErrorBoundary>

      <Suspense fallback={null}>
        {/* Modal Personalisasi Nama Bos & Tim Cubi */}
        {isTeamSetupOpen && (
          <TeamSetupModal
            isOpen={isTeamSetupOpen}
            onClose={() => setIsTeamSetupOpen(false)}
            teamConfig={{ boss: bossConfig, agents }}
            onSave={handleSaveTeamConfig}
          />
        )}

        {/* Modal Tambah Lead Baru */}
        {isCreateLeadOpen && (
          <CreateLeadModal
            isOpen={isCreateLeadOpen}
            onClose={() => setIsCreateLeadOpen(false)}
            onCreateLead={handleCreateLead}
          />
        )}

        {/* Modal Autentikasi Keamanan & Profil Perangkat Workstation */}
        <DeviceSecurityModal
          isOpen={isDeviceModalOpen}
          mode={deviceModalMode}
          currentProfile={deviceProfile}
          onSaveProfile={handleSaveDeviceProfile}
          onResetDevice={handleResetDevice}
          onClose={() => setIsDeviceModalOpen(false)}
        />
      </Suspense>
    </>
  )
}
