"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { buildWhatsAppMessage, sendWhatsApp } from "@/lib/whatsapp";
import { buildStatusUpdateMessage } from "@/lib/whatsapp";

const STATUS_OPTIONS = [
  { value: "Menunggu Konfirmasi", label: "Menunggu Konfirmasi" },
  { value: "Dikonfirmasi", label: "Dikonfirmasi" },
  { value: "Diproses", label: "Diproses" },
  { value: "Selesai", label: "Selesai" },
  { value: "Dibatalkan", label: "Dibatalkan" },
];

const statusColor: Record<string, string> = {
  "Menunggu Konfirmasi": "border-yellow-300 text-yellow-600 bg-yellow-50",
  "Dikonfirmasi": "border-blue-300 text-blue-600 bg-blue-50",
  "Diproses": "border-purple-400 text-blue-700 bg-purple-100",
  "Selesai": "border-green-300 text-green-600 bg-green-50",
  "Dibatalkan": "border-red-300 text-red-600 bg-red-50",
};

interface Props {
  item: {
    id: string;
    nama: string;
    nomor_whatsapp: string;
    jenis_perangkat: string;
    tipe_merk: string;
    keluhan: string;
    tanggal_masuk: string;
    target_selesai: string | null;
    status: string;
    catatan_admin: string | null;
    created_at: string;
  };
  onUpdated: () => void;
}

export function UpdateStatusServis({ item, onUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(item.status);

  const handleUpdate = async (newStatus: string) => {
    setCurrentStatus(newStatus);
    setLoading(true);

    const { error } = await supabase
      .from("servis_workshop")
      .update({ status: newStatus })
      .eq("id", item.id);

    if (error) {
      alert("Gagal update status: " + error.message);
      setCurrentStatus(item.status); // kembalikan ke status semula jika gagal
      setLoading(false);
      return;
    }

    // Kirim WA hanya saat status "Dikonfirmasi"
    if (newStatus === "Dikonfirmasi") {
      const pesan = buildWhatsAppMessage({
        nama: item.nama,
        jenis_perangkat: item.jenis_perangkat,
        tipe_merk: item.tipe_merk,
        keluhan: item.keluhan,
        tanggal_masuk: item.tanggal_masuk,
        target_selesai: item.target_selesai ?? "-",
      });
      sendWhatsApp(item.nomor_whatsapp, pesan);

    } else if (["Diproses", "Selesai", "Dibatalkan"].includes(newStatus)) {
        const pesan = buildStatusUpdateMessage(item.nama, newStatus);
        sendWhatsApp(item.nomor_whatsapp, pesan);
    }

    setLoading(false);
    onUpdated();
  };

  return (
    <select
      value={currentStatus}
      onChange={(e) => handleUpdate(e.target.value)}
      disabled={loading}
      className={`border rounded px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors ${statusColor[currentStatus]}`}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}