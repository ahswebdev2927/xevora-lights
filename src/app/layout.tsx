import type { Metadata } from "next";
import "@fontsource/inter";
import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";

import Script from "next/script";

export const metadata: Metadata = {
  title: "Xevora Lights | Precision Tactical & Creator Illumination",
  description: "Next-generation tactical and creator spotlight systems. Featuring quad-source 'white-laser' emitters, 4-in-1 color modes, telescopic optical zoom, and swappable 10,000 mAh battery power.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="antialiased"
    >
      <body className="min-h-screen bg-[#090a0f] text-slate-100 font-inter flex flex-col">
        <Script
          id="xevora-landing-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var n=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];var r=n&&n.type==='reload';var s=sessionStorage.getItem('xevora_landing_seen')==='true';if(s||r){document.documentElement.classList.add('landing-dismissed');}}catch(e){}})();`,
          }}
        />
        <AnnouncementBar />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
