import React from 'react'

export function FooterSection({ onNavigate }) {
  return (
    <footer className="w-full bg-white border-t border-[#192A56]/20 pt-12 pb-6 font-mono text-xs relative z-10 overflow-hidden">
      <div className="w-layout-blockcontainer container w-container relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#192A56]/20">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 bg-[#192A56]" />
              <span className="font-bold text-sm text-[#192A56] tracking-tight">STELAGENT // ENTERPRISE LABS</span>
            </div>
            <p className="text-[#576574] text-xs max-w-sm">
              Autonomous multi-agent orchestration for enterprise on-premise hardware. Zero cloud egress. 100% telemetry control.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-bold text-[#192A56]">
            <button
              onClick={() => onNavigate?.('landing')}
              className="hover:opacity-70 transition-opacity cursor-pointer"
            >
              Overview
            </button>
            <a href="#Capital-Incubation-Section" className="hover:opacity-70 transition-opacity">
              Our Programs
            </a>
            <a href="#portfolio-section" className="hover:opacity-70 transition-opacity">
              Portfolio
            </a>
            <button
              onClick={() => onNavigate?.('dashboard')}
              className="hover:opacity-70 transition-opacity cursor-pointer"
            >
              Command Hub
            </button>
            <button
              onClick={() => onNavigate?.('office')}
              className="text-[#192A56] underline cursor-pointer font-bold"
            >
              Masuk StelAgent →
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#576574]">
          <div>© 2026 StelAgent. ALL INTELLECTUAL RIGHTS RESERVED.</div>
          <div className="flex items-center gap-3">
            <span>INTEL NPU CORE 7</span>
            <span>•</span>
            <span>MSI CUBI APPLIANCE</span>
            <span>•</span>
            <span>AGENCY-AGENTS MESH</span>
          </div>
        </div>
      </div>

      {/* Giant Monolithic Watermark at bottom matching FSreferensi.png */}
      <div className="w-full overflow-hidden text-center select-none pt-8 pointer-events-none">
        <div className="font-display font-bold text-6xl sm:text-8xl md:text-[160px] leading-none text-[#192A56]/[0.08] tracking-[-4px] sm:tracking-[-8px] uppercase">
          STELAGENT
        </div>
      </div>
    </footer>
  )
}
