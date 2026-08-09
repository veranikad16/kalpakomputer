"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RiCloseLine, RiLoader4Line, RiCheckLine, RiYoutubeLine, RiExternalLinkLine, RiUpload2Line, RiImageLine } from "@remixicon/react";
import { supabase } from "@/lib/supabase";

interface PopupServisProps {
  isOpen: boolean;
  onClose: () => void;
}

const JENIS_PERANGKAT = ["Laptop", "PC / Komputer", "Printer", "Server", "Jaringan", "Lainnya"];
const YOUTUBE_URL = "https://www.youtube.com/watch?v=0BtBo__Mu_4";

const emptyForm = {
  nama: "",
  nomor_whatsapp: "",
  jenis_perangkat: "",
  jenis_perangkat_lainnya: "",
  keluhan: "",
  tanggal_masuk: "",
  target_selesai: "",
};

export function PopupServis({ isOpen, onClose }: PopupServisProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showYoutube, setShowYoutube] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  // Foto tipe/merk
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const removeFoto = () => {
    if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    setFotoFile(null);
    setFotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload foto tipe/merk jika ada
      let fotoUrl: string | null = null;
      if (fotoFile) {
        setUploadingFoto(true);
        const formDataUpload = new FormData();
        formDataUpload.append("file", fotoFile);
        let res: Response;
        try {
          res = await fetch("/api/upload", { method: "POST", body: formDataUpload });
          const json = await res.json();
          fotoUrl = json.url || null;
        } catch {
          setUploadingFoto(false);
          setLoading(false);
          setErrorMsg("Gagal mengupload foto. Coba gunakan foto dengan ukuran lebih kecil.");
          return;
        }
        setUploadingFoto(false);
      }

      const jenis_perangkat =
        formData.jenis_perangkat === "Lainnya" && formData.jenis_perangkat_lainnya.trim()
          ? formData.jenis_perangkat_lainnya.trim()
          : formData.jenis_perangkat;

      const { error } = await supabase.from("servis_workshop").insert({
        nama: formData.nama,
        nomor_whatsapp: formData.nomor_whatsapp,
        jenis_perangkat,
        tipe_merk: fotoUrl || null,
        keluhan: formData.keluhan,
        tanggal_masuk: formData.tanggal_masuk,
        target_selesai: formData.target_selesai,
      });

      if (error) throw error;
      // Kirim notifikasi email ke admin
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "workshop",
          data: {
            nama: formData.nama,
            nomor_whatsapp: formData.nomor_whatsapp,
            jenis_perangkat,
            keluhan: formData.keluhan,
            tanggal_masuk: formData.tanggal_masuk,
            target_selesai: formData.target_selesai,
          },
        }),
      });
      setSuccess(true);
    } catch {
      console.error("Error submitting form");
      setUploadingFoto(false);
      setErrorMsg("Gagal mengirim pengajuan. Periksa koneksi internet Anda dan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setErrorMsg(null);
    setShowYoutube(false);
    setFormData(emptyForm);
    removeFoto();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div
        className={`relative bg-white rounded-xl w-full max-h-[90vh] overflow-y-auto m-4 ${
          success || errorMsg ? "max-w-sm" : "max-w-2xl"
        }`}
      >
        {!success && !errorMsg && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
          >
            <RiCloseLine className="w-6 h-6 text-gray-500" />
          </button>
        )}

        {!success && !errorMsg && (
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-[#1E3A5F] text-center">Ajukan Servis Workshop</h2>
          </div>
        )}

        {/* SUCCESS POPUP */}
        {success ? (
          <div className="flex flex-col items-center justify-center text-center px-6 py-8 gap-3">
            <div className="bg-green-100 rounded-full p-3">
              <RiCheckLine className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-base font-bold text-gray-800">Terima Kasih!</h3>
            <p className="text-gray-500 text-xs max-w-xs">
              Pengajuan servis Anda telah berhasil dikirim. Tim kami akan segera menghubungi Anda melalui WhatsApp untuk konfirmasi.
            </p>
            <Button
              onClick={handleClose}
              className="mt-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 text-sm"
            >
              Tutup
            </Button>
          </div>
        ) : errorMsg ? (
          /* ERROR POPUP */
          <div className="flex flex-col items-center justify-center text-center px-6 py-8 gap-3">
            <div className="bg-red-100 rounded-full p-3">
              <RiCloseLine className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-800">Pengajuan Gagal</h3>
            <p className="text-gray-500 text-xs max-w-xs">{errorMsg}</p>
            <Button
              onClick={() => setErrorMsg(null)}
              className="mt-1 bg-red-500 hover:bg-red-600 text-white px-6 text-sm"
            >
              Coba Lagi
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">

            {/* Nama */}
            <div>
              <Label htmlFor="nama">Nama Pelanggan *</Label>
              <Input
                id="nama"
                placeholder="Nama Lengkap"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            {/* No WA */}
            <div>
              <Label htmlFor="nomor_whatsapp">Nomor WhatsApp *</Label>
              <Input
                id="nomor_whatsapp"
                placeholder="08xxxxxxxxxx"
                value={formData.nomor_whatsapp}
                onChange={(e) => setFormData({ ...formData, nomor_whatsapp: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            {/* Jenis Perangkat */}
            <div>
              <Label htmlFor="jenis_perangkat">Jenis Perangkat *</Label>
              <select
                id="jenis_perangkat"
                value={formData.jenis_perangkat}
                onChange={(e) => setFormData({ ...formData, jenis_perangkat: e.target.value, jenis_perangkat_lainnya: "" })}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm"
              >
                <option value="">Pilih jenis perangkat</option>
                {JENIS_PERANGKAT.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              {formData.jenis_perangkat === "Lainnya" && (
                <Input
                  placeholder="Sebutkan jenis perangkat..."
                  value={formData.jenis_perangkat_lainnya}
                  onChange={(e) => setFormData({ ...formData, jenis_perangkat_lainnya: e.target.value })}
                  required
                  className="mt-2"
                />
              )}
            </div>

            {/* Foto Tipe/Merk */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Foto Tipe / Merk Perangkat *</Label>
                <button
                  type="button"
                  onClick={() => setShowYoutube(!showYoutube)}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                >
                  <RiYoutubeLine className="w-4 h-4" />
                  Cara cek tipe / serial number
                </button>
              </div>

              {/* Panel YouTube */}
              {showYoutube && (
                <div className="mb-3 border border-red-100 rounded-xl bg-red-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-red-700 flex items-center gap-1">
                      <RiYoutubeLine className="w-4 h-4" />
                      Tutorial cek tipe / serial number perangkat
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowYoutube(false)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <RiCloseLine className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-black mb-3">
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/0BtBo__Mu_4"
                      title="Tutorial Serial Number"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <a
                    href={YOUTUBE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-red-600 hover:underline"
                  >
                    <RiExternalLinkLine className="w-3 h-3" />
                    Buka video di YouTube
                  </a>
                </div>
              )}

              {/* Upload area */}
              {fotoPreview ? (
                <div className="relative mt-1 w-full rounded-lg overflow-hidden border border-gray-200">
                  <img src={fotoPreview} alt="preview" className="w-full max-h-48 object-contain bg-gray-50" />
                  <button
                    type="button"
                    onClick={removeFoto}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <RiCloseLine className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-6 text-gray-400 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                >
                  <RiImageLine className="w-8 h-8" />
                  <span className="text-sm font-medium">Klik untuk upload foto</span>
                  <span className="text-xs">Foto label perangkat / stiker serial number</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFotoChange}
              />
              {uploadingFoto && (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <RiLoader4Line className="w-3 h-3 animate-spin" /> Mengupload foto...
                </p>
              )}
            </div>

            {/* Keluhan */}
            <div>
              <Label htmlFor="keluhan">Keluhan/Masalah *</Label>
              <Textarea
                id="keluhan"
                placeholder="Jelaskan masalah yang dialami..."
                value={formData.keluhan}
                onChange={(e) => setFormData({ ...formData, keluhan: e.target.value })}
                required
                className="mt-1 min-h-[100px]"
              />
            </div>

            {/* Tanggal Masuk */}
            <div>
              <Label htmlFor="tanggal_masuk">Tanggal Masuk *</Label>
              <Input
                id="tanggal_masuk"
                type="date"
                value={formData.tanggal_masuk}
                onChange={(e) => setFormData({ ...formData, tanggal_masuk: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            {/* Target Selesai */}
            <div>
              <Label htmlFor="target_selesai">Target Selesai *</Label>
              <Input
                id="target_selesai"
                type="date"
                value={formData.target_selesai}
                onChange={(e) => setFormData({ ...formData, target_selesai: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-500 flex items-center gap-1">
                <RiCheckLine className="w-4 h-4 flex-shrink-0" />
                Biaya pengecekan FREE
              </p>
              <p className="text-sm text-gray-500">
                *Perangkat akan diperiksa terlebih dahulu oleh teknisi untuk menentukan estimasi biaya servis
              </p>
              <p className="text-sm text-gray-500">
                *Proses pengerjaan baru akan dilanjutkan setelah pelanggan menyetujui estimasi biaya tersebut
              </p>
              <p className="text-sm text-gray-500">
                *Tim kami akan menghubungi Anda untuk konfirmasi lebih lanjut
              </p>
            </div>

            <div className="flex justify-end gap-4 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                disabled={loading}
              >
                {loading ? (
                  <><RiLoader4Line className="w-4 h-4 mr-2 animate-spin" />Mengirim...</>
                ) : (
                  "Kirim Pengajuan Servis"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}