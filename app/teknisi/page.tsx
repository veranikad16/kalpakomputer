"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  Phone,
  ChevronRight,
  CalendarDays,
  LogOut,
  X,
  Wrench,
  Clock,
  CheckCircle2,
  XCircle,
  Store,
  HourglassIcon,
  Ban,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type JenisJadwal = "workshop" | "onsite"
type ApprovalStatus = "menunggu" | "disetujui" | "ditolak" | null

// Bentuk gabungan (unified) dari servis_workshop & servis_onsite,
// supaya dashboard teknisi bisa menampilkan keduanya dalam satu list.
type Jadwal = {
  id: string
  jenis: JenisJadwal
  nama: string
  nomor_whatsapp: string
  alamat: string | null
  link_maps: string | null
  jenis_lokasi: string | null
  jenis_perangkat: string
  tipe_merk: string
  jenis_layanan: string | null
  keluhan: string
  tanggal: string // tanggal_kunjungan (onsite) atau tanggal_masuk (workshop)
  target_selesai: string | null // hanya untuk workshop
  status: string
  kode_tracking: string | null
  estimasi_biaya: number | null
  catatan_perbaikan: string | null
  approval_status: ApprovalStatus
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTanggal(dateStr: string) {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

function isHariIni(dateStr: string) {
  const today = new Date().toISOString().split("T")[0]
  return dateStr === today
}

function isImageUrl(value: string) {
  if (!value) return false
  const trimmed = value.trim()
  if (!/^https?:\/\//i.test(trimmed)) return false
  return (
    /\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i.test(trimmed) ||
    trimmed.includes("/storage/v1/object/")
  )
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  "Dikonfirmasi": {
    label: "Dikonfirmasi",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  "Menunggu Persetujuan": {
    label: "Menunggu Persetujuan",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: <HourglassIcon className="h-3.5 w-3.5" />,
  },
  "Disetujui": {
    label: "Disetujui",
    color: "bg-teal-100 text-teal-700 border-teal-200",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  "Diproses": {
    label: "Diproses",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: <Wrench className="h-3.5 w-3.5" />,
  },
  "Selesai": {
    label: "Selesai",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  "Dibatalkan": {
    label: "Dibatalkan",
    color: "bg-gray-100 text-gray-500 border-gray-200",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
}

const JENIS_BADGE: Record<JenisJadwal, string> = {
  workshop: "bg-purple-100 text-purple-700 border-purple-200",
  onsite: "bg-cyan-100 text-cyan-700 border-cyan-200",
}

// ─── Form Input Estimasi ───────────────────────────────────────────────────────

function FormEstimasi({
  jadwal,
  onSubmit,
}: {
  jadwal: Jadwal
  onSubmit: (estimasiBiaya: number, catatan: string) => Promise<void>
}) {
  const [estimasiBiaya, setEstimasiBiaya] = useState("")
  const [catatan, setCatatan] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    const angka = Number(estimasiBiaya.replace(/\D/g, ""))
    if (!angka || angka <= 0) {
      setError("Estimasi biaya wajib diisi dengan angka yang valid")
      return
    }
    if (!catatan.trim()) {
      setError("Catatan perbaikan wajib diisi")
      return
    }

    setError("")
    setLoading(true)
    await onSubmit(angka, catatan.trim())
    setLoading(false)
  }

  return (
    <div className="bg-muted/40 rounded-xl p-4 space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Input Estimasi Biaya
      </p>
      <p className="text-xs text-muted-foreground -mt-1">
        Setelah perangkat dicek, masukkan estimasi biaya & catatan perbaikan. Pelanggan akan
        diminta konfirmasi lanjut/tidak sebelum servis diproses.
      </p>

      <div>
        <label className="text-xs text-muted-foreground">Estimasi Biaya (Rp)</label>
        <input
          type="text"
          inputMode="numeric"
          value={estimasiBiaya}
          onChange={(e) => setEstimasiBiaya(e.target.value)}
          placeholder="Contoh: 250000"
          className="w-full border border-border rounded-lg px-3 py-2 mt-1 text-sm bg-background"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Catatan Perbaikan</label>
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Contoh: Ganti SSD 256GB, kerusakan pada port charging..."
          rows={3}
          className="w-full border border-border rounded-lg px-3 py-2 mt-1 text-sm bg-background"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? "Mengirim..." : "Kirim Estimasi ke Pelanggan"}
      </Button>
    </div>
  )
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
  jadwal,
  onClose,
  onUpdateStatus,
  onSubmitEstimasi,
}: {
  jadwal: Jadwal
  onClose: () => void
  onUpdateStatus: (jadwal: Jadwal, status: string) => Promise<void>
  onSubmitEstimasi: (jadwal: Jadwal, estimasiBiaya: number, catatan: string) => Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  const cfg = STATUS_CONFIG[jadwal.status]
  const isOnsite = jadwal.jenis === "onsite"

  const handleUpdate = async (status: string) => {
    setLoading(true)
    await onUpdateStatus(jadwal, status)
    setLoading(false)
    onClose()
  }

  const handleSubmitEstimasi = async (estimasiBiaya: number, catatan: string) => {
    await onSubmitEstimasi(jadwal, estimasiBiaya, catatan)
    onClose()
  }

  const waLink = `https://wa.me/${jadwal.nomor_whatsapp.replace(/^0/, "62").replace(/\D/g, "")}`

  // Servis workshop butuh alur estimasi & approval. Servis onsite tetap alur lama.
  const perluEstimasi = jadwal.jenis === "workshop"
  const belumAdaEstimasi = perluEstimasi && !jadwal.approval_status

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-background rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="font-semibold text-foreground">{jadwal.nama}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{formatTanggal(jadwal.tanggal)}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Status & jenis */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${cfg?.color ?? "bg-gray-100 text-gray-600"}`}>
              {cfg?.icon}
              {jadwal.status}
            </span>
            <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${JENIS_BADGE[jadwal.jenis]}`}>
              {jadwal.jenis === "onsite" ? <MapPin className="h-3.5 w-3.5" /> : <Store className="h-3.5 w-3.5" />}
              {jadwal.jenis === "onsite" ? "Onsite" : "Workshop"}
            </span>
            {isHariIni(jadwal.tanggal) && (
              <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-full font-medium">
                Hari Ini
              </span>
            )}
          </div>

          {/* Info Pelanggan */}
          <div className="bg-muted/40 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Info Pelanggan</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nama</span>
                <span className="font-medium">{jadwal.nama}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">WhatsApp</span>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-emerald-600 font-medium"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Hubungi
                </a>
              </div>
              {isOnsite && jadwal.jenis_lokasi && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lokasi</span>
                  <span className="font-medium">{jadwal.jenis_lokasi}</span>
                </div>
              )}
            </div>
          </div>

          {/* Alamat — hanya untuk onsite */}
          {isOnsite ? (
            <div className="bg-muted/40 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Alamat</p>
              <p className="text-sm">{jadwal.alamat}</p>
              {jadwal.link_maps && (
                <a
                  href={jadwal.link_maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 mt-2 text-sm text-blue-600 font-medium"
                >
                  <MapPin className="h-4 w-4" />
                  Buka di Google Maps
                </a>
              )}
            </div>
          ) : (
            /* Info workshop — tanggal masuk, target selesai, kode tracking */
            <div className="bg-muted/40 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Info Workshop</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal Masuk</span>
                  <span className="font-medium">{formatTanggal(jadwal.tanggal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target Selesai</span>
                  <span className="font-medium">
                    {jadwal.target_selesai ? formatTanggal(jadwal.target_selesai) : "-"}
                  </span>
                </div>
                {jadwal.kode_tracking && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kode Tracking</span>
                    <span className="font-mono font-bold tracking-widest">{jadwal.kode_tracking}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Detail Servis */}
          <div className="bg-muted/40 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Detail Servis</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Perangkat</span>
                <span className="font-medium">{jadwal.jenis_perangkat}</span>
              </div>
              <div className="flex justify-between items-center gap-3">
                <span className="text-muted-foreground shrink-0">Merk/Tipe</span>
                {isImageUrl(jadwal.tipe_merk) ? (
                  <a
                    href={jadwal.tipe_merk}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={jadwal.tipe_merk}
                      alt="Foto tipe/merk"
                      className="size-10 rounded-lg object-cover border border-border"
                    />
                  </a>
                ) : (
                  <span className="font-medium text-right">{jadwal.tipe_merk}</span>
                )}
              </div>
              {jadwal.jenis_layanan && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Layanan</span>
                  <span className="font-medium">{jadwal.jenis_layanan}</span>
                </div>
              )}
              <div className="pt-1 border-t border-border">
                <p className="text-muted-foreground mb-1">Keluhan</p>
                <p className="font-medium">{jadwal.keluhan}</p>
              </div>
            </div>
          </div>

          {/* Estimasi biaya & catatan perbaikan — kalau sudah pernah diinput */}
          {perluEstimasi && jadwal.approval_status && (
            <div className="bg-muted/40 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Estimasi Biaya
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimasi Biaya</span>
                  <span className="font-semibold">
                    {jadwal.estimasi_biaya ? formatRupiah(jadwal.estimasi_biaya) : "-"}
                  </span>
                </div>
                <div className="pt-1 border-t border-border">
                  <p className="text-muted-foreground mb-1">Catatan Perbaikan</p>
                  <p className="font-medium">{jadwal.catatan_perbaikan}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form input estimasi — hanya kalau workshop & belum pernah diinput */}
          {belumAdaEstimasi && (
            <FormEstimasi jadwal={jadwal} onSubmit={handleSubmitEstimasi} />
          )}
        </div>

        {/* Footer — Update Status */}
        {jadwal.status !== "Selesai" && jadwal.status !== "Dibatalkan" && !belumAdaEstimasi && (
          <div className="px-5 py-4 border-t border-border bg-muted/20 space-y-2">
            {perluEstimasi && jadwal.approval_status === "menunggu" && (
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-sm">
                <HourglassIcon className="h-4 w-4 shrink-0" />
                Menunggu konfirmasi pelanggan (lanjut/tidak)
              </div>
            )}

            {perluEstimasi && jadwal.approval_status === "ditolak" && (
              <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm">
                <Ban className="h-4 w-4 shrink-0" />
                Pelanggan membatalkan servis ini
              </div>
            )}

            {(!perluEstimasi || jadwal.approval_status === "disetujui") && (
              <>
                <p className="text-xs text-muted-foreground mb-2">Update status:</p>
                {jadwal.status === "Diproses" ? (
                  <Button
                    onClick={() => handleUpdate("Selesai")}
                    disabled={loading}
                    variant="default"
                    className="w-full"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Selesai
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleUpdate("Diproses")}
                    disabled={loading}
                    variant="default"
                    className="w-full"
                  >
                    <Wrench className="h-4 w-4 mr-1.5" />
                    Diproses
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TeknisiPage() {
  const router = useRouter()
  const [teknisiId, setTeknisiId] = useState<string | null>(null)
  const [teknisiNama, setTeknisiNama] = useState<string>("")
  const [jadwalList, setJadwalList] = useState<Jadwal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJadwal, setSelectedJadwal] = useState<Jadwal | null>(null)
  const [filterTab, setFilterTab] = useState<"aktif" | "semua">("aktif")

  // Cek session
  useEffect(() => {
    const id = localStorage.getItem("teknisi_id")
    const nama = localStorage.getItem("teknisi_nama")
    if (!id) {
      router.replace("/login-teknisi")
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTeknisiId(id)
    setTeknisiNama(nama ?? "")
  }, [router])

  // Fetch jadwal — gabungan dari servis_workshop & servis_onsite
  const fetchJadwal = async (id: string) => {
    setLoading(true)

    const [workshopRes, onsiteRes] = await Promise.all([
      supabase
        .from("servis_workshop")
        .select("*")
        .eq("teknisi_id", id)
        .order("tanggal_masuk", { ascending: true }),
      supabase
        .from("servis_onsite")
        .select("*")
        .eq("teknisi_id", id)
        .order("tanggal_kunjungan", { ascending: true }),
    ])

    if (workshopRes.error) console.error("Gagal ambil servis_workshop:", workshopRes.error)
    if (onsiteRes.error) console.error("Gagal ambil servis_onsite:", onsiteRes.error)

    const workshopJadwal: Jadwal[] = (workshopRes.data ?? []).map((s) => ({
      id: s.id,
      jenis: "workshop",
      nama: s.nama,
      nomor_whatsapp: s.nomor_whatsapp,
      alamat: null,
      link_maps: null,
      jenis_lokasi: null,
      jenis_perangkat: s.jenis_perangkat,
      tipe_merk: s.tipe_merk,
      jenis_layanan: null,
      keluhan: s.keluhan,
      tanggal: s.tanggal_masuk,
      target_selesai: s.target_selesai,
      status: s.status,
      kode_tracking: s.kode_tracking,
      estimasi_biaya: s.estimasi_biaya ?? null,
      catatan_perbaikan: s.catatan_perbaikan ?? null,
      approval_status: s.approval_status ?? null,
    }))

    const onsiteJadwal: Jadwal[] = (onsiteRes.data ?? []).map((s) => ({
      id: s.id,
      jenis: "onsite",
      nama: s.nama,
      nomor_whatsapp: s.nomor_whatsapp,
      alamat: s.alamat,
      link_maps: s.link_maps ?? null,
      jenis_lokasi: s.jenis_lokasi,
      jenis_perangkat: s.jenis_perangkat,
      tipe_merk: s.tipe_merk,
      jenis_layanan: s.jenis_layanan,
      keluhan: s.keluhan,
      tanggal: s.tanggal_kunjungan,
      target_selesai: null,
      status: s.status,
      kode_tracking: s.kode_tracking ?? null,
      estimasi_biaya: null,
      catatan_perbaikan: null,
      approval_status: null,
    }))

    const gabungan = [...workshopJadwal, ...onsiteJadwal].sort((a, b) =>
      a.tanggal.localeCompare(b.tanggal)
    )

    setJadwalList(gabungan)
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (teknisiId) fetchJadwal(teknisiId)
  }, [teknisiId])

  // Update status manual (dipakai untuk "Diproses" & "Selesai")
  const handleUpdateStatus = async (jadwal: Jadwal, status: string) => {
    const table = jadwal.jenis === "workshop" ? "servis_workshop" : "servis_onsite"
    const { error } = await supabase.from(table).update({ status }).eq("id", jadwal.id)
    if (error) {
      console.error(`Gagal update status ${table}:`, error)
      return
    }
    if (teknisiId) await fetchJadwal(teknisiId)
  }

  // Submit estimasi biaya & catatan perbaikan — status otomatis jadi "Menunggu Persetujuan"
  const handleSubmitEstimasi = async (
    jadwal: Jadwal,
    estimasiBiaya: number,
    catatan: string
  ) => {
    const { error } = await supabase
      .from("servis_workshop")
      .update({
        estimasi_biaya: estimasiBiaya,
        catatan_perbaikan: catatan,
        approval_status: "menunggu",
        status: "Menunggu Persetujuan",
      })
      .eq("id", jadwal.id)

    if (error) {
      console.error("Gagal kirim estimasi:", error)
      alert("Gagal mengirim estimasi. Coba lagi.")
      return
    }

    // TODO: trigger notifikasi WhatsApp ke pelanggan di sini kalau sudah ada fungsinya
    if (teknisiId) await fetchJadwal(teknisiId)
  }

  const handleLogout = () => {
    localStorage.removeItem("teknisi_id")
    localStorage.removeItem("teknisi_nama")
    router.replace("/login-teknisi")
  }

  // Filter
  const filtered = jadwalList.filter((j) =>
    filterTab === "aktif"
      ? j.status !== "Selesai" && j.status !== "Dibatalkan"
      : true
  )

  // Kelompokkan per tanggal
  const grouped: Record<string, Jadwal[]> = {}
  filtered.forEach((j) => {
    const key = j.tanggal
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(j)
  })
  const sortedDates = Object.keys(grouped).sort()

  if (!teknisiId) return null

  return (
    <div className="min-h-screen bg-muted/20 max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-background border-b border-border px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-foreground">Jadwal Saya</h1>
            <p className="text-xs text-muted-foreground">Halo, {teknisiNama} 👋</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Keluar
          </button>
        </div>

        {/* Tab filter */}
        <div className="flex gap-2 mt-3">
          {(["aktif", "semua"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                filterTab === tab
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border"
              }`}
            >
              {tab === "aktif" ? "Aktif" : "Semua"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-6">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Memuat jadwal...</div>
        ) : sortedDates.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <CalendarDays className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <p className="text-sm text-muted-foreground">Tidak ada jadwal{filterTab === "aktif" ? " aktif" : ""}.</p>
          </div>
        ) : (
          sortedDates.map((date) => (
            <div key={date}>
              {/* Tanggal header */}
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {formatTanggal(date)}
                </p>
                {isHariIni(date) && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full font-medium">
                    Hari Ini
                  </span>
                )}
              </div>

              {/* List jadwal */}
              <div className="space-y-2">
                {grouped[date].map((j) => {
                  const cfg = STATUS_CONFIG[j.status]
                  return (
                    <button
                      key={`${j.jenis}-${j.id}`}
                      onClick={() => setSelectedJadwal(j)}
                      className="w-full bg-background border border-border rounded-xl p-4 text-left hover:bg-muted/40 transition-colors active:scale-[0.99]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${JENIS_BADGE[j.jenis]}`}>
                              {j.jenis === "onsite" ? <MapPin className="h-2.5 w-2.5" /> : <Store className="h-2.5 w-2.5" />}
                              {j.jenis === "onsite" ? "Onsite" : "Workshop"}
                            </span>
                          </div>
                          <p className="font-medium text-sm text-foreground truncate">{j.nama}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {j.jenis === "onsite" ? j.alamat : "Servis di workshop"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {j.jenis_perangkat} · {isImageUrl(j.tipe_merk) ? "Foto tipe/merk" : j.tipe_merk}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${cfg?.color ?? "bg-gray-100 text-gray-600"}`}>
                            {cfg?.icon}
                            {j.status}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedJadwal && (
        <DetailModal
          jadwal={selectedJadwal}
          onClose={() => setSelectedJadwal(null)}
          onUpdateStatus={handleUpdateStatus}
          onSubmitEstimasi={handleSubmitEstimasi}
        />
      )}
    </div>
  )
}