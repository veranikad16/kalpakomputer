"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { UpdateStatusServis } from "@/components/UpdateStatusServis";
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiSearchLine,
  RiCloseLine,
  RiMore2Line,
  RiToolsLine,
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

interface Servis {
  id: string;
  nama: string;
  nomor_whatsapp: string;
  jenis_perangkat: string;
  tipe_merk: string;
  keluhan: string;
  tanggal_masuk: string;
  target_selesai: string | null;
  status: string;
  catatan_admin: string | null;
  created_at: string;
}

interface ServisForm {
  nama: string;
  nomor_whatsapp: string;
  jenis_perangkat: string;
  tipe_merk: string;
  keluhan: string;
  tanggal_masuk: string;
  target_selesai: string;
  status: string;
  catatan_admin: string;
}

const emptyForm: ServisForm = {
  nama: "",
  nomor_whatsapp: "",
  jenis_perangkat: "",
  tipe_merk: "",
  keluhan: "",
  tanggal_masuk: "",
  target_selesai: "",
  status: "Menunggu Konfirmasi",
  catatan_admin: "",
};

const STATUS_LIST = [
  "Menunggu Konfirmasi",
  "Diproses",
  "Selesai",
  "Dibatalkan",
];

const statusStyle: Record<string, string> = {
  "Menunggu Konfirmasi": "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  "Diproses": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "Selesai": "bg-green-500/10 text-green-600 dark:text-green-400",
  "Dibatalkan": "bg-red-500/10 text-red-600 dark:text-red-400",
};

// ─── Modal Tambah/Edit ────────────────────────────────────────────────────────

function ServisModal({
  open,
  onClose,
  onSave,
  initial,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: ServisForm) => Promise<void>;
  initial: ServisForm;
  loading: boolean;
}) {
  const [form, setForm] = useState<ServisForm>(emptyForm);

  useEffect(() => {
    if (!open) return;
    setForm(initial); // eslint-disable-line react-hooks/set-state-in-effect
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (field: keyof ServisForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 bg-background border border-border rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            {initial.nama ? "Edit Servis" : "Tambah Servis"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <RiCloseLine className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {/* Nama */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="nama">Nama Pelanggan</Label>
            <Input
              id="nama"
              placeholder="Contoh: Budi Santoso"
              value={form.nama}
              onChange={(e) => handleChange("nama", e.target.value)}
            />
          </div>

          {/* No WhatsApp */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="wa">Nomor WhatsApp</Label>
            <Input
              id="wa"
              placeholder="Contoh: 08123456789"
              value={form.nomor_whatsapp}
              onChange={(e) => handleChange("nomor_whatsapp", e.target.value)}
            />
          </div>

          {/* Jenis & Tipe */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="jenis">Jenis Perangkat</Label>
              <Input
                id="jenis"
                placeholder="Contoh: Laptop"
                value={form.jenis_perangkat}
                onChange={(e) => handleChange("jenis_perangkat", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tipe">Tipe / Merk</Label>
              <Input
                id="tipe"
                placeholder="Contoh: ASUS VivoBook"
                value={form.tipe_merk}
                onChange={(e) => handleChange("tipe_merk", e.target.value)}
              />
            </div>
          </div>

          {/* Keluhan */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="keluhan">Keluhan</Label>
            <textarea
              id="keluhan"
              rows={3}
              placeholder="Deskripsikan keluhan pelanggan..."
              value={form.keluhan}
              onChange={(e) => handleChange("keluhan", e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none dark:bg-input/30"
            />
          </div>

          {/* Tanggal */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="masuk">Tanggal Masuk</Label>
              <Input
                id="masuk"
                type="date"
                value={form.tanggal_masuk}
                onChange={(e) => handleChange("tanggal_masuk", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="target">Target Selesai</Label>
              <Input
                id="target"
                type="date"
                value={form.target_selesai}
                onChange={(e) => handleChange("target_selesai", e.target.value)}
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {STATUS_LIST.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Catatan Admin */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="catatan">Catatan Admin</Label>
            <textarea
              id="catatan"
              rows={2}
              placeholder="Catatan internal admin (opsional)..."
              value={form.catatan_admin}
              onChange={(e) => handleChange("catatan_admin", e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none dark:bg-input/30"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
          <Button variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
          <Button
            onClick={() => onSave(form)}
            disabled={loading || !form.nama || !form.nomor_whatsapp || !form.jenis_perangkat || !form.keluhan || !form.tanggal_masuk}
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
          <h2 className="text-base font-semibold text-foreground">Hapus Data Servis</h2>
          <p className="text-sm text-muted-foreground">
            Yakin ingin menghapus data servis milik{" "}
            <span className="font-medium text-foreground">&quot;{nama}&quot;</span>?
            Tindakan ini tidak bisa dibatalkan.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Batal</Button>
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ServisWorkshopPage() {
  const [servisList, setServisList] = useState<Servis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editTarget, setEditTarget] = useState<Servis | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Servis | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchServis = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("servis_workshop")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setServisList(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServis(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchServis]);

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filtered = servisList.filter((s) => {
    const matchSearch =
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.jenis_perangkat.toLowerCase().includes(search.toLowerCase()) ||
      s.tipe_merk.toLowerCase().includes(search.toLowerCase()) ||
      s.nomor_whatsapp.includes(search);
    const matchStatus = filterStatus === "Semua" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // ── Simpan ─────────────────────────────────────────────────────────────────

  const handleSave = async (form: ServisForm) => {
    setModalLoading(true);

    const payload = {
      nama: form.nama,
      nomor_whatsapp: form.nomor_whatsapp,
      jenis_perangkat: form.jenis_perangkat,
      tipe_merk: form.tipe_merk,
      keluhan: form.keluhan,
      tanggal_masuk: form.tanggal_masuk,
      target_selesai: form.target_selesai || null,
      status: form.status,
    };

    if (editTarget) {
      const { error } = await supabase
        .from("servis_workshop")
        .update(payload)
        .eq("id", editTarget.id);
      if (error) console.error(error);
    } else {
      const { error } = await supabase.from("servis_workshop").insert([payload]);
      if (error) console.error(error);
    }

    await fetchServis();
    setModalLoading(false);
    setModalOpen(false);
    setEditTarget(null);
  };

  // ── Hapus ──────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const { error } = await supabase
      .from("servis_workshop")
      .delete()
      .eq("id", deleteTarget.id);
    if (error) console.error(error);
    await fetchServis();
    setDeleteLoading(false);
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const openEdit = (servis: Servis) => { setEditTarget(servis); setModalOpen(true); };
  const openDelete = (servis: Servis) => { setDeleteTarget(servis); setDeleteOpen(true); };
  const openAdd = () => { setEditTarget(null); setModalOpen(true); };

  const formInitial: ServisForm = editTarget
    ? {
        nama: editTarget.nama,
        nomor_whatsapp: editTarget.nomor_whatsapp,
        jenis_perangkat: editTarget.jenis_perangkat,
        tipe_merk: editTarget.tipe_merk,
        keluhan: editTarget.keluhan,
        tanggal_masuk: editTarget.tanggal_masuk,
        target_selesai: editTarget.target_selesai ?? "",
        status: editTarget.status,
        catatan_admin: editTarget.catatan_admin ?? "",
      }
    : emptyForm;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Servis Workshop</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Kelola data servis perangkat di workshop
            </p>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative w-full max-w-sm">
            <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, perangkat, atau nomor WA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-2 flex-wrap">
            {["Semua", ...STATUS_LIST].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  filterStatus === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              <TableRow>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Jenis Perangkat</TableHead>
                <TableHead>Tipe/Merk</TableHead>
                <TableHead>Keluhan</TableHead>
                <TableHead>Tanggal Masuk</TableHead>
                <TableHead>Target Selesai</TableHead>
                <TableHead>Nomor WhatsApp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <RiToolsLine className="size-8 text-muted-foreground/50" />
                      <span>{search || filterStatus !== "Semua" ? "Data tidak ditemukan" : "Belum ada data servis"}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((servis) => (
                  <TableRow key={servis.id}>
                    {/* Nama Pelanggan */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground">{servis.nama}</span>
                      </div>
                    </TableCell>

                    {/* Perangkat */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-foreground">{servis.jenis_perangkat}</span>
                      </div>
                    </TableCell>

                    {/* Tipe/Merk */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-foreground">{servis.tipe_merk}</span>
                      </div>
                    </TableCell>

                    {/* Keluhan */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]">
                        {servis.keluhan}
                      </span>
                    </TableCell>

                    {/* Tanggal Masuk */}
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDate(servis.tanggal_masuk)}
                    </TableCell>

                    {/* Target Selesai */}
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDate(servis.target_selesai)}
                    </TableCell>

                    {/* Nomor WhatsApp */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{servis.nomor_whatsapp}</span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <UpdateStatusServis 
                        item={servis}  
                        onUpdated={() => fetchServis()}  
                      />
                    </TableCell>

                    {/* Aksi */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" />
                          }
                        >
                          <RiMore2Line />
                          <span className="sr-only">Aksi</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem onClick={() => openEdit(servis)}>
                            <RiEditLine className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => openDelete(servis)}>
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
            Menampilkan {filtered.length} dari {servisList.length} data servis
          </p>
        )}
      </div>

      <ServisModal
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