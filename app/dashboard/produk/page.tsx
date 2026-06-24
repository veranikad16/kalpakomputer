"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { RiSearchLine } from "@remixicon/react";

interface Produk {
  id: string;
  nama: string;
  harga: string;
  kategori: string;
  deskripsi: string | null;
  gambar_urls: string[];
}

export default function ProdukDashboardPage() {
  const [products, setProducts] = useState<Produk[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setProducts((data as Produk[]) || []);
    }

    setLoading(false);
  };


 // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  fetchProducts();
}, []);

  const filtered = products.filter((p) =>
    p.nama?.toLowerCase().includes(search.toLowerCase()) ||
    p.kategori?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Produk</h1>

      <div className="mb-6 flex items-center border rounded-lg px-4 h-[45px] w-[300px]">
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 outline-none text-sm"
        />
        <RiSearchLine />
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">Produk tidak ditemukan</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((product) => {
            const images = product.gambar_urls || [];

            return (
              <div
                key={product.id}
                className="border rounded-lg p-4 shadow-sm"
              >
                <div className="h-[200px] bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-3">
                  {images[0] ? (
                    <img
                      src={images[0]}
                      alt={product.nama}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <p className="text-gray-400 text-sm">No Image</p>
                  )}
                </div>

                <h2 className="font-semibold text-lg">{product.nama}</h2>
                <p className="text-green-700 font-bold">{product.harga}</p>
                <p className="text-gray-500 text-sm">{product.kategori}</p>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}