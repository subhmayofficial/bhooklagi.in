import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Bebas_Neue, Playfair_Display, Inter, Lilita_One } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { MainContentWrapper } from "@/components/layout/MainContentWrapper";
import { WhatsAppFloatButton } from "@/components/layout/WhatsAppFloatButton";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { CartRehydrate } from "@/components/providers/CartRehydrate";
import { AuthRehydrate } from "@/components/providers/AuthRehydrate";
import { OtpLoginModal } from "@/components/auth/OtpLoginModal";
import { RatingPopup } from "@/components/layout/RatingPopup";
import { MSG91_SCRIPT_SRC } from "@/lib/msg91/widget";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const lilita = Lilita_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-lilita",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bhooklagi.in"),
  title: {
    default: "Bhook Lagi? | Best Food Delivery in Deoghar",
    template: "%s | Bhook Lagi?",
  },
  description:
    "Deoghar's premium cloud kitchen! Order delicious burgers, rolls, maggi, Chinese, pasta & fries online. Fast delivery near Baba Baidyanath Dham & across Deoghar.",
  keywords: [
    "Bhook Lagi",
    "food delivery Deoghar",
    "order food online Deoghar",
    "best restaurants in Deoghar",
    "Baidyanath Dham food delivery",
    "cloud kitchen Deoghar",
    "online food ordering Deoghar",
    "Deoghar food",
    "late night food Deoghar",
    "burgers Deoghar",
    "chinese food Deoghar",
    "Jharkhand food delivery"
  ],
  authors: [{ name: "Bhook Lagi? Kitchen" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Bhook Lagi?",
    title: "Bhook Lagi? | Best Food Delivery in Deoghar, Jharkhand",
    description:
      "Order Deoghar's best burgers, rolls, Chinese & pasta online. Fast delivery anywhere in Deoghar!",
    url: "https://www.bhooklagi.in",
  },
  twitter: {
    card: "summary_large_image",
    site: "@bhooklagi",
    title: "Bhook Lagi? | Food Delivery Deoghar",
    description: "Order food online in Deoghar — fast delivery & big flavours.",
  },
  icons: {
    icon: "/favicon_io/favicon-32x32.png",
    shortcut: "/favicon_io/favicon.ico",
    apple: "/favicon_io/apple-touch-icon.png",
  },
  manifest: "/favicon_io/site.webmanifest",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  "name": "Bhook Lagi?",
  "image": "https://www.bhooklagi.in/apple-touch-icon.png",
  "@id": "https://www.bhooklagi.in",
  "url": "https://www.bhooklagi.in",
  "telephone": "+919296834048",
  "priceRange": "₹",
  "menu": "https://www.bhooklagi.in/",
  "servesCuisine": ["Fast Food", "Chinese", "Indian", "Burgers", "Rolls", "Pasta"],
  "acceptsReservations": "False",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Deoghar",
    "addressRegion": "Jharkhand",
    "postalCode": "814112",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 24.4820,
    "longitude": 86.6990
  }
};

export const viewport: Viewport = {
  themeColor: "#E85D04",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google Tag Manager */}
        <Script id="gtm-head" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-N264N5HL');`}
        </Script>
      </head>
      <body
        className={`${inter.className} ${lilita.variable} ${bebas.variable} ${playfair.variable} min-h-dvh bg-gray-50 text-ink antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N264N5HL"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <CartRehydrate />
        <AuthRehydrate />
        <ScrollProgress />
        <MainContentWrapper>{children}</MainContentWrapper>
        <BottomNav />
        <WhatsAppFloatButton />
        <OtpLoginModal />
        <RatingPopup />
        <Script src={MSG91_SCRIPT_SRC} strategy="afterInteractive" />

        {/* Google Analytics (via GTM — kept for direct GA4 events too) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8N9WY0WXSH"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8N9WY0WXSH');
          `}
        </Script>
      </body>
    </html>
  );
}
