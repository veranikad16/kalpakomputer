"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { AuthModal } from "@/components/AuthModal";
import { PhoneModal } from "@/components/PhoneModal";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { RiMenu4Line, RiCloseLine } from "@remixicon/react";

const navItems = [
  { name: "Beranda", href: "#beranda" },
  { name: "Tentang Kami", href: "#tentang-kami" },
  { name: "Produk", href: "#produk" },
  { name: "Servis", href: "#servis" },
  { name: "Tracking Status", href: "#tracking" },
  { name: "Kontak Kami", href: "#kontak" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const [pelanggan, setPelanggan] = useState<Record<string, any> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const checkPhone = async (userId: string) => {
    const { data } = await supabase
      .from("pelanggan")
      .select("*")
      .eq("user_id", userId)
      .single();
    setPelanggan(data);
    if (!data?.nomor_whatsapp) setShowPhoneModal(true);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) checkPhone(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) checkPhone(session.user.id);
      else { setPelanggan(null); }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNav = (id: string) => {
    setMenuOpen(false);
    if (pathname === "/") {
      const el = document.getElementById(id);
      if (el) {
        const navbarHeight = window.innerWidth >= 768 ? 107 : 72;
        const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
        window.scrollTo({ top, behavior: "smooth" });
      }
    } else {
      router.push(`/#${id}`);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    setUser(null);
    setPelanggan(null);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#01341b] h-[72px] md:h-[107px]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-3 cursor-pointer">
            <img
              src="/logo.png"
              alt="PT. KALPA KOMPUTER BALI Logo"
              className="h-10 md:h-14 w-auto object-contain"
            />
            <span className="text-white font-bold text-sm md:text-base leading-tight hidden sm:block">
              PT. KALPA KOMPUTER BALI
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNav(item.href.replace("#", ""))}
                className="text-white font-semibold text-[15px] hover:text-green-200 transition-colors whitespace-nowrap"
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* CTA + Auth */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="https://wa.me/6285785097067?text=Halo%2C%20saya%20ingin%20bertanya%20mengenai%20layanan%20Kalpa%20Komputer%20Bali"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#f2f2f2] text-black font-semibold text-sm rounded-[10px] px-5 py-3 hover:bg-white transition-colors whitespace-nowrap inline-block"
            >
              Hubungi Kami
            </a>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="profil"
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover border-2 border-white hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                      {user.user_metadata?.full_name?.[0] ?? "U"}
                    </div>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    {/* Header dropdown */}
                    <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
                      {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="profil"
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                      {pelanggan?.nama?.[0] ?? "U"}
                    </div>
                  )}
                      <div className="flex flex-col min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {pelanggan?.nama ?? user.user_metadata?.full_name ?? "-"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{pelanggan?.email ?? user.email}</p>
                      </div>
                    </div>

                    {/* Data pelanggan */}
                    <div className="px-4 py-3 space-y-2">
                      <div>
                        <p className="text-xs text-gray-400">Nomor WhatsApp</p>
                        <p className="text-sm text-gray-700">{pelanggan?.nomor_whatsapp ?? "-"}</p>
                      </div>
                    </div>

                    {/* Tombol keluar */}
                    <div className="px-4 py-3 border-t border-gray-100">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-sm text-red-500 hover:text-red-600 font-medium text-left"
                      >
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="text-white font-semibold text-sm hover:text-green-200 transition-colors"
              >
                Masuk
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <RiCloseLine className="size-7" /> : <RiMenu4Line className="size-7" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden bg-[#01341b] border-t border-green-800 px-6 py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNav(item.href.replace("#", ""))}
                className="text-white font-semibold text-[15px] text-left hover:text-green-200"
              >
                {item.name}
              </button>
            ))}
            {user ? (
              <div className="flex items-center gap-2">
                {user.user_metadata?.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="profil"
                    className="w-8 h-8 rounded-full object-cover border-2 border-white"
                  />
                )}
                <span className="text-white text-sm font-medium">
                  {user.user_metadata?.full_name?.split(" ")[0]}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-white/70 hover:text-white text-xs underline"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setMenuOpen(false); setAuthOpen(true); }}
                className="text-white font-semibold text-sm text-left hover:text-green-200"
              >
                Masuk
              </button>
            )}
            
              <a
              href="https://wa.me/6285785097067?text=Halo%2C%20saya%20ingin%20bertanya%20mengenai%20layanan%20Kalpa%20Komputer%20Bali"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#f2f2f2] text-black font-semibold text-sm rounded-[10px] px-5 py-3 w-fit hover:bg-white transition-colors inline-block"
            >
              Hubungi Kami
            </a>
          </div>
        )}
        
      </header>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <PhoneModal
        isOpen={showPhoneModal}
        userId={user?.id ?? ""}
        onComplete={() => {
          setShowPhoneModal(false);
          if (user) checkPhone(user.id);
        }}
      />
    </>
  );
}