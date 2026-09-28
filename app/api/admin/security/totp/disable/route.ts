import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import { getCurrentAdmin } from "../../../../../../lib/admin-session";
import { verifyTotpCode } from "../../../../../../lib/admin-totp";

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
        { error: "TOTP zaten aktif değil." },
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
        { error: "6 haneli doğrulama kodunu gir." },
        { status: 400 }
      );
    }

    const valid = await verifyTotpCode(
      admin.totpSecret,
      code
    );

    if (!valid) {
      return NextResponse.json(
        { error: "Doğrulama kodu geçersiz." },
        { status: 400 }
      );
    }

    await prisma.admin.update({
      where: {
        id: admin.id,
      },
      data: {
        totpEnabled: false,
      },
    });

    await prisma.adminRecoveryCode.deleteMany({
      where: {
        adminId: admin.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "TOTP devre dışı bırakıldı.",
    });
  } catch (error) {
    console.error("TOTP disable error:", error);

    return NextResponse.json(
      {
        error: "TOTP devre dışı bırakılamadı.",
      },
      { status: 500 }
    );
  }
}