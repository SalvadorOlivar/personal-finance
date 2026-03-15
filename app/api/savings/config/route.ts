import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const config = await prisma.savingsConfig.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", minimumBalance: 0 },
  });
  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  const { minimumBalance } = await request.json();
  const config = await prisma.savingsConfig.upsert({
    where: { id: "default" },
    update: { minimumBalance },
    create: { id: "default", minimumBalance },
  });
  return NextResponse.json(config);
}
