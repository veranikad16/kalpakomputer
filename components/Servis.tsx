"use client";

import { RiToolsLine, RiMapPinLine } from "@remixicon/react";

interface ServisProps {
  onWorkshopOpen: () => void;  // 👈 ganti
  onOnsiteOpen: () => void;    // 👈 tambah
}

export function Servis({ onWorkshopOpen, onOnsiteOpen }: ServisProps) {
  return (
    <section id="servis" className="bg-white py-14 md:py-20">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-[63px]">
          {/* Image */}
          <div className="w-full lg:w-[542px] h-[320px] md:h-[420px] lg:h-[508px] rounded-[20px] overflow-hidden shrink-0">
            <img
              src="/servis.jpg"
              alt="Layanan Servis"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h2 className="font-black text-[28px] md:text-[36px] text-black mb-6">Layanan Servis</h2>
            <p className="text-[#929292] font-medium text-[14px] md:text-[15px] leading-relaxed max-w-[598px]">
              Layanan servis perangkat kami mencakup perbaikan laptop, PC, dan perangkat IT lainnya dengan proses pengecekan menyeluruh, pengerjaan yang rapi, serta ditangani oleh teknisi berpengalaman untuk hasil yang aman dan terpercaya.
            </p>

            {/* Features */}
            <div className="flex flex-col sm:flex-row gap-8 mt-10 md:mt-14">
              <div className="flex flex-col gap-3 max-w-[260px]">
                <div className="relative size-[50px]">
                  <div className="absolute inset-0 bg-[#f2f2f2] rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <RiToolsLine className="size-6 text-black" />
                  </div>
                </div>
                <p className="font-semibold text-[15px] md:text-[16px] text-black mt-2">Servis Workshop</p>
                <p className="text-[#929292] font-medium text-[14px] md:text-[15px] leading-relaxed">Perbaikan laptop dan PC dengan membawa perangkat ke kantor untuk penanganan lebih lanjut oleh teknisi.</p>

                <button
                  onClick={onWorkshopOpen} 
                  className="mt-10 bg-[#f2f2f2] hover:bg-[#e0e0e0] text-black font-semibold text-[13px] md:text-[14px] rounded-[10px] px-5 py-3 transition-colors">
                  Ajukan Servis Workshop
                </button>
              </div>
              <div className="flex flex-col gap-3 max-w-[260px]">
                <div className="relative size-[50px]">
                  <div className="absolute inset-0 bg-[#f2f2f2] rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <RiMapPinLine className="size-5 text-black" />
                  </div>
                </div>
                <p className="font-semibold text-[15px] md:text-[16px] text-black mt-2">Servis On-Site</p>
                <p className="text-[#929292] font-medium text-[14px] md:text-[15px] leading-relaxed">Perbaikan laptop dan PC langsung di lokasi pelanggan oleh teknisi profesional.</p>

                <button
                  onClick={onOnsiteOpen}
                  className="mt-10 bg-[#f2f2f2] hover:bg-[#e0e0e0] text-black font-semibold text-[13px] md:text-[14px] rounded-[10px] px-5 py-3 transition-colors">
                  Ajukan Servis On-Site
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}