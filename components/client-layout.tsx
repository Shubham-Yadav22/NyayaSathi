"use client"

import type React from "react"

import Navigation from "@/components/navigation"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background transition-colors duration-300">{children}</main>
    </>
  )
}
