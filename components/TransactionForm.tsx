"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
  type: string;
}

interface TransactionFormProps {
  onClose: () => void;
  onSaved: () => void;
  initial?: {
    id: string;
    amount: number;
    description: string;
    date: string;
    type: string;
    categoryId: string;
    notes?: string;
  };
}

export default function TransactionForm({ onClose, onSaved, initial }: TransactionFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [type, setType] = useState(initial?.type ?? "expense");
  const [form, setForm] = useState({
    amount: initial?.amount?.toString() ?? "",
    description: initial?.description ?? "",
    date: initial?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    categoryId: initial?.categoryId ?? "",
    notes: initial?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  const filtered = categories.filter((c) => c.type === type);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, type, amount: parseFloat(form.amount) };
    const url = initial ? `/api/transactions/${initial.id}` : "/api/transactions";
    const method = initial ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">{initial ? "Editar" : "Nueva"} transacción</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Tipo */}
          <div className="flex gap-2">
            {["expense", "income"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setType(t); setForm((f) => ({ ...f, categoryId: "" })); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  type === t
                    ? t === "expense" ? "bg-red-600 text-white" : "bg-green-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {t === "expense" ? "🔴 Gasto" : "🟢 Ingreso"}
              </button>
            ))}
          </div>

          {/* Monto */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Monto ($)</label>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="0.00"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Descripción</label>
            <input
              required
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="Ej: Super mercado"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Categoría</label>
            <select
              required
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Seleccionar categoría</option>
              {filtered.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Fecha</label>
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Notas (opcional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 resize-none"
              rows={2}
              placeholder="Notas adicionales..."
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {saving ? "Guardando..." : initial ? "Actualizar" : "Guardar transacción"}
          </button>
        </form>
      </div>
    </div>
  );
}
