import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  // Cek apakah email terdaftar di tabel admin
  const { data: admin } = await supabase
    .from('admin')
    .select('email')
    .eq('email', email)
    .single()

  if (!admin) {
    return NextResponse.json({ error: 'Email tidak terdaftar' }, { status: 401 })
  }

  // Generate kode OTP 6 digit
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expires_at = new Date(Date.now() + 5 * 60 * 1000) // expired 5 menit

  // Hapus OTP lama milik email ini (biar database tidak menumpuk)
  await supabase.from('otp_codes').delete().eq('email', email)

  // Simpan OTP baru ke database
  await supabase.from('otp_codes').insert({ email, code, expires_at })

  // Kirim email OTP via Resend
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Kode OTP Login Admin',
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: auto;">
        <h2>Kode OTP Login Admin</h2>
        <p>Gunakan kode berikut untuk masuk ke dashboard:</p>
        <h1 style="letter-spacing: 8px; color: #4F46E5;">${code}</h1>
        <p style="color: #888;">Kode berlaku selama <strong>5 menit</strong>.</p>
        <p style="color: #888;">Jika kamu tidak merasa melakukan login, abaikan email ini.</p>
      </div>
    `
  })

  return NextResponse.json({ success: true })
}