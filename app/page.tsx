"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";
import TransactionForm from "@/components/TransactionForm";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: string;
  category: { name: string; icon: string; color: string };
}

interface Analytics {
  currentMonth: { income: number; expense: number; balance: number };
  categoryBreakdown: { name: string; icon: string; color: string; total: number }[];
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const now = new Date();
    const [txRes, analyticsRes] = await Promise.all([
      fetch(`/api/transactions?month=${now.getMonth() + 1}&year=${now.getFullYear()}`),
      fetch("/api/analytics?months=1"),
    ]);
    const [txData, analyticsData] = await Promise.all([txRes.json(), analyticsRes.json()]);
    setTransactions(txData.slice(0, 6));
    setAnalytics(analyticsData);
  }

  useEffect(() => { load(); }, []);

  const now = new Date();
  const monthName = now.toLocaleDateString("es-MX", { month: "long", year: "numeric" });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm capitalize mt-1">{monthName}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Nueva transacción
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="Ingresos del mes" amount={analytics?.currentMonth.income ?? 0} icon="📈" color="green" subtitle="Total recibido" />
        <StatCard title="Gastos del mes" amount={analytics?.currentMonth.expense ?? 0} icon="📉" color="red" subtitle="Total gastado" />
        <StatCard title="Balance" amount={analytics?.currentMonth.balance ?? 0} icon="💰" color={(analytics?.currentMonth.balance ?? 0) >= 0 ? "blue" : "purple"} subtitle="Ingresos - Gastos" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Últimas transacciones</h2>
            <Link href="/transacciones" className="text-xs text-indigo-400 hover:text-indigo-300">Ver todas →</Link>
          </div>
          <div className="flex flex-col gap-3">
            {transactions.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Sin transacciones este mes</p>}
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <span className="text-xl w-8 text-center">{t.category.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{t.description}</p>
                  <p className="text-xs text-gray-500">{t.category.name} · {new Date(t.date).toLocaleDateString("es-MX")}</p>
                </div>
                <span className={`text-sm font-semibold flex items-center gap-1 ${t.type === "income" ? "text-green-400" : "text-red-400"}`}>
                  {t.type === "income" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  ${t.amount.toLocaleString("es-MX")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Gastos por categoría</h2>
            <Link href="/analytics" className="text-xs text-indigo-400 hover:text-indigo-300">Ver analytics →</Link>
          </div>
          <div className="flex flex-col gap-3">
            {(analytics?.categoryBreakdown ?? []).slice(0, 6).map((cat) => {
              const total = analytics?.currentMonth.expense ?? 1;
              const pct = Math.round((cat.total / total) * 100);
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">{cat.icon} {cat.name}</span>
                    <span className="text-sm font-medium text-white">${cat.total.toLocaleString("es-MX")} <span className="text-gray-500 text-xs">({pct}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                  </div>
                </div>
              );
            })}
            {(analytics?.categoryBreakdown ?? []).length === 0 && <p className="text-gray-500 text-sm text-center py-4">Sin gastos este mes</p>}
          </div>
        </div>
      </div>

      {showForm && <TransactionForm onClose={() => setShowForm(false)} onSaved={load} />}
    </div>
  );
}
