import React, { useState, useEffect } from 'react'

export function Navbar({ onNavigate }) {
  const [ecosystemOpen, setEcosystemOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

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
        {/* Inner Cream Canvas Navbar with 28px Inset Chamfers */}
        <div
          className="w-full bg-white flex items-center justify-between px-6 sm:px-10 md:px-14 h-16 sm:h-20 relative"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 28px), calc(100% - 28px) 100%, 28px 100%, 0 calc(100% - 28px))',
          }}
        >
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
                    className="font-extrabold text-2xl sm:text-3xl tracking-wider text-[#192A56] uppercase"
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
          <div className="header-main-nav hidden lg:flex items-center">
            <nav role="navigation" className="nav-menu w-nav-menu">
              <ul role="list" className="header-menu flex items-center gap-2 xl:gap-3">
                
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

          {/* Right Header Actions: Ecosystem, Login, and Masuk ke StelAgent */}
          <div className="header-actions flex items-center gap-3 sm:gap-4">
            
            {/* Ecosystem Dropdown */}
            <div
              className={`product-menu w-dropdown ${ecosystemOpen ? 'w--open' : ''}`}
              onClick={() => setEcosystemOpen(!ecosystemOpen)}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <div className="product-menu-toggle w-dropdown-toggle">
                <div className="product-menu-icon-wrapper">
                  <div className="product-menu-icon">
                    <div className="product-menu-icon-dot pos-top-left" style={{ backgroundColor: '#192A56' }} />
                    <div className="product-menu-icon-dot pos-top-right" style={{ backgroundColor: '#192A56' }} />
                    <div className="product-menu-icon-dot pos-bottom-left" style={{ backgroundColor: '#192A56' }} />
                    <div className="product-menu-icon-dot pos-bottom-right" style={{ backgroundColor: '#192A56' }} />
                  </div>
                </div>
                <div className="product-menu-icon-placeholder" />
                <div className="product-menu-toggle-text text-xs sm:text-[13px] text-[#192A56]">:: Our Ecosystem</div>
                <img
                  src="/assets/webflow/664753c2515af09bef5b9826/664867c607dc6853b6e435aa_arrow-down.svg"
                  loading="lazy"
                  alt=""
                  className="header__icon-arrow"
                />
              </div>

              {/* Dropdown Menu Items */}
              {ecosystemOpen && (
                <nav id="product-menu-list" className="product-menu-list w-dropdown-list w--open bg-white border border-[#192A56]/20 shadow-xl" style={{ display: 'block' }}>
                  <div className="div-block-23">
                    <div className="product-menu-item">
                      <a
                        href="/office"
                        onClick={(e) => {
                          e.preventDefault()
                          onNavigate?.('office')
                        }}
                        className="product-menu-link w-inline-block"
                      >
                        <div className="product-menu-link-box">
                          <div className="product-menu-item-logo-area">
                            <span className="font-bold text-xs text-[#192A56]">STELAGENT OFFICE</span>
                          </div>
                          <div className="product-menu-link-text">VIRTUAL 3D SHOWROOM</div>
                        </div>
                      </a>
                    </div>

                    <div className="product-menu-item">
                      <a
                        href="/dashboard"
                        onClick={(e) => {
                          e.preventDefault()
                          onNavigate?.('dashboard')
                        }}
                        className="product-menu-link w-inline-block"
                      >
                        <div className="product-menu-link-box">
                          <div className="product-menu-item-logo-area">
                            <span className="font-bold text-xs text-[#192A56]">COMMAND HUB</span>
                          </div>
                          <div className="product-menu-link-text">AI AGENT DASHBOARD</div>
                        </div>
                      </a>
                    </div>
                  </div>
                </nav>
              )}
            </div>

            {/* Primary Action Button: Masuk ke StelAgent (#192A56 Chamfer) */}
            <a
              href="/office"
              onClick={(e) => {
                e.preventDefault()
                onNavigate?.('office')
              }}
              className="button-primary w-inline-block"
            >
              <div className="button-primary-border" style={{ backgroundColor: '#192A56' }}>
                <div className="button-primary-text font-bold" style={{ padding: '0.75rem 1.6rem', backgroundColor: '#192A56', color: '#FFFFFF' }}>
                  MASUK KE STELAGENT
                </div>
              </div>
            </a>

            {/* Mobile Hamburger Button */}
            <div
              className="menu-button w-nav-button lg:hidden ml-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src="/assets/webflow/664753c2515af09bef5b9826/667aad97eecb4ce5dfdd8f30_ico-hamburger-open.svg"
                loading="lazy"
                alt="Menu"
                className="menu-icon-burger"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#192A56]/20 px-4 py-3 font-mono pointer-events-auto">
          <ul className="flex flex-col gap-2">
            <li>
              <a
                href="#Capital-Incubation-Section"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 text-xs text-[#192A56] font-bold"
              >
                Ekosistem
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
