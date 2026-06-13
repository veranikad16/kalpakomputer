"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import {
  RiAddLine, RiEditLine, RiDeleteBinLine, RiSearchLine,
  RiImageLine, RiCloseLine, RiMore2Line, RiDraggable,
} from "@remixicon/react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/admin/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/admin/ui/table";

const MAX_IMAGES = 8;

interface Produk {
  id: string;
  nama: string;
  harga: string;
  kategori: string;
  deskripsi: string | null;
  gambar_urls: string[];
  tampil_di_homepage: boolean;
  spesifikasi: Record<string, string> | null;
}

interface ProdukForm {
  nama: string;
  harga: string;
  kategori: string;
  deskripsi: string;
  gambar_urls: string[];
  tampil_di_homepage: boolean;
  spesifikasi: Record<string, string>;
}

interface ImageSlot {
  id: string;
  url: string;
  file: File | null;
}

// Baris spesifikasi sementara di form
interface SpekRow {
  key: string;
  value: string;
}

const emptyForm: ProdukForm = {
  nama: "",
  harga: "",
  kategori: "",
  deskripsi: "",
  gambar_urls: [],
  tampil_di_homepage: false,
  spesifikasi: {},
};

// ─── ImageGrid ────────────────────────────────────────────────────────────────

function ImageGrid({ slots, onChange }: { slots: ImageSlot[]; onChange: (slots: ImageSlot[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const dragIndexRef = useRef<number | null>(null);
  const dragOverIndexRef = useRef<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = MAX_IMAGES - slots.length;
    const toAdd = files.slice(0, remaining);
    const newSlots: ImageSlot[] = toAdd.map((f) => ({
      id: `${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(f),
      file: f,
    }));
    onChange([...slots, ...newSlots]);
    e.target.value = "";
  };

  const removeSlot = (index: number) => {
    const next = [...slots];
    if (next[index].file) URL.revokeObjectURL(next[index].url);
    next.splice(index, 1);
    onChange(next);
  };

  const onDragStart = (i: number) => { dragIndexRef.current = i; };
  const onDragEnter = (i: number) => { dragOverIndexRef.current = i; };
  const onDragEnd = () => {
    const from = dragIndexRef.current;
    const to = dragOverIndexRef.current;
    if (from === null || to === null || from === to) return;
    const next = [...slots];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
    dragIndexRef.current = null;
    dragOverIndexRef.current = null;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-4 gap-2">
        {slots.map((slot, i) => (
          <div
            key={slot.id}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragEnter={() => onDragEnter(i)}
            onDragEnd={onDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className="relative group aspect-square rounded-lg border border-border bg-muted/30 overflow-hidden cursor-grab active:cursor-grabbing"
          >
            <img src={slot.url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
            {i === 0 && (
              <span className="absolute top-1.5 left-1.5 text-[10px] font-medium bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full leading-none pointer-events-none">
                Utama
              </span>
            )}
            <button
              type="button"
              onClick={() => removeSlot(i)}
              className="absolute top-1 right-1 size-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
            >
              <RiCloseLine className="size-3 text-white" />
            </button>
          </div>
        ))}
        {slots.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-1 hover:bg-muted/40 transition-colors text-muted-foreground"
          >
            <RiAddLine className="size-5" />
            <span className="text-[11px]">Tambah</span>
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
      <p className="text-xs text-muted-foreground text-right">
        {slots.length} / {MAX_IMAGES} foto · Seret untuk urutkan · Foto pertama jadi gambar utama
      </p>
    </div>
  );
}

// ─── SpesifikasiEditor ────────────────────────────────────────────────────────

function SpesifikasiEditor({
  rows,
  onChange,
}: {
  rows: SpekRow[];
  onChange: (rows: SpekRow[]) => void;
}) {
  const addRow = () => onChange([...rows, { key: "", value: "" }]);

  const updateRow = (i: number, field: "key" | "value", val: string) => {
    const next = [...rows];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  const removeRow = (i: number) => {
    const next = [...rows];
    next.splice(i, 1);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Input
            placeholder="Nama (cth: RAM)"
            value={row.key}
            onChange={(e) => updateRow(i, "key", e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Nilai (cth: 16GB)"
            value={row.value}
            onChange={(e) => updateRow(i, "value", e.target.value)}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <RiCloseLine className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <RiAddLine className="size-3.5" />
        Tambah baris spesifikasi
      </button>
    </div>
  );
}

// ─── Modal Tambah/Edit ────────────────────────────────────────────────────────

function ProdukModal({
  open, onClose, onSave, initial, loading,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: ProdukForm, newFiles: { index: number; file: File }[]) => Promise<void>;
  initial: ProdukForm;
  loading: boolean;
}) {
  const [form, setForm] = useState<ProdukForm>(emptyForm);
  const [slots, setSlots] = useState<ImageSlot[]>([]);
  const [spekRows, setSpekRows] = useState<SpekRow[]>([]);

  useEffect(() => {
    if (!open) return;
    setForm(initial);
    setSlots(
      (initial.gambar_urls ?? []).map((url) => ({ id: `existing-${url}`, url, file: null }))
    );
    // Konversi object spesifikasi ke rows
    const existingSpek = initial.spesifikasi ?? {};
    setSpekRows(Object.entries(existingSpek).map(([key, value]) => ({ key, value })));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (field: keyof ProdukForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const newFiles = slots
      .map((slot, index) => ({ index, file: slot.file }))
      .filter((item): item is { index: number; file: File } => item.file !== null);

    const existingUrls = slots.filter((slot) => slot.file === null).map((slot) => slot.url);

    // Konversi rows ke object, skip baris kosong
    const spesifikasi: Record<string, string> = {};
    for (const row of spekRows) {
      if (row.key.trim()) spesifikasi[row.key.trim()] = row.value.trim();
    }

    await onSave({ ...form, gambar_urls: existingUrls, spesifikasi }, newFiles);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 bg-background border border-border rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            {initial.nama ? "Edit Produk" : "Tambah Produk"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <RiCloseLine className="size-5" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4 max-h-[72vh] overflow-y-auto">
          {/* Foto */}
          <div className="flex flex-col gap-2">
            <Label>Foto Produk</Label>
            <ImageGrid slots={slots} onChange={setSlots} />
          </div>

          {/* Nama */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="nama">Nama Produk</Label>
            <Input id="nama" placeholder="Contoh: Laptop ASUS VivoBook" value={form.nama} onChange={(e) => handleChange("nama", e.target.value)} />
          </div>

          {/* Harga */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="harga">Harga</Label>
            <Input id="harga" placeholder="Contoh: Rp 8.500.000" value={form.harga} onChange={(e) => handleChange("harga", e.target.value)} />
          </div>

          {/* Kategori */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="kategori">Kategori</Label>
            <Input id="kategori" placeholder="Contoh: Laptop, Printer, Aksesoris" value={form.kategori} onChange={(e) => handleChange("kategori", e.target.value)} />
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

          {/* Spesifikasi */}
          <div className="flex flex-col gap-2">
            <Label>Spesifikasi</Label>
            <SpesifikasiEditor rows={spekRows} onChange={setSpekRows} />
          </div>

          {/* Homepage */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="homepage"
              checked={form.tampil_di_homepage}
              onChange={(e) => handleChange("tampil_di_homepage", e.target.checked)}
              className="size-4 rounded border-input accent-primary cursor-pointer"
            />
            <Label htmlFor="homepage" className="cursor-pointer font-normal">Tampilkan di Homepage</Label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
          <Button variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
          <Button onClick={handleSubmit} disabled={loading || !form.nama || !form.harga}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Hapus ──────────────────────────────────────────────────────────────

function DeleteModal({ open, onClose, onConfirm, nama, loading }: {
  open: boolean; onClose: () => void; onConfirm: () => void; nama: string; loading: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm mx-4 bg-background border border-border rounded-xl shadow-xl p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-foreground">Hapus Produk</h2>
          <p className="text-sm text-muted-foreground">
            Yakin ingin menghapus produk <span className="font-medium text-foreground">&quot;{nama}&quot;</span>? Tindakan ini tidak bisa dibatalkan.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("produk").select("*").order("created_at", { ascending: false });
    if (!error) setProducts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter((p) =>
    p.nama.toLowerCase().includes(search.toLowerCase()) ||
    p.kategori.toLowerCase().includes(search.toLowerCase())
  );

  const uploadGambar = async (f: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", f);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const json = await res.json();
    if (!res.ok) { console.error("Upload error:", json.error); return null; }
    return json.url as string;
  };

  const handleSave = async (form: ProdukForm, newFiles: { index: number; file: File }[]) => {
    setModalLoading(true);

    const uploadResults = await Promise.all(
      newFiles.map(async ({ index, file }) => ({ index, url: await uploadGambar(file) }))
    );

    const totalSlots = form.gambar_urls.length + newFiles.length;
    const finalUrls: string[] = new Array(totalSlots).fill("");
    for (const { index, url } of uploadResults) {
      if (url) finalUrls[index] = url;
    }
    let existingCursor = 0;
    for (let i = 0; i < totalSlots; i++) {
      if (finalUrls[i] === "") {
        finalUrls[i] = form.gambar_urls[existingCursor] ?? "";
        existingCursor++;
      }
    }

    const payload = {
      nama: form.nama,
      harga: form.harga,
      kategori: form.kategori,
      deskripsi: form.deskripsi || null,
      gambar_urls: finalUrls.filter(Boolean),
      tampil_di_homepage: form.tampil_di_homepage,
      spesifikasi: Object.keys(form.spesifikasi).length > 0 ? form.spesifikasi : null,
    };

    if (editTarget) {
      const { error } = await supabase.from("produk").update(payload).eq("id", editTarget.id);
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const { error } = await supabase.from("produk").delete().eq("id", deleteTarget.id);
    if (error) console.error(error);
    await fetchProducts();
    setDeleteLoading(false);
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const openEdit = (produk: Produk) => { setEditTarget(produk); setModalOpen(true); };
  const openDelete = (produk: Produk) => { setDeleteTarget(produk); setDeleteOpen(true); };
  const openAdd = () => { setEditTarget(null); setModalOpen(true); };

  const formInitial: ProdukForm = editTarget
    ? {
        nama: editTarget.nama,
        harga: editTarget.harga,
        kategori: editTarget.kategori,
        deskripsi: editTarget.deskripsi ?? "",
        gambar_urls: editTarget.gambar_urls ?? [],
        tampil_di_homepage: editTarget.tampil_di_homepage,
        spesifikasi: editTarget.spesifikasi ?? {},
      }
    : emptyForm;

  return (
    <>
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Manajemen Produk</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Kelola data produk yang ditampilkan di website</p>
          </div>
          <Button onClick={openAdd}><RiAddLine />Tambah Produk</Button>
        </div>

        <div className="relative w-full max-w-sm">
          <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Cari nama atau kategori..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-16">Foto</TableHead>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Homepage</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Memuat data...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">{search ? "Produk tidak ditemukan" : "Belum ada produk"}</TableCell></TableRow>
              ) : (
                filtered.map((produk) => {
                  const coverUrl = produk.gambar_urls?.[0] ?? null;
                  const extraCount = (produk.gambar_urls?.length ?? 0) - 1;
                  return (
                    <TableRow key={produk.id}>
                      <TableCell>
                        <div className="relative size-12 rounded-md bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
                          {coverUrl ? (
                            <>
                              <img src={coverUrl} alt={produk.nama} className="w-full h-full object-cover" />
                              {extraCount > 0 && (
                                <span className="absolute bottom-0.5 right-0.5 text-[9px] font-medium bg-black/60 text-white px-1 rounded leading-tight">+{extraCount}</span>
                              )}
                            </>
                          ) : (
                            <RiImageLine className="size-5 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-foreground">{produk.nama}</span>
                          {produk.deskripsi && <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{produk.deskripsi}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">{produk.kategori || "-"}</span>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{produk.harga}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${produk.tampil_di_homepage ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                          {produk.tampil_di_homepage ? "Tampil" : "Tidak"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8 text-muted-foreground" />}>
                            <RiMore2Line />
                            <span className="sr-only">Aksi</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem onClick={() => openEdit(produk)}><RiEditLine className="size-4" />Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => openDelete(produk)}><RiDeleteBinLine className="size-4" />Hapus</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {!loading && <p className="text-xs text-muted-foreground">Menampilkan {filtered.length} dari {products.length} produk</p>}
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