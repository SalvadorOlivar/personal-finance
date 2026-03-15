interface StatCardProps {
  title: string;
  amount: number;
  icon: string;
  color: "green" | "red" | "blue" | "purple";
  subtitle?: string;
}

const colorMap = {
  green: "bg-green-500/10 text-green-400 border-green-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default function StatCard({ title, amount, icon, color, subtitle }: StatCardProps) {
  const isNegative = amount < 0;
  return (
    <div className={`rounded-xl border p-5 ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium opacity-80">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${isNegative ? "text-red-400" : ""}`}>
        {isNegative ? "-" : ""}${Math.abs(amount).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      {subtitle && <p className="text-xs opacity-60 mt-1">{subtitle}</p>}
    </div>
  );
}
