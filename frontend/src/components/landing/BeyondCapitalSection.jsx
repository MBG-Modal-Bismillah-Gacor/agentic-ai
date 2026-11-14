import React, { useState } from 'react'
import { RobotMascotCanvas } from './RobotMascotCanvas'

export function BeyondCapitalSection({ onNavigate }) {
  const [activeSlide, setActiveSlide] = useState(0)

  const slides = [
    {
      number: '01',
      name: 'Incubation & Acceleration Program',
      icon: '/assets/webflow/6649e26c9fdc8739cefdc48e/666aa4640877adbdbb119497_ico-incubation.svg'
    },
    {
      number: '02',
      name: 'Investment & Funding',
      icon: '/assets/webflow/6649e26c9fdc8739cefdc48e/666aa47c8540d52c18b41338_ico-investment.svg'
    }
  ]

  const capitalItems = [
    { name: 'AI', desc: 'Autonomous Mesh' },
    { name: 'DeFi', desc: 'Realtime Orderbooks' },
    { name: 'DePin', desc: 'Edge NPU Hardware' },
    { name: 'L1/L2', desc: 'Secure Pipelines' },
  ]

  return (
    <section id="Capital-Incubation-Section" className="capital-incubation-section">
      <div className="w-layout-blockcontainer container w-container">
        <section className="capital-section support-slider-section">
          
          {/* CAPITAL TOP */}
          <div className="capital-top">
            <div id="w-node-_3b476a89-29e0-a676-f444-cab94e4d329d-ef5b982d" className="capital-title">
              <h2 className="h2 capital-title-h2">beyond Capital</h2>
            </div>
            <div id="w-node-d275d776-fc7c-c0ea-a1cc-06b08ad04da3-ef5b982d" className="capital-graphic-small">
              <div className="graphic-image capital-graphic-image">
                <img
                  src="/assets/webflow/664753c2515af09bef5b9826/6655e4989e684108dbc43a7e_graphic.svg"
                  loading="lazy"
                  alt=""
                  className="graphic-image-inner"
                />
              </div>
            </div>
            <div className="graphic-block capital-graphic-big">
              <div className="graphic-block-decor graphic-block-decor-top-left" />
              <div className="graphic-block-decor graphic-block-decor-top-right" />
              <div className="graphic-block-decor graphic-block-decor-bottom-right" />
              <div className="graphic-block-decor graphic-block-decor-bottom-left" />
              <img
                src="/assets/webflow/664753c2515af09bef5b9826/6654a66427b9b1d8bb9f58c0_circle.webp"
                loading="lazy"
                alt=""
                className="graphic-block-image"
              />
            </div>
          </div>

          {/* CAPITAL CONTENT */}
          <div className="capital-content">
            <div className="capital-info">
              <div className="capital-info-item">
                <div className="section-heading-descr-inner">
                  <div className="section-descr-info">
                    <div className="section-descr-info-decor" />
                    <h3 className="section-descr-title">Supercharging Web3 Builders</h3>
                  </div>
                  <div className="section-descr-text">
                    Menghilangkan friksi operasional melalui orkestrasi bot cerdas on-premise.
                  </div>
                </div>
              </div>
              <div className="capital-empty" />
              <div className="capital-info-item">
                <div className="section-heading-descr-inner">
                  <div className="section-descr-info">
                    <div className="section-descr-info-decor" />
                    <h3 className="section-descr-title">Smart Capital</h3>
                  </div>
                  <div className="section-descr-text">Our ecosystem support</div>
                </div>
              </div>
            </div>

            <div className="capital-main">
              {/* Left Column Checklist */}
              <div className="capital-left">
                <ul role="list" className="capital-list w-list-unstyled">
                  {capitalItems.map((item, idx) => (
                    <li key={idx} className="capital-item">
                      <img
                        src="/assets/webflow/664753c2515af09bef5b9826/66535ff25504f1c899e115da_subtract.svg"
                        loading="lazy"
                        alt=""
                        className="capital-item-icon"
                      />
                      <div className="capital-item-text">{item.name}</div>
                      <div className="capital-item-decor capital-item-decor-top-left" />
                      <div className="capital-item-decor capital-item-decor-top-right" />
                      <div className="capital-item-decor capital-item-decor-bottom-right" />
                      <div className="capital-item-decor capital-item-decor-bottom-left" />
                    </li>
                  ))}
                </ul>
                <div className="capital-buttons">
                  <a
                    href="/dashboard"
                    onClick={(e) => {
                      e.preventDefault()
                      onNavigate('dashboard')
                    }}
                    className="button-primary w-inline-block"
                  >
                    <div className="button-primary-border">
                      <div className="button-primary-text">Apply for Funding</div>
                    </div>
                  </a>
                </div>
                <div className="capital-devide" />
              </div>

              <div className="capital-empty" />

              {/* Right Column Slider Cards */}
              <div className="support-slider">
                <div className="support-slider-holder">
                  <div className="swiper w-dyn-list">
                    <div role="list" className="swiper-wrapper w-dyn-items" style={{ display: 'flex', gap: '16px' }}>
                      {slides.map((s, idx) => (
                        <div key={idx} role="listitem" className="swiper-slide support-slider-slide w-dyn-item" style={{ flex: 1 }}>
                          <div className="support-slide">
                            <div className="support-slide-top">
                              <div className="support-slide-square" />
                              <div className="support-slide-number">{s.number}</div>
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

                <div className="capital-nav">
                  <div className="support-slider-nav beyond-capital-slider-nav">
                    <div
                      onClick={() => setActiveSlide((prev) => (prev > 0 ? prev - 1 : slides.length - 1))}
                      id="hovered-container-orange-arrow"
                      className="support-slider-button"
                      style={{ cursor: 'pointer' }}
                    >
                      <div id="hovered-orange-arrow" className="support-slider-button-image w-embed">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14.3212 2.91429C14.3212 2.40934 13.9118 2 13.4069 2H11.5783C11.0734 2 10.664 2.40934 10.664 2.91429V4.28571C10.664 4.79066 10.2547 5.2 9.74975 5.2H8.37832C7.87337 5.2 7.46404 5.60934 7.46404 6.11429V7.48571C7.46404 7.99066 7.0547 8.4 6.54975 8.4H5.17832C4.67338 8.4 4.26404 8.80934 4.26404 9.31429V11.1429C4.26404 11.6478 4.67338 12.0571 5.17832 12.0571H7.00689C7.51184 12.0571 7.92118 12.4665 7.92118 12.9714V13.8857C7.92118 14.3907 8.33052 14.8 8.83546 14.8H10.2069C10.7118 14.8 11.1212 15.2093 11.1212 15.7143V17.0857C11.1212 17.5907 11.5305 18 12.0355 18H13.864C14.369 18 14.7783 17.5907 14.7783 17.0857V15.2571C14.7783 14.7522 14.369 14.3429 13.864 14.3429H12.4926C11.9877 14.3429 11.5783 13.9335 11.5783 13.4286V12.0571C11.5783 11.5522 11.169 11.1429 10.664 11.1429H8.83546C8.33052 11.1429 7.92118 10.7335 7.92118 10.2286V9.77143C7.92118 9.26648 8.33052 8.85714 8.83546 8.85714H10.2069C10.7118 8.85714 11.1212 8.4478 11.1212 7.94286V6.57143C11.1212 6.06648 11.5305 5.65714 12.0355 5.65714H13.4069C13.9118 5.65714 14.3212 5.2478 14.3212 4.74286V2.91429Z" fill="currentColor" />
                        </svg>
                      </div>
                    </div>
                    <div
                      onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
                      id="hovered-container-orange-arrow"
                      className="support-slider-button"
                      style={{ cursor: 'pointer' }}
                    >
                      <div id="hovered-orange-arrow" className="support-slider-button-image w-embed">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5.67882 2.91429C5.67882 2.40934 6.08816 2 6.59311 2H8.42168C8.92663 2 9.33597 2.40934 9.33597 2.91429V4.28571C9.33597 4.79066 9.7453 5.2 10.2503 5.2H11.6217C12.1266 5.2 12.536 5.60934 12.536 6.11429V7.48571C12.536 7.99066 12.9453 8.4 13.4503 8.4H14.8217C15.3266 8.4 15.736 8.80934 15.736 9.31429V11.1429C15.736 11.6478 15.3266 12.0571 14.8217 12.0571H12.9931C12.4882 12.0571 12.0788 12.4665 12.0788 12.9714V13.8857C12.0788 14.3907 11.6695 14.8 11.1645 14.8H9.79311C9.28816 14.8 8.87882 15.2093 8.87882 15.7143V17.0857C8.87882 17.5907 8.46948 18 7.96454 18H6.13597C5.63102 18 5.22168 17.5907 5.22168 17.0857V15.2571C5.22168 14.7522 5.63102 14.3429 6.13597 14.3429H7.50739C8.01234 14.3429 8.42168 13.9335 8.42168 13.4286V12.0571C8.42168 11.5522 8.83102 11.1429 9.33597 11.1429H11.1645C11.6695 11.1429 12.0788 10.7335 12.0788 10.2286V9.77143C12.0788 9.26648 11.6695 8.85714 11.1645 8.85714H9.79311C9.28816 8.85714 8.87882 8.4478 8.87882 7.94286V6.57143C8.87882 6.06648 8.46948 5.65714 7.96454 5.65714H6.59311C6.08816 5.65714 5.67882 5.2478 5.67882 4.74286V2.91429Z" fill="currentColor" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Central Capsule Chamber (Gyroscopic AI Neural Core) */}
            <div className="capital-video w-embed" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '340px', position: 'relative' }}>
              <div style={{ width: '320px', height: '340px', position: 'relative' }}>
                <RobotMascotCanvas mode="core" cameraDistance={3.2} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}
