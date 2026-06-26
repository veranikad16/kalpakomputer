"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RiCloseLine, RiLoader4Line, RiCheckLine } from "@remixicon/react";
import { supabase } from "@/lib/supabase";

interface PopupServisProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PopupServis({ isOpen, onClose }: PopupServisProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    nomor_whatsapp: "",
    jenis_perangkat: "",
    tipe_merk: "",
    keluhan: "",
    tanggal_masuk: "",
    target_selesai: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("servis_workshop").insert({
        nama: formData.nama,
        nomor_whatsapp: formData.nomor_whatsapp,
        jenis_perangkat: formData.jenis_perangkat,
        tipe_merk: formData.tipe_merk,
        keluhan: formData.keluhan,
        tanggal_masuk: formData.tanggal_masuk,
        target_selesai: formData.target_selesai,
      });

      if (error) throw error;

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setFormData({
          nama: "",
          nomor_whatsapp: "",
          jenis_perangkat: "",
          tipe_merk: "",
          keluhan: "",
          tanggal_masuk: "",
          target_selesai: "",
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
            Ajukan Servis Perangkat
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          <div>
            <Label htmlFor="jenis_perangkat">Jenis Perangkat *</Label>
            <Input
              id="jenis_perangkat"
              placeholder="Laptop / PC / dll"
              value={formData.jenis_perangkat}
              onChange={(e) => setFormData({ ...formData, jenis_perangkat: e.target.value })}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="tipe_merk">Merk atau Tipe *</Label>
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
              disabled={loading || success}
            >
              {loading ? (
                <><RiLoader4Line className="w-4 h-4 mr-2 animate-spin" />Mengirim...</>
              ) : success ? (
                <><RiCheckLine className="w-4 h-4 mr-2" />Terkirim!</>
              ) : (
                "Kirim Pengajuan Servis"
              )}
            </Button>
          </div>
        </form> 
      </div>
    </div>
  );
}
