"use client";

import { RiWhatsappFill, RiMailFill, RiMapPinLine } from "@remixicon/react";

export function KontakKami() {

  const contactInfo = [
    {
      icon: RiMapPinLine,
      title: "Lokasi",
      detail: "Jalan I Gusti Ngurah Rai no. 59, Mengwi, Badung, Bali",
    },
    {
      icon: RiWhatsappFill,
      title: "WhatsApp",
      detail: "+62 817-4745-137",
    },
    {
      icon: RiMailFill,
      title: "Email",
      detail: "kalpakomputerbali@gmail.com",
    },
  ];

  return (
    <section id="kontak" className="bg-white py-14 md:py-20">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        {/* Title */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-black text-[28px] md:text-[36px] text-black mb-5">Kontak Kami</h2>
          <p className="text-[#929292] font-medium text-[14px] md:text-[15px] max-w-[877px] mx-auto leading-relaxed">
            Ada pertanyaan atau mau booking teknisi? Langsung hubungi kami, kami siap bantu!
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="bg-[#f2f2f2] rounded-[20px] px-8 md:px-12 py-8 mb-12 md:mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-4">
            {contactInfo.map((c, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="shrink-0 mt-1">
                  <c.icon className="size-10 text-[#01341b]" />
                </div>
                <div>
                  <p className="font-bold text-[17px] md:text-[18px] text-black mb-2">{c.title}</p>
                  <p className="text-[#929292] font-medium text-[14px] md:text-[15px] leading-relaxed max-w-[238px]">{c.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map + Ulasan */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-[44px] items-start">
          {/* Map */}
          <div className="w-full lg:w-[564px] h-[400px] rounded-[20px] overflow-hidden shrink-0">
            <iframe
              title="Lokasi PT. KALPA KOMPUTER BALI"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src="https://www.openstreetmap.org/export/embed.html?bbox=115.1396%2C-8.5574%2C115.1796%2C-8.5174&layer=mapnik&marker=-8.5374%2C115.1596"
            />
          </div>

          {/* Google Reviews */}
          <div className="flex-1">
            <h3 className="font-bold text-[26px] md:text-[30px] text-black mb-3">Ulasan Pelanggan</h3>
            <p className="text-[#929292] font-medium text-[14px] md:text-[16px] mb-8 leading-relaxed max-w-[600px]">
              Apa kata pelanggan kami tentang layanan PT. Kalpa Komputer Bali
            </p>
            <div dangerouslySetInnerHTML={{__html: `<div class='trustindex-widget' data-widget-id='aef63b3767961676779661affc6'></div><script defer async src='https://cdn.trustindex.io/loader.js?aef63b3767961676779661affc6'></script>`}} />
          </div>
        </div>
      </div>
    </section>
  );
}