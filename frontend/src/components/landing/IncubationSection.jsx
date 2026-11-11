import React, { useState } from 'react'
import { RobotMascotCanvas } from './RobotMascotCanvas'

export function IncubationSection({ onNavigate }) {
  const [slideOffset, setSlideOffset] = useState(0)

  const slides = [
    { num: '01', name: 'Fundraise management', icon: '/assets/webflow/6649e26c9fdc8739cefdc48e/666aac7967116988122e445c_Fundraise-management.svg' },
    { num: '02', name: 'Treasury building', icon: '/assets/webflow/6649e26c9fdc8739cefdc48e/666aac89f3c816a71e90c096_Treasury-building.svg' },
    { num: '03', name: 'Strategic partnerships', icon: '/assets/webflow/6649e26c9fdc8739cefdc48e/666aac9d63e28ae1e1034a96_Strategic-partnerships.svg' },
    { num: '04', name: 'KOLs Management', icon: '/assets/webflow/6649e26c9fdc8739cefdc48e/666aacb349c345d241a0bc9f_KOLs-Management.svg' },
    { num: '05', name: 'Intro to Top CEXs', icon: '/assets/webflow/6649e26c9fdc8739cefdc48e/666aacca4748929ef2d7590c_Top-CEXs.svg' },
    { num: '06', name: 'Tokenization Strategy & Design', icon: '/assets/webflow/6649e26c9fdc8739cefdc48e/666aace04f85ccf9a4f3361d_Tokenization-Strategy-Design.svg' },
    { num: '07', name: 'GTM & Marketing support', icon: '/assets/webflow/6649e26c9fdc8739cefdc48e/666aacf559a32012ab873e83_GTM-Marketing-support.svg' },
    { num: '08', name: 'Website Design & Development', icon: '/assets/webflow/6649e26c9fdc8739cefdc48e/666aad0bba648054c1bd5bde_Website-Design-Development.svg' },
    { num: '09', name: 'PR strategy', icon: '/assets/webflow/6649e26c9fdc8739cefdc48e/666aad34133a6f4f73f76568_PR-strategy.svg' },
    { num: '10', name: 'Post TGE strategies', icon: '/assets/webflow/6649e26c9fdc8739cefdc48e/666aad4a28225aa07c06018d_Post-TGE-strategies.svg' },
    { num: '11', name: 'Social media growth', icon: '/assets/webflow/6649e26c9fdc8739cefdc48e/666aad5d6c148bfd7afd82c5_Social-media-growth.svg' }
  ]

  const maxOffset = Math.max(0, slides.length - 3)

  const handlePrev = () => {
    setSlideOffset((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setSlideOffset((prev) => Math.min(maxOffset, prev + 1))
  }

  return (
    <section id="incubation-section" className="incubation-section support-slider-section">
      
      {/* Incubation Top */}
      <div className="incubation-top">
        <div className="incubation-left">
          <div className="graphic-block incubation-graphic-big">
            <div className="graphic-block-decor graphic-block-decor-top-left" />
            <div className="graphic-block-decor graphic-block-decor-top-right" />
            <div className="graphic-block-decor graphic-block-decor-bottom-right" />
            <div className="graphic-block-decor graphic-block-decor-bottom-left" />
            <img
              src="/assets/webflow/664753c2515af09bef5b9826/6654a6cdaceb2d1c3b39c855_sphere.webp"
              loading="lazy"
              alt=""
              className="graphic-block-image"
            />
          </div>
          <div className="graphic-image incubation-graphic-image">
            <img
              src="/assets/webflow/664753c2515af09bef5b9826/6655e4989e684108dbc43a7e_graphic.svg"
              loading="lazy"
              alt=""
              className="graphic-image-inner"
            />
          </div>
        </div>

        <div className="incubation-title">
          <h2 anim-trigger="" className="h2 h2-mobile">
            Incubation
          </h2>
        </div>

        <div className="incubation-top-cross incubation-top-cross-left">
          <img src="/assets/webflow/664753c2515af09bef5b9826/665640330d1b87aa18aa9882_cross.svg" loading="lazy" alt="" />
        </div>
        <div className="incubation-top-cross incubation-top-cross-right">
          <img src="/assets/webflow/664753c2515af09bef5b9826/665640330d1b87aa18aa9882_cross.svg" loading="lazy" alt="" />
        </div>
      </div>

      {/* Incubation Content */}
      <div className="incubation-content">
        <div className="incubation-info">
          <div className="incubation-info-item">
            <div className="section-heading-descr-inner">
              <div className="section-descr-info">
                <div className="section-descr-info-decor" />
                <h3 className="section-descr-title">End-end Support</h3>
              </div>
              <div className="section-descr-text">From funding to GTM</div>
            </div>
          </div>
          
          <div className="incubation-empty" />
          
          <div className="incubation-info-item">
            <div className="section-heading-descr-inner">
              <div className="section-descr-info">
                <div className="section-descr-info-decor" />
                <h3 className="section-descr-title">Unique Approach</h3>
              </div>
              <div className="section-descr-text">Beyond Capital</div>
            </div>
          </div>
        </div>

        <div className="incubation-main">
          <div className="support-slider incubation-support-slider">
            <div className="support-slider-inner" style={{ overflow: 'hidden' }}>
              <div
                className="support-slider-track"
                style={{
                  display: 'flex',
                  gap: '16px',
                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: `translateX(calc(-${slideOffset} * (240px + 16px)))`
                }}
              >
                {slides.map((s) => (
                  <div
                    key={s.num}
                    role="listitem"
                    className="swiper-slide support-slider-slide w-dyn-item"
                    style={{ minWidth: '220px', maxWidth: '240px', flex: '0 0 auto' }}
                  >
                    <div className="support-slide">
                      <div className="support-slide-top">
                        <div className="support-slide-square" />
                        <div className="support-slide-number">{s.num}</div>
                      </div>
                      <div className="support-slide-icon">
                        <img
                          src="/assets/webflow/664753c2515af09bef5b9826/666aa5b019fc170dd5ab9fa9_ico-container.svg"
                          loading="lazy"
                          width="131"
                          height="120"
                          alt=""
                          className="support-slide-icon-place"
                        />
                        <img
                          src={s.icon}
                          loading="lazy"
                          alt=""
                          className="support-slide-image"
                        />
                      </div>
                      <div className="support-slide-name">{s.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="incubation-empty" />

          <div className="incubation-text">
            <div className="incubation-description">
              We do the impossible. In agentic AI, it takes an entire ecosystem to transform autonomous workflows into market leaders. With strategic funding, GTM support, and top-tier partnerships - we set you up for unparalleled growth.
            </div>
          </div>
        </div>

        <div className="incubation-bottom">
          <div className="incubation-nav">
            <div className="support-slider-nav">
              <div
                id="hovered-container-orange-arrow"
                capital-slider-prev=""
                className="support-slider-button"
                onClick={handlePrev}
                style={{ cursor: slideOffset > 0 ? 'pointer' : 'default', opacity: slideOffset > 0 ? 1 : 0.4 }}
              >
                <div id="hovered-orange-arrow" className="support-slider-button-image w-embed">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.3212 2.91429C14.3212 2.40934 13.9118 2 13.4069 2H11.5783C11.0734 2 10.664 2.40934 10.664 2.91429V4.28571C10.664 4.79066 10.2547 5.2 9.74975 5.2H8.37832C7.87337 5.2 7.46404 5.60934 7.46404 6.11429V7.48571C7.46404 7.99066 7.0547 8.4 6.54975 8.4H5.17832C4.67338 8.4 4.26404 8.80934 4.26404 9.31429V11.1429C4.26404 11.6478 4.67338 12.0571 5.17832 12.0571H7.00689C7.51184 12.0571 7.92118 12.4665 7.92118 12.9714V13.8857C7.92118 14.3907 8.33052 14.8 8.83546 14.8H10.2069C10.7118 14.8 11.1212 15.2093 11.1212 15.7143V17.0857C11.1212 17.5907 11.5305 18 12.0355 18H13.864C14.369 18 14.7783 17.5907 14.7783 17.0857V15.2571C14.7783 14.7522 14.369 14.3429 13.864 14.3429H12.4926C11.9877 14.3429 11.5783 13.9335 11.5783 13.4286V12.0571C11.5783 11.5522 11.169 11.1429 10.664 11.1429H8.83546C8.33052 11.1429 7.92118 10.7335 7.92118 10.2286V9.77143C7.92118 9.26648 8.33052 8.85714 8.83546 8.85714H10.2069C10.7118 8.85714 11.1212 8.4478 11.1212 7.94286V6.57143C11.1212 6.06648 11.5305 5.65714 12.0355 5.65714H13.4069C13.9118 5.65714 14.3212 5.2478 14.3212 4.74286V2.91429Z" fill="currentColor"/>
                  </svg>
                </div>
              </div>

              <div
                id="hovered-container-orange-arrow"
                capital-slider-next=""
                className="support-slider-button"
                onClick={handleNext}
                style={{ cursor: slideOffset < maxOffset ? 'pointer' : 'default', opacity: slideOffset < maxOffset ? 1 : 0.4 }}
              >
                <div id="hovered-orange-arrow" className="support-slider-button-image w-embed">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.67882 2.91429C5.67882 2.40934 6.08816 2 6.59311 2H8.42168C8.92663 2 9.33597 2.40934 9.33597 2.91429V4.28571C9.33597 4.79066 9.7453 5.2 10.2503 5.2H11.6217C12.1266 5.2 12.536 5.60934 12.536 6.11429V7.48571C12.536 7.99066 12.9453 8.4 13.4503 8.4H14.8217C15.3266 8.4 15.736 8.80934 15.736 9.31429V11.1429C15.736 11.6478 15.3266 12.0571 14.8217 12.0571H12.9931C12.4882 12.0571 12.0788 12.4665 12.0788 12.9714V13.8857C12.0788 14.3907 11.6695 14.8 11.1645 14.8H9.79311C9.28816 14.8 8.87882 15.2093 8.87882 15.7143V17.0857C8.87882 17.5907 8.46948 18 7.96454 18H6.13597C5.63102 18 5.22168 17.5907 5.22168 17.0857V15.2571C5.22168 14.7522 5.63102 14.3429 6.13597 14.3429H7.50739C8.01234 14.3429 8.42168 13.9335 8.42168 13.4286V12.0571C8.42168 11.5522 8.83102 11.1429 9.33597 11.1429H11.1645C11.6695 11.1429 12.0788 10.7335 12.0788 10.2286V9.77143C12.0788 9.26648 11.6695 8.85714 11.1645 8.85714H9.79311C9.28816 8.85714 8.87882 8.4478 8.87882 7.94286V6.57143C8.87882 6.06648 8.46948 5.65714 7.96454 5.65714H6.59311C6.08816 5.65714 5.67882 5.2478 5.67882 4.74286V2.91429Z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="incubation-empty" />

          <div className="incubation-buttons">
            <a
              href="#incubation"
              onClick={(e) => {
                e.preventDefault()
                onNavigate?.('dashboard')
              }}
              className="button-primary incubation-buttons-item width-100 w-inline-block"
            >
              <div className="button-primary-border">
                <div className="button-primary-text scrumble-text">
                  Apply for incubation
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* 3D Rotating Coin in incubation-video */}
        <div className="incubation-video w-embed" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '280px', position: 'relative' }}>
          <div style={{ width: '280px', height: '280px', position: 'relative' }}>
            <RobotMascotCanvas mode="coin" cameraDistance={2.8} />
          </div>
        </div>

      </div>

      <div className="capital-incubation-chain">
        <div className="capital-incubation-bubbles">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="bubble" />
          ))}
        </div>
      </div>

      <div className="capital-incubation-cabin">
        <img
          src="/assets/webflow/664753c2515af09bef5b9826/6653b8d9dde73e5fbc5784bf_labs_CABIN.webp"
          loading="lazy"
          alt=""
          className="capital-incubation-cabin-image"
        />
      </div>

      <div className="capital-incubation-tube" />

    </section>
  )
}
