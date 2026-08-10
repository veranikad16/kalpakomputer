"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { RiCloseLine, RiGoogleLine } from "@remixicon/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-sm m-4 p-8 flex flex-col items-center gap-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RiCloseLine className="w-5 h-5 text-gray-500" />
        </button>

        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-xl font-bold text-[#1E3A5F]">Masuk ke Akun</h2>
          <p className="text-sm text-gray-500">
            Masuk untuk kemudahan layanan servis PT. Kalpa Komputer Bali
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RiGoogleLine className="w-5 h-5 text-red-500" />
          {loading ? "Memuat..." : "Masuk dengan Google"}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Dengan masuk, Anda menyetujui penggunaan data untuk keperluan layanan servis.
        </p>
      </div>
    </div>
  );
}