import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PT. KALPA KOMPUTER BALI - Servis Komputer & Laptop Bali",
  description: "PT. KALPA KOMPUTER BALI adalah perusahaan layanan teknologi yang berfokus pada servis perangkat komputer dan instalasi jaringan untuk kebutuhan rumah, UMKM, hingga perkantoran di Bali.",
  keywords: "servis komputer, laptop, instalasi jaringan, wifi, IT Bali, teknisi komputer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={nunitoSans.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
