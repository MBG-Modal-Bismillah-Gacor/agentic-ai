import React, { useState } from 'react'
import { RobotMascotCanvas } from './RobotMascotCanvas'

export function FoundersSection({ onNavigate }) {
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [slideOffset, setSlideOffset] = useState(0)

  // AI Agent Team Members (Swarm Intelijen Showroom On-Premise)
  const teamMembers = [
    {
      id: 0,
      name: 'Cubi Commander',
      role: 'Lead Director & Closing Architect',
      accentColor: '#192A56',
      npu: '48 TOPS Dedicated',
      model: 'Qwen 2.5 3B Sovereign',
      network: 'LAN 1 (2.5GbE) Port 8000',
      egress: '0 Byte (Air-Gapped)',
      bio: 'Pimpinan tertinggi swarm AICREW. Bertanggung jawab atas supervisi pipeline penjualan motor Honda, otorisasi deal penawaran akhir, dan tata kelola swarm multi-agen lokal berkeamanan tinggi.',
      capabilities: [
        'Supervisi dan orkestrasi seluruh swarm agen lokal',
        'Turnstile Human-in-the-Loop approval gatekeeper',
        'Validasi akhir batas margin & diskon motor showroom',
        'Koordinasi delegasi tugas prospek ke Scout & Scribe'
      ]
    },
    {
      id: 1,
      name: 'Cubi Scout',
      role: 'Compute & Stock Intelligence Agent',
      accentColor: '#0284C7',
      npu: '48 TOPS NPU Engine',
      model: 'Qwen 2.5 Vector Matcher',
      network: 'FastAPI Local Bus :8001',
      egress: '0 Byte (Air-Gapped)',
      bio: 'Insinyur analitik katalog showroom. Menghubungkan spesifikasi teknis unit (PCX 160, Vario 125, Beat Street CBS), sinkronisasi stok cabang Purwokerto, dan alokasi daya NPU hardware MSI Cubi.',
      capabilities: [
        'Pencocokan katalog unit motor Astra Honda secara instan',
        'Simulasi hitung skema cicilan kredit & uang muka DP',
        'Sinkronisasi ketersediaan unit gudang lokal realtime',
        'Pemrosesan spek motor sub-detik tanpa latensi cloud'
      ]
    },
    {
      id: 2,
      name: 'Cubi Scribe',
      role: 'AI WhatsApp Pitch Drafter',
      accentColor: '#4F46E5',
      npu: '48 TOPS NPU Engine',
      model: 'Qwen 2.5 Drafter Mesh',
      network: 'Internal IPC Mesh :8002',
      egress: '0 Byte (Air-Gapped)',
      bio: 'Spesialis outbound & signal-based sales drafting. Menghasilkan draf percakapan WhatsApp yang ramah, ringkas, dan relevan menggunakan model on-device Qwen 2.5 tanpa latensi cloud.',
      capabilities: [
        'Personalisasi draf pesan WhatsApp ramah & persuasif',
        'Follow-up berkala prospek hangat dengan konteks akurat',
        'Penerjemahan sinyal minat beli menjadi ajakan test-ride',
        'Bebas biaya token API bulanan untuk jutaan pesan'
      ]
    },
    {
      id: 3,
      name: 'Pipeline Analyst',
      role: 'Deal Scoring & Security Gate',
      accentColor: '#059669',
      npu: '48 TOPS NPU Engine',
      model: 'Local Lead Scoring LLM',
      network: 'Internal IPC Mesh :8003',
      egress: '0 Byte (Air-Gapped)',
      bio: 'Penjaga kualifikasi prospek. Mengkalkulasi skor prioritas prospek (Hot/Warm/Cold), memvalidasi kelayakan uang muka (DP), dan menjaga turnstile gate sebelum diteruskan ke pimpinan.',
      capabilities: [
        'Kalkulasi skor minat prospek (Hot/Warm/Cold) otomatis',
        'Validasi kelayakan finansial & dokumen pengajuan kredit',
        'Penyaringan leads spam WhatsApp sebelum masuk pipeline',
        'Penjaga gerbang Turnstile Gate persetujuan pimpinan'
      ]
    },
    {
      id: 4,
      name: 'Cubi Sentinel',
      role: 'Zero-Leak On-Premise Data Vault',
      accentColor: '#334155',
      npu: 'Hardware Encrypted SSD',
      model: 'AES-256 Vault Engine',
      network: 'LAN 2 (Air-Gapped Mesh)',
      egress: '0 Byte (Air-Gapped)',
      bio: 'Benteng pertahanan privasi data pelanggan showroom. Menjamin 100% nomor WhatsApp, riwayat penawaran, dan data transaksi tersimpan terenkripsi di drive lokal NUC tanpa risiko kebocoran.',
      capabilities: [
        'Enkripsi lokal hardware SSD terhadap seluruh database leads',
        'Isolasi penuh dari internet publik dan crawler eksternal',
        'Audit log aktivitas agen tanpa dependensi server pihak ketiga',
        'Kepatuhan ketat kedaulatan data privasi showroom motor'
      ]
    }
  ]

  const maxOffset = Math.max(0, teamMembers.length - 4)

  const handlePrev = () => {
    setSlideOffset((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setSlideOffset((prev) => Math.min(maxOffset, prev + 1))
  }

  const handleOpenDetail = (member) => {
    setSelectedAgent(member)
  }

  const handleCloseDetail = () => {
    setSelectedAgent(null)
  }

  return (
    <section id="team-section" className="team-section">
      <div className="w-layout-blockcontainer container w-container">
        <div className="team-slider-row">
          
          {/* Section Heading with Webflow grid */}
          <div className="section-heading sh-grid-2-1-1">
            <div className="section-title st-our-team" style={{ backgroundColor: '#F6F6F6' }}>
              <h2 anim-trigger="" className="h2 h2-lg uppercase" style={{ color: '#192A56', fontFamily: "'LabsAmiga', sans-serif" }}>
                TEAM AI
              </h2>
            </div>
            
            <div className="section-heading-descr shd-paddings-l hide-in-tablet">
              <div className="section-heading-descr-inner">
                <div className="section-descr-info">
                  <div className="section-descr-info-decor" />
                  <h3 className="section-descr-title font-mono text-xs sm:text-sm text-[#192A56]">
                    Autonomous Agent Mesh<br />On-Premise Sovereign Intelligence
                  </h3>
                </div>
              </div>
            </div>

            <div className="section-heading-controls">
              <div className="team-nav">
                <div
                  id="team-nav-prev-btn"
                  team-slider-prev=""
                  className="team-nav-button group"
                  onClick={handlePrev}
                  style={{ cursor: slideOffset > 0 ? 'pointer' : 'default', opacity: slideOffset > 0 ? 1 : 0.4 }}
                >
                  <div className="team-nav-image w-embed">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.3212 2.91429C14.3212 2.40934 13.9118 2 13.4069 2H11.5783C11.0734 2 10.664 2.40934 10.664 2.91429V4.28571C10.664 4.79066 10.2547 5.2 9.74975 5.2H8.37832C7.87337 5.2 7.46404 5.60934 7.46404 6.11429V7.48571C7.46404 7.99066 7.0547 8.4 6.54975 8.4H5.17832C4.67338 8.4 4.26404 8.80934 4.26404 9.31429V11.1429C4.26404 11.6478 4.67338 12.0571 5.17832 12.0571H7.00689C7.51184 12.0571 7.92118 12.4665 7.92118 12.9714V13.8857C7.92118 14.3907 8.33052 14.8 8.83546 14.8H10.2069C10.7118 14.8 11.1212 15.2093 11.1212 15.7143V17.0857C11.1212 17.5907 11.5305 18 12.0355 18H13.864C14.369 18 14.7783 17.5907 14.7783 17.0857V15.2571C14.7783 14.7522 14.369 14.3429 13.864 14.3429H12.4926C11.9877 14.3429 11.5783 13.9335 11.5783 13.4286V12.0571C11.5783 11.5522 11.169 11.1429 10.664 11.1429H8.83546C8.33052 11.1429 7.92118 10.7335 7.92118 10.2286V9.77143C7.92118 9.26648 8.33052 8.85714 8.83546 8.85714H10.2069C10.7118 8.85714 11.1212 8.4478 11.1212 7.94286V6.57143C11.1212 6.06648 11.5305 5.65714 12.0355 5.65714H13.4069C13.9118 5.65714 14.3212 5.2478 14.3212 4.74286V2.91429Z" fill="currentColor" className="transition-colors group-hover:fill-white group-active:fill-white"/>
                    </svg>
                  </div>
                </div>

                <div
                  id="team-nav-next-btn"
                  team-slider-next=""
                  className="team-nav-button group"
                  onClick={handleNext}
                  style={{ cursor: slideOffset < maxOffset ? 'pointer' : 'default', opacity: slideOffset < maxOffset ? 1 : 0.4 }}
                >
                  <div className="team-nav-image w-embed">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.67882 2.91429C5.67882 2.40934 6.08816 2 6.59311 2H8.42168C8.92663 2 9.33597 2.40934 9.33597 2.91429V4.28571C9.33597 4.79066 9.7453 5.2 10.2503 5.2H11.6217C12.1266 5.2 12.536 5.60934 12.536 6.11429V7.48571C12.536 7.99066 12.9453 8.4 13.4503 8.4H14.8217C15.3266 8.4 15.736 8.80934 15.736 9.31429V11.1429C15.736 11.6478 15.3266 12.0571 14.8217 12.0571H12.9931C12.4882 12.0571 12.0788 12.4665 12.0788 12.9714V13.8857C12.0788 14.3907 11.6695 14.8 11.1645 14.8H9.79311C9.28816 14.8 8.87882 15.2093 8.87882 15.7143V17.0857C11.1212 17.5907 11.5305 18 12.0355 18H13.864C14.369 18 14.7783 17.5907 14.7783 17.0857V15.2571C14.7783 14.7522 14.369 14.3429 13.864 14.3429H12.4926C11.9877 14.3429 11.5783 13.9335 11.5783 13.4286V12.0571C11.5783 11.5522 11.169 11.1429 10.664 11.1429H8.83546C8.33052 11.1429 7.92118 10.7335 7.92118 10.2286V9.77143C7.92118 9.26648 11.1645 8.85714 11.1645 8.85714H9.79311C9.28816 8.85714 8.87882 8.4478 8.87882 7.94286V6.57143C8.87882 6.06648 8.46948 5.65714 7.96454 5.65714H6.59311C6.08816 5.65714 5.67882 5.2478 5.67882 4.74286V2.91429Z" fill="currentColor" className="transition-colors group-hover:fill-white group-active:fill-white"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="team-graphic bg-white" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="graphic-block graphic-block-alt bg-white" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="graphic-block-decor graphic-block-decor-top-left" />
                <div className="graphic-block-decor graphic-block-decor-top-right" />
                <div className="graphic-block-decor graphic-block-decor-bottom-right" />
                <div className="graphic-block-decor graphic-block-decor-bottom-left" />
                <img
                  src="/assets/webflow/664753c2515af09bef5b9826/6669a7d5801e7b465282c67a_team-head-decor-image.webp"
                  loading="lazy"
                  width="364"
                  height="364"
                  alt=""
                  className="graphic-block-image"
                />
                <img
                  src="/assets/webflow/664753c2515af09bef5b9826/666871732bf5ee3068562b77_graphic-decor-testim.svg"
                  loading="lazy"
                  alt=""
                  className="team-info-decor"
                />
              </div>
            </div>
          </div>

          {/* Team Cards Slider Container */}
          <div className="team-slider-row-inner team" style={{ overflow: 'hidden' }}>
            <div
              className="team-slider-track"
              style={{
                display: 'flex',
                gap: '16px',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: `translateX(calc(-${slideOffset} * (280px + 16px)))`
              }}
            >
              {teamMembers.map((member) => {
                const isActive = selectedAgent?.id === member.id
                return (
                  <div
                    key={member.id}
                    className="team-slide-item"
                    style={{ minWidth: '280px', maxWidth: '320px', flex: '0 0 auto' }}
                  >
                    <div
                      team-card=""
                      className={`team-card ${isActive ? 'is-active' : ''}`}
                      style={{ position: 'relative' }}
                    >
                      {/* Head */}
                      <div className="team-card-head">
                        <h3 className="team-member-name font-bold text-sm text-[#192A56]">{member.name}</h3>
                        <div className="team-member-pos text-xs text-[#576574]">{member.role}</div>
                      </div>

                      {/* 3D Robot Character Avatar (Identik Maskot Hero) */}
                      <div className="team-card-body">
                        <div
                          view-bio=""
                          className="team-member-photo relative overflow-hidden bg-white border border-[#192A56]/10"
                          onClick={() => handleOpenDetail(member)}
                          style={{ cursor: 'pointer', height: '185px', width: '100%', position: 'relative' }}
                          title="Klik untuk lihat spesifikasi agen"
                        >
                          <RobotMascotCanvas
                            mode="robot"
                            cameraDistance={3.5}
                            accentColor={member.accentColor}
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="team-card-footer">
                        <div className="team-card-action">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              handleOpenDetail(member)
                            }}
                            className="view-bio w-inline-block hover:opacity-80 transition-opacity"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <span className="font-mono text-xs font-bold text-[#192A56]">Detail Agen</span>
                            <span className="font-mono text-xs text-[#192A56]">➔</span>
                          </button>
                        </div>
                        <div className="team-card-decor" style={{ borderColor: '#192A56' }} />
                        <div className="team-card-decor tcd-right" style={{ borderColor: '#192A56' }} />
                      </div>

                      {/* Card Decor Corners: Biru Navy #192A56 */}
                      <span className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[#192A56]/60 pointer-events-none" />
                      <span className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-[#192A56]/60 pointer-events-none" />
                      <span className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-[#192A56]/60 pointer-events-none" />
                      <span className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-[#192A56]/60 pointer-events-none" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Cyber Agent Specification Modal Dialog (Modul Detail Agen) */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 bg-[#192A56]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#192A56] max-w-xl w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* 4 Corner Bracket Decors */}
            <span className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-[#192A56]" />
            <span className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-[#192A56]" />
            <span className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-[#192A56]" />
            <span className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-[#192A56]" />

            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#192A56]/20 pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 bg-[#0047FF] rounded-full animate-pulse" />
                  <span className="font-mono text-[10px] font-bold text-[#0047FF] uppercase tracking-wider">
                    ON-PREMISE AI AGENT SPECIFICATION
                  </span>
                </div>
                <h3 className="font-mono text-xl sm:text-2xl font-extrabold text-[#192A56] uppercase tracking-tight">
                  {selectedAgent.name}
                </h3>
                <div className="font-mono text-xs text-[#576574] font-semibold mt-0.5">
                  {selectedAgent.role}
                </div>
              </div>
              <button
                onClick={handleCloseDetail}
                className="w-8 h-8 border border-[#192A56]/30 bg-white hover:bg-[#192A56] hover:text-white flex items-center justify-center font-mono font-bold text-sm transition-colors cursor-pointer"
                title="Tutup"
              >
                ✕
              </button>
            </div>

            {/* Telemetry Hardware 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-5 font-mono">
              <div className="p-3 bg-white border border-[#192A56]/20 shadow-xs">
                <div className="text-[10px] text-[#576574] uppercase font-bold">NPU ENGINE</div>
                <div className="text-xs sm:text-sm font-bold text-[#192A56] mt-0.5">{selectedAgent.npu}</div>
              </div>
              <div className="p-3 bg-white border border-[#192A56]/20 shadow-xs">
                <div className="text-[10px] text-[#576574] uppercase font-bold">MODEL RUNTIME</div>
                <div className="text-xs sm:text-sm font-bold text-[#192A56] mt-0.5">{selectedAgent.model}</div>
              </div>
              <div className="p-3 bg-white border border-[#192A56]/20 shadow-xs">
                <div className="text-[10px] text-[#576574] uppercase font-bold">NETWORK BUS</div>
                <div className="text-xs sm:text-sm font-bold text-[#192A56] mt-0.5">{selectedAgent.network}</div>
              </div>
              <div className="p-3 bg-white border border-[#192A56]/20 shadow-xs">
                <div className="text-[10px] text-[#576574] uppercase font-bold">CLOUD EGRESS</div>
                <div className="text-xs sm:text-sm font-bold text-[#0047FF] mt-0.5">{selectedAgent.egress}</div>
              </div>
            </div>

            {/* Deskripsi Agen */}
            <div className="mb-5">
              <div className="font-mono text-xs font-bold text-[#192A56] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#192A56] block" />
                Deskripsi Operasional Showroom
              </div>
              <p className="font-mono text-xs sm:text-[13px] text-[#192A56]/80 leading-relaxed bg-slate-50 p-3 border border-[#192A56]/15">
                {selectedAgent.bio}
              </p>
            </div>

            {/* Kapabilitas Utama */}
            <div className="mb-6">
              <div className="font-mono text-xs font-bold text-[#192A56] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#0047FF] block" />
                Kapabilitas &amp; Tanggung Jawab
              </div>
              <ul className="space-y-1.5 font-mono text-xs text-[#576574]">
                {selectedAgent.capabilities?.map((cap, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#0047FF] font-bold">✔</span>
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#192A56]/20">
              <button
                onClick={handleCloseDetail}
                className="px-4 py-2 bg-white border border-[#192A56]/30 hover:bg-[#192A56]/10 font-mono text-xs font-bold text-[#192A56] transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  handleCloseDetail()
                  onNavigate?.('office', { agentId: selectedAgent.id })
                }}
                className="px-5 py-2 bg-[#192A56] hover:bg-[#0E1A38] text-white font-mono text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 border border-[#192A56]"
              >
                <span>Buka di Virtual Office</span>
                <span>➔</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  )
}
