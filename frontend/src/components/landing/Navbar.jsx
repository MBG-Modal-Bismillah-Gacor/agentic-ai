import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, LayoutGrid, Building2, MonitorDot, Terminal, Sparkles, ExternalLink, Send } from 'lucide-react'

export function Navbar({ onNavigate }) {
  const [ecosystemOpen, setEcosystemOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const ecosystemRef = useRef(null)

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ecosystemRef.current && !ecosystemRef.current.contains(e.target)) {
        setEcosystemOpen(false)
      }
    }
    if (ecosystemOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [ecosystemOpen])

  // ScrollSpy untuk animasi indikator aktif (ai/navbaractive.png)
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140
      const sections = [
        { id: 'Capital-Incubation-Section', key: 'programs' },
        { id: 'portfolio-section', key: 'portfolio' },
        { id: 'media-section', key: 'media' },
        { id: 'reviews-section', key: 'reviews' },
        { id: 'team-section', key: 'team' },
        { id: 'faq-section', key: 'faq' },
      ]

      let current = ''
      for (const sec of sections) {
        const el = document.getElementById(sec.id)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPos >= top && scrollPos < top + height) {
            current = sec.key
            break
          }
        }
      }
      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-0 pt-0 pointer-events-none">
      
      {/* Outer Border Layer Full 100% Width with Angled Chamfers & Crisp Strokes */}
      <div className="w-full relative pointer-events-auto">
        {/* Background Layer with 28px Inset Chamfers */}
        <div
          className="absolute inset-0 bg-white pointer-events-none"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 28px), calc(100% - 28px) 100%, 28px 100%, 0 calc(100% - 28px))',
          }}
        />
        {/* Inner Content Flex (Unclipped so dropdown menus render properly) */}
        <div className="w-full flex items-center justify-between px-4 sm:px-6 md:px-8 xl:px-10 2xl:px-14 h-16 sm:h-20 relative">
          {/* Continuous Bottom & Chamfer Border Stroke Overlay */}
          <div 
            className="absolute pointer-events-none z-30"
            style={{ bottom: 0, left: '28px', right: '28px', height: '1.5px', backgroundColor: 'rgba(25, 42, 86, 0.3)' }} 
          />
          <svg 
            className="absolute pointer-events-none z-30" 
            style={{ bottom: 0, left: 0, width: '28px', height: '28px' }}
            viewBox="0 0 28 28" 
            fill="none"
          >
            <line x1="0" y1="0" x2="28" y2="28" stroke="rgba(25, 42, 86, 0.3)" strokeWidth="1.5" />
          </svg>
          <svg 
            className="absolute pointer-events-none z-30" 
            style={{ bottom: 0, right: 0, width: '28px', height: '28px' }}
            viewBox="0 0 28 28" 
            fill="none"
          >
            <line x1="0" y1="28" x2="28" y2="0" stroke="rgba(25, 42, 86, 0.3)" strokeWidth="1.5" />
          </svg>

          {/* Brand Wrap: StelAgent (Flawless Rendering, No Clipping, No Glitch) */}
          <div className="flex items-center relative z-20 shrink-0">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault()
                onNavigate?.('landing')
              }}
              aria-current="page"
              className="flex items-center no-underline cursor-pointer select-none"
              style={{ overflow: 'visible', width: 'auto', maxWidth: 'none', textDecoration: 'none' }}
            >
              <div className="flex items-center gap-3">
                {/* Typography: StelAgent (Using Space Grotesk Bold, 100% Crisp & Fully Visible W) */}
                <div className="flex items-center leading-none select-none">
                  <span 
                    className="font-extrabold text-xl sm:text-2xl xl:text-3xl tracking-wider text-[#192A56] uppercase"
                    style={{ 
                      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                      letterSpacing: '0.04em'
                    }}
                  >
                    STELAGENT
                  </span>
                </div>
              </div>
            </a>
          </div>

          {/* Main Navigation Menu with Active Corner Indicators (HANYA Kanan Atas & Kiri Bawah) */}
          <div className="hidden xl:flex items-center mx-3 2xl:mx-5">
            <nav role="navigation" className="nav-menu w-nav-menu">
              <ul role="list" className="header-menu flex items-center gap-1.5 2xl:gap-3">
                
                {/* 1. Ekosistem */}
                <li className="header-menu-item">
                  <a
                    href="#Capital-Incubation-Section"
                    className={`header-menu-link w-inline-block ${activeSection === 'programs' ? 'is-active' : ''}`}
                  >
                    <div className="header-menu-link-wrapper relative px-3 py-1.5">
                      <span className="nav-corner nav-corner-tr" />
                      <span className="nav-corner nav-corner-bl" />
                      <div className="header-menu-link-text text-xs sm:text-[13px] tracking-wide text-[#192A56] font-medium">Ekosistem</div>
                    </div>
                  </a>
                </li>

                {/* 2. Target Pengguna */}
                <li className="header-menu-item">
                  <a
                    href="#portfolio-section"
                    className={`header-menu-link w-inline-block ${activeSection === 'portfolio' ? 'is-active' : ''}`}
                  >
                    <div className="header-menu-link-wrapper relative px-3 py-1.5">
                      <span className="nav-corner nav-corner-tr" />
                      <span className="nav-corner nav-corner-bl" />
                      <div className="header-menu-link-text text-xs sm:text-[13px] tracking-wide text-[#192A56] font-medium">Target Pengguna</div>
                    </div>
                  </a>
                </li>

                {/* 3. Media */}
                <li className="header-menu-item">
                  <a
                    href="#media-section"
                    className={`header-menu-link w-inline-block ${activeSection === 'media' ? 'is-active' : ''}`}
                  >
                    <div className="header-menu-link-wrapper relative px-3 py-1.5">
                      <span className="nav-corner nav-corner-tr" />
                      <span className="nav-corner nav-corner-bl" />
                      <div className="header-menu-link-text text-xs sm:text-[13px] tracking-wide text-[#192A56] font-medium">Media</div>
                    </div>
                  </a>
                </li>

                {/* 4. Testimoni */}
                <li className="header-menu-item">
                  <a
                    href="#reviews-section"
                    className={`header-menu-link w-inline-block ${activeSection === 'reviews' ? 'is-active' : ''}`}
                  >
                    <div className="header-menu-link-wrapper relative px-3 py-1.5">
                      <span className="nav-corner nav-corner-tr" />
                      <span className="nav-corner nav-corner-bl" />
                      <div className="header-menu-link-text text-xs sm:text-[13px] tracking-wide text-[#192A56] font-medium">Testimoni</div>
                    </div>
                  </a>
                </li>

                {/* 5. Team AI */}
                <li className="header-menu-item">
                  <a
                    href="#team-section"
                    className={`header-menu-link w-inline-block ${activeSection === 'team' ? 'is-active' : ''}`}
                  >
                    <div className="header-menu-link-wrapper relative px-3 py-1.5">
                      <span className="nav-corner nav-corner-tr" />
                      <span className="nav-corner nav-corner-bl" />
                      <div className="header-menu-link-text text-xs sm:text-[13px] tracking-wide text-[#192A56] font-medium">Team AI</div>
                    </div>
                  </a>
                </li>

                {/* 6. FAQ */}
                <li className="header-menu-item">
                  <a
                    href="#faq-section"
                    className={`header-menu-link w-inline-block ${activeSection === 'faq' ? 'is-active' : ''}`}
                  >
                    <div className="header-menu-link-wrapper relative px-3 py-1.5">
                      <span className="nav-corner nav-corner-tr" />
                      <span className="nav-corner nav-corner-bl" />
                      <div className="header-menu-link-text text-xs sm:text-[13px] tracking-wide text-[#192A56] font-medium">FAQ</div>
                    </div>
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Right Header Actions: Ecosystem Dropdown & Masuk ke StelAgent */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 !m-0 !p-0">
            
            {/* User-Friendly Ecosystem & Hub Dropdown */}
            <div className="relative" ref={ecosystemRef}>
              <button
                type="button"
                onClick={() => setEcosystemOpen(!ecosystemOpen)}
                className={`hidden sm:flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all border select-none cursor-pointer ${
                  ecosystemOpen
                    ? 'shadow-md shadow-[#192A56]/20'
                    : 'hover:bg-slate-50 border-slate-300 hover:border-[#192A56]/60 shadow-xs'
                }`}
                style={{
                  backgroundColor: ecosystemOpen ? '#192A56' : '#FFFFFF',
                  color: ecosystemOpen ? '#FFFFFF' : '#192A56',
                  borderColor: ecosystemOpen ? '#192A56' : '#CBD5E1',
                }}
                title="Buka Navigasi Ekosistem StelAgent"
              >
                <LayoutGrid 
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform duration-200 ${ecosystemOpen ? 'rotate-90' : ''}`}
                  style={{ color: ecosystemOpen ? '#FFFFFF' : '#192A56' }} 
                />
                <span className="tracking-wide" style={{ color: ecosystemOpen ? '#FFFFFF' : '#192A56' }}>Our Ecosystem</span>
                <ChevronDown 
                  className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${ecosystemOpen ? 'rotate-180' : ''}`}
                  style={{ color: ecosystemOpen ? '#FFFFFF' : 'rgba(25, 42, 86, 0.7)' }} 
                />
              </button>

              {/* Dropdown Menu Popover (Modern, Clean, User-Friendly) */}
              {ecosystemOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 sm:w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 font-sans"
                  style={{
                    boxShadow: '0 20px 40px -15px rgba(25, 42, 86, 0.25), 0 0 0 1px rgba(25, 42, 86, 0.08)'
                  }}
                >
                  <div className="px-3 py-2 border-b border-[#192A56]/15 mb-2 flex items-center justify-between font-mono bg-slate-50/70 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#192A56]" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#192A56]">
                        EKOSISTEM STELAGENT
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#192A56]/70 uppercase tracking-wider">
                      v2.5 // LOCAL
                    </span>
                  </div>

                  <div className="space-y-1">
                    {/* Item 1: Virtual Office 3D */}
                    <a
                      href="/office"
                      onClick={(e) => {
                        e.preventDefault()
                        setEcosystemOpen(false)
                        onNavigate?.('office')
                      }}
                      className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200/80 cursor-pointer text-left"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#192A56]/10 text-[#192A56] flex items-center justify-center shrink-0 group-hover:bg-[#192A56] group-hover:text-white transition">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[#192A56]">Virtual Office 3D</span>
                          <span className="text-[9px] bg-blue-100 text-[#192A56] px-1.5 py-0.5 rounded font-bold">3D Scene</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">Showroom interaktif kantor agen AI & CCTV</p>
                      </div>
                    </a>

                    {/* Item 2: Command Hub / Pusat Kontrol */}
                    <a
                      href="/dashboard"
                      onClick={(e) => {
                        e.preventDefault()
                        setEcosystemOpen(false)
                        onNavigate?.('dashboard')
                      }}
                      className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200/80 cursor-pointer text-left"
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                        <MonitorDot className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[#192A56]">Pusat Kontrol (Command Hub)</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Dashboard</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">Pipeline prospek, SPK & telemetri hardware</p>
                      </div>
                    </a>

                    {/* Item 3: Telegram Bot @StelAgentBot */}
                    <a
                      href="https://t.me/StelAgentBot"
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setEcosystemOpen(false)}
                      className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200/80 cursor-pointer text-left"
                    >
                      <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:bg-[#0088cc] group-hover:text-white transition">
                        <Send className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[#192A56]">@StelAgentBot</span>
                          <span className="text-[9px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-bold">Telegram</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">Bot asisten sales &amp; notifikasi WA deal closing</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#192A56] shrink-0" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Button: Masuk ke StelAgent (#192A56 Chamfer) */}
            <a
              href="/office"
              onClick={(e) => {
                e.preventDefault()
                onNavigate?.('office')
              }}
              className="button-primary w-inline-block shrink-0 no-underline"
            >
              <div className="button-primary-border" style={{ backgroundColor: '#192A56' }}>
                <div
                  className="button-primary-text font-bold text-[11px] sm:text-xs tracking-wider"
                  style={{
                    padding: '0.55rem 1.1rem',
                    backgroundColor: '#192A56',
                    color: '#FFFFFF'
                  }}
                >
                  MASUK KE STELAGENT
                </div>
              </div>
            </a>

            {/* Mobile Hamburger Button */}
            <div
              className="xl:hidden ml-1 p-1.5 flex items-center justify-center shrink-0 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <img
                src="/assets/webflow/664753c2515af09bef5b9826/667aad97eecb4ce5dfdd8f30_ico-hamburger-open.svg"
                loading="lazy"
                alt="Menu"
                className="w-5 h-5 block"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-[#192A56]/20 px-4 py-3 font-mono pointer-events-auto">
          {/* Quick Ecosystem Shortcuts in Mobile */}
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 mb-2.5 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#192A56]/70 px-1 block">Navigasi Ekosistem Cepat</span>
            <a
              href="/office"
              onClick={(e) => {
                e.preventDefault()
                setMobileMenuOpen(false)
                onNavigate?.('office')
              }}
              className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-[#192A56]"
            >
              <Building2 className="w-4 h-4 text-[#192A56]" />
              <span>Virtual Office 3D (Showroom)</span>
            </a>
            <a
              href="/dashboard"
              onClick={(e) => {
                e.preventDefault()
                setMobileMenuOpen(false)
                onNavigate?.('dashboard')
              }}
              className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-emerald-800"
            >
              <MonitorDot className="w-4 h-4 text-emerald-600" />
              <span>Pusat Kontrol (Command Hub)</span>
            </a>
          </div>

          <ul className="flex flex-col gap-2">
            <li>
              <a
                href="#Capital-Incubation-Section"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 text-xs text-[#192A56] font-bold"
              >
                Program Ekosistem
              </a>
            </li>
            <li>
              <a
                href="#portfolio-section"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 text-xs text-[#192A56] font-bold"
              >
                Target Pengguna
              </a>
            </li>
            <li>
              <a
                href="#media-section"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 text-xs text-[#192A56] font-bold"
              >
                Media
              </a>
            </li>
            <li>
              <a
                href="#reviews-section"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 text-xs text-[#192A56] font-bold"
              >
                Testimoni
              </a>
            </li>
            <li>
              <a
                href="#team-section"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 text-xs text-[#192A56] font-bold"
              >
                Team AI
              </a>
            </li>
            <li>
              <a
                href="#faq-section"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 text-xs text-[#192A56] font-bold"
              >
                FAQ
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
