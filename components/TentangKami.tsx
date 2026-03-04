"use client";

import { useState } from "react";

const tentangKamiImgUrl = "https://www.figma.com/api/mcp/asset/324c83f8-ad2e-4ec1-967a-cb5e8eca7e01";

const features = [
  {
    title: "Memberikan Layanan Profesional",
    desc: "Menjadi penyedia layanan teknologi terpercaya yang menghadirkan solusi IT berkualitas, cepat, dan profesional bagi masyarakat dan dunia usaha",
  },
  {
    title: "Mengutamakan Kepuasan Pelanggan",
    desc: "Menghadirkan pelayanan yang responsif, komunikatif, dan transparan demi membangun kepercayaan jangka panjang",
  },
  {
    title: "Mengikuti Perkembangan Teknologi",
    desc: "Terus meningkatkan kemampuan teknisi dan layanan agar selalu relevan dengan perkembangan teknologi terkini",
  },
];

export function TentangKami() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  return (
    <section id="tentang-kami" className="bg-white py-16 md:py-20">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        {/* Title */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-black text-3xl md:text-[36px] text-black mb-5">Tentang Kami</h2>
          <p className="text-[#929292] font-medium text-[14px] md:text-[15px] max-w-[877px] mx-auto leading-relaxed">
            PT. KALPA KOMPUTER BALI adalah perusahaan layanan teknologi yang berfokus pada servis perangkat komputer dan instalasi jaringan untuk kebutuhan rumah, UMKM, hingga perkantoran. Dengan teknisi berpengalaman dan pelayanan yang responsif, kami berkomitmen memberikan solusi yang andal, efisien, dan berkelanjutan sesuai kebutuhan pelanggan
          </p>
        </div>

        {/* Main Image */}
        <div className="rounded-[20px] overflow-hidden mb-10 md:mb-14">
          <img
            src={tentangKamiImgUrl}
            alt="Tentang Kami"
            className="w-full h-[300px] md:h-[420px] lg:h-[542px] object-cover"
          />
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-[34px]">
          {features.map((f, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`rounded-[15px] p-10 md:p-11 min-h-[231px] cursor-pointer transition-colors ${
                hoveredIndex === i ? "bg-[#01341b]" : "bg-[#f2f2f2]"
              }`}
            >
              <h3 className={`font-bold text-[17px] mb-5 leading-snug ${
                hoveredIndex === i ? "text-white" : "text-black"
              }`}>
                {f.title}
              </h3>
              <p className={`font-medium text-[14px] md:text-[15px] leading-relaxed ${
                hoveredIndex === i ? "text-white/80" : "text-[#929292]"
              }`}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
