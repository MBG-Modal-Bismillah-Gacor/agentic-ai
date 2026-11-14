import React, { useState } from 'react'
import { 
  DoorOpen, 
  Cpu, 
  Terminal, 
  Wifi, 
  WifiOff, 
  ArrowRight,
  Database,
  ShieldCheck,
  CheckCircle2,
  Building2,
  UserCheck,
  Users
} from 'lucide-react'

// Synthesizer Web Audio API untuk efek suara sambutan pintu hidrolik otomatis
function playEntranceChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    
    // Suara nada futuristik pembuka pintu (Chord Arpeggio F-A-C-E lembut + low whoosh)
    const freqs = [220.0, 329.63, 440.0, 659.25]
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = idx === 0 ? 'sine' : 'triangle'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08)
      
      gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + idx * 0.08 + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 0.5)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start(ctx.currentTime + idx * 0.08)
      osc.stop(ctx.currentTime + idx * 0.08 + 0.55)
    })
  } catch (e) {
    console.debug('Audio autoplay suppressed:', e)
  }
}

export function OfficeEntranceModal({
  isOpen,
  onEnterOffice,
  isBackendConnected,
  systemInfo,
  bossConfig,
  currentOfficeName = 'MSI Cubi Sovereign AI HQ',
  agents = {}
}) {
  const [isOpening, setIsOpening] = useState(false)
  const [officeName, setOfficeName] = useState(currentOfficeName)
  const [bossName, setBossName] = useState(bossConfig?.name || 'Pak Alfa')
  const [bossRole, setBossRole] = useState(bossConfig?.role || 'Sales Director')
  const [selectedAgents, setSelectedAgents] = useState({
    'blue-agent': true,
    'purple-agent': true,
    'green-agent': true,
    'orange-agent': true,
  })

  if (!isOpen) return null

  const toggleAgent = (agentId) => {
    setSelectedAgents((prev) => ({
      ...prev,
      [agentId]: !prev[agentId],
    }))
  }

  const handleEnter = (e) => {
    e.preventDefault()
    setIsOpening(true)
    playEntranceChime()
    setTimeout(() => {
      onEnterOffice({
        officeName: officeName.trim() || 'MSI Cubi Sovereign AI HQ',
        bossName: bossName.trim() || 'Pak Alfa',
        bossRole: bossRole.trim() || 'Sales Director',
        selectedAgents
      })
      setIsOpening(false)
    }, 600)
  }

  const availableAgents = [
    {
      id: 'blue-agent',
      name: agents?.['blue-agent']?.name || 'Cubi Scout',
      role: 'Sales Engineer & NPU Compute',
      desc: 'Analisis stok motor & spesifikasi hardware NPU'
    },
    {
      id: 'purple-agent',
      name: agents?.['purple-agent']?.name || 'Cubi Scribe',
      role: 'Qwen 2.5 3B AI Pitch Drafter',
      desc: 'Penyusun draf penawaran WhatsApp otomatis lokal'
    },
    {
      id: 'green-agent',
      name: agents?.['green-agent']?.name || 'Cubi Gate',
      role: 'Pipeline Analyst & WhatsApp Dispatch',
      desc: 'Otorisasi kontak keluar & supervisi lead'
    },
    {
      id: 'orange-agent',
      name: agents?.['orange-agent']?.name || 'Cubi Vault',
      role: 'Persistent Storage & Archivist',
      desc: 'Sinkronisasi riwayat database deal lokal'
    }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md pointer-events-auto select-none transition-all duration-300 overflow-y-auto">
      
      {/* Kartu Setup Kantor Utama */}
      <div
        className={`relative z-20 max-w-2xl w-full bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-2xl transition-all duration-400 my-auto ${
          isOpening ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Header Badge Gerbang Setup Kantor */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#192A56]/20 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#192A56] border border-[#192A56] text-white rounded-xl flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-[#192A56]/70 uppercase block font-mono">
                STELAGENT // VIRTUAL OFFICE
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-[#192A56] leading-tight uppercase font-mono">
                KONFIGURASI KANTOR AI
              </h2>
            </div>
          </div>

          {/* Indikator Status Koneksi Riil */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border font-mono ${
            isBackendConnected
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-700'
          }`}>
            {isBackendConnected ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span>ONLINE (8000) 🟢</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-rose-600" />
                <span>OFFLINE (8000)</span>
              </>
            )}
          </div>
        </div>

        {/* Form Konfigurasi Identitas Kantor & Tim */}
        <form onSubmit={handleEnter} className="space-y-4 text-xs">
          
          {/* 1. Nama Kantor & Nama Bos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#192A56] mb-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Nama Kantor AI:</span>
              </label>
              <input
                type="text"
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                placeholder="Contoh: MSI AI Autonomous HQ"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[#192A56] text-xs focus:border-[#192A56] focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Identitas virtual workspace 3D</span>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[#192A56] mb-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Nama Direktur / Bos:</span>
              </label>
              <input
                type="text"
                value={bossName}
                onChange={(e) => setBossName(e.target.value)}
                placeholder="Contoh: Pak Alfa"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[#192A56] text-xs focus:border-[#192A56] focus:outline-none"
                required
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Supervisor meja eksekutif &amp; approval</span>
            </div>
          </div>

          {/* 2. Pilihan Butuh Agen Apa Saja (Swarm Team) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#192A56]/15">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#192A56] uppercase tracking-wide">
                <Users className="w-3.5 h-3.5" />
                <span>Butuh Agen Apa Saja di Kantor:</span>
              </span>
              <span className="text-[10px] text-[#576574]">Pilih agen yang aktif di kantor 3D</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableAgents.map((ag) => {
                const isSelected = selectedAgents[ag.id]
                return (
                  <div
                    key={ag.id}
                    onClick={() => toggleAgent(ag.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-[#192A56] bg-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 opacity-60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-0.5 cursor-pointer accent-[#192A56]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-[#192A56] flex items-center justify-between">
                        <span>{ag.name}</span>
                        {isSelected && <span className="text-[9px] text-emerald-700 font-bold uppercase">AKTIF</span>}
                      </div>
                      <div className="text-[10px] text-[#576574] truncate">{ag.role}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 3. Panel Telemetri & Status Koneksi DB / BE */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-1 text-[#576574] text-[9px] uppercase font-bold mb-0.5">
                <Database className="w-3 h-3 text-[#192A56]" />
                <span>DATABASE</span>
              </div>
              <div className="font-bold text-emerald-700 text-[10px] truncate">
                SQLite Synced 🟢
              </div>
              <span className="text-[9px] text-[#576574] block truncate">deal_swarm.db</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-1 text-[#576574] text-[9px] uppercase font-bold mb-0.5">
                <Terminal className="w-3 h-3 text-[#192A56]" />
                <span>LOCAL LLM</span>
              </div>
              <div className="font-bold text-[#192A56] text-[10px] truncate">
                {systemInfo?.local_llm || 'qwen2.5:3b'}
              </div>
              <span className="text-[9px] text-[#576574] block truncate">Ollama On-Premise</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-1 text-[#576574] text-[9px] uppercase font-bold mb-0.5">
                <Cpu className="w-3 h-3 text-[#192A56]" />
                <span>APPLIANCE</span>
              </div>
              <div className="font-bold text-[#192A56] text-[10px] truncate">
                MSI Cubi NUC
              </div>
              <span className="text-[9px] text-[#576574] block truncate">48 TOPS NPU</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-1 text-[#576574] text-[9px] uppercase font-bold mb-0.5">
                <ShieldCheck className="w-3 h-3 text-[#192A56]" />
                <span>SECURITY</span>
              </div>
              <div className="font-bold text-[#192A56] text-[10px] truncate">
                Zero Cloud Egress
              </div>
              <span className="text-[9px] text-[#576574] block truncate">Air-Gapped Mesh</span>
            </div>
          </div>

          {/* Tombol Aksi Utama: Masuk ke Kantor */}
          <div className="pt-3 border-t border-[#192A56]/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-[#576574] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Kantor Siap Dimasuki</span>
            </div>

            <button
              type="submit"
              disabled={isOpening}
              className="px-6 py-2.5 rounded-xl bg-[#192A56] hover:bg-[#0E1A38] text-white font-mono font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50 border border-[#192A56]"
              style={{ color: '#FFFFFF', backgroundColor: '#192A56' }}
            >
              <DoorOpen className="w-4 h-4 text-white shrink-0" style={{ color: '#FFFFFF' }} />
              <span className="text-white font-bold" style={{ color: '#FFFFFF' }}>Masuk ke Kantor</span>
              <ArrowRight className="w-3.5 h-3.5 text-white shrink-0" style={{ color: '#FFFFFF' }} />
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
