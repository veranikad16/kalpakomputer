"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PopupDetailProduk } from "@/components/PopupDetailProduk";
import { RiSearchLine } from "@remixicon/react";
import { supabase } from "@/lib/supabase";

const heroImgUrl = "/hero.webp";

interface Produk {
  id: string;
  nama: string;
  harga: string;
  kategori: string;
  deskripsi: string | null;
  gambar_urls: string[] | null;
  spesifikasi: Record<string, string> | null;
  tampil_di_homepage: boolean;
}

export default function ProdukPage() {
  const [selectedProduk, setSelectedProduk] = useState<Produk | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("produk")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching products:", error);
        } else {
          setProducts(data || []);
        }
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter((product) =>
    product.nama?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <div className="relative w-full h-[353px] mt-[107px]">
        <img src={heroImgUrl} alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4">
          <p className="font-semibold text-[16px]">
            <span className="text-[#929292]">BERANDA</span>
            <span className="text-white"> / PRODUK</span>
          </p>
          <h1 className="font-black text-[48px] text-white">Produk</h1>
        </div>
      </div>

      {/* Products Section */}
      <section className="bg-white w-full py-16">
        <div className="max-w-[1440px] mx-auto px-[114px]">
          <div className="flex items-start justify-between mb-[50px]">
            <div>
              <h2 className="font-bold text-[30px] text-black">Semua Produk</h2>
              <p className="font-medium text-[16px] text-[#929292] mt-2">Produk IT unggulan dan bergaransi</p>
            </div>
            <div className="relative border border-[#929292] rounded-[10px] h-[51px] w-[376px] flex items-center px-4">
              <input
                type="text"
                placeholder="Cari"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 font-medium text-[15px] text-black bg-transparent outline-none placeholder:text-[#929292]"
              />
              <RiSearchLine className="shrink-0 size-6 text-[#929292]" />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16"><p className="text-[#929292]">Memuat produk...</p></div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16"><p className="text-[#929292]">Produk tidak ditemukan</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-[34px] gap-y-[60px] auto-rows-fr">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-4 w-full h-full cursor-pointer"
                  onClick={() => setSelectedProduk(product)}
                >
                  <div className="bg-[#f2f2f2] h-[350px] rounded-[15px] w-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    {product.gambar_urls?.[0] ? (
                      <img src={product.gambar_urls[0]} alt={product.nama} className="w-full h-full object-cover" />
                    ) : (
                      <p className="text-[#929292]">Gambar Produk</p>
                    )}
                  </div>

                  {/* Wrapper ini yang membuat tombol selalu rata di bawah */}
                  <div className="flex flex-col flex-1">
                    <p className="font-semibold text-[18px] text-black line-clamp-2 min-h-[50px]">
                      {product.nama}
                    </p>
                    <p className="font-semibold text-[14px] text-[#929292] mt-2">{product.harga}</p>
                    <p className="font-semibold text-[12px] text-[#929292] mt-2">{product.kategori}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedProduk(product); }}
                      className="rounded-[10px] h-[51px] px-4 font-semibold text-[14px] w-[127px] bg-[#f2f2f2] text-black hover:bg-[#01341b] hover:text-white transition-colors mt-auto"
                    >
                      Detail Produk
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <PopupDetailProduk produk={selectedProduk} onClose={() => setSelectedProduk(null)} />
    </main>
  );
}