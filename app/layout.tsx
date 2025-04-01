import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteProvider } from "@/contexts/site-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "JBA Betting Site",
  description: "Place your bets on live events",
  generator: "v0.dev",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SiteProvider>{children}</SiteProvider>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            // Fix for iOS Safari viewport height
            const appHeight = () => {
              const doc = document.documentElement;
              doc.style.setProperty('--app-height', \`\${window.innerHeight}px\`);
            }
            window.addEventListener('resize', appHeight);
            appHeight();
          `,
          }}
        />
      </body>
    </html>
  )
}



import './globals.css'