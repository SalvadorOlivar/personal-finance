import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.pendingExpense.findMany({
    orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = await request.json();
  const item = await prisma.pendingExpense.create({ data: body });
  return NextResponse.json(item, { status: 201 });
}
