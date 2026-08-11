"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { AuthModal } from "@/components/AuthModal";
import { PhoneModal } from "@/components/PhoneModal";

interface Pelanggan {
  id?: string;
  user_id: string;
  nama: string | null;
  email: string | null;
  foto_profil: string | null;
  nomor_whatsapp: string | null;
}

type AuthContextType = {
  user: User | null;
  pelanggan: Pelanggan | null;
  loading: boolean;
  openAuthModal: () => void;
  signOut: () => Promise<void>;
  requireAuth: (action: () => void) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pelanggan, setPelanggan] = useState<Pelanggan | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

  const checkingRef = useRef(false);

  const checkPhone = async (userId: string, userData: User) => {
    if (checkingRef.current) return; // cegah panggilan dobel bersamaan
    checkingRef.current = true;

    const { data, error } = await supabase
      .from("pelanggan")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!data) {
      const { data: newData } = await supabase
        .from("pelanggan")
        .upsert(
          {
            user_id: userId,
            nama: userData.user_metadata?.full_name || userData.email,
            email: userData.email,
            foto_profil: userData.user_metadata?.avatar_url || null,
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      setPelanggan(newData as Pelanggan);
      if (!newData?.nomor_whatsapp) setShowPhoneModal(true);
    } else {
      setPelanggan(data as Pelanggan);
      if (!data.nomor_whatsapp) setShowPhoneModal(true);
    }

    checkingRef.current = false;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) checkPhone(session.user.id, session.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkPhone(session.user.id, session.user);
        // Kalau tadi ada aksi tertunda (klik "Ajukan Servis" sebelum login), jalankan otomatis setelah berhasil login
        if (pendingAction.current) {
          pendingAction.current();
          pendingAction.current = null;
        }
      } else {
        setPelanggan(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPelanggan(null);
  };

  const openAuthModal = () => setAuthOpen(true);

  // Dipakai tombol "Ajukan Servis": kalau belum login, buka modal login dulu,
  // baru jalankan aksinya otomatis setelah login sukses.
  const requireAuth = (action: () => void) => {
    if (user) {
      action();
    } else {
      pendingAction.current = action;
      setAuthOpen(true);
    }
  };

  return (
    <AuthContext.Provider value={{ user, pelanggan, loading, openAuthModal, signOut, requireAuth }}>
      {children}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <PhoneModal
        isOpen={showPhoneModal}
        userId={user?.id ?? ""}
        onComplete={() => {
          setShowPhoneModal(false);
          if (user) checkPhone(user.id, user);
        }}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}