import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { verifyPassword } from "../../../../lib/admin-password";
import {
  ADMIN_COOKIE,
  createAdminSession,
  getSessionMaxAge,
} from "../../../../lib/admin-auth";

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

    if (!username || !password) {
      return NextResponse.json(
        { error: "Kullanıcı adı ve şifre gerekli." },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: {
        username,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Kullanıcı adı veya şifre hatalı." },
        { status: 401 }
      );
    }

    const validPassword = await verifyPassword(
      password,
      admin.passwordHash
    );

    if (!validPassword) {
      return NextResponse.json(
        { error: "Kullanıcı adı veya şifre hatalı." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      ok: true,
    });

    response.cookies.set({
      name: ADMIN_COOKIE,
value: await createAdminSession(
  admin.id,
  admin.sessionVersion
),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: getSessionMaxAge(),
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      { error: "Giriş yapılamadı." },
      { status: 500 }
    );
  }
}
