// lib/admin-auth.ts
import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function verifyAdmin(req: NextRequest) {
  const email = req.cookies.get('admin_session')?.value

  if (!email) return null

  const { data: admin } = await supabaseAdmin
    .from('admin')
    .select('*')
    .eq('email', email)
    .single()

  return admin ?? null
}