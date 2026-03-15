"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ArrowUpRight, ArrowDownRight, Zap, CheckCircle2, CheckCheck, ToggleLeft, ToggleRight } from "lucide-react";
import TransactionForm from "@/components/TransactionForm";
import FixedExpenseForm from "@/components/FixedExpenseForm";
import QuickAddForm from "@/components/QuickAddForm";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: string;
  notes?: string;
  fixedExpenseId?: string;
  category: { name: string; icon: string; color: string };
  categoryId: string;
}

interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  icon: string;
  color: string;
  active: boolean;
  categoryId?: string;
  category?: { name: string; icon: string };
}

export default function TransaccionesPage() {
  const [tab, setTab] = useState<"transactions" | "fixed">("transactions");

  // — Transacciones —
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState("all");
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  // — Gastos fijos —
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [showFixedForm, setShowFixedForm] = useState(false);
  const [editingFixed, setEditingFixed] = useState<FixedExpense | null>(null);
  const [quickAdd, setQuickAdd] = useState<FixedExpense | null>(null);

  // Transacciones del mes actual (para saber cuáles ya se registraron)
  const [currentMonthTxs, setCurrentMonthTxs] = useState<Transaction[]>([]);

  async function loadTransactions() {
    const params = new URLSearchParams({ month: String(month), year: String(year) });
    if (filterType !== "all") params.set("type", filterType);
    const res = await fetch(`/api/transactions?${params}`);
    setTransactions(await res.json());
  }

  async function loadCurrentMonth() {
    const n = new Date();
    const res = await fetch(`/api/transactions?month=${n.getMonth() + 1}&year=${n.getFullYear()}`);
    setCurrentMonthTxs(await res.json());
  }

  async function loadFixed() {
    const res = await fetch("/api/fixed-expenses");
    setFixedExpenses(await res.json());
  }

  useEffect(() => { loadTransactions(); }, [month, year, filterType]);
  useEffect(() => { loadFixed(); loadCurrentMonth(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta transacción?")) return;
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    loadTransactions();
    loadCurrentMonth();
  }

  async function handleDeleteFixed(id: string) {
    if (!confirm("¿Eliminar este gasto fijo?")) return;
    await fetch(`/api/fixed-expenses/${id}`, { method: "DELETE" });
    loadFixed();
  }

  async function markAsPaid(fe: FixedExpense) {
    const today = new Date().toISOString().slice(0, 10);
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: fe.name,
        amount: fe.amount,
        type: "expense",
        date: today,
        categoryId: fe.categoryId,
        fixedExpenseId: fe.id,
      }),
    });
    loadTransactions();
    loadCurrentMonth();
  }

  async function markAllAsPaid() {
    const pending = activeFixed.filter(f => !registeredThisMonth.has(f.id));
    if (pending.length === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    await Promise.all(pending.map(fe =>
      fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: fe.name,
          amount: fe.amount,
          type: "expense",
          date: today,
          categoryId: fe.categoryId,
          fixedExpenseId: fe.id,
        }),
      })
    ));
    loadTransactions();
    loadCurrentMonth();
  }

  async function toggleActive(fe: FixedExpense) {
    await fetch(`/api/fixed-expenses/${fe.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !fe.active }),
    });
    loadFixed();
  }

  const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const activeFixed = fixedExpenses.filter(f => f.active);
  const totalFixed = activeFixed.reduce((s, f) => s + f.amount, 0);

  // Set de IDs de gastos fijos ya registrados este mes
  const registeredThisMonth = new Set(
    currentMonthTxs.filter(t => t.fixedExpenseId).map(t => t.fixedExpenseId!)
  );
  const pendingCount = activeFixed.filter(f => !registeredThisMonth.has(f.id)).length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Transacciones</h1>
        <button
          onClick={() => {
            if (tab === "transactions") { setEditing(null); setShowForm(true); }
            else { setEditingFixed(null); setShowFixedForm(true); }
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          {tab === "transactions" ? "Nueva" : "Nuevo gasto fijo"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6 w-fit">
        <button
          onClick={() => setTab("transactions")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "transactions" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          Transacciones
        </button>
        <button
          onClick={() => setTab("fixed")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            tab === "fixed" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          Gastos fijos
          {pendingCount > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === "fixed" ? "bg-white/20" : "bg-orange-500/30 text-orange-400"}`}>
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* ── TAB: TRANSACCIONES ── */}
      {tab === "transactions" && (
        <>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center">
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white">
              {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white">
              {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <div className="flex gap-1 ml-auto">
              {["all", "expense", "income"].map((t) => (
                <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === t ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                  {t === "all" ? "Todos" : t === "expense" ? "Gastos" : "Ingresos"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
              <p className="text-xs text-green-400 mb-1">Ingresos</p>
              <p className="text-lg font-bold text-green-400">${totalIncome.toLocaleString("es-MX")}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-xs text-red-400 mb-1">Gastos</p>
              <p className="text-lg font-bold text-red-400">${totalExpense.toLocaleString("es-MX")}</p>
            </div>
            <div className={`${(totalIncome - totalExpense) >= 0 ? "bg-blue-500/10 border-blue-500/20" : "bg-purple-500/10 border-purple-500/20"} border rounded-xl p-4 text-center`}>
              <p className={`text-xs mb-1 ${(totalIncome - totalExpense) >= 0 ? "text-blue-400" : "text-purple-400"}`}>Balance</p>
              <p className={`text-lg font-bold ${(totalIncome - totalExpense) >= 0 ? "text-blue-400" : "text-purple-400"}`}>
                ${(totalIncome - totalExpense).toLocaleString("es-MX")}
              </p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {transactions.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-4xl mb-3">📭</p>
                <p>Sin transacciones para este período</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
                    <th className="text-left px-5 py-3">Descripción</th>
                    <th className="text-left px-5 py-3">Categoría</th>
                    <th className="text-left px-5 py-3">Fecha</th>
                    <th className="text-right px-5 py-3">Monto</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {t.type === "income"
                            ? <ArrowUpRight size={14} className="text-green-400 shrink-0" />
                            : <ArrowDownRight size={14} className="text-red-400 shrink-0" />}
                          <span className="text-white font-medium">{t.description}</span>
                          {t.fixedExpenseId && (
                            <span className="text-xs text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">fijo</span>
                          )}
                        </div>
                        {t.notes && <p className="text-xs text-gray-500 ml-5 mt-0.5">{t.notes}</p>}
                      </td>
                      <td className="px-5 py-3 text-gray-300">{t.category.icon} {t.category.name}</td>
                      <td className="px-5 py-3 text-gray-400">{new Date(t.date).toLocaleDateString("es-MX")}</td>
                      <td className={`px-5 py-3 text-right font-semibold ${t.type === "income" ? "text-green-400" : "text-red-400"}`}>
                        {t.type === "income" ? "+" : "-"}${t.amount.toLocaleString("es-MX")}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => { setEditing(t); setShowForm(true); }} className="text-gray-500 hover:text-indigo-400 transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(t.id)} className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ── TAB: GASTOS FIJOS ── */}
      {tab === "fixed" && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-xs text-red-400 mb-1">Total mensual</p>
              <p className="text-lg font-bold text-red-400">${totalFixed.toLocaleString("es-MX")}</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
              <p className="text-xs text-orange-400 mb-1">Pendientes este mes</p>
              <p className="text-lg font-bold text-orange-400">{pendingCount}</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
              <p className="text-xs text-emerald-400 mb-1">Registrados este mes</p>
              <p className="text-lg font-bold text-emerald-400">{activeFixed.length - pendingCount}</p>
            </div>
          </div>

          {/* Instrucción + botón masivo */}
          {fixedExpenses.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Zap size={12} className="text-indigo-400" />
                Haz clic en <strong className="text-indigo-400">Registrar</strong> para agregar como transacción, o en <strong className="text-gray-300">✓ Ya pagué</strong> para marcar directamente
              </p>
              {pendingCount > 0 && (
                <button
                  onClick={markAllAsPaid}
                  className="flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shrink-0 ml-4"
                >
                  <CheckCheck size={14} />
                  Marcar todos como pagados
                </button>
              )}
            </div>
          )}

          {/* Grid de plantillas */}
          {fixedExpenses.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <div className="text-5xl mb-4">📌</div>
              <h3 className="text-white font-semibold mb-2">Sin gastos fijos</h3>
              <p className="text-gray-400 text-sm mb-4">Agrega tus gastos recurrentes: renta, suscripciones, servicios...</p>
              <button onClick={() => { setEditingFixed(null); setShowFixedForm(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
                Agregar primer gasto fijo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {fixedExpenses.map((fe) => {
                const done = registeredThisMonth.has(fe.id);
                return (
                  <div
                    key={fe.id}
                    className={`bg-gray-900 border rounded-xl p-4 transition-all ${
                      !fe.active ? "opacity-40 border-gray-800" : done ? "border-emerald-500/40" : "border-gray-800"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                          style={{ backgroundColor: fe.color + "33" }}
                        >
                          {fe.icon}
                        </span>
                        <div>
                          <p className="font-medium text-white text-sm">{fe.name}</p>
                          {fe.category && (
                            <p className="text-xs text-gray-500">{fe.category.icon} {fe.category.name}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleActive(fe)} className={`transition-colors ${fe.active ? "text-emerald-500 hover:text-emerald-400" : "text-gray-600 hover:text-gray-400"}`} title={fe.active ? "Desactivar" : "Activar"}>
                          {fe.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                        <button onClick={() => { setEditingFixed(fe); setShowFixedForm(true); }} className="text-gray-500 hover:text-indigo-400 transition-colors"><Pencil size={13} /></button>
                        <button onClick={() => handleDeleteFixed(fe.id)} className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-red-400">${fe.amount.toLocaleString("es-MX")}</span>

                      {done ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                          <CheckCircle2 size={14} />
                          Registrado
                        </span>
                      ) : fe.active ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => markAsPaid(fe)}
                            title="Marcar como pagado (sin abrir formulario)"
                            className="flex items-center gap-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <CheckCircle2 size={12} />
                            Ya pagué
                          </button>
                          <button
                            onClick={() => setQuickAdd(fe)}
                            title="Registrar con detalles"
                            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <Zap size={12} />
                            Registrar
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-600">Inactivo</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showForm && (
        <TransactionForm
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { loadTransactions(); loadCurrentMonth(); }}
          initial={editing ? {
            id: editing.id,
            amount: editing.amount,
            description: editing.description,
            date: editing.date,
            type: editing.type,
            categoryId: editing.categoryId,
            notes: editing.notes,
          } : undefined}
        />
      )}
      {showFixedForm && (
        <FixedExpenseForm
          onClose={() => { setShowFixedForm(false); setEditingFixed(null); }}
          onSaved={loadFixed}
          initial={editingFixed ?? undefined}
        />
      )}
      {quickAdd && (
        <QuickAddForm
          template={quickAdd}
          onClose={() => setQuickAdd(null)}
          onSaved={() => { loadTransactions(); loadCurrentMonth(); }}
        />
      )}
    </div>
  );
}
