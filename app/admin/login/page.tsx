"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Giriş gerçekleştirilemedi."
        );
      }

      router.replace("/admin");
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080b12] px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111722] p-7 shadow-lg shadow-black/40">
        <div className="mb-8">
          <p className="text-sm font-bold tracking-widest text-slate-300">
            GÜNDEMSİ
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-100">
            Yönetim Girişi
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Yönetim paneline devam etmek için giriş yap.
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
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-slate-800 bg-[#111722] px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

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
            {loading ? "İşleniyor..." : "Giriş yap"}
          </button>

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
        </form>
      </div>
    </main>
  );
}