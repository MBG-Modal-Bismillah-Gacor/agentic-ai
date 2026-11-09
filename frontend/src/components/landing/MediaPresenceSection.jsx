import React, { useState } from 'react'

export function MediaPresenceSection() {
  const [slideOffset, setSlideOffset] = useState(0)
  const [hoveredAdvId, setHoveredAdvId] = useState(null)
  const [selectedAdvId, setSelectedAdvId] = useState(null)

  const advantageList = [
    {
      id: 0,
      number: '01',
      title: '100% Data Aman & Berdaulat',
      subtitle: 'Zero Cloud Egress Architecture',
      desc: 'Seluruh riwayat obrolan WhatsApp, negosiasi kredit motor Astra, dan data pribadi pelanggan disimpan lokal di SSD terenkripsi hardware MSI Cubi. Tidak ada satupun byte data yang keluar ke cloud publik.',
      badge: 'ENCRYPTED LOCAL STORAGE'
    },
    {
      id: 1,
      number: '02',
      title: 'Local On-Premise Execution',
      subtitle: 'Dedicated NPU Hardware Engine',
      desc: 'Model LLM canggih Qwen 2.5 beroperasi mandiri di akselerator hardware NPU 48 TOPS. Seluruh swarm agen tetap 100% aktif merespons meskipun jaringan internet kantor sedang offline.',
      badge: 'AIR-GAPPED NPU INFERENCE'
    },
    {
      id: 2,
      number: '03',
      title: 'Respon Kilat Tanpa Latensi',
      subtitle: 'Sub-Second Local Latency (< 1s)',
      desc: 'Tanpa antrean rate-limit API cloud eksternal. Respon analisis katalog motor, kalkulasi cicilan DP, dan rekomendasi unit dikirim ke prospek dalam hitungan milidetik secara instan.',
      badge: 'ULTRA LOW LATENCY'
    },
    {
      id: 3,
      number: '04',
      title: 'Turnstile Human-in-the-Loop',
      subtitle: 'Otorisasi Pimpinan Wajib',
      desc: 'Sistem pengamanan gerbang turnstile otomatis menahan draf penawaran final atau diskon khusus sampai pimpinan showroom (Pak Alfa) memberikan persetujuan resmi melalui tombol approval.',
      badge: 'EXECUTIVE APPROVAL GATE'
    },
    {
      id: 4,
      number: '05',
      title: 'Jaringan Terisolasi Dual LAN',
      subtitle: 'Air-Gapped Subnet Mesh',
      desc: 'Dukungan port ganda 2.5GbE LAN memisahkan jalur komunikasi agen internal dari jaringan publik showroom, mencegah kebocoran siber dan interferensi lalu lintas data.',
      badge: 'DUAL 2.5GbE ISOLATED'
    },
    {
      id: 5,
      number: '06',
      title: 'Bebas Biaya Token API Berulang',
      subtitle: 'Zero Recurring Cloud API Cost',
      desc: 'Tidak ada tagihan bulanan per-token yang membengkak seiring lonjakan volume leads WhatsApp showroom. Sekali investasi hardware on-premise untuk komputasi tak terbatas selamanya.',
      badge: '100% CAPEX ASSET'
    }
  ]

  // On desktop 4 columns visible, so maxOffset is advantageList.length - 4 = 2
  const maxOffset = Math.max(0, advantageList.length - 4)

  const handlePrev = () => {
    setSlideOffset((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setSlideOffset((prev) => Math.min(maxOffset, prev + 1))
  }

  return (
    <section id="media-section" className="media-section relative z-10 w-full bg-white border-b border-[#192A56]/20 py-10 sm:py-14 clear-both overflow-hidden">
      <div className="w-layout-blockcontainer container w-container relative z-10">
        
        {/* Top Header Bar matching ai/keunggulan ekosistem.png */}
        <div className="border border-[#192A56]/20 bg-white flex flex-col lg:flex-row items-stretch justify-between shadow-xs mb-0">
          
          {/* Left Title: Massive Cyber Heading + [X] Box */}
          <div className="flex items-center flex-1 min-w-0 border-b lg:border-b-0 lg:border-r border-[#192A56]/20">
            <div className="px-6 py-6 sm:px-8 sm:py-8 flex-1">
              <h2
                className="text-2xl sm:text-4xl md:text-5xl uppercase text-[#192A56] tracking-tight leading-none truncate"
                style={{ fontFamily: "'LabsAmiga', sans-serif" }}
              >
                KEUNGGULAN EKOSISTEM
              </h2>
            </div>
            
            {/* Boxed Cross [X] Decoration */}
            <div className="w-16 sm:w-20 self-stretch border-l border-[#192A56]/20 flex items-center justify-center bg-white shrink-0">
              <img
                src="/assets/webflow/664753c2515af09bef5b9826/665640330d1b87aa18aa9882_cross.svg"
                alt=""
                className="w-5 h-5 opacity-70"
              />
            </div>
          </div>

          {/* Center: 3D Spheres Block with 4 corner tick marks ┌ ┐ └ ┘ */}
          <div className="hidden md:flex w-32 sm:w-40 self-stretch border-b lg:border-b-0 lg:border-r border-[#192A56]/20 items-center justify-center relative p-3 shrink-0 bg-white">
            <span className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[#192A56]/40" />
            <span className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-[#192A56]/40" />
            <span className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-[#192A56]/40" />
            <span className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-[#192A56]/40" />
            <img
              src="/assets/webflow/664753c2515af09bef5b9826/6654a6cdaceb2d1c3b39c855_sphere.webp"
              alt="Ecosystem Spheres"
              className="w-16 h-16 object-contain"
              style={{ filter: 'grayscale(0.6)' }}
            />
          </div>

          {/* Right: < and > Arrow Navigation Controls */}
          <div className="flex items-center shrink-0 self-stretch bg-white">
            <button
              onClick={handlePrev}
              disabled={slideOffset === 0}
              className="w-14 sm:w-16 h-full min-h-[56px] border-r border-[#192A56]/20 bg-white hover:bg-[#192A56] active:bg-[#192A56] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer group"
              title="Sebelumnya"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M14.3212 2.91429C14.3212 2.40934 13.9118 2 13.4069 2H11.5783C11.0734 2 10.664 2.40934 10.664 2.91429V4.28571C10.664 4.79066 10.2547 5.2 9.74975 5.2H8.37832C7.87337 5.2 7.46404 5.60934 7.46404 6.11429V7.48571C7.46404 7.99066 7.0547 8.4 6.54975 8.4H5.17832C4.67338 8.4 4.26404 8.80934 4.26404 9.31429V11.1429C4.26404 11.6478 4.67338 12.0571 5.17832 12.0571H7.00689C7.51184 12.0571 7.92118 12.4665 7.92118 12.9714V13.8857C7.92118 14.3907 8.33052 14.8 8.83546 14.8H10.2069C10.7118 14.8 11.1212 15.2093 11.1212 15.7143V17.0857C11.1212 17.5907 11.5305 18 12.0355 18H13.864C14.369 18 14.7783 17.5907 14.7783 17.0857V15.2571C14.7783 14.7522 14.369 14.3429 13.864 14.3429H12.4926C11.9877 14.3429 11.5783 13.9335 11.5783 13.4286V12.0571C11.5783 11.5522 11.169 11.1429 10.664 11.1429H8.83546C8.33052 11.1429 7.92118 10.7335 7.92118 10.2286V9.77143C7.92118 9.26648 8.33052 8.85714 8.83546 8.85714H10.2069C10.7118 8.85714 11.1212 8.4478 11.1212 7.94286V6.57143C11.1212 6.06648 11.5305 5.65714 12.0355 5.65714H13.4069C13.9118 5.65714 14.3212 5.2478 14.3212 4.74286V2.91429Z"
                  fill="currentColor"
                  className="text-[#192A56] group-hover:fill-white transition-colors"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              disabled={slideOffset >= maxOffset}
              className="w-14 sm:w-16 h-full min-h-[56px] bg-white hover:bg-[#192A56] active:bg-[#192A56] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer group"
              title="Berikutnya"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M5.67882 2.91429C5.67882 2.40934 6.08816 2 6.59311 2H8.42168C8.92663 2 9.33597 2.40934 9.33597 2.91429V4.28571C9.33597 4.79066 9.7453 5.2 10.2503 5.2H11.6217C12.1266 5.2 12.536 5.60934 12.536 6.11429V7.48571C12.536 7.99066 12.9453 8.4 13.4503 8.4H14.8217C15.3266 8.4 15.736 8.80934 15.736 9.31429V11.1429C15.736 11.6478 15.3266 12.0571 14.8217 12.0571H12.9931C12.4882 12.0571 12.0788 12.4665 12.0788 12.9714V13.8857C12.0788 14.3907 11.6695 14.8 11.1645 14.8H9.79311C9.28816 14.8 8.87882 15.2093 8.87882 15.7143V17.0857C8.87882 17.5907 8.46948 18 7.96454 18H6.13597C5.63102 18 5.22168 17.5907 5.22168 17.0857V15.2571C5.22168 14.7522 5.63102 14.3429 6.13597 14.3429H7.50739C8.01234 14.3429 8.42168 13.9335 8.42168 13.4286V12.0571C8.42168 11.5522 8.83102 11.1429 9.33597 11.1429H11.1645C11.6695 11.1429 12.0788 10.7335 12.0788 10.2286V9.77143C12.0788 9.26648 11.6695 8.85714 11.1645 8.85714H9.79311C9.28816 8.85714 8.87882 8.4478 8.87882 7.94286V6.57143C8.87882 6.06648 8.46948 5.65714 7.96454 5.65714H6.59311C6.08816 5.65714 5.67882 5.2478 5.67882 4.74286V2.91429Z"
                  fill="currentColor"
                  className="text-[#192A56] group-hover:fill-white transition-colors"
                />
              </svg>
            </button>
          </div>

        </div>

        {/* 4 Columns Slider Row matching ai/keunggulan ekosistem.png */}
        <div className="w-full overflow-hidden border-l border-r border-b border-[#192A56]/20 bg-white">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${slideOffset * 25}%)`
            }}
          >
            {advantageList.map((adv) => {
              const isActive = hoveredAdvId === adv.id || selectedAdvId === adv.id
              return (
                <div
                  key={adv.id}
                  className="shrink-0 w-full sm:w-1/2 lg:w-1/4"
                >
                  {/* Authentic Minimalist Card with 4 Corner Ticks [   ] & Hover/Click Blue State */}
                  <div
                    onClick={() => setSelectedAdvId((prev) => (prev === adv.id ? null : adv.id))}
                    onMouseEnter={() => setHoveredAdvId(adv.id)}
                    onMouseLeave={() => setHoveredAdvId(null)}
                    className={`media-item border-r border-b border-[#192A56]/20 p-6 sm:p-7 relative min-h-[340px] flex flex-col justify-between transition-all cursor-pointer ${
                      isActive ? 'bg-white shadow-md' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    
                    {/* 4 Corner Bracket Markers - Berubah Biru Navy #192A56 (tema btn masuk ke aicrew) saat Hover / Klik */}
                    <span className={`absolute top-2.5 left-2.5 w-2.5 h-2.5 border-t-2 border-l-2 transition-all duration-200 ${isActive ? 'border-[#192A56]' : 'border-[#192A56]/30'}`} />
                    <span className={`absolute top-2.5 right-2.5 w-2.5 h-2.5 border-t-2 border-r-2 transition-all duration-200 ${isActive ? 'border-[#192A56]' : 'border-[#192A56]/30'}`} />
                    <span className={`absolute bottom-2.5 left-2.5 w-2.5 h-2.5 border-b-2 border-l-2 transition-all duration-200 ${isActive ? 'border-[#192A56]' : 'border-[#192A56]/30'}`} />
                    <span className={`absolute bottom-2.5 right-2.5 w-2.5 h-2.5 border-b-2 border-r-2 transition-all duration-200 ${isActive ? 'border-[#192A56]' : 'border-[#192A56]/30'}`} />

                    {/* Top Row: Point Title & Diagonal Arrow ↗ */}
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 block shrink-0 transition-transform duration-200 bg-[#192A56] ${isActive ? 'scale-125' : 'opacity-70'}`} />
                          <h3 className="font-mono font-bold text-sm sm:text-base text-[#192A56] leading-tight">
                            {adv.title}
                          </h3>
                        </div>
                        
                        {/* Diagonal Arrow Icon ↗ - Berubah Biru Navy #192A56 */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" className={`shrink-0 mt-0.5 transition-all duration-200 text-[#192A56] ${isActive ? 'scale-110 translate-x-0.5 -translate-y-0.5' : 'opacity-70'}`}>
                          <line x1="7" y1="17" x2="17" y2="7" />
                          <polyline points="7 7 17 7 17 17" />
                        </svg>
                      </div>

                      {/* Subtitle - Teks Berwarna Biru Navy #192A56 (Serasi dengan Tombol Masuk ke AICREW) */}
                      <div className="font-mono text-[11px] font-bold text-[#192A56] uppercase tracking-wider mb-3">
                        {adv.subtitle}
                      </div>

                      {/* Description Paragraph */}
                      <p className="font-mono text-xs sm:text-[13px] text-[#576574] leading-relaxed">
                        {adv.desc}
                      </p>
                    </div>

                    {/* Card Bottom: Badge */}
                    <div className="pt-4 mt-4 border-t border-[#192A56]/15 flex items-center justify-between text-[10px] font-mono font-bold text-[#192A56]/80 uppercase tracking-widest">
                      <span>POIN {adv.number}</span>
                      <span className={`px-2 py-0.5 border shadow-xs transition-colors bg-white ${isActive ? 'border-[#192A56] text-[#192A56] font-extrabold' : 'text-[#192A56]/80 border-[#192A56]/20'}`}>
                        {adv.badge}
                      </span>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}
