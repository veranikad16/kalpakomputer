"use client";

import { RiMapPinLine, RiCalendarLine } from "@remixicon/react";

const teknisiImgUrl = "https://www.figma.com/api/mcp/asset/359816a5-8535-4276-8a3f-6e7784d0a0ca";

interface TeknisiOnSiteProps {
  onPopupOpen: () => void;
}

export function TeknisiOnSite({ onPopupOpen }: TeknisiOnSiteProps) {
  return (
    <section id="booking" className="bg-white py-14 md:py-20">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-[41px]">
          {/* Content */}
          <div className="flex-1 order-2 lg:order-1">
            <h2 className="font-black text-[28px] md:text-[36px] text-black mb-6">Tracking Status Servis On-Site</h2>
            <p className="text-[#929292] font-medium text-[14px] md:text-[15px] leading-relaxed max-w-[598px]">
              Pantau perkembangan servis on-site Anda secara real-time. Dapatkan informasi terbaru mulai dari proses pengerjaan hingga selesai langsung melalui sistem kami.
            </p>

            {/* Features */}
            <div className="flex flex-col sm:flex-row gap-8 mt-10 md:mt-14">
              <div className="flex flex-col gap-3 max-w-[260px]">
                <div className="relative size-[50px]">
                  <div className="absolute inset-0 bg-[#f2f2f2] rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <RiMapPinLine className="size-6 text-black" />
                  </div>
                </div>
                <p className="font-semibold text-[15px] md:text-[16px] text-black mt-2">Status Real-Time</p>
                <p className="text-[#929292] font-medium text-[14px] md:text-[15px] leading-relaxed">Pantau perkembangan servis on-site Anda secara langsung dengan update status terbaru dari sistem.</p>
              </div>
              <div className="flex flex-col gap-3 max-w-[260px]">
                <div className="relative size-[50px]">
                  <div className="absolute inset-0 bg-[#f2f2f2] rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <RiCalendarLine className="size-6 text-black" />
                  </div>
                </div>
                <p className="font-semibold text-[15px] md:text-[16px] text-black mt-2">Teknisi Profesional</p>
                <p className="text-[#929292] font-medium text-[14px] md:text-[15px] leading-relaxed">Servis ditangani oleh teknisi berpengalaman untuk memastikan perbaikan berjalan dengan optimal.</p>
              </div>
            </div>

            <button
              onClick={onPopupOpen}
              className="mt-10 bg-[#f2f2f2] hover:bg-[#e0e0e0] text-black font-semibold text-[13px] md:text-[14px] rounded-[10px] px-5 py-3 transition-colors"
            >
              Tracking Status
            </button>
          </div>

          {/* Image */}
          <div className="w-full lg:w-[542px] h-[320px] md:h-[420px] lg:h-[508px] rounded-[20px] overflow-hidden shrink-0 order-1 lg:order-2">
            <img
              src="/teknisi.JPG"
              alt="Booking Teknisi On-Site"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
