import { NextResponse } from "next/server";
import { getCurrentAdmin } from "../../../../../../lib/admin-session";
import { selfTestTotp } from "../../../../../../lib/admin-totp";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Yetkisiz erişim." },
        { status: 401 }
      );
    }

    const result = await selfTestTotp();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("TOTP self-test error:", error);

    return NextResponse.json(
      { error: "TOTP self-test başarısız." },
      { status: 500 }
    );
  }
}
