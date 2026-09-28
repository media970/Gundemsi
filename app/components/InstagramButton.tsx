"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function InstagramButton() {
  const pathname = usePathname();
  const [instagram, setInstagram] = useState("");

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      return;
    }

    async function loadInstagram() {
      try {
        const response = await fetch("/api/admin/settings");

        if (!response.ok) return;

        const data = await response.json();

        setInstagram(data.instagram ?? "");
      } catch {
        // Sessizce geç
      }
    }

    loadInstagram();
  }, [pathname]);

  if (pathname.startsWith("/admin") || !instagram) {
    return null;
  }

  return (
    <Link
      href={instagram}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GÜNDEMSİ Instagram hesabını takip et"
      className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2 rounded-full bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] px-3 py-2.5 text-xs font-bold text-white shadow-lg transition hover:scale-105 hover:shadow-xl sm:bottom-5 sm:right-5 sm:px-4 sm:py-3 sm:text-sm"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5 shrink-0"
        aria-hidden="true"
      >
        <rect width="18" height="18" x="3" y="3" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle
          cx="17.5"
          cy="6.5"
          r="1"
          fill="currentColor"
          stroke="none"
        />
      </svg>

      <span className="hidden sm:inline">Instagram'da takip et</span>
    </Link>
  );
}