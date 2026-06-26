import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email, code } = await req.json()

  // Cek OTP di database — harus cocok dan belum expired
  const { data: otp } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email', email)
    .eq('code', code)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!otp) {
    return NextResponse.json({ error: 'Kode OTP salah atau sudah expired' }, { status: 401 })
  }

  // Hapus OTP setelah berhasil dipakai (tidak bisa dipakai lagi)
  await supabase.from('otp_codes').delete().eq('id', otp.id)

  // Set cookie session
  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_session', email, {
    httpOnly: true,
    path: '/'
  })

  return response
}