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

// status yang dianggap teknisi masih aktif/sibuk
const STATUS_AKTIF = ["Pilih Teknisi", "Dikonfirmasi", "Diproses", "Dalam Perjalanan", "Sedang Dikerjakan"];

export function PopupOnsite({ isOpen, onClose }: PopupOnsiteProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tanggalPenuh, setTanggalPenuh] = useState(false);
  const [checkingTanggal, setCheckingTanggal] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    nomor_whatsapp: "",
    alamat: "",
    link_maps: "",
    jenis_lokasi: "",
    jenis_perangkat: "",
    tipe_merk: "",
    jenis_layanan: "",
    keluhan: "",
    tanggal_kunjungan: "",
  });

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

      console.log("Data aktif di tanggal ini:", data);
      console.log("Jumlah aktif:", data?.length);

      if (data && data.length >= MAX_TEKNISI) {
        setTanggalPenuh(true);
      }
    } catch (err) {
      console.error("Error checking tanggal:", err);
    } finally {
      setCheckingTanggal(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // double-check kapasitas saat submit (hindari race condition)
      const { data: existing, error: checkError } = await supabase
        .from("servis_onsite")
        .select("id")
        .eq("tanggal_kunjungan", formData.tanggal_kunjungan)
        .in("status", STATUS_AKTIF);

      if (checkError) throw checkError;

      console.log("Double-check saat submit:", existing);

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
        jenis_lokasi: formData.jenis_lokasi,
        jenis_perangkat: formData.jenis_perangkat,
        tipe_merk: formData.tipe_merk,
        jenis_layanan: formData.jenis_layanan,
        keluhan: formData.keluhan,
        tanggal_kunjungan: formData.tanggal_kunjungan,
        status: "Pilih Teknisi",
      });

      if (error) throw error;

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setTanggalPenuh(false);
        setFormData({
          nama: "",
          nomor_whatsapp: "",
          alamat: "",
          link_maps: "",
          jenis_lokasi: "",
          jenis_perangkat: "",
          tipe_merk: "",
          jenis_layanan: "",
          keluhan: "",
          tanggal_kunjungan: "",
        });
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Gagal mengirim pengajuan, silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RiCloseLine className="w-6 h-6 text-gray-500" />
        </button>

        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-[#1E3A5F]">
            Ajukan Servis On-Site
          </h2>
        </div>

        {/* Form */}
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
                onChange={(e) => setFormData({ ...formData, jenis_lokasi: e.target.value })}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm"
              >
                <option value="">Pilih jenis lokasi</option>
                {JENIS_LOKASI.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="jenis_perangkat">Jenis Perangkat *</Label>
              <select
                id="jenis_perangkat"
                value={formData.jenis_perangkat}
                onChange={(e) => setFormData({ ...formData, jenis_perangkat: e.target.value })}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm"
              >
                <option value="">Pilih jenis perangkat</option>
                {JENIS_PERANGKAT.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tipe/Merk & Jenis Layanan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipe_merk">Merk / Tipe *</Label>
              <Input
                id="tipe_merk"
                placeholder="Contoh: Asus VivoBook 15"
                value={formData.tipe_merk}
                onChange={(e) => setFormData({ ...formData, tipe_merk: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="jenis_layanan">Jenis Layanan *</Label>
              <select
                id="jenis_layanan"
                value={formData.jenis_layanan}
                onChange={(e) => setFormData({ ...formData, jenis_layanan: e.target.value })}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm"
              >
                <option value="">Pilih jenis layanan</option>
                {JENIS_LAYANAN.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
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
                ⚠️ Tanggal ini sudah penuh. Semua teknisi sudah ditugaskan. Silakan pilih tanggal lain.
              </p>
            )}
          </div>

          <p className="text-sm text-gray-500">
            *Tim kami akan menghubungi Anda untuk konfirmasi lebih lanjut
          </p>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
              disabled={loading || success || tanggalPenuh || checkingTanggal}
            >
              {loading ? (
                <><RiLoader4Line className="w-4 h-4 mr-2 animate-spin" />Mengirim...</>
              ) : success ? (
                <><RiCheckLine className="w-4 h-4 mr-2" />Terkirim!</>
              ) : (
                "Kirim Pengajuan"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}