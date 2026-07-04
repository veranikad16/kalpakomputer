"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { RiCloseLine, RiSearchLine, RiZoomInLine } from "@remixicon/react";

type TrackingData = {
  id: string;
  kode_tracking: string;
  nama: string;
  jenis_perangkat: string;
  tipe_merk: string;
  jenis_layanan?: string;
  keluhan: string;
  tanggal_kunjungan?: string;
  tanggal_masuk?: string;
  target_selesai?: string | null;
  alamat?: string;
  status: string;
  tipe_servis: "onsite" | "workshop";
};

const STATUS_STEPS_ONSITE = ["Dikonfirmasi", "Berangkat", "Diproses", "Selesai"];
const STATUS_STEPS_WORKSHOP = ["Dikonfirmasi", "Diproses", "Selesai"];

const STATUS_DESC: Record<string, string> = {
  Dikonfirmasi: "Ajuan Anda telah dikonfirmasi oleh admin.",
  Berangkat: "Teknisi sedang dalam perjalanan menuju lokasi Anda.",
  Diproses: "Teknisi sedang mengerjakan servis perangkat Anda.",
  Selesai: "Servis selesai. Terima kasih telah menggunakan layanan kami.",
};

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Deteksi apakah value tipe_merk adalah URL gambar (hasil upload Supabase Storage)
// atau sekadar teks biasa (mis. "ASUS VivoBook").
function isImageUrl(value: string): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;
  return (
    /\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i.test(trimmed) ||
    trimmed.includes("/storage/v1/object/")
  );
}

// ─── Modal Preview Foto ────────────────────────────────────────────────────────

function ImagePreviewModal({
  open,
  onClose,
  imageUrl,
}: {
  open: boolean;
  onClose: () => void;
  imageUrl: string | null;
}) {
  if (!open || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-3">
        <div className="flex items-center justify-between w-full">
          <p className="text-sm font-medium text-white/90">Preview Foto Merk/Tipe</p>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-1.5"
          >
            <RiCloseLine className="size-5" />
          </button>
        </div>
        <div className="w-full max-h-[75vh] overflow-hidden rounded-xl border border-white/10 bg-black flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Foto tipe/merk perangkat"
            className="max-w-full max-h-[75vh] object-contain"
          />
        </div>
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-white/70 hover:text-white underline underline-offset-2"
        >
          Buka gambar di tab baru
        </a>
      </div>
    </div>
  );
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

  // Preview foto Merk/Tipe
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setKodeTracking("");
      setData(null);
      setError("");
      setPreviewOpen(false);
      setPreviewUrl(null);
    }
  }, [open]);

  const handleSearch = async (kode?: string) => {
    const searchKode = (kode ?? kodeTracking).trim().toUpperCase();
    if (!searchKode) return;

    setLoading(true);
    setError("");
    setData(null);

    // Cari di servis_onsite dan servis_workshop secara paralel
    const [{ data: onsiteRows }, { data: workshopRows }] = await Promise.all([
      supabase
        .from("servis_onsite")
        .select("id, kode_tracking, nama, jenis_perangkat, tipe_merk, jenis_layanan, keluhan, tanggal_kunjungan, alamat, status")
        .eq("kode_tracking", searchKode)
        .limit(1),
      supabase
        .from("servis_workshop")
        .select("id, kode_tracking, nama, jenis_perangkat, tipe_merk, keluhan, tanggal_masuk, target_selesai, status")
        .eq("kode_tracking", searchKode)
        .limit(1),
    ]);

    const onsiteResult = onsiteRows?.[0] ?? null;
    const workshopResult = workshopRows?.[0] ?? null;

    if (!onsiteResult && !workshopResult) {
      setError("Kode tracking tidak ditemukan. Pastikan kode yang Anda masukkan benar.");
      setLoading(false);
      return;
    }

    if (onsiteResult) {
      if (onsiteResult.status === "Pilih Teknisi" || onsiteResult.status === "Menunggu Konfirmasi") {
        setError("Ajuan Anda masih menunggu konfirmasi dari admin.");
      } else {
        setData({ ...onsiteResult, tipe_servis: "onsite" });
      }
    } else if (workshopResult) {
      if (workshopResult.status === "Menunggu Konfirmasi") {
        setError("Ajuan Anda masih menunggu konfirmasi dari admin.");
      } else {
        setData({ ...workshopResult, tipe_servis: "workshop" });
      }
    }

    setLoading(false);
  };

  const openPreview = (url: string) => {
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  const STATUS_STEPS = data?.tipe_servis === "workshop" ? STATUS_STEPS_WORKSHOP : STATUS_STEPS_ONSITE;
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
              {/* Badge tipe servis */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  data.tipe_servis === "onsite"
                    ? "bg-purple-100 text-purple-600"
                    : "bg-blue-100 text-blue-600"
                }`}>
                  {data.tipe_servis === "onsite" ? "Servis On-Site" : "Servis Workshop"}
                </span>
              </div>

              {/* Detail */}
              <div className="bg-[#f8f8f8] rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Detail Order</p>
                <div className="grid grid-cols-2 gap-y-2.5 text-sm items-center">
                  <span className="text-gray-500">Nama</span>
                  <span className="font-medium text-black text-right">{data.nama}</span>

                  <span className="text-gray-500">Perangkat</span>
                  <span className="font-medium text-black text-right">{data.jenis_perangkat}</span>

                  <span className="text-gray-500">Merk/Tipe</span>
                  {isImageUrl(data.tipe_merk) ? (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => openPreview(data.tipe_merk)}
                        className="group relative size-12 rounded-lg overflow-hidden border border-gray-200 hover:border-black/40 transition-colors shrink-0"
                        title="Klik untuk lihat foto"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={data.tipe_merk}
                          alt="Foto tipe/merk"
                          className="size-full object-cover"
                        />
                        <span className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                          <RiZoomInLine className="size-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </button>
                    </div>
                  ) : (
                    <span className="font-medium text-black text-right">{data.tipe_merk}</span>
                  )}

                  {data.tipe_servis === "onsite" && data.jenis_layanan && (
                    <>
                      <span className="text-gray-500">Layanan</span>
                      <span className="font-medium text-black text-right">{data.jenis_layanan}</span>
                    </>
                  )}

                  {data.tipe_servis === "onsite" ? (
                    <>
                      <span className="text-gray-500">Tgl Kunjungan</span>
                      <span className="font-medium text-black text-right">{formatDate(data.tanggal_kunjungan)}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-500">Tgl Masuk</span>
                      <span className="font-medium text-black text-right">{formatDate(data.tanggal_masuk)}</span>

                      <span className="text-gray-500">Target Selesai</span>
                      <span className="font-medium text-black text-right">{formatDate(data.target_selesai)}</span>
                    </>
                  )}

                  <span className="text-gray-500">Keluhan</span>
                  <span className="font-medium text-black text-right">{data.keluhan}</span>

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

      {/* Modal Preview Foto Merk/Tipe */}
      <ImagePreviewModal
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewUrl(null);
        }}
        imageUrl={previewUrl}
      />
    </div>
  );
}