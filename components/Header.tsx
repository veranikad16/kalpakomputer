"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { RiMenu4Line, RiCloseLine } from "@remixicon/react";

const navItems = [
  { name: "Beranda", href: "#beranda" },
  { name: "Tentang Kami", href: "#tentang-kami" },
  { name: "Produk", href: "#produk" },
  { name: "Servis", href: "#servis" },
  { name: "Tracking Status", href: "#tracking" },
  { name: "Kontak", href: "#kontak" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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

          {/* CTA Button */}
          <div className="hidden lg:block">
            <a
              href="https://wa.me/6285785097067?text=Halo%2C%20saya%20ingin%20bertanya%20mengenai%20layanan%20Kalpa%20Komputer%20Bali"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#f2f2f2] text-black font-semibold text-sm rounded-[10px] px-5 py-3 hover:bg-white transition-colors whitespace-nowrap inline-block"
            >
              Hubungi Kami
            </a>
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
    </>
  );
}