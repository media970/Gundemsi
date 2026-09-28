import { NextResponse } from "next/server";
import { getCurrentAdmin } from "../../../../../../lib/admin-session";
import { createTotpUri } from "../../../../../../lib/admin-totp";

export async function GET() {
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
        { error: "TOTP secret bulunamadı." },
        { status: 400 }
      );
    }

    const otpauthUrl = createTotpUri(admin.username, admin.totpSecret);
    const parsed = new URL(otpauthUrl);

    const secretFromUri = parsed.searchParams.get("secret") ?? "";

    return NextResponse.json({
      success: true,
      scheme: parsed.protocol.replace(":", ""),
      type: parsed.hostname,
      secretMatchesDatabase:
        secretFromUri.toUpperCase() === admin.totpSecret.toUpperCase(),
      issuer: parsed.searchParams.get("issuer"),
      digits: parsed.searchParams.get("digits") ?? "default",
      period: parsed.searchParams.get("period") ?? "default",
      algorithm: parsed.searchParams.get("algorithm") ?? "default",
      label: decodeURIComponent(parsed.pathname.slice(1)),
    });
  } catch (error) {
    console.error("TOTP URI diagnostic error:", error);

    return NextResponse.json(
      { error: "TOTP URI tanı testi başarısız." },
      { status: 500 }
    );
  }
}
