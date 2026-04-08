"use client";

import { RiComputerLine, RiToolsLine, RiWifiLine } from "@remixicon/react";

const heroBgUrl = "https://www.figma.com/api/mcp/asset/bd02b340-a3e2-4971-961e-52b369c0a58e";

const services = [
  { icon: RiComputerLine, label: "Penjualan Perangkat IT", sub: "Produk IT Berkualitas" },
  { icon: RiToolsLine, label: "Servis Laptop & PC", sub: "Perbaikan Cepat & Andal" },
  { icon: RiWifiLine, label: "Instalasi Jaringan & WiFi", sub: "Jaringan Stabil & Aman" },
];

export function Hero() {
  return (
    <section id="beranda" className="relative mt-[72px] md:mt-[107px]">
      <div className="relative h-[480px] md:h-[620px] lg:h-[680px] w-full overflow-hidden">
        {/* Hero Background */}
        <img
          src="/hero.png"
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-16 pt-14 md:pt-20 lg:pt-28">
          <p className="text-[#929292] font-medium text-base md:text-lg mb-2">Selamat Datang</p>
          <h1 className="text-white font-extrabold text-2xl md:text-3xl lg:text-[32px] mb-4 whitespace-nowrap">
            PT. KALPA KOMPUTER BALI
          </h1>
          <p className="text-white font-medium text-sm md:text-[15px] max-w-[480px] leading-relaxed">
            Solusi terpercaya untuk servis komputer & laptop serta pembelian perangkat IT di Bali yang cepat, profesional, dan bergaransi.
          </p>
        </div>

        {/* Service Highlights Bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[1042px]">
          <div
            className="bg-[#01341b]/80 backdrop-blur-md rounded-[20px] shadow-[0px_4px_100px_10px_rgba(0,0,0,0.25)] px-8 py-5"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-around gap-6 sm:gap-4">
              {services.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 shrink-0">
                    <item.icon className="size-6 md:size-8 text-white" />
                  </div>
                  <div>
                    <p className="text-[#929292] font-semibold text-[11px]">{item.sub}</p>
                    <p className="text-white font-semibold text-[14px] md:text-[16px]">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
