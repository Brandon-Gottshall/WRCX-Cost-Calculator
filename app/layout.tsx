import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { PreloadAssets } from "@/components/preload-assets"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "WRCX Stream/VOD Platform Calculator",
  description: "Calculate costs for streaming and VOD platforms",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <PreloadAssets />
      <body>{children}</body>
    </html>
  )
}
