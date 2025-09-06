import type { Metadata } from "next";
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import { Toaster } from "sonner";
import Provider from '@/services/provider';

export const metadata: Metadata = {
  title: "SaintNFT",
  description: "SaintNFT Marketplace",
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <body>
        <Provider>
          {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
