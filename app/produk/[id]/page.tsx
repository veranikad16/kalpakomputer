"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { RiWhatsappLine } from "@remixicon/react";

const WA_NUMBER = "6285785097067"; 

interface Produk {
  id: string;
  nama: string;
  harga: string;
  kategori: string;
  deskripsi: string | null;
  gambar_urls: string[] | null;
}

export default function DetailProdukPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Produk | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("produk")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) setProduct(data);
      setLoading(false);
    };
    if (id) fetchProduct();
  }, [id]);

  const handleTanya = () => {
    if (!product) return;
    const pesan = `Halo, saya ingin tanya produk *${product.nama}* (${product.harga}). Apakah masih tersedia?`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(pesan)}`, "_blank");
  };

  if (loading) return (
    <main className="min-h-screen bg-white"><Header />
      <div className="flex items-center justify-center h-[60vh]"><p className="text-[#929292]">Memuat produk...</p></div>
    <Footer /></main>
  );

  if (!product) return (
    <main className="min-h-screen bg-white"><Header />
      <div className="flex items-center justify-center h-[60vh]"><p className="text-[#929292]">Produk tidak ditemukan</p></div>
    <Footer /></main>
  );

  const images = product.gambar_urls ?? [];

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-[1200px] mx-auto px-6 md:px-16 pt-[140px] pb-20">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Gambar */}
          <div className="flex flex-col gap-3 w-full md:w-[480px]">
            <div className="bg-[#f2f2f2] rounded-[15px] h-[400px] overflow-hidden flex items-center justify-center border-2 border-[#01341b]">
              {images[activeImg] ? (
                <img src={images[activeImg]} alt={product.nama} className="w-full h-full object-cover" />
              ) : (
                <p className="text-[#929292]">Tidak ada gambar</p>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImg === i ? "border-[#01341b]" : "border-transparent"}`}
                  >
                    <img src={url} alt={`foto ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4 flex-1">
            <h1 className="font-bold text-[24px] md:text-[28px] text-black">{product.nama}</h1>
            <p className="font-bold text-[22px] text-[#01341b]">{product.harga}</p>
            <span className="inline-block bg-[#f2f2f2] text-[#929292] text-xs font-semibold px-3 py-1 rounded-full w-fit">
              {product.kategori}
            </span>
            {product.deskripsi && (
              <div className="mt-2">
                <p className="font-semibold text-[15px] text-black mb-2">Deskripsi Produk</p>
                <p className="text-[14px] text-[#555] leading-relaxed whitespace-pre-line">{product.deskripsi}</p>
              </div>
            )}
            <button
              onClick={handleTanya}
              className="mt-4 flex items-center gap-2 rounded-[10px] h-[51px] px-8 font-semibold text-[15px] w-fit bg-[#25D366] text-white hover:bg-[#1ebe5d] transition-colors"
            >
              <RiWhatsappLine className="w-5 h-5" />
              Tanya Produk via WhatsApp
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}