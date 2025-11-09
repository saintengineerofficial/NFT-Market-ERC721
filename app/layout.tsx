import type { Metadata } from "next"
import "./globals.css"
import "@rainbow-me/rainbowkit/styles.css"
import { Toaster } from "sonner"
import Provider from "@/services/provider"
import Header from "@/components/Header"

export const metadata: Metadata = {
  title: "NFT Events - 活动门票系统",
  description: "基于 ERC1155 的多类型门票 NFT 活动管理系统",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Provider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster />
        </Provider>
      </body>
    </html>
  )
}
