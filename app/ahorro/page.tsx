"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, PiggyBank, Target, TrendingUp, ArrowDownCircle, ArrowUpCircle, Settings, AlertTriangle, CheckCircle2, Calculator } from "lucide-react";
import SavingsGoalForm from "@/components/SavingsGoalForm";
import SavingsDepositForm from "@/components/SavingsDepositForm";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface SavingsTransaction {
  id: string;
  amount: number;
  type: "deposit" | "withdrawal";
  date: string;
  notes?: string;
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  icon: string;
  color: string;
  completed: boolean;
}

interface SavingsConfig {
  minimumBalance: number;
}

function formatMXN(v: number) {
  return `$${Math.abs(v).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Modal saldo mínimo ───────────────────────────────────────────────────────
function MinimumBalanceModal({ current, onClose, onSaved }: {
  current: number;
  onClose: () => void;
  onSaved: (v: number) => void;
}) {
  const [value, setValue] = useState(current.toString());
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/savings/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minimumBalance: parseFloat(value) }),
    });
    const data = await res.json();
    onSaved(data.minimumBalance);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold text-white mb-1">Saldo mínimo</h2>
        <p className="text-gray-400 text-sm mb-5">
          Define cuánto dinero debe quedar siempre en la cuenta sin importar las metas.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Monto mínimo ($)</label>
            <input
              required type="number" step="0.01" min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="0.00"
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Tarjeta de meta ──────────────────────────────────────────────────────────
function GoalCard({ goal, selected, onToggle, onEdit, onDelete }: {
  goal: SavingsGoal;
  selected: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`bg-gray-900 border rounded-xl p-5 cursor-pointer transition-all ${
        selected
          ? "border-indigo-500 ring-1 ring-indigo-500/40"
          : "border-gray-800 hover:border-gray-700"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Checkbox visual */}
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
            selected ? "border-indigo-500 bg-indigo-500" : "border-gray-600"
          }`}>
            {selected && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className="text-2xl">{goal.icon}</span>
          <div>
            <h3 className="font-semibold text-white">{goal.name}</h3>
            <p className="text-sm text-gray-400 mt-0.5">{formatMXN(goal.targetAmount)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={onEdit} className="p-1.5 text-gray-500 hover:text-indigo-400 transition-colors"><Pencil size={13} /></button>
          <button onClick={onDelete} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function AhorroPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
  const [config, setConfig] = useState<SavingsConfig>({ minimumBalance: 0 });
  const [selectedGoalIds, setSelectedGoalIds] = useState<Set<string>>(new Set());

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [depositFormType, setDepositFormType] = useState<"deposit" | "withdrawal">("deposit");
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  async function load() {
    const [gRes, tRes, cRes] = await Promise.all([
      fetch("/api/savings/goals"),
      fetch("/api/savings/transactions"),
      fetch("/api/savings/config"),
    ]);
    const [goalsData, txData, configData] = await Promise.all([gRes.json(), tRes.json(), cRes.json()]);
    setGoals(goalsData);
    setTransactions(txData);
    setConfig(configData);
  }

  useEffect(() => { load(); }, []);

  function toggleGoal(id: string) {
    setSelectedGoalIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleDeleteGoal(id: string) {
    if (!confirm("¿Eliminar esta meta?")) return;
    await fetch(`/api/savings/goals/${id}`, { method: "DELETE" });
    setSelectedGoalIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    load();
  }

  async function handleDeleteTx(id: string) {
    await fetch(`/api/savings/transactions/${id}`, { method: "DELETE" });
    load();
  }

  // Cálculos de la cuenta
  const totalBalance = transactions.reduce(
    (s, t) => s + (t.type === "withdrawal" ? -t.amount : t.amount), 0
  );
  const available = Math.max(0, totalBalance - config.minimumBalance);

  // Cálculo de simulación (solo cuando hay metas seleccionadas)
  const selectedGoals = goals.filter(g => selectedGoalIds.has(g.id));
  const selectedTotal = selectedGoals.reduce((s, g) => s + g.targetAmount, 0);
  const afterSelected = available - selectedTotal;
  const hasSelection = selectedGoalIds.size > 0;

  // Chart
  const allTxsSorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const monthlyData: Record<string, { label: string; balance: number }> = {};
  let running = 0;
  for (const t of allTxsSorted) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    running += t.type === "withdrawal" ? -t.amount : t.amount;
    monthlyData[key] = { label: d.toLocaleDateString("es-MX", { month: "short", year: "2-digit" }), balance: running };
  }
  const chartData = Object.values(monthlyData);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Cuenta de Ahorro</h1>
          <p className="text-gray-400 text-sm mt-1">Tu dinero separado, creciendo hacia tus metas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setDepositFormType("withdrawal"); setShowDepositForm(true); }}
            className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <ArrowUpCircle size={16} />
            <span className="hidden sm:inline">Retirar</span>
          </button>
          <button
            onClick={() => { setDepositFormType("deposit"); setShowDepositForm(true); }}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <PiggyBank size={16} />
            <span className="hidden sm:inline">Depositar</span>
          </button>
          <button
            onClick={() => { setEditingGoal(null); setShowGoalForm(true); }}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Target size={16} />
            <span className="sm:hidden">Meta</span>
            <span className="hidden sm:inline">Nueva meta</span>
          </button>
        </div>
      </div>

      {/* KPIs de la cuenta */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Saldo total</p>
            <p className="text-2xl font-bold text-white">{formatMXN(totalBalance)}</p>
          </div>
          <button onClick={() => setShowConfigModal(true)} className="text-left group">
            <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
              Mínimo reservado
              <Settings size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
            <p className="text-2xl font-bold text-orange-400">{formatMXN(config.minimumBalance)}</p>
            <p className="text-xs text-gray-600 mt-0.5">clic para editar</p>
          </button>
          <div>
            <p className="text-xs text-gray-400 mb-1">Disponible</p>
            <p className="text-2xl font-bold text-emerald-400">{formatMXN(available)}</p>
            <p className="text-xs text-gray-500 mt-0.5">saldo − mínimo</p>
          </div>
        </div>
      </div>

      {/* Panel de simulación — solo visible con metas seleccionadas */}
      {hasSelection && (
        <div className={`border rounded-xl p-5 mb-6 transition-all ${
          afterSelected >= 0
            ? "bg-emerald-500/5 border-emerald-500/30"
            : "bg-red-500/5 border-red-500/30"
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <Calculator size={16} className={afterSelected >= 0 ? "text-emerald-400" : "text-red-400"} />
            <h2 className="font-semibold text-white">
              Simulación — {selectedGoalIds.size} {selectedGoalIds.size === 1 ? "meta" : "metas"} seleccionada{selectedGoalIds.size !== 1 ? "s" : ""}
            </h2>
            <button
              onClick={() => setSelectedGoalIds(new Set())}
              className="ml-auto text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Limpiar selección
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Disponible</p>
              <p className="text-xl font-bold text-white">{formatMXN(available)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Total metas</p>
              <p className="text-xl font-bold text-indigo-400">{formatMXN(selectedTotal)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Después de metas</p>
              <p className={`text-xl font-bold ${afterSelected >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {afterSelected >= 0 ? "" : "-"}{formatMXN(afterSelected)}
              </p>
            </div>
          </div>

          {/* Detalle por meta seleccionada */}
          <div className="flex flex-col gap-2">
            {selectedGoals.map((goal, i) => {
              const runningBefore = selectedGoals.slice(0, i).reduce((s, g) => s + g.targetAmount, 0);
              const balanceBefore = available - runningBefore;
              const canFund = balanceBefore >= goal.targetAmount;
              return (
                <div key={goal.id} className="flex items-center gap-3 bg-gray-900/60 rounded-lg px-3 py-2">
                  <span className="text-lg">{goal.icon}</span>
                  <span className="text-sm text-white flex-1">{goal.name}</span>
                  <span className="text-sm text-gray-400">{formatMXN(goal.targetAmount)}</span>
                  {canFund ? (
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle size={15} className="text-yellow-400 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {afterSelected < 0 && (
            <p className="text-xs text-red-400 mt-3 flex items-center gap-1">
              <AlertTriangle size={12} />
              Te faltan {formatMXN(Math.abs(afterSelected))} para cubrir todas las metas seleccionadas.
            </p>
          )}
        </div>
      )}

      {/* Gráfica */}
      {chartData.length > 1 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-emerald-400" />
            <h2 className="font-semibold text-white">Crecimiento del saldo</h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                formatter={(v: unknown) => [formatMXN(v as number), "Saldo"]}
              />
              <Area type="monotone" dataKey="balance" stroke="#10b981" fill="url(#balGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Metas */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white">Mis metas</h2>
          {goals.length > 0 && (
            <p className="text-xs text-gray-500">
              {hasSelection
                ? `${selectedGoalIds.size} seleccionada${selectedGoalIds.size !== 1 ? "s" : ""} — haz clic para agregar al cálculo`
                : "Haz clic en una meta para simular el cálculo"}
            </p>
          )}
        </div>

        {goals.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-white font-semibold mb-2">Sin metas de ahorro</h3>
            <p className="text-gray-400 text-sm mb-4">Crea una meta y selecciónala para simular si tu cuenta la puede cubrir</p>
            <button
              onClick={() => setShowGoalForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
            >
              Crear primera meta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                selected={selectedGoalIds.has(goal.id)}
                onToggle={() => toggleGoal(goal.id)}
                onEdit={() => { setEditingGoal(goal); setShowGoalForm(true); }}
                onDelete={() => handleDeleteGoal(goal.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Historial */}
      {transactions.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h2 className="font-semibold text-white">Historial de movimientos</h2>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase">
                <th className="text-left px-5 py-3">Fecha</th>
                <th className="text-left px-5 py-3">Tipo</th>
                <th className="text-left px-5 py-3">Notas</th>
                <th className="text-right px-5 py-3">Monto</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-5 py-3 text-gray-400">{new Date(t.date).toLocaleDateString("es-MX")}</td>
                  <td className="px-5 py-3">
                    {t.type === "withdrawal" ? (
                      <span className="flex items-center gap-1 text-red-400 text-xs font-medium"><ArrowUpCircle size={13} /> Retiro</span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium"><ArrowDownCircle size={13} /> Depósito</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{t.notes ?? "—"}</td>
                  <td className={`px-5 py-3 text-right font-semibold ${t.type === "withdrawal" ? "text-red-400" : "text-emerald-400"}`}>
                    {t.type === "withdrawal" ? "-" : "+"}{formatMXN(t.amount)}
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleDeleteTx(t.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showGoalForm && (
        <SavingsGoalForm
          onClose={() => { setShowGoalForm(false); setEditingGoal(null); }}
          onSaved={load}
          initial={editingGoal ?? undefined}
        />
      )}
      {showDepositForm && (
        <SavingsDepositForm
          defaultType={depositFormType}
          onClose={() => setShowDepositForm(false)}
          onSaved={load}
        />
      )}
      {showConfigModal && (
        <MinimumBalanceModal
          current={config.minimumBalance}
          onClose={() => setShowConfigModal(false)}
          onSaved={(v) => setConfig(c => ({ ...c, minimumBalance: v }))}
        />
      )}
    </div>
  );
}
