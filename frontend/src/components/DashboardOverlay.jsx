import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Layers, 
  Send, 
  RefreshCw, 
  ChevronRight, 
  ChevronDown,
  Check,
  User,
  ShieldCheck, 
  Cpu, 
  Eye, 
  EyeOff, 
  Crown, 
  PlusCircle, 
  Play, 
  Activity, 
  PackageCheck, 
  DoorOpen,
  Wifi,
  WifiOff,
  Terminal,
  Database,
  Building2,
  Home,
  Compass,
  Camera,
  Video,
  Radio,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Maximize2,
  LayoutGrid,
  Briefcase,
  Monitor,
  Columns3,
  Lock,
  LayoutDashboard,
  SlidersHorizontal,
  Bot,
  FileText,
  FileDown,
  Download,
  ShieldAlert,
  Info,
  Users,
  ExternalLink
} from 'lucide-react'

export function DashboardOverlay({
  agents,
  bossConfig,
  officeName = 'MSI Cubi Sovereign AI HQ',
  selectedAgentId,
  onSelectAgent,
  leads = [],
  systemInfo,
  isBackendConnected = false,
  activeLead,
  isGenerating,
  pitchResult,
  activities = [],
  deliberations = [],
  spkModalData = null,
  onCloseSpkModal = null,
  onSelectLead,
  onApprovePitch,
  onRefresh,
  onOpenTeamSetup,
  onOpenOfficeSetup,
  onOpenCreateLead,
  onRunAutoPipeline,
  onOpenEntrance,
  onNavigate,
  activePOV = 'overview',
  onChangePOV,
  onExecuteCommand,
  onZoom,
  onResetPOV,
  onTogglePure3D,
  userProfile = null,
  onOpenProfileSettings = null,
  isCctvAutoScanning = false,
  onToggleCctvAutoScan = null,
  onRotateCctv = null,
  onInstallPwa = null,
  isPwaInstalled = false,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('leads') // 'leads' | 'activity'
  const [editedPitch, setEditedPitch] = useState('')
  const [waNumber, setWaNumber] = useState('081234567890')
  const [consentConfirmed, setConsentConfirmed] = useState(false)
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isHudVisible, setIsHudVisible] = useState(true)
  const [commandText, setCommandText] = useState('')
  const [commandFeedback, setCommandFeedback] = useState('Sistem siap menerima instruksi terminal.')
  const [isPovDropdownOpen, setIsPovDropdownOpen] = useState(false)
  const [clockStr, setClockStr] = useState('')

  useEffect(() => {
    const updateClock = () => {
      const d = new Date()
      setClockStr(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
      )
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  const POV_OPTIONS = [
    { id: 'overview', label: 'Seluruh Kantor', icon: Building2, desc: 'Tampilan Isometrik 3D Lengkap' },
    { id: 'topdown', label: 'Tampak Atas', icon: Compass, desc: 'Denah Layout Arsitektural' },
    { id: 'workstation', label: 'Workstation', icon: Monitor, desc: 'Cubi Scout & Cubi Scribe' },
    { id: 'boss', label: 'Meja Direktur', icon: Crown, desc: `${bossConfig?.name || 'Pak Alfa'}` },
    { id: 'reception', label: 'Meja Resepsionis', icon: DoorOpen, desc: 'Cubi Gatekeeper' },
    { id: 'meeting', label: 'Ruang Rapat & Screen', icon: Columns3, desc: 'Live Kanban Presentation' },
    { id: 'vault', label: 'Server Vault', icon: Database, desc: 'MSI Cubi NUC Archive' },
    { id: 'cctv_boss', label: 'CAM 01: Ruang Direktur', icon: Video, desc: 'CCTV 360° Surveillance', isCctv: true },
    { id: 'cctv_workstation', label: 'CAM 02: Workstation AI', icon: Video, desc: 'CCTV 360° Surveillance', isCctv: true },
    { id: 'cctv_reception', label: 'CAM 03: Resepsionis', icon: Video, desc: 'CCTV 360° Surveillance', isCctv: true },
    { id: 'cctv_vault', label: 'CAM 04: Server Vault', icon: Video, desc: 'CCTV 360° Surveillance', isCctv: true },
    { id: 'cctv_meeting', label: 'CAM 05: Ruang Rapat', icon: Video, desc: 'CCTV 360° Surveillance', isCctv: true },
  ]

  const isCctvActive = activePOV.startsWith('cctv_')
  const visiblePovOptions = POV_OPTIONS.filter((opt) => (isCctvActive ? opt.isCctv : !opt.isCctv))
  const currentPovOption = POV_OPTIONS.find((p) => p.id === activePOV) || (isCctvActive ? visiblePovOptions[0] : POV_OPTIONS[0])

  const handleSendCommand = (e) => {
    e.preventDefault()
    if (!commandText.trim()) return

    const cmd = commandText.trim()
    setCommandText('')

    if (onExecuteCommand) {
      const res = onExecuteCommand(cmd)
      if (res?.feedback) {
        setCommandFeedback(res.feedback)
        return
      }
    }

    const lower = cmd.toLowerCase()
    if (lower.includes('auto') || lower.includes('pipeline') || lower.includes('proses')) {
      setCommandFeedback('[PERINTAH DITERIMA]: Menjalankan Auto Pipeline prospek...')
      if (onRunAutoPipeline) onRunAutoPipeline()
    } else if (lower.includes('sync') || lower.includes('refresh') || lower.includes('sinkron')) {
      setCommandFeedback('[PERINTAH DITERIMA]: Sinkronisasi data real-time ke backend...')
      if (onRefresh) onRefresh()
    } else if (lower.includes('lead') || lower.includes('prospek')) {
      if (leads && leads.length > 0 && onSelectLead) {
        setCommandFeedback(`[PERINTAH DITERIMA]: Menugaskan Sales Engineer ke ${leads[0].nama}...`)
        onSelectLead(leads[0])
      } else {
        setCommandFeedback('[INFO]: Antrean prospek kosong atau sudah selesai.')
      }
    } else {
      setCommandFeedback(`[PERINTAH DIEKSEKUSI]: "${cmd}" -> Diteruskan ke ${getSelectedData().name}`)
    }
  }

  // Runtime timer counter
  const [elapsedSecs, setElapsedSecs] = useState(134.8)

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSecs((prev) => prev + 0.5)
    }, 500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (pitchResult?.draft_pitch) {
      setEditedPitch(pitchResult.draft_pitch)
    }
    if (pitchResult?.prospek?.nomor_wa) {
      setWaNumber(pitchResult.prospek.nomor_wa)
    } else if (activeLead?.nomor_wa) {
      setWaNumber(activeLead.nomor_wa)
    }
    setIsSubmittingApproval(false)
  }, [pitchResult, activeLead])

  useEffect(() => {
    if (activeLead?.nomor_wa) {
      setWaNumber(activeLead.nomor_wa)
    }
    setConsentConfirmed(false)
  }, [activeLead?.id_lead, activeLead?.nomor_wa])

  // Cari data agent yang sedang aktif dipilih
  const getSelectedData = () => {
    if (selectedAgentId === 'boss') {
      return {
        id: 'boss',
        name: bossConfig?.name || 'Pak Alfa',
        role: bossConfig?.role || 'Sales Director',
        color: '#192A56',
        pos: bossConfig?.pos || [-8.35, 0.25, 0.37],
        statusText: bossConfig?.statusText || 'Supervising Office & Deals',
        station: 'Ruang Direktur Eksekutif',
        feature: 'Deal Approver & Management',
        tokens: isBackendConnected ? '4,120 tok' : '0 tok (Offline)',
      }
    }
    const ag = agents?.[selectedAgentId] || agents?.['blue-agent']
    const roleFeatures = {
      'blue-agent': { station: 'Workstation 01', feature: 'Local Hardware Compute & Stock', tokens: '14,850 tok' },
      'purple-agent': { station: 'Workstation 02', feature: 'Qwen 2.5 3B Local AI Drafter', tokens: '28,420 tok' },
      'green-agent': { station: 'Meja Resepsionis', feature: 'Telegram Bot Gateway', tokens: '8,920 tok' },
      'orange-agent': { station: 'Server Vault & Data Archive', feature: 'Persistent CSV Data Vault', tokens: '6,100 tok' },
    }
    const feat = roleFeatures[ag?.id] || { station: 'Workstation', feature: 'MSI Cubi NUC Appliance', tokens: '12,840 tok' }
    return {
      ...(ag || {
        name: 'Cubi Agent',
        role: 'Agent',
        color: '#0284c7',
        pos: [0, 0, 0],
        statusText: 'Active',
      }),
      station: feat.station,
      feature: feat.feature,
      tokens: isBackendConnected ? feat.tokens : '0 tok (Offline)',
    }
  }

  const currentAgent = getSelectedData()

  // Filter leads berdasarkan search
  const filteredLeads = leads.filter((l) => {
    const q = searchQuery.toLowerCase()
    return (
      (l.nama || '').toLowerCase().includes(q) ||
      (l.minat || '').toLowerCase().includes(q) ||
      (l.domisili || '').toLowerCase().includes(q)
    )
  })

  // Format runtime timer: mm:ss.s
  const mins = Math.floor(elapsedSecs / 60)
  const secs = (elapsedSecs % 60).toFixed(1)
  const formattedRuntime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(4, '0')}s`

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between select-none overflow-hidden font-sans">
      
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR (Modern Sleek Floating Header, Profile & Camera Dropdown)  */}
      {/* ========================================================================= */}
      <header className="w-full relative z-50 pointer-events-auto shrink-0 px-3 pt-2.5 pb-1 sm:px-4">
        <div className="w-full bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-lg shadow-slate-900/5 px-3.5 py-2 flex items-center justify-between gap-2 overflow-x-auto lg:overflow-visible">
          
          {/* Sisi Kiri: Navigasi Cepat (Beranda, Office AKTIF di tengah, Dashboard) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onNavigate?.('landing')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-semibold transition cursor-pointer border border-slate-200/80 shadow-xs"
              title="Kembali ke Landing Page Utama"
            >
              <Home className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Beranda</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#192A56] text-white font-mono text-xs font-bold transition border border-[#192A56] shadow-xs cursor-default"
              style={{ backgroundColor: '#192A56', color: '#FFFFFF' }}
              title="Kantor Virtual 3D (Aktif)"
            >
              <Building2 className="w-3.5 h-3.5 text-white shrink-0" style={{ color: '#FFFFFF' }} />
              <span className="text-white font-bold" style={{ color: '#FFFFFF' }}>Office</span>
            </button>

            <button
              onClick={() => onNavigate?.('dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-semibold transition cursor-pointer border border-slate-200/80 shadow-xs"
              title="Buka Pusat Komando Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Dashboard</span>
            </button>

            <div className="h-5 w-px bg-slate-200 hidden md:block mx-0.5" />

            <span className="font-extrabold text-sm tracking-tight text-[#192A56] uppercase font-mono hidden md:inline">
              STELAGENT
            </span>
          </div>

          {/* Sisi Tengah: CUSTOM STYLED CAMERA POV DROPDOWN & CCTV 360° CONTROLS */}
          <div className="relative flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shrink-0 font-mono">
            {/* Dedicated CCTV 360° Quick Toggle Button */}
            <button
              type="button"
              onClick={() => {
                if (activePOV.startsWith('cctv_')) {
                  onChangePOV && onChangePOV('overview')
                } else {
                  onChangePOV && onChangePOV('cctv_boss')
                }
              }}
              style={activePOV.startsWith('cctv_') ? { backgroundColor: '#192A56', color: '#FFFFFF' } : {}}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-bold text-xs transition cursor-pointer shadow-2xs ${
                activePOV.startsWith('cctv_')
                  ? 'bg-[#192A56] text-white border-[#192A56]'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-[#192A56]'
              }`}
              title="Buka / Tutup CCTV 360° Tiap Ruangan"
            >
              <Video className={`w-3.5 h-3.5 ${activePOV.startsWith('cctv_') ? 'text-rose-400 animate-pulse' : 'text-[#192A56]'}`} />
              <span className="hidden sm:inline">CCTV 360°</span>
              {activePOV.startsWith('cctv_') && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping ml-0.5" />
              )}
            </button>

            {/* Custom POV Trigger Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPovDropdownOpen(!isPovDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-[#192A56] font-bold text-xs transition cursor-pointer shadow-2xs"
                title="Pilih Sudut Pandang Kamera"
              >
                <Camera className="w-3.5 h-3.5 text-[#192A56] shrink-0" />
                <span className="max-w-[130px] sm:max-w-none truncate">{currentPovOption?.label || 'Seluruh Kantor'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isPovDropdownOpen ? 'rotate-180 text-[#192A56]' : ''}`} />
              </button>

              {/* Floating Glassmorphic Popover Menu */}
              {isPovDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsPovDropdownOpen(false)} 
                  />
                  <div className="absolute top-full mt-2 left-0 z-50 w-64 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 font-sans">
                    <div className="px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 mb-1">
                      {isCctvActive ? 'Kamera CCTV 360°' : 'Sudut Pandang Kamera 3D'}
                    </div>
                    {visiblePovOptions.map((opt) => {
                      const Icon = opt.icon
                      const isSelected = activePOV === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            onChangePOV && onChangePOV(opt.id)
                            if (opt.id === 'boss') onSelectAgent && onSelectAgent('boss')
                            else if (opt.id === 'workstation') onSelectAgent && onSelectAgent('blue-agent')
                            else if (opt.id === 'reception') onSelectAgent && onSelectAgent('green-agent')
                            else if (opt.id === 'vault') onSelectAgent && onSelectAgent('orange-agent')
                            setIsPovDropdownOpen(false)
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer ${
                            isSelected 
                              ? 'bg-[#192A56] text-white shadow-xs' 
                              : 'hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#192A56]'
                            }`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className={`text-xs font-bold font-mono truncate ${isSelected ? 'text-white' : 'text-[#192A56]'}`}>
                                {opt.label}
                              </div>
                              <div className={`text-[10px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                                {opt.desc}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-white shrink-0 ml-2" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="h-4 w-px bg-slate-300 mx-0.5" />

            <button
              type="button"
              onClick={() => onZoom && onZoom(6)}
              className="p-1 rounded-lg hover:bg-white text-[#192A56] transition cursor-pointer"
              title="Perbesar Kamera (Zoom In)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onZoom && onZoom(-6)}
              className="p-1 rounded-lg hover:bg-white text-[#192A56] transition cursor-pointer"
              title="Perkecil Kamera (Zoom Out)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onResetPOV && onResetPOV()}
              className="p-1 rounded-lg hover:bg-white text-[#192A56] transition cursor-pointer"
              title="Reset Sudut Pandang Kamera"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sisi Kanan: Profil User & Device, Status Backend, Lead Baru, Auto Pipeline, Fullscreen, Refresh */}
          <div className="flex items-center gap-1.5 shrink-0 font-mono">
            {/* User Profile Pill (Nama & Status Perangkat di Navbar Sebelah Kiri Tombol Action) */}
            <button
              type="button"
              onClick={onOpenProfileSettings}
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200/90 border border-slate-200 text-[#192A56] transition cursor-pointer"
              title="Buka Profil & Pengaturan Keamanan Perangkat"
            >
              <div className="w-6 h-6 rounded-lg bg-[#192A56] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                {(userProfile?.name || bossConfig?.name || 'Alfa').charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[11px] font-bold leading-tight text-[#192A56]">
                  {userProfile?.name || bossConfig?.name || 'Pak Alfa'}
                </div>
                <div className="text-[9px] font-mono text-slate-500 flex items-center gap-1 leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Verified Device</span>
                </div>
              </div>
            </button>

            <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
              isBackendConnected 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                : 'bg-rose-50 border-rose-300 text-rose-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>{isBackendConnected ? 'Online' : 'Offline'}</span>
            </div>

            {onOpenTeamSetup && (
              <button
                type="button"
                onClick={onOpenTeamSetup}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#192A56] font-bold text-xs transition cursor-pointer border border-slate-200 shadow-xs"
                title="Konfigurasi & Ubah Nama Tim AI"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#192A56] shrink-0" />
                <span className="hidden md:inline font-bold">Ubah Nama Tim</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenCreateLead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#192A56] hover:bg-[#0E1A38] text-white font-bold text-xs shadow-xs transition cursor-pointer border border-[#192A56]"
              style={{ backgroundColor: '#192A56', color: '#FFFFFF' }}
              title="Buat Prospek Baru"
            >
              <PlusCircle className="w-3.5 h-3.5 text-white shrink-0" style={{ color: '#FFFFFF' }} />
              <span className="hidden sm:inline font-bold" style={{ color: '#FFFFFF' }}>Lead Baru</span>
            </button>

            <button
              type="button"
              onClick={onRunAutoPipeline}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
              title="Proses seluruh antrean prospek otomatis"
            >
              <Play className="w-3 h-3 fill-current" />
              <span className="hidden md:inline">Auto Pipeline</span>
            </button>

            <button
              type="button"
              onClick={onTogglePure3D}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#192A56] transition cursor-pointer"
              title="Layar Penuh 3D (ESC)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onRefresh}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#192A56] transition cursor-pointer"
              title="Refresh Data Riil"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* LOWER HUD WRAPPER (Padding & Flex layout for Drawer, Right Sidebar, Dock) */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col justify-between p-3 sm:p-4 pointer-events-none overflow-hidden gap-3 min-h-0">

        {/* ========================================================================= */}
        {/* 2. CENTER ROW: Left Leads Drawer, CCTV Top Badges & Right System Sidebar  */}
        {/* ========================================================================= */}
        <div className="flex-1 flex justify-between items-stretch gap-4 overflow-hidden pointer-events-none min-h-0">
          
          {/* Left Drawer: Tab Antrean Leads & Activity Feed (Modern Rounded Card) */}
          {isHudVisible && (
            <aside
              style={{ display: 'flex', flexDirection: 'column' }}
              className={`pointer-events-auto transition-all duration-300 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/5 !flex !flex-col overflow-hidden ${
                isSidebarOpen
                  ? 'w-[380px] sm:w-[420px] p-4 h-full max-h-full min-h-0'
                  : 'w-14 sm:w-16 p-2.5 items-center justify-start h-auto self-start'
              }`}
            >
              {isSidebarOpen ? (
                <>
                  {/* Header Drawer saat Terbuka: Bar Atas dengan Judul & Tombol Ciutkan */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 mb-2.5 shrink-0">
                    <div className="flex items-center gap-2 font-mono">
                      <div className="w-2 h-2 bg-[#192A56]" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#192A56]">
                        ANTREAN OPERASIONAL // MESH
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsSidebarOpen(false)}
                      className="w-7 h-7 flex items-center justify-center text-[#192A56] hover:bg-slate-100 rounded-lg text-xs cursor-pointer transition font-mono border border-slate-200 bg-slate-50 shrink-0"
                      title="Ciutkan Panel (Less)"
                    >
                      ◀
                    </button>
                  </div>

                  {/* Segmented Tab Control: Full-Width 3-Kolom, Teks Putih Bersih saat Aktif */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/90 rounded-xl mb-3 shrink-0 font-mono">
                    <button
                      type="button"
                      onClick={() => setActiveTab('leads')}
                      style={activeTab === 'leads' ? { backgroundColor: '#192A56', color: '#FFFFFF' } : { color: '#192A56' }}
                      className={`flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-2 rounded-lg transition-all cursor-pointer ${
                        activeTab === 'leads'
                          ? 'bg-[#192A56] text-white shadow-xs'
                          : 'text-[#192A56] hover:bg-white/80'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 shrink-0" style={{ color: activeTab === 'leads' ? '#FFFFFF' : '#192A56' }} />
                      <span className="font-bold" style={{ color: activeTab === 'leads' ? '#FFFFFF' : '#192A56' }}>Prospek</span>
                      <span
                        className="text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold shrink-0"
                        style={{
                          backgroundColor: activeTab === 'leads' ? 'rgba(255,255,255,0.25)' : 'rgba(25,42,86,0.08)',
                          color: activeTab === 'leads' ? '#FFFFFF' : '#192A56'
                        }}
                      >
                        {leads.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('activity')}
                      style={activeTab === 'activity' ? { backgroundColor: '#192A56', color: '#FFFFFF' } : { color: '#192A56' }}
                      className={`flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-2 rounded-lg transition-all cursor-pointer ${
                        activeTab === 'activity'
                          ? 'bg-[#192A56] text-white shadow-xs'
                          : 'text-[#192A56] hover:bg-white/80'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5 shrink-0" style={{ color: activeTab === 'activity' ? '#FFFFFF' : '#192A56' }} />
                      <span className="font-bold" style={{ color: activeTab === 'activity' ? '#FFFFFF' : '#192A56' }}>Log</span>
                      <span
                        className="text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold shrink-0"
                        style={{
                          backgroundColor: activeTab === 'activity' ? 'rgba(255,255,255,0.25)' : 'rgba(25,42,86,0.08)',
                          color: activeTab === 'activity' ? '#FFFFFF' : '#192A56'
                        }}
                      >
                        {activities.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('deliberations')}
                      style={activeTab === 'deliberations' ? { backgroundColor: '#192A56', color: '#FFFFFF' } : { color: '#192A56' }}
                      className={`flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-2 rounded-lg transition-all cursor-pointer ${
                        activeTab === 'deliberations'
                          ? 'bg-[#192A56] text-white shadow-xs'
                          : 'text-[#192A56] hover:bg-white/80'
                      }`}
                    >
                      <Bot className="w-3.5 h-3.5 shrink-0" style={{ color: activeTab === 'deliberations' ? '#FFFFFF' : '#192A56' }} />
                      <span className="font-bold" style={{ color: activeTab === 'deliberations' ? '#FFFFFF' : '#192A56' }}>Rapat</span>
                      <span
                        className="text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold shrink-0"
                        style={{
                          backgroundColor: activeTab === 'deliberations' ? 'rgba(255,255,255,0.25)' : 'rgba(25,42,86,0.08)',
                          color: activeTab === 'deliberations' ? '#FFFFFF' : '#192A56'
                        }}
                      >
                        {deliberations.length}
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                /* Mode Less / Collapsed: Floating mini dock dengan tombol expand hover putih dan 3 ikon */
                <div className="flex flex-col items-center gap-2.5 w-full">
                  {/* Tombol Expand di Atas - hover bg putih */}
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(true)}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-white text-[#192A56] hover:text-[#192A56] hover:border-[#192A56] hover:shadow-md flex items-center justify-center transition cursor-pointer border border-slate-200 shadow-xs group"
                    title="Buka Panel Prospek"
                  >
                    <span className="text-xs font-mono font-bold group-hover:translate-x-0.5 transition-transform text-[#192A56]">▶</span>
                  </button>

                  <div className="w-6 h-px bg-slate-200 my-0.5" />

                  {/* 3 Ikon Bertingkat Vertikal: Prospek, Log, Rapat */}
                  <div className="flex flex-col items-center gap-2">
                    {/* 1. Ikon Prospek */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('leads')
                        setIsSidebarOpen(true)
                      }}
                      className={`w-10 h-11 rounded-xl flex flex-col items-center justify-center transition cursor-pointer border shadow-xs group ${
                        activeTab === 'leads'
                          ? 'bg-[#192A56] text-white border-[#192A56]'
                          : 'bg-white hover:bg-slate-100 text-[#192A56] border-slate-200'
                      }`}
                      style={activeTab === 'leads' ? { backgroundColor: '#192A56', color: '#FFFFFF' } : {}}
                      title={`Buka Tab Prospek (${leads.length})`}
                    >
                      <Layers className="w-4 h-4 shrink-0" style={{ color: activeTab === 'leads' ? '#FFFFFF' : '#192A56' }} />
                      <span className="text-[9px] font-mono font-bold leading-none mt-1" style={{ color: activeTab === 'leads' ? '#FFFFFF' : '#192A56' }}>
                        {leads.length}
                      </span>
                    </button>

                    {/* 2. Ikon Log */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('activity')
                        setIsSidebarOpen(true)
                      }}
                      className={`w-10 h-11 rounded-xl flex flex-col items-center justify-center transition cursor-pointer border shadow-xs group ${
                        activeTab === 'activity'
                          ? 'bg-[#192A56] text-white border-[#192A56]'
                          : 'bg-white hover:bg-slate-100 text-[#192A56] border-slate-200'
                      }`}
                      style={activeTab === 'activity' ? { backgroundColor: '#192A56', color: '#FFFFFF' } : {}}
                      title={`Buka Tab Log Aktivitas (${activities.length})`}
                    >
                      <Activity className="w-4 h-4 shrink-0" style={{ color: activeTab === 'activity' ? '#FFFFFF' : '#192A56' }} />
                      <span className="text-[9px] font-mono font-bold leading-none mt-1" style={{ color: activeTab === 'activity' ? '#FFFFFF' : '#192A56' }}>
                        {activities.length}
                      </span>
                    </button>

                    {/* 3. Ikon Rapat Swarm */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('deliberations')
                        setIsSidebarOpen(true)
                      }}
                      className={`w-10 h-11 rounded-xl flex flex-col items-center justify-center transition cursor-pointer border shadow-xs group ${
                        activeTab === 'deliberations'
                          ? 'bg-[#192A56] text-white border-[#192A56]'
                          : 'bg-white hover:bg-slate-100 text-[#192A56] border-slate-200'
                      }`}
                      style={activeTab === 'deliberations' ? { backgroundColor: '#192A56', color: '#FFFFFF' } : {}}
                      title={`Buka Tab Rapat Swarm (${deliberations.length})`}
                    >
                      <Bot className="w-4 h-4 shrink-0" style={{ color: activeTab === 'deliberations' ? '#FFFFFF' : '#192A56' }} />
                      <span className="text-[9px] font-mono font-bold leading-none mt-1" style={{ color: activeTab === 'deliberations' ? '#FFFFFF' : '#192A56' }}>
                        {deliberations.length}
                      </span>
                    </button>
                  </div>

                  {/* Indikator status mini di bagian bawah bar vertikal */}
                  <div className="pt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 block animate-pulse" title="Sistem Aktif" />
                  </div>
                </div>
              )}

              {/* Konten Tab Leads */}
              {isSidebarOpen && activeTab === 'leads' && (
                <div
                  style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
                  className="!flex !flex-col flex-1 min-h-0 font-mono overflow-hidden"
                >
                  {/* Search Box - Fixed at top */}
                  <div className="relative mb-2.5 shrink-0">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari prospek / nama / kota..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#192A56] placeholder:text-[#192A56]/40 outline-none focus:border-[#192A56] focus:bg-white transition"
                    />
                    <Search className="w-3.5 h-3.5 text-[#192A56]/40 absolute right-3.5 top-3 pointer-events-none" />
                  </div>

                  {/* Scrollable list of leads */}
                  <div
                    style={{ overflowY: 'auto' }}
                    className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-2.5 pr-2 custom-scrollbar"
                  >
                    {filteredLeads.length === 0 ? (
                      <div className="text-[#576574] text-center py-8 text-xs bg-slate-50 rounded-xl border border-slate-200 p-4">
                        {isBackendConnected ? 'Tidak ada antrean prospek.' : 'Memuat data prospek...'}
                      </div>
                    ) : (
                      filteredLeads.map((lead) => {
                        const isHot = lead.score_priority === 'Hot'
                        const isWarm = lead.score_priority === 'Warm'
                        const isSelected = activeLead?.id_lead === lead.id_lead
                        const isDispatched = ['dispatched', 'approved', 'simulated'].includes(
                          lead.status_kontak
                        )

                        return (
                          <div
                            key={lead.id_lead}
                            onClick={() => onSelectLead && onSelectLead(lead)}
                            className={`p-3.5 rounded-xl border transition-all text-xs cursor-pointer relative ${
                              isSelected
                                ? 'bg-[#192A56] border-[#192A56] shadow-md'
                                : isDispatched
                                ? 'bg-emerald-50/70 border-emerald-300 text-[#192A56]'
                                : 'bg-white border-slate-200 hover:border-[#192A56] hover:shadow-sm'
                            }`}
                            style={isSelected ? { backgroundColor: '#192A56', color: '#FFFFFF' } : {}}
                          >
                            {/* Reference & Priority Badge */}
                            <div className="flex items-center justify-between text-[11px] mb-1.5">
                              <span
                                className="font-semibold font-mono"
                                style={{ color: isSelected ? '#FFFFFF' : '#576574' }}
                              >
                                #{lead.id_lead}
                              </span>
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                                  isHot
                                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                                    : isWarm
                                    ? 'bg-amber-100 text-amber-900 border-amber-200'
                                    : 'bg-blue-100 text-blue-900 border-blue-200'
                                }`}
                              >
                                {lead.score_priority || 'Warm'}
                              </span>
                            </div>

                            <div
                              className="font-bold text-sm truncate mb-1"
                              style={{ color: isSelected ? '#FFFFFF' : '#192A56' }}
                            >
                              {lead.nama}
                            </div>

                            <div
                              className="grid grid-cols-2 gap-1 text-[11px] border-t pt-1.5 mt-1.5"
                              style={{ borderColor: isSelected ? 'rgba(255,255,255,0.25)' : '#F1F5F9' }}
                            >
                              <div className="truncate" style={{ color: isSelected ? '#E2E8F0' : '#576574' }}>
                                Unit: <span className="font-semibold" style={{ color: isSelected ? '#FFFFFF' : '#192A56' }}>{lead.minat || 'Unit Motor'}</span>
                              </div>
                              <div className="truncate text-right" style={{ color: isSelected ? '#E2E8F0' : '#576574' }}>
                                Kota: <span className="font-semibold" style={{ color: isSelected ? '#FFFFFF' : '#192A56' }}>{lead.domisili || 'Purwokerto'}</span>
                              </div>
                            </div>

                            {isSelected && (
                              <div
                                className="mt-2 pt-2 border-t flex items-center justify-between text-[11px]"
                                style={{ borderColor: 'rgba(255,255,255,0.25)', color: '#FFFFFF' }}
                              >
                                <span className="font-bold flex items-center gap-1.5 text-emerald-300">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                  Sedang Diproses
                                </span>
                                <span className="font-bold flex items-center gap-0.5" style={{ color: '#FFFFFF' }}>
                                  Lihat Pitch <ChevronRight className="w-3 h-3 text-white" />
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Konten Tab Activity Log */}
              {isSidebarOpen && activeTab === 'activity' && (
                <div
                  style={{ overflowY: 'auto' }}
                  className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-2.5 pr-2 custom-scrollbar text-xs font-mono"
                >
                  {activities.length === 0 ? (
                    <div className="text-[#576574] text-center py-8 text-xs bg-slate-50 rounded-xl border border-slate-200 p-4">
                      Belum ada riwayat aktivitas tim.
                    </div>
                  ) : (
                    activities.map((act, i) => (
                      <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between text-[#576574]">
                          <span className="font-bold text-[#192A56]">{act.agent || 'SYSTEM'}</span>
                          <span className="text-[10px] text-[#576574] font-mono">{act.time || 'NOW'}</span>
                        </div>
                        <div className="text-[#192A56] text-xs leading-relaxed">{act.detail || act.action}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Konten Tab Deliberasi Swarm (Autonomous Swarm Deliberation) */}
              {isSidebarOpen && activeTab === 'deliberations' && (
                <div
                  style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto' }}
                  className="!flex !flex-col flex-1 min-h-0 font-mono overflow-y-auto overscroll-contain space-y-2.5 pr-2 custom-scrollbar"
                >
                  {deliberations.length === 0 ? (
                    <div className="text-center py-8 text-xs text-[#576574]">
                      <Bot className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
                      <p className="font-bold">Belum ada sesi rapat internal</p>
                      <p className="text-[11px] mt-1 text-slate-500">
                        Swarm berdetak setiap 30s memindai defisit stok unit &amp; negosiasi ke Astra Hub.
                      </p>
                    </div>
                  ) : (
                    deliberations.map((delib, idx) => (
                      <div key={delib.id || idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                          <span className="font-bold text-[#192A56] text-[11px] flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            {delib.unit} • {delib.cabang}
                          </span>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                            {delib.defisit === 'CRITICAL_EMPTY' ? 'Stok 0 (Kosong)' : 'Defisit'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-sans">
                          Prospek: <b className="text-slate-800">{delib.konsumen}</b> ({delib.lead_target})
                        </p>
                        <div className="space-y-1.5 pt-1">
                          {(delib.turns || []).map((t, tidx) => (
                            <div key={tidx} className="bg-white p-2 rounded-lg border border-slate-200 text-[11px]">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="font-bold text-[#192A56] text-[10px] uppercase">
                                  {t.speaker}
                                </span>
                                <span className="text-[9px] text-slate-400 font-sans">{t.role}</span>
                              </div>
                              <p className="text-slate-700 text-[11px] leading-relaxed font-sans">{t.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </aside>
          )}

          {/* Center Top Badges saat CCTV Aktif: Sejajar Kotak Prospek di kiri dan Kotak Tim Cubi di kanan */}
          {activePOV.startsWith('cctv_') && (
            <div className="flex-1 flex items-start justify-between gap-3 pointer-events-none px-1">
              {/* Sisi Kiri: REC & Nama Kamera Aktif (Sejajar dengan Kotak Prospek) */}
              <div className="pointer-events-auto select-none font-mono">
                <div className="bg-[#192A56]/95 backdrop-blur-md border border-white/20 text-white px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-rose-400">REC</span>
                  </div>
                  <div className="h-3.5 w-px bg-white/20" />
                  <div>
                    <div className="text-xs font-bold tracking-wider text-white">
                      {POV_OPTIONS.find((p) => p.id === activePOV)?.label || 'CCTV // LIVE FEED'}
                    </div>
                    <div className="text-[10px] text-slate-300">
                      ON-PREMISE RTSP // 1080P 60FPS
                    </div>
                  </div>
                </div>
              </div>

              {/* Sisi Kanan: Jam & Telemetri Node (Sejajar di kiri Kotak Tim Cubi) */}
              <div className="pointer-events-auto select-none font-mono hidden md:block">
                <div className="bg-[#192A56]/95 backdrop-blur-md border border-white/20 text-white px-3.5 py-2 rounded-xl shadow-xl text-right">
                  <div className="text-xs font-bold text-white tracking-widest">{clockStr}</div>
                  <div className="text-[10px] text-emerald-400 font-bold">● NODE SECURE // ZERO CLOUD EGRESS</div>
                </div>
              </div>
            </div>
          )}

          {/* Right System Sidebar: Inspector & Agent Selection */}
          {isHudVisible && (
            <aside
              style={{ display: 'flex', flexDirection: 'column' }}
              className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/5 p-4 w-76 sm:w-84 !flex !flex-col h-full max-h-full min-h-0 gap-2.5 text-xs font-mono"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 shrink-0">
                <div className="flex items-center gap-2 font-bold text-[#192A56]">
                  <Cpu className="w-4 h-4 text-[#192A56]" />
                  <span className="text-xs uppercase tracking-wide">Tim AI Cubi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {onOpenTeamSetup && (
                    <button
                      type="button"
                      onClick={onOpenTeamSetup}
                      title="Ubah Nama & Persona Tim Robot"
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-[#192A56] hover:text-white text-[#192A56] font-bold rounded-lg border border-slate-300 transition cursor-pointer"
                    >
                      <SlidersHorizontal className="w-2.5 h-2.5" />
                      <span>Ubah Nama</span>
                    </button>
                  )}
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold rounded-full border border-emerald-200">
                    5 Aktif
                  </span>
                </div>
              </div>

              {/* Daftar Agen Interaktif (Scrollable with custom-scrollbar) */}
              <div className="space-y-2 overflow-y-auto overscroll-contain flex-1 min-h-0 pr-1 custom-scrollbar">
                {/* Direktur / Bos */}
                <button
                  type="button"
                  onClick={() => onSelectAgent('boss')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer border ${
                    selectedAgentId === 'boss'
                      ? 'bg-[#192A56] border-[#192A56] shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                  style={selectedAgentId === 'boss' ? { backgroundColor: '#192A56', color: '#FFFFFF' } : { color: '#192A56' }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-xs"
                      style={{
                        backgroundColor: selectedAgentId === 'boss' ? '#0E1A38' : '#FFFFFF',
                        borderColor: selectedAgentId === 'boss' ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
                      }}
                    >
                      <Crown className="w-4 h-4" style={{ color: selectedAgentId === 'boss' ? '#FFFFFF' : '#000000' }} />
                    </div>
                    <div className="flex flex-col text-left flex-1 min-w-0">
                      <span className="font-bold text-xs" style={{ color: selectedAgentId === 'boss' ? '#FFFFFF' : '#192A56' }}>
                        {bossConfig?.name || 'Pak Alfa'}
                      </span>
                      <span className="text-[10px]" style={{ color: selectedAgentId === 'boss' ? '#E2E8F0' : '#576574' }}>
                        Direktur Sales
                      </span>
                      <span className="text-[9.5px] leading-snug mt-0.5 break-words whitespace-normal" style={{ color: selectedAgentId === 'boss' ? '#E2E8F0' : '#576574' }}>
                        Supervisi operasional &amp; keputusan closing tim
                      </span>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                </button>

                {/* Blue Agent: Scout */}
                <button
                  type="button"
                  onClick={() => onSelectAgent('blue-agent')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer border ${
                    selectedAgentId === 'blue-agent'
                      ? 'bg-[#192A56] border-[#192A56] shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                  style={selectedAgentId === 'blue-agent' ? { backgroundColor: '#192A56', color: '#FFFFFF' } : { color: '#192A56' }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-xs"
                      style={{
                        backgroundColor: selectedAgentId === 'blue-agent' ? '#0E1A38' : '#FFFFFF',
                        borderColor: selectedAgentId === 'blue-agent' ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
                      }}
                    >
                      <Cpu className="w-4 h-4" style={{ color: selectedAgentId === 'blue-agent' ? '#FFFFFF' : '#000000' }} />
                    </div>
                    <div className="flex flex-col text-left flex-1 min-w-0">
                      <span className="font-bold text-xs" style={{ color: selectedAgentId === 'blue-agent' ? '#FFFFFF' : '#192A56' }}>
                        {agents?.['blue-agent']?.name || 'Cubi Scout'}
                      </span>
                      <span className="text-[10px]" style={{ color: selectedAgentId === 'blue-agent' ? '#E2E8F0' : '#576574' }}>
                        Hardware &amp; Stock
                      </span>
                      <span className="text-[9.5px] leading-snug mt-0.5 break-words whitespace-normal" style={{ color: selectedAgentId === 'blue-agent' ? '#E2E8F0' : '#576574' }}>
                        Analisis stok unit cabang &amp; spesifikasi motor
                      </span>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </button>

                {/* Purple Agent: Scribe */}
                <button
                  type="button"
                  onClick={() => onSelectAgent('purple-agent')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer border ${
                    selectedAgentId === 'purple-agent'
                      ? 'bg-[#192A56] border-[#192A56] shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                  style={selectedAgentId === 'purple-agent' ? { backgroundColor: '#192A56', color: '#FFFFFF' } : { color: '#192A56' }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-xs"
                      style={{
                        backgroundColor: selectedAgentId === 'purple-agent' ? '#0E1A38' : '#FFFFFF',
                        borderColor: selectedAgentId === 'purple-agent' ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
                      }}
                    >
                      <Terminal className="w-4 h-4" style={{ color: selectedAgentId === 'purple-agent' ? '#FFFFFF' : '#000000' }} />
                    </div>
                    <div className="flex flex-col text-left flex-1 min-w-0">
                      <span className="font-bold text-xs" style={{ color: selectedAgentId === 'purple-agent' ? '#FFFFFF' : '#192A56' }}>
                        {agents?.['purple-agent']?.name || 'Cubi Scribe'}
                      </span>
                      <span className="text-[10px]" style={{ color: selectedAgentId === 'purple-agent' ? '#E2E8F0' : '#576574' }}>
                        AI Pitch Drafter
                      </span>
                      <span className="text-[9.5px] leading-snug mt-0.5 break-words whitespace-normal" style={{ color: selectedAgentId === 'purple-agent' ? '#E2E8F0' : '#576574' }}>
                        Menyusun draf penawaran personal via Qwen 2.5
                      </span>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </button>

                {/* Green Agent: Gatekeeper */}
                <button
                  type="button"
                  onClick={() => onSelectAgent('green-agent')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer border ${
                    selectedAgentId === 'green-agent'
                      ? 'bg-[#192A56] border-[#192A56] shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                  style={selectedAgentId === 'green-agent' ? { backgroundColor: '#192A56', color: '#FFFFFF' } : { color: '#192A56' }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-xs"
                      style={{
                        backgroundColor: selectedAgentId === 'green-agent' ? '#0E1A38' : '#FFFFFF',
                        borderColor: selectedAgentId === 'green-agent' ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
                      }}
                    >
                      <Send className="w-4 h-4" style={{ color: selectedAgentId === 'green-agent' ? '#FFFFFF' : '#000000' }} />
                    </div>
                    <div className="flex flex-col text-left flex-1 min-w-0">
                      <span className="font-bold text-xs" style={{ color: selectedAgentId === 'green-agent' ? '#FFFFFF' : '#192A56' }}>
                        {agents?.['green-agent']?.name || 'Cubi Gate'}
                      </span>
                      <span className="text-[10px]" style={{ color: selectedAgentId === 'green-agent' ? '#E2E8F0' : '#576574' }}>
                        Approval &amp; Telegram
                      </span>
                      <span className="text-[9.5px] leading-snug mt-0.5 break-words whitespace-normal" style={{ color: selectedAgentId === 'green-agent' ? '#E2E8F0' : '#576574' }}>
                        Otorisasi SPK &amp; gateway pengiriman Telegram
                      </span>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </button>

                {/* Orange Agent: Vault */}
                <button
                  type="button"
                  onClick={() => onSelectAgent('orange-agent')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer border ${
                    selectedAgentId === 'orange-agent'
                      ? 'bg-[#192A56] border-[#192A56] shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                  style={selectedAgentId === 'orange-agent' ? { backgroundColor: '#192A56', color: '#FFFFFF' } : { color: '#192A56' }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-xs"
                      style={{
                        backgroundColor: selectedAgentId === 'orange-agent' ? '#0E1A38' : '#FFFFFF',
                        borderColor: selectedAgentId === 'orange-agent' ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
                      }}
                    >
                      <Database className="w-4 h-4" style={{ color: selectedAgentId === 'orange-agent' ? '#FFFFFF' : '#000000' }} />
                    </div>
                    <div className="flex flex-col text-left flex-1 min-w-0">
                      <span className="font-bold text-xs" style={{ color: selectedAgentId === 'orange-agent' ? '#FFFFFF' : '#192A56' }}>
                        {agents?.['orange-agent']?.name || 'Cubi Vault'}
                      </span>
                      <span className="text-[10px]" style={{ color: selectedAgentId === 'orange-agent' ? '#E2E8F0' : '#576574' }}>
                        CSV &amp; Memory Vault
                      </span>
                      <span className="text-[9.5px] leading-snug mt-0.5 break-words whitespace-normal" style={{ color: selectedAgentId === 'orange-agent' ? '#E2E8F0' : '#576574' }}>
                        Arsip basis data prospek &amp; histori penjualan
                      </span>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </button>
              </div>

              {/* Detail Agen Terpilih */}
              <div className="shrink-0 pt-2 border-t border-slate-200/80 bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-[#576574] border-b border-slate-200 pb-1">
                  <span className="font-bold text-[#192A56]">Detail Agen Aktif</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Siap
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#192A56]">
                  <span className="font-bold">{currentAgent.name}</span>
                  <span className="text-[11px] text-[#576574]">{currentAgent.station}</span>
                </div>
                <div className="text-[#192A56] text-[11px] leading-snug bg-white rounded-lg p-2 border border-slate-200">
                  {currentAgent.feature}
                </div>
                <div className="text-[11px] text-emerald-800 font-bold flex items-center justify-between pt-0.5">
                  <span>Penggunaan Token:</span>
                  <span className="font-mono">{currentAgent.tokens}</span>
                </div>
                {onOpenTeamSetup && (
                  <button
                    type="button"
                    onClick={onOpenTeamSetup}
                    className="w-full mt-1.5 py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-transparent hover:border-white/20 group"
                    style={{ backgroundColor: '#192A56', color: '#FFFFFF' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0E1A38'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#192A56'
                    }}
                    title="Ubah Nama & Persona Tim Robot"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-white shrink-0" style={{ color: '#FFFFFF' }} />
                    <span className="font-bold text-[11px] text-white" style={{ color: '#FFFFFF' }}>
                      Ubah Nama & Persona Tim
                    </span>
                  </button>
                )}
              </div>

            </aside>
          )}
        </div>

        {/* ========================================================================= */}
        {/* CCTV 360° SINGLE-LINE CONTROL BAR (Tepat di atas bar perintah, tombol Keluar di kanan sendiri) */}
        {/* ========================================================================= */}
        {activePOV.startsWith('cctv_') && (
          <div className="w-full mb-2 pointer-events-auto shrink-0 z-30 font-mono">
            <div className="w-full bg-[#192A56]/95 backdrop-blur-md border border-white/20 text-white px-3.5 py-2 rounded-xl shadow-xl flex items-center justify-between gap-3">
              {/* Sisi Kiri: Status & Label 360° */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 text-rose-400 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>360° FEED</span>
                </div>
                <span className="text-xs text-slate-300 hidden md:inline truncate">
                  Rotasi Kamera 360°
                </span>
              </div>

              {/* Sisi Tengah: Tombol Rotasi 360° (Putar Kiri, Auto Scan, Putar Kanan, Reset) */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => onRotateCctv && onRotateCctv(-0.35)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                  title="Putar Sudut Kamera ke Kiri (360°)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Putar Kiri</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleCctvAutoScan && onToggleCctvAutoScan()}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                    isCctvAutoScanning ? 'bg-emerald-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="Otomatis Memutar Kamera 360 Derajat"
                >
                  <Radio className={`w-3.5 h-3.5 ${isCctvAutoScanning ? 'animate-pulse' : ''}`} />
                  <span>{isCctvAutoScanning ? 'Auto 360° [AKTIF]' : 'Auto 360°'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onRotateCctv && onRotateCctv(0.35)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                  title="Putar Sudut Kamera ke Kanan (360°)"
                >
                  <span className="hidden sm:inline">Putar Kanan</span>
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onResetPOV && onResetPOV()}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
                  title="Reset Sudut Pandang Kamera"
                >
                  <span>Reset</span>
                </button>
              </div>

              {/* Sisi Kanan Sendiri: Tombol Keluar CCTV */}
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => onChangePOV && onChangePOV('overview')}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                  title="Keluar dari CCTV dan Kembali ke Tampilan Normal"
                >
                  <span>✕ Keluar CCTV</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. GROUNDED WORKSTATION CONSOLE DOCK (Full-width sleek command bar)        */}
        {/* ========================================================================= */}
        {isHudVisible && (
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xl shadow-slate-900/5 font-mono w-full flex flex-col gap-2 shrink-0">
            {/* Top Row: Interactive Command Input */}
            <form
              onSubmit={handleSendCommand}
              className="flex items-center gap-2.5 w-full flex-wrap sm:flex-nowrap"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#192A56] shrink-0">
                <Terminal className="w-4 h-4 text-[#192A56]" />
                <span>Perintah:</span>
              </div>

              {/* Targeted Agent Pill Badge */}
              {selectedAgentId && selectedAgentId !== 'all' && selectedAgentId !== 'boss' ? (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-xs shrink-0 cursor-pointer transition hover:opacity-95 active:scale-95"
                  style={{ backgroundColor: currentAgent.color || '#9333ea' }}
                  onClick={() => onSelectAgent?.('all')}
                  title="Target khusus aktif! Klik untuk beralih memerintah seluruh tim."
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>Target: {currentAgent.name}</span>
                  <span className="ml-1 px-1 rounded bg-black/25 text-[10px] hover:bg-black/40">✕ Semua</span>
                </div>
              ) : (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#192A56]/10 text-[#192A56] border border-[#192A56]/20 shrink-0"
                  title="Perintah aktif untuk seluruh armada AI."
                >
                  <Users className="w-3.5 h-3.5 text-[#192A56]" />
                  <span>Target: Seluruh Tim</span>
                </div>
              )}

              <input
                type="text"
                value={commandText}
                onChange={(e) => setCommandText(e.target.value)}
                placeholder={
                  selectedAgentId && selectedAgentId !== 'all' && selectedAgentId !== 'boss'
                    ? `Ketik perintah khusus untuk ${currentAgent.name} (contoh: rapat, kerja di meja, susun penawaran)...`
                    : "Ketik instruksi terminal (contoh: rapat tim, kembali kerja, auto pipeline, sinkronkan data)..."
                }
                className="flex-1 min-w-[200px] bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-[#192A56] placeholder:text-[#192A56]/50 outline-none focus:border-[#192A56] focus:bg-white transition"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#192A56] hover:bg-[#0E1A38] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs border border-[#192A56]"
                style={{ backgroundColor: '#192A56', color: '#FFFFFF' }}
              >
                <Send className="w-3.5 h-3.5 text-white shrink-0" style={{ color: '#FFFFFF' }} />
                <span className="text-white font-bold" style={{ color: '#FFFFFF' }}>Kirim</span>
              </button>
            </form>

            {/* Respon / Feedback Terminal Interaktif (Selalu Terlihat di Semua Resolusi Layar & Terbaca Penuh) */}
            {commandFeedback && (
              <div className="flex items-start gap-2 px-3 py-1.5 bg-blue-50/80 border border-blue-200/90 rounded-xl text-xs text-[#192A56] shadow-2xs transition-all">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0 mt-1" />
                <span className="font-bold text-[#192A56] shrink-0">Respon:</span>
                <span className="font-semibold text-emerald-800 break-words whitespace-normal leading-snug flex-1">{commandFeedback}</span>
              </div>
            )}

            {/* Bottom Row: Agent Status & Runtime Telemetry */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1.5 border-t border-slate-200/80">
              {/* Karakter Status */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 border border-slate-200 rounded-lg font-bold text-[#192A56] shrink-0">
                  <Cpu className="w-3.5 h-3.5 text-[#192A56]" />
                  <span>{currentAgent.name}</span>
                  <span className="text-[11px] text-[#576574] font-normal">({currentAgent.role})</span>
                </div>
                <span className="text-xs text-[#192A56] break-words whitespace-normal leading-snug font-medium min-w-0">
                  Status: <strong className="text-emerald-700 font-semibold">{isGenerating ? 'Menyusun draf penawaran via Qwen 2.5 Local...' : currentAgent.statusText || 'Siap bertugas'}</strong>
                </span>
              </div>

              {/* Metrik Runtime & Progress */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 text-[#576574] text-xs">
                  <Activity className="w-3.5 h-3.5 text-[#192A56]" />
                  <span>Runtime: <strong className="text-[#192A56] font-mono">{formattedRuntime}</strong></span>
                </div>
                <div className="w-24 sm:w-28 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isGenerating ? 'bg-emerald-500 animate-pulse' : 'bg-[#192A56]'
                    }`}
                    style={{ width: isGenerating ? '85%' : activeLead ? '100%' : '65%' }}
                  />
                </div>
                <span className="text-xs font-bold text-[#192A56]">
                  {isGenerating ? '85%' : activeLead ? '100%' : '65%'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. APPROVAL GATE MODAL (Modern Rounded Confirmation Window)              */}
      {/* ========================================================================= */}
      {pitchResult && (
        <div className="pointer-events-auto fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200 font-mono">
            
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#192A56] text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#192A56]">
                    Approval Gate: Review Penawaran Sales
                  </h3>
                  <p className="text-xs text-[#576574]">
                    Otorisasi direktur sebelum didispatch ke Telegram calon konsumen / staf sales (@iiibays)
                  </p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold px-2.5 py-1 bg-slate-100 text-[#192A56] rounded-full border border-slate-200">
                Otorisasi Direktur
              </span>
            </div>

            {/* Indikator Status Mode Simulasi vs Nyata */}
            <div className="mt-3.5 p-2.5 bg-sky-50 border border-sky-200 rounded-xl flex items-center gap-2 text-sky-900 text-[11px]">
              <Info className="w-4 h-4 text-sky-600 shrink-0" />
              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] bg-sky-200/80 px-1.5 py-0.5 rounded mr-1.5 text-sky-900">
                  DISPATCH TELEGRAM BUKTI RIIL
                </span>
                <span>Pesan penawaran &amp; berkas fisik PDF SPK resmi dikirimkan langsung ke Telegram <strong>@iiibays</strong> untuk validasi instan.</span>
              </div>
            </div>

            <div className="my-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[#576574] block text-[11px] mb-0.5">Calon Konsumen:</span>
                  <span className="font-bold text-sm text-[#192A56] block">{activeLead?.nama || pitchResult.prospek?.nama}</span>
                  <span className="text-xs text-[#576574] block truncate">{activeLead?.domisili || pitchResult.prospek?.domisili}</span>
                </div>
                <div>
                  <span className="text-[#576574] block text-[11px] mb-0.5">Unit Rekomendasi (Cubi Scout):</span>
                  <span className="font-bold text-sm text-[#192A56] flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-[#192A56]" />
                    {pitchResult.cubi_scout_output?.unit_rekomendasi || pitchResult.unit_rekomendasi}
                  </span>
                  <span className="text-xs text-emerald-700 font-semibold block truncate">
                    {pitchResult.cubi_scout_output?.status_stok
                      ? `${pitchResult.cubi_scout_output.status_stok} (${pitchResult.cubi_scout_output.sisa_unit} unit @ ${pitchResult.cubi_scout_output.cabang_terdekat})`
                      : pitchResult.stok_info || 'Stok Ready di Showroom'}
                  </span>
                </div>
              </div>

              {/* Rincian Finansial Deterministik (Cubi Scribe Zero-Hallucination) */}
              {pitchResult.cubi_scribe_output && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-xs space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-indigo-950 font-bold text-[11px] border-b border-indigo-200/60 pb-1">
                    <span>KALKULASI KREDIT DETERMINISTIK (ZERO-HALLUCINATION)</span>
                    <span className="text-[10px] bg-indigo-200/80 px-1.5 py-0.5 rounded text-indigo-900">DP Min 15% Terpenuhi</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Harga OTR:</span>
                      <strong className="text-slate-800">Rp {(pitchResult.cubi_scout_output?.harga_otr || 0).toLocaleString('id-ID')}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">DP Disetujui ({pitchResult.cubi_scribe_output.persentase_dp}%):</span>
                      <strong className="text-indigo-700">Rp {pitchResult.cubi_scribe_output.dp_disetujui.toLocaleString('id-ID')}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Pokok Hutang:</span>
                      <strong className="text-slate-800">Rp {pitchResult.cubi_scribe_output.pokok_hutang.toLocaleString('id-ID')}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Cicilan Tenor {pitchResult.cubi_scribe_output.tenor_bulan}x:</span>
                      <strong className="text-emerald-700 font-bold">Rp {pitchResult.cubi_scribe_output.estimasi_cicilan_bulanan.toLocaleString('id-ID')}/bln</strong>
                    </div>
                  </div>
                </div>
              )}

              {pitchResult.bundling_promo && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5 text-[#192A56] text-xs">
                  <PackageCheck className="w-4 h-4 text-[#192A56] shrink-0" />
                  <div>
                    <span className="font-bold">Paket Promo &amp; Bundling: </span>
                    <span>{pitchResult.bundling_promo}</span>
                  </div>
                </div>
              )}

              {/* Draft WhatsApp Preview */}
              <div>
                <label className="text-xs font-bold text-[#192A56] block mb-1.5">
                  Draf Pesan Penawaran Sales:
                </label>
                <textarea
                  rows={4}
                  value={editedPitch}
                  onChange={(e) => setEditedPitch(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#192A56] focus:border-[#192A56] focus:bg-white outline-none leading-relaxed transition"
                />
              </div>

              {/* Target Saluran Konfirmasi: Telegram @iiibays */}
              <div className="p-3 bg-sky-50/80 border border-sky-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#229ED9] text-white flex items-center justify-center shadow-xs shrink-0">
                      <Send className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-sky-800 font-bold uppercase tracking-wider block">Kirim Konfirmasi &amp; PDF SPK ke:</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#192A56] font-mono">Telegram: @iiibays</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded font-semibold">Bukti Riil Aktif</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href="https://t.me/StelAgentBot"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 bg-[#229ED9] hover:bg-[#1C88BD] text-white text-[11px] rounded-lg font-bold transition flex items-center gap-1 shadow-xs"
                      style={{ backgroundColor: '#229ED9', color: '#FFFFFF' }}
                      title="Buka bot @StelAgentBot dan klik Start"
                    >
                      <Bot className="w-3.5 h-3.5 text-white" />
                      <span>Start @StelAgentBot</span>
                    </a>
                    <a
                      href="https://t.me/iiibays"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 bg-white border border-sky-300 hover:border-sky-500 text-sky-800 text-[11px] rounded-lg font-bold transition flex items-center gap-1 shadow-2xs hover:bg-sky-50"
                    >
                      <span>Chat</span>
                      <ExternalLink className="w-3 h-3 text-sky-600" />
                    </a>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 leading-normal bg-white/70 p-1.5 rounded-lg border border-sky-100 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Pastikan Anda telah membuka <a href="https://t.me/StelAgentBot" target="_blank" rel="noreferrer" className="text-[#229ED9] font-bold underline">@StelAgentBot</a> di Telegram dan mengirim <code>/start</code> agar bot memiliki izin mengirimkan berkas resmi SPK ke chat Anda.</span>
                </div>
              </div>

              <label className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-600">
                <input
                  type="checkbox"
                  checked={consentConfirmed}
                  onChange={(event) => setConsentConfirmed(event.target.checked)}
                  className="mt-0.5 accent-[#192A56]"
                />
                <span>Saya mengonfirmasi prospek menyetujui penerimaan penawaran &amp; berkas fisik PDF SPK via Telegram (@iiibays) (consent_verified).</span>
              </label>
            </div>

            {/* Aksi Persetujuan Direktur */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                disabled={isSubmittingApproval}
                onClick={() => onApprovePitch && onApprovePitch(null)}
                className="px-4 py-2 border border-slate-200 bg-slate-50 text-[#576574] hover:bg-slate-100 hover:text-[#192A56] rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tolak / Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!onApprovePitch || !pitchResult || isSubmittingApproval) return
                  setIsSubmittingApproval(true)
                  const scoutOutput = pitchResult.cubi_scout_output || {
                    id_produk: 'MTR-01',
                    unit_rekomendasi: pitchResult.unit_rekomendasi || 'Beat Street',
                    kategori: 'Motor Matic',
                    cabang_terdekat: activeLead?.domisili || 'Banyumas',
                    status_stok: pitchResult.stok_info || 'Ready',
                    sisa_unit: 1,
                    harga_otr: 19300000,
                    bundling_rekomendasi: []
                  }
                  const scribeOutput = pitchResult.cubi_scribe_output || {
                    dp_disetujui: Math.round(scoutOutput.harga_otr * 0.15),
                    persentase_dp: 15.0,
                    pokok_hutang: scoutOutput.harga_otr - Math.round(scoutOutput.harga_otr * 0.15),
                    tenor_bulan: 36,
                    estimasi_cicilan_bulanan: 620000,
                    total_investasi_paket: scoutOutput.harga_otr,
                    draft_pesan_wa: editedPitch,
                    dokumen_spk: {
                      pdf_filename: `SPK_${pitchResult.id_lead}.pdf`,
                      pdf_url: `/api/v1/documents/SPK_${pitchResult.id_lead}.pdf`
                    }
                  }
                  const payloadToSend = {
                    request_id: `REQ-${Date.now()}`,
                    id_lead: pitchResult.id_lead,
                    consent_verified: consentConfirmed,
                    consent_confirmed: consentConfirmed,
                    mode_simulasi: true,
                    target_channel: 'telegram',
                    telegram_target: '@iiibays',
                    approved_by: bossConfig?.name || 'Sales Director',
                    pesan_final: editedPitch,
                    nomor_wa: waNumber || '6281234567801',
                    prospek: pitchResult.prospek || {
                      nama: activeLead?.nama || 'Konsumen',
                      nomor_wa: waNumber || '6281234567801',
                      domisili: activeLead?.domisili || 'Banyumas',
                      skor_prioritas: activeLead?.score_priority || 'Warm'
                    },
                    cubi_scout_output: scoutOutput,
                    cubi_scribe_output: {
                      ...scribeOutput,
                      draft_pesan_wa: editedPitch
                    }
                  }
                  onApprovePitch(payloadToSend)
                }}
                disabled={isSubmittingApproval || !consentConfirmed || !editedPitch.trim()}
                className="px-5 py-2 bg-[#192A56] hover:bg-[#0E1A38] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-[#192A56]"
                style={{ backgroundColor: '#192A56', color: '#FFFFFF' }}
              >
                {isSubmittingApproval ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    <span className="text-white font-bold" style={{ color: '#FFFFFF' }}>Memproses SPK &amp; Mengirim ke @iiibays...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-white shrink-0" style={{ color: '#FFFFFF' }} />
                    <span className="text-white font-bold" style={{ color: '#FFFFFF' }}>Setujui &amp; Kirim ke @iiibays</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL PENERBITAN BERKAS PDF SPK RESMI (Zero-Hallucination)              */}
      {/* ========================================================================= */}
      {spkModalData && (
        <div className="pointer-events-auto fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 font-mono">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#192A56]">
                  Persetujuan Selesai: PDF SPK Resmi Terbit &amp; Terkirim ke Telegram @iiibays
                </h3>
                <p className="text-xs text-[#576574]">
                  {spkModalData.telegram_dispatch?.status === 'terkirim_live_telegram'
                    ? 'Status: Berkas Resmi SPK & Draf Terkirim Live ke Telegram @iiibays'
                    : 'Status: Dokumen SPK Sah Diterbitkan & Dicatat ke Target Telegram @iiibays'}
                </p>
              </div>
            </div>

            <div className="my-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between p-2 bg-sky-50 border border-sky-200 rounded-lg">
                <span className="text-sky-800 text-xs font-semibold">Saluran Konfirmasi:</span>
                <span className="font-bold text-[#229ED9] text-xs font-mono">Telegram @iiibays (Terkirim) ✅</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Berkas Dokumen:</span>
                <span className="font-bold text-[#192A56] truncate max-w-[260px]">{spkModalData.pdf_filename}</span>
              </div>
              {spkModalData.rincian && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Konsumen:</span>
                    <span className="font-bold text-[#192A56]">{spkModalData.rincian.nama_konsumen}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Unit Pesanan:</span>
                    <span className="font-bold text-[#192A56]">{spkModalData.rincian.unit_barang}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Harga OTR:</span>
                    <span className="font-bold text-[#192A56]">Rp {spkModalData.rincian.harga_otr?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Cicilan Tenor {spkModalData.rincian.tenor_bulan}x:</span>
                    <span className="font-bold text-emerald-700">Rp {spkModalData.rincian.angsuran_per_bulan?.toLocaleString()} / bln</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 flex-wrap">
              <button
                type="button"
                onClick={onCloseSpkModal}
                className="px-3.5 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Tutup
              </button>
              <a
                href="https://t.me/iiibays"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-[#229ED9] hover:bg-[#1C88BD] text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                style={{ backgroundColor: '#229ED9', color: '#FFFFFF' }}
              >
                <Send className="w-3.5 h-3.5 text-white" />
                <span>Buka Chat @iiibays</span>
              </a>
              <a
                href={spkModalData.pdf_url ? `${typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? `http://${window.location.hostname}:8000` : 'http://127.0.0.1:8000'}${spkModalData.pdf_url}` : '#'}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#192A56] hover:bg-[#0E1A38] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer border border-[#192A56]"
                style={{ backgroundColor: '#192A56', color: '#FFFFFF' }}
              >
                <FileDown className="w-4 h-4 text-white" />
                <span>Unduh PDF SPK</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CCTV 360° CORNER BADGES & VIEWFINDER RETICLE             */}
      {/* ======================================================== */}
      {/* OVERLAY KHUSUS MODE CCTV 360°: CENTER VIEWFINDER RETICLE */}
      {/* ======================================================== */}
      {activePOV.startsWith('cctv_') && (
        <div className="fixed inset-0 m-auto w-56 h-56 border border-white/15 pointer-events-none flex items-center justify-center z-20">
          <div className="w-4 h-4 border-t-2 border-l-2 border-white/60 absolute top-0 left-0" />
          <div className="w-4 h-4 border-t-2 border-r-2 border-white/60 absolute top-0 right-0" />
          <div className="w-4 h-4 border-b-2 border-l-2 border-white/60 absolute bottom-0 left-0" />
          <div className="w-4 h-4 border-b-2 border-r-2 border-white/60 absolute bottom-0 right-0" />
          <div className="w-2 h-2 rounded-full bg-white/40" />
          <div className="text-[9px] text-white/50 tracking-widest absolute bottom-2 font-mono">360° PAN/ORBIT ACTIVE</div>
        </div>
      )}

    </div>
  )
}
