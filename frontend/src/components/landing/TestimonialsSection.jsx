import React, { useState } from 'react'

export function TestimonialsSection() {
  const [slideOffset, setSlideOffset] = useState(0)

  const reviews = [
    {
      id: 0,
      name: 'Saulius Aleksa',
      pos: 'Head of Operations, AutoHub',
      photo: '/assets/webflow/6649e26c9fdc8739cefdc48e/668691c8f2a9887479f76c68_IMG_7357%20(1).png',
      quote: 'We started working with Kantor AI already 2 years into deployment. I immediately noticed a huge impact of the speed-to-signal, human-in-the-loop control, and honest engineering put into making our physical showroom workflows autonomous.',
      social: 'https://linkedin.com'
    },
    {
      id: 1,
      name: 'Paul Farhi',
      pos: 'Founder of AITech',
      photo: '/assets/webflow/6649e26c9fdc8739cefdc48e/668690fe0425e7f09e3bcc05_2024-07-04%2013.09.29.jpg',
      quote: 'The Kantor AI team played a pivotal role in our operational modernization. They established on-premise NPU processing that ensures client records never leak to the public cloud while automating WhatsApp follow-ups in seconds.',
      social: 'https://linkedin.com'
    },
    {
      id: 2,
      name: 'Tzahi Kanza',
      pos: 'Managing Director, Kima Network',
      photo: '/assets/webflow/6649e26c9fdc8739cefdc48e/668690a922ccdba3f4e8b848_1631126686830.jpeg',
      quote: 'Kantor AI has been an exceptional technology partner for our enterprise. The turnstile approval model gives management strict veto rights over high-value deals before anything is sent to prospective buyers.',
      social: 'https://linkedin.com'
    },
    {
      id: 3,
      name: 'Cristian',
      pos: 'Co-founder & CEO OMNIA',
      photo: '/assets/webflow/6649e26c9fdc8739cefdc48e/666af59beb89fed9459b569d_Cristian.webp',
      quote: 'Exceptional engineering leadership and high-density agent mesh. Their zero-latency local LLM stack eliminated our reliance on expensive cloud inference APIs while quadrupling closing velocity.',
      social: 'https://twitter.com'
    },
    {
      id: 4,
      name: 'Perry Kniest',
      pos: 'Founder Spidersilk',
      photo: '/assets/webflow/6649e26c9fdc8739cefdc48e/66869057d29156f451184962_2024-07-04%2013.06.41.jpg',
      quote: 'Truly genuine professionals who understand brutalist performance. The 3D spatial telemetry combined with edge computing hardware makes Kantor AI an industry standard.',
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
    <section id="reviews-section" className="testimonials-section">
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
                    <h3 className="section-descr-title">
                      Don't take our word for it
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
                              <img
                                src={r.photo}
                                loading="lazy"
                                alt={r.name}
                                className="testimonial-card-photo-image"
                              />
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
                          {r.quote}
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
