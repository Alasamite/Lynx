import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lynxclimbing.com"
const title = "Lynx Climbing | Premium Technical Climbing Holds & Bouldering Holds"
const description =
  "Premium resin climbing holds inspired by the Iberian lynx and Serra de Sintra granite. Technical macro holds, jugs and crimps for indoor climbing gyms, bouldering walls and route setters."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: "%s | Lynx Climbing",
  },
  description,
  keywords: [
    "climbing holds",
    "bouldering holds",
    "climbing grips",
    "climbing wall holds",
    "indoor climbing holds",
    "climbing gym holds",
    "route setting holds",
    "resin climbing holds",
    "climbing hold manufacturer",
    "premium climbing holds",
    "technical climbing holds",
    "granite climbing holds",
    "macro climbing holds",
    "crimp holds",
    "jug holds",
    "climbing volumes",
    "climbing training holds",
    "presas de escalada",
    "presas para escalada indoor",
    "presas de boulder",
    "presas de parede de escalada",
    "presas para rocodromo",
    "presas tecnicas de escalada",
    "presas de resina para escalada",
    "volumes de escalada",
    "presas de escalada Portugal",
    "presas de rocodromo",
    "agarres de escalada",
    "presas tecnicas",
    "presas de resina",
    "volumenes de escalada",
    "presas de escalada Espana",
    "preses d'escalada",
    "preses per rocodrom",
    "preses de boulder",
    "preses d'escalada indoor",
    "volums d'escalada",
    "eskalada heldulekuak",
    "boulder heldulekuak",
    "rokodromorako heldulekuak",
    "indoor eskalada heldulekuak",
    "presas para rocodromo",
    "presas de escalada indoor",
  ],
  authors: [{ name: "Lynx Climbing" }],
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      "pt-PT": "/?lang=pt-PT",
      "es-ES": "/?lang=es-ES",
      ca: "/?lang=ca",
      eu: "/?lang=eu",
      gl: "/?lang=gl",
      "it-IT": "/?lang=it-IT",
      "fr-FR": "/?lang=fr-FR",
      "de-DE": "/?lang=de-DE",
      "ru-RU": "/?lang=ru-RU",
      "zh-CN": "/?lang=zh-CN",
      "hi-IN": "/?lang=hi-IN",
      ar: "/?lang=ar",
      he: "/?lang=he",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Lynx Climbing | Premium Technical Climbing Holds",
    description: "Premium resin climbing holds, bouldering holds and route setting equipment inspired by the Iberian lynx and Serra de Sintra granite.",
    type: "website",
    url: SITE_URL,
    siteName: "Lynx Climbing",
    locale: "en",
    alternateLocale: ["pt_PT", "es_ES", "ca", "eu", "gl", "it_IT", "fr_FR", "de_DE", "ru_RU", "zh_CN", "hi_IN", "ar", "he"],
    images: [{ url: "/images/sintra/boulder-hero.jpg", width: 1200, height: 630, alt: "Lynx Climbing premium resin climbing holds inspired by Serra de Sintra granite" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lynx Climbing | Premium Technical Climbing Holds",
    description: "Premium resin climbing holds, bouldering holds and route setting equipment inspired by the Iberian lynx and Serra de Sintra granite.",
    images: ["/images/sintra/boulder-hero.jpg"],
  },
  category: "ecommerce",
}

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-[#050505]">
      <body className="bg-[#050505] font-sans text-[#F2EFE7] antialiased">
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
