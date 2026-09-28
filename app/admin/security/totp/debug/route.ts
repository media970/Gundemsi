import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/admin-session";
import {
  createTotpSecret,
  createTotpUri,
} from "@/lib/admin-totp";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          step: "session",
          error: "Oturum bulunamadı.",
        },
        { status: 401 }
      );
    }

    let secret: string;

    try {
      secret = createTotpSecret();

      if (!secret) {
        throw new Error("Secret boş döndü.");
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          step: "secret",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }

    let otpauthUrl: string;

    try {
      otpauthUrl = createTotpUri(admin.username, secret);

      if (!otpauthUrl.startsWith("otpauth://")) {
        throw new Error("Geçersiz otpauth URI.");
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          step: "uri",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }

    try {
      await prisma.admin.update({
        where: {
          id: admin.id,
        },
        data: {
          totpSecret: secret,
          totpEnabled: false,
        },
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          step: "prisma",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      steps: {
        session: "OK",
        secret: "OK",
        uri: "OK",
        prisma: "OK",
      },
    });
  } catch (error) {
    console.error("TOTP DEBUG ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        step: "unknown",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}