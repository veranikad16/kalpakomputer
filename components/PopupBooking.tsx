"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RiCloseLine, RiLoader4Line, RiCheckLine } from "@remixicon/react";
// import { supabase } from "@/lib/supabase";

interface PopupBookingProps {
  isOpen: boolean;
  onClose: () => void;
}

const jenisLokasi = ["Sekolah", "Villa", "Kantor", "Rumah", "Lainnya"];
const jenisLayanan = ["Servis", "Instalasi", "Maintenance", "Lainnya"];

export function PopupBooking({ isOpen, onClose }: PopupBookingProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    jenisLokasi: "",
    jenisLayanan: "",
    tanggalKunjungan: "",
    kontak: "",
    catatan: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulasi - ganti dengan kode Supabase sebenarnya
      // const { error } = await supabase.from("booking_teknisi").insert({
      //   jenis_lokasi: formData.jenisLokasi,
      //   jenis_layanan: formData.jenisLayanan,
      //   tanggal_kunjungan: formData.tanggalKunjungan,
      //   kontak: formData.kontak,
      //   catatan: formData.catatan,
      // });

      // Simulasi success
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setFormData({
          jenisLokasi: "",
          jenisLayanan: "",
          tanggalKunjungan: "",
          kontak: "",
          catatan: "",
        });
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

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
            Booking Teknisi On-Site
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jenisLokasi">Jenis Lokasi *</Label>
              <select
                id="jenisLokasi"
                value={formData.jenisLokasi}
                onChange={(e) =>
                  setFormData({ ...formData, jenisLokasi: e.target.value })
                }
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              >
                <option value="">Pilih jenis lokasi</option>
                {jenisLokasi.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="jenisLayanan">Jenis Layanan *</Label>
              <select
                id="jenisLayanan"
                value={formData.jenisLayanan}
                onChange={(e) =>
                  setFormData({ ...formData, jenisLayanan: e.target.value })
                }
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              >
                <option value="">Pilih jenis layanan</option>
                {jenisLayanan.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="tanggalKunjungan">Tanggal Kunjungan *</Label>
            <Input
              id="tanggalKunjungan"
              type="date"
              value={formData.tanggalKunjungan}
              onChange={(e) =>
                setFormData({ ...formData, tanggalKunjungan: e.target.value })
              }
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="kontak">Kontak (WhatsApp / Email) *</Label>
            <Input
              id="kontak"
              placeholder="Contoh: +62 812 3456 7890"
              value={formData.kontak}
              onChange={(e) =>
                setFormData({ ...formData, kontak: e.target.value })
              }
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="catatan">Catatan Tambahan (opsional)</Label>
            <Textarea
              id="catatan"
              placeholder="Tambahkan catatan jika diperlukan..."
              value={formData.catatan}
              onChange={(e) =>
                setFormData({ ...formData, catatan: e.target.value })
              }
              className="mt-1 min-h-[100px]"
            />
          </div>

          <p className="text-sm text-gray-500">
            *Tim kami akan menghubungi Anda untuk konfirmasi lebih lanjut
          </p>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <RiLoader4Line className="w-4 h-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : success ? (
                <>
                  <RiCheckLine className="w-4 h-4 mr-2" />
                  Terkirim!
                </>
              ) : (
                "Kirim Booking"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
