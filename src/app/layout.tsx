import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { CartRehydrate } from "@/components/providers/CartRehydrate";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
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
    default: "Bhook Lagi? | Order Food in Deoghar",
    template: "%s | Bhook Lagi?",
  },
  description:
    "Deoghar's craving kitchen — burgers, rolls, maggi, Chinese, pasta, fries & more. Order online with launch offers.",
  keywords: [
    "Bhook Lagi",
    "food delivery Deoghar",
    "cloud kitchen Deoghar",
    "order food online Deoghar",
  ],
  authors: [{ name: "Bhook Lagi?" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Bhook Lagi?",
    title: "Bhook Lagi? Hum Hai Na! | Deoghar",
    description:
      "Order burgers, rolls, maggi, Chinese, pasta & more in Deoghar.",
    url: "https://www.bhooklagi.in",
  },
  twitter: {
    card: "summary_large_image",
    site: "@bhooklagi",
    title: "Bhook Lagi? | Deoghar",
    description: "Order food online — fast delivery & big flavours.",
  },
  icons: {
    icon: "/favicon_io/favicon-32x32.png",
    shortcut: "/favicon_io/favicon.ico",
    apple: "/favicon_io/apple-touch-icon.png",
  },
  manifest: "/favicon_io/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#E85D04",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className="scroll-smooth">
      <body
        className={`${inter.className} ${bebas.variable} ${playfair.variable} min-h-dvh bg-gray-50 text-ink antialiased`}
      >
        <CartRehydrate />
        <ScrollProgress />
        <div className="pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-8">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
