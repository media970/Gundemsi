import { randomBytes, createHash, timingSafeEqual } from "node:crypto";

export function generateRecoveryCodes(count = 8): string[] {
  return Array.from({ length: count }, () => {
    const hex = randomBytes(8).toString("hex").toUpperCase();

    return `${hex.slice(0, 8)}-${hex.slice(8)}`;
  });
}

export function hashRecoveryCode(code: string): string {
  const normalized = code.replace(/[\s-]/g, "").toUpperCase();

  return createHash("sha256")
    .update(normalized)
    .digest("hex");
}

export function verifyRecoveryCode(
  code: string,
  storedHash: string
): boolean {
  const candidate = Buffer.from(hashRecoveryCode(code), "hex");

  if (!/^[a-f0-9]{64}$/i.test(storedHash)) {
    return false;
  }

  const expected = Buffer.from(storedHash, "hex");

  return timingSafeEqual(candidate, expected);
}