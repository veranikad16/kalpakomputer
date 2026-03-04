"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RiCloseLine, RiLoader4Line, RiCheckLine } from "@remixicon/react";
// import { supabase } from "@/lib/supabase";

interface PopupServisProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PopupServis({ isOpen, onClose }: PopupServisProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    jenisPerangkat: "",
    merkTipe: "",
    keluhan: "",
    email: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulasi - ganti dengan kode Supabase sebenarnya
      // const { error } = await supabase.from("servis").insert({
      //   jenis_perangkat: formData.jenisPerangkat,
      //   merk_tipe: formData.merkTipe,
      //   keluhan: formData.keluhan,
      //   email: formData.email,
      // });

      // Simulasi success
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setFormData({ jenisPerangkat: "", merkTipe: "", keluhan: "", email: "" });
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
            <Label htmlFor="jenisPerangkat">Jenis Perangkat *</Label>
            <Input
              id="jenisPerangkat"
              placeholder="Laptop / PC / dll"
              value={formData.jenisPerangkat}
              onChange={(e) =>
                setFormData({ ...formData, jenisPerangkat: e.target.value })
              }
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="merkTipe">Merk atau Tipe *</Label>
            <Input
              id="merkTipe"
              placeholder="Contoh: Asus VivoBook 15"
              value={formData.merkTipe}
              onChange={(e) =>
                setFormData({ ...formData, merkTipe: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, keluhan: e.target.value })
              }
              required
              className="mt-1 min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="email">Email yang dapat dihubungi *</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@contoh.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="mt-1"
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
                "Kirim Pengajuan Servis"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
