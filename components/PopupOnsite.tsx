"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RiCloseLine, RiLoader4Line, RiCheckLine } from "@remixicon/react";
import { supabase } from "@/lib/supabase";

interface PopupOnsiteProps {
  isOpen: boolean;
  onClose: () => void;
}

const JENIS_LOKASI = ["Rumah", "Kantor", "Sekolah", "Villa", "Toko", "Lainnya"];
const JENIS_PERANGKAT = ["Laptop", "PC / Komputer", "Printer", "Server", "Jaringan", "Lainnya"];
const JENIS_LAYANAN = ["Perbaikan", "Instalasi", "Maintenance", "Lainnya"];
const MAX_TEKNISI = 2;

const STATUS_AKTIF = ["Pilih Teknisi", "Dikonfirmasi", "Diproses", "Dalam Perjalanan", "Sedang Dikerjakan"];

const emptyForm = {
  nama: "",
  nomor_whatsapp: "",
  alamat: "",
  link_maps: "",
  jenis_lokasi: "",
  jenis_lokasi_lainnya: "",
  jenis_perangkat: "",
  jenis_perangkat_lainnya: "",
  jenis_layanan: "",
  jenis_layanan_lainnya: "",
  keluhan: "",
  tanggal_kunjungan: "",
};

export function PopupOnsite({ isOpen, onClose }: PopupOnsiteProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tanggalPenuh, setTanggalPenuh] = useState(false);
  const [checkingTanggal, setCheckingTanggal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  if (!isOpen) return null;

  const handleTanggalChange = async (tgl: string) => {
    setFormData({ ...formData, tanggal_kunjungan: tgl });
    setTanggalPenuh(false);
    if (!tgl) return;

    setCheckingTanggal(true);
    try {
      const { data, error } = await supabase
        .from("servis_onsite")
        .select("id, status")
        .eq("tanggal_kunjungan", tgl)
        .in("status", STATUS_AKTIF);

      if (error) throw error;
      if (data && data.length >= MAX_TEKNISI) setTanggalPenuh(true);
    } catch (err) {
      console.error("Error checking tanggal:", err);
    } finally {
      setCheckingTanggal(false);
    }
  };

  // Resolve nilai akhir untuk field yang punya opsi "Lainnya"
  const resolveValue = (selected: string, custom: string) =>
    selected === "Lainnya" && custom.trim() ? custom.trim() : selected;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: existing, error: checkError } = await supabase
        .from("servis_onsite")
        .select("id")
        .eq("tanggal_kunjungan", formData.tanggal_kunjungan)
        .in("status", STATUS_AKTIF);

      if (checkError) throw checkError;

      if (existing && existing.length >= MAX_TEKNISI) {
        setTanggalPenuh(true);
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("servis_onsite").insert({
        nama: formData.nama,
        nomor_whatsapp: formData.nomor_whatsapp,
        alamat: formData.alamat,
        link_maps: formData.link_maps || null,
        jenis_lokasi: resolveValue(formData.jenis_lokasi, formData.jenis_lokasi_lainnya),
        jenis_perangkat: resolveValue(formData.jenis_perangkat, formData.jenis_perangkat_lainnya),
        jenis_layanan: resolveValue(formData.jenis_layanan, formData.jenis_layanan_lainnya),
        keluhan: formData.keluhan,
        tanggal_kunjungan: formData.tanggal_kunjungan,
        status: "Pilih Teknisi",
      });

      if (error) throw error;

      setSuccess(true);
    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      setErrorMsg("Gagal mengirim pengajuan. Periksa koneksi internet Anda dan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setErrorMsg(null);
    setTanggalPenuh(false);
    setFormData(emptyForm);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {!success && !errorMsg && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
          >
            <RiCloseLine className="w-6 h-6 text-gray-500" />
          </button>
        )}

        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-[#1E3A5F] text-center">Ajukan Servis On-Site</h2>
        </div>

        {/* SUCCESS POPUP */}
        {success ? (
          <div className="flex flex-col items-center justify-center text-center px-8 py-10 gap-3">
            <div className="bg-green-100 rounded-full p-3">
              <RiCheckLine className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-base font-bold text-gray-800">Terima Kasih!</h3>
            <p className="text-gray-500 text-xs max-w-xs">
              Pengajuan servis on-site Anda telah berhasil dikirim. Tim kami akan segera menghubungi Anda melalui WhatsApp untuk konfirmasi jadwal kunjungan.
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
          <div className="flex flex-col items-center justify-center text-center px-8 py-10 gap-3">
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

            {/* Nama & No WA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nama">Nama Lengkap *</Label>
                <Input
                  id="nama"
                  placeholder="Nama Lengkap"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
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
            </div>

            {/* Alamat */}
            <div>
              <Label htmlFor="alamat">Alamat Lengkap *</Label>
              <Textarea
                id="alamat"
                placeholder="Jl. Contoh No. 123, Kec. ..., Kota ..."
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                required
                className="mt-1 min-h-[80px]"
              />
            </div>

            {/* Link Maps */}
            <div>
              <Label htmlFor="link_maps">Link Google Maps (opsional)</Label>
              <Input
                id="link_maps"
                placeholder="https://maps.google.com/..."
                value={formData.link_maps}
                onChange={(e) => setFormData({ ...formData, link_maps: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Jenis Lokasi & Jenis Perangkat */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jenis_lokasi">Jenis Lokasi *</Label>
                <select
                  id="jenis_lokasi"
                  value={formData.jenis_lokasi}
                  onChange={(e) => setFormData({ ...formData, jenis_lokasi: e.target.value, jenis_lokasi_lainnya: "" })}
                  required
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm"
                >
                  <option value="">Pilih jenis lokasi</option>
                  {JENIS_LOKASI.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                {formData.jenis_lokasi === "Lainnya" && (
                  <Input
                    placeholder="Sebutkan jenis lokasi..."
                    value={formData.jenis_lokasi_lainnya}
                    onChange={(e) => setFormData({ ...formData, jenis_lokasi_lainnya: e.target.value })}
                    required
                    className="mt-2"
                  />
                )}
              </div>
              <div>
                <Label htmlFor="jenis_perangkat">Jenis Perangkat *</Label>
                <select
                  id="jenis_perangkat"
                  value={formData.jenis_perangkat}
                  onChange={(e) => setFormData({ ...formData, jenis_perangkat: e.target.value, jenis_perangkat_lainnya: "" })}
                  required
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm"
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
            </div>

            {/* Jenis Layanan */}
            <div>
              <Label htmlFor="jenis_layanan">Jenis Layanan *</Label>
              <select
                id="jenis_layanan"
                value={formData.jenis_layanan}
                onChange={(e) => setFormData({ ...formData, jenis_layanan: e.target.value, jenis_layanan_lainnya: "" })}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm"
              >
                <option value="">Pilih jenis layanan</option>
                {JENIS_LAYANAN.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              {formData.jenis_layanan === "Lainnya" && (
                <Input
                  placeholder="Sebutkan jenis layanan..."
                  value={formData.jenis_layanan_lainnya}
                  onChange={(e) => setFormData({ ...formData, jenis_layanan_lainnya: e.target.value })}
                  required
                  className="mt-2"
                />
              )}
            </div>

            {/* Keluhan */}
            <div>
              <Label htmlFor="keluhan">Keluhan / Masalah *</Label>
              <Textarea
                id="keluhan"
                placeholder="Jelaskan masalah yang dialami..."
                value={formData.keluhan}
                onChange={(e) => setFormData({ ...formData, keluhan: e.target.value })}
                required
                className="mt-1 min-h-[100px]"
              />
            </div>

            {/* Tanggal Kunjungan */}
            <div>
              <Label htmlFor="tanggal_kunjungan">Tanggal Kunjungan *</Label>
              <Input
                id="tanggal_kunjungan"
                type="date"
                value={formData.tanggal_kunjungan}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => handleTanggalChange(e.target.value)}
                required
                className={`mt-1 ${tanggalPenuh ? "border-red-500 focus:ring-red-500" : ""}`}
              />
              {checkingTanggal && (
                <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                  <RiLoader4Line className="w-3 h-3 animate-spin" />
                  Mengecek ketersediaan...
                </p>
              )}
              {tanggalPenuh && !checkingTanggal && (
                <p className="text-red-500 text-sm mt-1">
                  ⚠️ Tanggal ini sudah penuh. Silakan pilih tanggal lain.
                </p>
              )}
            </div>

            <p className="text-sm text-gray-500">
              *Tim kami akan menghubungi Anda untuk konfirmasi lebih lanjut
            </p>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                disabled={loading || tanggalPenuh || checkingTanggal}
              >
                {loading ? (
                  <><RiLoader4Line className="w-4 h-4 mr-2 animate-spin" />Mengirim...</>
                ) : (
                  "Kirim Pengajuan"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}