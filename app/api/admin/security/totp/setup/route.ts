import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import { getCurrentAdmin } from "../../../../../../lib/admin-session";
import {
  createTotpSecret,
  createTotpUri,
} from "../../../../../../lib/admin-totp";

export async function POST() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Yetkisiz erişim." },
        { status: 401 }
      );
    }

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
  } catch (error) {
    console.error("TOTP setup error:", error);

    return NextResponse.json(
      {
        error: "TOTP kurulumu başlatılamadı.",
      },
      { status: 500 }
    );
  }
}