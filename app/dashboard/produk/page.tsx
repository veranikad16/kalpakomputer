"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiSearchLine,
  RiImageLine,
  RiCloseLine,
  RiMore2Line,
} from "@remixicon/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/admin/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Produk {
  id: string;
  nama: string;
  harga: string;
  kategori: string;
  deskripsi: string | null;
  gambar_url: string | null;
  tampil_di_homepage: boolean;
}

interface ProdukForm {
  nama: string;
  harga: string;
  kategori: string;
  deskripsi: string;
  gambar_url: string;
  tampil_di_homepage: boolean;
}

const emptyForm: ProdukForm = {
  nama: "",
  harga: "",
  kategori: "",
  deskripsi: "",
  gambar_url: "",
  tampil_di_homepage: false,
};

// ─── Modal Tambah/Edit ────────────────────────────────────────────────────────

function ProdukModal({
  open,
  onClose,
  onSave,
  initial,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: ProdukForm, file: File | null) => Promise<void>;
  initial: ProdukForm;
  loading: boolean;
}) {
  const [form, setForm] = useState<ProdukForm>(emptyForm);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Reset form setiap kali modal dibuka
  useEffect(() => {
    if (!open) return;
    setForm(initial); // eslint-disable-line react-hooks/set-state-in-effect
    setPreviewUrl(initial.gambar_url ?? ""); // eslint-disable-line react-hooks/set-state-in-effect
    setFile(null); // eslint-disable-line react-hooks/set-state-in-effect
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (field: keyof ProdukForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 bg-background border border-border rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            {initial.nama ? "Edit Produk" : "Tambah Produk"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <RiCloseLine className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {/* Gambar */}
          <div className="flex flex-col gap-2">
            <Label>Gambar Produk</Label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative w-full h-44 rounded-lg border-2 border-dashed border-border bg-muted/30 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <RiImageLine className="size-8" />
                  <span className="text-sm">Klik untuk upload gambar</span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
            <Input
              placeholder="Atau masukkan URL gambar"
              value={file ? "" : form.gambar_url}
              onChange={(e) => {
                setFile(null);
                setPreviewUrl(e.target.value);
                handleChange("gambar_url", e.target.value);
              }}
            />
          </div>

          {/* Nama */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="nama">Nama Produk</Label>
            <Input
              id="nama"
              placeholder="Contoh: Laptop ASUS VivoBook"
              value={form.nama}
              onChange={(e) => handleChange("nama", e.target.value)}
            />
          </div>

          {/* Harga */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="harga">Harga</Label>
            <Input
              id="harga"
              placeholder="Contoh: Rp 8.500.000"
              value={form.harga}
              onChange={(e) => handleChange("harga", e.target.value)}
            />
          </div>

          {/* Kategori */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="kategori">Kategori</Label>
            <Input
              id="kategori"
              placeholder="Contoh: Laptop, Printer, Aksesoris"
              value={form.kategori}
              onChange={(e) => handleChange("kategori", e.target.value)}
            />
          </div>

          {/* Deskripsi */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <textarea
              id="deskripsi"
              rows={3}
              placeholder="Deskripsi singkat produk..."
              value={form.deskripsi}
              onChange={(e) => handleChange("deskripsi", e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none dark:bg-input/30"
            />
          </div>

          {/* Tampil di homepage */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="homepage"
              checked={form.tampil_di_homepage}
              onChange={(e) => handleChange("tampil_di_homepage", e.target.checked)}
              className="size-4 rounded border-input accent-primary cursor-pointer"
            />
            <Label htmlFor="homepage" className="cursor-pointer font-normal">
              Tampilkan di Homepage
            </Label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            onClick={() => onSave(form, file)}
            disabled={loading || !form.nama || !form.harga}
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Hapus ──────────────────────────────────────────────────────────────

function DeleteModal({
  open,
  onClose,
  onConfirm,
  nama,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nama: string;
  loading: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm mx-4 bg-background border border-border rounded-xl shadow-xl p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-foreground">Hapus Produk</h2>
          <p className="text-sm text-muted-foreground">
            Yakin ingin menghapus produk{" "}
            <span className="font-medium text-foreground">&quot;{nama}&quot;</span>?
            Tindakan ini tidak bisa dibatalkan.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Menghapus..." : "Hapus"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ManajemenProdukPage() {
  const [products, setProducts] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editTarget, setEditTarget] = useState<Produk | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Produk | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setProducts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchProducts]);

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filtered = products.filter(
    (p) =>
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.kategori.toLowerCase().includes(search.toLowerCase())
  );

  // ── Upload gambar ──────────────────────────────────────────────────────────

  const uploadGambar = async (f: File): Promise<string | null> => {
    const ext = f.name.split(".").pop();
    const filename = `produk/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images") // ganti sesuai nama bucket kamu
      .upload(filename, f, { upsert: true });
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    const { data } = supabase.storage.from("images").getPublicUrl(filename);
    return data.publicUrl;
  };

  // ── Simpan ─────────────────────────────────────────────────────────────────

  const handleSave = async (form: ProdukForm, file: File | null) => {
    setModalLoading(true);

    let gambar_url = form.gambar_url || null;
    if (file) {
      const uploaded = await uploadGambar(file);
      if (uploaded) gambar_url = uploaded;
    }

    const payload = {
      nama: form.nama,
      harga: form.harga,
      kategori: form.kategori,
      deskripsi: form.deskripsi || null,
      gambar_url,
      tampil_di_homepage: form.tampil_di_homepage,
    };

    if (editTarget) {
      const { error } = await supabase
        .from("produk")
        .update(payload)
        .eq("id", editTarget.id);
      if (error) console.error(error);
    } else {
      const { error } = await supabase.from("produk").insert([payload]);
      if (error) console.error(error);
    }

    await fetchProducts();
    setModalLoading(false);
    setModalOpen(false);
    setEditTarget(null);
  };

  // ── Hapus ──────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const { error } = await supabase
      .from("produk")
      .delete()
      .eq("id", deleteTarget.id);
    if (error) console.error(error);
    await fetchProducts();
    setDeleteLoading(false);
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const openEdit = (produk: Produk) => { setEditTarget(produk); setModalOpen(true); };
  const openDelete = (produk: Produk) => { setDeleteTarget(produk); setDeleteOpen(true); };
  const openAdd = () => { setEditTarget(null); setModalOpen(true); };

  const formInitial: ProdukForm = editTarget
    ? {
        nama: editTarget.nama,
        harga: editTarget.harga,
        kategori: editTarget.kategori,
        deskripsi: editTarget.deskripsi ?? "",
        gambar_url: editTarget.gambar_url ?? "",
        tampil_di_homepage: editTarget.tampil_di_homepage,
      }
    : emptyForm;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Manajemen Produk</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Kelola data produk yang ditampilkan di website
            </p>
          </div>
          <Button onClick={openAdd}>
            <RiAddLine />
            Tambah Produk
          </Button>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-sm">
          <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Tabel */}
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-16">Gambar</TableHead>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Homepage</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    {search ? "Produk tidak ditemukan" : "Belum ada produk"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((produk) => (
                  <TableRow key={produk.id}>
                    <TableCell>
                      <div className="size-12 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                        {produk.gambar_url ? (
                          <img
                            src={produk.gambar_url}
                            alt={produk.nama}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <RiImageLine className="size-5 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground">{produk.nama}</span>
                        {produk.deskripsi && (
                          <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {produk.deskripsi}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                        {produk.kategori || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-sm">{produk.harga}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        produk.tampil_di_homepage
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {produk.tampil_di_homepage ? "Tampil" : "Tidak"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground"
                            />
                          }
                        >
                          <RiMore2Line />
                          <span className="sr-only">Aksi</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem onClick={() => openEdit(produk)}>
                            <RiEditLine className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => openDelete(produk)}
                          >
                            <RiDeleteBinLine className="size-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!loading && (
          <p className="text-xs text-muted-foreground">
            Menampilkan {filtered.length} dari {products.length} produk
          </p>
        )}
      </div>

      <ProdukModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        initial={formInitial}
        loading={modalLoading}
      />

      <DeleteModal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null); }}
        onConfirm={handleDelete}
        nama={deleteTarget?.nama ?? ""}
        loading={deleteLoading}
      />
    </>
  );
}