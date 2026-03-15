// @ts-ignore
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:C:/GIT/gastos/dev.db" });
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  const mascotas = await prisma.category.findFirst({ where: { name: "Mascotas" } });
  const ahorros = await prisma.category.findFirst({ where: { name: "Ahorros" } });

  if (!mascotas || !ahorros) {
    console.log("No se encontraron las categorías");
    return;
  }

  const matches = await prisma.transaction.findMany({
    where: { categoryId: mascotas.id, description: { contains: "horro" } },
  });

  console.log(`Encontradas ${matches.length} transacciones de Mascotas con "ahorro":`);
  for (const t of matches) {
    console.log(`  ${t.date.toISOString().slice(0, 10)} | ${t.description} | $${t.amount}`);
  }

  const result = await prisma.transaction.updateMany({
    where: { categoryId: mascotas.id, description: { contains: "horro" } },
    data: { categoryId: ahorros.id, type: "income" },
  });

  console.log(`\n✅ ${result.count} transacciones movidas de Mascotas → Ahorros`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
