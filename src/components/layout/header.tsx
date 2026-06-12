import { Bell, Search } from "lucide-react";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-signal focus:bg-white" placeholder="Buscar leads, imoveis ou conversas" />
      </div>
      <button type="button" aria-label="Notificacoes" className="relative grid size-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-600">
        <Bell className="size-4" />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500" />
      </button>
    </header>
  );
}
