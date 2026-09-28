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

    if (!admin.totpSecret) {
      return NextResponse.json(
        { error: "Önce TOTP kurulumu başlatılmalı." },
        { status: 400 }
      );
    }

    if (admin.totpEnabled) {
      return NextResponse.json(
        { error: "TOTP zaten aktif." },
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
        totpEnabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "TOTP başarıyla aktif edildi.",
    });
  } catch (error) {
    console.error("TOTP verify error:", error);

    return NextResponse.json(
      {
        error: "TOTP doğrulaması sırasında bir hata oluştu.",
      },
      { status: 500 }
    );
  }
}