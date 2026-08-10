"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/admin/ui/dialog"
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
import { User, Pencil, Trash2 } from "lucide-react"

type Pelanggan = {
  id: number
  created_at: string
  user_id: string
  nama: string
  email: string
  foto_profil: string | null
  nomor_whatsapp: string
}

// ─── Modal Edit Nomor WhatsApp ─────────────────────────────────────────────

function EditWhatsappModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean
  onClose: () => void
  onSave: (nomor: string) => Promise<void>
  initial: Pelanggan | null
}) {
  const [noWa, setNoWa] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setNoWa(initial?.nomor_whatsapp ?? "")
  }, [open, initial])

  const handleSave = async () => {
    if (!noWa.trim()) return
    setLoading(true)
    await onSave(noWa.trim())
    setLoading(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Nomor WhatsApp</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Pelanggan</Label>
            <p className="text-sm text-muted-foreground">{initial?.nama}</p>
          </div>
          <div className="space-y-1">
            <Label>Nomor WhatsApp</Label>
            <Input
              placeholder="08xxxxxxxxxx"
              value={noWa}
              onChange={(e) => setNoWa(e.target.value)}
            />
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

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PelangganPage() {
  const [pelangganList, setPelangganList] = useState<Pelanggan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [editTarget, setEditTarget] = useState<Pelanggan | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Pelanggan | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const fetchPelanggan = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("pelanggan")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) setPelangganList(data)
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPelanggan()
  }, [])

  const handleSaveWhatsapp = async (nomor: string) => {
    if (!editTarget) return
    await supabase
      .from("pelanggan")
      .update({ nomor_whatsapp: nomor })
      .eq("id", editTarget.id)
    setEditTarget(null)
    await fetchPelanggan()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await supabase.from("pelanggan").delete().eq("id", deleteTarget.id)
    setDeleteTarget(null)
    setDeleteOpen(false)
    await fetchPelanggan()
  }

  const filtered = pelangganList.filter(
    (p) =>
      p.nama?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.nomor_whatsapp?.includes(search)
  )

  const formatTanggal = (dateStr: string) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Akun Pelanggan</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Daftar pelanggan yang mendaftar melalui login Google.
          </p>
        </div>
        <div className="w-full max-w-xs">
          <Input
            placeholder="Cari nama, email, atau WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Nomor WhatsApp</TableHead>
              <TableHead>Terdaftar</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Belum ada pelanggan terdaftar.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {p.foto_profil ? (
                        <img
                          src={p.foto_profil}
                          alt={p.nama}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <span>{p.nama || "-"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{p.email}</TableCell>
                  <TableCell className="text-sm">{p.nomor_whatsapp || "-"}</TableCell>
                  <TableCell className="text-sm">{formatTanggal(p.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex justify-start gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditTarget(p); setEditOpen(true) }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => { setDeleteTarget(p); setDeleteOpen(true) }}
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

      {/* Modal Edit WhatsApp */}
      <EditWhatsappModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveWhatsapp}
        initial={editTarget}
      />

      {/* Confirm Delete */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Akun Pelanggan?</AlertDialogTitle>
            <AlertDialogDescription>
              Data <strong>{deleteTarget?.nama}</strong> akan dihapus permanen dari tabel
              pelanggan. Jika pelanggan login Google lagi, akun baru akan otomatis dibuat
              ulang. Tindakan ini tidak bisa dibatalkan.
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