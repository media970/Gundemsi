import { NextRequest, NextResponse } from "next/server";
import {
  generate,
  generateURI,
  verify,
} from "otplib";
import { getCurrentAdmin } from "../../../../../../lib/admin-session";

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Yetkisiz erişim." },
        { status: 401 }
      );
    }

    if (!admin.totpSecret) {
      return NextResponse.json(
        { error: "TOTP secret bulunamadı." },
        { status: 400 }
      );
    }

    const inputCode =
      request.nextUrl.searchParams.get("code")?.trim() ?? "";

    if (inputCode && !/^\d{6}$/.test(inputCode)) {
      return NextResponse.json(
        { error: "Kod 6 haneli olmalı." },
        { status: 400 }
      );
    }

    const backendCode = await generate({
      secret: admin.totpSecret,
    });

    const backendVerify = await verify({
      secret: admin.totpSecret,
      token: backendCode,
    });

    const uri = generateURI({
      issuer: "GÜNDEMSİ",
      label: admin.username,
      secret: admin.totpSecret,
    });

    const uriUrl = new URL(uri);

    const uriSecret = uriUrl.searchParams.get("secret");

const inputVerify = inputCode
  ? await verify({
      secret: admin.totpSecret,
      token: inputCode,
      epochTolerance: 30,
    })
  : null;
const secret = admin.totpSecret;
const now = Math.floor(Date.now() / 1000);

const timeChecks = inputCode
  ? await Promise.all(
      [-60, -30, 0, 30, 60].map(async (offset) => {
        const epoch = now + offset;

        const result = await verify({
          secret,
          token: inputCode,
          epoch,
          epochTolerance: 0,
        });

        return {
          offset,
          valid: result.valid,
          epoch,
        };
      })
    )
  : [];


    return NextResponse.json({
      success: true,

      admin: {
        username: admin.username,
        totpEnabled: admin.totpEnabled,
        hasTotpSecret: Boolean(admin.totpSecret),
      },

      backend: {
        generatedCode: backendCode,
        generatedCodeValid: backendVerify.valid,
      },

      uri: {
        scheme: uriUrl.protocol.replace(":", ""),
        type: uriUrl.pathname,
        secretMatchesDatabase:
          uriSecret === admin.totpSecret,
        issuer: uriUrl.searchParams.get("issuer"),
        algorithm:
          uriUrl.searchParams.get("algorithm") ?? "default",
        digits:
          uriUrl.searchParams.get("digits") ?? "default",
        period:
          uriUrl.searchParams.get("period") ?? "default",
        label:
          uriUrl.pathname + uriUrl.searchParams.toString(),
      },

      authenticator: inputCode
        ? {
            suppliedCode: inputCode,
            valid: inputVerify?.valid ?? false,
            matchesBackendCode: inputCode === backendCode,
          }
        : {
            suppliedCode: null,
            valid: null,
            matchesBackendCode: null,
          },
timeChecks,

    });
  } catch (error) {
    console.error("TOTP full diagnostic error:", error);

    return NextResponse.json(
      {
        error: "TOTP kapsamlı tanı testi başarısız.",
      },
      { status: 500 }
    );
  }
}