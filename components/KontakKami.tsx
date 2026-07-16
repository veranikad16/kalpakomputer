"use client";

import { RiWhatsappFill, RiMailFill, RiMapPinLine, RiStarFill, RiGoogleFill } from "@remixicon/react";

const reviews = [
  {
    name: "029_Ni Kadek Ayu Intan Sita Dewi",
    date: "5 hari lalu",
    rating: 5,
    text: "Laptopku microphone nya mati, terus cek disini dan ga ada biaya pengecekann, ketemu masalah dimana langsung di servis dehh dan selesai nya cepitt!",
    initial: "N",
    color: "bg-pink-500",
  },
  {
    name: "Komang Fernando Surya Irawan",
    date: "Seminggu lalu",
    rating: 5,
    text: "Saya pernah service layar laptop di sini, proses nya sangat cepat, teknisi nya sangat ramah, dan biayanya sangat terjangkau.",
    initial: "K",
    color: "bg-blue-500",
  },
  {
    name: "Denny Supandi",
    date: "3 bulan lalu",
    rating: 5,
    text: "Tempat servis komputer yang joss. Terima servis komputer, laptop, printer, sampai pasang wifi.",
    initial: "D",
    color: "bg-orange-500",
  },
];

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
          <div className="w-full lg:w-[564px] h-[400px] lg:h-full rounded-[20px] overflow-hidden shrink-0">
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

          {/* Ulasan Pelanggan */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-[26px] md:text-[30px] text-black">Ulasan Pelanggan</h3>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <RiStarFill key={i} className="w-5 h-5 text-yellow-400" />
                ))}
              </div>
              <span className="text-[#929292] text-sm font-medium">5.0 · Berdasarkan ulasan Google</span>
            </div>

            <div className="flex flex-col gap-4">
              {reviews.map((r, i) => (
                <div key={i} className="bg-[#f9f9f9] rounded-[16px] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`${r.color} w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                        {r.initial}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-black">{r.name}</p>
                        <p className="text-[#929292] text-xs">{r.date}</p>
                      </div>
                    </div>
                    <RiGoogleFill className="w-5 h-5 text-[#4285F4]" />
                  </div>
                  <div className="flex mb-2">
                    {[...Array(r.rating)].map((_, j) => (
                      <RiStarFill key={j} className="w-4 h-4 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-[#555] text-sm leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>

            <a
              href="https://maps.google.com/?q=Kalpa+Komputer+Bali"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-sm text-[#01341b] font-medium hover:underline"
            >
              Lihat semua ulasan di Google →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}