import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET() {
  try {
    const admin = await prisma.admin.findFirst({
      select: {
        id: true,
      },
    });

    return NextResponse.json({
      exists: Boolean(admin),
    });
  } catch (error) {
    console.error("Admin setup status error:", error);

    return NextResponse.json(
      { error: "Kurulum durumu alınamadı." },
      { status: 500 }
    );
  }
}