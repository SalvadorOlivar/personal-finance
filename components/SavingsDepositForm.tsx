"use client";

import { useState } from "react";
import { X, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

interface SavingsDepositFormProps {
  defaultType?: "deposit" | "withdrawal";
  onClose: () => void;
  onSaved: () => void;
}

export default function SavingsDepositForm({ defaultType = "deposit", onClose, onSaved }: SavingsDepositFormProps) {
  const [form, setForm] = useState({
    type: defaultType,
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const isDeposit = form.type === "deposit";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/savings/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: form.type,
        amount: parseFloat(form.amount),
        date: form.date,
        notes: form.notes || null,
      }),
    });
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Nuevo movimiento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, type: "deposit" }))}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                isDeposit
                  ? "bg-emerald-600/20 border-emerald-500 text-emerald-400"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
              }`}
            >
              <ArrowDownCircle size={16} />
              Depósito
            </button>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, type: "withdrawal" }))}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                !isDeposit
                  ? "bg-red-600/20 border-red-500 text-red-400"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
              }`}
            >
              <ArrowUpCircle size={16} />
              Retiro
            </button>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Monto ($)</label>
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Fecha</label>
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Notas (opcional)</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder={isDeposit ? "Ej: Quincena, bono..." : "Ej: Compra laptop..."}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`w-full disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors ${
              isDeposit ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {saving ? "Guardando..." : isDeposit ? "Depositar" : "Registrar retiro"}
          </button>
        </form>
      </div>
    </div>
  );
}
