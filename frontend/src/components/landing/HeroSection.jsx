import React, { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { RobotMascotCanvas } from './RobotMascotCanvas'

gsap.registerPlugin(ScrollTrigger)

export function HeroSection({ onNavigate }) {
  const [sliderOffset, setSliderOffset] = useState(0)
  const heroRobotRef = useRef(null)

  useEffect(() => {
    if (!heroRobotRef.current) return

    const ctx = gsap.context(() => {
      // Robot dives down towards the pipe and Section 2 on scroll
      gsap.fromTo(
        heroRobotRef.current,
        {
          y: 0,
          scale: 1,
          opacity: 1,
          rotation: 0,
        },
        {
          y: 580,
          scale: 0.82,
          opacity: 0,
          rotation: 6,
          ease: 'power2.in',
          scrollTrigger: {
            trigger: '#hero-section',
            start: 'top top',
            end: 'bottom 15%',
            scrub: 0.7,
            invalidateOnRefresh: true,
          }
        }
      )
    })

    return () => ctx.revert()
  }, [])

  const partners = [
    {
      name: 'MSI',
      type: 'badge',
      icon: '/assets/tech/msi.svg',
      title: 'MSI CUBI AI',
      desc: 'On-Premise Node',
      link: 'https://www.msi.com/',
    },
    {
      name: 'Intel',
      type: 'badge',
      icon: '/assets/tech/intel.svg',
      title: 'INTEL NPU',
      desc: 'Core Ultra 7',
      link: 'https://www.intel.com/',
    },
    {
      name: 'Ollama',
      type: 'badge',
      icon: '/assets/tech/ollama.svg',
      title: 'OLLAMA MESH',
      desc: 'Local Neural Bus',
      link: 'https://ollama.com/',
    },
    {
      name: 'Qwen AI',
      type: 'badge',
      icon: '/assets/tech/qwen.svg',
      title: 'QWEN 2.5',
      desc: 'Sovereign 3B Model',
      link: 'https://github.com/QwenLM/Qwen2.5',
    },
    {
      name: 'Linux',
      type: 'badge',
      icon: '/assets/tech/linux.svg',
      title: 'LINUX OS',
      desc: 'Hardened Appliance',
      link: 'https://kernel.org/',
    },
    {
      name: 'Docker',
      type: 'badge',
      icon: '/assets/tech/docker.svg',
      title: 'DOCKER',
      desc: 'Swarm Containers',
      link: 'https://docker.com/',
    },
    {
      name: 'FastAPI',
      type: 'badge',
      icon: '/assets/tech/fastapi.svg',
      title: 'FASTAPI',
      desc: 'High-Throughput Bus',
      link: 'https://fastapi.tiangolo.com/',
    },
    {
      name: 'PostgreSQL',
      type: 'badge',
      icon: '/assets/tech/postgres.svg',
      title: 'POSTGRESQL',
      desc: 'Local Vector Store',
      link: 'https://www.postgresql.org/',
    },
  ]

  const handleNext = () => {
    setSliderOffset((prev) => (prev + 1) % (partners.length - 3))
  }

  const handlePrev = () => {
    setSliderOffset((prev) => (prev > 0 ? prev - 1 : Math.max(0, partners.length - 4)))
  }

  return (
    <section id="hero-section" className="hero-section min-h-[92vh] flex flex-col justify-between" style={{ paddingTop: '74px', position: 'relative' }}>
      <div id="hero-section-container" className="w-layout-blockcontainer container hero-container w-container flex-1 flex flex-col justify-between" style={{ paddingTop: '0px' }}>
        
        {/* HERO WRAPPER (Exact Webflow Grid Layout) */}
        <div className="hero-wrapper relative border-l border-r border-[#192A56]/20 bg-white flex-1 flex flex-col justify-between">
          
          {/* Architectural 4-Column Grid Guidelines (Lurus & Presisi dengan Garis Bawah: 25%, 50%, 75%) */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-0 bottom-0 left-[25%] w-px bg-[#192A56]/15" />
            <div className="absolute top-0 bottom-0 left-[50%] w-px bg-[#192A56]/15" />
            <div className="absolute top-0 bottom-0 left-[75%] w-px bg-[#192A56]/15" />
          </div>

          {/* Top Architectural Corner Embellishments (Matching rfhero.png) */}
          <div className="absolute top-0 left-0 z-20 w-11 h-11 border-r border-b border-[#192A56]/20 flex items-center justify-center bg-white">
            <img
              src="/assets/webflow/664753c2515af09bef5b9826/665640330d1b87aa18aa9882_cross.svg"
              alt=""
              className="w-4 h-4 opacity-75"
            />
          </div>
          <div className="absolute top-0 right-0 z-20 w-11 h-11 border-l border-b border-[#192A56]/20 flex items-center justify-center bg-white">
            <span className="w-4 h-4 rounded-full border-2 border-[#192A56]/60 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#192A56]" />
            </span>
          </div>

          {/* HERO TOP */}
          <div className="hero-top" style={{ paddingTop: '0rem', paddingBottom: '0rem', marginTop: '0rem' }}>
            <div className="hero-backing hero-backing-top" style={{ display: 'none' }} />

            {/* High-Contrast Bold Cyber Typography "AI AGENTIC" Berada tepat di belakang robot (Sesuai rf hero.png) */}
            <div className="hero-marquee-wrapper overflow-hidden select-none pointer-events-none relative z-0" style={{ paddingTop: '2.5rem', marginBottom: '-4.5rem' }}>
              <div className="hero-marquee animate-marquee flex items-center">
                <span className="marquee-heading mr-12 text-[#192A56] font-display tracking-tight" style={{ fontFamily: "'LabsAmiga', sans-serif" }}>
                  AI AGENTIC
                </span>
                <span className="marquee-heading mr-12 text-[#192A56] font-display tracking-tight" style={{ fontFamily: "'LabsAmiga', sans-serif" }}>
                  AI AGENTIC
                </span>
                <span className="marquee-heading mr-12 text-[#192A56] font-display tracking-tight" style={{ fontFamily: "'LabsAmiga', sans-serif" }}>
                  AI AGENTIC
                </span>
                <span className="marquee-heading mr-12 text-[#192A56] font-display tracking-tight" style={{ fontFamily: "'LabsAmiga', sans-serif" }}>
                  AI AGENTIC
                </span>
                <span className="marquee-heading mr-12 text-[#192A56] font-display tracking-tight" style={{ fontFamily: "'LabsAmiga', sans-serif" }}>
                  AI AGENTIC
                </span>
                <span className="marquee-heading mr-12 text-[#192A56] font-display tracking-tight" style={{ fontFamily: "'LabsAmiga', sans-serif" }}>
                  AI AGENTIC
                </span>
                <span className="marquee-heading mr-12 text-[#192A56] font-display tracking-tight" style={{ fontFamily: "'LabsAmiga', sans-serif" }}>
                  AI AGENTIC
                </span>
                <span className="marquee-heading mr-12 text-[#192A56] font-display tracking-tight" style={{ fontFamily: "'LabsAmiga', sans-serif" }}>
                  AI AGENTIC
                </span>
              </div>
            </div>

            <div className="hero-top-content" style={{ marginTop: '0rem', position: 'relative' }}>
              {/* Vibrant Orange Corner Decor Markers (Matching rfhero.png) */}
              <div className="hero-square hero-square-top-right hero-square-mobile" style={{ backgroundColor: '#FF5B00' }} />
              <div className="hero-square hero-square-top-left hero-square-mobile" style={{ backgroundColor: '#FF5B00' }} />

              <div className="hero-backing" style={{ paddingLeft: '2.25rem', marginBottom: '0.5rem' }}>
                <div id="w-node-_30e76485-ae6c-05d7-60f5-023e5c311de5-ef5b982d" className="w-layout-hflex hero-backing-text">
                  <div className="hero-backing-item font-mono font-bold text-xs uppercase tracking-widest text-[#192A56]">
                    AI AGENTIC :: AICREW
                  </div>
                </div>
                <div id="w-node-bf49c4bc-c533-46a4-5e65-738d863c031d-ef5b982d" className="w-2.5 h-2.5 bg-[#192A56]" />
              </div>

              {/* Central Mascot: Greeting 3D Robot Mascot (Ditarik ke atas proporsional, tanpa magnet/clamp penggantung) */}
              <div
                ref={heroRobotRef}
                className="hero-video w-embed"
                style={{
                  willChange: 'transform, opacity',
                  width: '460px',
                  maxWidth: '92vw',
                  height: '420px',
                  pointerEvents: 'none',
                  overflow: 'visible',
                  top: '38%',
                  transform: 'translate(-50%, -46%)',
                }}
              >
                <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'visible' }}>
                  <RobotMascotCanvas mode="robot" cameraDistance={3.3} />
                </div>
              </div>

            </div>
          </div>

          {/* HERO MAIN */}
          <div className="hero-main" style={{ paddingTop: '0.25rem' }}>
            <div className="hero-info" style={{ padding: '2.25rem 2rem 2rem 2.25rem' }}>
              <div className="hero-description font-mono text-xs sm:text-sm leading-relaxed text-[#192A56]" style={{ maxWidth: '18rem' }}>
                Mendukung pimpinan dealer &amp; enterprise terbaik — mentransformasi armada agen AI on-premise menjadi pipeline penjualan motor &amp; deal closing otonom tanpa risiko kebocoran cloud.
              </div>
              <a
                href="/office"
                onClick={(e) => {
                  e.preventDefault()
                  onNavigate?.('office')
                }}
                className="button-primary hero-apply w-inline-block"
                style={{ marginTop: '1.5rem', display: 'inline-block' }}
              >
                <div className="button-primary-border" style={{ backgroundColor: '#192A56' }}>
                  <div
                    className="button-primary-text font-bold"
                    style={{
                      backgroundColor: '#192A56',
                      color: '#FFFFFF',
                      padding: '0.85rem 1.75rem',
                    }}
                  >
                    MASUK KE KANTOR AI
                  </div>
                </div>
              </a>
            </div>

            <div className="hero-bottom-space" style={{ padding: '1rem' }} />

            {/* Right Graphic Block: Illustrasi 3D Geometric Connector Star (Identik rf hero.png) */}
            <div
              className="graphic-block hero-graphic-block"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(25, 42, 86, 0.25)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.25rem',
              }}
            >
              <div className="graphic-block-decor graphic-block-decor-top-left" style={{ borderColor: '#192A56' }} />
              <div className="graphic-block-decor graphic-block-decor-top-right" style={{ borderColor: '#192A56' }} />
              <div className="graphic-block-decor graphic-block-decor-bottom-right" style={{ borderColor: '#192A56' }} />
              <div className="graphic-block-decor graphic-block-decor-bottom-left" style={{ borderColor: '#192A56' }} />

              <img
                src="/assets/webflow/664753c2515af09bef5b9826/6654a5c3113a6f95af59c707_star.webp"
                alt="3D Ecosystem Connector Star"
                loading="lazy"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain select-none pointer-events-none hover:scale-105 transition-transform"
                style={{ filter: 'drop-shadow(0 12px 24px rgba(25, 42, 86, 0.12))' }}
              />
            </div>

            {/* Partners Header & Nav Controls */}
            <div id="w-node-_3ed4ddf5-96e2-2d95-cc00-99d4d88a966e-ef5b982d" className="hero-partners">
              <div className="hero-partners-title">PARTNER TEKNOLOGI:</div>
              <div className="hero-partners-nav-col">
                <div className="hero-partners-nav">
                  <div
                    onClick={handlePrev}
                    id="hero-partners-prev-btn"
                    className="hero-partners-button group"
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="hero-partners-button-image partners-arrow w-embed">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.3212 2.91429C14.3212 2.40934 13.9118 2 13.4069 2H11.5783C11.0734 2 10.664 2.40934 10.664 2.91429V4.28571C10.664 4.79066 10.2547 5.2 9.74975 5.2H8.37832C7.87337 5.2 7.46404 5.60934 7.46404 6.11429V7.48571C7.46404 7.99066 7.0547 8.4 6.54975 8.4H5.17832C4.67338 8.4 4.26404 8.80934 4.26404 9.31429V11.1429C4.26404 11.6478 4.67338 12.0571 5.17832 12.0571H7.00689C7.51184 12.0571 7.92118 12.4665 7.92118 12.9714V13.8857C7.92118 14.3907 8.33052 14.8 8.83546 14.8H10.2069C10.7118 14.8 11.1212 15.2093 11.1212 15.7143V17.0857C11.1212 17.5907 11.5305 18 12.0355 18H13.864C14.369 18 14.7783 17.5907 14.7783 17.0857V15.2571C14.7783 14.7522 14.369 14.3429 13.864 14.3429H12.4926C11.9877 14.3429 11.5783 13.9335 11.5783 13.4286V12.0571C11.5783 11.5522 11.169 11.1429 10.664 11.1429H8.83546C8.33052 11.1429 7.92118 10.7335 7.92118 10.2286V9.77143C7.92118 9.26648 8.33052 8.85714 8.83546 8.85714H10.2069C10.7118 8.85714 11.1212 8.4478 11.1212 7.94286V6.57143C11.1212 6.06648 11.5305 5.65714 12.0355 5.65714H13.4069C13.9118 5.65714 14.3212 5.2478 14.3212 4.74286V2.91429Z" fill="currentColor" className="text-[#192A56] group-hover:fill-white group-active:fill-white transition-colors" />
                      </svg>
                    </div>
                  </div>
                  <div
                    onClick={handleNext}
                    id="hero-partners-next-btn"
                    className="hero-partners-button group"
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="hero-partners-button-image partners-arrow w-embed">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.67882 2.91429C5.67882 2.40934 6.08816 2 6.59311 2H8.42168C8.92663 2 9.33597 2.40934 9.33597 2.91429V4.28571C9.33597 4.79066 9.7453 5.2 10.2503 5.2H11.6217C12.1266 5.2 12.536 5.60934 12.536 6.11429V7.48571C12.536 7.99066 12.9453 8.4 13.4503 8.4H14.8217C15.3266 8.4 15.736 8.80934 15.736 9.31429V11.1429C15.736 11.6478 15.3266 12.0571 14.8217 12.0571H12.9931C12.4882 12.0571 12.0788 12.4665 12.0788 12.9714V13.8857C12.0788 14.3907 11.6695 14.8 11.1645 14.8H9.79311C9.28816 14.8 8.87882 15.2093 8.87882 15.7143V17.0857C8.87882 17.5907 8.46948 18 7.96454 18H6.13597C5.63102 18 5.22168 17.5907 5.22168 17.0857V15.2571C5.22168 14.7522 5.63102 14.3429 6.13597 14.3429H7.50739C8.01234 14.3429 8.42168 13.9335 8.42168 13.4286V12.0571C8.42168 11.5522 8.83102 11.1429 9.33597 11.1429H11.1645C11.6695 11.1429 12.0788 10.7335 12.0788 10.2286V9.77143C12.0788 9.26648 11.6695 8.85714 11.1645 8.85714H9.79311C9.28816 8.85714 8.87882 8.4478 8.87882 7.94286V6.57143C8.87882 6.06648 8.46948 5.65714 7.96454 5.65714H6.59311C6.08816 5.65714 5.67882 5.2478 5.67882 4.74286V2.91429Z" fill="currentColor" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Webflow SVG Crosses */}
          <img
            src="/assets/webflow/664753c2515af09bef5b9826/665dd11892bba241c17ceea5_decor-x.svg"
            loading="lazy"
            width="44"
            height="44"
            alt=""
            id="hero-decor"
            className="hero-decor-1"
          />
          <img
            src="/assets/webflow/664753c2515af09bef5b9826/6653486a5dbcbf9da5b393b4_graphic.svg"
            loading="lazy"
            width="44"
            height="44"
            alt=""
            id="hero-decor"
            className="hero-decor-2"
          />

          {/* Vertical Social Floating Panel on the Right */}
          <div className="social-panel">
            <div className="w-layout-vflex social-wrapper">
              <a rel="noreferrer" href="https://twitter.com" target="_blank" className="social-link w-inline-block">
                <img src="/assets/webflow/664753c2515af09bef5b9826/6649a8e1ba00f2a179cb88d1_Twitter.svg" loading="lazy" alt="Twitter" className="social-link-image" />
              </a>
              <a rel="noreferrer" href="https://t.me" target="_blank" className="social-link w-inline-block">
                <img src="/assets/webflow/664753c2515af09bef5b9826/6649a8e0bab62d552442a60a_Telegram.svg" loading="lazy" alt="Telegram" className="social-link-image" />
              </a>
              <a rel="noreferrer" href="https://medium.com" target="_blank" className="social-link w-inline-block">
                <img src="/assets/webflow/664753c2515af09bef5b9826/6649a8e0a27ebe906ed8639b_Medium.svg" loading="lazy" alt="Medium" className="social-link-image" />
              </a>
              <a rel="noreferrer" href="https://www.linkedin.com" target="_blank" className="social-link w-inline-block">
                <img src="/assets/webflow/664753c2515af09bef5b9826/66869898483ad2d1ccf089d1_linkedin.svg" loading="lazy" alt="LinkedIn" className="social-link-image" />
              </a>
            </div>
          </div>

        </div>

        {/* Partner Slider Strip - Enlarged & Prominently Styled (Matching rfhero.png) */}
        <div className="hero-slider border-t border-b border-[#192A56]/20 bg-white">
          <div className="swiper overflow-visible w-dyn-list">
            <div
              role="list"
              className="swiper-wrapper hero-slider-swiper-wrapper w-dyn-items"
              style={{
                transform: `translateX(-${sliderOffset * 25}%)`,
                transition: 'transform 0.4s ease'
              }}
            >
              {partners.map((partner, idx) => (
                <div key={idx} role="listitem" className="swiper-slide w-dyn-item" style={{ width: '25%' }}>
                  <div className="hero-partner border-r border-[#192A56]/20 min-h-[112px] sm:min-h-[128px] flex items-center justify-center p-4 sm:p-6 relative bg-white hover:bg-slate-50 transition-colors">
                    <a
                      href={partner.link}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full h-full flex items-center justify-center no-underline gap-3.5 group"
                    >
                      {partner.type === 'svg' ? (
                        <img
                          src={partner.logo}
                          loading="lazy"
                          alt={partner.name}
                          className="h-10 sm:h-12 w-auto max-w-[85%] object-contain group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="flex items-center gap-3.5">
                          <img
                            src={partner.icon}
                            loading="lazy"
                            alt={partner.name}
                            className="h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform"
                          />
                          <div className="flex flex-col">
                            <span className="text-base sm:text-lg font-mono font-extrabold text-[#192A56] tracking-wide">
                              {partner.title}
                            </span>
                            <span className="text-[11px] sm:text-xs font-mono font-semibold text-[#576574]">
                              {partner.desc}
                            </span>
                          </div>
                        </div>
                      )}
                    </a>
                    <div className="hero-partner-decor hero-partner-decor-top-left" />
                    <div className="hero-partner-decor hero-partner-decor-top-right" />
                    <div className="hero-partner-decor hero-partner-decor-bottom-right" />
                    <div className="hero-partner-decor hero-partner-decor-bottom-left" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conduit Pipe Mechanical Collar & Segment Connecting Hero to Section 2 (Sesuai fsrefrensi.png) */}
        <div className="relative w-full h-20 sm:h-24 bg-white border-l border-r border-[#192A56]/20 flex flex-col items-center justify-center overflow-visible z-20">
          {/* Mechanical Upper Collar Clamp */}
          <div className="w-56 sm:w-64 h-3 bg-[#F1F5F9] border-t border-b border-[#192A56]/30 flex items-center justify-between px-3 shadow-xs">
            <span className="w-1.5 h-1.5 bg-[#192A56] rounded-full" />
            <div className="flex gap-2">
              <span className="w-8 h-1 bg-[#192A56]/25 block" />
              <span className="w-8 h-1 bg-[#192A56]/25 block" />
            </div>
            <span className="w-1.5 h-1.5 bg-[#192A56] rounded-full" />
          </div>

          {/* Central Conduit Pipe Segment with Seams */}
          <div
            className="w-44 sm:w-52 h-full pointer-events-none relative"
            style={{
              backgroundImage: 'url(/assets/webflow/664753c2515af09bef5b9826/6653b82c498773bed25d76ff_pipe_segment.webp)',
              backgroundRepeat: 'repeat-y',
              backgroundPosition: 'center',
              backgroundSize: 'contain',
              opacity: 0.95
            }}
          >
            {/* Left & Right Guide Rail Lines */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#192A56]/25" />
            <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-[#192A56]/25" />
          </div>
        </div>

      </div>
    </section>
  )
}
