import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import {
  hashPassword,
  verifyPassword,
} from "../../../../lib/admin-password";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username =
      typeof body.username === "string"
        ? body.username.trim().toLowerCase()
        : "";

    const recoveryCode =
      typeof body.recoveryCode === "string"
        ? body.recoveryCode.replace(/\s/g, "").toUpperCase()
        : "";

    const newPassword =
      typeof body.newPassword === "string"
        ? body.newPassword
        : "";

    const confirmPassword =
      typeof body.confirmPassword === "string"
        ? body.confirmPassword
        : "";

    if (!username || !recoveryCode) {
      return NextResponse.json(
        { error: "Kullanıcı adı ve recovery kodu gerekli." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
      return NextResponse.json(
        { error: "Yeni şifre 8-128 karakter arasında olmalı." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Yeni şifreler eşleşmiyor." },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Kullanıcı adı veya recovery kodu hatalı." },
        { status: 401 }
      );
    }

    if (!admin.totpEnabled) {
      return NextResponse.json(
        {
          error:
            "Bu hesapta 2FA aktif değil. Şifre kurtarma kodları kullanılamaz.",
        },
        { status: 400 }
      );
    }

    const recoveryCodes =
      await prisma.adminRecoveryCode.findMany({
        where: {
          adminId: admin.id,
          usedAt: null,
        },
        select: {
          id: true,
          codeHash: true,
        },
      });

    let recoveryCodeId: string | null = null;

    for (const item of recoveryCodes) {
      const matches = await verifyPassword(
        recoveryCode,
        item.codeHash
      );

      if (matches) {
        recoveryCodeId = item.id;
        break;
      }
    }

    if (!recoveryCodeId) {
      return NextResponse.json(
        { error: "Kullanıcı adı veya recovery kodu hatalı." },
        { status: 401 }
      );
    }

    const newPasswordHash = await hashPassword(newPassword);

    const result = await prisma.$transaction(async (tx) => {
      await tx.admin.update({
        where: {
          id: admin.id,
        },
        data: {
          passwordHash: newPasswordHash,
        },
      });

      const consumed = await tx.adminRecoveryCode.updateMany({
        where: {
          id: recoveryCodeId!,
          adminId: admin.id,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });

      return consumed.count;
    });

    if (result !== 1) {
      return NextResponse.json(
        { error: "Recovery kodu hatalı veya daha önce kullanılmış." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      { error: "Sunucu hatası." },
      { status: 500 }
    );
  }
}
