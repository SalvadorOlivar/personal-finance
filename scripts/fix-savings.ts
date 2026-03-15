// @ts-ignore
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:C:/GIT/gastos/dev.db" });
const prisma = new PrismaClient({ adapter } as never);

const CURRENT_BALANCE = 87524;

async function main() {
  const ahorros = await prisma.category.findFirst({ where: { name: "Ahorros" } });
  if (!ahorros) { console.log("No se encontró categoría Ahorros"); return; }

  // 1. Las transacciones de Ahorros deben ser gastos (dinero que sale de la cuenta del día a día)
  const ahorroTxs = await prisma.transaction.findMany({
    where: { categoryId: ahorros.id },
    orderBy: { date: "asc" },
  });

  console.log(`📊 ${ahorroTxs.length} transacciones de Ahorros encontradas`);

  await prisma.transaction.updateMany({
    where: { categoryId: ahorros.id },
    data: { type: "expense" },
  });
  console.log("✅ Transacciones de Ahorros marcadas como gasto");

  // 2. Limpiar savings transactions existentes (del seed anterior)
  await prisma.savingsTransaction.deleteMany();
  await prisma.savingsGoal.deleteMany();

  // 3. Crear una meta general "Cuenta de Ahorro"
  const mainGoal = await prisma.savingsGoal.create({
    data: {
      name: "Cuenta de Ahorro",
      targetAmount: 200000, // Meta a largo plazo
      icon: "🏦",
      color: "#22c55e",
    },
  });
  console.log("✅ Meta 'Cuenta de Ahorro' creada");

  // 4. Crear depósitos en savings por cada transferencia a ahorro
  let totalFromTransfers = 0;
  for (const tx of ahorroTxs) {
    await prisma.savingsTransaction.create({
      data: {
        amount: tx.amount,
        date: tx.date,
        notes: tx.description,
        goalId: mainGoal.id,
      },
    });
    totalFromTransfers += tx.amount;
  }
  console.log(`✅ ${ahorroTxs.length} depósitos creados en cuenta de ahorro`);
  console.log(`   Total de transferencias registradas: $${totalFromTransfers.toLocaleString()}`);

  // 5. Ajustar saldo: si el total de transferencias no coincide con el saldo real,
  //    agregar un ajuste inicial (dinero que ya estaba antes de registrar en Monefy)
  const diff = CURRENT_BALANCE - totalFromTransfers;
  if (Math.abs(diff) > 1) {
    const adjustDate = new Date(ahorroTxs[0]?.date ?? new Date());
    adjustDate.setDate(adjustDate.getDate() - 1); // Un día antes de la primera transferencia
    await prisma.savingsTransaction.create({
      data: {
        amount: diff,
        date: adjustDate,
        notes: diff > 0 ? "Saldo previo en cuenta de ahorro" : "Ajuste de saldo",
        goalId: mainGoal.id,
      },
    });
    console.log(`✅ Ajuste de saldo: ${diff > 0 ? "+" : ""}$${diff.toLocaleString()}`);
  }

  console.log(`\n💰 Saldo final en cuenta de ahorro: $${CURRENT_BALANCE.toLocaleString()}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
