import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getCurrentAdmin } from "../../../../../lib/admin-session";
import { hashPassword } from "../../../../../lib/admin-password";
import { verifyTotpCode } from "../../../../../lib/admin-totp";

const RECOVERY_CODE_COUNT = 8;

function createRecoveryCode() {
  const value = randomBytes(4).toString("hex").toUpperCase();
  return `${value.slice(0, 4)}-${value.slice(4, 8)}`;
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Yetkisiz erişim." },
        { status: 401 }
      );
    }

    if (!admin.totpEnabled || !admin.totpSecret) {
      return NextResponse.json(
        { error: "Önce Authenticator doğrulamasını aktif et." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const code =
      typeof body.code === "string"
        ? body.code.trim()
        : "";

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "6 haneli Authenticator kodunu gir." },
        { status: 400 }
      );
    }

    const valid = await verifyTotpCode(
      admin.totpSecret,
      code
    );

    if (!valid) {
      return NextResponse.json(
        { error: "Authenticator kodu geçersiz." },
        { status: 400 }
      );
    }

    const recoveryCodes = Array.from(
      { length: RECOVERY_CODE_COUNT },
      createRecoveryCode
    );

    const hashedCodes = await Promise.all(
      recoveryCodes.map((recoveryCode) =>
        hashPassword(recoveryCode)
      )
    );

    await prisma.$transaction(async (tx) => {
      await tx.adminRecoveryCode.deleteMany({
        where: {
          adminId: admin.id,
        },
      });

      await tx.adminRecoveryCode.createMany({
        data: hashedCodes.map((codeHash) => ({
          adminId: admin.id,
          codeHash,
        })),
      });
    });

    return NextResponse.json({
      success: true,
      recoveryCodes,
    });
  } catch (error) {
    console.error("Recovery code regeneration error:", error);

    return NextResponse.json(
      {
        error: "Recovery kodları oluşturulurken bir hata oluştu.",
      },
      { status: 500 }
    );
  }
}
