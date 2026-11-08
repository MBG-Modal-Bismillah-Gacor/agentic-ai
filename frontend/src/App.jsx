import React, { useState, useEffect, useRef } from 'react'
import { Minimize2 } from 'lucide-react'
import { OfficeScene } from './components/OfficeScene'
import { DashboardOverlay } from './components/DashboardOverlay'
import { TeamSetupModal } from './components/TeamSetupModal'
import { CreateLeadModal } from './components/CreateLeadModal'
import { OfficeEntranceModal } from './components/OfficeEntranceModal'
import { LandingPage } from './components/LandingPage'
import { DashboardView } from './components/DashboardView'

const API_BASE = 'http://127.0.0.1:8000'

// Inisialisasi rute dari path URL browser
function getInitialRoute() {
  if (typeof window === 'undefined') return 'landing'
  const path = window.location.pathname.toLowerCase()
  if (path === '/office' || path === '/kantor') return 'office'
  if (path === '/dashboard') return 'dashboard'
  return 'landing'
}

// Titik Koordinat Stasiun Kerja di Diorama Kantor Sesuai Referensi
const STATIONS = {
  boss_desk: [-5.8, 0.18, 2.25],
  workstation_desk: [-3.2, 0.18, 1.70],
  workstation_desk_02: [3.2, 0.18, -0.70],
  kanban_board: [3.2, 0.18, -2.6],
  whiteboard: [-1.2, 0.18, -2.5],
  security_gate: [2.2, 0.18, 0.8],
  data_vault: [-4.5, 0.18, -2.6],
  center_hall: [0, 0.18, 0],
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
  rotationY: Math.PI,
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
    rotationY: Math.PI,
    isWalking: false,
    isTyping: true,
    isScanning: false,
    statusText: 'Monitoring Stock & Catalog',
    station: 'Workstation Desk 01',
  },
  'purple-agent': {
    id: 'purple-agent',
    name: 'Outbound Strategist',
    role: 'AI Pitch Drafter',
    color: '#4F46E5',
    emoji: 'DRAFTER',
    vibe: 'Turns buying signals into booked meetings before competition notices.',
    personaId: 'sales-outbound-strategist',
    pos: STATIONS.kanban_board,
    targetPos: STATIONS.kanban_board,
    rotationY: Math.PI,
    isWalking: false,
    isTyping: false,
    isScanning: false,
    statusText: 'Sprint Task Ready',
    station: 'Kanban Wall',
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
    rotationY: 0,
    isWalking: false,
    isTyping: false,
    isScanning: false,
    statusText: 'WhatsApp Gateway Standby',
    station: 'Security Gate',
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
    rotationY: -Math.PI * 0.75,
    isWalking: false,
    isTyping: false,
    isScanning: false,
    statusText: 'Database & Inventory Synced',
    station: 'Server Vault',
  },
}

class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
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

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#F8F5EC] text-[#192A56] p-6 font-mono select-none">
          <div className="max-w-md w-full bg-white border-2 border-[#192A56] p-6 shadow-[6px_6px_0px_0px_#192A56] text-center space-y-4">
            <div className="w-12 h-12 bg-[#192A56] text-[#F8F5EC] flex items-center justify-center font-bold text-xl mx-auto rounded-xs">
              !
            </div>
            <h2 className="text-base font-bold uppercase tracking-wider text-[#192A56]">
              Tampilan Sedang Di-refresh
            </h2>
            <p className="text-xs text-[#576574] leading-relaxed">
              Terjadi penyesuaian grafis 3D / rute. Tekan tombol di bawah untuk memuat ulang tampilan secara otomatis.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 border-2 border-[#192A56] bg-[#192A56] text-[#F8F5EC] font-bold text-xs uppercase tracking-wider hover:bg-[#0E1A38] transition cursor-pointer"
              >
                Coba Lagi
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/'
                }}
                className="px-4 py-2 border-2 border-[#192A56] bg-white text-[#192A56] font-bold text-xs uppercase tracking-wider hover:bg-[#F0ECE1] transition cursor-pointer"
              >
                Kembali ke Beranda
              </button>
            </div>
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
  const [isOfficeSetupDone, setIsOfficeSetupDone] = useState(true)
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

  const handleChangePOV = (pov) => {
    setActivePOV(pov)
    setTransitionTrigger(Date.now())
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

  // Modals state
  const [isEntranceOpen, setIsEntranceOpen] = useState(false)
  const [isTeamSetupOpen, setIsTeamSetupOpen] = useState(false)
  const [isCreateLeadOpen, setIsCreateLeadOpen] = useState(false)

  // Router Navigator: Membuka rute secara langsung tanpa modal yang memblokir
  const navigate = (route, params = {}) => {
    if (params?.agentId) {
      setSelectedAgentId(params.agentId)
    }
    setIsEntranceOpen(false)
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
        setIsEntranceOpen(false)
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
      statusText: `Menugaskan prospek ${lead.nama} ke ${scoutName}`,
    }))

    // LANGKAH 2: Cubi Scout berjalan dari meja kerja ke Server Rack & Vault untuk riset katalog & stok
    setTimeout(() => {
      setSelectedAgentId('blue-agent')
      setAgents((prev) => ({
        ...prev,
        'blue-agent': {
          ...prev['blue-agent'],
          isTyping: false,
          isWalking: true,
          targetPos: STATIONS.data_vault,
          rotationY: -Math.PI * 0.75,
          statusText: `Berjalan ke Vault untuk riset ${lead.minat}...`,
        },
      }))
    }, 600)

    // LANGKAH 3: Cubi Scout tiba di Vault, melakukan scanning
    setTimeout(() => {
      setAgents((prev) => ({
        ...prev,
        'blue-agent': {
          ...prev['blue-agent'],
          isWalking: false,
          isScanning: true,
          rotationY: -Math.PI * 0.75,
          statusText: `Mengecek ketersediaan unit & bundling di cabang ${lead.domisili}`,
        },
      }))
    }, 2000)

    // LANGKAH 4: Cubi Scribe berjalan dari Kanban ke meja kerja Desk 02 untuk mengetik draf via Qwen LLM
    setTimeout(() => {
      setSelectedAgentId('purple-agent')
      setAgents((prev) => ({
        ...prev,
        'purple-agent': {
          ...prev['purple-agent'],
          isWalking: true,
          targetPos: STATIONS.workstation_desk_02,
          rotationY: Math.PI,
          statusText: `Berjalan ke Workstation 02 untuk menyusun draf pitch...`,
        },
      }))
    }, 3200)

    // LANGKAH 5: Cubi Scribe duduk mengetik di meja, dan Cubi Scout kembali ke stasiun
    setTimeout(async () => {
      setAgents((prev) => ({
        ...prev,
        'purple-agent': {
          ...prev['purple-agent'],
          isWalking: false,
          isTyping: true,
          rotationY: Math.PI,
          statusText: `Menyusun draf WhatsApp dengan Qwen 2.5...`,
        },
        'blue-agent': {
          ...prev['blue-agent'],
          isScanning: false,
          isWalking: true,
          targetPos: STATIONS.workstation_desk,
          rotationY: Math.PI,
          statusText: `Analisis stok selesai. Unit siap ditawarkan!`,
        },
      }))

      setTimeout(() => {
        setAgents((prev) => ({
          ...prev,
          'blue-agent': {
            ...prev['blue-agent'],
            isWalking: false,
            isTyping: true,
            rotationY: Math.PI,
          },
        }))
      }, 1200)

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

        // LANGKAH 6: Cubi Gate menuju Security Turnstile bersiap minta persetujuan Bos
        setAgents((prev) => ({
          ...prev,
          'purple-agent': {
            ...prev['purple-agent'],
            isTyping: false,
            targetPos: STATIONS.kanban_board,
            statusText: `Draf pitch selesai untuk ${lead.nama}`,
          },
          'green-agent': {
            ...prev['green-agent'],
            isWalking: true,
            targetPos: STATIONS.security_gate,
            statusText: `Menunggu Approval Bos untuk WhatsApp Dispatch`,
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
            statusText: `Menunggu Approval Bos untuk WhatsApp Dispatch`,
          },
        }))
      }
    }, 4500)
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
        statusText: `Mengirim pesan ke ${payload.nomor_wa}...`,
      },
      'orange-agent': {
        ...prev['orange-agent'],
        isWalking: true,
        targetPos: [-5.0, 0.18, -3.8],
        statusText: `Mengarsipkan data deal prospek ${payload.id_lead} ke CSV...`,
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
          targetPos: STATIONS.security_gate,
          rotationY: 0,
          statusText: 'Pesan terkirim ke WhatsApp Gateway!',
        },
        'orange-agent': {
          ...prev['orange-agent'],
          isWalking: false,
          targetPos: STATIONS.data_vault,
          rotationY: -Math.PI * 0.75,
          statusText: 'Data prospek berhasil diperbarui di database.',
        },
        'purple-agent': {
          ...prev['purple-agent'],
          isWalking: false,
          targetPos: STATIONS.kanban_board,
          rotationY: Math.PI,
          isTyping: false,
          statusText: 'Siap untuk prospek berikutnya',
        },
        'blue-agent': {
          ...prev['blue-agent'],
          isWalking: false,
          targetPos: STATIONS.workstation_desk,
          rotationY: Math.PI,
          isTyping: true,
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
      <RouteErrorBoundary currentRoute={currentRoute}>
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

        {/* 3. RUTE: VIRTUAL OFFICE 3D (Architectural Blueprint Canvas & Cyber HUD) */}
        {currentRoute === 'office' && (
          <main className="w-screen h-screen relative bg-[#F8F5EC] overflow-hidden select-none">
            {/* Blueprint Canvas Grid Pattern */}
            <div className={`fixed inset-0 pointer-events-none z-0 bg-grid-pattern ${isPure3DMode ? "opacity-0" : "opacity-70"}`} aria-hidden="true" />
            {/* 3D Diorama Kantor Virtual Modern MSI Cubi NUC */}
            <OfficeScene
              agents={agents}
              bossConfig={bossConfig}
              selectedAgentId={selectedAgentId}
              onSelectAgent={setSelectedAgentId}
              leads={leads}
              activeLead={activeLead}
              pitchResult={pitchResult}
              isEntranceOpen={isEntranceOpen}
              activePOV={activePOV}
              transitionTrigger={transitionTrigger}
              controlsRef={officeControlsRef}
              isPure3DMode={isPure3DMode}
            />

            {/* Tombol Keluar Mode Fullscreen 3D Immersive */}
            {isPure3DMode && (
              <div className="absolute top-4 right-4 z-50 pointer-events-auto">
                <button
                  type="button"
                  onClick={handleExitPure3D}
                  style={{ backgroundColor: '#192A56', color: '#F8F5EC' }}
                  className="px-3.5 py-1.5 border border-[#192A56] font-bold text-xs uppercase shadow-[3px_3px_0px_0px_#192A56] flex items-center gap-2 cursor-pointer hover:bg-[#0E1A38] transition"
                  title="Keluar dari Fullscreen (Tekan ESC)"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-[#FF5B00]" />
                  <span style={{ color: '#F8F5EC' }}>Keluar Fullscreen (ESC)</span>
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
                onSelectAgent={setSelectedAgentId}
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
                onZoom={handleManualZoom}
                onResetPOV={handleResetPOV}
                onTogglePure3D={handleTogglePure3D}
              />
            )}

            {/* Setup Kantor Otonom AI & Sambutan Gerbang (Office Setup Wizard) */}
            <OfficeEntranceModal
              isOpen={isEntranceOpen}
              onEnterOffice={handleEnterOffice}
              isBackendConnected={isBackendConnected}
              systemInfo={systemInfo}
              bossConfig={bossConfig}
              currentOfficeName={officeName}
              agents={agents}
            />
          </main>
        )}
      </RouteErrorBoundary>

      {/* Modal Personalisasi Nama Bos & Tim Cubi */}
      <TeamSetupModal
        isOpen={isTeamSetupOpen}
        onClose={() => setIsTeamSetupOpen(false)}
        teamConfig={{ boss: bossConfig, agents }}
        onSave={handleSaveTeamConfig}
      />

      {/* Modal Tambah Lead Baru */}
      <CreateLeadModal
        isOpen={isCreateLeadOpen}
        onClose={() => setIsCreateLeadOpen(false)}
        onCreateLead={handleCreateLead}
      />
    </>
  )
}
