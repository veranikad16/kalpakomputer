"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RiCloseLine, RiLoader4Line, RiCheckLine, RiImageLine, RiUpload2Line } from "@remixicon/react";
import { supabase } from "@/lib/supabase";

interface PopupOnsiteProps {
  isOpen: boolean;
  onClose: () => void;
}

const JENIS_LOKASI = ["Rumah", "Kantor", "Sekolah", "Villa", "Toko", "Lainnya"];
const JENIS_PERANGKAT = ["Laptop", "PC / Komputer", "Printer", "Server", "Jaringan", "Lainnya"];
const JENIS_LAYANAN = ["Perbaikan", "Instalasi", "Maintenance", "Lainnya"];
const ESTIMASI_TRANSPORT: Record<string, string> = {
  // Badung
  "Mengwi": "Rp 20.000",
  "Canggu / Pererenan": "Rp 30.000",
  "Kuta / Legian": "Rp 35.000",
  "Nusa Dua / Jimbaran": "Rp 50.000",
  // Denpasar
  "Denpasar Barat / Utara": "Rp 30.000",
  "Denpasar Selatan / Timur": "Rp 40.000",
  // Gianyar
  "Ubud / Gianyar Kota": "Rp 50.000",
  "Klungkung": "Rp 75.000",
  // Tabanan
  "Tabanan Kota / Kediri": "Rp 35.000",
  "Kerambitan / Penebel": "Rp 50.000",
  // Lainnya
  "Lainnya": "Hubungi kami untuk estimasi",
};
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
  daerah: "",
};

export function PopupOnsite({ isOpen, onClose }: PopupOnsiteProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tanggalPenuh, setTanggalPenuh] = useState(false);
  const [checkingTanggal, setCheckingTanggal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [showQris, setShowQris] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [buktiFile, setBuktiFile] = useState<File | null>(null);
  const [buktiPreview, setBuktiPreview] = useState<string | null>(null);
  const [uploadingBukti, setUploadingBukti] = useState(false);
  const [buktiSuccess, setBuktiSuccess] = useState(false);
  const buktiInputRef = useRef<HTMLInputElement>(null);

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
        daerah: formData.daerah || null,
        status: "Pilih Teknisi",
      });

      if (error) throw error;

      // Simpan id untuk upload bukti bayar
      const { data: inserted } = await supabase
        .from("servis_onsite")
        .select("id")
        .eq("nama", formData.nama)
        .eq("nomor_whatsapp", formData.nomor_whatsapp)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (inserted) setSubmittedId(inserted.id);

      // Kirim notifikasi email ke admin
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "onsite",
          data: {
            nama: formData.nama,
            nomor_whatsapp: formData.nomor_whatsapp,
            alamat: formData.alamat,
            jenis_lokasi: resolveValue(formData.jenis_lokasi, formData.jenis_lokasi_lainnya),
            jenis_perangkat: resolveValue(formData.jenis_perangkat, formData.jenis_perangkat_lainnya),
            jenis_layanan: resolveValue(formData.jenis_layanan, formData.jenis_layanan_lainnya),
            keluhan: formData.keluhan,
            tanggal_kunjungan: formData.tanggal_kunjungan,
          },
        }),
      });
      setShowQris(true);
    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      setErrorMsg("Gagal mengirim pengajuan. Periksa koneksi internet Anda dan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setShowQris(false);
    setBuktiSuccess(false);
    setSubmittedId(null);
    setBuktiFile(null);
    setBuktiPreview(null);
    setErrorMsg(null);
    setTanggalPenuh(false);
    setFormData(emptyForm);
    onClose();
  };

  const handleBuktiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBuktiFile(file);
    setBuktiPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleUploadBukti = async () => {
    if (!buktiFile || !submittedId) return;
    setUploadingBukti(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", buktiFile);
      const res = await fetch("/api/upload", { method: "POST", body: formDataUpload });
      const json = await res.json();
      const buktiUrl = json.url || null;

      if (buktiUrl) {
        await supabase
          .from("servis_onsite")
          .update({ bukti_bayar: buktiUrl, status: "Menunggu Konfirmasi" })
          .eq("id", submittedId);
        setBuktiSuccess(true);
      }
    } catch {
      console.error("Gagal upload bukti");
    } finally {
      setUploadingBukti(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div
        className={`relative bg-white rounded-xl w-full max-h-[90vh] overflow-y-auto m-4 ${
          showQris || errorMsg ? "max-w-sm" : "max-w-2xl"
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
            <h2 className="text-2xl font-bold text-[#1E3A5F] text-center">Ajukan Servis On-Site</h2>
          </div>
        )}

        {/* QRIS POPUP */}
        {showQris ? (
          <div className="flex flex-col items-center justify-center text-center px-6 py-8 gap-4">
            {buktiSuccess ? (
              <>
                <div className="bg-green-100 rounded-full p-3">
                  <RiCheckLine className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-base font-bold text-gray-800">Pembayaran Diterima!</h3>
                <p className="text-gray-500 text-xs max-w-xs">
                  Bukti pembayaran Anda telah dikirim. Tim kami akan segera mengkonfirmasi dan menghubungi Anda melalui WhatsApp.
                </p>
                <Button onClick={handleClose} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 text-sm">
                  Tutup
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-gray-800">Selesaikan Pembayaran Transport</h3>
                <p className="text-gray-500 text-xs max-w-xs">
                  Scan QRIS di bawah untuk membayar biaya transportasi teknisi. Estimasi: <span className="font-semibold text-orange-600">{ESTIMASI_TRANSPORT[formData.daerah] ?? "-"}</span>
                </p>
                <div className="w-52 h-52 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 gap-2">
                  <p className="text-xs font-bold text-gray-500">QRIS</p>
                  <p className="text-xs text-gray-400 text-center px-4">PT. KALPA KOMPUTER BALI</p>
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-xs text-gray-400 text-center">QR Code</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Setelah membayar, upload bukti pembayaran di bawah</p>
                {buktiPreview ? (
                  <div className="relative w-full rounded-lg overflow-hidden border border-gray-200">
                    <img src={buktiPreview} alt="bukti" className="w-full max-h-48 object-contain bg-gray-50" />
                    <button
                      type="button"
                      onClick={() => { setBuktiFile(null); setBuktiPreview(null); }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <RiCloseLine className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => buktiInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-5 text-gray-400 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                  >
                    <RiImageLine className="w-7 h-7" />
                    <span className="text-sm font-medium">Upload bukti pembayaran</span>
                  </button>
                )}
                <input ref={buktiInputRef} type="file" accept="image/*" className="hidden" onChange={handleBuktiChange} />
                <Button
                  onClick={handleUploadBukti}
                  disabled={!buktiFile || uploadingBukti}
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                >
                  {uploadingBukti ? (
                    <><RiLoader4Line className="w-4 h-4 mr-2 animate-spin" />Mengupload...</>
                  ) : (
                    "Kirim Bukti Pembayaran"
                  )}
                </Button>
              </>
            )}
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

            {/* Nama & No WA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="link_maps">Link Google Maps *</Label>
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
            
            {/* Daerah & Estimasi Transport */}
            <div>
              <Label htmlFor="daerah">Daerah / Kota *</Label>
              <select
                id="daerah"
                value={formData.daerah}
                onChange={(e) => setFormData({ ...formData, daerah: e.target.value })}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm"
              >
                <option value="">Pilih daerah</option>
                {Object.keys(ESTIMASI_TRANSPORT).map((daerah) => (
                  <option key={daerah} value={daerah}>{daerah}</option>
                ))}
              </select>

              {formData.daerah && (
                <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-orange-700">🚗 Estimasi Biaya Transportasi</p>
                  <p className="text-sm text-orange-600 font-medium mt-1">
                    {ESTIMASI_TRANSPORT[formData.daerah]}
                  </p>
                  <p className="text-xs text-orange-500 mt-1">*Biaya transport dibayar di awal sebelum teknisi berangkat</p>
                </div>
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