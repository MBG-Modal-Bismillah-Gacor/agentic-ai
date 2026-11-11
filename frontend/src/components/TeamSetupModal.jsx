import React, { useState, useMemo } from 'react'
import {
  Crown,
  Check,
  X,
  Shield,
  Bot,
  Server,
  Send,
  Briefcase,
  Search,
  Filter,
  ArrowRight,
  UserCheck,
  Layers,
  ChevronRight,
  Flame,
  Info,
  SlidersHorizontal,
  Users,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Terminal,
  Database
} from 'lucide-react'
import { AGENCY_AGENTS, DIVISIONS, CURATED_OFFICE_PRESETS } from '../data/agencyAgents'

export function TeamSetupModal({ isOpen, onClose, teamConfig, onSave }) {
  // State 5 Slot Tim
  const [boss, setBoss] = useState({
    name: teamConfig?.boss?.name || 'Deal Strategist',
    role: teamConfig?.boss?.role || 'Deal Strategist & Closing Architect',
    color: teamConfig?.boss?.color || '#1B4D3E',
    emoji: teamConfig?.boss?.emoji || '♟️',
    vibe: teamConfig?.boss?.vibe || 'Qualifies deals like a surgeon and kills happy ears on contact.',
    personaId: teamConfig?.boss?.personaId || 'sales-deal-strategist',
  })

  const [scout, setScout] = useState({
    name: teamConfig?.agents?.['blue-agent']?.name || 'Sales Engineer',
    role: teamConfig?.agents?.['blue-agent']?.role || 'Compute & Stock Analyzer',
    color: teamConfig?.agents?.['blue-agent']?.color || '#192A56',
    emoji: teamConfig?.agents?.['blue-agent']?.emoji || '⚙️',
    vibe: teamConfig?.agents?.['blue-agent']?.vibe || 'Connects technical specs directly to customer ROI.',
    personaId: teamConfig?.agents?.['blue-agent']?.personaId || 'sales-engineer',
  })

  const [scribe, setScribe] = useState({
    name: teamConfig?.agents?.['purple-agent']?.name || 'Outbound Strategist',
    role: teamConfig?.agents?.['purple-agent']?.role || 'AI Pitch Drafter',
    color: teamConfig?.agents?.['purple-agent']?.color || '#E8590C',
    emoji: teamConfig?.agents?.['purple-agent']?.emoji || '🎯',
    vibe: teamConfig?.agents?.['purple-agent']?.vibe || 'Turns buying signals into booked meetings before competition notices.',
    personaId: teamConfig?.agents?.['purple-agent']?.personaId || 'sales-outbound-strategist',
  })

  const [gate, setGate] = useState({
    name: teamConfig?.agents?.['green-agent']?.name || 'Pipeline Analyst',
    role: teamConfig?.agents?.['green-agent']?.role || 'Approval & Dispatch',
    color: teamConfig?.agents?.['green-agent']?.color || '#059669',
    emoji: teamConfig?.agents?.['green-agent']?.emoji || '📊',
    vibe: teamConfig?.agents?.['green-agent']?.vibe || 'Tells you your forecast is wrong before you realize it yourself.',
    personaId: teamConfig?.agents?.['green-agent']?.personaId || 'sales-pipeline-analyst',
  })

  const [vault, setVault] = useState({
    name: teamConfig?.agents?.['orange-agent']?.name || 'Account Strategist',
    role: teamConfig?.agents?.['orange-agent']?.role || 'Data & Deal Archivist',
    color: teamConfig?.agents?.['orange-agent']?.color || '#D97706',
    emoji: teamConfig?.agents?.['orange-agent']?.emoji || '🏢',
    vibe: teamConfig?.agents?.['orange-agent']?.vibe || 'Expands customer lifetime value through proactive account mastery.',
    personaId: teamConfig?.agents?.['orange-agent']?.personaId || 'sales-account-strategist',
  })

  // State Modal Pemilihan Persona Agency Agents
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [targetSlot, setTargetSlot] = useState(null) // 'boss' | 'blue-agent' | 'purple-agent' | 'green-agent' | 'orange-agent'
  const [selectedDivision, setSelectedDivision] = useState('sales')
  const [searchQuery, setSearchQuery] = useState('')

  // Terapkan Preset Terkurasi
  const applyPreset = (presetId) => {
    const preset = CURATED_OFFICE_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    setBoss({ ...preset.boss })
    setScout({ ...preset.agents['blue-agent'] })
    setScribe({ ...preset.agents['purple-agent'] })
    setGate({ ...preset.agents['green-agent'] })
    setVault({ ...preset.agents['orange-agent'] })
  }

  // Buka Pemilih Persona untuk slot tertentu
  const openPersonaPicker = (slotKey) => {
    setTargetSlot(slotKey)
    setIsPickerOpen(true)
  }

  // Pasang Persona yang dipilih ke slot
  const handleSelectPersona = (agent) => {
    const personaData = {
      name: agent.name,
      role: agent.division === 'sales' ? agent.name : `${agent.name} (${agent.divisionLabel})`,
      color: agent.color || '#6366f1',
      emoji: agent.emoji || '🤖',
      vibe: agent.vibe || agent.description,
      personaId: agent.id,
    }

    if (targetSlot === 'boss') setBoss(personaData)
    else if (targetSlot === 'blue-agent') setScout(personaData)
    else if (targetSlot === 'purple-agent') setScribe(personaData)
    else if (targetSlot === 'green-agent') setGate(personaData)
    else if (targetSlot === 'orange-agent') setVault(personaData)

    setIsPickerOpen(false)
    setTargetSlot(null)
  }

  // Submit Konfigurasi Tim
  const handleSubmit = (e) => {
    e.preventDefault()
    const updated = {
      boss: {
        name: boss.name.trim() || 'Pak Alfa',
        role: boss.role.trim() || 'Chief Executive / Sales Director',
        color: boss.color || '#f59e0b',
        emoji: boss.emoji || '👑',
        vibe: boss.vibe || '',
        personaId: boss.personaId || 'sales-deal-strategist',
        badge: 'DIRECTOR',
        station: 'boss_desk',
      },
      agents: {
        'blue-agent': {
          ...teamConfig?.agents?.['blue-agent'],
          id: 'blue-agent',
          name: scout.name.trim() || 'Cubi Scout',
          role: scout.role.trim() || 'Compute & Stock Analyzer',
          color: scout.color || '#0284c7',
          emoji: scout.emoji || '🤖',
          vibe: scout.vibe || '',
          personaId: scout.personaId || 'sales-engineer',
        },
        'purple-agent': {
          ...teamConfig?.agents?.['purple-agent'],
          id: 'purple-agent',
          name: scribe.name.trim() || 'Cubi Scribe',
          role: scribe.role.trim() || 'AI Pitch Drafter',
          color: scribe.color || '#9333ea',
          emoji: scribe.emoji || '✍️',
          vibe: scribe.vibe || '',
          personaId: scribe.personaId || 'sales-outbound-strategist',
        },
        'green-agent': {
          ...teamConfig?.agents?.['green-agent'],
          id: 'green-agent',
          name: gate.name.trim() || 'Cubi Gate',
          role: gate.role.trim() || 'Approval & Dispatch',
          color: gate.color || '#16a34a',
          emoji: gate.emoji || '🛡️',
          vibe: gate.vibe || '',
          personaId: gate.personaId || 'sales-pipeline-analyst',
        },
        'orange-agent': {
          ...teamConfig?.agents?.['orange-agent'],
          id: 'orange-agent',
          name: vault.name.trim() || 'Cubi Vault',
          role: vault.role.trim() || 'Data & Deal Archivist',
          color: vault.color || '#ea580c',
          emoji: vault.emoji || '💾',
          vibe: vault.vibe || '',
          personaId: vault.personaId || 'sales-account-strategist',
        },
      },
    }
    onSave(updated)
    onClose()
  }

  // Filter daftar Agency Agents di Picker
  const filteredAgencyAgents = useMemo(() => {
    return AGENCY_AGENTS.filter((a) => {
      const matchDivision = selectedDivision === 'all' || a.division === selectedDivision
      const q = searchQuery.toLowerCase().trim()
      const matchQuery =
        !q ||
        a.name.toLowerCase().includes(q) ||
        (a.vibe && a.vibe.toLowerCase().includes(q)) ||
        (a.description && a.description.toLowerCase().includes(q))
      return matchDivision && matchQuery
    })
  }, [selectedDivision, searchQuery])

  const targetSlotLabel = {
    boss: 'Bos Eksekutif (Meja Direktur)',
    'blue-agent': 'Cubi Scout (Workstation Desk 01)',
    'purple-agent': 'Cubi Scribe (AI Drafter Kanban)',
    'green-agent': 'Cubi Gate (Security Turnstile)',
    'orange-agent': 'Cubi Vault (Server Brankas)',
  }[targetSlot] || 'Karakter'

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#192A56]/40 backdrop-blur-md pointer-events-auto select-none overflow-y-auto font-mono">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#192A56]/10 border border-[#192A56]/20 flex items-center justify-center text-[#192A56] shadow-xs">
              <Users className="w-5 h-5 text-[#192A56]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Personalisasi Karakter &amp; Agency-Agents</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#192A56] text-white border border-[#192A56] font-semibold">
                  268+ Personas
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Integrasi karakter spesialis dari <span className="font-semibold text-slate-700">msitarzewski/agency-agents</span> ke 5 unit kantor 3D
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer border border-white/80 shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Cepat Agency Agents */}
        <div className="my-3 p-2.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-[#192A56]" />
            Preset Koleksi:
          </span>
          <button
            type="button"
            onClick={() => applyPreset('agency_sales_elite')}
            className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-800 rounded-xl transition cursor-pointer border border-emerald-500/30 flex items-center gap-1.5 shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
            <span>Sales Elite (Deal & Outbound)</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('agency_growth_strike')}
            className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-800 rounded-xl transition cursor-pointer border border-indigo-500/30 flex items-center gap-1.5 shadow-xs"
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-800" />
            <span>Growth & Marketing Strike</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('default_cubi')}
            className="px-2.5 py-1 text-[11px] font-semibold bg-[#192A56]/10 hover:bg-[#192A56]/20 text-[#192A56] rounded-xl transition cursor-pointer border border-[#192A56]/25 flex items-center gap-1.5 shadow-xs"
          >
            <Cpu className="w-3.5 h-3.5 text-[#192A56]" />
            <span>MSI Cubi NUC Classic</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* 1. SLOT BOS DIREKTUR */}
          <div className="p-3 rounded-2xl border transition-all" style={{ backgroundColor: `${boss.color}0c`, borderColor: `${boss.color}35` }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{boss.name}</span>
                    <span className="text-[9px] font-mono px-2 py-0.2 rounded-full font-bold uppercase" style={{ backgroundColor: `${boss.color}20`, color: boss.color }}>
                      Meja Eksekutif
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 italic truncate block max-w-sm sm:max-w-md">
                    "{boss.vibe}"
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openPersonaPicker('boss')}
                className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-white/90 hover:bg-white text-slate-700 border border-slate-200/90 shadow-xs flex items-center gap-1 transition cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3 text-[#192A56]" />
                <span>Ganti Persona</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Nama Panggilan:</label>
                <input
                  type="text"
                  value={boss.name}
                  onChange={(e) => setBoss({ ...boss, name: e.target.value })}
                  className="w-full bg-white border border-slate-200/90 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Peran / Spesialisasi:</label>
                <input
                  type="text"
                  value={boss.role}
                  onChange={(e) => setBoss({ ...boss, role: e.target.value })}
                  className="w-full bg-white border border-slate-200/90 rounded-xl px-2.5 py-1.5 font-medium text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* 2. GRID 4 ROBOT CUBI NUC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            
            {/* Cubi 1: Blue Scout */}
            <div className="p-3 rounded-2xl border transition-all" style={{ backgroundColor: `${scout.color}0c`, borderColor: `${scout.color}35` }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-slate-800 block text-[11px] truncate">{scout.name}</span>
                    <span className="text-[9px] text-slate-500 block truncate">Station 01: Workstation Desk</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openPersonaPicker('blue-agent')}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-2xs cursor-pointer"
                >
                  Ganti
                </button>
              </div>
              <p className="text-[10px] text-slate-500 italic truncate mb-2">"{scout.vibe}"</p>
              <div className="space-y-1">
                <input
                  type="text"
                  value={scout.name}
                  onChange={(e) => setScout({ ...scout, name: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-800"
                />
                <input
                  type="text"
                  value={scout.role}
                  onChange={(e) => setScout({ ...scout, role: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] text-slate-600"
                />
              </div>
            </div>

            {/* Cubi 2: Purple Scribe */}
            <div className="p-3 rounded-2xl border transition-all" style={{ backgroundColor: `${scribe.color}0c`, borderColor: `${scribe.color}35` }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-slate-800 block text-[11px] truncate">{scribe.name}</span>
                    <span className="text-[9px] text-slate-500 block truncate">Station 02: Kanban Wall (Drafter)</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openPersonaPicker('purple-agent')}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-2xs cursor-pointer"
                >
                  Ganti
                </button>
              </div>
              <p className="text-[10px] text-slate-500 italic truncate mb-2">"{scribe.vibe}"</p>
              <div className="space-y-1">
                <input
                  type="text"
                  value={scribe.name}
                  onChange={(e) => setScribe({ ...scribe, name: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-800"
                />
                <input
                  type="text"
                  value={scribe.role}
                  onChange={(e) => setScribe({ ...scribe, role: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] text-slate-600"
                />
              </div>
            </div>

            {/* Cubi 3: Green Gate */}
            <div className="p-3 rounded-2xl border transition-all" style={{ backgroundColor: `${gate.color}0c`, borderColor: `${gate.color}35` }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-slate-800 block text-[11px] truncate">{gate.name}</span>
                    <span className="text-[9px] text-slate-500 block truncate">Station 03: Security Gate</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openPersonaPicker('green-agent')}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-2xs cursor-pointer"
                >
                  Ganti
                </button>
              </div>
              <p className="text-[10px] text-slate-500 italic truncate mb-2">"{gate.vibe}"</p>
              <div className="space-y-1">
                <input
                  type="text"
                  value={gate.name}
                  onChange={(e) => setGate({ ...gate, name: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-800"
                />
                <input
                  type="text"
                  value={gate.role}
                  onChange={(e) => setGate({ ...gate, role: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] text-slate-600"
                />
              </div>
            </div>

            {/* Cubi 4: Orange Vault */}
            <div className="p-3 rounded-2xl border transition-all" style={{ backgroundColor: `${vault.color}0c`, borderColor: `${vault.color}35` }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-slate-800 block text-[11px] truncate">{vault.name}</span>
                    <span className="text-[9px] text-slate-500 block truncate">Station 04: Server Vault</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openPersonaPicker('orange-agent')}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-2xs cursor-pointer"
                >
                  Ganti
                </button>
              </div>
              <p className="text-[10px] text-slate-500 italic truncate mb-2">"{vault.vibe}"</p>
              <div className="space-y-1">
                <input
                  type="text"
                  value={vault.name}
                  onChange={(e) => setVault({ ...vault, name: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-800"
                />
                <input
                  type="text"
                  value={vault.role}
                  onChange={(e) => setVault({ ...vault, role: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200/70">
            <span className="text-[11px] text-slate-400">
              Perubahan langsung tersinkron ke 3D visual dan backend pitch generator.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#192A56] hover:bg-[#0E1A38] text-white font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer text-xs font-mono uppercase border border-[#192A56]"
                style={{ backgroundColor: '#192A56', color: '#FFFFFF' }}
              >
                <Check className="w-4 h-4 text-white shrink-0" style={{ color: '#FFFFFF' }} />
                <span className="font-bold text-white" style={{ color: '#FFFFFF' }}>Simpan & Terapkan ke Kantor 3D</span>
              </button>
            </div>
          </div>
        </form>

        {/* ========================================================================= */}
        {/* SUB-MODAL: BROWSER PERSONA AGENCY-AGENTS (268 KARAKTER) */}
        {/* ========================================================================= */}
        {isPickerOpen && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-3xl rounded-3xl p-5 z-20 flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header Picker */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 shrink-0">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span>Pilih Karakter untuk:</span>
                  <span className="text-[#192A56] font-mono px-2 py-0.5 rounded-lg bg-[#192A56]/10 border border-[#192A56]/20 text-xs font-semibold">
                    {targetSlotLabel}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Pilih dari 268 persona AI resmi dari repositori Agency-Agents
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filter Divisi & Search Bar */}
            <div className="py-2.5 space-y-2 shrink-0">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama karakter, gaya, atau keahlian (contoh: outbound, deal, closing)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#192A56]"
                />
              </div>

              {/* Division Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setSelectedDivision('all')}
                  className={`px-2.5 py-1 rounded-xl font-medium transition cursor-pointer whitespace-nowrap ${
                    selectedDivision === 'all'
                      ? 'bg-[#192A56] text-white font-bold border border-[#192A56]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  style={selectedDivision === 'all' ? { backgroundColor: '#192A56', color: '#FFFFFF' } : {}}
                >
                  Semua ({AGENCY_AGENTS.length})
                </button>
                {Object.entries(DIVISIONS).map(([key, info]) => {
                  const count = AGENCY_AGENTS.filter((a) => a.division === key).length
                  if (count === 0) return null
                  const isSel = selectedDivision === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDivision(key)}
                      className={`px-2.5 py-1 rounded-xl font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                        isSel
                          ? 'bg-[#192A56] text-white font-bold border border-[#192A56] shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      style={isSel ? { backgroundColor: '#192A56', color: '#FFFFFF' } : {}}
                    >
                      <span className={isSel ? 'text-white font-bold' : ''}>{info.label}</span>
                      <span className={`text-[10px] font-mono ${isSel ? 'text-white' : 'opacity-75'}`}>({count})</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Daftar Grid Karakter */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {filteredAgencyAgents.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Tidak ditemukan karakter Agency-Agents dengan kata kunci tersebut.
                </div>
              ) : (
                filteredAgencyAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-2.5 rounded-2xl border border-slate-200/80 hover:border-[#192A56] bg-white hover:bg-slate-50 transition-all flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border border-white"
                        style={{ backgroundColor: `${agent.color}25` }}
                      >
                        <Bot className="w-5 h-5" style={{ color: agent.color || '#192A56' }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{agent.name}</span>
                          <span
                            className="text-[9px] font-mono px-1.5 py-0.2 rounded-full font-semibold"
                            style={{ backgroundColor: `${agent.color}15`, color: agent.color }}
                          >
                            {agent.divisionLabel}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-700 mt-0.5">
                          "{agent.vibe}"
                        </p>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">
                          {agent.description}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectPersona(agent)}
                      className="px-3 py-1.5 rounded-xl bg-[#192A56] hover:bg-[#0E1A38] text-white font-semibold text-[11px] shrink-0 transition cursor-pointer shadow-xs flex items-center gap-1 border border-[#192A56]"
                      style={{ backgroundColor: '#192A56', color: '#FFFFFF' }}
                    >
                      <span className="font-bold text-white" style={{ color: '#FFFFFF' }}>Pilih</span>
                      <ArrowRight className="w-3 h-3 text-white shrink-0" style={{ color: '#FFFFFF' }} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
