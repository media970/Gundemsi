"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedRecoveryCode = recoveryCode
      .replace(/\s/g, "")
      .toUpperCase();

    if (!normalizedUsername) {
      setError("Kullanıcı adı gerekli.");
      return;
    }

    if (!normalizedRecoveryCode) {
      setError("Recovery kodu gerekli.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Yeni şifre en az 8 karakter olmalı.");
      return;
    }

    if (newPassword.length > 128) {
      setError("Yeni şifre 128 karakterden uzun olamaz.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: normalizedUsername,
          recoveryCode: normalizedRecoveryCode,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Şifre sıfırlanamadı.");
        return;
      }

      setSuccess(
        "Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz."
      );

      setTimeout(() => {
        router.replace("/admin/login");
      }, 1800);
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
                <path d="M12 3 5 6v5c0 4.5 2.9 8.3 7 10 4.1-1.7 7-5.5 7-10V6l-7-3Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white">
              Şifremi Unuttum
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Recovery kodunuz ile yeni bir yönetici şifresi
              oluşturabilirsiniz.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Kullanıcı Adı
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Kullanıcı adınızı girin"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                className="h-12 w-full rounded-xl border border-slate-800 bg-[#0d111a] px-4 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

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
                Bu kod, 2FA kurulumu sırasında oluşturulan tek
                kullanımlık recovery kodlarından biri olmalıdır.
              </p>
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Yeni Şifre
              </label>

              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Yeni şifrenizi girin"
                  autoComplete="new-password"
                  required
                  className="h-12 w-full rounded-xl border border-slate-800 bg-[#0d111a] px-4 pr-16 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 transition hover:text-slate-300"
                >
                  {showNewPassword ? "Gizle" : "Göster"}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Yeni Şifre Tekrar
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Yeni şifrenizi tekrar girin"
                  autoComplete="new-password"
                  required
                  className="h-12 w-full rounded-xl border border-slate-800 bg-[#0d111a] px-4 pr-16 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 transition hover:text-slate-300"
                >
                  {showConfirmPassword ? "Gizle" : "Göster"}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 font-bold text-white transition hover:from-violet-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Şifre sıfırlanıyor..." : "Şifreyi Sıfırla"}
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