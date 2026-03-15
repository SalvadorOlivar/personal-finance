// @ts-ignore
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import * as fs from "fs";

const adapter = new PrismaLibSql({ url: "file:C:/GIT/gastos/dev.db" });
const prisma = new PrismaClient({ adapter } as never);

// Mapeo de categorías Monefy → nuestras categorías
const CATEGORY_MAP: Record<string, { name: string; icon: string; color: string; type: "expense" | "income" }> = {
  // Gastos
  "Comida":           { name: "Comida", icon: "🍔", color: "#ef4444", type: "expense" },
  "Restaurante":      { name: "Restaurante", icon: "🍽️", color: "#f97316", type: "expense" },
  "Transporte":       { name: "Transporte", icon: "🚌", color: "#f59e0b", type: "expense" },
  "Taxi":             { name: "Taxi", icon: "🚕", color: "#eab308", type: "expense" },
  "Automóvil":        { name: "Automóvil", icon: "🚗", color: "#84cc16", type: "expense" },
  "Facturas":         { name: "Facturas", icon: "📄", color: "#8b5cf6", type: "expense" },
  "Comunicaciones":   { name: "Comunicaciones", icon: "📱", color: "#6366f1", type: "expense" },
  "Casa":             { name: "Casa", icon: "🏠", color: "#3b82f6", type: "expense" },
  "Salud":            { name: "Salud", icon: "🏥", color: "#06b6d4", type: "expense" },
  "Deportes":         { name: "Deportes", icon: "🏋️", color: "#14b8a6", type: "expense" },
  "Ropa":             { name: "Ropa", icon: "👕", color: "#ec4899", type: "expense" },
  "Entretenimiento":  { name: "Entretenimiento", icon: "🎬", color: "#a855f7", type: "expense" },
  "Higiene":          { name: "Higiene", icon: "🧴", color: "#10b981", type: "expense" },
  "Mascotas":         { name: "Mascotas", icon: "🐾", color: "#f472b6", type: "expense" },
  "Regalos":          { name: "Regalos", icon: "🎁", color: "#fb923c", type: "expense" },
  // Ingresos
  "Salario":          { name: "Salario", icon: "💼", color: "#22c55e", type: "income" },
  "Depósitos":        { name: "Depósitos", icon: "💰", color: "#10b981", type: "income" },
  "Ahorros":          { name: "Ahorros", icon: "🏦", color: "#14b8a6", type: "income" },
};

function parseMonefyAmount(raw: string): number {
  // Monefy uses "1,234" with commas as thousands separator
  // Fields may be quoted: "23,307" or "-4,800"
  const cleaned = raw.replace(/"/g, "").replace(/,/g, "");
  return parseFloat(cleaned);
}

function parseMonefyDate(raw: string): Date {
  // Format: DD/MM/YYYY
  const [day, month, year] = raw.split("/").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

// Simple CSV parser that handles quoted fields with commas
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

async function main() {
  const csvPath = "c:/Users/salva/Downloads/Monefy.Data.7-3-2026.csv";
  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.split("\n").filter(l => l.trim());

  // Skip header
  const dataLines = lines.slice(1);
  console.log(`📄 ${dataLines.length} registros encontrados en el CSV`);

  // Limpiar datos existentes
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();

  // Crear categorías
  const categoryCache: Record<string, string> = {};
  for (const [monefyCat, config] of Object.entries(CATEGORY_MAP)) {
    const cat = await prisma.category.create({
      data: { name: config.name, icon: config.icon, color: config.color, type: config.type },
    });
    categoryCache[monefyCat] = cat.id;
  }
  console.log(`✅ ${Object.keys(categoryCache).length} categorías creadas`);

  // Importar transacciones
  let imported = 0;
  let skipped = 0;

  for (const line of dataLines) {
    const fields = parseCSVLine(line);
    if (fields.length < 8) { skipped++; continue; }

    const [dateStr, , category, amountStr, , , , description] = fields;

    const categoryId = categoryCache[category];
    if (!categoryId) {
      console.warn(`⚠️ Categoría desconocida: "${category}" — saltando`);
      skipped++;
      continue;
    }

    const rawAmount = parseMonefyAmount(amountStr);
    if (isNaN(rawAmount)) { skipped++; continue; }

    const type = rawAmount >= 0 ? "income" : "expense";
    const amount = Math.abs(rawAmount);
    const date = parseMonefyDate(dateStr);

    await prisma.transaction.create({
      data: {
        amount,
        description: description || category,
        date,
        type,
        categoryId,
      },
    });
    imported++;
  }

  console.log(`\n✅ Importación completada:`);
  console.log(`   ${imported} transacciones importadas`);
  console.log(`   ${skipped} registros saltados`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
