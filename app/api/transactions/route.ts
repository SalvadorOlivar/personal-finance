import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const type = searchParams.get("type");

  const where: Record<string, unknown> = {};

  if (month && year) {
    const start = new Date(parseInt(year), parseInt(month) - 1, 1);
    const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    where.date = { gte: start, lte: end };
  }

  if (type) where.type = type;

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  const body = await request.json();
  const transaction = await prisma.transaction.create({
    data: {
      ...body,
      date: new Date(body.date),
    },
    include: { category: true },
  });
  return NextResponse.json(transaction, { status: 201 });
}
