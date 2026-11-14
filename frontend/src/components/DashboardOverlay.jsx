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
  SlidersHorizontal
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
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('leads') // 'leads' | 'activity'
  const [editedPitch, setEditedPitch] = useState('')
  const [waNumber, setWaNumber] = useState('081234567890')
  const [consentConfirmed, setConsentConfirmed] = useState(false)
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
  }, [pitchResult])

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
      'green-agent': { station: 'Meja Resepsionis', feature: 'WhatsApp Cloud Gateway', tokens: '8,920 tok' },
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
              AICREW
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
        <div className="flex-1 flex justify-between items-start gap-4 overflow-hidden pointer-events-none min-h-0">
          
          {/* Left Drawer: Tab Antrean Leads & Activity Feed (Modern Rounded Card) */}
          {isHudVisible && (
            <aside
              className={`pointer-events-auto transition-all duration-300 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/5 p-4 flex flex-col h-full max-h-full min-h-0 ${
                isSidebarOpen ? 'w-80 sm:w-92' : 'w-14'
              }`}
            >
              {/* Header Drawer */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3 shrink-0">
                {isSidebarOpen ? (
                  <div className="flex items-center gap-1.5 font-mono">
                    <button
                      onClick={() => setActiveTab('leads')}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer border ${
                        activeTab === 'leads'
                          ? 'bg-[#192A56] text-white border-[#192A56] shadow-xs'
                          : 'bg-slate-50 text-[#192A56] border-slate-200 hover:bg-slate-100'
                      }`}
                      style={activeTab === 'leads' ? { backgroundColor: '#192A56', color: '#FFFFFF' } : { color: '#192A56' }}
                    >
                      <Layers className="w-3.5 h-3.5 shrink-0" style={{ color: activeTab === 'leads' ? '#FFFFFF' : '#192A56' }} />
                      <span className="font-bold" style={{ color: activeTab === 'leads' ? '#FFFFFF' : '#192A56' }}>Prospek ({leads.length})</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('activity')}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer border ${
                        activeTab === 'activity'
                          ? 'bg-[#192A56] text-white border-[#192A56] shadow-xs'
                          : 'bg-slate-50 text-[#192A56] border-slate-200 hover:bg-slate-100'
                      }`}
                      style={activeTab === 'activity' ? { backgroundColor: '#192A56', color: '#FFFFFF' } : { color: '#192A56' }}
                    >
                      <Activity className="w-3.5 h-3.5 shrink-0" style={{ color: activeTab === 'activity' ? '#FFFFFF' : '#192A56' }} />
                      <span className="font-bold" style={{ color: activeTab === 'activity' ? '#FFFFFF' : '#192A56' }}>Log ({activities.length})</span>
                    </button>
                  </div>
                ) : (
                  <Layers className="w-4 h-4 text-[#192A56] mx-auto" />
                )}
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="text-[#192A56] hover:bg-slate-100 rounded-lg text-xs cursor-pointer p-1.5 transition font-mono border border-slate-200 bg-slate-50"
                  title={isSidebarOpen ? 'Tutup Panel' : 'Buka Panel'}
                >
                  {isSidebarOpen ? '◀' : '▶'}
                </button>
              </div>

              {/* Konten Tab Leads */}
              {isSidebarOpen && activeTab === 'leads' && (
                <div className="flex flex-col flex-1 min-h-0 font-mono">
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
                  <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-2.5 pr-1.5 custom-scrollbar">
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
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-2.5 pr-1.5 custom-scrollbar text-xs font-mono">
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
            <aside className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/5 p-4 w-68 sm:w-76 flex flex-col h-full max-h-full min-h-0 gap-2.5 text-xs font-mono">
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
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-xs truncate" style={{ color: selectedAgentId === 'boss' ? '#FFFFFF' : '#192A56' }}>
                        {bossConfig?.name || 'Pak Alfa'}
                      </span>
                      <span className="text-[10px]" style={{ color: selectedAgentId === 'boss' ? '#E2E8F0' : '#576574' }}>
                        Direktur Sales
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
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-xs truncate" style={{ color: selectedAgentId === 'blue-agent' ? '#FFFFFF' : '#192A56' }}>
                        {agents?.['blue-agent']?.name || 'Cubi Scout'}
                      </span>
                      <span className="text-[10px]" style={{ color: selectedAgentId === 'blue-agent' ? '#E2E8F0' : '#576574' }}>
                        Hardware &amp; Stock
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
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-xs truncate" style={{ color: selectedAgentId === 'purple-agent' ? '#FFFFFF' : '#192A56' }}>
                        {agents?.['purple-agent']?.name || 'Cubi Scribe'}
                      </span>
                      <span className="text-[10px]" style={{ color: selectedAgentId === 'purple-agent' ? '#E2E8F0' : '#576574' }}>
                        AI Pitch Drafter
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
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-xs truncate" style={{ color: selectedAgentId === 'green-agent' ? '#FFFFFF' : '#192A56' }}>
                        {agents?.['green-agent']?.name || 'Cubi Gate'}
                      </span>
                      <span className="text-[10px]" style={{ color: selectedAgentId === 'green-agent' ? '#E2E8F0' : '#576574' }}>
                        Approval &amp; WhatsApp
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
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-xs truncate" style={{ color: selectedAgentId === 'orange-agent' ? '#FFFFFF' : '#192A56' }}>
                        {agents?.['orange-agent']?.name || 'Cubi Vault'}
                      </span>
                      <span className="text-[10px]" style={{ color: selectedAgentId === 'orange-agent' ? '#E2E8F0' : '#576574' }}>
                        CSV &amp; Memory Vault
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
                    className="w-full mt-1.5 py-1.5 px-2 bg-[#192A56] hover:bg-[#0E1A38] text-white text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    title="Ubah Nama & Persona Tim Robot"
                  >
                    <SlidersHorizontal className="w-3 h-3 text-white" />
                    <span>Ubah Nama & Persona Tim</span>
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
              className="flex items-center gap-2.5 w-full"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#192A56] shrink-0">
                <Terminal className="w-4 h-4 text-[#192A56]" />
                <span>Perintah:</span>
              </div>
              <input
                type="text"
                value={commandText}
                onChange={(e) => setCommandText(e.target.value)}
                placeholder="Ketik instruksi terminal (contoh: auto pipeline, proses prospek, sinkronkan data)..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-[#192A56] placeholder:text-[#192A56]/40 outline-none focus:border-[#192A56] focus:bg-white transition"
              />
              <div className="hidden lg:flex items-center gap-1 text-[11px] text-emerald-800 font-semibold truncate max-w-sm">
                <span>{commandFeedback}</span>
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#192A56] hover:bg-[#0E1A38] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs border border-[#192A56]"
                style={{ backgroundColor: '#192A56', color: '#FFFFFF' }}
              >
                <Send className="w-3.5 h-3.5 text-white shrink-0" style={{ color: '#FFFFFF' }} />
                <span className="text-white font-bold" style={{ color: '#FFFFFF' }}>Kirim</span>
              </button>
            </form>

            {/* Bottom Row: Agent Status & Runtime Telemetry */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1.5 border-t border-slate-200/80">
              {/* Karakter Status */}
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 border border-slate-200 rounded-lg font-bold text-[#192A56]">
                  <Cpu className="w-3.5 h-3.5 text-[#192A56]" />
                  <span>{currentAgent.name}</span>
                  <span className="text-[11px] text-[#576574] font-normal">({currentAgent.role})</span>
                </div>
                <span className="text-xs text-[#192A56] hidden md:inline truncate max-w-lg">
                  Status: {isGenerating ? 'Menyusun draf penawaran via Qwen 2.5 Local...' : currentAgent.statusText || 'Siap bertugas'}
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
                    Otorisasi direktur sebelum didispatch ke WhatsApp konsumen
                  </p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold px-2.5 py-1 bg-slate-100 text-[#192A56] rounded-full border border-slate-200">
                Otorisasi Direktur
              </span>
            </div>

            <div className="my-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[#576574] block text-[11px] mb-0.5">Calon Konsumen:</span>
                  <span className="font-bold text-sm text-[#192A56] block">{activeLead?.nama}</span>
                  <span className="text-xs text-[#576574] block truncate">{activeLead?.domisili}</span>
                </div>
                <div>
                  <span className="text-[#576574] block text-[11px] mb-0.5">Unit Rekomendasi:</span>
                  <span className="font-bold text-sm text-[#192A56] flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-[#192A56]" />
                    {pitchResult.unit_rekomendasi}
                  </span>
                  <span className="text-xs text-emerald-700 font-semibold block truncate">
                    {pitchResult.stok_info || 'Stok Ready di Showroom'}
                  </span>
                </div>
              </div>

              {pitchResult.bundling_promo && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5 text-[#192A56] text-xs">
                  <PackageCheck className="w-4 h-4 text-[#192A56] shrink-0" />
                  <div>
                    <span className="font-bold">Paket Promo: </span>
                    <span>{pitchResult.bundling_promo}</span>
                  </div>
                </div>
              )}

              {/* Draft WhatsApp Preview */}
              <div>
                <label className="text-xs font-bold text-[#192A56] block mb-1.5">
                  Draf Pesan WhatsApp (Dihasilkan oleh Qwen 2.5 Local):
                </label>
                <textarea
                  rows={4}
                  value={editedPitch}
                  onChange={(e) => setEditedPitch(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#192A56] focus:border-[#192A56] focus:bg-white outline-none leading-relaxed transition"
                />
              </div>

              {/* Target Nomor WhatsApp */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#576574] shrink-0">Kirim ke WA:</span>
                <input
                  type="text"
                  value={waNumber}
                  readOnly
                  placeholder="081234567890"
                  className="flex-1 p-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-[#192A56] font-mono font-bold outline-none"
                />
              </div>
              <label className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-600">
                <input
                  type="checkbox"
                  checked={consentConfirmed}
                  onChange={(event) => setConsentConfirmed(event.target.checked)}
                  className="mt-0.5 accent-[#192A56]"
                />
                <span>Saya mengonfirmasi prospek telah menyetujui dihubungi melalui WhatsApp.</span>
              </label>
            </div>

            {/* Aksi Persetujuan Direktur */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => onApprovePitch && onApprovePitch(null)}
                className="px-4 py-2 border border-slate-200 bg-slate-50 text-[#576574] hover:bg-slate-100 hover:text-[#192A56] rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Tolak / Batal
              </button>
              <button
                type="button"
                onClick={() =>
                  onApprovePitch &&
                  onApprovePitch({
                    id_lead: pitchResult.id_lead,
                    pesan_final: editedPitch,
                    approved_by: bossConfig?.name || 'Sales',
                    consent_confirmed: consentConfirmed,
                  })
                }
                disabled={!consentConfirmed || !waNumber.trim() || !editedPitch.trim()}
                className="px-5 py-2 bg-[#192A56] hover:bg-[#0E1A38] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-[#192A56]"
                style={{ backgroundColor: '#192A56', color: '#FFFFFF' }}
              >
                <Send className="w-3.5 h-3.5 text-white shrink-0" style={{ color: '#FFFFFF' }} />
                <span className="text-white font-bold" style={{ color: '#FFFFFF' }}>Otorisasi &amp; Dispatch WA</span>
              </button>
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
