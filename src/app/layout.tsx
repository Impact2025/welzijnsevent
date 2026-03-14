import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Providers } from "./providers";
import { PwaRegister } from "@/components/pwa-register";
import { JsonLd } from "@/components/seo/json-ld";
import "./globals.css";


const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#C8522A",
};

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.nl";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Bijeen — Van aanmelding tot impact, alles bijeen!",
    template: "%s — Bijeen",
  },
  description: "Het eerste eventplatform gebouwd voor de welzijnssector. Van aanmelding tot WMO-rapportage — Bijeen regelt het, zodat jij je kunt focussen op de mensen.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bijeen",
    startupImage: [],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "Bijeen",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Bijeen — eventplatform voor de welzijnssector" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Bijeen",
  url: "https://bijeen.nl",
  logo: "https://bijeen.nl/icons/apple-touch-icon.png",
  description: "Het eerste eventplatform gebouwd voor de welzijnssector.",
  email: "hallo@bijeen.nl",
  foundingDate: "2024",
  areaServed: "NL",
  sameAs: ["https://bijeen.app"],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Bijeen",
  url: "https://bijeen.nl",
  description: "Het eerste eventplatform gebouwd voor de welzijnssector.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://bijeen.nl/ontdek?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={`${jakarta.variable} min-h-screen bg-cream font-sans`}>
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <Providers>
          <PwaRegister />
          {children}
        </Providers>
      </body>
      <GoogleAnalytics gaId="G-W1RTS0R3G1" />
    </html>
  );
}
