"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Produk {
  id: string;
  nama: string;
  harga: string;
  kategori: string;
  deskripsi: string | null;
  gambar_url: string | null;
  tampil_di_homepage: boolean;
}

export function ProdukUnggulan() {
  const [products, setProducts] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .eq("tampil_di_homepage", true)
      .limit(6);

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  return (
    <section id="produk" className="bg-white py-14 md:py-20">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-8 md:mb-10">
          <div>
            <h2 className="font-bold text-[26px] md:text-[30px] text-black">Produk Unggulan</h2>
            <p className="text-[#929292] font-medium text-sm md:text-[16px] mt-2">Produk IT unggulan dan bergaransi</p>
          </div>
          <Link href="/produk">
            <button className="bg-[#f2f2f2] hover:bg-[#e0e0e0] text-black font-medium text-[14px] md:text-[15px] rounded-[10px] px-5 py-3 transition-colors whitespace-nowrap">
              Lihat Semua
            </button>
          </Link>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-[#929292]">Memuat produk...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#929292]">Belum ada produk</p>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-[34px]">
            {products.map((product) => (
              <div key={product.id} className="flex flex-col gap-4">
                <div className="bg-[#f2f2f2] rounded-[15px] h-[280px] md:h-[350px] overflow-hidden flex items-center justify-center">
                  {product.gambar_url ? (
                    <img
                      src={product.gambar_url}
                      alt={product.nama}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <p className="text-[#929292]">Gambar Produk</p>
                  )}
                </div>
                <p className="font-semibold text-[17px] md:text-[18px] text-black">{product.nama}</p>
                <p className="font-semibold text-[13px] md:text-[14px] text-[#929292]">{product.harga}</p>
                <p className="font-semibold text-[11px] md:text-[12px] text-[#929292] tracking-wider">{product.kategori}</p>
                <button
                  className="rounded-[10px] px-4 py-3 font-semibold text-[13px] md:text-[14px] w-fit transition-colors bg-[#f2f2f2] text-black hover:bg-[#01341b] hover:text-white"
                >
                  Tanya Produk
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
