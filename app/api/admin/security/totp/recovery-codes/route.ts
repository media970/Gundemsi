import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import { getCurrentAdmin } from "../../../../../../lib/admin-session";
import {
  generateRecoveryCodes,
  hashRecoveryCode,
} from "../../../../../../lib/admin-recovery";

export async function POST() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Yetkisiz erişim." },
        { status: 401 }
      );
    }

    if (!admin.totpEnabled) {
      return NextResponse.json(
        { error: "Önce TOTP aktif edilmelidir." },
        { status: 400 }
      );
    }

    const codes = generateRecoveryCodes();

    await prisma.adminRecoveryCode.deleteMany({
      where: {
        adminId: admin.id,
      },
    });

    await prisma.adminRecoveryCode.createMany({
      data: codes.map((code) => ({
        adminId: admin.id,
        codeHash: hashRecoveryCode(code),
      })),
    });

    return NextResponse.json({
      success: true,
      codes,
    });
  } catch (error) {
    console.error("Recovery codes generation error:", error);

    return NextResponse.json(
      {
        error: "Kurtarma kodları oluşturulamadı.",
      },
      { status: 500 }
    );
  }
}