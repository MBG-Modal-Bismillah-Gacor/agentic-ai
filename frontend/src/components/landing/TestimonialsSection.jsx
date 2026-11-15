import React, { useState } from 'react'

// Generator Default Profile Picture (PP) yang tajam, kontras tinggi & presisi Webflow chamfer
function getDefaultAvatar(initials = 'AI') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
    <rect width="120" height="120" fill="#E2E8F0"/>
    <defs>
      <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#192A56" stop-opacity="0.10"/>
        <stop offset="100%" stop-color="#0284C7" stop-opacity="0.22"/>
      </linearGradient>
    </defs>
    <rect width="120" height="120" fill="url(#avatarGrad)"/>
    <!-- Executive Silhouette (Deep Navy Kontras Tinggi) -->
    <circle cx="60" cy="42" r="21" fill="#192A56"/>
    <path d="M22 108 C22 76, 38 66, 60 66 C82 66, 98 76, 98 108 Z" fill="#192A56"/>
    <!-- Initials Badge Pill -->
    <rect x="34" y="86" width="52" height="22" rx="11" fill="#192A56" stroke="#FFFFFF" stroke-width="2.5"/>
    <text x="60" y="101" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">${initials}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function TestimonialsSection() {
  const [slideOffset, setSlideOffset] = useState(0)

  // Testimoni Bahasa Indonesia pimpinan & mitra enterprise StelAgent
  const reviews = [
    {
      id: 0,
      name: 'Lord AIC',
      initials: 'LA',
      pos: 'Head of Enterprise & Sovereign AI Infrastructure',
      quote: 'Implementasi swarm agen AI on-premise StelAgent (Agentic AI) mentransformasi seluruh efisiensi penjualan showroom motor kami. Data pelanggan tetap berada 100% di server lokal tanpa kebocoran cloud, dan kecepatan closing deal meningkat drastis.',
      social: 'https://twitter.com'
    },
    {
      id: 1,
      name: 'Alfa',
      initials: 'AF',
      pos: 'Showroom Digital Director & Sales Automation Lead',
      quote: 'Dengan arsitektur turnstile approval, pimpinan memiliki kendali veto penuh sebelum penawaran motor dikirim via WhatsApp. Tidak ada risiko salah harga atau diskon sepihak oleh AI.',
      social: 'https://linkedin.com'
    },
    {
      id: 2,
      name: 'Amirul',
      initials: 'AM',
      pos: 'Chief Technology Officer, Dealer Group Network',
      quote: 'Kemampuan integrasi NPU lokal dengan FastAPI sub-detik membuat armada agen bekerja tanpa biaya token API cloud bulanan. Solusi paling stabil, efisien, dan ekonomis untuk jaringan dealer.',
      social: 'https://linkedin.com'
    },
    {
      id: 3,
      name: 'Idham',
      initials: 'ID',
      pos: 'VP of Automotive Operations & Dealer Growth',
      quote: 'Kualifikasi prospek otomatis (Hot, Warm, Cold) oleh agen analis memfilter ratusan nomor harian dengan sangat akurat. Tim sales kami sekarang hanya fokus mengeksekusi closing pelanggan siap beli.',
      social: 'https://linkedin.com'
    },
    {
      id: 4,
      name: 'Jullystian',
      initials: 'JL',
      pos: 'Head of Information Security & On-Premise Systems',
      quote: 'Sebagai penanggung jawab keamanan data, isolasi air-gapped dan enkripsi hardware SSD lokal pada StelAgent memberikan jaminan kedaulatan privasi data pelanggan yang sangat kami butuhkan.',
      social: 'https://twitter.com'
    },
    {
      id: 5,
      name: 'M Hasbi',
      initials: 'MH',
      pos: 'Business Development & Fleet Sales Executive',
      quote: 'Respon cepat 24/7 untuk simulasi kredit motor Honda dan pencocokan unit gudang berjalan mulus. Pengalaman pelanggan showroom kami naik ke standar modern yang belum pernah ada sebelumnya.',
      social: 'https://twitter.com'
    }
  ]

  const maxOffset = Math.max(0, reviews.length - 2)

  const handlePrev = () => {
    setSlideOffset((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setSlideOffset((prev) => Math.min(maxOffset, prev + 1))
  }

  return (
    <section id="reviews-section" className="testimonials-section relative z-10 bg-white border-b border-[#192A56]/20">
      <div className="w-layout-blockcontainer container w-container">
        <div>
          {/* Testimonials Heading */}
          <div className="testimonials-heading bg-white" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="testimonials-title" style={{ backgroundColor: '#F6F6F6' }}>
              <h2 anim-trigger="" className="h2 h2-tablet-lg whitespace-nowrap uppercase" style={{ color: '#192A56', whiteSpace: 'nowrap', fontFamily: "'LabsAmiga', sans-serif" }}>
                Testimonials
              </h2>
            </div>

            <div className="testimonials-info bg-white" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="section-heading-descr shd-paddings-l hide-in-tablet">
                <div className="section-heading-descr-inner">
                  <div className="section-descr-info">
                    <div className="section-descr-info-decor" />
                    <h3 className="section-descr-title font-mono text-xs sm:text-sm text-[#192A56]">
                      Pengalaman Nyata Mitra &amp; Pimpinan Enterprise
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="testimonials-graphic bg-white" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="graphic-block graphic-block-dark graphic-block-alt bg-white" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="graphic-block-decor graphic-block-decor-top-left" />
                <div className="graphic-block-decor graphic-block-decor-top-right" />
                <div className="graphic-block-decor graphic-block-decor-bottom-right" />
                <div className="graphic-block-decor graphic-block-decor-bottom-left" />
                <img
                  src="/assets/webflow/664753c2515af09bef5b9826/6654a5c3113a6f95af59c707_star.webp"
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
                  className="testimonials-info-decor"
                />
              </div>
            </div>
          </div>

          {/* Testimonials Slider Row */}
          <div className="testimonials-slider-row bg-white" style={{ backgroundColor: '#FFFFFF' }}>
            <style>{`
              .testimonials-button {
                background-color: #FFFFFF !important;
                border: 1px solid rgba(25, 42, 86, 0.2) !important;
                transition: background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease !important;
              }
              .testimonials-button:hover {
                background-color: #192A56 !important;
                border-color: #192A56 !important;
                filter: none !important;
              }
            `}</style>
            <div className="testimonials-buttons">
              <button
                type="button"
                testimonial-slider-prev=""
                className="testimonials-button group cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                onClick={handlePrev}
                disabled={slideOffset === 0}
                style={{
                  cursor: slideOffset > 0 ? 'pointer' : 'default',
                  opacity: slideOffset > 0 ? 1 : 0.35
                }}
                title="Testimonial Sebelumnya"
                aria-label="Previous Testimonial"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-[#192A56] group-hover:text-white transition-colors">
                  <path
                    d="M14.3208 2.91429C14.3208 2.40934 13.9115 2 13.4065 2H11.578C11.073 2 10.6637 2.40934 10.6637 2.91429V4.28571C10.6637 4.79066 10.2543 5.2 9.74938 5.2H8.37795C7.87301 5.2 7.46367 5.60934 7.46367 6.11429V7.48571C7.46367 7.99066 7.05433 8.4 6.54938 8.4H5.17795C4.67301 8.4 4.26367 8.80934 4.26367 9.31429V11.1429C4.26367 11.6478 4.67301 12.0571 5.17795 12.0571H7.00653C7.51147 12.0571 7.92081 12.4665 7.92081 12.9714V13.8857C7.92081 14.3907 8.33015 14.8 8.8351 14.8H10.2065C10.7115 14.8 11.1208 15.2093 11.1208 15.7143V17.0857C11.1208 17.5907 11.5302 18 12.0351 18H13.8637C14.3686 18 14.778 17.5907 14.778 17.0857V15.2571C14.778 14.7522 14.3686 14.3429 13.8637 14.3429H12.4922C11.9873 14.3429 11.578 13.9335 11.578 13.4286V12.0571C11.578 11.5522 11.1686 11.1429 10.6637 11.1429H8.8351C8.33015 11.1429 7.92081 10.7335 7.92081 10.2286V9.77143C7.92081 9.26648 8.33015 8.85714 8.8351 8.85714H10.2065C10.7115 8.85714 11.1208 8.4478 11.1208 7.94286V6.57143C11.1208 6.06648 11.5302 5.65714 12.0351 5.65714H13.4065C13.9115 5.65714 14.3208 5.2478 14.3208 4.74286V2.91429Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <button
                type="button"
                testimonial-slider-next=""
                className="testimonials-button testimonials-button-next group cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                onClick={handleNext}
                disabled={slideOffset >= maxOffset}
                style={{
                  cursor: slideOffset < maxOffset ? 'pointer' : 'default',
                  opacity: slideOffset < maxOffset ? 1 : 0.35
                }}
                title="Testimonial Berikutnya"
                aria-label="Next Testimonial"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-[#192A56] group-hover:text-white transition-colors">
                  <path
                    d="M5.67882 2.91429C5.67882 2.40934 6.08816 2 6.59311 2H8.42168C8.92663 2 9.33597 2.40934 9.33597 2.91429V4.28571C9.33597 4.79066 9.7453 5.2 10.2503 5.2H11.6217C12.1266 5.2 12.536 5.60934 12.536 6.11429V7.48571C12.536 7.99066 12.9453 8.4 13.4503 8.4H14.8217C15.3266 8.4 15.736 8.80934 15.736 9.31429V11.1429C15.736 11.6478 15.3266 12.0571 14.8217 12.0571H12.9931C12.4882 12.0571 12.0788 12.4665 12.0788 12.9714V13.8857C12.0788 14.3907 11.6695 14.8 11.1645 14.8H9.79311C9.28816 14.8 8.87882 15.2093 8.87882 15.7143V17.0857C8.87882 17.5907 8.46948 18 7.96454 18H6.13597C5.63102 18 5.22168 17.5907 5.22168 17.0857V15.2571C5.22168 14.7522 5.63102 14.3429 6.13597 14.3429H7.50739C8.01234 14.3429 8.42168 13.9335 8.42168 13.4286V12.0571C8.42168 11.5522 8.83102 11.1429 9.33597 11.1429H11.1645C11.6695 11.1429 12.0788 10.7335 12.0788 10.2286V9.77143C12.0788 9.26648 11.6695 8.85714 11.1645 8.85714H9.79311C9.28816 8.85714 8.87882 8.4478 8.87882 7.94286V6.57143C8.87882 6.06648 8.46948 5.65714 7.96454 5.65714H6.59311C6.08816 5.65714 5.67882 5.2478 5.67882 4.74286V2.91429Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>

            <div className="testimonials-slider" style={{ overflow: 'hidden' }}>
              <div
                className="testimonials-slider-track"
                style={{
                  display: 'flex',
                  gap: '24px',
                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: `translateX(calc(-${slideOffset} * (460px + 24px)))`
                }}
              >
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="testimonials-slide-item"
                    style={{ minWidth: '420px', maxWidth: '520px', flex: '0 0 auto' }}
                  >
                    <div className="testimonials-item" style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(25, 42, 86, 0.15)' }}>
                      <div className="w-layout-vflex">
                        <div className="testimonial-card-head" style={{ borderBottom: '1px solid rgba(25, 42, 86, 0.1)' }}>
                          <div className="testimonial-card-photo">
                            <div className="testimonial-card-photo-inner">
                              <img
                                src={getDefaultAvatar(r.initials)}
                                loading="lazy"
                                alt={r.name}
                                className="testimonial-card-photo-image"
                                style={{
                                  objectFit: 'cover',
                                  backgroundColor: '#E2E8F0',
                                  border: '1.5px solid rgba(25, 42, 86, 0.2)',
                                  display: 'block'
                                }}
                              />
                            </div>
                          </div>
                          <div className="testimonial-card-head-info">
                            <h3 className="testimonial-card-head-name" style={{ color: '#192A56', fontWeight: 600 }}>{r.name}</h3>
                            <div className="testimonial-card-head-pos" style={{ color: '#576574' }}>{r.pos}</div>
                          </div>
                        </div>
                      </div>

                      <div className="testimonial-card-body">
                        <div className="testimonial-card-text" style={{ color: '#192A56', fontSize: '0.875rem', lineHeight: 1.6 }}>
                          "{r.quote}"
                        </div>
                        <a
                          href={r.social}
                          target="_blank"
                          rel="noreferrer"
                          className="testimonials-social-col w-inline-block"
                        >
                          <img
                            src="/assets/webflow/664753c2515af09bef5b9826/666860093ca47e25c2035585_icon-X.svg"
                            loading="lazy"
                            width="26"
                            height="26"
                            alt=""
                            className="testimonial-social-icon"
                          />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
