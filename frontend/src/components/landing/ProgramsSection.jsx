import React, { useState } from 'react'
import { RobotMascotCanvas } from './RobotMascotCanvas'

export function ProgramsSection({ onNavigate }) {
  const [incubationSlideIndex, setIncubationSlideIndex] = useState(0)

  // MSI Cubi NUC AI + B206 Hardware Specifications (Checklist on the left)
  const capitalItems = [
    { name: 'Intel Core Ultra 7', desc: 'Meteor Lake SoC Architecture' },
    { name: 'Dedicated NPU 48 TOPS', desc: 'Hardware-Accelerated AI Inference' },
    { name: 'Dual 2.5GbE LAN', desc: 'Redundant Isolated Mesh Pipeline' },
    { name: 'Zero Cloud Egress', desc: '100% Local Sovereign Hardware Vault' },
  ]

  // Capital program cards (Hardware Showcase on the right)
  const capitalSlides = [
    {
      number: '01',
      name: 'MSI Cubi NUC On-Premise Appliance',
      icon: '/assets/webflow/6649e26c9fdc8739cefdc48e/666aa4640877adbdbb119497_ico-incubation.svg'
    },
    {
      number: '02',
      name: 'Air-Gapped Dual LAN Hardware Node',
      icon: '/assets/webflow/6649e26c9fdc8739cefdc48e/666aa47c8540d52c18b41338_ico-investment.svg'
    }
  ]

  // 11 Incubation support steps (Cara Kerja)
  const incubationSlides = [
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

  const handleNextIncubation = () => {
    setIncubationSlideIndex((prev) => (prev + 1) % incubationSlides.length)
  }

  const handlePrevIncubation = () => {
    setIncubationSlideIndex((prev) => (prev > 0 ? prev - 1 : incubationSlides.length - 1))
  }

  const handleNext = handleNextIncubation
  const handlePrev = handlePrevIncubation

  return (
    <div id="Capital-Incubation-Section" className="relative w-full bg-white z-10 shadow-2xl">
      {/* Target Anchor Links untuk Navigasi */}
      <div id="beyond-capital" className="absolute top-0 left-0 w-full h-1 pointer-events-none" />
      <div id="programs" className="absolute top-0 left-0 w-full h-1 pointer-events-none" />

      {/* ========================================================================= */}
      {/* STAGE 1: AICOSYSTEM (Beyond Capital) - Clean White & Floating 3D Mascot   */}
      {/* ========================================================================= */}
      <section className="capital-section relative bg-white border-b border-[#192A56]/20 pt-6 sm:pt-8 pb-0">
        <div className="w-layout-blockcontainer container w-container relative z-10">

          {/* Header Section 1 */}
          <div className="capital-top border-t border-b border-[#192A56]/20 bg-white">
            <div id="w-node-_3b476a89-29e0-a676-f444-cab94e4d329d-ef5b982d" className="capital-title flex flex-col justify-center" style={{ backgroundColor: '#F6F6F6' }}>
              <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#576574] mb-1 block">
                powered by MSI Cubi NUC AI &amp; Autonomous Agent Mesh
              </span>
              <h2 className="h2 capital-title-h2 uppercase" style={{ color: '#192A56', fontFamily: "'LabsAmiga', sans-serif" }}>
                AICOSYSTEM
              </h2>
            </div>

            <div id="w-node-d275d776-fc7c-c0ea-a1cc-06b08ad04da3-ef5b982d" className="capital-graphic-small bg-white" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="graphic-image capital-graphic-image bg-white" style={{ backgroundColor: '#FFFFFF' }}>
                <img
                  src="/assets/webflow/664753c2515af09bef5b9826/6655e4989e684108dbc43a7e_graphic.svg"
                  loading="lazy"
                  alt=""
                  className="graphic-image-inner"
                />
              </div>
            </div>

            <div className="graphic-block capital-graphic-big bg-white" style={{ backgroundColor: '#FFFFFF' }}>
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

          {/* Subheader Section 1 */}
          <div className="capital-info border-b border-[#192A56]/20">
            <div className="capital-info-item">
              <div className="section-heading-descr-inner">
                <div className="section-descr-info">
                  <div className="section-descr-info-decor" />
                  <h3 className="section-descr-title font-mono font-bold text-base sm:text-lg text-[#192A56]">Hardware</h3>
                </div>
                <div className="section-descr-text font-mono text-xs text-[#576574]">
                  MSI Cubi NUC AI + B206 On-Premise Node
                </div>
              </div>
            </div>
            
            <div className="capital-empty hidden lg:block" />
            
            <div className="capital-info-item">
              <div className="section-heading-descr-inner">
                <div className="section-descr-info">
                  <div className="section-descr-info-decor" />
                  <h3 className="section-descr-title font-mono font-bold text-base sm:text-lg text-[#192A56]">Software</h3>
                </div>
                <div className="section-descr-text font-mono text-xs text-[#576574]">
                  Autonomous Multi-Agent Swarm &amp; Local LLM Mesh
                </div>
              </div>
            </div>
          </div>

          {/* 3-Column Body Section 1: Specs | Free Floating 3D Robot Mascot (Tanpa Kapsul) | Hardware Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-stretch relative min-h-[560px]">
            {/* Kolom Kiri: Hardware Specs Checklist */}
            <div className="border-b lg:border-b-0 lg:border-r border-[#192A56]/20 p-6 sm:p-8 flex flex-col justify-between bg-white">
              <ul role="list" className="w-full space-y-3 list-none p-0 m-0">
                {capitalItems.map((item, idx) => (
                  <li key={idx} className="aico-spec-item flex items-center gap-3.5 p-3.5 bg-white border border-[#192A56]/20 rounded-none shadow-xs hover:border-[#192A56] hover:shadow-md transition-all w-full">
                    <div className="w-7 h-7 rounded-sm bg-[#192A56]/10 border border-[#192A56]/20 flex items-center justify-center shrink-0">
                      <svg width="18" height="14" viewBox="0 0 23 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                        <path d="M1.1657 7.65653C0.75024 7.65653 0.453205 8.0173 0.575087 8.37386L2.56277 14.1889C3.22999 16.1456 4.83132 17.2238 7.14434 17.2238H11.2366C12.838 17.2238 13.0159 17.064 13.0159 15.6264V14.0291C13.0159 12.5916 13.1938 12.4318 14.7951 12.4318H17.0192C18.6205 12.4318 18.8429 12.2721 19.3322 10.9144L22.5207 1.43876C22.6405 1.08269 22.3436 0.723755 21.9293 0.723755H17.4375C17.1651 0.723755 16.9248 0.883907 16.8461 1.11799L13.5497 10.9144C13.0604 12.2721 12.838 12.4318 11.2366 12.4318H9.45737C7.85604 12.4318 7.63364 12.2721 7.14434 10.9144L6.18077 8.05077C6.102 7.81669 5.86175 7.65653 5.58937 7.65653H1.1657Z" fill="#192A56"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-mono font-bold text-xs sm:text-sm text-[#192A56]">{item.name}</div>
                      <div className="font-mono text-[11px] text-[#576574]">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-4 border-t border-[#192A56]/15">
                <a
                  href="/office"
                  onClick={(e) => {
                    e.preventDefault()
                    onNavigate?.('office')
                  }}
                  className="button-primary w-inline-block"
                >
                  <div className="button-primary-border" style={{ backgroundColor: '#192A56' }}>
                    <div className="button-primary-text font-bold" style={{ backgroundColor: '#192A56', color: '#FFFFFF' }}>
                      MASUK KE AICREW
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Kolom Tengah: Cyber Stage Terbuka (Tanpa Pipa & Tanpa Kapsul) */}
            <div className="w-full lg:w-[380px] xl:w-[420px] flex flex-col items-center justify-center relative overflow-visible pointer-events-none py-6">
              <div className="relative w-full max-w-[340px] sm:max-w-[380px] h-[480px] sm:h-[540px] flex flex-col items-center justify-center my-auto shrink-0">
                {/* Holographic Concentric Ring Accents di Belakang Maskot */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  <div className="w-64 h-64 rounded-full border border-[#192A56]/15 animate-pulse" />
                  <div className="w-80 h-80 rounded-full border border-dashed border-[#192A56]/10 absolute" />
                </div>

                {/* Robot Biasa di Section 2 (AICOSYSTEM) */}
                <div
                  id="sec2-mascot-target"
                  className="w-full h-full max-w-[320px] max-h-[380px] relative flex items-center justify-center z-10 pointer-events-auto"
                >
                  <RobotMascotCanvas mode="robot" cameraDistance={3.8} />
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Hardware Cards */}
            <div className="border-t lg:border-t-0 lg:border-l border-[#192A56]/20 p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-4">
                {capitalSlides.map((s, idx) => (
                  <div key={idx} className="aico-hw-card border border-[#192A56]/20 bg-white p-5 shadow-xs relative flex flex-col justify-between w-full hover:border-[#192A56] hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3 w-full">
                      <div className="w-2 h-2 bg-[#192A56]" />
                      <div className="font-mono text-xs font-bold text-[#192A56]">{s.number}</div>
                    </div>
                    <div className="flex items-center justify-center my-3 relative">
                      <img
                        src="/assets/webflow/664753c2515af09bef5b9826/666aa5b019fc170dd5ab9fa9_ico-container.svg"
                        loading="lazy"
                        width="110"
                        height="100"
                        alt=""
                        className="opacity-40"
                      />
                      <img
                        src={s.icon}
                        loading="lazy"
                        alt=""
                        className="absolute inset-0 m-auto w-10 h-10 object-contain"
                      />
                    </div>
                    <div className="font-mono font-bold text-xs sm:text-sm text-[#192A56] text-center leading-snug">
                      {s.name}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 text-[11px] font-mono text-[#576574] text-center">
                Dual 2.5G Isolated Hardware Infrastructure
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* STAGE 2: CARA KERJA (Incubation) - Transisi Morph Robot -> MBG Token      */}
      {/* ========================================================================= */}
      <section id="incubation-section" className="incubation-section relative bg-white border-b border-[#192A56]/20 pt-6 sm:pt-8 pb-8 sm:pb-12">
        <div className="w-layout-blockcontainer container w-container relative z-10">

          {/* Header Section 2 */}
          <div className="incubation-top border-t border-b border-[#192A56]/20 bg-white">
            <div className="incubation-left bg-white" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="graphic-block incubation-graphic-big bg-white" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="graphic-block-decor graphic-block-decor-top-left" />
                <div className="graphic-block-decor graphic-block-decor-top-right" />
                <div className="graphic-block-decor graphic-block-decor-bottom-right" />
                <div className="graphic-block-decor graphic-block-decor-bottom-left" />
                <img
                  src="/assets/webflow/664753c2515af09bef5b9826/6654a6cdaceb2d1c3b39c855_sphere.webp"
                  loading="lazy"
                  alt=""
                  className="graphic-block-image"
                  style={{ filter: 'grayscale(0.6)' }}
                />
              </div>
              <div className="graphic-image incubation-graphic-image bg-white" style={{ backgroundColor: '#FFFFFF' }}>
                <img
                  src="/assets/webflow/664753c2515af09bef5b9826/6655e4989e684108dbc43a7e_graphic.svg"
                  loading="lazy"
                  alt=""
                  className="graphic-image-inner"
                />
              </div>
            </div>

            <div className="incubation-title" style={{ backgroundColor: '#F6F6F6' }}>
              <h2 className="h2 h2-mobile uppercase" style={{ color: '#192A56', fontFamily: "'LabsAmiga', sans-serif" }}>
                CARA KERJA
              </h2>
            </div>

            <div className="incubation-top-cross incubation-top-cross-left">
              <img src="/assets/webflow/664753c2515af09bef5b9826/665640330d1b87aa18aa9882_cross.svg" loading="lazy" alt="" />
            </div>
            <div className="incubation-top-cross incubation-top-cross-right">
              <img src="/assets/webflow/664753c2515af09bef5b9826/665640330d1b87aa18aa9882_cross.svg" loading="lazy" alt="" />
            </div>
          </div>

          {/* Subheader Section 2 */}
          <div className="incubation-info border-b border-[#192A56]/20">
            <div className="incubation-info-item">
              <div className="section-heading-descr-inner">
                <div className="section-descr-info">
                  <div className="section-descr-info-decor" />
                  <h3 className="section-descr-title font-mono font-bold text-base sm:text-lg text-[#192A56]">Alur Eksekusi</h3>
                </div>
                <div className="section-descr-text font-mono text-xs text-[#576574]">
                  11 Langkah Inkubasi &amp; Eksekusi Swarm Sistematis
                </div>
              </div>
            </div>
            
            <div className="incubation-empty hidden lg:block" />
            
            <div className="incubation-info-item">
              <div className="section-heading-descr-inner">
                <div className="section-descr-info">
                  <div className="section-descr-info-decor" />
                  <h3 className="section-descr-title font-mono font-bold text-base sm:text-lg text-[#192A56]">Unique Approach</h3>
                </div>
                <div className="section-descr-text font-mono text-xs text-[#576574]">On-Premise Sovereign Infrastructure</div>
              </div>
            </div>
          </div>

          {/* 3-Column Body Section 2: 11 Langkah Swarm | Pipa Diam & 3D MBG Token Morph | Unique Approach */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-stretch relative min-h-[540px]">
            {/* Kolom Kiri: 11 Langkah Eksekusi Swarm (Flat 2D Card Bersih) */}
            <div className="border-b lg:border-b-0 lg:border-r border-[#192A56]/20 p-6 sm:p-8 flex flex-col justify-between">
              <div className="w-full max-w-[340px] mx-auto lg:mx-0 my-auto">
                <div
                  onClick={handleNextIncubation}
                  className="aico-step-card cursor-pointer select-none transition-all duration-200 border border-[#192A56]/25 bg-white p-6 shadow-xs relative group flex flex-col justify-between min-h-[260px] w-full hover:border-[#192A56] hover:shadow-md"
                  title="Klik kotak untuk lanjut ke langkah berikutnya"
                >
                  <div className="flex items-center justify-between w-full pb-3 border-b border-[#192A56]/15">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#192A56]" />
                      <span className="font-mono text-xs font-bold text-[#192A56] tracking-wider">
                        LANGKAH {incubationSlides[incubationSlideIndex].num} / {incubationSlides.length}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-[#192A56] tracking-wider group-hover:translate-x-1 transition-transform">
                      Berikutnya ➔
                    </span>
                  </div>

                  {/* Flat 2D Clean Icon Container */}
                  <div className="flex items-center justify-center my-6">
                    <div className="w-16 h-16 border border-[#192A56]/20 bg-slate-50 flex items-center justify-center p-3 group-hover:border-[#192A56] transition-colors">
                      <img
                        src={incubationSlides[incubationSlideIndex].icon}
                        loading="lazy"
                        alt={incubationSlides[incubationSlideIndex].name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  <div className="font-mono font-bold text-sm sm:text-base text-[#192A56] text-center leading-snug pt-2">
                    {incubationSlides[incubationSlideIndex].name}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={handlePrevIncubation}
                    className="group w-10 h-10 border border-[#192A56] bg-white hover:bg-[#192A56] active:bg-[#192A56] text-[#192A56] hover:text-white active:text-white flex items-center justify-center transition-all cursor-pointer"
                    title="Langkah Sebelumnya"
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.3212 2.91429C14.3212 2.40934 13.9118 2 13.4069 2H11.5783C11.0734 2 10.664 2.40934 10.664 2.91429V4.28571C10.664 4.79066 10.2547 5.2 9.74975 5.2H8.37832C7.87337 5.2 7.46404 5.60934 7.46404 6.11429V7.48571C7.46404 7.99066 7.0547 8.4 6.54975 8.4H5.17832C4.67338 8.4 4.26404 8.80934 4.26404 9.31429V11.1429C4.26404 11.6478 4.67338 12.0571 5.17832 12.0571H7.00689C7.51184 12.0571 7.92118 12.4665 7.92118 12.9714V13.8857C7.92118 14.3907 8.33052 14.8 8.83546 14.8H10.2069C10.7118 14.8 11.1212 15.2093 11.1212 15.7143V17.0857C11.1212 17.5907 11.5305 18 12.0355 18H13.864C14.369 18 14.7783 17.5907 14.7783 17.0857V15.2571C14.7783 14.7522 14.369 14.3429 13.864 14.3429H12.4926C11.9877 14.3429 11.5783 13.9335 11.5783 13.4286V12.0571C11.5783 11.5522 11.169 11.1429 10.664 11.1429H8.83546C8.33052 11.1429 7.92118 10.7335 7.92118 10.2286V9.77143C7.92118 9.26648 8.33052 8.85714 8.83546 8.85714H10.2069C10.7118 8.85714 11.1212 8.4478 11.1212 7.94286V6.57143C11.1212 6.06648 11.5305 5.65714 12.0355 5.65714H13.4069C13.9118 5.65714 14.3212 5.2478 14.3212 4.74286V2.91429Z" fill="currentColor" className="transition-colors group-hover:fill-white group-active:fill-white"/>
                    </svg>
                  </button>
                  <button
                    onClick={handleNextIncubation}
                    className="group w-10 h-10 border border-[#192A56] bg-white hover:bg-[#192A56] active:bg-[#192A56] text-[#192A56] hover:text-white active:text-white flex items-center justify-center transition-all cursor-pointer"
                    title="Langkah Berikutnya"
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.67882 2.91429C5.67882 2.40934 6.08816 2 6.59311 2H8.42168C8.92663 2 9.33597 2.40934 9.33597 2.91429V4.28571C9.33597 4.79066 9.7453 5.2 10.2503 5.2H11.6217C12.1266 5.2 12.536 5.60934 12.536 6.11429V7.48571C12.536 7.99066 12.9453 8.4 13.4503 8.4H14.8217C15.3266 8.4 15.736 8.80934 15.736 9.31429V11.1429C15.736 11.6478 15.3266 12.0571 14.8217 12.0571H12.9931C12.4882 12.0571 12.0788 12.4665 12.0788 12.9714V13.8857C12.0788 14.3907 11.6695 14.8 11.1645 14.8H9.79311C9.28816 14.8 8.87882 15.2093 8.87882 15.7143V17.0857C17.1212 17.5907 8.46948 18 7.96454 18H6.13597C5.63102 18 5.22168 17.5907 5.22168 17.0857V15.2571C5.22168 14.7522 5.63102 14.3429 6.13597 14.3429H7.50739C8.01234 14.3429 8.42168 13.9335 8.42168 13.4286V12.0571C8.42168 11.5522 8.83102 11.1429 9.33597 11.1429H11.1645C11.6695 11.1429 12.0788 10.7335 12.0788 10.2286V9.77143C12.0788 9.26648 11.6695 8.85714 11.1645 8.85714H9.79311C9.28816 8.85714 8.87882 8.4478 8.87882 7.94286V6.57143C8.87882 6.06648 8.46948 5.65714 7.96454 5.65714H6.59311C6.08816 5.65714 5.67882 5.2478 5.67882 4.74286V2.91429Z" fill="currentColor" className="transition-colors group-hover:fill-white group-active:fill-white"/>
                    </svg>
                  </button>
                  <span className="font-mono text-xs text-[#576574] ml-2">
                    Langkah {incubationSlideIndex + 1} dari {incubationSlides.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Kolom Tengah: Clean Cyber Pedestal Stage (Pipa & Kapsul Dihapus Bersih Sesuai Permintaan) */}
            <div className="w-full lg:w-[380px] xl:w-[420px] flex flex-col items-center justify-center relative py-6 overflow-visible pointer-events-none">
              <div className="relative w-full max-w-[340px] sm:max-w-[380px] h-[480px] sm:h-[520px] flex flex-col items-center justify-center my-auto shrink-0">
                {/* Holographic Concentric Ring Accents & Hairlines */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  <div className="w-64 h-64 rounded-full border border-[#192A56]/15 animate-pulse" />
                  <div className="w-80 h-80 rounded-full border border-dashed border-[#192A56]/10 absolute" />
                </div>

                {/* 3D Bulet MBG Biasa di Section 3 (Cara Kerja) */}
                <div
                  id="sec3-mascot-target"
                  className="w-48 h-48 sm:w-56 sm:h-56 relative flex flex-col items-center justify-center my-auto pointer-events-auto"
                >
                  <RobotMascotCanvas mode="coin" cameraDistance={3.2} />
                  {/* Badge MBG Pill */}
                  <div className="absolute -bottom-2 bg-[#192A56] text-white border border-[#192A56] font-mono text-[10px] font-bold px-3.5 py-0.5 rounded-full shadow-md tracking-widest z-20">
                    MBG
                  </div>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Unique Approach Description & CTA */}
            <div className="border-t lg:border-t-0 lg:border-l border-[#192A56]/20 p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-4 my-auto">
                <div className="font-mono text-xs sm:text-sm leading-relaxed text-[#1B1B1B] bg-slate-50 p-5 border border-[#192A56]/15">
                  Kami mewujudkan yang mustahil. Dalam ekosistem agentic AI, infrastruktur on-premise yang berdaulat adalah kunci mengubah otomatisasi kerja menjadi keunggulan kompetitif mutlak. Tanpa risiko kebocoran data ke cloud (zero cloud egress) dan turnstile keamanan enterprise — kami membangun fondasi ekspansi bisnis yang tangguh dan terpercaya.
                </div>
                
                <div className="p-3 bg-slate-100 border border-[#192A56]/20 text-[11px] font-mono text-[#192A56]">
                  • 100% On-Premise Sovereign Hardware Node<br />
                  • Local NPU AI Accelerated Execution<br />
                  • Turnstile Gate &amp; Human Approval Flow
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#192A56]/15">
                <a
                  href="/office"
                  onClick={(e) => {
                    e.preventDefault()
                    onNavigate?.('office')
                  }}
                  className="button-primary w-inline-block"
                >
                  <div className="button-primary-border" style={{ backgroundColor: '#192A56' }}>
                    <div className="button-primary-text font-bold" style={{ backgroundColor: '#192A56', color: '#FFFFFF' }}>
                      MASUK KE AICREW
                    </div>
                  </div>
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  )
}