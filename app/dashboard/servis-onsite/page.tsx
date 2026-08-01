"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import {
  RiSearchLine,
  RiMore2Line,
  RiMapPinLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiUserLine,
  RiEditLine,
  RiExternalLinkLine,
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
import { sendWhatsApp } from "@/lib/whatsapp";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServisOnsite {
  id: string;
  nama: string;
  nomor_whatsapp: string;
  alamat: string;
  link_maps: string | null;
  jenis_lokasi: string;
  jenis_perangkat: string;
  jenis_layanan: string;
  keluhan: string;
  tanggal_kunjungan: string;
  status: string;
  teknisi_id: string | null;
  created_at: string;
}

interface Teknisi {
  id: string;
  nama: string;
  nomor_whatsapp: string;
}

interface EditForm {
  nama: string;
  nomor_whatsapp: string;
  alamat: string;
  link_maps: string;
  jenis_lokasi: string;
  jenis_perangkat: string;
  jenis_layanan: string;
  keluhan: string;
  tanggal_kunjungan: string;
}

const emptyEditForm: EditForm = {
  nama: "",
  nomor_whatsapp: "",
  alamat: "",
  link_maps: "",
  jenis_lokasi: "",
  jenis_perangkat: "",
  jenis_layanan: "",
  keluhan: "",
  tanggal_kunjungan: "",
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LIST = [
  "Pilih Teknisi",
  "Dikonfirmasi",
  "Berangkat",
  "Diproses",
  "Selesai",
  "Dibatalkan",
];

const statusStyle: Record<string, string> = {
  "Pilih Teknisi": "bg-yellow-500/10 text-yellow-600",
  Dikonfirmasi: "bg-blue-500/10 text-blue-600",
  Berangkat: "bg-purple-500/10 text-purple-600",
  Diproses: "bg-orange-500/10 text-orange-600",
  Selesai: "bg-green-500/10 text-green-600",
  Dibatalkan: "bg-red-500/10 text-red-600",
};

const JENIS_LOKASI_LIST = ["Rumah", "Kantor", "Toko", "Villa", "Sekolah", "Lainnya"];
const JENIS_PERANGKAT_LIST = ["Laptop", "PC / Komputer", "Printer", "Server", "Lainnya"];
const JENIS_LAYANAN_LIST = ["Perbaikan", "Instalasi", "Maintenance", "Lainnya"];

// Status-status yang dikelola dari dashboard teknisi, bukan dari admin.
// Kalau status ajuan salah satu dari ini, dropdown di admin akan
// menampilkan status ini apa adanya dan di-disable (read-only).
const TEKNISI_MANAGED_STATUSES = ["Berangkat", "Diproses", "Selesai"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Pastikan link maps punya protokol yang valid supaya browser tidak
// menganggapnya relative path (mis. "share.google/xxx" tanpa https://)
function normalizeMapsLink(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

// Opsi status yang ditampilkan ke admin berdasarkan kondisi.
//
// PENTING: kalau status saat ini adalah salah satu status yang dikelola
// teknisi (Berangkat/Diproses/Selesai), status tsb HARUS selalu jadi
// bagian dari daftar opsi. Kalau tidak, <select> React akan di-set
// value ke status yang tidak ada di antara <option>, sehingga browser
// jatuh ke opsi pertama di list (mis. "Dikonfirmasi") — itulah sebabnya
// dashboard admin sebelumnya menampilkan status yang salah dan dropdown
// terasa "macet"/tidak bisa diklik.
function getStatusOptions(servis: ServisOnsite): string[] {
  if (TEKNISI_MANAGED_STATUSES.includes(servis.status)) {
    // Read-only di sisi admin: hanya tampilkan status saat ini.
    return [servis.status];
  }
  if (servis.teknisi_id) {
    // Sudah ada teknisi: admin hanya bisa pilih Dikonfirmasi atau Dibatalkan
    return ["Dikonfirmasi", "Dibatalkan"];
  }
  // Belum ada teknisi: hanya "Pilih Teknisi" dan "Dibatalkan"
  return ["Pilih Teknisi", "Dibatalkan"];
}

function buildKonfirmasiMessage(data: {
  nama: string;
  jenis_perangkat: string;
  jenis_layanan: string;
  keluhan: string;
  tanggal_kunjungan: string;
  alamat: string;
  teknisi_nama: string;
  teknisi_wa: string;
}) {
  return `Halo ${data.nama} 👋

Pengajuan Servis On-Site Anda telah *dikonfirmasi* ✅

Detail layanan:
- *Jenis Perangkat:* ${data.jenis_perangkat}
- *Jenis Layanan:* ${data.jenis_layanan}
- *Keluhan:* ${data.keluhan}
- *Tanggal Kunjungan:* ${formatDate(data.tanggal_kunjungan)}
- *Alamat:* ${data.alamat}

Teknisi yang akan datang:
- *Nama:* ${data.teknisi_nama}
- *WhatsApp:* ${data.teknisi_wa}

Jika ada pertanyaan, silakan hubungi kami. Terima kasih 🙏
– PT. Kalpa Komputer Bali`;
}

function buildStatusUpdateMessage(nama: string, status: string) {
  const pesanStatus: Record<string, string> = {
    Dibatalkan: `Halo ${nama} 👋\n\nMohon maaf, ajuan servis Anda telah *dibatalkan* ❌\n\nSilakan hubungi kami untuk informasi lebih lanjut.\n– PT. Kalpa Komputer Bali`,
  };
  return pesanStatus[status] ?? "";
}

// ─── Modal Edit Ajuan ─────────────────────────────────────────────────────────

function EditAjuanModal({
  open,
  onClose,
  onSave,
  initial,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: EditForm) => Promise<void>;
  initial: EditForm;
  loading: boolean;
}) {
  const [form, setForm] = useState<EditForm>(emptyEditForm);

  useEffect(() => {
    if (!open) return;
    setForm(initial); // eslint-disable-line react-hooks/set-state-in-effect
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (field: keyof EditForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const textareaClass =
    "w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none dark:bg-input/30";
  const selectClass =
    "w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

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
            Edit Ajuan Servis On-Site
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
            <Label htmlFor="edit-nama">Nama Pelanggan</Label>
            <Input
              id="edit-nama"
              placeholder="Nama lengkap"
              value={form.nama}
              onChange={(e) => handleChange("nama", e.target.value)}
            />
          </div>

          {/* Nomor WhatsApp */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-wa">Nomor WhatsApp</Label>
            <Input
              id="edit-wa"
              placeholder="628xxxxxxx"
              value={form.nomor_whatsapp}
              onChange={(e) => handleChange("nomor_whatsapp", e.target.value)}
            />
          </div>

          {/* Alamat */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-alamat">Alamat</Label>
            <textarea
              id="edit-alamat"
              rows={2}
              placeholder="Alamat lengkap"
              value={form.alamat}
              onChange={(e) => handleChange("alamat", e.target.value)}
              className={textareaClass}
            />
          </div>

          {/* Link Maps & Jenis Lokasi */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-maps">Link Google Maps</Label>
              <Input
                id="edit-maps"
                placeholder="https://maps.google.com/..."
                value={form.link_maps}
                onChange={(e) => handleChange("link_maps", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-lokasi">Jenis Lokasi</Label>
              <select
                id="edit-lokasi"
                value={form.jenis_lokasi}
                onChange={(e) => handleChange("jenis_lokasi", e.target.value)}
                className={selectClass}
              >
                <option value="">Pilih lokasi</option>
                {JENIS_LOKASI_LIST.map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Jenis Perangkat & Merk/Tipe */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-perangkat">Jenis Perangkat</Label>
              <select
                id="edit-perangkat"
                value={form.jenis_perangkat}
                onChange={(e) => handleChange("jenis_perangkat", e.target.value)}
                className={selectClass}
              >
                <option value="">Pilih perangkat</option>
                {JENIS_PERANGKAT_LIST.map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Jenis Layanan & Tanggal Kunjungan */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-layanan">Jenis Layanan</Label>
              <select
                id="edit-layanan"
                value={form.jenis_layanan}
                onChange={(e) => handleChange("jenis_layanan", e.target.value)}
                className={selectClass}
              >
                <option value="">Pilih layanan</option>
                {JENIS_LAYANAN_LIST.map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-tanggal">Tanggal Kunjungan</Label>
              <Input
                id="edit-tanggal"
                type="date"
                value={form.tanggal_kunjungan}
                onChange={(e) => handleChange("tanggal_kunjungan", e.target.value)}
              />
            </div>
          </div>

          {/* Keluhan */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-keluhan">Keluhan</Label>
            <textarea
              id="edit-keluhan"
              rows={3}
              placeholder="Deskripsikan keluhan pelanggan..."
              value={form.keluhan}
              onChange={(e) => handleChange("keluhan", e.target.value)}
              className={textareaClass}
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
              !form.alamat ||
              !form.tanggal_kunjungan
            }
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
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
  servis: ServisOnsite | null;
  teknisiList: Teknisi[];
  onAssign: (teknisiId: string) => Promise<void>;
}) {
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState("");
  const [sibukIds, setSibukIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !servis) return;
    setSelected(servis?.teknisi_id ?? ""); // eslint-disable-line react-hooks/set-state-in-effect
    setWarning("");
    setSibukIds([]);
  }, [open, servis]);

  useEffect(() => {
    if (!open || !servis) return;
    const cekJadwal = async () => {
      const { data } = await supabase
        .from("servis_onsite")
        .select("teknisi_id")
        .eq("tanggal_kunjungan", servis.tanggal_kunjungan)
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
        `⚠️ Teknisi ini sudah ada jadwal di tanggal ${formatDate(servis.tanggal_kunjungan)}. Tetap bisa di-assign.`
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
              Untuk: {servis.nama} — {formatDate(servis.tanggal_kunjungan)}
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ServisOnsitePage() {
  const [servisList, setServisList] = useState<ServisOnsite[]>([]);
  const [teknisiList, setTeknisiList] = useState<Teknisi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<ServisOnsite | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ServisOnsite | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ServisOnsite | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: servis }, { data: teknisi }] = await Promise.all([
      supabase
        .from("servis_onsite")
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

  const filtered = servisList.filter((s) => {
    const matchSearch =
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.nomor_whatsapp.includes(search) ||
      s.jenis_perangkat.toLowerCase().includes(search.toLowerCase()) ||
      s.alamat.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "Semua" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // ── Assign teknisi ───────────────────────────────────────────────────────
  const handleAssign = async (teknisiId: string) => {
    if (!assignTarget) return;
    const teknisi = teknisiList.find((t) => t.id === teknisiId);
    if (!teknisi) return;

    const { error } = await supabase
      .from("servis_onsite")
      .update({
        teknisi_id: teknisiId,
        status: "Dikonfirmasi",
      })
      .eq("id", assignTarget.id);

    if (error) {
      alert("Gagal assign teknisi: " + error.message);
      return;
    }

    const pesan = buildKonfirmasiMessage({
      nama: assignTarget.nama,
      jenis_perangkat: assignTarget.jenis_perangkat,
      jenis_layanan: assignTarget.jenis_layanan,
      keluhan: assignTarget.keluhan,
      tanggal_kunjungan: assignTarget.tanggal_kunjungan,
      alamat: assignTarget.alamat,
      teknisi_nama: teknisi.nama,
      teknisi_wa: teknisi.nomor_whatsapp,
    });

    sendWhatsApp(assignTarget.nomor_whatsapp, pesan);
    // Notifikasi WA ke teknisi
    const pesanTeknisi = `Halo ${teknisi.nama} 👋

    Kamu mendapat tugas servis on-site baru! 🔧

    Detail tugas:
    - *Pelanggan:* ${assignTarget.nama}
    - *WhatsApp:* ${assignTarget.nomor_whatsapp}
    - *Jenis Perangkat:* ${assignTarget.jenis_perangkat}
    - *Jenis Layanan:* ${assignTarget.jenis_layanan}
    - *Keluhan:* ${assignTarget.keluhan}
    - *Tanggal Kunjungan:* ${formatDate(assignTarget.tanggal_kunjungan)}
    - *Alamat:* ${assignTarget.alamat}

    Silakan cek dashboard teknisi untuk detail lebih lanjut. Terima kasih 🙏
    – PT. Kalpa Komputer Bali`;

    sendWhatsApp(teknisi.nomor_whatsapp, pesanTeknisi);
    await fetchData();
  };

  // ── Edit ajuan ───────────────────────────────────────────────────────────
  const handleEdit = async (form: EditForm) => {
    if (!editTarget) return;
    setEditLoading(true);
    const { error } = await supabase
      .from("servis_onsite")
      .update({
        nama: form.nama,
        nomor_whatsapp: form.nomor_whatsapp,
        alamat: form.alamat,
        link_maps: form.link_maps || null,
        jenis_lokasi: form.jenis_lokasi,
        jenis_perangkat: form.jenis_perangkat,
        jenis_layanan: form.jenis_layanan,
        keluhan: form.keluhan,
        tanggal_kunjungan: form.tanggal_kunjungan,
      })
      .eq("id", editTarget.id);

    if (error) {
      alert("Gagal menyimpan: " + error.message);
      setEditLoading(false);
      return;
    }

    await fetchData();
    setEditLoading(false);
    setEditOpen(false);
    setEditTarget(null);
  };

  // ── Update status ────────────────────────────────────────────────────────
  const handleUpdateStatus = async (
    servis: ServisOnsite,
    newStatus: string
  ) => {
    const { error } = await supabase
      .from("servis_onsite")
      .update({ status: newStatus })
      .eq("id", servis.id);

    if (error) {
      alert("Gagal update status");
      return;
    }

    // Kirim WA notifikasi untuk status Dibatalkan
    if (newStatus === "Dibatalkan") {
      const pesan = buildStatusUpdateMessage(servis.nama, newStatus);
      if (pesan) sendWhatsApp(servis.nomor_whatsapp, pesan);
    }

    await fetchData();
  };

  // ── Hapus ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    await supabase.from("servis_onsite").delete().eq("id", deleteTarget.id);
    await fetchData();
    setDeleteLoading(false);
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const getTeknisiNama = (teknisiId: string | null) => {
    if (!teknisiId) return null;
    return teknisiList.find((t) => t.id === teknisiId)?.nama ?? null;
  };

  const editInitial: EditForm = editTarget
    ? {
        nama: editTarget.nama,
        nomor_whatsapp: editTarget.nomor_whatsapp,
        alamat: editTarget.alamat,
        link_maps: editTarget.link_maps ?? "",
        jenis_lokasi: editTarget.jenis_lokasi,
        jenis_perangkat: editTarget.jenis_perangkat,
        jenis_layanan: editTarget.jenis_layanan,
        keluhan: editTarget.keluhan,
        tanggal_kunjungan: editTarget.tanggal_kunjungan,
      }
    : emptyEditForm;

  return (
    <>
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Servis On-Site
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola ajuan servis on-site dan penugasan teknisi
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-full max-w-sm">
            <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, perangkat, atau nomor WA..."
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
                <TableHead className="min-w-[200px]">Pelanggan</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead className="min-w-[200px]">Alamat</TableHead>
                <TableHead className="min-w-[140px]">Google Maps</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Perangkat</TableHead>
                <TableHead>Layanan</TableHead>
                <TableHead className="min-w-[200px]">Keluhan</TableHead>
                <TableHead>Tgl Kunjungan</TableHead>
                <TableHead>Teknisi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={13}
                    className="h-32 text-center text-muted-foreground"
                  >
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={13}
                    className="h-32 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <RiMapPinLine className="size-8 text-muted-foreground/50" />
                      <span>
                        {search || filterStatus !== "Semua"
                          ? "Data tidak ditemukan"
                          : "Belum ada ajuan servis on-site"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((servis) => {
                  const mapsHref = normalizeMapsLink(servis.link_maps);
                  const isReadOnlyStatus = TEKNISI_MANAGED_STATUSES.includes(
                    servis.status
                  );
                  return (
                    <TableRow key={servis.id}>
                      <TableCell>
                        <span className="text-xs text-muted-foreground whitespace-normal break-words">
                          {servis.nama}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {servis.nomor_whatsapp}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground whitespace-normal break-words">
                          {servis.alamat}
                        </span>
                      </TableCell>

                      {/* Google Maps — sekarang bisa diklik */}
                      <TableCell>
                        {mapsHref ? (
                          <a
                            href={mapsHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                            title={mapsHref}
                          >
                            <RiMapPinLine className="size-3.5 shrink-0" />
                            Buka Maps
                            <RiExternalLinkLine className="size-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            -
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {servis.jenis_lokasi}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{servis.jenis_perangkat}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{servis.jenis_layanan}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground whitespace-normal break-words">
                          {servis.keluhan}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatDate(servis.tanggal_kunjungan)}
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
                        <select
                          value={servis.status}
                          onChange={(e) =>
                            handleUpdateStatus(servis, e.target.value)
                          }
                          disabled={isReadOnlyStatus}
                          title={
                            isReadOnlyStatus
                              ? "Status ini diupdate dari dashboard teknisi"
                              : undefined
                          }
                          className={`border rounded px-2 py-1 text-xs font-medium focus:outline-none transition-colors ${
                            isReadOnlyStatus
                              ? "cursor-not-allowed opacity-90"
                              : "cursor-pointer"
                          } ${statusStyle[servis.status] ?? ""}`}
                        >
                          {getStatusOptions(servis).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
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
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditTarget(servis);
                                setEditOpen(true);
                              }}
                            >
                              <RiEditLine className="size-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                setDeleteTarget(servis);
                                setDeleteOpen(true);
                              }}
                            >
                              <RiDeleteBinLine className="size-4" />
                              Hapus
                            </DropdownMenuItem>
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

        {!loading && (
          <p className="text-xs text-muted-foreground">
            Menampilkan {filtered.length} dari {servisList.length} ajuan
          </p>
        )}
      </div>

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

      {/* Modal Edit Ajuan */}
      <EditAjuanModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditTarget(null);
        }}
        onSave={handleEdit}
        initial={editInitial}
        loading={editLoading}
      />

      {/* Modal Hapus */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-background border border-border rounded-xl shadow-xl p-6 flex flex-col gap-4">
            <h2 className="text-base font-semibold">Hapus Data Servis</h2>
            <p className="text-sm text-muted-foreground">
              Yakin ingin menghapus data servis milik{" "}
              <span className="font-medium text-foreground">
                &quot;{deleteTarget?.nama}&quot;
              </span>
              ? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(false)}
                disabled={deleteLoading}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Menghapus..." : "Hapus"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}