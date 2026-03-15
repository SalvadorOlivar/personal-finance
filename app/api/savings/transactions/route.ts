import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const transactions = await prisma.savingsTransaction.findMany({
    include: { goal: true },
    orderBy: { date: "desc" },
    take: 50,
  });
  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  const body = await request.json();
  const tx = await prisma.savingsTransaction.create({
    data: { ...body, date: new Date(body.date) },
    include: { goal: true },
  });
  return NextResponse.json(tx, { status: 201 });
}
