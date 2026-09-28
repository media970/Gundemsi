"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

type SecurityPurpose =
  | "PASSWORD_CHANGE"
  | "USERNAME_CHANGE";

export default function SettingsClient() {
  const router = useRouter();
  // Instagram
  const [instagram, setInstagram] = useState("");
  const [savingInstagram, setSavingInstagram] = useState(false);
  const [instagramMessage, setInstagramMessage] = useState("");

  // Güvenlik / TOTP
  const [securityPurpose, setSecurityPurpose] =
    useState<SecurityPurpose>("PASSWORD_CHANGE");

  // Hesap güvenliği formu
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [confirmUsername, setConfirmUsername] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [securityBusy, setSecurityBusy] = useState(false);
  const [securityError, setSecurityError] = useState("");
  const [securityMessage, setSecurityMessage] = useState("");

  // TOTP kurulumu
  const [totpSetupOpen, setTotpSetupOpen] = useState(false);
  const [totpDisableOpen, setTotpDisableOpen] = useState(false);
  const [totpQrCode, setTotpQrCode] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [totpLoading, setTotpLoading] = useState(false);
  const [totpVerifying, setTotpVerifying] = useState(false);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [totpMessage, setTotpMessage] = useState("");
  const [totpError, setTotpError] = useState("");
  // Recovery kodları
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [recoveryCodeInput, setRecoveryCodeInput] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");

async function loadSettings() {
  try {
    const response = await fetch("/api/admin/security/totp");

    if (!response.ok) return;

    const data = await response.json();

    setTotpEnabled(Boolean(data.totpEnabled));
  } catch {
    // Sessizce geç
  }
}
  useEffect(() => {
    void loadSettings();
  }, []);

  function resetSecurityForm() {
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirm("");
    setNewUsername("");
    setConfirmUsername("");
    setSecurityCode("");
  }

  async function handleSecurityChange() {
    setSecurityError("");
    setSecurityMessage("");

    if (!currentPassword) {
      setSecurityError("Mevcut şifreni gir.");
      return;
    }

    if (securityPurpose === "PASSWORD_CHANGE") {
      if (newPassword.length < 8 || newPassword.length > 128) {
        setSecurityError("Yeni şifre 8-128 karakter arasında olmalı.");
        return;
      }

      if (newPassword !== newPasswordConfirm) {
        setSecurityError("Yeni şifreler eşleşmiyor.");
        return;
      }
    }

    if (securityPurpose === "USERNAME_CHANGE") {
      const normalizedUsername = newUsername.trim().toLowerCase();
      const normalizedConfirmUsername =
        confirmUsername.trim().toLowerCase();

      if (
        normalizedUsername.length < 3 ||
        normalizedUsername.length > 50
      ) {
        setSecurityError("Kullanıcı adı 3-50 karakter arasında olmalı.");
        return;
      }

      if (!/^[a-z0-9._-]+$/.test(normalizedUsername)) {
        setSecurityError(
          "Kullanıcı adı sadece harf, rakam, nokta, alt çizgi ve tire içerebilir."
        );
        return;
      }

      if (normalizedUsername !== normalizedConfirmUsername) {
        setSecurityError("Kullanıcı adları eşleşmiyor.");
        return;
      }
    }

    if (totpEnabled && !/^\d{6}$/.test(securityCode.trim())) {
      setSecurityError(
        "TOTP aktif. Authenticator uygulamasındaki 6 haneli kodu gir."
      );
      return;
    }

    setSecurityBusy(true);

    try {
      const endpoint =
        securityPurpose === "PASSWORD_CHANGE"
          ? "/api/auth/password-change"
          : "/api/auth/username-change";

      const body =
        securityPurpose === "PASSWORD_CHANGE"
          ? {
              currentPassword,
              newPassword,
              confirmPassword: newPasswordConfirm,
              code: totpEnabled ? securityCode.trim() : "",
            }
          : {
              currentPassword,
              newUsername: newUsername.trim().toLowerCase(),
              confirmUsername: confirmUsername.trim().toLowerCase(),
              code: totpEnabled ? securityCode.trim() : "",
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
        setSecurityError(
          data.error ?? "Değişiklik tamamlanamadı."
        );
        return;
      }

      setSecurityMessage(
        data.message ?? "Değişiklik tamamlandı. Tekrar giriş yap."
      );

      resetSecurityForm();

      setTimeout(() => {
        router.replace("/admin/login");
      }, 1200);
    } catch {
      setSecurityError("Değişiklik sırasında bir hata oluştu.");
    } finally {
      setSecurityBusy(false);
    }
  }

  async function handleStartTotpSetup() {
    setTotpLoading(true);
    setTotpError("");
    setTotpMessage("");

    try {
      const response = await fetch("/api/admin/security/totp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "setup" }),
      });
      const data = await response.json();

      if (!response.ok) {
        setTotpError(data.error ?? "TOTP kurulumu başlatılamadı.");
        return;
      }

      const qrDataUrl = await QRCode.toDataURL(data.otpauthUrl, {
        width: 240,
        margin: 2,
      });

setTotpQrCode(qrDataUrl);
setTotpSecret(data.secret ?? "");
setTotpCode("");
setTotpSetupOpen(true);
    } catch {
      setTotpError("TOTP kurulumu başlatılırken bir hata oluştu.");
    } finally {
      setTotpLoading(false);
    }
  }

  async function handleVerifyTotp() {
    setTotpError("");
    setTotpMessage("");

    const code = totpCode.trim();

    if (!/^\d{6}$/.test(code)) {
      setTotpError("6 haneli doğrulama kodunu gir.");
      return;
    }

    setTotpVerifying(true);

    try {
      const response = await fetch("/api/admin/security/totp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "verify", code }),
      });
      const data = await response.json();

      if (!response.ok) {
        setTotpError(data.error ?? "TOTP doğrulaması başarısız.");
        return;
      }

      setTotpEnabled(true);
      setTotpSetupOpen(false);
      setTotpQrCode("");
      setTotpCode("");
      setTotpSecret("");
      setTotpMessage(data.message ?? "TOTP başarıyla aktif edildi.");
    } catch {
      setTotpError("TOTP doğrulaması sırasında bir hata oluştu.");
    } finally {
      setTotpVerifying(false);
    }
  }

  async function handleDisableTotp() {
    setTotpError("");
    setTotpMessage("");

    const code = totpCode.trim();

    if (!/^\d{6}$/.test(code)) {
      setTotpError("6 haneli doğrulama kodunu gir.");
      return;
    }

    setTotpVerifying(true);

    try {
      const response = await fetch(
        "/api/admin/security/totp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "disable", code }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setTotpError(
          data.error ?? "TOTP devre dışı bırakılamadı."
        );
        return;
      }

      setTotpEnabled(false);
      setTotpDisableOpen(false);
      setTotpCode("");
      setTotpMessage(
        data.message ?? "TOTP devre dışı bırakıldı."
      );
    } catch {
      setTotpError(
        "TOTP devre dışı bırakılırken bir hata oluştu."
      );
    } finally {
      setTotpVerifying(false);
    }
  }

  async function handleGenerateRecoveryCodes() {
    setRecoveryError("");
    setRecoveryMessage("");

    const code = recoveryCodeInput.trim();

    if (!/^\d{6}$/.test(code)) {
      setRecoveryError(
        "Authenticator uygulamasındaki 6 haneli kodu gir."
      );
      return;
    }

    setRecoveryLoading(true);

    try {
      const response = await fetch(
        "/api/admin/security/totp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
  action: "recovery-regenerate",
  code,
}),

        }
      );

      const data = await response.json();

      if (!response.ok) {
        setRecoveryError(
          data.error ?? "Recovery kodları oluşturulamadı."
        );
        return;
      }

      setRecoveryCodes(data.recoveryCodes ?? []);
      setRecoveryCodeInput("");

      setRecoveryMessage(
        "Yeni recovery kodları oluşturuldu. Bu kodları şimdi güvenli bir yere kaydet."
      );
    } catch {
      setRecoveryError(
        "Recovery kodları oluşturulurken bir hata oluştu."
      );
    } finally {
      setRecoveryLoading(false);
    }
  }

  return (
    <div className="min-h-screen space-y-8 bg-[#080b12] px-4 py-6 text-slate-100 sm:px-6 sm:py-8">

      {/* Güvenlik */}
      <section className="rounded-2xl border border-slate-800 bg-[#111722] p-6">
        <div>
          <h2 className="text-xl font-black text-slate-100">
            Hesap Güvenliği
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Kullanıcı adı ve şifre değişiklikleri TOTP tabanlı
            iki aşamalı doğrulama ile korunacaktır.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-[#0d111a] p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-sm font-black text-white">
              2FA
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-100">
                TOTP doğrulaması
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Google Authenticator, Microsoft Authenticator veya
                benzeri bir doğrulama uygulamasıyla oluşturulan 6 haneli
                kodlar kullanılacak.
              </p>
            </div>
          </div>

          {!totpEnabled && !totpSetupOpen && (
            <button
              type="button"
              onClick={handleStartTotpSetup}
              disabled={totpLoading}
              className="mt-5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:from-violet-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {totpLoading ? "Hazırlanıyor..." : "2FA'yı Kur"}
            </button>
          )}

          {totpSetupOpen && totpQrCode && (
            <div className="mt-6 grid gap-6 md:grid-cols-[auto_1fr]">
              <div className="flex justify-center rounded-2xl border border-slate-800 bg-white p-4 shadow-lg">
                <img
                  src={totpQrCode}
                  alt="TOTP kurulum QR kodu"
                  className="h-60 w-60"
                />
{totpSecret && (
  <div className="mt-4">
    <p className="text-xs font-semibold text-slate-500">
      QR kodu taranamıyorsa kurulum anahtarı:
    </p>

    <code className="mt-2 block break-all rounded-lg bg-[#171e2b] px-3 py-2 text-xs font-bold tracking-wider text-slate-200">
      {totpSecret}
    </code>
  </div>
)}
              </div>

              <div>
                <p className="text-sm font-bold text-slate-100">
                  1. Authenticator uygulamanı aç
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  QR kodu Google Authenticator, Microsoft Authenticator
                  veya kullandığın TOTP uygulamasıyla okut.
                </p>

                <p className="mt-5 text-sm font-bold text-slate-100">
                  2. Oluşan 6 haneli kodu gir
                </p>

                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={totpCode}
                  onChange={(event) =>
                    setTotpCode(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder="000000"
                  className="mt-3 w-full max-w-xs rounded-xl border border-slate-800 bg-[#111722] px-4 py-3 text-center text-lg font-black tracking-[0.35em] outline-none focus:border-violet-500"
                />

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleVerifyTotp}
                    disabled={totpVerifying}
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:from-violet-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {totpVerifying ? "Doğrulanıyor..." : "Kodu Doğrula"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTotpSetupOpen(false);
                      setTotpQrCode("");
                      setTotpCode("");
                      setTotpSecret("");
                      setTotpError("");
                      setTotpSecret("");
                    }}
                    disabled={totpVerifying}
                    className="rounded-xl border border-slate-800 bg-[#111722] px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-slate-400"
                  >
                    Vazgeç
                  </button>
                </div>
              </div>
            </div>
          )}

{totpEnabled && (
  <div className="mt-5">
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
      ✓ TOTP aktif. Authenticator doğrulaması hesabını koruyor.
    </div>

    <button
      type="button"
      onClick={() => {
        setTotpError("");
        setTotpMessage("");
        setTotpCode("");
        setTotpDisableOpen(true);
      }}
      className="mt-4 rounded-xl border border-red-500/30 bg-[#111722] px-5 py-3 text-sm font-bold text-red-600 transition hover:border-red-500/40 hover:bg-red-500/100/10"
    >
      2FA'yı Devre Dışı Bırak
    </button>

    {totpDisableOpen && (
      <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
        <p className="text-sm font-bold text-red-200">
          TOTP'yi kapatmak için Authenticator kodunu gir.
        </p>

        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={totpCode}
          onChange={(event) =>
            setTotpCode(
              event.target.value.replace(/\D/g, "")
            )
          }
          placeholder="000000"
          className="mt-3 w-full max-w-xs rounded-xl border border-red-500/30 bg-[#111722] px-4 py-3 text-center text-lg font-black tracking-[0.35em] outline-none focus:border-red-400"
        />

        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDisableTotp}
            disabled={totpVerifying}
            className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {totpVerifying
              ? "Kapatılıyor..."
              : "TOTP'yi Kapat"}
          </button>

          <button
            type="button"
            onClick={() => {
              setTotpDisableOpen(false);
              setTotpCode("");
              setTotpError("");
            }}
            disabled={totpVerifying}
            className="rounded-xl border border-slate-800 bg-[#111722] px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-slate-400"
          >
            Vazgeç
          </button>
        </div>
      </div>
    )}
  </div>
)}
          {totpError && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
              {totpError}
            </div>
          )}

          {totpMessage && (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
              {totpMessage}
            </div>
          )}
        </div>

        {totpEnabled && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-[#0d111a] p-5">
            <div>
              <h3 className="text-sm font-black text-slate-100">
                Recovery Kodları
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Authenticator uygulamasına erişemediğinde kullanabileceğin
                tek kullanımlık yedek kodları buradan oluşturabilirsin.
              </p>
            </div>

            <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-200">
              Recovery kodları yalnızca oluşturulduğu anda gösterilir.
              Sayfadan çıktıktan sonra tekrar görüntülenemez.
            </div>

            <div className="mt-5">
              <label
                htmlFor="recoveryCodeInput"
                className="text-sm font-semibold text-slate-300"
              >
                Authenticator kodu
              </label>

              <p className="mt-1 text-xs text-slate-500">
                Yeni recovery kodları oluşturmak için güncel 6 haneli
                Authenticator kodunu tekrar gir.
              </p>

              <input
                id="recoveryCodeInput"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={recoveryCodeInput}
                onChange={(event) =>
                  setRecoveryCodeInput(
                    event.target.value.replace(/\D/g, "")
                  )
                }
                placeholder="000000"
                className="mt-3 w-full max-w-xs rounded-xl border border-slate-800 bg-[#111722] px-4 py-3 text-center text-lg font-black tracking-[0.35em] outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerateRecoveryCodes}
              disabled={recoveryLoading}
              className="mt-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:from-violet-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {recoveryLoading
                ? "Oluşturuluyor..."
                : "Recovery Kodlarını Oluştur / Yenile"}
            </button>

            {recoveryError && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
                {recoveryError}
              </div>
            )}

            {recoveryMessage && (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
                {recoveryMessage}
              </div>
            )}

            {recoveryCodes.length > 0 && (
              <div className="mt-5 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5">
                <p className="text-sm font-black text-violet-200">
                  Recovery kodların
                </p>

                <p className="mt-1 text-xs leading-5 text-violet-200/70">
                  Bu kodlar tekrar gösterilmeyecek. Güvenli bir yere
                  kaydet.
                </p>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {recoveryCodes.map((code) => (
                    <code
                      key={code}
                      className="rounded-xl border border-slate-700 bg-[#080b12] px-4 py-3 text-center font-mono text-sm font-bold tracking-wider text-slate-100"
                    >
                      {code}
                    </code>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-semibold leading-5 text-amber-200">
                  Her recovery kodu yalnızca bir kez kullanılabilir.
                  Yeni bir set oluşturduğunda önceki kodların tamamı
                  geçersiz olur.
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setSecurityPurpose("PASSWORD_CHANGE");
              setSecurityError("");
              setSecurityMessage("");
              setSecurityCode("");
            }}
            className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
              securityPurpose === "PASSWORD_CHANGE"
                ? "border-slate-900 bg-gradient-to-r from-violet-600 to-blue-600 text-white"
                : "border-slate-800 bg-[#111722] text-slate-300 hover:border-slate-400"
            }`}
          >
            Şifre Değiştir
          </button>

          <button
            type="button"
            onClick={() => {
              setSecurityPurpose("USERNAME_CHANGE");
              setSecurityError("");
              setSecurityMessage("");
              setSecurityCode("");
            }}
            className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
              securityPurpose === "USERNAME_CHANGE"
                ? "border-slate-900 bg-gradient-to-r from-violet-600 to-blue-600 text-white"
                : "border-slate-800 bg-[#111722] text-slate-300 hover:border-slate-400"
            }`}
          >
            Kullanıcı Adını Değiştir
          </button>
        </div>

        <div className="mt-6">
          <label
            htmlFor="currentPassword"
            className="text-sm font-semibold text-slate-300"
          >
            Mevcut şifre
          </label>

          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(event) =>
              setCurrentPassword(event.target.value)
            }
            autoComplete="current-password"
            className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0d111a] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-violet-500"
          />
        </div>

        {securityPurpose === "PASSWORD_CHANGE" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="newPassword"
                className="text-sm font-semibold text-slate-300"
              >
                Yeni şifre
              </label>

              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0d111a] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-violet-500"
              />
            </div>

            <div>
              <label
                htmlFor="newPasswordConfirm"
                className="text-sm font-semibold text-slate-300"
              >
                Yeni şifre tekrar
              </label>

              <input
                id="newPasswordConfirm"
                type="password"
                value={newPasswordConfirm}
                onChange={(event) =>
                  setNewPasswordConfirm(event.target.value)
                }
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0d111a] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-violet-500"
              />
            </div>
          </div>
        )}

        {securityPurpose === "USERNAME_CHANGE" && (
          <div className="mt-4">
            <label
              htmlFor="newUsername"
              className="text-sm font-semibold text-slate-300"
            >
              Yeni kullanıcı adı
            </label>

            <input
              id="newUsername"
              type="text"
              value={newUsername}
              onChange={(event) =>
                setNewUsername(event.target.value)
              }
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="Yeni kullanıcı adı"
              className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0d111a] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-violet-500"
            />

            <p className="mt-2 text-xs text-slate-500">
              3-50 karakter. Harf, rakam, nokta, alt çizgi ve tire kullanılabilir.
            </p>

            <label
              htmlFor="confirmUsername"
              className="mt-4 block text-sm font-semibold text-slate-300"
            >
              Yeni kullanıcı adı tekrar
            </label>

            <input
              id="confirmUsername"
              type="text"
              value={confirmUsername}
              onChange={(event) =>
                setConfirmUsername(event.target.value)
              }
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="Yeni kullanıcı adını tekrar gir"
              className="mt-2 w-full rounded-xl border border-slate-800 bg-[#0d111a] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-violet-500"
            />
          </div>
        )}

        {totpEnabled && (
          <div className="mt-5 rounded-2xl border border-slate-800 bg-[#0d111a] p-5">
            <p className="text-sm font-semibold text-slate-200">
              TOTP doğrulaması
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              Değişikliği tamamlamak için Authenticator uygulamasındaki
              güncel 6 haneli kodu gir.
            </p>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={securityCode}
              onChange={(event) =>
                setSecurityCode(
                  event.target.value.replace(/\D/g, "")
                )
              }
              placeholder="000000"
              className="mt-3 w-full max-w-xs rounded-xl border border-slate-800 bg-[#111722] px-4 py-3 text-center text-lg font-black tracking-[0.35em] outline-none focus:border-violet-500"
            />
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSecurityChange}
            disabled={securityBusy}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:from-violet-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {securityBusy
              ? "Kaydediliyor..."
              : securityPurpose === "PASSWORD_CHANGE"
                ? "Şifreyi Değiştir"
                : "Kullanıcı Adını Değiştir"}
          </button>

          <button
            type="button"
            onClick={() => {
              resetSecurityForm();
              setSecurityError("");
              setSecurityMessage("");
            }}
            disabled={securityBusy}
            className="rounded-xl border border-slate-800 bg-[#111722] px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-slate-400"
          >
            Temizle
          </button>
        </div>

        {securityError && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
            {securityError}
          </div>
        )}

        {securityMessage && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
            {securityMessage}
          </div>
        )}

      </section>
    </div>
  );
}