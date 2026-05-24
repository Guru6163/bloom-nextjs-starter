import type { Metadata } from "next"
import { EB_Garamond, Inter, Instrument_Serif } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
})

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: {
    default: "Bloom Next.js Starter",
    template: "%s · Bloom Starter",
  },
  description:
    "Generate on-brand images in your Next.js app with the Bloom API.",
  icons: {
    icon: "/favicon.ico",
    apple: "/bloom-icon-512.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} ${ebGaramond.variable}`}
    >
      <body
        className="landing-grain min-h-screen bg-background font-sans text-foreground antialiased"
      >
        {children}
      </body>
    </html>
  )
}
