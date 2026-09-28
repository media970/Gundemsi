import { NextRequest, NextResponse } from "next/server";
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

return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};