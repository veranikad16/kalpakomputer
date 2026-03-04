"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TentangKami } from "@/components/TentangKami";
import { ProdukUnggulan } from "@/components/ProdukUnggulan";
import { Servis } from "@/components/Servis";
import { TeknisiOnSite } from "@/components/TeknisiOnSite";
import { KontakKami } from "@/components/KontakKami";
import { Footer } from "@/components/Footer";
import { PopupServis } from "@/components/PopupServis";
import { PopupBooking } from "@/components/PopupBooking";

export default function Home() {
  const [popupServisOpen, setPopupServisOpen] = useState(false);
  const [popupBookingOpen, setPopupBookingOpen] = useState(false);

  const handlePopupOpen = (type: "servis" | "booking") => {
    if (type === "servis") {
      setPopupServisOpen(true);
    } else {
      setPopupBookingOpen(true);
    }
  };

  return (
    <main className="min-h-screen">
      <Header />

      <Hero />

      <TentangKami />

      <ProdukUnggulan />

      <Servis onPopupOpen={() => handlePopupOpen("servis")} />

      <TeknisiOnSite onPopupOpen={() => handlePopupOpen("booking")} />

      <KontakKami />

      <Footer />

      {/* Popups */}
      <PopupServis
        isOpen={popupServisOpen}
        onClose={() => setPopupServisOpen(false)}
      />
      <PopupBooking
        isOpen={popupBookingOpen}
        onClose={() => setPopupBookingOpen(false)}
      />
    </main>
  );
}
