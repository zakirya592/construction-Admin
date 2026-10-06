import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import { BadgeCheck, HardHat, Image, Info, ListOrdered, LogOut, Megaphone, PanelBottom, PanelTop, Phone, Plus, Quote, Wrench } from "lucide-react";
import { landingSections } from "@/landing/sections";
import { useOffice } from "@/office";

const icons = {
  header: PanelTop,
  hero: Image,
  about: Info,
  services: Wrench,
  projects: HardHat,
  "why-us": BadgeCheck,
  process: ListOrdered,
  testimonials: Quote,
  cta: Megaphone,
  contact: Phone,
  footer: PanelBottom,
};

const nav = landingSections.map((section) => ({
  to: section.path,
  label: section.name,
  icon: icons[section.key],
}));

function initials(name) {
  const parts = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "NL";
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join("");
}

export function AppShell() {
  const { user, logout } = useOffice();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3.5 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ink text-[15px] font-semibold text-amber-200 ring-1 ring-amber-200/30">N</div>
            <div className="min-w-0">
              <p className="font-serif text-[1.35rem] leading-none tracking-tight text-ink">Northline</p>
              <p className="mt-1 text-xs tracking-wide text-stone-500">{today}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button variant="primary" className="rounded-full px-4" onPress={() => navigate("/sections/new")}>
              <Plus size={15} /> Add Section
            </Button>
            <span className="hidden h-8 w-px bg-line sm:block" aria-hidden="true" />
            <div className="flex min-w-0 items-center gap-2.5 rounded-full bg-white/80 py-1 pr-3 pl-1 ring-1 ring-line">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sand text-xs font-semibold text-ink">{initials(user?.name)}</span>
              <span className="hidden min-w-0 sm:block">
                <span className="block truncate text-sm leading-tight font-medium">{user?.name}</span>
                <span className="block truncate text-xs leading-tight text-stone-500">{user?.email}</span>
              </span>
            </div>
            <Button
              variant="ghost"
              className="rounded-full text-stone-600"
              onPress={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut size={15} /> Sign out
            </Button>
          </div>
        </div>
        <nav aria-label="Sections" className="section-tabs flex gap-1 overflow-x-auto px-3 md:px-6">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm ${active ? "border-amber-700 font-medium text-ink" : "border-transparent text-stone-500 hover:text-ink"}`}
              >
                <Icon size={15} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </header>
      <main className="px-4 py-6 md:px-8 md:py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
