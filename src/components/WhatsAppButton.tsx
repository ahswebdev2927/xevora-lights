"use client";

import { usePathname } from "next/navigation";

export default function WhatsAppButton() {
  const pathname = usePathname();

  // Hide on Admin portal pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <a
      href="https://wa.me/919848357279"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-5 sm:bottom-8 sm:right-8 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20BA56] text-white rounded-full shadow-[0_8px_25px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer shrink-0"
      aria-label="Chat on WhatsApp"
    >
      {/* Tooltip */}
      <span className="absolute right-full mr-3 bg-black/85 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg opacity-0 pointer-events-none transition-all duration-300 group-hover:opacity-100 whitespace-nowrap shadow-lg translate-x-2 group-hover:translate-x-0">
        Chat with us
      </span>

      {/* Clean Official WhatsApp Vector Icon */}
      <svg
        className="w-8 h-8 fill-white shrink-0"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18.403 5.633A8.919 8.919 0 0 0 12.053 3c-4.948 0-8.976 4.027-8.978 8.977 0 1.582.413 3.127 1.2 4.488L3 21l4.632-1.216a8.948 8.948 0 0 0 4.42 1.168h.004c4.947 0 8.976-4.027 8.978-8.977 0-2.398-.934-4.653-2.631-6.342zM12.057 19.382h-.003a7.466 7.466 0 0 1-3.805-1.042l-.272-.162-2.83.742.755-2.757-.177-.282a7.46 7.46 0 0 1-1.144-3.985c.002-4.123 3.356-7.477 7.48-7.477 1.996 0 3.873.778 5.283 2.188a7.447 7.447 0 0 1 2.187 5.285c-.002 4.124-3.356 7.477-7.474 7.477zm4.103-5.602c-.225-.113-1.332-.657-1.538-.732-.206-.075-.356-.113-.506.113-.15.225-.58.732-.711.882-.131.15-.262.169-.487.056-.225-.113-.949-.35-1.808-1.115-.668-.596-1.119-1.332-1.25-1.557-.131-.225-.014-.347.098-.459.102-.102.225-.262.338-.394.113-.131.15-.225.225-.375.075-.15.038-.281-.019-.394-.056-.113-.506-1.218-.693-1.668-.182-.439-.367-.379-.506-.386-.131-.007-.281-.007-.431-.007s-.394.056-.6.281c-.206.225-.788.769-.788 1.875s.806 2.175.919 2.325c.113.15 1.587 2.424 3.845 3.399.537.232.956.371 1.283.475.539.171 1.03.147 1.418.089.432-.065 1.332-.544 1.52-.1.069.188-.731.188-1.35.131-.15-.075-.263-.3-.375z"
        />
      </svg>
    </a>
  );
}
