"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, BarChart3, Tag, PiggyBank, ClipboardList, LogOut, ChevronUp } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/transacciones", icon: ArrowLeftRight, label: "Transacciones" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/ahorro", icon: PiggyBank, label: "Ahorro" },
  { href: "/pendientes", icon: ClipboardList, label: "Pendientes" },
  { href: "/categorias", icon: Tag, label: "Categorías" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showPanel, setShowPanel] = useState(false);

  const user = session?.user;

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col py-6 px-3 shrink-0">
      <div className="mb-8 px-3">
        <h1 className="text-xl font-bold text-white">💰 MisGastos</h1>
        <p className="text-xs text-gray-500 mt-1">Control financiero personal</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Panel de usuario */}
      {user && (
        <div className="mt-4 relative">
          {/* Panel expandido */}
          {showPanel && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-xl">
              <div className="flex flex-col items-center text-center gap-3">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name ?? ""}
                    width={56}
                    height={56}
                    className="rounded-full border-2 border-indigo-500"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                    {user.name?.[0] ?? "?"}
                  </div>
                )}
                <div>
                  <p className="text-white font-semibold text-sm">{user.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5 break-all">{user.email}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-2 w-full justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <LogOut size={14} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}

          {/* Botón trigger */}
          <button
            onClick={() => setShowPanel((v) => !v)}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors group"
          >
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? ""}
                width={28}
                height={28}
                className="rounded-full shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user.name?.[0] ?? "?"}
              </div>
            )}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <ChevronUp
              size={14}
              className={`text-gray-500 shrink-0 transition-transform ${showPanel ? "rotate-0" : "rotate-180"}`}
            />
          </button>
        </div>
      )}
    </aside>
  );
}
