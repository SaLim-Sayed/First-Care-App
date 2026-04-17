'use client';

import React from "react";
import dynamic from "next/dynamic";
import { Providers } from "@/components/Providers";

const DoctorsNearby = dynamic(() => import("@/components/Doctors/DoctorsNearby"), {
  ssr: false,
  loading: () => <div className="h-screen w-full flex items-center justify-center bg-[var(--bg-color)]">
    <div className="animate-pulse text-[var(--text-active)] font-bold text-2xl">Loading Map...</div>
  </div>
});

export default function DoctorsPage() {
  return (
    <main className="flex-1">
      <DoctorsNearby />
    </main>
  );
}
