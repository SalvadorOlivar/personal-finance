"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Check, Circle, AlertTriangle, Clock, CheckCircle2, X } from "lucide-react";

interface PendingExpense {
  id: string;
  title: string;
  amount: number | null;
  notes: string | null;
  priority: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: typeof AlertTriangle }> = {
  high: { label: "Alta", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: AlertTriangle },
  medium: { label: "Media", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: Clock },
  low: { label: "Baja", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: Circle },
};

function formatMXN(v: number) {
  return `$${v.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PendientesPage() {
  const [items, setItems] = useState<PendingExpense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", amount: "", notes: "", priority: "medium" });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");

  async function load() {
    const res = await fetch("/api/pending");
    setItems(await res.json());
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/pending", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        amount: form.amount ? parseFloat(form.amount) : null,
        notes: form.notes || null,
        priority: form.priority,
      }),
    });
    setSaving(false);
    setForm({ title: "", amount: "", notes: "", priority: "medium" });
    setShowForm(false);
    load();
  }

  async function toggleComplete(item: PendingExpense) {
    await fetch(`/api/pending/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        completed: !item.completed,
        completedAt: !item.completed ? new Date().toISOString() : null,
      }),
    });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este gasto pendiente?")) return;
    await fetch(`/api/pending/${id}`, { method: "DELETE" });
    load();
  }

  const pending = items.filter(i => !i.completed);
  const done = items.filter(i => i.completed);
  const filtered = filter === "pending" ? pending : filter === "done" ? done : items;
  const totalPending = pending.reduce((s, i) => s + (i.amount ?? 0), 0);
  const totalDone = done.reduce((s, i) => s + (i.amount ?? 0), 0);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Gastos Pendientes</h1>
          <p className="text-gray-400 text-sm mt-1">Lista de gastos que debes hacer</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
          <p className="text-xs text-orange-400 mb-1">Por pagar</p>
          <p className="text-lg font-bold text-orange-400">{pending.length}</p>
          {totalPending > 0 && <p className="text-xs text-gray-500 mt-0.5">~{formatMXN(totalPending)}</p>}
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <p className="text-xs text-green-400 mb-1">Completados</p>
          <p className="text-lg font-bold text-green-400">{done.length}</p>
          {totalDone > 0 && <p className="text-xs text-gray-500 mt-0.5">{formatMXN(totalDone)}</p>}
        </div>
        <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Total</p>
          <p className="text-lg font-bold text-gray-300">{items.length}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-1 mb-4">
        {(["all", "pending", "done"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {f === "all" ? "Todos" : f === "pending" ? "Pendientes" : "Completados"}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-gray-400">{filter === "done" ? "Aún no has completado ninguno" : "No hay gastos pendientes"}</p>
          </div>
        )}
        {filtered.map(item => {
          const pri = PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.medium;
          const PriIcon = pri.icon;
          return (
            <div
              key={item.id}
              className={`bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start gap-3 transition-all ${
                item.completed ? "opacity-60" : ""
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleComplete(item)}
                className={`mt-0.5 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  item.completed
                    ? "bg-green-600 border-green-600 text-white"
                    : "border-gray-600 hover:border-indigo-500"
                }`}
              >
                {item.completed && <Check size={14} />}
              </button>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className={`text-sm font-medium ${item.completed ? "line-through text-gray-500" : "text-white"}`}>
                    {item.title}
                  </p>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${pri.bg} ${pri.border} ${pri.color} border`}>
                    <PriIcon size={10} />
                    {pri.label}
                  </span>
                </div>
                {item.notes && <p className="text-xs text-gray-500">{item.notes}</p>}
                <div className="flex items-center gap-3 mt-1">
                  {item.amount != null && (
                    <span className={`text-xs font-semibold ${item.completed ? "text-gray-500" : "text-orange-400"}`}>
                      {formatMXN(item.amount)}
                    </span>
                  )}
                  {item.completed && item.completedAt && (
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <CheckCircle2 size={10} />
                      {new Date(item.completedAt).toLocaleDateString("es-MX")}
                    </span>
                  )}
                  <span className="text-xs text-gray-600">
                    Creado {new Date(item.createdAt).toLocaleDateString("es-MX")}
                  </span>
                </div>
              </div>

              {/* Eliminar */}
              <button
                onClick={() => handleDelete(item.id)}
                className="text-gray-600 hover:text-red-400 transition-colors shrink-0 mt-0.5"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal para agregar */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Nuevo gasto pendiente</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">¿Qué necesitas pagar?</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Ej: Arreglar el auto, dentista..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Monto estimado (opcional)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Notas (opcional)</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Detalles adicionales..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">Prioridad</label>
                <div className="flex gap-2">
                  {(["low", "medium", "high"] as const).map(p => {
                    const cfg = PRIORITY_CONFIG[p];
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, priority: p }))}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                          form.priority === p
                            ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                            : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700"
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                {saving ? "Guardando..." : "Agregar a la lista"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
