"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface SavingsGoalFormProps {
  onClose: () => void;
  onSaved: () => void;
  initial?: { id: string; name: string; targetAmount: number; icon: string; color: string };
}

const ICONS = ["🎯", "🏠", "🚗", "✈️", "💻", "📱", "🎓", "💍", "🏖️", "🏋️", "🎸", "💰"];
const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6", "#3b82f6",
];

export default function SavingsGoalForm({ onClose, onSaved, initial }: SavingsGoalFormProps) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    targetAmount: initial?.targetAmount?.toString() ?? "",
    icon: initial?.icon ?? "🎯",
    color: initial?.color ?? "#6366f1",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, targetAmount: parseFloat(form.targetAmount) };
    const url = initial ? `/api/savings/goals/${initial.id}` : "/api/savings/goals";
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
          <h2 className="text-lg font-semibold">{initial ? "Editar" : "Nueva"} meta de ahorro</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nombre de la meta</label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="Ej: Fondo de emergencia, Vacaciones..."
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Monto objetivo ($)</label>
            <input
              required
              type="number"
              step="0.01"
              min="1"
              value={form.targetAmount}
              onChange={(e) => setForm(f => ({ ...f, targetAmount: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Ícono</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, icon }))}
                  className={`text-xl p-2 rounded-lg transition-colors ${form.icon === icon ? "bg-indigo-600" : "bg-gray-800 hover:bg-gray-700"}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color }))}
                  className={`w-7 h-7 rounded-full transition-transform ${form.color === color ? "scale-125 ring-2 ring-white" : ""}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {saving ? "Guardando..." : initial ? "Actualizar meta" : "Crear meta"}
          </button>
        </form>
      </div>
    </div>
  );
}
