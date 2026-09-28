import { NextRequest, NextResponse } from "next/server";
import prisma from "./lib/prisma";
import {
  ADMIN_COOKIE,
  verifyAdminSession,
} from "./lib/admin-auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(ADMIN_COOKIE)?.value;
  const session = await verifyAdminSession(sessionCookie);

  if (!session) {
    if (isAdminApi) {
      return NextResponse.json(
        { error: "Oturum geçersiz." },
        { status: 401 }
      );
    }

    return NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
  }

  const admin = await prisma.admin.findUnique({
    where: {
      id: session.adminId,
    },
    select: {
      id: true,
      sessionVersion: true,
    },
  });

  if (
    !admin ||
    admin.sessionVersion !== session.sessionVersion
  ) {
    const response = isAdminApi
      ? NextResponse.json(
          { error: "Oturum geçersiz." },
          { status: 401 }
        )
      : NextResponse.redirect(
          new URL("/admin/login", request.url)
        );

    response.cookies.delete(ADMIN_COOKIE);

    return response;
  }

const requestHeaders = new Headers(request.headers);

requestHeaders.set("x-admin-id", admin.id);

return NextResponse.next({
  request: {
    headers: requestHeaders,
  },
});
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};