import Link from "next/link";
import { RiWhatsappFill, RiMailFill } from "@remixicon/react";

const logoUrl = "https://www.figma.com/api/mcp/asset/6931dbe2-393a-41e2-a36d-d417db03b2c0";

export function Footer() {
  return (
    <footer className="bg-[#01341b] pt-14 pb-8">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logoUrl}
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
              <p className="text-white font-bold text-[18px] md:text-[20px]">PT. KALPA KOMPUTER BALI</p>
            </div>
            <p className="text-[#929292] font-medium text-[14px] md:text-[15px] leading-relaxed max-w-[326px] mb-6">
              Melayani sekolah, villa, kantor, dan lokasi lainnya. Pilih tanggal dan jam sesuai kebutuhan Anda
            </p>
            <div className="flex items-center gap-4">
              <a href="https://wa.me/628174745137" target="_blank" rel="noopener noreferrer"
                className="bg-white rounded-full size-10 flex items-center justify-center hover:bg-green-100 transition-colors">
                <RiWhatsappFill className="size-5 text-[#01341b]" />
              </a>
              <a href="mailto:kalpakomputerbali@gmail.com"
                className="bg-white rounded-full size-10 flex items-center justify-center hover:bg-green-100 transition-colors">
                <RiMailFill className="size-5 text-[#01341b]" />
              </a>
            </div>
          </div>

          {/* Kontak */}
          <div>
            <p className="text-white font-bold text-[14px] md:text-[15px] mb-6">Kontak Kami</p>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <RiWhatsappFill className="size-5 mt-0.5 shrink-0 text-white" />
                <p className="text-[#929292] font-medium text-[14px] md:text-[15px]">+62 817-4745-137</p>
              </div>
              <div className="flex items-start gap-3">
                <RiMailFill className="size-5 mt-0.5 shrink-0 text-white" />
                <p className="text-[#929292] font-medium text-[14px] md:text-[15px]">kalpakomputerbali@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Lokasi */}
          <div>
            <p className="text-white font-bold text-[14px] md:text-[15px] mb-6">Lokasi</p>
            <p className="text-[#929292] font-medium text-[14px] md:text-[15px] leading-relaxed max-w-[315px]">
              Jalan I Gusti Ngurah Rai no. 59, Mengwi, Badung, Bali
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#929292]/40 mt-12 pt-6">
          <p className="text-[#929292] font-medium text-[13px] md:text-[15px] text-center">
            Copyright © 2026 - PT. KALPA KOMPUTER BALI
          </p>
        </div>
      </div>
    </footer>
  );
}
