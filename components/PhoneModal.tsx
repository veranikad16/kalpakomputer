"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PhoneModalProps {
  isOpen: boolean;
  userId: string;
  onComplete: () => void;
}

export function PhoneModal({ isOpen, userId, onComplete }: PhoneModalProps) {
  const [nomor, setNomor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!nomor.trim()) {
      setError("Nomor WhatsApp tidak boleh kosong");
      return;
    }
    if (!/^08\d{8,11}$/.test(nomor)) {
      setError("Format nomor tidak valid (contoh: 08123456789)");
      return;
    }

    setLoading(true);
      
    // Cek dulu apakah data ada
    const { data: existing } = await supabase
      .from("pelanggan")
      .select("id")
      .eq("user_id", userId)
      .single();

    let error;
    if (existing) {
      // Update
      const result = await supabase
        .from("pelanggan")
        .update({ nomor_whatsapp: nomor.trim() })
        .eq("user_id", userId);
      error = result.error;
    } else {
      // Insert
      const result = await supabase
        .from("pelanggan")
        .insert({ user_id: userId, nomor_whatsapp: nomor.trim() });
      error = result.error;
    }

    if (error) {
      setError("Gagal menyimpan. Coba lagi.");
    } else {
      onComplete();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white rounded-xl w-full max-w-sm m-4 p-8 flex flex-col gap-5">
        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-xl font-bold text-[#1E3A5F]">Satu Langkah Lagi!</h2>
          <p className="text-sm text-gray-500">
            Masukkan nomor WhatsApp untuk memudahkan kami menghubungi Anda
          </p>
        </div>

        <div>
          <Label htmlFor="nomor">Nomor WhatsApp *</Label>
          <Input
            id="nomor"
            placeholder="08xxxxxxxxxx"
            value={nomor}
            onChange={(e) => { setNomor(e.target.value); setError(""); }}
            className="mt-1"
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
        >
          {loading ? "Menyimpan..." : "Simpan & Lanjutkan"}
        </Button>
      </div>
    </div>
  );
}