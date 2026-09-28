import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getCurrentAdmin } from "../../../../lib/admin-session";

export async function GET() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const settings = await prisma.siteSetting.findMany();

  const result: Record<string, string> = {};

  for (const setting of settings) {
    result[setting.key] = setting.value;
  }

  return NextResponse.json({
    ...result,
    totpEnabled: admin.totpEnabled,
  });
}

export async function PUT(request: Request) {
  const body = await request.json();

  const instagram = String(body.instagram ?? "").trim();

  if (
    instagram &&
    !/^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._-]+\/?$/.test(
      instagram
    )
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Geçerli bir Instagram bağlantısı girin.",
      },
      { status: 400 }
    );
  }

  await prisma.siteSetting.upsert({
    where: {
      key: "instagram",
    },
    update: {
      value: instagram,
    },
    create: {
      key: "instagram",
      value: instagram,
    },
  });

  return NextResponse.json({
    success: true,
  });
}