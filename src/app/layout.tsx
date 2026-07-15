import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Bebas_Neue, Playfair_Display, Inter, Lilita_One } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { MainContentWrapper } from "@/components/layout/MainContentWrapper";
import { WhatsAppFloatButton } from "@/components/layout/WhatsAppFloatButton";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { LazyClientWidgets } from "@/components/layout/LazyClientWidgets";
import { CartRehydrate } from "@/components/providers/CartRehydrate";
import { AuthRehydrate } from "@/components/providers/AuthRehydrate";
import { KitchenStatusBanner } from "@/components/layout/KitchenStatusBanner";
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
  creator: "Bhook Lagi?",
  publisher: "Bhook Lagi?",
  applicationName: "Bhook Lagi?",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Bhook Lagi?",
    title: "Bhook Lagi? | Best Food Delivery in Deoghar, Jharkhand",
    description:
      "Order Deoghar's best burgers, rolls, Chinese & pasta online. Fast delivery anywhere in Deoghar!",
    url: "https://www.bhooklagi.in",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bhook Lagi? food delivery in Deoghar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@bhooklagi",
    title: "Bhook Lagi? | Food Delivery Deoghar",
    description: "Order food online in Deoghar — fast delivery & big flavours.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/favicon_io/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/favicon_io/site.webmanifest",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Bhook Lagi?",
  "image": "https://www.bhooklagi.in/og-image.png",
  "logo": "https://www.bhooklagi.in/favicon_io/android-chrome-512x512.png",
  "@id": "https://www.bhooklagi.in",
  "url": "https://www.bhooklagi.in",
  "telephone": "+919296834048",
  "priceRange": "₹",
  "menu": "https://www.bhooklagi.in/menu",
  "servesCuisine": ["Fast Food", "Chinese", "Indian", "Burgers", "Rolls", "Pasta"],
  "acceptsReservations": false,
  "hasDelivery": true,
  "areaServed": {
    "@type": "City",
    "name": "Deoghar"
  },
  "openingHoursSpecification": [{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "opens": "10:00",
    "closes": "23:00"
  }],
  "potentialAction": {
    "@type": "OrderAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.bhooklagi.in/menu",
      "inLanguage": "en-IN",
      "actionPlatform": [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform"
      ]
    },
    "deliveryMethod": "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet"
  },
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
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://bhooklagi.b-cdn.net" />
        <link rel="dns-prefetch" href="https://bhooklagi.b-cdn.net" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google Tag Manager */}
        <Script id="gtm-head" strategy="lazyOnload">
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
        <KitchenStatusBanner />
        <MainContentWrapper>{children}</MainContentWrapper>
        <BottomNav />
        <WhatsAppFloatButton />
        <LazyClientWidgets />
        <Script src={MSG91_SCRIPT_SRC} strategy="lazyOnload" />

        {/* Google Analytics (via GTM — kept for direct GA4 events too) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8N9WY0WXSH"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
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
