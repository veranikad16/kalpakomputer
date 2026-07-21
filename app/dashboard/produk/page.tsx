"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { RiSearchLine, RiAddLine, RiEdit2Line, RiDeleteBinLine, RiCloseLine, RiUpload2Line, RiLoader4Line } from "@remixicon/react";
import { toast } from "sonner";

interface Produk {
  id: string;
  nama: string;
  harga: string;
  kategori: string;
  deskripsi: string | null;
  gambar_urls: string[];
  spesifikasi: Record<string, string> | null;
  tampil_di_homepage: boolean;
}

const KATEGORI_OPTIONS = [
  "Laptop",
  "PC / Desktop",
  "Monitor",
  "Printer",
  "Aksesoris",
  "Komponen",
  "Jaringan",
  "Lainnya",
];

const emptyForm = {
  nama: "",
  harga: "",
  kategori: "",
  kategoriLainnya: "",
  deskripsi: "",
  tampil_di_homepage: false,
};

export default function ProdukDashboardPage() {
  const [products, setProducts] = useState<Produk[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produk | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Produk | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Gagal memuat produk");
      console.error(error);
    } else {
      setProducts((data as Produk[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = products.filter(
    (p) =>
      p.nama?.toLowerCase().includes(search.toLowerCase()) ||
      p.kategori?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setExistingImages([]);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setModalOpen(true);
  };

  const openEdit = (p: Produk) => {
    setEditingProduct(p);
    const isCustomKategori = !!p.kategori && !KATEGORI_OPTIONS.includes(p.kategori);
    setForm({
      nama: p.nama,
      harga: p.harga,
      kategori: isCustomKategori ? "Lainnya" : p.kategori,
      kategoriLainnya: isCustomKategori ? p.kategori : "",
      deskripsi: p.deskripsi || "",
      tampil_di_homepage: p.tampil_di_homepage,
    });
    setExistingImages(p.gambar_urls || []);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingProduct(null);
    newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setNewImagePreviews([]);
    setNewImageFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewImageFiles((prev) => [...prev, ...files]);
    setNewImagePreviews((prev) => [...prev, ...previews]);
    e.target.value = "";
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeNewImage = (idx: number) => {
    URL.revokeObjectURL(newImagePreviews[idx]);
    setNewImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const json = await res.json();
    return json.url || null;
  };

  const handleSave = async () => {
    const kategoriFinal =
      form.kategori === "Lainnya" ? form.kategoriLainnya.trim() : form.kategori;

    if (!form.nama.trim() || !form.harga.trim() || !kategoriFinal) {
      toast.error("Nama, harga, dan kategori wajib diisi");
      return;
    }

    setSaving(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of newImageFiles) {
        const url = await uploadImage(file);
        if (url) uploadedUrls.push(url);
      }

      const gambar_urls = [...existingImages, ...uploadedUrls];

      const payload = {
        nama: form.nama.trim(),
        harga: form.harga.trim(),
        kategori: kategoriFinal,
        deskripsi: form.deskripsi.trim() || null,
        gambar_urls,
        tampil_di_homepage: form.tampil_di_homepage,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("produk")
          .update(payload)
          .eq("id", editingProduct.id);
        if (error) throw error;
        toast.success("Produk berhasil diperbarui");
      } else {
        const { error } = await supabase.from("produk").insert(payload);
        if (error) throw error;
        toast.success("Produk berhasil ditambahkan");
      }

      closeModal();
      fetchProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error("Gagal menyimpan: " + msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("produk")
        .delete()
        .eq("id", deleteTarget.id);
      if (error) throw error;
      toast.success("Produk berhasil dihapus");
      setDeleteTarget(null);
      fetchProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error("Gagal menghapus: " + msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">Manajemen Produk</h1>
          <p className="text-sm text-gray-500">Kelola data produk</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#01341b] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#015c30] transition-colors"
        >
          <RiAddLine className="size-4" />
          Tambah Produk
        </button>
      </div>

      {/* Search */}
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

      {/* Content */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">Produk tidak ditemukan</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((product) => {
            const images = product.gambar_urls || [];
            return (
              <div key={product.id} className="border rounded-lg p-4 shadow-sm flex flex-col">
                <div className="h-[200px] bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-3 flex-shrink-0">
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

                <div className="flex flex-col flex-1">
                  <h2 className="font-semibold text-lg">{product.nama}</h2>
                  <p className="text-green-700 font-bold">{product.harga}</p>
                  <p className="text-gray-500 text-sm mb-1">{product.kategori}</p>
                  {product.tampil_di_homepage && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full w-fit">
                      Tampil di Homepage
                    </span>
                  )}

                  <div className="flex gap-2 mt-auto pt-3">
                    <button
                      onClick={() => openEdit(product)}
                      className="flex items-center gap-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                    >
                      <RiEdit2Line className="size-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(product)}
                      className="flex items-center gap-1 text-sm border border-red-200 text-red-600 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
                    >
                      <RiDeleteBinLine className="size-4" />
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-lg">
                {editingProduct ? "Edit Produk" : "Tambah Produk"}
              </h2>
              <button
                onClick={closeModal}
                disabled={saving}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RiCloseLine className="size-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 flex flex-col gap-4 flex-1">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Nama Produk <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                  placeholder="Contoh: Laptop ASUS VivoBook 14"
                  className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#01341b]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Harga <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.harga}
                  onChange={(e) => setForm((f) => ({ ...f, harga: e.target.value }))}
                  placeholder="Contoh: Rp 7.500.000"
                  className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#01341b]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Kategori <span className="text-red-500">*</span></label>
                <select
                  value={form.kategori}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      kategori: e.target.value,
                      kategoriLainnya: e.target.value === "Lainnya" ? f.kategoriLainnya : "",
                    }))
                  }
                  className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#01341b] bg-white"
                >
                  <option value="">Pilih kategori...</option>
                  {KATEGORI_OPTIONS.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                {form.kategori === "Lainnya" && (
                  <input
                    type="text"
                    value={form.kategoriLainnya}
                    onChange={(e) => setForm((f) => ({ ...f, kategoriLainnya: e.target.value }))}
                    placeholder="Tulis kategori baru..."
                    autoFocus
                    className="mt-2 border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#01341b]"
                  />
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Deskripsi</label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))}
                  placeholder="Deskripsi produk (opsional)"
                  rows={3}
                  className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-[#01341b] resize-none"
                />
              </div>

              {(() => {
                const homepageCount = products.filter(
                  (p) => p.tampil_di_homepage && p.id !== editingProduct?.id
                ).length;
                const isAtLimit = homepageCount >= 3 && !form.tampil_di_homepage;
                return (
                  <div className="flex flex-col gap-1">
                    <div className={`flex items-center gap-2 ${isAtLimit ? "opacity-50" : ""}`}>
                      <input
                        type="checkbox"
                        id="homepage"
                        checked={form.tampil_di_homepage}
                        disabled={isAtLimit}
                        onChange={(e) => setForm((f) => ({ ...f, tampil_di_homepage: e.target.checked }))}
                        className="rounded cursor-pointer disabled:cursor-not-allowed"
                      />
                      <label
                        htmlFor="homepage"
                        className={`text-sm font-medium ${isAtLimit ? "cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        Tampilkan di Homepage
                      </label>
                    </div>
                    {isAtLimit ? (
                      <p className="text-xs text-red-500">Maksimal 3 produk yang dapat ditampilkan di homepage. Hapus centang salah satu produk terlebih dahulu.</p>
                    ) : (
                      <p className="text-xs text-gray-400">{homepageCount}/3 slot homepage terpakai</p>
                    )}
                  </div>
                );
              })()}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Gambar Produk</label>
                {existingImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {existingImages.map((url, i) => (
                      <div key={i} className="relative w-20 h-20">
                        <img src={url} alt={`img-${i}`} className="w-full h-full object-cover rounded-lg border" />
                        <button
                          onClick={() => removeExistingImage(i)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full size-5 flex items-center justify-center"
                        >
                          <RiCloseLine className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {newImagePreviews.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {newImagePreviews.map((url, i) => (
                      <div key={i} className="relative w-20 h-20">
                        <img src={url} alt={`new-${i}`} className="w-full h-full object-cover rounded-lg border border-dashed border-[#01341b]" />
                        <button
                          onClick={() => removeNewImage(i)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full size-5 flex items-center justify-center"
                        >
                          <RiCloseLine className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-500 hover:border-[#01341b] hover:text-[#01341b] transition-colors w-fit"
                >
                  <RiUpload2Line className="size-4" />
                  Upload Gambar
                </button>
              </div>
            </div>

            <div className="flex gap-2 p-5 border-t justify-end">
              <button onClick={closeModal} disabled={saving} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-[#01341b] text-white rounded-lg hover:bg-[#015c30] transition-colors disabled:opacity-60"
              >
                {saving && <RiLoader4Line className="size-4 animate-spin" />}
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="font-bold text-lg mb-2">Hapus Produk</h2>
            <p className="text-sm text-gray-600 mb-5">
              Yakin ingin menghapus produk <span className="font-semibold">&ldquo;{deleteTarget.nama}&rdquo;</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {deleting && <RiLoader4Line className="size-4 animate-spin" />}
                {deleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}