"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [setup, setSetup] = useState<boolean | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkSetup() {
      try {
        const response = await fetch("/api/auth/setup-status");
        const data = await response.json();

        setSetup(!data.exists);
      } catch {
        setMessage("Kurulum durumu kontrol edilemedi.");
      }
    }

    checkSetup();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const endpoint = setup
        ? "/api/auth/setup"
        : "/api/auth/login";

      const body = setup
        ? {
            username,
            password,
            passwordConfirm,
            phoneNumber,
          }
        : {
            username,
            password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "İşlem gerçekleştirilemedi."
        );
      }

      if (setup) {
        setSetup(false);
        setPassword("");
        setPasswordConfirm("");
        setMessage(
          "Yönetici hesabı oluşturuldu. Şimdi giriş yapabilirsin."
        );
      } else {
        router.replace("/admin");
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Beklenmeyen bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  }

  if (setup === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080b12]">
        <p className="text-sm text-slate-400">
          Yükleniyor...
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080b12] px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111722] p-7 shadow-lg shadow-black/40">
        <div className="mb-8">
          <p className="text-sm font-bold tracking-widest text-slate-300">
            GÜNDEMSİ
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-100">
            {setup
              ? "Yönetici Kurulumu"
              : "Yönetim Girişi"}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {setup
              ? "İlk yönetici hesabını oluştur."
              : "Yönetim paneline devam etmek için giriş yap."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Kullanıcı adı
            </label>

            <input
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              autoComplete="username"
              required
              className="w-full rounded-xl border border-slate-800 bg-[#111722] px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          {setup && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Telefon numarası
              </label>

              <input
                type="tel"
                value={phoneNumber}
                onChange={(event) =>
                  setPhoneNumber(event.target.value)
                }
                placeholder="05xxxxxxxxx"
                autoComplete="tel"
                required
                className="w-full rounded-xl border border-slate-800 bg-[#111722] px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />

              <p className="mt-1 text-xs text-slate-500">
                Güvenlik işlemlerindeki SMS doğrulaması için kullanılacak.
              </p>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Şifre
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete={
                setup
                  ? "new-password"
                  : "current-password"
              }
              required
              className="w-full rounded-xl border border-slate-800 bg-[#111722] px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          {setup && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Şifre tekrar
              </label>

              <input
                type="password"
                value={passwordConfirm}
                onChange={(event) =>
                  setPasswordConfirm(event.target.value)
                }
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-slate-800 bg-[#111722] px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          )}

          {message && (
            <div className="rounded-xl bg-[#0d111a] p-3 text-sm text-slate-200">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 font-bold text-white transition hover:from-violet-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "İşleniyor..."
              : setup
                ? "Yönetici hesabını oluştur"
                : "Giriş yap"}
          </button>

          {!setup && (
            <div className="flex flex-col items-center gap-2 pt-1 text-sm">
              <Link
                href="/admin/forgot-username"
                className="font-semibold text-violet-400 transition hover:text-violet-300"
              >
                Kullanıcı adımı unuttum
              </Link>

              <Link
                href="/admin/forgot-password"
                className="font-semibold text-blue-400 transition hover:text-blue-300"
              >
                Şifremi unuttum
              </Link>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}