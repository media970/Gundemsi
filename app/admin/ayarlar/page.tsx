import Link from "next/link";
import SettingsClient from "./SettingsClient";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-[#080b12] text-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              GÜNDEMSİ
            </p>

            <h1 className="mt-1 text-3xl font-black">
              Site Ayarları
            </h1>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-slate-800 bg-[#111722] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-violet-500/40 hover:bg-slate-800"
          >
            ← Yönetim
          </Link>
        </div>

        <SettingsClient />
      </div>
    </main>
  );
}