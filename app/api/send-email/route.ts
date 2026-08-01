import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "dekintan24@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    let subject = "";
    let html = "";

    if (type === "onsite") {
      subject = `🔔 Servis On-Site Baru - ${data.nama}`;
      html = `
        <h2>Ada Pengajuan Servis On-Site Baru!</h2>
        <table border="1" cellpadding="8" cellspacing="0">
          <tr><td><b>Nama</b></td><td>${data.nama}</td></tr>
          <tr><td><b>WhatsApp</b></td><td>${data.nomor_whatsapp}</td></tr>
          <tr><td><b>Alamat</b></td><td>${data.alamat}</td></tr>
          <tr><td><b>Jenis Lokasi</b></td><td>${data.jenis_lokasi}</td></tr>
          <tr><td><b>Jenis Perangkat</b></td><td>${data.jenis_perangkat}</td></tr>
          <tr><td><b>Jenis Layanan</b></td><td>${data.jenis_layanan}</td></tr>
          <tr><td><b>Keluhan</b></td><td>${data.keluhan}</td></tr>
          <tr><td><b>Tanggal Kunjungan</b></td><td>${data.tanggal_kunjungan}</td></tr>
        </table>
      `;
    } else if (type === "workshop") {
      subject = `🔔 Servis Workshop Baru - ${data.nama}`;
      html = `
        <h2>Ada Pengajuan Servis Workshop Baru!</h2>
        <table border="1" cellpadding="8" cellspacing="0">
          <tr><td><b>Nama</b></td><td>${data.nama}</td></tr>
          <tr><td><b>WhatsApp</b></td><td>${data.nomor_whatsapp}</td></tr>
          <tr><td><b>Jenis Perangkat</b></td><td>${data.jenis_perangkat}</td></tr>
          <tr><td><b>Keluhan</b></td><td>${data.keluhan}</td></tr>
          <tr><td><b>Tanggal Masuk</b></td><td>${data.tanggal_masuk}</td></tr>
          <tr><td><b>Target Selesai</b></td><td>${data.target_selesai}</td></tr>
        </table>
      `;
    }

    await resend.emails.send({
      from: "PT Kalpa Komputer Bali <noreply@kalpakomputerbali.com>",
      to: ADMIN_EMAIL,
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}