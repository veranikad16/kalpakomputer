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
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type Jadwal = {
  id: string
  nama: string
  nomor_whatsapp: string
  alamat: string
  link_maps: string | null
  jenis_lokasi: string
  jenis_perangkat: string
  tipe_merk: string
  jenis_layanan: string
  keluhan: string
  tanggal_kunjungan: string
  status: string
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

function isHariIni(dateStr: string) {
  const today = new Date().toISOString().split("T")[0]
  return dateStr === today
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  "Dikonfirmasi": {
    label: "Dikonfirmasi",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <Clock className="h-3.5 w-3.5" />,
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

// Status yang bisa dipilih teknisi
const STATUS_ACTIONS = ["Diproses", "Selesai"]

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
  jadwal,
  onClose,
  onUpdateStatus,
}: {
  jadwal: Jadwal
  onClose: () => void
  onUpdateStatus: (id: string, status: string) => Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  const cfg = STATUS_CONFIG[jadwal.status]

  const handleUpdate = async (status: string) => {
    setLoading(true)
    await onUpdateStatus(jadwal.id, status)
    setLoading(false)
    onClose()
  }

  const waLink = `https://wa.me/${jadwal.nomor_whatsapp.replace(/^0/, "62").replace(/\D/g, "")}`

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-background rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="font-semibold text-foreground">{jadwal.nama}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{formatTanggal(jadwal.tanggal_kunjungan)}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${cfg?.color ?? "bg-gray-100 text-gray-600"}`}>
              {cfg?.icon}
              {jadwal.status}
            </span>
            {isHariIni(jadwal.tanggal_kunjungan) && (
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lokasi</span>
                <span className="font-medium">{jadwal.jenis_lokasi}</span>
              </div>
            </div>
          </div>

          {/* Alamat */}
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

          {/* Detail Servis */}
          <div className="bg-muted/40 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Detail Servis</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Perangkat</span>
                <span className="font-medium">{jadwal.jenis_perangkat}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Merk/Tipe</span>
                <span className="font-medium">{jadwal.tipe_merk}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Layanan</span>
                <span className="font-medium">{jadwal.jenis_layanan}</span>
              </div>
              <div className="pt-1 border-t border-border">
                <p className="text-muted-foreground mb-1">Keluhan</p>
                <p className="font-medium">{jadwal.keluhan}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer — Update Status */}
        {jadwal.status !== "Selesai" && jadwal.status !== "Dibatalkan" && (
          <div className="px-5 py-4 border-t border-border bg-muted/20 space-y-2">
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

  // Fetch jadwal
  const fetchJadwal = async (id: string) => {
    setLoading(true)
    const { data } = await supabase
      .from("servis_onsite")
      .select("*")
      .eq("teknisi_id", id)
      .order("tanggal_kunjungan", { ascending: true })
    setJadwalList(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (teknisiId) fetchJadwal(teknisiId)
  }, [teknisiId])

  // Update status
  const handleUpdateStatus = async (jadwalId: string, status: string) => {
    await supabase.from("servis_onsite").update({ status }).eq("id", jadwalId)
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
    const key = j.tanggal_kunjungan
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
                      key={j.id}
                      onClick={() => setSelectedJadwal(j)}
                      className="w-full bg-background border border-border rounded-xl p-4 text-left hover:bg-muted/40 transition-colors active:scale-[0.99]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{j.nama}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{j.alamat}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {j.jenis_perangkat} · {j.tipe_merk}
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
          onUpdateStatus={async (id, status) => {
            await handleUpdateStatus(id, status)
            setSelectedJadwal(null)
          }}
        />
      )}
    </div>
  )
}