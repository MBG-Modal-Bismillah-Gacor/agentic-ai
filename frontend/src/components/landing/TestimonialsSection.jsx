import React, { useState } from 'react'

export function TestimonialsSection() {
  const [slideOffset, setSlideOffset] = useState(0)

  // Testimoni Bahasa Indonesia pimpinan & mitra enterprise StelAgent
  const reviews = [
    {
      id: 0,
      name: 'Lord AIC',
      pos: 'Head of Enterprise & Sovereign AI Infrastructure',
      photo: '/assets/webflow/6649e26c9fdc8739cefdc48e/668691c8f2a9887479f76c68_IMG_7357%20(1).png',
      quote: 'Implementasi swarm agen AI on-premise StelAgent (Agentic AI) mentransformasi seluruh efisiensi penjualan showroom motor kami. Data pelanggan tetap berada 100% di server lokal tanpa kebocoran cloud, dan kecepatan closing deal meningkat drastis.',
      social: 'https://twitter.com'
    },
    {
      id: 1,
      name: 'Alfa',
      pos: 'Showroom Digital Director & Sales Automation Lead',
      photo: '/assets/webflow/6649e26c9fdc8739cefdc48e/668690fe0425e7f09e3bcc05_2024-07-04%2013.09.29.jpg',
      quote: 'Dengan arsitektur turnstile approval, pimpinan memiliki kendali veto penuh sebelum penawaran motor dikirim via WhatsApp. Tidak ada risiko salah harga atau diskon sepihak oleh AI.',
      social: 'https://linkedin.com'
    },
    {
      id: 2,
      name: 'Amirul',
      pos: 'Chief Technology Officer, Dealer Group Network',
      photo: '/assets/webflow/6649e26c9fdc8739cefdc48e/668690a922ccdba3f4e8b848_1631126686830.jpeg',
      quote: 'Kemampuan integrasi NPU lokal dengan FastAPI sub-detik membuat armada agen bekerja tanpa biaya token API cloud bulanan. Solusi paling stabil, efisien, dan ekonomis untuk jaringan dealer.',
      social: 'https://linkedin.com'
    },
    {
      id: 3,
      name: 'Idham',
      pos: 'VP of Automotive Operations & Dealer Growth',
      photo: '/assets/webflow/6649e26c9fdc8739cefdc48e/666af59beb89fed9459b569d_Cristian.webp',
      quote: 'Kualifikasi prospek otomatis (Hot, Warm, Cold) oleh agen analis memfilter ratusan nomor harian dengan sangat akurat. Tim sales kami sekarang hanya fokus mengeksekusi closing pelanggan siap beli.',
      social: 'https://linkedin.com'
    },
    {
      id: 4,
      name: 'Jullystian',
      pos: 'Head of Information Security & On-Premise Systems',
      photo: '/assets/webflow/6649e26c9fdc8739cefdc48e/66869057d29156f451184962_2024-07-04%2013.06.41.jpg',
      quote: 'Sebagai penanggung jawab keamanan data, isolasi air-gapped dan enkripsi hardware SSD lokal pada StelAgent memberikan jaminan kedaulatan privasi data pelanggan yang sangat kami butuhkan.',
      social: 'https://twitter.com'
    },
    {
      id: 5,
      name: 'M Hasbi',
      pos: 'Business Development & Fleet Sales Executive',
      photo: '/assets/webflow/6649e26c9fdc8739cefdc48e/666af435483b5a1f90235cf0_Vlad-Balaban.webp',
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
                    <div className="testimonials-item" style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(25, 42, 86, 0.15)' }}>
                      <div className="w-layout-vflex">
                        <div className="testimonial-card-head" style={{ borderBottom: '1px solid rgba(25, 42, 86, 0.1)' }}>
                          <div className="testimonial-card-photo">
                            <div className="testimonial-card-photo-inner">
                              <img
                                src={r.photo}
                                loading="lazy"
                                alt={r.name}
                                className="testimonial-card-photo-image"
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
