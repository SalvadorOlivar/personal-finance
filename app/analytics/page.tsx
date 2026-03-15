"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

interface MonthData {
  label: string;
  income: number;
  expense: number;
  balance: number;
}

interface CategoryData {
  name: string;
  icon: string;
  color: string;
  total: number;
}

interface Analytics {
  monthlyTrend: MonthData[];
  categoryBreakdown: CategoryData[];
  currentMonth: { income: number; expense: number; balance: number };
}

const formatMXN = (v: number) => `$${v.toLocaleString("es-MX")}`;

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [months, setMonths] = useState(6);

  useEffect(() => {
    fetch(`/api/analytics?months=${months}`).then(r => r.json()).then(setData);
  }, [months]);

  const savingsRate = data
    ? data.currentMonth.income > 0
      ? Math.round((data.currentMonth.balance / data.currentMonth.income) * 100)
      : 0
    : 0;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <div className="flex gap-1">
          {[3, 6, 12].map(m => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                months === m ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {m} meses
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Tasa de ahorro</p>
          <p className={`text-2xl font-bold ${savingsRate >= 20 ? "text-green-400" : savingsRate >= 10 ? "text-yellow-400" : "text-red-400"}`}>
            {savingsRate}%
          </p>
          <p className="text-xs text-gray-500 mt-1">{savingsRate >= 20 ? "Excelente" : savingsRate >= 10 ? "Regular" : "Mejorar"}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Ingresos (mes)</p>
          <p className="text-xl font-bold text-green-400">{formatMXN(data?.currentMonth.income ?? 0)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Gastos (mes)</p>
          <p className="text-xl font-bold text-red-400">{formatMXN(data?.currentMonth.expense ?? 0)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Ahorro (mes)</p>
          <p className={`text-xl font-bold ${(data?.currentMonth.balance ?? 0) >= 0 ? "text-blue-400" : "text-red-400"}`}>
            {formatMXN(data?.currentMonth.balance ?? 0)}
          </p>
        </div>
      </div>

      {/* Gráfica de tendencia (barras) */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-white mb-4">Ingresos vs Gastos por mes</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data?.monthlyTrend ?? []} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 }}
              labelStyle={{ color: "#e5e7eb" }}
              formatter={(v: number) => formatMXN(v)}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} />
            <Bar dataKey="income" name="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfica de balance (línea) */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4">Balance mensual</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data?.monthlyTrend ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                formatter={(v: number) => formatMXN(v)}
              />
              <Line
                type="monotone"
                dataKey="balance"
                name="Balance"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: "#6366f1", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart de categorías */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4">Distribución de gastos</h2>
          {(data?.categoryBreakdown ?? []).length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-500 text-sm">Sin datos este mes</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie
                    data={data?.categoryBreakdown ?? []}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                  >
                    {(data?.categoryBreakdown ?? []).map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                    formatter={(v: number) => formatMXN(v)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                {(data?.categoryBreakdown ?? []).slice(0, 6).map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-gray-300 truncate">{cat.icon} {cat.name}</span>
                    <span className="text-gray-500 ml-auto shrink-0">{formatMXN(cat.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Insight card */}
      {data && (
        <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-xl p-5">
          <h3 className="font-semibold text-indigo-300 mb-2">💡 Insights financieros</h3>
          <ul className="text-sm text-gray-300 flex flex-col gap-2">
            {savingsRate >= 20 && <li>✅ Tu tasa de ahorro es excelente ({savingsRate}%). Considera invertir el excedente.</li>}
            {savingsRate >= 0 && savingsRate < 20 && <li>⚠️ Tu tasa de ahorro es {savingsRate}%. Intenta llegar al 20% reduciendo gastos no esenciales.</li>}
            {savingsRate < 0 && <li>🔴 Estás gastando más de lo que ingresas. Revisa tus gastos con urgencia.</li>}
            {data.categoryBreakdown[0] && (
              <li>📊 Tu mayor categoría de gasto es <strong>{data.categoryBreakdown[0].icon} {data.categoryBreakdown[0].name}</strong> con {formatMXN(data.categoryBreakdown[0].total)}.</li>
            )}
            {data.monthlyTrend.length >= 2 && (() => {
              const last = data.monthlyTrend[data.monthlyTrend.length - 1];
              const prev = data.monthlyTrend[data.monthlyTrend.length - 2];
              const diff = last.expense - prev.expense;
              if (diff > 0) return <li>📈 Tus gastos aumentaron {formatMXN(diff)} respecto al mes anterior.</li>;
              if (diff < 0) return <li>📉 Tus gastos bajaron {formatMXN(Math.abs(diff))} respecto al mes anterior. ¡Bien hecho!</li>;
              return null;
            })()}
          </ul>
        </div>
      )}
    </div>
  );
}
