"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/admin/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/admin/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2, CalendarDays, History, Eye, EyeOff, MapPin, Store } from "lucide-react"

type Teknisi = {
  id: string
  nama: string
  nomor_whatsapp: string
  username: string
  password: string
  email?: string
  created_at: string
}

type JenisJadwal = "workshop" | "onsite"

// supaya penugasan workshop maupun onsite sama-sama muncul di sini.
type Jadwal = {
  id: string
  jenis: JenisJadwal
  nama: string
  nomor_whatsapp: string
  alamat: string | null // hanya onsite
  jenis_lokasi: string | null // hanya onsite
  jenis_perangkat: string
  tipe_merk: string
  jenis_layanan: string | null // hanya onsite
  keluhan: string
  tanggal: string // tanggal_kunjungan (onsite) atau tanggal_masuk (workshop)
  status: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  "Menunggu Konfirmasi": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Dikonfirmasi": "bg-blue-100 text-blue-700 border-blue-200",
  "Diproses": "bg-blue-100 text-blue-700 border-blue-200",
  "Selesai": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Dibatalkan": "bg-gray-100 text-gray-700 border-gray-200",
}

const JENIS_BADGE: Record<JenisJadwal, string> = {
  workshop: "bg-purple-100 text-purple-700 border-purple-200",
  onsite: "bg-cyan-100 text-cyan-700 border-cyan-200",
}

function formatTanggal(dateStr: string) {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
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

// ─── Modal Form Teknisi ───────────────────────────────────────────────────────

function TeknisiFormModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: Partial<Teknisi>) => Promise<void>
  initial?: Teknisi | null
}) {
  const [nama, setNama] = useState("")
  const [noWa, setNoWa] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      const init = () => {
        setNama(initial?.nama ?? "")
        setNoWa(initial?.nomor_whatsapp ?? "")
        setUsername(initial?.username ?? "")
        setPassword(initial?.password ?? "")
        setEmail(initial?.email ?? "")
        setShowPassword(false)
      }
      init()
    }
  }, [open, initial])

  const handleSave = async () => {
    if (!nama.trim() || !noWa.trim() || !username.trim() || !password.trim()) return
    setLoading(true)
    await onSave({
      nama: nama.trim(),
      nomor_whatsapp: noWa.trim(),
      username: username.trim(),
      password: password.trim(),
      email: email.trim() || undefined,
    })
    setLoading(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Teknisi" : "Tambah Teknisi"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Nama Teknisi</Label>
            <Input
              placeholder="Nama lengkap"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Nomor WhatsApp</Label>
            <Input
              placeholder="08xxxxxxxxxx"
              value={noWa}
              onChange={(e) => setNoWa(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Username</Label>
            <Input
              placeholder="username login"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="password login"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Modal Detail Teknisi ─────────────────────────────────────────────────────

function TeknisiDetailModal({
  open,
  onClose,
  teknisi,
  tugasList,
}: {
  open: boolean
  onClose: () => void
  teknisi: Teknisi | null
  tugasList: Jadwal[]
}) {
  if (!teknisi) return null

  const grouped: Record<string, Jadwal[]> = {}
  tugasList.forEach((t) => {
    const key = t.tanggal
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(t)
  })
  const sortedDates = Object.keys(grouped).sort()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Teknisi — {teknisi.nama}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="penugasan">
          <TabsList className="w-full">
            <TabsTrigger value="penugasan" className="flex-1 gap-1">
              <CalendarDays className="h-4 w-4" /> Penugasan
            </TabsTrigger>
            <TabsTrigger value="riwayat" className="flex-1 gap-1">
              <History className="h-4 w-4" /> Riwayat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="penugasan" className="mt-4 space-y-4">
            {sortedDates.filter((date) =>
              grouped[date].some((t) => t.status !== "Selesai" && t.status !== "Dibatalkan")
            ).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada penugasan aktif.
              </p>
            ) : (
              sortedDates
                .filter((date) =>
                  grouped[date].some((t) => t.status !== "Selesai" && t.status !== "Dibatalkan")
                )
                .map((date) => (
                  <div key={date}>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      {formatTanggal(date)}
                    </p>
                    <div className="space-y-2">
                      {grouped[date]
                        .filter((t) => t.status !== "Selesai" && t.status !== "Dibatalkan")
                        .map((t) => <ServisCard key={`${t.jenis}-${t.id}`} servis={t} />)}
                    </div>
                  </div>
                ))
            )}
          </TabsContent>

          <TabsContent value="riwayat" className="mt-4 space-y-4">
            {tugasList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada riwayat servis.
              </p>
            ) : (
              sortedDates.map((date) => (
                <div key={date}>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {formatTanggal(date)}
                  </p>
                  <div className="space-y-2">
                    {grouped[date].map((t) => <ServisCard key={`${t.jenis}-${t.id}`} servis={t} />)}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function ServisCard({ servis }: { servis: Jadwal }) {
  return (
    <div className="border rounded-lg p-3 text-sm space-y-1.5 bg-muted/30">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{servis.nama}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${JENIS_BADGE[servis.jenis]}`}
          >
            {servis.jenis === "onsite" ? (
              <MapPin className="h-2.5 w-2.5" />
            ) : (
              <Store className="h-2.5 w-2.5" />
            )}
            {servis.jenis === "onsite" ? "Onsite" : "Workshop"}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
              STATUS_COLORS[servis.status] ?? "bg-gray-100 text-gray-700"
            }`}
          >
            {servis.status}
          </span>
        </div>
      </div>
      <p className="text-muted-foreground">
        {servis.jenis === "onsite" ? servis.alamat : "Servis di workshop"}
      </p>
      <p className="text-muted-foreground">
        {servis.jenis_perangkat} ·{" "}
        {isImageUrl(servis.tipe_merk) ? "Foto tipe/merk" : servis.tipe_merk}
        {servis.jenis_layanan ? ` · ${servis.jenis_layanan}` : ""}
      </p>
      <p className="text-muted-foreground italic">{servis.keluhan}</p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ManajemenTeknisiPage() {
  const [teknisiList, setTeknisiList] = useState<Teknisi[]>([])
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Teknisi | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<Teknisi | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [detailTarget, setDetailTarget] = useState<Teknisi | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailTugas, setDetailTugas] = useState<Jadwal[]>([])
  const [detailLoading, setDetailLoading] = useState(false)

  // Password visibility per row
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({})
  const togglePassword = (id: string) =>
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }))

  const fetchTeknisi = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("teknisi")
      .select("*")
      .order("created_at", { ascending: false })
    if (!error && data) setTeknisiList(data)
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTeknisi()
  }, [])

  const handleSave = async (formData: Partial<Teknisi>) => {
    if (editTarget) {
      await supabase.from("teknisi").update(formData).eq("id", editTarget.id)
    } else {
      await supabase.from("teknisi").insert([formData])
    }
    await fetchTeknisi()
    setEditTarget(null)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await supabase.from("teknisi").delete().eq("id", deleteTarget.id)
    setDeleteTarget(null)
    setDeleteOpen(false)
    await fetchTeknisi()
  }

  // Ambil penugasan teknisi dari KEDUA tabel (servis_workshop & servis_onsite)
  // dan gabungkan jadi satu list dengan diskriminator `jenis`, sama seperti
  // pola yang dipakai di dashboard teknisi (TeknisiPage). Sebelumnya di sini
  // hanya query ke servis_onsite, makanya penugasan workshop tidak muncul.
  const handleOpenDetail = async (teknisi: Teknisi) => {
    setDetailTarget(teknisi)
    setDetailOpen(true)
    setDetailLoading(true)

    const [workshopRes, onsiteRes] = await Promise.all([
      supabase
        .from("servis_workshop")
        .select("*")
        .eq("teknisi_id", teknisi.id)
        .order("tanggal_masuk", { ascending: true }),
      supabase
        .from("servis_onsite")
        .select("*")
        .eq("teknisi_id", teknisi.id)
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
      jenis_lokasi: null,
      jenis_perangkat: s.jenis_perangkat,
      tipe_merk: s.tipe_merk,
      jenis_layanan: null,
      keluhan: s.keluhan,
      tanggal: s.tanggal_masuk,
      status: s.status,
    }))

    const onsiteJadwal: Jadwal[] = (onsiteRes.data ?? []).map((s) => ({
      id: s.id,
      jenis: "onsite",
      nama: s.nama,
      nomor_whatsapp: s.nomor_whatsapp,
      alamat: s.alamat,
      jenis_lokasi: s.jenis_lokasi,
      jenis_perangkat: s.jenis_perangkat,
      tipe_merk: s.tipe_merk,
      jenis_layanan: s.jenis_layanan,
      keluhan: s.keluhan,
      tanggal: s.tanggal_kunjungan,
      status: s.status,
    }))

    const gabungan = [...workshopJadwal, ...onsiteJadwal].sort((a, b) =>
      a.tanggal.localeCompare(b.tanggal)
    )

    setDetailTugas(gabungan)
    setDetailLoading(false)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Teknisi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola data teknisi, penugasan, dan riwayat servis.
          </p>
        </div>
        <Button onClick={() => { setEditTarget(null); setFormOpen(true) }} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Teknisi
        </Button>
      </div>

      {/* Tabel */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Nomor WhatsApp</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Penugasan</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : teknisiList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Belum ada data teknisi.
                </TableCell>
              </TableRow>
            ) : (
              teknisiList.map((t) => (
                <TableRow key={t.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{t.nama}</TableCell>
                  <TableCell>{t.nomor_whatsapp}</TableCell>
                  <TableCell className="text-sm">{t.username}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">
                        {visiblePasswords[t.id] ? t.password : "••••••••"}
                      </span>
                      <button
                        onClick={() => togglePassword(t.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {visiblePasswords[t.id]
                          ? <EyeOff className="h-3.5 w-3.5" />
                          : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{t.email ?? "-"}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleOpenDetail(t)}
                      className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <CalendarDays className="h-4 w-4" />
                    </button>
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex justify-start gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditTarget(t); setFormOpen(true) }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => { setDeleteTarget(t); setDeleteOpen(true) }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal Form */}
      <TeknisiFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initial={editTarget}
      />

      {/* Modal Detail */}
      <TeknisiDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        teknisi={detailTarget}
        tugasList={detailLoading ? [] : detailTugas}
      />

      {/* Confirm Delete */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Teknisi?</AlertDialogTitle>
            <AlertDialogDescription>
              Data <strong>{deleteTarget?.nama}</strong> akan dihapus permanen. Tindakan ini
              tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}