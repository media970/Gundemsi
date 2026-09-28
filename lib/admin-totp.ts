import { generateSecret, generateURI, generate, verify } from "otplib";

const ISSUER = "GÜNDEMSİ";

export function createTotpSecret() {
  return generateSecret();
}

export function createTotpUri(username: string, secret: string) {
  return generateURI({
    issuer: ISSUER,
    label: username,
    secret,
    algorithm: "sha1",
    digits: 6,
    period: 30,
  });
}

export async function verifyTotpCode(secret: string, code: string) {
  const result = await verify({
    secret,
    token: code,
  });

  return result.valid;
}

export async function selfTestTotp() {
  const secret = createTotpSecret();
  const code = await generate({ secret });

  const result = await verify({
    secret,
    token: code,
  });

  return {
    code,
    valid: result.valid,
  };
}