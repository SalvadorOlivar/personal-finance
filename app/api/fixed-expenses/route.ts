import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.fixedExpense.findMany({
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = await request.json();
  const item = await prisma.fixedExpense.create({ data: body });
  return NextResponse.json(item, { status: 201 });
}
