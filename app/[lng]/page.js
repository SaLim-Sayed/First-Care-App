'use client';

import React from "react";
import Slides from "@/components/Slides";
import Footer from "@/components/Footer";

export default function HomePage({ params }) {
  // We can use params.lng to set the language in a useEffect or similar,
  // but i18next-browser-languagedetector usually handles it from the path.
  
  return (
    <main className="flex-1">
      <div className="bg-[var(--bg-color)] min-h-screen transition-colors duration-300">
        <Slides />
        <Footer />
      </div>
    </main>
  );
}
