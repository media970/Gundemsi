import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import {
  hashPassword,
  verifyPassword,
} from "../../../../lib/admin-password";
import {
  getCurrentAdmin,
  invalidateAdminSessions,
} from "../../../../lib/admin-session";
import { verifyTotpCode } from "../../../../lib/admin-totp";

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Yetkisiz erişim." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const currentPassword =
      typeof body.currentPassword === "string"
        ? body.currentPassword
        : "";

    const newPassword =
      typeof body.newPassword === "string"
        ? body.newPassword
        : "";

    const confirmPassword =
      typeof body.confirmPassword === "string"
        ? body.confirmPassword
        : "";

    const code =
      typeof body.code === "string"
        ? body.code.trim()
        : "";

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Mevcut şifreni gir." },
        { status: 400 }
      );
    }

    if (
      newPassword.length < 8 ||
      newPassword.length > 128
    ) {
      return NextResponse.json(
        {
          error:
            "Yeni şifre 8-128 karakter arasında olmalı.",
        },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Yeni şifreler eşleşmiyor." },
        { status: 400 }
      );
    }

    const validCurrentPassword =
      await verifyPassword(
        currentPassword,
        admin.passwordHash
      );

    if (!validCurrentPassword) {
      return NextResponse.json(
        { error: "Mevcut şifre hatalı." },
        { status: 400 }
      );
    }

    if (admin.totpEnabled) {
      if (!admin.totpSecret) {
        return NextResponse.json(
          { error: "TOTP yapılandırması eksik." },
          { status: 500 }
        );
      }

      if (!/^\d{6}$/.test(code)) {
        return NextResponse.json(
          {
            error:
              "TOTP aktif. Authenticator uygulamasındaki 6 haneli kodu gir.",
          },
          { status: 400 }
        );
      }

      const validTotp = await verifyTotpCode(
        admin.totpSecret,
        code
      );

      if (!validTotp) {
        return NextResponse.json(
          { error: "TOTP doğrulama kodu geçersiz." },
          { status: 400 }
        );
      }
    }

    const passwordHash =
      await hashPassword(newPassword);

    await prisma.admin.update({
      where: {
        id: admin.id,
      },
      data: {
        passwordHash,
      },
    });

    await invalidateAdminSessions(admin.id);

    return NextResponse.json({
      success: true,
      message:
        "Şifre başarıyla değiştirildi. Tekrar giriş yap.",
    });
  } catch (error) {
    console.error(
      "Admin password change error:",
      error
    );

    return NextResponse.json(
      { error: "Şifre değiştirilemedi." },
      { status: 500 }
    );
  }
}