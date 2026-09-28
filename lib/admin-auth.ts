export const ADMIN_COOKIE = "gundemsi_admin_session";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET tanımlı değil.");
  }

  return secret;
}

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(value: string) {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");

  const binary = atob(base64);

  return Uint8Array.from(binary, (char) =>
    char.charCodeAt(0)
  );
}

async function createSignature(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign", "verify"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );

  return base64UrlEncode(new Uint8Array(signature));
}

export async function createAdminSession(
  adminId: string,
  sessionVersion: number
) {
  const expiresAt =
    Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;

  const payload = `admin:${adminId}:${sessionVersion}:${expiresAt}`;

  const signature = await createSignature(payload);

  return `${payload}.${signature}`;
}

export async function verifyAdminSession(
  value: string | undefined
) {
  if (!value) return null;

  const parts = value.split(".");

  if (parts.length !== 2) return null;

  const [payload, signature] = parts;

  const payloadParts = payload.split(":");

  if (payloadParts.length !== 4) return null;

  const [
    role,
    adminId,
    sessionVersionString,
    expiresAtString,
  ] = payloadParts;

  if (role !== "admin") return null;

  const sessionVersion = Number(sessionVersionString);
  const expiresAt = Number(expiresAtString);

  if (!adminId) return null;
  if (!Number.isInteger(sessionVersion)) return null;
  if (!Number.isFinite(expiresAt)) return null;

  if (expiresAt < Math.floor(Date.now() / 1000)) {
    return null;
  }

  const expected = await createSignature(payload);

  const expectedBytes = base64UrlDecode(expected);
  const actualBytes = base64UrlDecode(signature);

  if (expectedBytes.length !== actualBytes.length) {
    return null;
  }

  let difference = 0;

  for (let i = 0; i < expectedBytes.length; i++) {
    difference |= expectedBytes[i] ^ actualBytes[i];
  }

  if (difference !== 0) {
    return null;
  }

  return {
    adminId,
    sessionVersion,
  };
}

export function getSessionMaxAge() {
  return SESSION_MAX_AGE;
}