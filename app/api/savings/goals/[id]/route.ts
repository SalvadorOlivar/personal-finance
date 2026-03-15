import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const goal = await prisma.savingsGoal.update({ where: { id }, data: body });
  return NextResponse.json(goal);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.savingsTransaction.deleteMany({ where: { goalId: id } });
  await prisma.savingsGoal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
