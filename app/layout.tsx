import type { Metadata } from "next"
import "./globals.css"
import "@rainbow-me/rainbowkit/styles.css"
import { Toaster } from "sonner"
import Provider from "@/services/provider"
import Header from "@/components/sections/Header"

export const metadata: Metadata = {
  title: "SaintNFT",
  description: "SaintNFT Marketplace",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Provider>
          <Header></Header>
          <div className="h-25"></div>
          {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  )
}
