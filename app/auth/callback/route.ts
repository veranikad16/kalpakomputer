import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    await supabase.auth.exchangeCodeForSession(code);

    // Cek apakah pelanggan sudah ada di tabel pelanggan
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: existing } = await supabase
        .from("pelanggan")
        .select("id")
        .eq("user_id", user.id)
        .single();

      // Kalau belum ada, simpan ke tabel pelanggan
        if (!existing) {
        await supabase.from("pelanggan").insert({
          user_id: user.id,
          nama: user.user_metadata.full_name || user.email,
          email: user.email,
          foto_profil: user.user_metadata.avatar_url || null,
        });
      }
    }
  }

  return NextResponse.redirect(new URL("/", requestUrl.origin));
}