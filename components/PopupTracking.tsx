"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { RiCloseLine, RiSearchLine } from "@remixicon/react";

type TrackingData = {
  id: string;
  kode_tracking: string;
  nama: string;
  jenis_perangkat: string;
  tipe_merk: string;
  jenis_layanan: string;
  keluhan: string;
  tanggal_kunjungan: string;
  alamat: string;
  status: string;
};

const STATUS_STEPS = ["Dikonfirmasi", "Diproses", "Selesai"];

const STATUS_DESC: Record<string, string> = {
  Dikonfirmasi: "Ajuan Anda telah dikonfirmasi dan teknisi telah ditugaskan.",
  Diproses: "Teknisi sedang mengerjakan servis perangkat Anda.",
  Selesai: "Servis selesai. Terima kasih telah menggunakan layanan kami.",
};

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface PopupTrackingProps {
  open: boolean;
  onClose: () => void;
}

export function PopupTracking({ open, onClose }: PopupTrackingProps) {
  const [kodeTracking, setKodeTracking] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrackingData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setKodeTracking("");
      setData(null);
      setError("");
    }
  }, [open]);

  const handleSearch = async (kode?: string) => {
    const searchKode = (kode ?? kodeTracking).trim().toUpperCase();
    if (!searchKode) return;

    setLoading(true);
    setError("");
    setData(null);

    const { data: rows, error: err } = await supabase
      .from("servis_onsite")
      .select("id, kode_tracking, nama, jenis_perangkat, tipe_merk, jenis_layanan, keluhan, tanggal_kunjungan, alamat, status")
      .eq("kode_tracking", searchKode)
      .limit(1);

    const result = rows?.[0] ?? null;

    if (err || !result) {
      setError("Kode tracking tidak ditemukan. Pastikan kode yang Anda masukkan benar.");
    } else if (result.status === "Pilih Teknisi" || result.status === "Menunggu Konfirmasi") {
      setError("Ajuan Anda masih menunggu konfirmasi dari admin.");
    } else {
      setData(result);
    }

    setLoading(false);
  };

  const currentStep = data ? STATUS_STEPS.indexOf(data.status) : -1;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-[18px] text-black">Tracking Status Servis</h2>
            <p className="text-xs text-gray-400 mt-0.5">Masukkan kode tracking yang dikirim via WhatsApp</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <RiCloseLine className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
          {/* Input Kode */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                value={kodeTracking}
                onChange={(e) => setKodeTracking(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Contoh: A1B2C3D4"
                maxLength={8}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-black/10 uppercase"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading || !kodeTracking.trim()}
              className="bg-black hover:bg-black/80 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
            >
              {loading ? "..." : "Cek Status"}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Result */}
          {data && (
            <div className="flex flex-col gap-5">
              <div className="bg-[#f8f8f8] rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Detail Order</p>
                <div className="grid grid-cols-2 gap-y-2.5 text-sm">
                  <span className="text-gray-500">Nama</span>
                  <span className="font-medium text-black text-right">{data.nama}</span>
                  <span className="text-gray-500">Perangkat</span>
                  <span className="font-medium text-black text-right">{data.jenis_perangkat}</span>
                  <span className="text-gray-500">Merk/Tipe</span>
                  <span className="font-medium text-black text-right">{data.tipe_merk}</span>
                  <span className="text-gray-500">Layanan</span>
                  <span className="font-medium text-black text-right">{data.jenis_layanan}</span>
                  <span className="text-gray-500">Tgl Kunjungan</span>
                  <span className="font-medium text-black text-right">{formatDate(data.tanggal_kunjungan)}</span>
                  <span className="text-gray-500">Kode Tracking</span>
                  <span className="font-mono font-bold text-black text-right">{data.kode_tracking}</span>
                </div>
              </div>

              {/* Stepper */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Status Pengerjaan</p>
                {STATUS_STEPS.map((step, i) => {
                  const isDone = i < currentStep;
                  const isActive = i === currentStep;
                  const isPending = i > currentStep;

                  return (
                    <div key={step} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`size-4 rounded-full border-2 mt-1 shrink-0 transition-colors ${
                          isDone || isActive ? "bg-black border-black" : "bg-white border-gray-300"
                        }`} />
                        {i < STATUS_STEPS.length - 1 && (
                          <div className={`w-0.5 flex-1 min-h-[32px] transition-colors ${
                            isDone ? "bg-black" : "bg-gray-200"
                          }`} />
                        )}
                      </div>
                      <div className={`pb-5 flex-1 ${isPending ? "opacity-35" : ""}`}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-black">{step}</p>
                          {isActive && (
                            <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">Saat ini</span>
                          )}
                          {isDone && (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">✓ Selesai</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{STATUS_DESC[step]}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}