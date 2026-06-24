"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { TentangKami } from "@/components/TentangKami";
import { ProdukUnggulan } from "@/components/ProdukUnggulan";
import { Servis } from "@/components/Servis";
import { TrackingStatus } from "@/components/TrackingStatus";
import { KontakKami } from "@/components/KontakKami";
import { Footer } from "@/components/Footer";
import { PopupServis } from "@/components/PopupServis";
import { PopupOnsite } from "@/components/PopupOnsite";

export default function Home() {
  const [popupServisOpen, setPopupServisOpen] = useState(false);
  const [popupOnsiteOpen, setPopupOnsiteOpen] = useState(false);

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <TentangKami />
      <ProdukUnggulan />

      <Servis
        onWorkshopOpen={() => setPopupServisOpen(true)}
        onOnsiteOpen={() => setPopupOnsiteOpen(true)}
      />

      <TrackingStatus onPopupOpen={() => setPopupOnsiteOpen(true)} />

      <KontakKami />
      <Footer />

      {/* Popups */}
      <PopupServis
        isOpen={popupServisOpen}
        onClose={() => setPopupServisOpen(false)}
      />
      <PopupOnsite
        isOpen={popupOnsiteOpen}
        onClose={() => setPopupOnsiteOpen(false)}
      />
    </main>
  );
}