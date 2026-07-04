"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { buildWhatsAppMessage, sendWhatsApp } from "@/lib/whatsapp";
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiSearchLine,
  RiCloseLine,
  RiMore2Line,
  RiToolsLine,
  RiUserLine,
  RiImageLine,
  RiZoomInLine,
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
  kode_tracking: string | null;
  teknisi_id: string | null;
  created_at: string;
}

interface Teknisi {
  id: string;
  nama: string;
  nomor_whatsapp: string;
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
  "Dikonfirmasi",
  "Diproses",
  "Selesai",
  "Dibatalkan",
];

const statusStyle: Record<string, string> = {
  "Menunggu Konfirmasi": "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  Dikonfirmasi: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Diproses: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  Selesai: "bg-green-500/10 text-green-600 dark:text-green-400",
  Dibatalkan: "bg-red-500/10 text-red-600 dark:text-red-400",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusOptions(teknisiId: string | null): string[] {
  if (teknisiId) {
    // Sudah ada teknisi: admin hanya bisa pilih Dikonfirmasi atau Dibatalkan
    // Diproses & Selesai diupdate oleh teknisi dari dashboard teknisi
    return ["Dikonfirmasi", "Dibatalkan"];
  }
  // Belum ada teknisi: hanya "Menunggu Konfirmasi" dan "Dibatalkan"
  return ["Menunggu Konfirmasi", "Dibatalkan"];
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function generateKodeTracking(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Deteksi apakah value tipe_merk adalah URL gambar (hasil upload Supabase Storage)
// atau sekadar teks biasa (mis. "ASUS VivoBook").
function isImageUrl(value: string): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;
  // Cocok untuk url storage supabase atau ekstensi gambar umum
  return (
    /\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i.test(trimmed) ||
    trimmed.includes("/storage/v1/object/")
  );
}

// ─── Modal Preview Foto ────────────────────────────────────────────────────────

function ImagePreviewModal({
  open,
  onClose,
  imageUrl,
  title,
}: {
  open: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title?: string;
}) {
  if (!open || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl mx-4 flex flex-col items-center gap-3">
        <div className="flex items-center justify-between w-full">
          <p className="text-sm font-medium text-white/90">
            {title ?? "Preview Foto"}
          </p>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-1.5"
          >
            <RiCloseLine className="size-5" />
          </button>
        </div>
        <div className="w-full max-h-[75vh] overflow-hidden rounded-xl border border-white/10 bg-black flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title ?? "Foto tipe/merk perangkat"}
            className="max-w-full max-h-[75vh] object-contain"
          />
        </div>
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-white/70 hover:text-white underline underline-offset-2"
        >
          Buka gambar di tab baru
        </a>
      </div>
    </div>
  );
}

// ─── Modal Assign Teknisi ─────────────────────────────────────────────────────

function AssignTeknisiModal({
  open,
  onClose,
  servis,
  teknisiList,
  onAssign,
}: {
  open: boolean;
  onClose: () => void;
  servis: Servis | null;
  teknisiList: Teknisi[];
  onAssign: (teknisiId: string) => Promise<void>;
}) {
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState("");
  const [sibukIds, setSibukIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !servis) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(servis?.teknisi_id ?? "");
    setWarning("");
    setSibukIds([]);
  }, [open, servis]);

  useEffect(() => {
    if (!open || !servis) return;
    const cekJadwal = async () => {
      // Cek teknisi yang sudah ada jadwal di tanggal_masuk yang sama
      const { data } = await supabase
        .from("servis_workshop")
        .select("teknisi_id")
        .eq("tanggal_masuk", servis.tanggal_masuk)
        .not("id", "eq", servis.id)
        .not("status", "in", '("Dibatalkan","Selesai")');
      setSibukIds(
        (data ?? [])
          .map((d) => d.teknisi_id)
          .filter((id): id is string => !!id)
      );
    };
    cekJadwal();
  }, [open, servis]);

  const tersedia = teknisiList.filter((t) => !sibukIds.includes(t.id));
  const sibuk = teknisiList.filter((t) => sibukIds.includes(t.id));

  const handleSelect = (teknisiId: string) => {
    setSelected(teknisiId);
    if (sibukIds.includes(teknisiId) && servis) {
      setWarning(
        `⚠️ Teknisi ini sudah ada jadwal di tanggal ${formatDate(servis.tanggal_masuk)}. Tetap bisa di-assign.`
      );
    } else {
      setWarning("");
    }
  };

  const handleAssign = async () => {
    if (!selected) return;
    setLoading(true);
    await onAssign(selected);
    setLoading(false);
    onClose();
  };

  if (!open || !servis) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md mx-4 bg-background border border-border rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Pilih Teknisi
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Untuk: {servis.nama} — {formatDate(servis.tanggal_masuk)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <RiCloseLine className="size-5" />
          </button>
        </div>

        <div className="px-6 py-4 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
          {warning && (
            <div className="text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
              {warning}
            </div>
          )}

          {tersedia.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Tersedia
              </p>
              {tersedia.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${
                    selected === t.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="size-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <RiUserLine className="size-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.nama}</p>
                    <p className="text-xs text-muted-foreground">{t.nomor_whatsapp}</p>
                  </div>
                  <span className="ml-auto text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                    Tersedia
                  </span>
                </button>
              ))}
            </div>
          )}

          {sibuk.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Sibuk
              </p>
              {sibuk.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${
                    selected === t.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-border hover:bg-muted opacity-60"
                  }`}
                >
                  <div className="size-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <RiUserLine className="size-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.nama}</p>
                    <p className="text-xs text-muted-foreground">{t.nomor_whatsapp}</p>
                  </div>
                  <span className="ml-auto text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full">
                    Sibuk
                  </span>
                </button>
              ))}
            </div>
          )}

          {teknisiList.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Belum ada data teknisi
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleAssign} disabled={loading || !selected}>
            {loading ? "Menyimpan..." : "Assign Teknisi"}
          </Button>
        </div>
      </div>
    </div>
  );
}

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
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg mx-4 bg-background border border-border rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            {initial.nama ? "Edit Servis" : "Tambah Servis"}
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
                onChange={(e) =>
                  handleChange("jenis_perangkat", e.target.value)
                }
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
                onChange={(e) =>
                  handleChange("target_selesai", e.target.value)
                }
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
                <option key={s} value={s}>
                  {s}
                </option>
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
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            onClick={() => onSave(form)}
            disabled={
              loading ||
              !form.nama ||
              !form.nomor_whatsapp ||
              !form.jenis_perangkat ||
              !form.keluhan ||
              !form.tanggal_masuk
            }
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
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm mx-4 bg-background border border-border rounded-xl shadow-xl p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-foreground">
            Hapus Data Servis
          </h2>
          <p className="text-sm text-muted-foreground">
            Yakin ingin menghapus data servis milik{" "}
            <span className="font-medium text-foreground">
              &quot;{nama}&quot;
            </span>
            ? Tindakan ini tidak bisa dibatalkan.
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

export default function ServisWorkshopPage() {
  const [servisList, setServisList] = useState<Servis[]>([]);
  const [teknisiList, setTeknisiList] = useState<Teknisi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editTarget, setEditTarget] = useState<Servis | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Servis | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Servis | null>(null);

  // Preview foto Tipe/Merk
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: servis }, { data: teknisi }] = await Promise.all([
      supabase
        .from("servis_workshop")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("teknisi").select("*").order("nama"),
    ]);
    setServisList(servis || []);
    setTeknisiList(teknisi || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchData]);

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filtered = servisList.filter((s) => {
    const matchSearch =
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.jenis_perangkat.toLowerCase().includes(search.toLowerCase()) ||
      s.tipe_merk.toLowerCase().includes(search.toLowerCase()) ||
      s.nomor_whatsapp.includes(search) ||
      (s.kode_tracking ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Semua" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // ── Assign Teknisi ─────────────────────────────────────────────────────────

  const handleAssign = async (teknisiId: string) => {
    if (!assignTarget) return;
    const teknisi = teknisiList.find((t) => t.id === teknisiId);
    if (!teknisi) return;

    const kodeTracking =
      assignTarget.kode_tracking ?? generateKodeTracking();

    // Kalau ajuan yang di-assign ulang statusnya sudah "Selesai",
    // status TIDAK direset jadi "Dikonfirmasi" — biarkan tetap "Selesai".
    const statusBaru =
      assignTarget.status === "Selesai" ? "Selesai" : "Dikonfirmasi";

    const { error } = await supabase
      .from("servis_workshop")
      .update({
        teknisi_id: teknisiId,
        status: statusBaru,
        kode_tracking: kodeTracking,
      })
      .eq("id", assignTarget.id);

    if (error) {
      alert("Gagal assign teknisi: " + error.message);
      return;
    }

    // Kirim notifikasi WA ke pelanggan hanya jika status memang
    // baru dikonfirmasi (bukan sekadar ganti teknisi pada servis yang sudah selesai)
    if (statusBaru === "Dikonfirmasi") {
      const pesan =
        buildWhatsAppMessage({
          nama: assignTarget.nama,
          jenis_perangkat: assignTarget.jenis_perangkat,
          tipe_merk: assignTarget.tipe_merk,
          keluhan: assignTarget.keluhan,
          tanggal_masuk: formatDate(assignTarget.tanggal_masuk),
          target_selesai: formatDate(assignTarget.target_selesai),
        }) +
        `\n\nTeknisi yang menangani: *${teknisi.nama}*` +
        `\n\n🔍 *Kode Tracking Status Servis Anda:*\n*${kodeTracking}*\n\nGunakan kode ini untuk memantau status servis di website kami.`;

      sendWhatsApp(assignTarget.nomor_whatsapp, pesan);
    }

    await fetchData();
  };

  // ── Simpan ─────────────────────────────────────────────────────────────────

  const handleSave = async (form: ServisForm) => {
    setModalLoading(true);

    const isNew = !editTarget;
    const needsKode = isNew && form.status === "Dikonfirmasi";

    const payload: Record<string, unknown> = {
      nama: form.nama,
      nomor_whatsapp: form.nomor_whatsapp,
      jenis_perangkat: form.jenis_perangkat,
      tipe_merk: form.tipe_merk,
      keluhan: form.keluhan,
      tanggal_masuk: form.tanggal_masuk,
      target_selesai: form.target_selesai || null,
      status: form.status,
      catatan_admin: form.catatan_admin || null,
    };

    if (needsKode) {
      payload.kode_tracking = generateKodeTracking();
    }

    if (editTarget) {
      const { error } = await supabase
        .from("servis_workshop")
        .update(payload)
        .eq("id", editTarget.id);
      if (error) console.error(error);
    } else {
      const { error } = await supabase
        .from("servis_workshop")
        .insert([payload]);
      if (error) console.error(error);
    }

    await fetchData();
    setModalLoading(false);
    setModalOpen(false);
    setEditTarget(null);
  };

  // ── Update Status ──────────────────────────────────────────────────────────

  const handleStatusChange = async (servis: Servis, newStatus: string) => {
    if (newStatus === servis.status) return;

    const updatePayload: Record<string, unknown> = { status: newStatus };

    // Generate kode tracking saat pertama kali dikonfirmasi
    if (newStatus === "Dikonfirmasi" && !servis.kode_tracking) {
      updatePayload.kode_tracking = generateKodeTracking();
    }

    const { error } = await supabase
      .from("servis_workshop")
      .update(updatePayload)
      .eq("id", servis.id);

    if (error) {
      console.error("Gagal update status:", error);
      return;
    }

    // Kirim WA notifikasi ke pelanggan
    if (newStatus === "Dikonfirmasi") {
      const kode =
        (updatePayload.kode_tracking as string) ??
        servis.kode_tracking ??
        "";
      const pesan =
        buildWhatsAppMessage({
          nama: servis.nama,
          jenis_perangkat: servis.jenis_perangkat,
          tipe_merk: servis.tipe_merk,
          keluhan: servis.keluhan,
          tanggal_masuk: formatDate(servis.tanggal_masuk),
          target_selesai: formatDate(servis.target_selesai),
        }) +
        `\n\n🔍 *Kode Tracking Status Servis Anda:*\n*${kode}*\n\nGunakan kode ini untuk memantau status servis di website kami.`;
      sendWhatsApp(servis.nomor_whatsapp, pesan);
    }

    if (newStatus === "Dibatalkan") {
      const pesan = `Halo ${servis.nama} 👋\n\nMohon maaf, ajuan servis Anda telah *dibatalkan* ❌\n\nDetail servis:\n- *Jenis Perangkat:* ${servis.jenis_perangkat}\n- *Tipe/Merk:* ${servis.tipe_merk}\n- *Keluhan:* ${servis.keluhan}\n\nSilakan hubungi kami untuk informasi lebih lanjut.\n– PT. Kalpa Komputer Bali`;
      sendWhatsApp(servis.nomor_whatsapp, pesan);
    }

    await fetchData();
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
    await fetchData();
    setDeleteLoading(false);
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const openEdit = (servis: Servis) => {
    setEditTarget(servis);
    setModalOpen(true);
  };
  const openDelete = (servis: Servis) => {
    setDeleteTarget(servis);
    setDeleteOpen(true);
  };
  const openAdd = () => {
    setEditTarget(null);
    setModalOpen(true);
  };
  const openPreview = (url: string, title: string) => {
    setPreviewUrl(url);
    setPreviewTitle(title);
    setPreviewOpen(true);
  };

  const getTeknisiNama = (teknisiId: string | null) => {
    if (!teknisiId) return null;
    return teknisiList.find((t) => t.id === teknisiId)?.nama ?? null;
  };

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
            <h1 className="text-xl font-semibold text-foreground">
              Servis Workshop
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Kelola data servis perangkat di workshop
            </p>
          </div>
          <Button onClick={openAdd} className="gap-1.5">
            <RiAddLine className="size-4" />
            Tambah Servis
          </Button>
        </div>

        {/* Filter & Search */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-full max-w-sm">
            <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, perangkat, kode tracking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

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
                <TableHead>Kode Tracking</TableHead>
                <TableHead>Teknisi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="h-32 text-center text-muted-foreground"
                  >
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="h-32 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <RiToolsLine className="size-8 text-muted-foreground/50" />
                      <span>
                        {search || filterStatus !== "Semua"
                          ? "Data tidak ditemukan"
                          : "Belum ada data servis"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((servis) => (
                  <TableRow key={servis.id}>
                    {/* Nama Pelanggan */}
                    <TableCell>
                      <span className="font-medium text-sm text-foreground">
                        {servis.nama}
                      </span>
                    </TableCell>

                    {/* Perangkat */}
                    <TableCell>
                      <span className="text-sm text-foreground">
                        {servis.jenis_perangkat}
                      </span>
                    </TableCell>

                    {/* Tipe/Merk — thumbnail jika berupa foto, teks jika bukan */}
                    <TableCell>
                      {isImageUrl(servis.tipe_merk) ? (
                        <button
                          type="button"
                          onClick={() =>
                            openPreview(
                              servis.tipe_merk,
                              `${servis.nama} — ${servis.jenis_perangkat}`
                            )
                          }
                          className="group relative size-12 rounded-lg overflow-hidden border border-border hover:border-blue-400 transition-colors shrink-0"
                          title="Klik untuk lihat foto"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={servis.tipe_merk}
                            alt="Foto tipe/merk"
                            className="size-full object-cover"
                          />
                          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                            <RiZoomInLine className="size-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>
                        </button>
                      ) : servis.tipe_merk ? (
                        <span className="text-sm text-foreground">
                          {servis.tipe_merk}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                          <RiImageLine className="size-3.5" />
                          Belum ada
                        </span>
                      )}
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
                      <span className="text-sm text-muted-foreground">
                        {servis.nomor_whatsapp}
                      </span>
                    </TableCell>

                    {/* Kode Tracking */}
                    <TableCell>
                      {servis.kode_tracking ? (
                        <span className="font-mono text-xs font-bold tracking-widest text-foreground">
                          {servis.kode_tracking}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Belum ada
                        </span>
                      )}
                    </TableCell>

                    {/* Teknisi */}
                    <TableCell>
                      {getTeknisiNama(servis.teknisi_id) ? (
                        <button
                          onClick={() => {
                            setAssignTarget(servis);
                            setAssignOpen(true);
                          }}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                        >
                          {getTeknisiNama(servis.teknisi_id)}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setAssignTarget(servis);
                            setAssignOpen(true);
                          }}
                          className="text-xs bg-yellow-50 text-yellow-600 border border-yellow-200 px-2 py-1 rounded-lg hover:bg-yellow-100 transition-colors"
                        >
                          + Pilih Teknisi
                        </button>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {servis.status === "Diproses" ||
                      servis.status === "Selesai" ? (
                        // Status ini diupdate oleh teknisi dari dashboard teknisi,
                        // jadi di sisi admin cukup ditampilkan (read-only), tidak diedit di sini.
                        <span
                          className={`inline-block border rounded px-2 py-1 text-xs font-medium ${
                            statusStyle[servis.status] ?? ""
                          }`}
                          title="Status diupdate oleh teknisi dari dashboard teknisi"
                        >
                          {servis.status}
                        </span>
                      ) : (
                        <select
                          value={servis.status}
                          onChange={(e) =>
                            handleStatusChange(servis, e.target.value)
                          }
                          className={`border rounded px-2 py-1 text-xs font-medium focus:outline-none transition-colors cursor-pointer ${
                            statusStyle[servis.status] ?? ""
                          }`}
                        >
                          {getStatusOptions(servis.teknisi_id).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      )}
                    </TableCell>

                    {/* Aksi */}
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
                          <DropdownMenuItem onClick={() => openEdit(servis)}>
                            <RiEditLine className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => openDelete(servis)}
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
            Menampilkan {filtered.length} dari {servisList.length} data servis
          </p>
        )}
      </div>

      {/* Modal Preview Foto Tipe/Merk */}
      <ImagePreviewModal
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewUrl(null);
        }}
        imageUrl={previewUrl}
        title={previewTitle}
      />

      {/* Modal Assign Teknisi */}
      <AssignTeknisiModal
        open={assignOpen}
        onClose={() => {
          setAssignOpen(false);
          setAssignTarget(null);
        }}
        servis={assignTarget}
        teknisiList={teknisiList}
        onAssign={handleAssign}
      />

      <ServisModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTarget(null);
        }}
        onSave={handleSave}
        initial={formInitial}
        loading={modalLoading}
      />

      <DeleteModal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        nama={deleteTarget?.nama ?? ""}
        loading={deleteLoading}
      />
    </>
  );
}