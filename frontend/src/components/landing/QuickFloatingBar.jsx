import React from 'react'
import { Send, ArrowUp } from 'lucide-react'

export function QuickFloatingBar() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <aside className="fixed right-3 top-36 z-40 hidden lg:flex flex-col items-center bg-[#F6F6F6] border border-[#9E9E9E] divide-y divide-[#9E9E9E] font-mono text-xs select-none">
      {/* 1. Radar / Target Icon */}
      <button
        onClick={scrollToTop}
        className="w-8 h-8 flex items-center justify-center text-[#0E0E0E] hover:text-[#ed1e28] hover:bg-[#EFEFE5] transition cursor-pointer"
        title="Status Radar // Live Core"
      >
        <div className="w-3.5 h-3.5 border border-current flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-[#ed1e28]" />
        </div>
      </button>

      {/* 2. Twitter / X */}
      <a
        href="https://twitter.com"
        target="_blank"
        rel="noreferrer"
        className="w-8 h-8 flex items-center justify-center text-[#0E0E0E] hover:text-[#ed1e28] hover:bg-[#EFEFE5] transition cursor-pointer font-bold text-xs"
        title="Twitter / X"
      >
        𝕏
      </a>

      {/* 3. Telegram */}
      <a
        href="https://t.me"
        target="_blank"
        rel="noreferrer"
        className="w-8 h-8 flex items-center justify-center text-[#0E0E0E] hover:text-[#ed1e28] hover:bg-[#EFEFE5] transition cursor-pointer"
        title="Telegram Hub"
      >
        <Send className="w-3.5 h-3.5 -rotate-45" />
      </a>

      {/* 4. Medium (M) */}
      <a
        href="https://medium.com"
        target="_blank"
        rel="noreferrer"
        className="w-8 h-8 flex items-center justify-center text-[#0E0E0E] hover:text-[#ed1e28] hover:bg-[#EFEFE5] transition cursor-pointer font-bold text-xs"
        title="Medium Publications"
      >
        M
      </a>

      {/* 5. LinkedIn (in) */}
      <a
        href="https://linkedin.com"
        target="_blank"
        rel="noreferrer"
        className="w-8 h-8 flex items-center justify-center text-[#0E0E0E] hover:text-[#ed1e28] hover:bg-[#EFEFE5] transition cursor-pointer font-bold text-[11px]"
        title="LinkedIn Network"
      >
        in
      </a>

      {/* 6. Scroll To Top */}
      <button
        onClick={scrollToTop}
        className="w-8 h-8 flex items-center justify-center text-[#636363] hover:text-[#ed1e28] hover:bg-[#EFEFE5] transition cursor-pointer"
        title="Top of Page"
      >
        <ArrowUp className="w-3.5 h-3.5" />
      </button>
    </aside>
  )
}
