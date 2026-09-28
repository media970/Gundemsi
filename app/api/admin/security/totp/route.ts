import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getCurrentAdmin } from "../../../../../lib/admin-session";
import {
  createTotpSecret,
  createTotpUri,
  verifyTotpCode,
} from "../../../../../lib/admin-totp";
import {
  generateRecoveryCodes,
  hashRecoveryCode,
} from "../../../../../lib/admin-recovery";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Yetkisiz erişim." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      totpEnabled: admin.totpEnabled,
    });
  } catch (error) {
    console.error("TOTP status error:", error);

    return NextResponse.json(
      { error: "TOTP durumu alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
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

    const body = await request.json().catch(() => ({}));
    const action =
      typeof body.action === "string" ? body.action : "";

    if (action === "setup") {
      if (admin.totpEnabled) {
        return NextResponse.json(
          { error: "TOTP zaten aktif." },
          { status: 400 }
        );
      }

      const secret = createTotpSecret();
      const otpauthUrl = createTotpUri(
        admin.username,
        secret
      );

      await prisma.admin.update({
        where: {
          id: admin.id,
        },
        data: {
          totpSecret: secret,
          totpEnabled: false,
        },
      });

      return NextResponse.json({
        success: true,
        otpauthUrl,
        secret,
      });
    }

    if (action === "verify") {
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
    }

    if (action === "disable") {
      if (!admin.totpEnabled || !admin.totpSecret) {
        return NextResponse.json(
          { error: "TOTP zaten aktif değil." },
          { status: 400 }
        );
      }

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
    }

    if (action === "recovery-regenerate") {
      if (!admin.totpEnabled || !admin.totpSecret) {
        return NextResponse.json(
          { error: "Önce Authenticator doğrulamasını aktif et." },
          { status: 400 }
        );
      }

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

      const recoveryCodes = generateRecoveryCodes();

      await prisma.adminRecoveryCode.deleteMany({
        where: {
          adminId: admin.id,
        },
      });

      await prisma.adminRecoveryCode.createMany({
        data: recoveryCodes.map((recoveryCode) => ({
          adminId: admin.id,
          codeHash: hashRecoveryCode(recoveryCode),
        })),
      });

      return NextResponse.json({
        success: true,
        recoveryCodes,
      });
    }

    if (action === "recovery-codes") {
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
    }

    return NextResponse.json(
      { error: "Geçersiz TOTP işlemi." },
      { status: 400 }
    );
  } catch (error) {
    console.error("TOTP error:", error);

    return NextResponse.json(
      { error: "TOTP işlemi sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}