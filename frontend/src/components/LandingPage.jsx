import React, { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Navbar } from './landing/Navbar'
import { HeroSection } from './landing/HeroSection'
import { ProgramsSection } from './landing/ProgramsSection'
import { PortfolioSection } from './landing/PortfolioSection'
import { MediaPresenceSection } from './landing/MediaPresenceSection'
import { TestimonialsSection } from './landing/TestimonialsSection'
import { FoundersSection } from './landing/FoundersSection'
import { FaqSection } from './landing/FaqSection'
import { FooterSection } from './landing/FooterSection'

gsap.registerPlugin(ScrollTrigger)

export function LandingPage({
  onNavigate,
  isBackendConnected = false,
  systemInfo,
  bossConfig,
  agents = {},
  leads = []
}) {
  const lenisRef = useRef(null)

  // Inisialisasi Smooth Scroll Lenis + GSAP ScrollTrigger Integration
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.82,
      touchMultiplier: 1.2,
      infinite: false,
    })

    lenisRef.current = lenis

    // Sinkronisasi GSAP ScrollTrigger dengan Lenis scroll event
    lenis.on('scroll', ScrollTrigger.update)

    // Ticker loop GSAP mengemudikan Lenis RAF (100% frame-perfect sync)
    const updateLenis = (time) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(updateLenis)
    gsap.ticker.lagSmoothing(0)

    // Tangkap klik anchor menu navigasi agar meluncur halus
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]')
      if (anchor) {
        const href = anchor.getAttribute('href')
        if (href && href.startsWith('#') && href.length > 1) {
          e.preventDefault()
          const targetEl = document.querySelector(href)
          if (targetEl) {
            lenis.scrollTo(targetEl, {
              offset: -70,
              duration: 1.2,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            })
          }
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)

    // GSAP ScrollTrigger Batched Reveals untuk Animasi Halus & Presisi
    const ctx = gsap.context(() => {
      const revealTargets = [
        '.section-heading',
        '.team-card',
        '.testimonials-item',
        '.portfolio-item',
        '.media-item',
        '.accordion',
      ]

      revealTargets.forEach((targetSelector) => {
        const items = gsap.utils.toArray(targetSelector)
        items.forEach((item) => {
          gsap.fromTo(
            item,
            {
              opacity: 0,
              y: 20,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: item,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            }
          )
        })
      })
    })

    return () => {
      document.removeEventListener('click', handleAnchorClick)
      lenis.off('scroll', ScrollTrigger.update)
      gsap.ticker.remove(updateLenis)
      ctx.revert()
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      lenis.destroy()
    }
  }, [])

  return (
    <div className="min-h-screen bg-white text-[#192A56] font-mono selection:bg-[#192A56] selection:text-white relative overflow-x-clip">
      
      {/* 0. Fixed Vertical Architectural Guide Lines (Navy Hairline - 4 Consistent Columns) */}
      <div className="body-lines-wrap" style={{ opacity: 0.65 }}>
        <div className="body-line left" style={{ backgroundColor: 'rgba(25, 42, 86, 0.16)' }} />
        <div className="body-line left-middle" style={{ backgroundColor: 'rgba(25, 42, 86, 0.16)' }} />
        <div className="body-line center" style={{ backgroundColor: 'rgba(25, 42, 86, 0.16)' }} />
        <div className="body-line right-middle" style={{ backgroundColor: 'rgba(25, 42, 86, 0.16)' }} />
        <div className="body-line right" style={{ backgroundColor: 'rgba(25, 42, 86, 0.16)' }} />
      </div>

      {/* 1. Global Fixed Cyber-Industrial Navbar */}
      <Navbar onNavigate={onNavigate} />

      {/* Main Content Sections */}
      <main className="relative z-10">
        {/* 2. Hero Section (Greeting 3D Robot Mascot, Interactive Speech Bubble, Partner Strip) */}
        <HeroSection onNavigate={onNavigate} />

        {/* 3. Programs Section (Beyond Capital + Incubation dengan Pipa Vertikal Terintegrasi Utuh) */}
        <ProgramsSection onNavigate={onNavigate} />

        {/* 4. Portfolio Section (Robot Circuit Conduit & Row of Modular Project Cards) */}
        <PortfolioSection onNavigate={onNavigate} />

        {/* 5. Media Presence Section (Industry Press & Telemetry Cards) */}
        <MediaPresenceSection />

        {/* 6. Testimonials Section (Client Reviews with Authentic Webflow Cards) */}
        <TestimonialsSection />

        {/* 7. The Founders Section (Grayscale Sharp Frames & Expandable Bio) */}
        <FoundersSection onNavigate={onNavigate} />

        {/* 8. FAQ Section (Accordion with [+] Expand Buttons) */}
        <FaqSection />

        {/* 9. Industrial Minimalist Footer */}
        <FooterSection onNavigate={onNavigate} />
      </main>
    </div>
  )
}
