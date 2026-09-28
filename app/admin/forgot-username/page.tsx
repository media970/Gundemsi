"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotUsernamePage() {
  const router = useRouter();

  const [recoveryCode, setRecoveryCode] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setUsername("");

    const normalizedRecoveryCode = recoveryCode
      .replace(/\s/g, "")
      .toUpperCase();

    if (!normalizedRecoveryCode) {
      setError("Recovery kodu gerekli.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recoveryCode: normalizedRecoveryCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Kullanıcı adı kurtarılamadı.");
        return;
      }

      setUsername(data.username || "");
      setRecoveryCode("");
    } catch {
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080b12] px-4 py-8 text-slate-100">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-800 bg-[#111722] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="mb-8">
            <button
              type="button"
              onClick={() => router.push("/admin/login")}
              className="mb-6 text-sm font-semibold text-slate-500 transition hover:text-slate-300"
            >
              ← Giriş ekranına dön
            </button>

            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4l2.5 2.5" />
              </svg>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white">
              Kullanıcı Adımı Unuttum
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Recovery kodunuz ile yönetici kullanıcı adınızı
              öğrenebilirsiniz.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="recoveryCode"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Recovery Kodu
              </label>

              <input
                id="recoveryCode"
                type="text"
                value={recoveryCode}
                onChange={(event) => setRecoveryCode(event.target.value)}
                placeholder="Recovery kodunuzu girin"
                autoComplete="one-time-code"
                spellCheck={false}
                required
                className="h-12 w-full rounded-xl border border-slate-800 bg-[#0d111a] px-4 uppercase tracking-wider text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Dikkat: Bu işlem başarılı olduğunda recovery kodu
                kullanılmış sayılır ve tekrar kullanılamaz.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
                {error}
              </div>
            )}

            {username && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-center">
                <p className="mb-1 text-xs font-semibold text-emerald-300">
                  Kullanıcı Adınız
                </p>
                <p className="break-all text-xl font-black tracking-wide text-emerald-200">
                  {username}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 font-bold text-white transition hover:from-violet-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Kontrol ediliyor..." : "Kullanıcı Adımı Göster"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-slate-600">
          GÜNDEMSİ Yönetim Paneli
        </p>
      </div>
    </main>
  );
}