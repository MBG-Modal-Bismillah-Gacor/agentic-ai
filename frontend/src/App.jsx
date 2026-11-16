import React, { useState, useEffect, useRef, Suspense, lazy } from 'react'
import * as THREE from 'three'
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

export const getApiBase = () => {
  if (typeof window === 'undefined') return 'http://127.0.0.1:8000'
  // Jika dibuka via HTTPS (SSL Secure Context PWA), gunakan relative path proxy ('')
  // untuk mencegah browser memblokir request karena Mixed Content (HTTPS -> HTTP:8000).
  if (window.location.protocol === 'https:') {
    return ''
  }
  const hostname = window.location.hostname
  if (hostname) {
    return `http://${hostname}:8000`
  }
  return 'http://127.0.0.1:8000'
}

export const API_BASE = getApiBase()
let currentApiBase = API_BASE

/**
 * Resilient API fetch: mencoba direct API_BASE (port 8000) terlebih dahulu.
 * Jika diblokir oleh firewall LAN/CORS, otomatis fallback ke reverse proxy Vite (port 3000).
 */
export async function safeApiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${currentApiBase}${endpoint}`, options)
    return res
  } catch (err) {
    if (currentApiBase !== '') {
      try {
        const fallbackRes = await fetch(endpoint, options)
        if (fallbackRes && (fallbackRes.ok || fallbackRes.status < 500)) {
          currentApiBase = '' // Kunci ke relative proxy untuk stabilitas LAN
          return fallbackRes
        }
      } catch {
        // Abaikan dan lempar error asli
      }
    }
    throw err
  }
}

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

// Rute Jalur Waypoint Koridor & Pintu (Mencegah Menembus Sekat, Meja & Tembok)
const OFFICE_PATHS = {
  boss_to_meeting: [
    [-7.2, 0.33, 0.36],
    [-5.6, 0.33, 2.0],
    [-4.8, 0.33, 4.5],
    [-6.2, 0.33, 6.8],
    STATIONS.meeting_boss,
  ],
  boss_to_desk: [
    [-6.2, 0.33, 6.8],
    [-4.8, 0.33, 4.5],
    [-5.6, 0.33, 2.0],
    [-7.2, 0.33, 0.36],
    STATIONS.boss_desk,
  ],
  blue_to_meeting: [
    [-4.8, 0.33, 3.8],
    [-4.8, 0.33, 5.5],
    [-6.2, 0.33, 6.8],
    STATIONS.meeting_blue,
  ],
  blue_to_desk: [
    [-6.2, 0.33, 6.8],
    [-4.8, 0.33, 5.5],
    [-4.8, 0.33, 3.8],
    STATIONS.workstation_desk,
  ],
  purple_to_meeting: [
    [-4.8, 0.33, 5.5],
    [-6.2, 0.33, 6.8],
    STATIONS.meeting_purple,
  ],
  purple_to_desk: [
    [-6.2, 0.33, 6.8],
    [-4.8, 0.33, 5.5],
    STATIONS.workstation_desk_02,
  ],
  green_to_meeting: [
    [-2.2, 0.33, 4.87],
    [-4.6, 0.33, 5.2],
    [-6.2, 0.33, 6.8],
    STATIONS.meeting_green,
  ],
  green_to_desk: [
    [-6.2, 0.33, 6.8],
    [-4.6, 0.33, 5.2],
    [-2.2, 0.33, 4.87],
    STATIONS.security_gate,
  ],
  orange_to_meeting: [
    [-5.06, 0.33, 2.0],
    [-4.8, 0.33, 5.0],
    [-6.2, 0.33, 6.8],
    STATIONS.meeting_orange,
  ],
  orange_to_desk: [
    [-6.2, 0.33, 6.8],
    [-4.8, 0.33, 5.0],
    [-5.06, 0.33, 2.0],
    STATIONS.data_vault,
  ],
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
    statusText: 'Telegram Gateway Standby',
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
  const [bossConfig, setBossConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('cubi_team_config')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.boss) return { ...DEFAULT_BOSS, ...parsed.boss }
      }
    } catch {}
    return DEFAULT_BOSS
  })
  const [agents, setAgents] = useState(() => {
    try {
      const saved = localStorage.getItem('cubi_team_config')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.agents) {
          const merged = { ...DEFAULT_AGENTS }
          for (const [k, v] of Object.entries(parsed.agents)) {
            if (merged[k]) merged[k] = { ...merged[k], ...v }
          }
          return merged
        }
      }
    } catch {}
    return DEFAULT_AGENTS
  })
  const [selectedAgentId, setSelectedAgentId] = useState('boss')
  const [systemInfo, setSystemInfo] = useState(null)
  const [isBackendConnected, setIsBackendConnected] = useState(false)
  const [leads, setLeads] = useState([])
  const [activities, setActivities] = useState([])
  const [deliberations, setDeliberations] = useState([])
  const [spkModalData, setSpkModalData] = useState(null)
  const [activeLead, setActiveLead] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [pitchResult, setPitchResult] = useState(null)
  const consecutiveFailuresRef = useRef(0)

  // Device Detection & Security Authentication State
  const [deviceProfile, setDeviceProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('stelagent_device_auth')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('stelagent_device_auth')
      return !saved // Jika belum ada profil autentikasi di perangkat ini, buka modal setup di awal
    } catch {
      return true
    }
  })
  const [deviceModalMode, setDeviceModalMode] = useState(() => {
    try {
      const saved = localStorage.getItem('stelagent_device_auth')
      return saved ? 'profile' : 'setup'
    } catch {
      return 'setup'
    }
  })

  // PWA Install state & trigger
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null)
  const [isPwaInstalled, setIsPwaInstalled] = useState(false)

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsPwaInstalled(true)
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  const handleInstallPwa = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt()
      const { outcome } = await deferredInstallPrompt.userChoice
      if (outcome === 'accepted') {
        setIsPwaInstalled(true)
      }
      setDeferredInstallPrompt(null)
    } else {
      alert('Petunjuk Instalasi StelAgent PWA di Laptop:\n\n1. Di bilah alamat URL browser (Google Chrome atau Microsoft Edge), klik ikon "Instal Aplikasi" (ikon komputer dengan panah ke bawah di sebelah kanan kolom URL).\n2. Atau klik menu titik tiga (⋮) di kanan atas browser -> pilih "Aplikasi" / "Apps" -> klik "Instal StelAgent".\n3. Klik tombol "Instal". StelAgent akan langsung terbuka dalam jendela mandiri tanpa tab browser dan shortcut ikon robot biru akan otomatis ditambahkan ke Desktop & Taskbar!')
    }
  }

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
    localStorage.setItem('stelagent_device_auth', JSON.stringify(newProfile))
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
    localStorage.removeItem('stelagent_device_auth')
    setDeviceProfile(null)
    setDeviceModalMode('setup')
    setIsDeviceModalOpen(true)
  }

  // 3D Office Camera & POV States
  const [activePOV, setActivePOV] = useState('overview')
  const [transitionTrigger, setTransitionTrigger] = useState(0)
  const [isPure3DMode, setIsPure3DMode] = useState(false)
  const [isCctvAutoScanning, setIsCctvAutoScanning] = useState(false)
  const officeControlsRef = useRef(null)

  const handleRotateCctv = (delta) => {
    if (!officeControlsRef.current) return
    const controls = officeControlsRef.current
    const offset = new THREE.Vector3().subVectors(controls.object.position, controls.target)
    const spherical = new THREE.Spherical().setFromVector3(offset)
    spherical.theta += delta
    offset.setFromSpherical(spherical)
    controls.object.position.copy(controls.target).add(offset)
    controls.update()
  }

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
    if (!pov.startsWith('cctv_')) {
      setIsCctvAutoScanning(false)
    }
    if (preserveAgentId) {
      setSelectedAgentId(preserveAgentId)
      return
    }
    if (pov === 'boss' || pov === 'cctv_boss') setSelectedAgentId('boss')
    else if (pov === 'workstation' || pov === 'cctv_workstation') {
      setSelectedAgentId((prev) => (prev === 'purple-agent' ? 'purple-agent' : 'blue-agent'))
    }
    else if (pov === 'reception' || pov === 'cctv_reception') setSelectedAgentId('green-agent')
    else if (pov === 'vault' || pov === 'cctv_vault') setSelectedAgentId('orange-agent')
  }

  const handleSelectAgent = (agentId) => {
    setSelectedAgentId(agentId)
    if (agentId === 'boss') handleChangePOV('boss', 'boss')
    else if (agentId === 'blue-agent') handleChangePOV('workstation', 'blue-agent')
    else if (agentId === 'purple-agent') handleChangePOV('workstation', 'purple-agent')
    else if (agentId === 'green-agent') handleChangePOV('reception', 'green-agent')
    else if (agentId === 'orange-agent') handleChangePOV('vault', 'orange-agent')
    else if (agentId === 'all') handleChangePOV('overview')
  }

  // Eksekutor Perintah Interaktif Terminal Kantor 3D
  const handleExecuteOfficeCommand = (commandStr) => {
    if (!commandStr || !commandStr.trim()) return { success: false, feedback: 'Perintah kosong' }
    const cmd = commandStr.trim().toLowerCase()

    // Cek apakah perintah ditujukan untuk seluruh tim atau agen spesifik yang sedang dipilih
    const isGlobal =
      !selectedAgentId ||
      selectedAgentId === 'boss' ||
      selectedAgentId === 'all' ||
      cmd.includes('semua') ||
      cmd.includes('tim') ||
      cmd.includes('all') ||
      cmd.includes('armada') ||
      cmd.includes('balik semua') ||
      cmd.includes('kembali semua') ||
      cmd.includes('bubar')

    // Deteksi apakah perintah adalah kembali/selesai/bubar (prioritas tinggi di atas rapat agar 'selesai rapat' tidak memicu rapat baru)
    const isReturnCmd =
      cmd.includes('selesai') ||
      cmd.includes('bubar') ||
      cmd.includes('balik') ||
      cmd.includes('kembali') ||
      cmd.includes('pulang') ||
      (cmd.includes('kerja') && !cmd.includes('rapat')) ||
      (cmd.includes('meja') && !cmd.includes('rapat')) ||
      (cmd.includes('stasiun') && !cmd.includes('rapat'))

    // Deteksi apakah perintah adalah rapat/meeting
    const isMeetingCmd =
      !isReturnCmd && (
        cmd.includes('rapat') ||
        cmd.includes('meeting') ||
        cmd.includes('kumpul') ||
        cmd.includes('briefing') ||
        cmd.includes('diskusi') ||
        cmd.includes('konferensi')
      )

    // 1. Eksekusi Perintah Selesai Rapat / Kembali ke Meja / Bubar / Balik Semua
    if (isReturnCmd) {
      if (isGlobal) {
        // SELURUH TIM KEMBALI KE MEJA & MENGETIK / FOKUS BEKERJA
        setBossConfig((prev) => ({
          ...prev,
          targetPos: OFFICE_PATHS.boss_to_desk,
          rotationY: 0,
          isWalking: true,
          isTyping: false,
          statusText: 'Supervising Office & Deals',
        }))

        setAgents((prev) => ({
          ...prev,
          'blue-agent': {
            ...prev['blue-agent'],
            targetPos: OFFICE_PATHS.blue_to_desk,
            rotationY: 0,
            isWalking: true,
            isTyping: false,
            statusText: 'Kembali ke Meja Workstation 01...',
          },
          'purple-agent': {
            ...prev['purple-agent'],
            targetPos: OFFICE_PATHS.purple_to_desk,
            rotationY: Math.PI,
            isWalking: true,
            isTyping: false,
            statusText: 'Kembali ke Meja Workstation 02...',
          },
          'green-agent': {
            ...prev['green-agent'],
            targetPos: OFFICE_PATHS.green_to_desk,
            rotationY: -Math.PI / 2,
            isWalking: true,
            isTyping: false,
            statusText: 'Kembali ke Meja Resepsionis...',
          },
          'orange-agent': {
            ...prev['orange-agent'],
            targetPos: OFFICE_PATHS.orange_to_desk,
            rotationY: 0,
            isWalking: true,
            isTyping: false,
            statusText: 'Kembali ke Kluster Server Vault...',
          },
        }))

        setTimeout(() => {
          setBossConfig((prev) => ({
            ...prev,
            isWalking: false,
            targetPos: STATIONS.boss_desk,
            statusText: 'Supervising Office & Deals',
          }))
          setAgents((prev) => ({
            ...prev,
            'blue-agent': {
              ...prev['blue-agent'],
              isWalking: false,
              isTyping: true,
              targetPos: STATIONS.workstation_desk,
              statusText: 'Monitoring Stock & Catalog',
            },
            'purple-agent': {
              ...prev['purple-agent'],
              isWalking: false,
              isTyping: true,
              targetPos: STATIONS.workstation_desk_02,
              statusText: 'Fokus Mengetik Penawaran (Qwen 2.5)',
            },
            'green-agent': {
              ...prev['green-agent'],
              isWalking: false,
              isTyping: false,
              targetPos: STATIONS.security_gate,
              statusText: 'Telegram Gateway Standby',
            },
            'orange-agent': {
              ...prev['orange-agent'],
              isWalking: false,
              isTyping: false,
              targetPos: STATIONS.data_vault,
              statusText: 'Database & Inventory Synced',
            },
          }))
        }, 8000)

        handleChangePOV('overview')

        return {
          success: true,
          feedback: '[SELESAI]: Rapat selesai. Seluruh tim AI kembali duduk fokus dan mengetik di stasiun kerja masing-masing.',
        }
      } else {
        // PERINTAH KHUSUS HANYA UNTUK AGEN TERPILIH (Misal: Hanya Ungu yang kembali ke meja)
        const targetKey = selectedAgentId.replace('-agent', '')
        const deskPath = OFFICE_PATHS[`${targetKey}_to_desk`]
        const deskStation = STATIONS[targetKey === 'purple' ? 'workstation_desk_02' : targetKey === 'blue' ? 'workstation_desk' : targetKey === 'green' ? 'security_gate' : 'data_vault']
        const agentName = agents[selectedAgentId]?.name || (selectedAgentId === 'purple-agent' ? 'Cubi Scribe (Ungu)' : selectedAgentId)
        const deskRot = selectedAgentId === 'purple-agent' ? Math.PI : selectedAgentId === 'blue-agent' ? 0 : selectedAgentId === 'green-agent' ? -Math.PI / 2 : 0

        if (deskPath) {
          setAgents((prev) => ({
            ...prev,
            [selectedAgentId]: {
              ...prev[selectedAgentId],
              targetPos: deskPath,
              rotationY: deskRot,
              isWalking: true,
              isTyping: false,
              statusText: `Kembali ke stasiun kerja...`,
            },
          }))

          setTimeout(() => {
            setAgents((prev) => ({
              ...prev,
              [selectedAgentId]: {
                ...prev[selectedAgentId],
                isWalking: false,
                isTyping: selectedAgentId === 'purple-agent' || selectedAgentId === 'blue-agent',
                targetPos: deskStation,
                statusText: selectedAgentId === 'purple-agent' ? 'Fokus Mengetik Penawaran (Qwen 2.5)' : selectedAgentId === 'blue-agent' ? 'Monitoring Stock & Catalog' : 'Standby di Stasiun',
              },
            }))
          }, 8000)

          if (selectedAgentId === 'purple-agent' || selectedAgentId === 'blue-agent') {
            handleChangePOV('workstation', selectedAgentId)
          } else if (selectedAgentId === 'green-agent') {
            handleChangePOV('reception', selectedAgentId)
          } else if (selectedAgentId === 'orange-agent') {
            handleChangePOV('vault', selectedAgentId)
          }

          return {
            success: true,
            feedback: `[PERINTAH KHUSUS]: ${agentName} kembali duduk fokus di stasiun kerjanya.`,
          }
        }
      }
    }

    // 2. Eksekusi Perintah Rapat / Meeting / Kumpul / Briefing
    if (isMeetingCmd) {
      if (isGlobal) {
        // SELURUH TIM KE MEJA RAPAT
        setBossConfig((prev) => ({
          ...prev,
          targetPos: OFFICE_PATHS.boss_to_meeting,
          rotationY: Math.PI,
          isWalking: true,
          isTyping: false,
          statusText: 'Memimpin Sesi Rapat Strategis Tim',
        }))

        setAgents((prev) => ({
          ...prev,
          'blue-agent': {
            ...prev['blue-agent'],
            targetPos: OFFICE_PATHS.blue_to_meeting,
            rotationY: -Math.PI / 2,
            isWalking: true,
            isTyping: false,
            statusText: 'Diskusi Hardware & Stok di Meja Rapat',
          },
          'purple-agent': {
            ...prev['purple-agent'],
            targetPos: OFFICE_PATHS.purple_to_meeting,
            rotationY: Math.PI / 2,
            isWalking: true,
            isTyping: false,
            statusText: 'Review AI Pitch Deck di Meja Rapat',
          },
          'green-agent': {
            ...prev['green-agent'],
            targetPos: OFFICE_PATHS.green_to_meeting,
            rotationY: 0,
            isWalking: true,
            isTyping: false,
            statusText: 'Laporan Gateway Telegram di Meja Rapat',
          },
          'orange-agent': {
            ...prev['orange-agent'],
            targetPos: OFFICE_PATHS.orange_to_meeting,
            rotationY: Math.PI / 4,
            isWalking: true,
            isTyping: false,
            statusText: 'Laporan Sinkronisasi Data di Meja Rapat',
          },
        }))

        // Waktu cukup agar seluruh rute koridor selesai tanpa berhenti di tengah jalan
        setTimeout(() => {
          setBossConfig((prev) => ({
            ...prev,
            isWalking: false,
            targetPos: STATIONS.meeting_boss,
            statusText: 'Memimpin Sesi Rapat Strategis Tim',
          }))
          setAgents((prev) => ({
            ...prev,
            'blue-agent': {
              ...prev['blue-agent'],
              isWalking: false,
              isTyping: false,
              targetPos: STATIONS.meeting_blue,
              statusText: 'Diskusi Hardware & Stok di Meja Rapat',
            },
            'purple-agent': {
              ...prev['purple-agent'],
              isWalking: false,
              isTyping: false,
              targetPos: STATIONS.meeting_purple,
              statusText: 'Review AI Pitch Deck di Meja Rapat',
            },
            'green-agent': {
              ...prev['green-agent'],
              isWalking: false,
              isTyping: false,
              targetPos: STATIONS.meeting_green,
              statusText: 'Laporan Gateway Telegram di Meja Rapat',
            },
            'orange-agent': {
              ...prev['orange-agent'],
              isWalking: false,
              isTyping: false,
              targetPos: STATIONS.meeting_orange,
              statusText: 'Laporan Sinkronisasi Data di Meja Rapat',
            },
          }))
        }, 8000)

        handleChangePOV('meeting')

        return {
          success: true,
          feedback: '[RAPAT DIMULAI]: Seluruh tim AI lengkap berkumpul di Meja Rapat. Kamera beralih ke Ruang Konferensi.',
        }
      } else {
        // PERINTAH KHUSUS HANYA UNTUK SATU AGEN YANG DIKLIK (Misal: Hanya Ungu yang jalan)
        const targetKey = selectedAgentId.replace('-agent', '')
        const meetingPath = OFFICE_PATHS[`${targetKey}_to_meeting`]
        const meetingStation = STATIONS[`meeting_${targetKey}`]
        const agentName = agents[selectedAgentId]?.name || (selectedAgentId === 'purple-agent' ? 'Cubi Scribe (Ungu)' : selectedAgentId)
        const meetingRot = selectedAgentId === 'purple-agent' ? Math.PI / 2 : selectedAgentId === 'blue-agent' ? -Math.PI / 2 : selectedAgentId === 'green-agent' ? 0 : Math.PI / 4

        if (meetingPath) {
          setAgents((prev) => ({
            ...prev,
            [selectedAgentId]: {
              ...prev[selectedAgentId],
              targetPos: meetingPath,
              rotationY: meetingRot,
              isWalking: true,
              isTyping: false,
              statusText: `Menghadiri sesi pembahasan di Meja Rapat`,
            },
          }))

          setTimeout(() => {
            setAgents((prev) => ({
              ...prev,
              [selectedAgentId]: {
                ...prev[selectedAgentId],
                isWalking: false,
                isTyping: false,
                targetPos: meetingStation,
              },
            }))
          }, 8000)

          handleChangePOV('meeting')

          return {
            success: true,
            feedback: `[PERINTAH KHUSUS]: Hanya ${agentName} yang berjalan ke Ruang Rapat. Agen lain tetap fokus di posisinya.`,
          }
        }
      }
    }

    // 3. Perintah Drafting / Mengetik / Koding / Analisis Hardware
    if (
      cmd.includes('draft') ||
      cmd.includes('tawarkan') ||
      cmd.includes('penawaran') ||
      cmd.includes('ketik') ||
      cmd.includes('koding') ||
      cmd.includes('analisis') ||
      cmd.includes('workstation') ||
      cmd.includes('hardware')
    ) {
      const targetId = (!isGlobal && selectedAgentId) ? selectedAgentId : 'purple-agent'
      const targetName = agents[targetId]?.name || (targetId === 'purple-agent' ? 'Cubi Scribe (Ungu)' : targetId)

      setAgents((prev) => ({
        ...prev,
        [targetId]: {
          ...prev[targetId],
          targetPos: targetId === 'purple-agent' ? STATIONS.workstation_desk_02 : prev[targetId].targetPos,
          rotationY: targetId === 'purple-agent' ? Math.PI : prev[targetId].rotationY,
          isWalking: false,
          isTyping: true,
          statusText: `Fokus Duduk Mengetik Penawaran Otomatis (Qwen 2.5)`,
        },
      }))

      handleChangePOV('workstation', targetId)

      return {
        success: true,
        feedback: `[FOKUS BEKERJA]: ${targetName} fokus duduk dan mengetik tugas di mejanya tanpa berjalan ke mana-mana.`,
      }
    }

    // 4. Perintah Cek Server / Vault / Database
    if (
      cmd.includes('server') ||
      cmd.includes('vault') ||
      cmd.includes('database') ||
      cmd.includes('db') ||
      cmd.includes('cluster')
    ) {
      const targetId = (!isGlobal && selectedAgentId) ? selectedAgentId : 'orange-agent'
      const targetName = agents[targetId]?.name || 'Cubi Vault'

      setAgents((prev) => ({
        ...prev,
        [targetId]: {
          ...prev[targetId],
          targetPos: [-4.6, 0.33, 1.15],
          rotationY: Math.PI / 2,
          isWalking: true,
          statusText: 'Menginspeksi Kluster Server NUC & Data Vault',
        },
      }))

      setTimeout(() => {
        setAgents((prev) => ({
          ...prev,
          [targetId]: { ...prev[targetId], isWalking: false },
        }))
      }, 7000)

      handleChangePOV('vault', targetId)

      return {
        success: true,
        feedback: `[SERVER CHECK]: ${targetName} menginspeksi kluster Server NUC & Data Vault.`,
      }
    }

    // 5. Perintah Resepsionis / Tamu / Gateway Telegram
    if (
      cmd.includes('resepsionis') ||
      cmd.includes('reception') ||
      cmd.includes('tamu') ||
      cmd.includes('pintu') ||
      cmd.includes('gate') ||
      cmd.includes('telegram') ||
      cmd.includes('whatsapp')
    ) {
      const targetId = (!isGlobal && selectedAgentId) ? selectedAgentId : 'green-agent'
      const targetName = agents[targetId]?.name || 'Cubi Gate'

      setAgents((prev) => ({
        ...prev,
        [targetId]: {
          ...prev[targetId],
          targetPos: STATIONS.security_gate,
          rotationY: -Math.PI / 2,
          isWalking: true,
          statusText: 'Siaga Tamu & Telegram Dispatch',
        },
      }))

      setTimeout(() => {
        setAgents((prev) => ({
          ...prev,
          [targetId]: { ...prev[targetId], isWalking: false },
        }))
      }, 7000)

      handleChangePOV('reception', targetId)

      return {
        success: true,
        feedback: `[GATEWAY]: ${targetName} siaga di Meja Resepsionis & Pintu Depan.`,
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

    // Default: Perintah Bebas Khusus Agen Terpilih atau Tim
    if (!isGlobal && selectedAgentId && agents[selectedAgentId]) {
      const targetName = agents[selectedAgentId]?.name || (selectedAgentId === 'purple-agent' ? 'Cubi Scribe (Ungu)' : selectedAgentId)
      
      // Tahap 1: Mulai mengeksekusi tugas khusus
      setAgents((prev) => ({
        ...prev,
        [selectedAgentId]: {
          ...prev[selectedAgentId],
          isTyping: true,
          isWalking: false,
          statusText: `Sedang memproses instruksi: "${commandStr}"...`,
        },
      }))

      const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          time: timeNow,
          agent: targetName,
          action: `Perintah Khusus: ${commandStr}`,
          detail: `Agen ${targetName} mulai memproses tugas langsung dari pimpinan.`,
        },
        ...prev.slice(0, 49),
      ])

      // Tahap 2: Tugas selesai dalam 3.5 detik (menghilangkan kondisi terjebak di status "mengeksekusi doang")
      setTimeout(() => {
        setAgents((prev) => ({
          ...prev,
          [selectedAgentId]: {
            ...prev[selectedAgentId],
            isTyping: selectedAgentId === 'purple-agent' || selectedAgentId === 'blue-agent',
            statusText: `✅ Selesai: "${commandStr}" berhasil dikerjakan.`,
          },
        }))

        const doneTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        setActivities((prev) => [
          {
            id: `act-${Date.now()}`,
            time: doneTime,
            agent: targetName,
            action: `Tugas Selesai: ${commandStr}`,
            detail: `Instruksi "${commandStr}" berhasil diselesaikan dengan sukses oleh ${targetName}.`,
          },
          ...prev.slice(0, 49),
        ])
      }, 3500)

      // Tahap 3: Kembalikan status stasiun kerja normal setelah 8.5 detik
      setTimeout(() => {
        setAgents((prev) => ({
          ...prev,
          [selectedAgentId]: {
            ...prev[selectedAgentId],
            statusText:
              selectedAgentId === 'purple-agent'
                ? 'Fokus Mengetik Penawaran (Qwen 2.5)'
                : selectedAgentId === 'blue-agent'
                ? 'Monitoring Stock & Catalog'
                : selectedAgentId === 'green-agent'
                ? 'Telegram Gateway Standby'
                : 'Database & Inventory Synced',
          },
        }))
      }, 8500)

      return {
        success: true,
        feedback: `[PERINTAH KHUSUS DITERIMA]: "${commandStr}" -> Hanya ${targetName} yang mengeksekusi instruksi ini.`,
      }
    }

    // Perintah untuk Direktur Pak Alfa (jika dipilih) atau Seluruh Tim
    const bossName = bossConfig?.name || 'Pak Alfa'
    setBossConfig((prev) => ({
      ...prev,
      statusText: `Sedang memproses: "${commandStr}"...`,
    }))

    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        time: timeNow,
        agent: bossName,
        action: `Instruksi Tim: ${commandStr}`,
        detail: `Dikoordinasikan ke ${bossName} & Tim AI.`,
      },
      ...prev.slice(0, 49),
    ])

    setTimeout(() => {
      setBossConfig((prev) => ({
        ...prev,
        statusText: `✅ Selesai: "${commandStr}" berhasil dikoordinasikan.`,
      }))
    }, 3500)

    setTimeout(() => {
      setBossConfig((prev) => ({
        ...prev,
        statusText: 'Supervising Office & Deals',
      }))
    }, 8500)

    return {
      success: true,
      feedback: `[PERINTAH TIM DITERIMA]: "${commandStr}" -> Dikoordinasikan ke ${bossName} & Tim AI.`,
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
    window.scrollTo({ top: 0, behavior: 'instant' })
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

  // Fetch data dari FastAPI Backend secara Riil (Debounced Health Check agar stabil & tidak putus-nyambung)
  const fetchData = async () => {
    let connected = false
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4000)

      // 1. Health Check Riil
      const healthRes = await safeApiFetch('/api/v1/system/health', {
        cache: 'no-store',
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      if (healthRes.ok) {
        const data = await healthRes.json()
        setSystemInfo(data)
        setIsBackendConnected(true)
        consecutiveFailuresRef.current = 0
        connected = true
      } else {
        consecutiveFailuresRef.current += 1
        if (consecutiveFailuresRef.current >= 3) {
          setIsBackendConnected(false)
          setSystemInfo(null)
        }
      }
    } catch {
      consecutiveFailuresRef.current += 1
      if (consecutiveFailuresRef.current >= 3) {
        setIsBackendConnected(false)
        setSystemInfo(null)
      }
    }

    if (!connected) {
      // Hanya isi sampel awal jika daftar prospek masih kosong agar 3D scene tetap tampil saat offline
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
      return
    }

    // 2. Team Config Riil (Terisolasi dari kegagalan parsial)
    try {
      const teamRes = await safeApiFetch('/api/v1/team/config', { cache: 'no-store' })
      if (teamRes.ok) {
        const teamData = await teamRes.json()
        if (teamData.boss) {
          setBossConfig((prev) => {
            const { targetPos, isWalking, rotationY, isTyping, ...safeBossProps } = teamData.boss
            return { ...prev, ...safeBossProps }
          })
        }
        if (teamData.agents) {
          setAgents((prev) => {
            const next = { ...prev }
            for (const [k, v] of Object.entries(teamData.agents)) {
              if (next[k]) {
                const { targetPos, isWalking, rotationY, isTyping, isScanning, statusText, ...safeProps } = v
                next[k] = {
                  ...next[k],
                  ...safeProps,
                  statusText: next[k].isWalking ? next[k].statusText : (statusText || next[k].statusText),
                }
              }
            }
            return next
          })
        }
      }
    } catch (e) {
      console.warn('[SYNC WARNING] Team config fetch failed:', e)
    }

    // 3. Leads Riil dari workspace/leads_mentah.csv
    try {
      const leadsRes = await safeApiFetch('/api/v1/leads/queue', { cache: 'no-store' })
      if (leadsRes.ok) {
        const leadsData = await leadsRes.json()
        setLeads(leadsData.leads || [])
      }
    } catch (e) {
      console.warn('[SYNC WARNING] Leads fetch failed:', e)
    }

    // 4. Activities Riil
    try {
      const actRes = await safeApiFetch('/api/v1/system/activities', { cache: 'no-store' })
      if (actRes.ok) {
        const actData = await actRes.json()
        setActivities(actData.activities || [])
      }
    } catch (e) {
      console.warn('[SYNC WARNING] Activities fetch failed:', e)
    }

    // 5. Deliberations Riil (Autonomous Swarm Deliberation)
    try {
      const delibRes = await safeApiFetch('/api/v1/deliberations', { cache: 'no-store' })
      if (delibRes.ok) {
        const delibData = await delibRes.json()
        setDeliberations(delibData.deliberations || [])
      }
    } catch (e) {
      console.warn('[SYNC WARNING] Deliberations fetch failed:', e)
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
    try {
      localStorage.setItem('cubi_team_config', JSON.stringify(newConfig))
    } catch {}
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
      await safeApiFetch('/api/v1/team/config', {
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
      await safeApiFetch('/api/v1/leads/create', {
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

    const isDispatched = ['dispatched', 'approved', 'simulated'].includes(lead.status_kontak)
    const isDashboard = currentRoute === 'dashboard'

    // Core async fetcher
    const fetchPitchData = async () => {
      try {
        const res = await safeApiFetch('/api/v1/leads/generate-pitch', {
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
            statusText: `Draf siap! Menunggu otorisasi Direktur untuk Telegram Dispatch`,
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
            statusText: `Draf siap! Menunggu otorisasi Direktur untuk Telegram Dispatch`,
          },
        }))
      }
    }

    // Jika pada dashboard atau melihat draf yang sudah selesai, eksekusi instan tanpa delay animasi 3D
    if (isDashboard || isDispatched) {
      await fetchPitchData()
      return
    }

    // Pada 3D Office: Transisi cepat dan responsif ke agen-agen
    setSelectedAgentId('boss')
    setBossConfig((prev) => ({
      ...prev,
      statusText: `Menugaskan prospek ${lead.nama} ke tim StelAgent`,
    }))

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
    }, 300)

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
    }, 650)

    setTimeout(async () => {
      setSelectedAgentId('purple-agent')
      setAgents((prev) => ({
        ...prev,
        'purple-agent': {
          ...prev['purple-agent'],
          isTyping: true,
          statusText: `Menyusun draf Telegram personal via model Qwen 2.5...`,
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

      await fetchPitchData()
    }, 1000)
  }

  // Aksi: Setujui & Dispatch Telegram ke Calon Konsumen
  const handleApprovePitch = async (payload) => {
    if (!payload) {
      setPitchResult(null)
      setAgents((prev) => ({
        ...prev,
        'green-agent': {
          ...prev['green-agent'],
          statusText: 'Telegram Gateway Standby',
          targetPos: STATIONS.security_gate,
        },
      }))
      return
    }

    // Cubi Gate mengaktifkan transmisi pengiriman Telegram
    setSelectedAgentId('green-agent')
    setAgents((prev) => ({
      ...prev,
      'green-agent': {
        ...prev['green-agent'],
        isScanning: true,
        statusText: `Mengirim draf penawaran & berkas PDF SPK ke Telegram @iiibays...`,
      },
      'orange-agent': {
        ...prev['orange-agent'],
        isScanning: true,
        statusText: `Mengarsipkan data deal prospek ${payload.id_lead} ke CSV Data Vault...`,
      },
    }))

    let responseData
    try {
      const response = await safeApiFetch('/api/v1/leads/approve-and-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      responseData = await response.json()
      if (!response.ok) {
        const detail = responseData.detail
        throw new Error(typeof detail === 'string' ? detail : detail?.message || 'Persetujuan gagal diproses.')
      }
      if (!['simulated', 'dispatched'].includes(responseData.status)) {
        throw new Error('Backend mengembalikan status dispatch yang tidak dikenal.')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Backend tidak dapat dihubungi.'
      alert(`Pemberitahuan Sistem:\n${message}`)
      setPitchResult(null)
      setActiveLead(null)
      setAgents((prev) => ({
        ...prev,
        'green-agent': {
          ...prev['green-agent'],
          isScanning: false,
          statusText: `Dispatch gagal: ${message}`,
        },
        'orange-agent': {
          ...prev['orange-agent'],
          isScanning: false,
          statusText: 'Data prospek belum diubah.',
        },
      }))
      return
    }

    const isSimulation = responseData.status === 'simulated'
    const teleTarget = responseData.telegram_target || '@iiibays'
    const outcomeText = responseData.telegram_dispatch?.status === 'terkirim_live_telegram'
      ? `Bukti penawaran & PDF SPK resmi berhasil dikirim live ke Telegram ${teleTarget}!`
      : `Bukti penawaran & PDF SPK resmi berhasil diproses & tercatat untuk Telegram ${teleTarget}!`
    setPitchResult(null)
    setActiveLead(null)
    setBossConfig((prev) => ({
      ...prev,
      statusText: outcomeText,
    }))

    if (responseData?.pdf_url) {
      setSpkModalData(responseData)
    }

    // Kembalikan agen ke stasiun semula dengan hasil aktual dari backend.
    setTimeout(() => {
      fetchData()
      setAgents((prev) => ({
        ...prev,
        'green-agent': {
          ...prev['green-agent'],
          isWalking: false,
          isScanning: false,
          targetPos: STATIONS.security_gate,
          rotationY: Math.PI * 0.8,
          statusText: outcomeText,
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
      (l) => !['dispatched', 'approved', 'simulated'].includes(l.status_kontak)
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
              deliberations={deliberations}
              spkModalData={spkModalData}
              onCloseSpkModal={() => setSpkModalData(null)}
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
                onChangePOV={handleChangePOV}
                isCctvAutoScanning={isCctvAutoScanning}
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
                  deliberations={deliberations}
                  spkModalData={spkModalData}
                  onCloseSpkModal={() => setSpkModalData(null)}
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
                  isCctvAutoScanning={isCctvAutoScanning}
                  onToggleCctvAutoScan={() => setIsCctvAutoScanning((prev) => !prev)}
                  onRotateCctv={handleRotateCctv}
                  onExecuteCommand={handleExecuteOfficeCommand}
                  onZoom={handleManualZoom}
                  onResetPOV={handleResetPOV}
                  onTogglePure3D={handleTogglePure3D}
                  userProfile={deviceProfile}
                  onInstallPwa={handleInstallPwa}
                  isPwaInstalled={isPwaInstalled}
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
          onInstallPwa={handleInstallPwa}
          isPwaInstalled={isPwaInstalled}
          onClose={() => setIsDeviceModalOpen(false)}
        />
      </Suspense>
    </>
  )
}
