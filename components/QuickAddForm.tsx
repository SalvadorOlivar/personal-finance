"use client";

import { useState } from "react";
import { X, Zap } from "lucide-react";

interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  icon: string;
  color: string;
  categoryId?: string;
  category?: { name: string; icon: string };
}

interface Props {
  template: FixedExpense;
  onClose: () => void;
  onSaved: () => void;
}

export default function QuickAddForm({ template, onClose, onSaved }: Props) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState(template.amount.toString());
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: template.name,
        amount: parseFloat(amount),
        type: "expense",
        date,
        categoryId: template.categoryId,
        fixedExpenseId: template.id,
        notes: notes || null,
      }),
    });
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6">
        {/* Header con info del template */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ backgroundColor: template.color + "33" }}
            >
              {template.icon}
            </span>
            <div>
              <h2 className="font-semibold text-white">{template.name}</h2>
              {template.category && (
                <p className="text-xs text-gray-400">{template.category.icon} {template.category.name}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Monto ($)</label>
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-lg font-semibold"
            />
            <p className="text-xs text-gray-500 mt-1">Puedes ajustar el monto si cambió</p>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Fecha</label>
            <input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Notas (opcional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="Ej: Mes de marzo..."
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            <Zap size={15} />
            {saving ? "Registrando..." : "Registrar transacción"}
          </button>
        </form>
      </div>
    </div>
  );
}
