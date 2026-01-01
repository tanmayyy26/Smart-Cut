"use client"

import { BackgroundRemover } from "@/components/background-remover"
import { BackgroundChanger } from "@/components/background-changer"
import { Scene3D } from "@/components/scene-3d"

import { useState } from "react"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"remove" | "change">("remove")
  return (
    <main className="relative min-h-screen overflow-hidden" suppressHydrationWarning>
      <Scene3D />
      {/* Main content wrapper with padding for fixed navbar */}
          <header className="fixed top-0 left-0 w-full z-20 p-6 md:p-8 bg-gradient-to-b from-[#0a0a0a]/90 to-[#0a0a0a]/70 backdrop-blur-sm">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="block text-3xl font-bold text-transparent bg-gradient-to-r from-[#A3C9A8] to-[#C7E8C5] bg-clip-text text-center relative" style={{ letterSpacing: '-0.02em' }}>
                <span className="inline-block">
                  ✨ SmartCut
                </span>
              </span>
            </div>
            {/* Navigation links removed as requested */}
            <div className="hidden md:flex items-center gap-8 text-muted-foreground"></div>
          </nav>
        </header>
        <div className="relative z-10 min-h-screen flex flex-col pt-28">

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground mb-6 text-balance leading-tight">
              Remove. Change.
              <br />
              <span className="bg-gradient-to-r from-[#A3C9A8] via-[#C7E8C5] to-[#7ee5c7] bg-[length:200%_auto] bg-clip-text text-transparent animate-[gradient-shift_3s_ease_infinite]">
                See Magic.
              </span>
            </h1>
            <p className="text-lg md:text-2xl text-[#b0d4a8]/90 max-w-3xl mx-auto text-pretty font-light tracking-wide leading-relaxed">
              Transform your images with AI-powered background removal and generation in seconds
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-12 justify-center flex-wrap">
            <button
              onClick={() => setActiveTab("remove")}
              className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 text-lg ${
                activeTab === "remove"
                  ? "bg-gradient-to-r from-[#A3C9A8] via-[#C7E8C5] to-[#A3C9A8] text-[#0a0a0a] shadow-2xl shadow-[#A3C9A8]/40 scale-105 hover:scale-110"
                  : "border-2 border-[#A3C9A8]/40 text-[#A3C9A8] hover:border-[#A3C9A8]/80 hover:shadow-lg hover:shadow-[#A3C9A8]/20"
              }`}
            >
              🎯 Remove Background
            </button>
            <button
              onClick={() => setActiveTab("change")}
              className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 text-lg ${
                activeTab === "change"
                  ? "bg-gradient-to-r from-[#A3C9A8] via-[#C7E8C5] to-[#A3C9A8] text-[#0a0a0a] shadow-2xl shadow-[#A3C9A8]/40 scale-105 hover:scale-110"
                  : "border-2 border-[#A3C9A8]/40 text-[#A3C9A8] hover:border-[#A3C9A8]/80 hover:shadow-lg hover:shadow-[#A3C9A8]/20"
              }`}
            >
              🎨 Change Background
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "remove" ? <BackgroundRemover /> : <BackgroundChanger />}
        </div>

        {/* Footer removed as requested */}
      </div>
    </main>
  )
}
