"use client";

import { RiToolsLine, RiTimeLine } from "@remixicon/react";

const servisImgUrl = "https://www.figma.com/api/mcp/asset/e93d6dc0-7d3e-4ec7-9a19-194b582d08c0";

interface ServisProps {
  onPopupOpen: () => void;
}

export function Servis({ onPopupOpen }: ServisProps) {
  return (
    <section id="servis" className="bg-white py-14 md:py-20">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-[63px]">
          {/* Image */}
          <div className="w-full lg:w-[542px] h-[320px] md:h-[420px] lg:h-[508px] rounded-[20px] overflow-hidden shrink-0">
            <img
              src={servisImgUrl}
              alt="Layanan Servis"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h2 className="font-black text-[28px] md:text-[36px] text-black mb-6">Layanan Servis Perangkat</h2>
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
                <p className="font-semibold text-[15px] md:text-[16px] text-black mt-2">Servis Profesional</p>
                <p className="text-[#929292] font-medium text-[14px] md:text-[15px] leading-relaxed">Perbaikan laptop dan PC oleh teknisi profesional.</p>
              </div>
              <div className="flex flex-col gap-3 max-w-[260px]">
                <div className="relative size-[50px]">
                  <div className="absolute inset-0 bg-[#f2f2f2] rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <RiTimeLine className="size-5 text-black" />
                  </div>
                </div>
                <p className="font-semibold text-[15px] md:text-[16px] text-black mt-2">Pantau Proses Servis</p>
                <p className="text-[#929292] font-medium text-[14px] md:text-[15px] leading-relaxed">Informasi progres servis perangkat dikirim melalui email</p>
              </div>
            </div>

            <button
              onClick={onPopupOpen}
              className="mt-10 bg-[#f2f2f2] hover:bg-[#e0e0e0] text-black font-semibold text-[13px] md:text-[14px] rounded-[10px] px-5 py-3 transition-colors"
            >
              Ajukan Servis
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
