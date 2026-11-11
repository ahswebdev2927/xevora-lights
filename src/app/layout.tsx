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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{function c(e){if(e&&e.removeAttribute){if(e.hasAttribute('bis_skin_checked'))e.removeAttribute('bis_skin_checked');if(e.hasAttribute('bis_register'))e.removeAttribute('bis_register');}}var o=new MutationObserver(function(m){for(var i=0;i<m.length;i++){var t=m[i];if(t.type==='attributes'){if(t.attributeName==='bis_skin_checked'||t.attributeName==='bis_register')t.target.removeAttribute(t.attributeName);}else if(t.addedNodes){for(var j=0;j<t.addedNodes.length;j++){var n=t.addedNodes[j];if(n.nodeType===1){c(n);var s=n.querySelectorAll?n.querySelectorAll('[bis_skin_checked],[bis_register]'):[];for(var k=0;k<s.length;k++)c(s[k]);}}}}});o.observe(document.documentElement,{attributes:true,attributeFilter:['bis_skin_checked','bis_register'],childList:true,subtree:true});}catch(e){}})();`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#090a0f] text-slate-100 font-inter flex flex-col"
      >
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
