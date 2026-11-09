import React, { useState } from 'react'

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0)

  const faqs = [
    {
      q: 'Bagaimana cara kerja arsitektur AI Agent on-premise di Kantor AI?',
      a: 'Agen cerdas dijalankan secara lokal di hardware server fisik (MSI Cubi NUC Intel Core 7) menggunakan model neural Ollama/Qwen. Seluruh prompt, histori percakapan, dan basis data pelanggan tidak pernah diunggah ke cloud publik pihak ketiga.'
    },
    {
      q: 'Apakah pimpinan tetap memegang kendali sebelum penawaran dikirim?',
      a: 'Ya. Sistem turnstile Human-in-the-Loop mewajibkan verifikasi direktur untuk penawaran atau diskon di atas limit sebelum bot WhatsApp mengeksekusi pengiriman kepada konsumen.'
    },
    {
      q: 'Berapa banyak agen AI yang dapat aktif bersamaan dalam satu jaringan mesh?',
      a: 'Arsitektur mesh kami mendukung orkestrasi puluhan persona spesialis (Sales Engineer, Deal Strategist, Outbound Specialist, Pipeline Analyst) yang saling berkolaborasi tanpa beban latensi cloud.'
    },
    {
      q: 'Bagaimana status sinkronisasi backend dan realtime telemetry?',
      a: 'Frontend dan backend terhubung via WebSocket & REST API di localhost:8000 dengan latensi di bawah 1 milidetik untuk pelacakan status penugasan agen dan audit lead real-time.'
    },
    {
      q: 'Sektor dan industri apa saja yang paling cocok menggunakan solusi ini?',
      a: 'Dealer otomotif, agen properti, multifinance, manufaktur industri, dan organisasi enterprise yang memprioritaskan kedaulatan data rahasia serta kecepatan respon konsumen.'
    }
  ]

  const toggleAccordion = (idx) => {
    setOpenIdx((prev) => (prev === idx ? null : idx))
  }

  return (
    <section id="faq-section" className="faq-section">
      <div className="container">
        <div>
          {/* Section Heading with Webflow grid 1-1-2 */}
          <div className="section-heading sh-grid-1-1-2">
            <div className="section-title">
              <h2 anim-trigger="" className="h2 h2-lg faq-tablet">
                FAQ
              </h2>
              <img
                src="/assets/webflow/664753c2515af09bef5b9826/665dd11892bba241c17ceea5_decor-x.svg"
                loading="lazy"
                width="44"
                height="44"
                alt=""
                className="section-title-decor"
              />
            </div>

            <div className="section-heading-illustration">
              <div className="graphic-block graphic-block-alt">
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
              </div>
            </div>

            <div className="section-heading-descr hide-in-tablet">
              <div className="section-heading-descr-inner">
                <div className="section-descr-info">
                  <div className="section-descr-info-decor" />
                  <h3 className="section-descr-title">
                    Most Common Questions
                  </h3>
                </div>
                <div className="section-descr-text">
                  No worries, here you can find all the answers
                </div>
              </div>
            </div>
          </div>

          <div className="gap-vertical show-in-tablet" />

          {/* FAQ Accordion List */}
          <div className="faq-wrapper w-dyn-list">
            <div role="list" className="faq-listing w-dyn-items">
              {faqs.map((item, idx) => {
                const isOpen = openIdx === idx
                return (
                  <div key={idx} role="listitem" className="faq-item w-dyn-item">
                    <div
                      data-hover="false"
                      data-delay="0"
                      className={`accordion w-dropdown ${isOpen ? 'w--open' : ''}`}
                    >
                      <div
                        className={`accordion-toggle w-dropdown-toggle ${isOpen ? 'w--open' : ''}`}
                        onClick={() => toggleAccordion(idx)}
                        style={{ cursor: 'pointer' }}
                      >
                        <h3 className="accordion-title">{item.q}</h3>
                        <div className="accordion-button flex items-center justify-center shrink-0">
                          <div
                            className={`w-9 h-9 sm:w-10 sm:h-10 border border-[#192A56] flex items-center justify-center transition-all duration-200 ${
                              isOpen
                                ? 'bg-[#192A56] text-white'
                                : 'bg-white hover:bg-[#192A56] text-[#192A56] hover:text-white'
                            }`}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
                            >
                              <line x1="8" y1="1" x2="8" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
                              <line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <nav
                        className={`accordion-content w-dropdown-list ${isOpen ? 'w--open' : ''}`}
                        style={{
                          display: isOpen ? 'block' : 'none',
                          height: 'auto',
                          overflow: 'hidden'
                        }}
                      >
                        <div className="accordion-content-inner">
                          <div className="faq-answer w-richtext">
                            <p>{item.a}</p>
                          </div>
                        </div>
                      </nav>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
