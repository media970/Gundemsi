import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";

export async function GET() {
  const settings = await prisma.siteSetting.findMany();

  const result: Record<string, string> = {};

  for (const setting of settings) {
    result[setting.key] = setting.value;
  }

  return NextResponse.json(result);
}