import React, { useState, useEffect } from 'react'

export function PortfolioSection({ onNavigate }) {
  const [slideOffset, setSlideOffset] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)

  const projects = [
    {
      id: 0,
      category: 'Dealer Otomotif',
      title: 'Dealer Motor Honda & Showroom',
      tagline: 'Kualifikasi prospek Telegram & simulasi DP instan 24/7',
      agentId: 'green-agent',
      metric1: '14.800+',
      label1: 'Prospek Lead',
      metric2: '92',
      label2: 'Showroom Aktif',
      metric3: '700%',
      label3: 'Konversi Deal',
      metric4: '< 2 Detik',
      label4: 'Respon Kilat'
    },
    {
      id: 1,
      category: 'Enterprise & B2B',
      title: 'Enterprise & Deal Closing',
      tagline: 'Supervisi pipeline penjualan korporasi & otorisasi gerbang pimpinan',
      agentId: 'boss',
      metric1: 'Rp 450M',
      label1: 'Pipeline GTV',
      metric2: '1.000%',
      label2: 'Speed-to-Lead',
      metric3: '24/7',
      label3: 'Otonom Penuh',
      metric4: '99.9%',
      label4: 'Akurasi Lead'
    },
    {
      id: 2,
      category: 'Agency Digital',
      title: 'Agency & Software House',
      tagline: 'Otomatisasi respon klien, draf penawaran, & privasi kode',
      agentId: 'blue-agent',
      metric1: '150+',
      label1: 'Klien Aktif',
      metric2: '7x',
      label2: 'Kecepatan Respon',
      metric3: '0 Egress',
      label3: 'Data Pribadi',
      metric4: 'Instant',
      label4: 'Draf Penawaran'
    },
    {
      id: 3,
      category: 'Startup Mandiri',
      title: 'Startup & Solo Founder',
      tagline: 'Armada AI co-founder 24 jam tanpa biaya bulanan token cloud',
      agentId: 'purple-agent',
      metric1: '10x',
      label1: 'Efisiensi Kerja',
      metric2: '85%',
      label2: 'Hemat Biaya',
      metric3: '100+',
      label3: 'Deal Terkualifikasi',
      metric4: '0 Beban',
      label4: 'Token API Cloud'
    },
    {
      id: 4,
      category: 'Finansial & Legal',
      title: 'Kantor Notaris & Konsultan Legal',
      tagline: 'Penyimpanan terenkripsi berkas rahasia klien di SSD lokal hardware',
      agentId: 'orange-agent',
      metric1: '0.00ms',
      label1: 'Kebocoran Cloud',
      metric2: '100%',
      label2: 'Data Berdaulat',
      metric3: '48 TOPS',
      label3: 'Hardware NPU',
      metric4: 'Lokal',
      label4: 'Storage SSD'
    },
    {
      id: 5,
      category: 'Retail & Multi-Cabang',
      title: 'Distributor & Jaringan Retail',
      tagline: 'Sinkronisasi stok barang antar-cabang & asistensi pemesanan pembeli',
      agentId: 'blue-agent',
      metric1: '24/7',
      label1: 'Siap Melayani',
      metric2: '98.6%',
      label2: 'Kepuasan Pembeli',
      metric3: '5 Agen',
      label3: 'Swarm Aktif',
      metric4: '100%',
      label4: 'Aman Terisolasi'
    }
  ]

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setItemsPerView(1)
      else if (window.innerWidth < 1180) setItemsPerView(2)
      else setItemsPerView(3)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Cukup 2x slide ke kanan lalu kembali ke awal (0 -> 1 -> 2 -> 0)
  const maxOffset = 2

  useEffect(() => {
    if (slideOffset > maxOffset) {
      setSlideOffset(0)
    }
  }, [slideOffset])

  const handlePrev = () => {
    setSlideOffset((prev) => (prev <= 0 ? maxOffset : prev - 1))
  }

  const handleNext = () => {
    setSlideOffset((prev) => (prev >= maxOffset ? 0 : prev + 1))
  }

  const handleOpenSetup = (p) => {
    onNavigate?.('office', { agentId: p.agentId })
  }

  return (
    <section id="portfolio-section" className="portfolio-section relative z-10 w-full bg-white border-b border-[#192A56]/20 py-12 sm:py-16 clear-both overflow-hidden">
      
      <div className="w-layout-blockcontainer container portfolio-container w-container relative z-10">
        
        {/* Top Header: Title Block on Left & All Projects Counter with Controls on Right (Sesuai targetpengguna1.png) */}
        <div className="portfolio-top flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          
          {/* Main Title Box */}
          <div className="portfolio-main bg-white border border-[#192A56]/30 p-6 sm:p-8 max-w-xl shadow-xs relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 bg-[#192A56] block" />
              <span className="font-mono font-bold text-xs uppercase tracking-widest text-[#192A56]/70">
                USE CASES &amp; SOLUSI
              </span>
            </div>
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase text-[#192A56] tracking-tight leading-none"
              style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
            >
              TARGET PENGGUNA
            </h2>
          </div>

          {/* Right Column: Setup Counter Box (Kotak Atas Item + Arrow) + Carousel Controls Below (Di Kanan) */}
          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            {/* Setup Counter Box (Identik targetpengguna1.png: All Projects with dark top-right square arrow, count below) */}
            <a
              href="/office"
              onClick={(e) => {
                e.preventDefault()
                onNavigate?.('office')
              }}
              className="portfolio-all border border-[#192A56]/30 bg-white hover:border-[#192A56] transition-all no-underline group shadow-xs cursor-pointer block min-w-[170px]"
              title="Masuk ke Virtual Office untuk melihat setup agen"
            >
              {/* Top row: All Projects text on left, dark square with arrow on right (Kotak atasnya item) */}
              <div className="flex items-stretch justify-between border-b border-[#192A56]/20 bg-white">
                <div className="text-[11px] font-mono text-[#576574] group-hover:text-[#192A56] uppercase font-bold px-3.5 py-2 flex items-center">
                  All Projects
                </div>
                <div className="w-9 h-9 bg-[#192A56] group-hover:bg-[#0E1A38] flex items-center justify-center transition-colors shrink-0">
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                    <path
                      transform="rotate(180 10 10)"
                      d="M14.3212 2.91429C14.3212 2.40934 13.9118 2 13.4069 2H11.5783C11.0734 2 10.664 2.40934 10.664 2.91429V4.28571C10.664 4.79066 10.2547 5.2 9.74975 5.2H8.37832C7.87337 5.2 7.46404 5.60934 7.46404 6.11429V7.48571C7.46404 7.99066 7.0547 8.4 6.54975 8.4H5.17832C4.67338 8.4 4.26404 8.80934 4.26404 9.31429V11.1429C4.26404 11.6478 4.67338 12.0571 5.17832 12.0571H7.00689C7.51184 12.0571 7.92118 12.4665 7.92118 12.9714V13.8857C7.92118 14.3907 8.33052 14.8 8.83546 14.8H10.2069C10.7118 14.8 11.1212 15.2093 11.1212 15.7143V17.0857C11.1212 17.5907 11.5305 18 12.0355 18H13.864C14.369 18 14.7783 17.5907 14.7783 17.0857V15.2571C14.7783 14.7522 14.369 14.3429 13.864 14.3429H12.4926C11.9877 14.3429 11.5783 13.9335 11.5783 13.4286V12.0571C11.5783 11.5522 11.169 11.1429 10.664 11.1429H8.83546C8.33052 11.1429 7.92118 10.7335 7.92118 10.2286V9.77143C7.92118 9.26648 8.33052 8.85714 8.83546 8.85714H10.2069C10.7118 8.85714 11.1212 8.4478 11.1212 7.94286V6.57143C11.1212 6.06648 11.5305 5.65714 12.0355 5.65714H13.4069C13.9118 5.65714 14.3212 5.2478 14.3212 4.74286V2.91429Z"
                      fill="#FFFFFF"
                    />
                  </svg>
                </div>
              </div>
              {/* Bottom row: Large 06 count */}
              <div className="portfolio-count font-mono font-bold text-3xl sm:text-4xl text-[#192A56] leading-none px-3.5 py-3 bg-white">
                0{projects.length}
              </div>
            </a>

            {/* Navigation Buttons: Terletak di kanan bawah target pengguna dengan hover biru (#192A56) dan arrow warna putih */}
            <div className="flex items-center shadow-xs">
              <button
                onClick={handlePrev}
                className="w-11 h-11 bg-white border border-[#192A56]/30 text-[#192A56] hover:bg-[#192A56] hover:text-white active:bg-[#192A56] active:text-white flex items-center justify-center transition-all cursor-pointer group"
                title="Use Case Sebelumnya"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M14.3212 2.91429C14.3212 2.40934 13.9118 2 13.4069 2H11.5783C11.0734 2 10.664 2.40934 10.664 2.91429V4.28571C10.664 4.79066 10.2547 5.2 9.74975 5.2H8.37832C7.87337 5.2 7.46404 5.60934 7.46404 6.11429V7.48571C7.46404 7.99066 7.0547 8.4 6.54975 8.4H5.17832C4.67338 8.4 4.26404 8.80934 4.26404 9.31429V11.1429C4.26404 11.6478 4.67338 12.0571 5.17832 12.0571H7.00689C7.51184 12.0571 7.92118 12.4665 7.92118 12.9714V13.8857C7.92118 14.3907 8.33052 14.8 8.83546 14.8H10.2069C10.7118 14.8 11.1212 15.2093 11.1212 15.7143V17.0857C11.1212 17.5907 11.5305 18 12.0355 18H13.864C14.369 18 14.7783 17.5907 14.7783 17.0857V15.2571C14.7783 14.7522 14.369 14.3429 13.864 14.3429H12.4926C11.9877 14.3429 11.5783 13.9335 11.5783 13.4286V12.0571C11.5783 11.5522 11.169 11.1429 10.664 11.1429H8.83546C8.33052 11.1429 7.92118 10.7335 7.92118 10.2286V9.77143C7.92118 9.26648 8.33052 8.85714 8.83546 8.85714H10.2069C10.7118 8.85714 11.1212 8.4478 11.1212 7.94286V6.57143C11.1212 6.06648 11.5305 5.65714 12.0355 5.65714H13.4069C13.9118 5.65714 14.3212 5.2478 14.3212 4.74286V2.91429Z"
                    fill="currentColor"
                    className="text-[#192A56] group-hover:text-white group-active:text-white transition-colors"
                  />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="w-11 h-11 bg-white border border-[#192A56]/30 border-l-0 text-[#192A56] hover:bg-[#192A56] hover:text-white active:bg-[#192A56] active:text-white flex items-center justify-center transition-all cursor-pointer group"
                title="Use Case Berikutnya"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path
                    transform="rotate(180 10 10)"
                    d="M14.3212 2.91429C14.3212 2.40934 13.9118 2 13.4069 2H11.5783C11.0734 2 10.664 2.40934 10.664 2.91429V4.28571C10.664 4.79066 10.2547 5.2 9.74975 5.2H8.37832C7.87337 5.2 7.46404 5.60934 7.46404 6.11429V7.48571C7.46404 7.99066 7.0547 8.4 6.54975 8.4H5.17832C4.67338 8.4 4.26404 8.80934 4.26404 9.31429V11.1429C4.26404 11.6478 4.67338 12.0571 5.17832 12.0571H7.00689C7.51184 12.0571 7.92118 12.4665 7.92118 12.9714V13.8857C7.92118 14.3907 8.33052 14.8 8.83546 14.8H10.2069C10.7118 14.8 11.1212 15.2093 11.1212 15.7143V17.0857C11.1212 17.5907 11.5305 18 12.0355 18H13.864C14.369 18 14.7783 17.5907 14.7783 17.0857V15.2571C14.7783 14.7522 14.369 14.3429 13.864 14.3429H12.4926C11.9877 14.3429 11.5783 13.9335 11.5783 13.4286V12.0571C11.5783 11.5522 11.169 11.1429 10.664 11.1429H8.83546C8.33052 11.1429 7.92118 10.7335 7.92118 10.2286V9.77143C7.92118 9.26648 8.33052 8.85714 8.83546 8.85714H10.2069C10.7118 8.85714 11.1212 8.4478 11.1212 7.94286V6.57143C11.1212 6.06648 11.5305 5.65714 12.0355 5.65714H13.4069C13.9118 5.65714 14.3212 5.2478 14.3212 4.74286V2.91429Z"
                    fill="currentColor"
                    className="text-[#192A56] group-hover:text-white group-active:text-white transition-colors"
                  />
                </svg>
              </button>
            </div>
          </div>

        </div>

        {/* Carousel Slider Cards (Matching ai/tarpe.png Layout) */}
        <div className="w-full overflow-hidden">
          <div
            className="flex gap-6 transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(calc(-${slideOffset} * (clamp(280px, 85vw, 360px) + 24px)))`
            }}
          >
            {projects.map((p) => (
              <div
                key={p.id}
                className="shrink-0 w-[clamp(280px,85vw,360px)]"
              >
                {/* Authentic Card Matching ai/tarpe.png */}
                <div 
                  className="portfolio-item layout-diff bg-white border border-[#192A56]/30 hover:border-[#192A56] transition-all flex flex-col justify-between shadow-xs relative"
                >
                  {/* Top Card: Category Tag at Top-Left, Prominent Title in Center, No Green Box */}
                  <div className="portfolio-item-top relative p-6 sm:p-7 flex flex-col items-center justify-between min-h-[220px] border-b border-[#192A56]/20 bg-white">
                    {/* Category tag at top-left corner */}
                    <div className="portfolio-item-category border-r border-b border-[#192A56]/25 bg-white px-3.5 py-1.5 font-mono text-xs text-[#192A56] font-bold">
                      {p.category}
                    </div>

                    {/* Clean Center Content matching tarpe.png style */}
                    <div className="w-full text-center my-auto py-4">
                      <h3 
                        className="text-xl sm:text-2xl font-extrabold text-[#192A56] leading-tight mb-2 uppercase tracking-tight"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {p.title}
                      </h3>
                      <p className="text-xs font-mono text-[#576574] leading-relaxed max-w-xs mx-auto">
                        {p.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Card: 2x2 Metric Grid + Right Vertical Rectangular Arrow Button (Sesuai tarpe.png) */}
                  <div className="portfolio-item-bottom margin-top-auto flex items-stretch bg-white">
                    {/* 2x2 Metric List */}
                    <div className="portfolio-item-list grid grid-cols-2 flex-1 border-r border-[#192A56]/20">
                      <div className="p-3.5 border-r border-b border-[#192A56]/20 bg-white">
                        <div className="font-mono font-bold text-sm sm:text-base text-[#192A56] leading-tight">{p.metric1}</div>
                        <div className="text-[10px] font-mono text-[#576574] uppercase mt-0.5">{p.label1}</div>
                      </div>
                      <div className="p-3.5 border-b border-[#192A56]/20 bg-white">
                        <div className="font-mono font-bold text-sm sm:text-base text-[#192A56] leading-tight">{p.metric2}</div>
                        <div className="text-[10px] font-mono text-[#576574] uppercase mt-0.5">{p.label2}</div>
                      </div>
                      <div className="p-3.5 border-r border-[#192A56]/20 bg-white">
                        <div className="font-mono font-bold text-sm sm:text-base text-[#192A56] leading-tight">{p.metric3}</div>
                        <div className="text-[10px] font-mono text-[#576574] uppercase mt-0.5">{p.label3}</div>
                      </div>
                      <div className="p-3.5 bg-white">
                        <div className="font-mono font-bold text-sm sm:text-base text-[#192A56] leading-tight">{p.metric4}</div>
                        <div className="text-[10px] font-mono text-[#576574] uppercase mt-0.5">{p.label4}</div>
                      </div>
                    </div>

                    {/* Vertical Rectangular Link Button (➔) matching tarpe.png */}
                    <div
                      onClick={() => handleOpenSetup(p)}
                      className="portfolio-item-link group w-16 sm:w-20 bg-white hover:bg-[#192A56] flex items-center justify-center transition-colors cursor-pointer select-none"
                      style={{ filter: 'none' }}
                      title="Lihat Detail Setup di Virtual Office"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="portfolio-item-arrow transition-transform group-hover:translate-x-1">
                        <path
                          transform="rotate(180 10 10)"
                          d="M14.3212 2.91429C14.3212 2.40934 13.9118 2 13.4069 2H11.5783C11.0734 2 10.664 2.40934 10.664 2.91429V4.28571C10.664 4.79066 10.2547 5.2 9.74975 5.2H8.37832C7.87337 5.2 7.46404 5.60934 7.46404 6.11429V7.48571C7.46404 7.99066 7.0547 8.4 6.54975 8.4H5.17832C4.67338 8.4 4.26404 8.80934 4.26404 9.31429V11.1429C4.26404 11.6478 4.67338 12.0571 5.17832 12.0571H7.00689C7.51184 12.0571 7.92118 12.4665 7.92118 12.9714V13.8857C7.92118 14.3907 8.33052 14.8 8.83546 14.8H10.2069C10.7118 14.8 11.1212 15.2093 11.1212 15.7143V17.0857C11.1212 17.5907 11.5305 18 12.0355 18H13.864C14.369 18 14.7783 17.5907 14.7783 17.0857V15.2571C14.7783 14.7522 14.369 14.3429 13.864 14.3429H12.4926C11.9877 14.3429 11.5783 13.9335 11.5783 13.4286V12.0571C11.5783 11.5522 11.169 11.1429 10.664 11.1429H8.83546C8.33052 11.1429 7.92118 10.7335 7.92118 10.2286V9.77143C7.92118 9.26648 8.33052 8.85714 8.83546 8.85714H10.2069C10.7118 8.85714 11.1212 8.4478 11.1212 7.94286V6.57143C11.1212 6.06648 11.5305 5.65714 12.0355 5.65714H13.4069C13.9118 5.65714 14.3212 5.2478 14.3212 4.74286V2.91429Z"
                          fill="currentColor"
                          className="text-[#192A56] group-hover:text-white transition-colors"
                        />
                      </svg>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
