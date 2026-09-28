import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { verifyPassword } from "../../../../lib/admin-password";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const recoveryCode =
      typeof body.recoveryCode === "string"
        ? body.recoveryCode.replace(/\s/g, "").toUpperCase()
        : "";

    if (!recoveryCode) {
      return NextResponse.json(
        { error: "Recovery kodu gerekli." },
        { status: 400 }
      );
    }

    const recoveryCodes = await prisma.adminRecoveryCode.findMany({
      where: {
        usedAt: null,
      },
      select: {
        id: true,
        adminId: true,
        codeHash: true,
      },
    });

    let matchedAdmin: { id: string; username: string } | null = null;
    let matchedRecoveryCodeId: string | null = null;

    for (const item of recoveryCodes) {
      const matches = await verifyPassword(
        recoveryCode,
        item.codeHash
      );

      if (matches) {
        const admin = await prisma.admin.findUnique({
          where: { id: item.adminId },
          select: {
            id: true,
            username: true,
            totpEnabled: true,
          },
        });

        if (admin?.totpEnabled) {
          matchedAdmin = {
            id: admin.id,
            username: admin.username,
          };
          matchedRecoveryCodeId = item.id;
          break;
        }
      }
    }

    if (!matchedAdmin || !matchedRecoveryCodeId) {
      return NextResponse.json(
        {
          error:
            "Recovery kodu hatalı veya daha önce kullanılmış.",
        },
        { status: 401 }
      );
    }

    const consumed = await prisma.adminRecoveryCode.updateMany({
      where: {
        id: matchedRecoveryCodeId,
        adminId: matchedAdmin.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    if (consumed.count !== 1) {
      return NextResponse.json(
        {
          error:
            "Recovery kodu hatalı veya daha önce kullanılmış.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      username: matchedAdmin.username,
    });
  } catch (error) {
    console.error("Forgot username error:", error);

    return NextResponse.json(
      { error: "Sunucu hatası." },
      { status: 500 }
    );
  }
}