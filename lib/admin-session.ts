import { cookies } from "next/headers";
import prisma from "./prisma";
import {
  ADMIN_COOKIE,
  verifyAdminSession,
} from "./admin-auth";

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE)?.value;

  const session = await verifyAdminSession(sessionCookie);

  if (!session) {
    return null;
  }

  const admin = await prisma.admin.findUnique({
    where: {
      id: session.adminId,
    },
  });

  if (!admin) {
    return null;
  }

  if (admin.sessionVersion !== session.sessionVersion) {
    return null;
  }

  return admin;
}

export async function invalidateAdminSessions(
  adminId: string
) {
  return prisma.admin.update({
    where: {
      id: adminId,
    },
    data: {
      sessionVersion: {
        increment: 1,
      },
    },
  });
}