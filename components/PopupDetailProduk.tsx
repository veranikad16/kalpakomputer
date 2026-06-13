"use client";
import { useState } from "react";
import { RiCloseLine, RiWhatsappLine, RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";

interface Produk {
  id: string;
  nama: string;
  harga: string;
  kategori: string;
  deskripsi: string | null;
  gambar_urls?: string[] | null;
  spesifikasi?: Record<string, string> | null;
}

interface PopupDetailProdukProps {
  produk: Produk | null;
  onClose: () => void;
}

const WA_NUMBER = "6285785097067"; 

export function PopupDetailProduk({ produk, onClose }: PopupDetailProdukProps) {
  const [activeImg, setActiveImg] = useState(0);

  if (!produk) return null;

  const images = produk.gambar_urls ?? [];

  const handleTanya = () => {
    const pesan = `Halo, saya ingin tanya produk *${produk.nama}* (${produk.harga}). Apakah masih tersedia?`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(pesan)}`, "_blank");
  };

  const prevImg = () => setActiveImg((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImg = () => setActiveImg((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
        >
          <RiCloseLine className="w-6 h-6 text-gray-500" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Kolom Kiri - Gambar */}
          <div className="w-full md:w-[320px] flex-shrink-0 flex flex-col gap-2 p-4">
            {/* Main Image */}
            <div className="relative bg-[#f2f2f2] rounded-xl h-[260px] flex items-center justify-center overflow-hidden">
              {images[activeImg] ? (
                <img src={images[activeImg]} alt={produk.nama} className="w-full h-full object-cover" />
              ) : (
                <p className="text-[#929292] text-sm">Gambar Produk</p>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-2 bg-white/80 hover:bg-white rounded-full p-1 shadow transition">
                    <RiArrowLeftSLine className="w-5 h-5 text-gray-700" />
                  </button>
                  <button onClick={nextImg} className="absolute right-2 bg-white/80 hover:bg-white rounded-full p-1 shadow transition">
                    <RiArrowRightSLine className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImg === i ? "border-[#01341b]" : "border-transparent"
                    }`}
                  >
                    <img src={url} alt={`foto ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Kolom Kanan - Detail */}
          <div className="flex flex-col gap-3 p-6 flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#929292] tracking-wider uppercase">{produk.kategori}</p>
            <h2 className="text-xl font-bold text-black">{produk.nama}</h2>
            <p className="text-[#01341b] font-bold text-xl">{produk.harga}</p>

            {/* Deskripsi */}
            {produk.deskripsi && (
              <p className="text-gray-600 text-sm leading-relaxed">{produk.deskripsi}</p>
            )}

            {/* Spesifikasi */}
            {produk.spesifikasi && Object.keys(produk.spesifikasi).length > 0 && (
              <div className="mt-1">
                <p className="font-semibold text-[14px] text-black mb-2">Spesifikasi</p>
                <div className="rounded-xl overflow-hidden border border-gray-100">
                  {Object.entries(produk.spesifikasi).map(([key, value], i) => (
                    <div key={key} className={`flex text-sm px-4 py-2 ${i % 2 === 0 ? "bg-white" : "bg-[#f9f9f9]"}`}>
                      <span className="font-semibold text-gray-700 w-[130px] shrink-0">{key}</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tombol WA */}
            <div className="mt-auto pt-4">
              <button
                onClick={handleTanya}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold text-[15px] rounded-[10px] px-5 py-3 transition-colors"
              >
                <RiWhatsappLine className="w-5 h-5" />
                Tanya Sekarang via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}