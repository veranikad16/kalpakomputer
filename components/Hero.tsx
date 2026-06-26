"use client";
import { RiComputerLine, RiToolsLine, RiWifiLine } from "@remixicon/react";

const services = [
  { icon: RiComputerLine, label: "Penjualan Perangkat IT", sub: "Produk IT Berkualitas" },
  { icon: RiToolsLine, label: "Servis Laptop & PC", sub: "Perbaikan Cepat & Andal" },
  { icon: RiWifiLine, label: "Instalasi Jaringan & WiFi", sub: "Jaringan Stabil & Aman" },
];

export function Hero() {
  return (
    <section id="beranda" className="relative mt-[72px] md:mt-[107px]">
      <div className="relative w-full overflow-hidden" style={{ height: "calc(100vh - 107px)" }}>
        {/* Background */}
        <img
          src="/hero.png"
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />

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

        {/* Service Bar — absolute bottom, full inside hero */}
        <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center px-4 pb-6">
          <div className="bg-[#01341b] rounded-[20px] shadow-[0px_4px_40px_rgba(0,0,0,0.3)] px-8 py-5 w-full max-w-[1042px]">
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