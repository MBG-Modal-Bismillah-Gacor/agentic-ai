import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Layers, 
  Send, 
  RefreshCw, 
  ChevronRight, 
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
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2
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
  onZoom,
  onResetPOV,
  onTogglePure3D,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('leads') // 'leads' | 'activity'
  const [editedPitch, setEditedPitch] = useState('')
  const [waNumber, setWaNumber] = useState('081234567890')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isHudVisible, setIsHudVisible] = useState(true)
  const [commandText, setCommandText] = useState('')
  const [commandFeedback, setCommandFeedback] = useState('Sistem siap menerima instruksi terminal.')

  const handleSendCommand = (e) => {
    e.preventDefault()
    if (!commandText.trim()) return

    const cmd = commandText.trim()
    setCommandText('')
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
  }, [activeLead])

  // Cari data agent yang sedang aktif dipilih
  const getSelectedData = () => {
    if (selectedAgentId === 'boss') {
      return {
        id: 'boss',
        name: bossConfig?.name || 'Pak Alfa',
        role: bossConfig?.role || 'Sales Director',
        color: '#192A56',
        pos: bossConfig?.pos || [-5.8, 0.18, 2.3],
        statusText: bossConfig?.statusText || 'Supervising Office & Deals',
        station: 'Executive Suite',
        feature: 'Deal Approver & Management',
        tokens: isBackendConnected ? '4,120 tok' : '0 tok (Offline)',
      }
    }
    const ag = agents?.[selectedAgentId] || agents?.['blue-agent']
    const roleFeatures = {
      'blue-agent': { feature: 'Local Hardware Compute & Stock', tokens: '14,850 tok' },
      'purple-agent': { feature: 'Qwen 2.5 3B Local AI Drafter', tokens: '28,420 tok' },
      'green-agent': { feature: 'WhatsApp Cloud Gateway', tokens: '8,920 tok' },
      'orange-agent': { feature: 'Persistent CSV Data Vault', tokens: '6,100 tok' },
    }
    return {
      ...(ag || {
        name: 'Cubi Agent',
        role: 'Agent',
        color: '#0284c7',
        pos: [0, 0, 0],
        statusText: 'Active',
        station: 'Desk 01',
      }),
      feature: roleFeatures[ag?.id]?.feature || 'MSI Cubi NUC Appliance',
      tokens: isBackendConnected ? roleFeatures[ag?.id]?.tokens || '12,840 tok' : '0 tok (Offline)',
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
      {/* 1. TOP NAVBAR (Modern Sleek Floating Header & Easy POV Navigation)        */}
      {/* ========================================================================= */}
      <header className="w-full relative z-40 pointer-events-auto shrink-0 p-3 sm:p-4">
        <div className="w-full bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-lg shadow-slate-900/5 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          
          {/* Sisi Kiri: Tombol Kembali ke Beranda + Brand Identitas */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate?.('landing')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#192A56] hover:bg-[#0E1A38] text-white font-mono text-xs font-bold transition shadow-xs cursor-pointer"
              title="Kembali ke Landing Page Utama"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#192A56] uppercase font-mono">
                AICREW
              </span>
              <span className="text-[#192A56]/60 text-xs font-mono font-medium hidden md:inline">
                // {officeName || 'KANTOR AI'}
              </span>
            </div>
          </div>

          {/* Sisi Tengah: NAVIGASI SUDUT PANDANG (POV) MUDAH DIPAHAMI DENGAN TOMBOL PILL */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-full border border-slate-200/80">
            {[
              { key: 'overview', label: '🏢 3D Isometrik' },
              { key: 'boss', label: '💼 Direktur' },
              { key: 'workstation', label: '💻 Workstation' },
              { key: 'kanban', label: '📋 Kanban' },
              { key: 'vault', label: '🔒 Vault' },
            ].map((pov) => {
              const isActive = activePOV === pov.key
              return (
                <button
                  key={pov.key}
                  type="button"
                  onClick={() => onChangePOV && onChangePOV(pov.key)}
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#192A56] text-white shadow-xs'
                      : 'text-[#192A56] hover:bg-white/80'
                  }`}
                  title={`Pindah Sudut Pandang Kamera: ${pov.label}`}
                >
                  {pov.label}
                </button>
              )
            })}

            {/* Quick Zoom Controls */}
            <div className="flex items-center gap-0.5 border-l border-slate-300 pl-1.5 ml-1">
              <button
                type="button"
                onClick={() => onZoom && onZoom(8)}
                className="p-1 rounded-full hover:bg-white text-[#192A56] cursor-pointer transition"
                title="Perbesar Kamera"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onZoom && onZoom(-8)}
                className="p-1 rounded-full hover:bg-white text-[#192A56] cursor-pointer transition"
                title="Perkecil Kamera"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onResetPOV}
                className="p-1 rounded-full hover:bg-white text-[#192A56] cursor-pointer transition"
                title="Reset Posisi Kamera"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sisi Kanan: Status Backend, Aksi Cepat & Mode Layar Penuh */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Status Backend Pill */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold border ${
              isBackendConnected 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                : 'bg-rose-50 border-rose-300 text-rose-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="hidden sm:inline">{isBackendConnected ? 'Online (8000)' : 'Offline'}</span>
            </div>

            {/* Tombol Tambah Lead */}
            <button
              type="button"
              onClick={onOpenCreateLead}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#192A56] hover:bg-[#0E1A38] text-white font-mono font-bold text-xs shadow-xs transition cursor-pointer"
              title="Buat Prospek Baru"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lead Baru</span>
            </button>

            {/* Tombol Auto Pipeline */}
            <button
              type="button"
              onClick={onRunAutoPipeline}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-mono font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
              title="Proses seluruh antrean prospek otomatis"
            >
              <Play className="w-3 h-3 fill-current" />
              <span className="hidden md:inline">Auto Pipeline</span>
            </button>

            {/* Tombol Setup Kantor */}
            <button
              type="button"
              onClick={onOpenOfficeSetup || onOpenEntrance}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#192A56] font-mono font-bold text-xs transition cursor-pointer"
              title="Konfigurasi Kantor & Identitas"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Setup</span>
            </button>

            {/* Mode Layar Penuh */}
            <button
              type="button"
              onClick={onTogglePure3D}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#192A56] transition cursor-pointer"
              title="Layar Penuh 3D (ESC)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Toggle HUD */}
            <button
              type="button"
              onClick={() => setIsHudVisible(!isHudVisible)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#192A56] transition cursor-pointer"
              title={isHudVisible ? 'Sembunyikan Panel' : 'Tampilkan Panel'}
            >
              {isHudVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* Refresh Data */}
            <button
              type="button"
              onClick={onRefresh}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#192A56] transition cursor-pointer"
              title="Refresh Data Riil"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* LOWER HUD WRAPPER (Padding & Flex layout for Drawer, Right Sidebar, Perintah, Dock) */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col justify-between p-3 sm:p-4 pointer-events-none overflow-hidden">

      {/* ========================================================================= */}
      {/* 2. CENTER ROW: Left Leads Drawer & Right System Sidebar                   */}
      {/* ========================================================================= */}
      {isHudVisible && (
        <div className="flex-1 flex justify-between items-start gap-4 mt-1 overflow-hidden pointer-events-none">
          
          {/* Left Drawer: Tab Antrean Leads & Activity Feed (Modern Rounded Card) */}
          <aside
            className={`pointer-events-auto transition-all duration-300 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/5 p-4 flex flex-col max-h-[calc(100vh-240px)] ${
              isSidebarOpen ? 'w-80 sm:w-92' : 'w-14'
            }`}
          >
            {/* Header Drawer */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
              {isSidebarOpen ? (
                <div className="flex items-center gap-1.5 font-mono">
                  <button
                    onClick={() => setActiveTab('leads')}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer border ${
                      activeTab === 'leads'
                        ? 'bg-[#192A56] text-white border-[#192A56] shadow-xs'
                        : 'bg-slate-50 text-[#192A56] border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Prospek ({leads.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer border ${
                      activeTab === 'activity'
                        ? 'bg-[#192A56] text-white border-[#192A56] shadow-xs'
                        : 'bg-slate-50 text-[#192A56] border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Log ({activities.length})</span>
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
              <div className="overflow-y-auto space-y-2.5 pr-1 flex-1 font-mono">
                {/* Search Box */}
                <div className="relative mb-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari prospek / nama / kota..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#192A56] placeholder:text-[#192A56]/40 outline-none focus:border-[#192A56] focus:bg-white transition"
                  />
                  <Search className="w-3.5 h-3.5 text-[#192A56]/40 absolute right-3.5 top-3 pointer-events-none" />
                </div>

                {filteredLeads.length === 0 ? (
                  <div className="text-[#576574] text-center py-8 text-xs bg-slate-50 rounded-xl border border-slate-200 p-4">
                    {isBackendConnected ? 'Tidak ada antrean prospek.' : 'Memuat data prospek...'}
                  </div>
                ) : (
                  filteredLeads.map((lead) => {
                    const isHot = lead.score_priority === 'Hot'
                    const isWarm = lead.score_priority === 'Warm'
                    const isSelected = activeLead?.id_lead === lead.id_lead
                    const isDispatched = lead.status_kontak === 'dispatched' || lead.status_kontak === 'approved'

                    return (
                      <div
                        key={lead.id_lead}
                        onClick={() => onSelectLead && onSelectLead(lead)}
                        className={`p-3.5 rounded-xl border transition-all text-xs cursor-pointer relative ${
                          isSelected
                            ? 'bg-[#192A56] text-white border-[#192A56] shadow-md'
                            : isDispatched
                            ? 'bg-emerald-50/70 border-emerald-300 text-[#192A56]'
                            : 'bg-white border-slate-200 hover:border-[#192A56] hover:shadow-sm'
                        }`}
                      >
                        {/* Reference & Priority Badge */}
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className={`font-semibold font-mono ${isSelected ? 'text-white/70' : 'text-[#576574]'}`}>
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

                        <div className={`font-bold text-sm truncate mb-1 ${isSelected ? 'text-white' : 'text-[#192A56]'}`}>
                          {lead.nama}
                        </div>

                        <div className={`grid grid-cols-2 gap-1 text-[11px] border-t pt-1.5 mt-1.5 ${
                          isSelected ? 'border-white/20 text-white/80' : 'border-slate-100 text-[#576574]'
                        }`}>
                          <div className="truncate">Unit: <span className={`font-semibold ${isSelected ? 'text-white' : 'text-[#192A56]'}`}>{lead.minat || 'Unit Motor'}</span></div>
                          <div className="truncate text-right">Kota: <span className={`font-semibold ${isSelected ? 'text-white' : 'text-[#192A56]'}`}>{lead.domisili || 'Purwokerto'}</span></div>
                        </div>

                        {isSelected && (
                          <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-[11px] text-white">
                            <span className="font-bold flex items-center gap-1.5 text-emerald-300">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              Sedang Diproses
                            </span>
                            <span className="font-bold hover:underline flex items-center gap-0.5 text-white">
                              Lihat Pitch <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* Konten Tab Activity Log */}
            {isSidebarOpen && activeTab === 'activity' && (
              <div className="overflow-y-auto space-y-2.5 pr-1 flex-1 text-xs font-mono">
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

          {/* Right System Sidebar: Inspector & Agent Selection (Modern Rounded Card) */}
          <aside className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/5 p-4 w-68 sm:w-76 flex flex-col gap-3 text-xs font-mono">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80">
              <div className="flex items-center gap-2 font-bold text-[#192A56]">
                <Cpu className="w-4 h-4 text-[#192A56]" />
                <span className="text-xs uppercase tracking-wide">Tim AI Cubi</span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 bg-emerald-50 text-emerald-800 font-bold rounded-full border border-emerald-200">
                5 Aktif
              </span>
            </div>

            {/* Daftar Agen Interaktif */}
            <div className="space-y-2">
              {/* Direktur / Bos */}
              <button
                onClick={() => onSelectAgent('boss')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer border ${
                  selectedAgentId === 'boss'
                    ? 'bg-[#192A56] text-white border-[#192A56] shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-[#192A56] border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    selectedAgentId === 'boss' ? 'bg-white text-[#192A56] border-white/20' : 'bg-white text-[#192A56] border-slate-200'
                  }`}>
                    <Crown className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className={`font-bold text-xs truncate ${selectedAgentId === 'boss' ? 'text-white' : 'text-[#192A56]'}`}>
                      {bossConfig?.name || 'Pak Alfa'}
                    </span>
                    <span className={`text-[10px] ${selectedAgentId === 'boss' ? 'text-white/70' : 'text-[#576574]'}`}>
                      Direktur Sales
                    </span>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </button>

              {/* Blue Agent: Scout */}
              <button
                onClick={() => onSelectAgent('blue-agent')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer border ${
                  selectedAgentId === 'blue-agent'
                    ? 'bg-[#192A56] text-white border-[#192A56] shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-[#192A56] border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    selectedAgentId === 'blue-agent' ? 'bg-white text-[#192A56] border-white/20' : 'bg-white text-[#192A56] border-slate-200'
                  }`}>
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className={`font-bold text-xs truncate ${selectedAgentId === 'blue-agent' ? 'text-white' : 'text-[#192A56]'}`}>
                      {agents?.['blue-agent']?.name || 'Cubi Scout'}
                    </span>
                    <span className={`text-[10px] ${selectedAgentId === 'blue-agent' ? 'text-white/70' : 'text-[#576574]'}`}>
                      Hardware &amp; Stock
                    </span>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </button>

              {/* Purple Agent: Scribe */}
              <button
                onClick={() => onSelectAgent('purple-agent')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer border ${
                  selectedAgentId === 'purple-agent'
                    ? 'bg-[#192A56] text-white border-[#192A56] shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-[#192A56] border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    selectedAgentId === 'purple-agent' ? 'bg-white text-[#192A56] border-white/20' : 'bg-white text-[#192A56] border-slate-200'
                  }`}>
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className={`font-bold text-xs truncate ${selectedAgentId === 'purple-agent' ? 'text-white' : 'text-[#192A56]'}`}>
                      {agents?.['purple-agent']?.name || 'Cubi Scribe'}
                    </span>
                    <span className={`text-[10px] ${selectedAgentId === 'purple-agent' ? 'text-white/70' : 'text-[#576574]'}`}>
                      AI Pitch Drafter
                    </span>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </button>

              {/* Green Agent: Gatekeeper */}
              <button
                onClick={() => onSelectAgent('green-agent')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer border ${
                  selectedAgentId === 'green-agent'
                    ? 'bg-[#192A56] text-white border-[#192A56] shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-[#192A56] border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    selectedAgentId === 'green-agent' ? 'bg-white text-[#192A56] border-white/20' : 'bg-white text-[#192A56] border-slate-200'
                  }`}>
                    <Send className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className={`font-bold text-xs truncate ${selectedAgentId === 'green-agent' ? 'text-white' : 'text-[#192A56]'}`}>
                      {agents?.['green-agent']?.name || 'Cubi Gate'}
                    </span>
                    <span className={`text-[10px] ${selectedAgentId === 'green-agent' ? 'text-white/70' : 'text-[#576574]'}`}>
                      Approval &amp; WhatsApp
                    </span>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </button>

              {/* Orange Agent: Vault */}
              <button
                onClick={() => onSelectAgent('orange-agent')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer border ${
                  selectedAgentId === 'orange-agent'
                    ? 'bg-[#192A56] text-white border-[#192A56] shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-[#192A56] border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    selectedAgentId === 'orange-agent' ? 'bg-white text-[#192A56] border-white/20' : 'bg-white text-[#192A56] border-slate-200'
                  }`}>
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className={`font-bold text-xs truncate ${selectedAgentId === 'orange-agent' ? 'text-white' : 'text-[#192A56]'}`}>
                      {agents?.['orange-agent']?.name || 'Cubi Vault'}
                    </span>
                    <span className={`text-[10px] ${selectedAgentId === 'orange-agent' ? 'text-white/70' : 'text-[#576574]'}`}>
                      CSV &amp; Memory Vault
                    </span>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </button>
            </div>

            {/* Detail Agen Terpilih */}
            <div className="mt-1 pt-3 border-t border-slate-200/80 bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] text-[#576574] border-b border-slate-200 pb-1.5">
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
              <div className="text-[#192A56] text-[11px] leading-relaxed bg-white rounded-lg p-2.5 border border-slate-200">
                {currentAgent.feature}
              </div>
              <div className="text-[11px] text-emerald-800 font-bold flex items-center justify-between pt-0.5">
                <span>Penggunaan Token:</span>
                <span className="font-mono">{currentAgent.tokens}</span>
              </div>
            </div>

          </aside>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2.5 INTERACTIVE COMMAND PROMPT (Terminal Perintah Modern)                 */}
      {/* ========================================================================= */}
      {isHudVisible && (
        <form
          onSubmit={handleSendCommand}
          className="pointer-events-auto flex items-center gap-2.5 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl px-4 py-2.5 shadow-xl shadow-slate-900/5 mt-3 font-mono mx-auto max-w-4xl w-full"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#192A56] shrink-0">
            <Terminal className="w-4 h-4 text-[#192A56]" />
            <span>Perintah:</span>
          </div>
          <input
            type="text"
            value={commandText}
            onChange={(e) => setCommandText(e.target.value)}
            placeholder="Ketik instruksi (contoh: auto pipeline, proses prospek, sinkronkan data)..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#192A56] placeholder:text-[#192A56]/40 outline-none focus:border-[#192A56] focus:bg-white transition"
          />
          <div className="hidden md:flex items-center gap-1 text-[11px] text-emerald-800 font-semibold truncate max-w-sm">
            <span>{commandFeedback}</span>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#192A56] hover:bg-[#0E1A38] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim</span>
          </button>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 3. BOTTOM INSPECTOR DOCK (Modern Rounded Status Bar)                     */}
      {/* ========================================================================= */}
      {isHudVisible && (
        <footer className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl px-5 py-3 shadow-xl shadow-slate-900/5 mt-3 font-mono mx-auto max-w-4xl w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            
            {/* Karakter Status */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-[#192A56]">
                <Cpu className="w-3.5 h-3.5 text-[#192A56]" />
                <span>{currentAgent.name}</span>
                <span className="text-[11px] text-[#576574] font-normal">({currentAgent.role})</span>
              </div>
              <span className="text-xs text-[#192A56] hidden md:inline truncate max-w-md">
                Status: {isGenerating ? 'Menyusun draf penawaran via Qwen 2.5 Local...' : currentAgent.statusText || 'Siap bertugas'}
              </span>
            </div>

            {/* Metrik Runtime & Progress */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 text-[#576574] text-xs">
                <Activity className="w-3.5 h-3.5 text-[#192A56]" />
                <span>Runtime: <strong className="text-[#192A56] font-mono">{formattedRuntime}</strong></span>
              </div>
              <div className="w-24 sm:w-32 bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
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
        </footer>
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
                  onChange={(e) => setWaNumber(e.target.value)}
                  placeholder="081234567890"
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#192A56] font-mono font-bold focus:border-[#192A56] focus:bg-white outline-none transition"
                />
              </div>
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
                    nama: activeLead?.nama,
                    nomor_wa: waNumber,
                    pesan: editedPitch,
                  })
                }
                className="px-5 py-2 bg-[#192A56] hover:bg-[#0E1A38] text-white rounded-xl text-xs font-bold shadow-md shadow-[#192A56]/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Otorisasi &amp; Dispatch WA</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
