"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { RiInformationLine } from "@remixicon/react";

export function ReminderLoginPopup() {
  const { user, loading, openAuthModal } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!loading && !user && !dismissed) {
      // sedikit delay biar tidak muncul kaget begitu halaman kebuka
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [loading, user, dismissed]);

  if (!visible) return null;

  const close = () => {
    setDismissed(true);
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={close} />
      <div className="relative bg-white rounded-xl w-full max-w-sm p-6 flex flex-col items-center gap-4 text-center">
       <div className="bg-blue-100 rounded-full p-3">
          <RiInformationLine className="w-6 h-6 text-blue-600" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-[#1E3A5F]">Belum Masuk Akun</h2>
          <p className="text-sm text-gray-500 mt-1">
            Masuk dengan Google terlebih dahulu supaya pengajuan servis lebih cepat dan mudah dilacak.
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={close}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Nanti Saja
          </button>
          <button
            onClick={() => { close(); openAuthModal(); }}
            className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg px-4 py-2.5 text-sm font-medium"
          >
            Masuk Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}