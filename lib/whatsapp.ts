export function buildWhatsAppMessage(data: {
  nama: string;
  jenis_perangkat: string;
  tipe_merk: string;
  keluhan: string;
  tanggal_masuk: string;
  target_selesai: string;
}) {
  return `Halo ${data.nama},

Kami dari PT. Kalpa Komputer Bali ingin menginformasikan bahwa pengajuan servis Anda telah berhasil dikonfirmasi.

Berikut detail servis Anda:
- *Jenis Perangkat:* ${data.jenis_perangkat}
- *Tipe/Merk:* ${data.tipe_merk}
- *Keluhan:* ${data.keluhan}
- *Target Selesai:* ${data.target_selesai}

Mohon untuk membawa perangkat Anda ke kantor kami pada tanggal *${data.tanggal_masuk}*.

Terima kasih atas kepercayaan Anda kepada layanan kami.
Salam,
PT. Kalpa Komputer Bali`;
}

export function buildStatusUpdateMessage(nama: string, status: string) {
  return `Halo ${nama},

Kami informasikan bahwa servis perangkat Anda : *${status}*.

Jika ada pertanyaan, silakan hubungi kami. Terima kasih.

-PT. Kalpa Komputer Bali`;
}

export function sendWhatsApp(nomor: string, pesan: string) {
  // Format nomor: hilangkan 0 di depan, ganti dengan 62
  const formatted = nomor.startsWith("0") 
    ? "62" + nomor.slice(1) 
    : nomor;
  
  const url = `https://wa.me/${formatted}?text=${encodeURIComponent(pesan)}`;
  window.open(url, "_blank");
}

