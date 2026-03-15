import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const goals = await prisma.savingsGoal.findMany({
    include: {
      transactions: { orderBy: { date: "desc" } },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(goals);
}

export async function POST(request: Request) {
  const body = await request.json();
  const goal = await prisma.savingsGoal.create({ data: body });
  return NextResponse.json(goal, { status: 201 });
}
