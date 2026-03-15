import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const months = parseInt(searchParams.get("months") ?? "6");

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months + 1);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: startDate } },
    include: { category: true },
    orderBy: { date: "asc" },
  });

  // Agrupar por mes
  const byMonth: Record<string, { income: number; expense: number; label: string }> = {};
  for (const t of transactions) {
    const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, "0")}`;
    const label = t.date.toLocaleDateString("es-MX", { month: "short", year: "numeric" });
    if (!byMonth[key]) byMonth[key] = { income: 0, expense: 0, label };
    if (t.type === "income") byMonth[key].income += t.amount;
    else byMonth[key].expense += t.amount;
  }

  const monthlyTrend = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => ({ ...v, balance: v.income - v.expense }));

  // Gastos por categoría (mes actual)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthExpenses = transactions.filter(
    (t) => t.type === "expense" && t.date >= monthStart
  );

  const byCategory: Record<string, { name: string; icon: string; color: string; total: number }> = {};
  for (const t of monthExpenses) {
    if (!byCategory[t.categoryId]) {
      byCategory[t.categoryId] = {
        name: t.category.name,
        icon: t.category.icon,
        color: t.category.color,
        total: 0,
      };
    }
    byCategory[t.categoryId].total += t.amount;
  }

  const categoryBreakdown = Object.values(byCategory).sort((a, b) => b.total - a.total);

  // Totales del mes actual
  const currentMonthTransactions = transactions.filter((t) => t.date >= monthStart);
  const totalIncome = currentMonthTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = currentMonthTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return NextResponse.json({
    monthlyTrend,
    categoryBreakdown,
    currentMonth: {
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense,
    },
  });
}
