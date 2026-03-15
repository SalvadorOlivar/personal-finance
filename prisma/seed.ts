// @ts-ignore - tsx resolves .ts extensions at runtime
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:C:/GIT/gastos/dev.db" });
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  await prisma.savingsTransaction.deleteMany();
  await prisma.savingsGoal.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();

  const expenseCategories = await Promise.all([
    prisma.category.create({ data: { name: "Alimentación", icon: "🛒", color: "#ef4444", type: "expense" } }),
    prisma.category.create({ data: { name: "Transporte", icon: "🚗", color: "#f97316", type: "expense" } }),
    prisma.category.create({ data: { name: "Entretenimiento", icon: "🎬", color: "#a855f7", type: "expense" } }),
    prisma.category.create({ data: { name: "Salud", icon: "🏥", color: "#06b6d4", type: "expense" } }),
    prisma.category.create({ data: { name: "Hogar", icon: "🏠", color: "#84cc16", type: "expense" } }),
    prisma.category.create({ data: { name: "Ropa", icon: "👕", color: "#ec4899", type: "expense" } }),
    prisma.category.create({ data: { name: "Educación", icon: "📚", color: "#3b82f6", type: "expense" } }),
    prisma.category.create({ data: { name: "Otros", icon: "📦", color: "#6b7280", type: "expense" } }),
  ]);

  const incomeCategories = await Promise.all([
    prisma.category.create({ data: { name: "Salario", icon: "💼", color: "#22c55e", type: "income" } }),
    prisma.category.create({ data: { name: "Freelance", icon: "💻", color: "#10b981", type: "income" } }),
    prisma.category.create({ data: { name: "Inversiones", icon: "📈", color: "#14b8a6", type: "income" } }),
    prisma.category.create({ data: { name: "Otros ingresos", icon: "💰", color: "#84cc16", type: "income" } }),
  ]);

  const now = new Date();
  const transactions = [
    // Mes actual
    { amount: 25000, description: "Salario marzo", date: new Date(now.getFullYear(), now.getMonth(), 5), type: "income", categoryId: incomeCategories[0].id },
    { amount: 3500, description: "Super mercado", date: new Date(now.getFullYear(), now.getMonth(), 6), type: "expense", categoryId: expenseCategories[0].id },
    { amount: 800, description: "Gasolina", date: new Date(now.getFullYear(), now.getMonth(), 7), type: "expense", categoryId: expenseCategories[1].id },
    { amount: 5000, description: "Proyecto web freelance", date: new Date(now.getFullYear(), now.getMonth(), 10), type: "income", categoryId: incomeCategories[1].id },
    { amount: 350, description: "Netflix + Spotify", date: new Date(now.getFullYear(), now.getMonth(), 12), type: "expense", categoryId: expenseCategories[2].id },
    { amount: 1200, description: "Farmacia", date: new Date(now.getFullYear(), now.getMonth(), 14), type: "expense", categoryId: expenseCategories[3].id },
    { amount: 4500, description: "Renta", date: new Date(now.getFullYear(), now.getMonth(), 1), type: "expense", categoryId: expenseCategories[4].id },
    { amount: 2800, description: "Despensa semanal", date: new Date(now.getFullYear(), now.getMonth(), 18), type: "expense", categoryId: expenseCategories[0].id },
    { amount: 1500, description: "Ropa de temporada", date: new Date(now.getFullYear(), now.getMonth(), 20), type: "expense", categoryId: expenseCategories[5].id },
    { amount: 600, description: "Uber / Taxi", date: new Date(now.getFullYear(), now.getMonth(), 22), type: "expense", categoryId: expenseCategories[1].id },
    { amount: 1800, description: "Curso en línea", date: new Date(now.getFullYear(), now.getMonth(), 23), type: "expense", categoryId: expenseCategories[6].id },
    { amount: 2200, description: "Dividendos", date: new Date(now.getFullYear(), now.getMonth(), 25), type: "income", categoryId: incomeCategories[2].id },
    // Mes anterior
    { amount: 25000, description: "Salario", date: new Date(now.getFullYear(), now.getMonth() - 1, 5), type: "income", categoryId: incomeCategories[0].id },
    { amount: 4200, description: "Super y abarrotes", date: new Date(now.getFullYear(), now.getMonth() - 1, 8), type: "expense", categoryId: expenseCategories[0].id },
    { amount: 900, description: "Gasolina", date: new Date(now.getFullYear(), now.getMonth() - 1, 10), type: "expense", categoryId: expenseCategories[1].id },
    { amount: 4500, description: "Renta", date: new Date(now.getFullYear(), now.getMonth() - 1, 1), type: "expense", categoryId: expenseCategories[4].id },
    { amount: 350, description: "Plataformas streaming", date: new Date(now.getFullYear(), now.getMonth() - 1, 12), type: "expense", categoryId: expenseCategories[2].id },
    { amount: 3000, description: "Freelance diseño", date: new Date(now.getFullYear(), now.getMonth() - 1, 15), type: "income", categoryId: incomeCategories[1].id },
    { amount: 850, description: "Consulta médica", date: new Date(now.getFullYear(), now.getMonth() - 1, 18), type: "expense", categoryId: expenseCategories[3].id },
    { amount: 2100, description: "Restaurantes", date: new Date(now.getFullYear(), now.getMonth() - 1, 22), type: "expense", categoryId: expenseCategories[0].id },
    { amount: 500, description: "Transporte público", date: new Date(now.getFullYear(), now.getMonth() - 1, 25), type: "expense", categoryId: expenseCategories[1].id },
    // Hace 2 meses
    { amount: 25000, description: "Salario", date: new Date(now.getFullYear(), now.getMonth() - 2, 5), type: "income", categoryId: incomeCategories[0].id },
    { amount: 3800, description: "Supermercado", date: new Date(now.getFullYear(), now.getMonth() - 2, 9), type: "expense", categoryId: expenseCategories[0].id },
    { amount: 750, description: "Gasolina", date: new Date(now.getFullYear(), now.getMonth() - 2, 11), type: "expense", categoryId: expenseCategories[1].id },
    { amount: 4500, description: "Renta", date: new Date(now.getFullYear(), now.getMonth() - 2, 1), type: "expense", categoryId: expenseCategories[4].id },
    { amount: 350, description: "Streaming", date: new Date(now.getFullYear(), now.getMonth() - 2, 13), type: "expense", categoryId: expenseCategories[2].id },
    { amount: 8000, description: "Proyecto especial", date: new Date(now.getFullYear(), now.getMonth() - 2, 20), type: "income", categoryId: incomeCategories[1].id },
    { amount: 2500, description: "Ropa y accesorios", date: new Date(now.getFullYear(), now.getMonth() - 2, 24), type: "expense", categoryId: expenseCategories[5].id },
    { amount: 1200, description: "Libros y cursos", date: new Date(now.getFullYear(), now.getMonth() - 2, 26), type: "expense", categoryId: expenseCategories[6].id },
    { amount: 1800, description: "Salida a restaurante", date: new Date(now.getFullYear(), now.getMonth() - 2, 28), type: "expense", categoryId: expenseCategories[2].id },
  ];

  for (const t of transactions) {
    await prisma.transaction.create({ data: t });
  }

  // Metas de ahorro demo
  const goals = await Promise.all([
    prisma.savingsGoal.create({ data: { name: "Fondo de emergencia", targetAmount: 50000, icon: "🛡️", color: "#6366f1" } }),
    prisma.savingsGoal.create({ data: { name: "Vacaciones Europa", targetAmount: 30000, icon: "✈️", color: "#ec4899" } }),
    prisma.savingsGoal.create({ data: { name: "Laptop nueva", targetAmount: 25000, icon: "💻", color: "#14b8a6" } }),
  ]);

  const savingsTxs = [
    { amount: 2000, date: new Date(now.getFullYear(), now.getMonth() - 4, 10), goalId: goals[0].id, notes: "Ahorro mensual" },
    { amount: 2000, date: new Date(now.getFullYear(), now.getMonth() - 3, 10), goalId: goals[0].id, notes: "Ahorro mensual" },
    { amount: 2500, date: new Date(now.getFullYear(), now.getMonth() - 2, 10), goalId: goals[0].id, notes: "Extra de freelance" },
    { amount: 2000, date: new Date(now.getFullYear(), now.getMonth() - 1, 10), goalId: goals[0].id, notes: "Ahorro mensual" },
    { amount: 2000, date: new Date(now.getFullYear(), now.getMonth(), 10), goalId: goals[0].id, notes: "Ahorro mensual" },
    { amount: 1500, date: new Date(now.getFullYear(), now.getMonth() - 3, 15), goalId: goals[1].id, notes: "Ahorro vacaciones" },
    { amount: 1500, date: new Date(now.getFullYear(), now.getMonth() - 2, 15), goalId: goals[1].id, notes: "Ahorro vacaciones" },
    { amount: 2000, date: new Date(now.getFullYear(), now.getMonth() - 1, 15), goalId: goals[1].id, notes: "Extra" },
    { amount: 1500, date: new Date(now.getFullYear(), now.getMonth(), 15), goalId: goals[1].id, notes: "Ahorro vacaciones" },
    { amount: 3000, date: new Date(now.getFullYear(), now.getMonth() - 2, 20), goalId: goals[2].id, notes: "Arranque" },
    { amount: 3000, date: new Date(now.getFullYear(), now.getMonth() - 1, 20), goalId: goals[2].id, notes: "Mensual" },
    { amount: 3000, date: new Date(now.getFullYear(), now.getMonth(), 20), goalId: goals[2].id, notes: "Mensual" },
  ];

  for (const s of savingsTxs) {
    await prisma.savingsTransaction.create({ data: s });
  }

  console.log("✅ Seed:", transactions.length, "transacciones +", savingsTxs.length, "depósitos de ahorro");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
