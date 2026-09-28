import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { hashPassword } from "../../../../lib/admin-password";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username =
      typeof body.username === "string"
        ? body.username.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!username || username.length < 3 || username.length > 32) {
      return NextResponse.json(
        {
          error: "Kullanıcı adı 3-32 karakter arasında olmalı.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > 128) {
      return NextResponse.json(
        {
          error: "Şifre 8-128 karakter arasında olmalı.",
        },
        { status: 400 }
      );
    }

    const adminCount = await prisma.admin.count();

    if (adminCount > 0) {
      return NextResponse.json(
        {
          error: "İlk yönetici hesabı zaten oluşturulmuş.",
        },
        { status: 403 }
      );
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { username },
    });

    if (existingAdmin) {
      return NextResponse.json(
        {
          error: "Bu kullanıcı adı zaten kullanılıyor.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const admin = await prisma.admin.create({
      data: {
        username,
        passwordHash,
        sessionVersion: 0,
        totpSecret: null,
        totpEnabled: false,
      },
      select: {
        id: true,
        username: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        admin,
        message: "Yönetici hesabı oluşturuldu.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin setup error:", error);

    return NextResponse.json(
      {
        error: "Yönetici hesabı oluşturulurken bir hata oluştu.",
      },
      { status: 500 }
    );
  }
}