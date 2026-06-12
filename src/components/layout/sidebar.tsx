import Link from "next/link";
import { Building2, CalendarDays, Home, LayoutDashboard, MessageCircle, Users } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Imoveis", icon: Building2 },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/appointments", label: "Agenda", icon: CalendarDays },
  { href: "/whatsapp", label: "WhatsApp", icon: MessageCircle }
];

export function Sidebar() {
  return (
    <aside className="hidden w-72 border-r border-slate-200 bg-white px-4 py-5 lg:block">
      <Link href="/" className="mb-8 flex items-center gap-3 px-2">
        <div className="grid size-10 place-items-center rounded-md bg-ink text-sm font-bold text-white">IA</div>
        <div>
          <p className="font-semibold text-ink">ImobIA</p>
          <p className="text-xs text-slate-500">Atendimento imobiliario</p>
        </div>
      </Link>
      <nav className="space-y-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-ink">
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <Link href="/catalogo/joao-corretor" className="mt-8 flex items-center gap-3 rounded-md border border-slate-200 px-3 py-3 text-sm font-semibold text-ink">
        <Home className="size-4 text-signal" />
        Catalogo publico
      </Link>
    </aside>
  );
}
