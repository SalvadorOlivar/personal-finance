"use client";

import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  _count?: { transactions: number };
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  async function load() {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  }

  useEffect(() => { load(); }, []);

  const expense = categories.filter(c => c.type === "expense");
  const income = categories.filter(c => c.type === "income");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Categorías</h1>
        <p className="text-gray-400 text-sm mt-1">Categorías predefinidas para organizar tus transacciones</p>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wide mb-3">Gastos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {expense.map(c => (
            <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">{c.icon}</div>
              <p className="text-sm font-medium text-white">{c.name}</p>
              <div className="w-full h-1 rounded-full mt-2" style={{ backgroundColor: c.color }} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-3">Ingresos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {income.map(c => (
            <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">{c.icon}</div>
              <p className="text-sm font-medium text-white">{c.name}</p>
              <div className="w-full h-1 rounded-full mt-2" style={{ backgroundColor: c.color }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
