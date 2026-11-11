import React, { useState } from 'react'

function DefaultAvatar({ name, initials, badgeColor = '#192A56' }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#F1F5F9',
        border: '1.5px solid rgba(25, 42, 86, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none'
      }}
    >
      {/* Background Subtle Gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(25,42,86,0.06) 0%, rgba(2,132,199,0.08) 100%)',
        }}
      />
      {/* Executive Silhouette Icon + Initials */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8" r="4.2" fill={badgeColor} fillOpacity="0.85" />
          <path d="M4.5 19.5C4.5 15.634 7.634 12.5 11.5 12.5H12.5C16.366 12.5 19.5 15.634 19.5 19.5V20.5H4.5V19.5Z" fill={badgeColor} fillOpacity="0.85" />
        </svg>
        <span style={{ fontSize: '10px', fontWeight: 'bold', color: badgeColor, letterSpacing: '0.05em', marginTop: '2px', fontFamily: 'monospace' }}>
          {initials}
        </span>
      </div>
      {/* Verified Pill Badge */}
      <div
        style={{
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#0284C7',
          border: '1.5px solid #FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Terverifikasi"
      >
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
          <path d="M2.5 5L4.2 6.7L7.5 3.3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  const [slideOffset, setSlideOffset] = useState(0)

  // 6 Testimoni Bahasa Indonesia sesuai permintaan pimpinan showroom & enterprise
  const reviews = [
    {
      id: 0,
      name: 'Lord AIC',
      initials: 'LA',
      pos: 'Head of Enterprise & Sovereign AI Infrastructure',
      quote: 'Implementasi swarm agen AI on-premise AICREW mentransformasi seluruh efisiensi penjualan showroom motor kami. Data pelanggan tetap berada 100% di server lokal tanpa kebocoran cloud, dan kecepatan closing deal meningkat drastis.',
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
      quote: 'Sebagai penanggung jawab keamanan data, isolasi air-gapped dan enkripsi hardware SSD lokal pada AICREW memberikan jaminan kedaulatan privasi data pelanggan yang sangat kami butuhkan.',
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
            <div className="testimonials-buttons">
              <div
                testimonial-slider-prev=""
                className="testimonials-button"
                onClick={handlePrev}
                style={{ cursor: slideOffset > 0 ? 'pointer' : 'default', opacity: slideOffset > 0 ? 1 : 0.4 }}
              >
                <img
                  src="/assets/webflow/664753c2515af09bef5b9826/664a3a099b0b49447af7fbec_arrow-prev.svg"
                  loading="lazy"
                  alt=""
                  className="testimonials-button-image"
                />
              </div>
              <div
                testimonial-slider-next=""
                className="testimonials-button testimonials-button-next"
                onClick={handleNext}
                style={{ cursor: slideOffset < maxOffset ? 'pointer' : 'default', opacity: slideOffset < maxOffset ? 1 : 0.4 }}
              >
                <img
                  src="/assets/webflow/664753c2515af09bef5b9826/664a3a095776d1c4b102d088_arrow-next.svg"
                  loading="lazy"
                  alt=""
                  className="testimonials-button-image"
                />
              </div>
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
                    <div className="testimonials-item">
                      <div className="w-layout-vflex">
                        <div className="testimonial-card-head">
                          <div className="testimonial-card-photo">
                            <div className="testimonial-card-photo-inner">
                              <DefaultAvatar name={r.name} initials={r.initials} />
                            </div>
                          </div>
                          <div className="testimonial-card-head-info">
                            <h3 className="testimonial-card-head-name">{r.name}</h3>
                            <div className="testimonial-card-head-pos">{r.pos}</div>
                          </div>
                        </div>
                      </div>

                      <div className="testimonial-card-body">
                        <div className="testimonial-card-text">
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