import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button, Dropdown, Label } from "@heroui/react";
import { motion } from "framer-motion";
import { BadgeCheck, HardHat, Image, Info, ListOrdered, Megaphone, PanelBottom, PanelTop, Phone, Plus, Quote, Wrench } from "lucide-react";
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
  const { user, logout, restore } = useOffice();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/90 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink font-semibold text-amber-200">N</div>
            <div>
              <p className="text-[11px] tracking-[0.22em] text-amber-800/80">NORTHLINE</p>
              <p className="text-sm text-stone-500">{today}</p>
            </div>
          </div>
          <Dropdown>
            <Dropdown.Trigger className="flex items-center gap-2 rounded-xl px-2 py-1 text-left hover:bg-sand">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-xs text-amber-200">{initials(user?.name)}</span>
              <span className="hidden sm:block">
                <span className="block text-sm leading-tight">{user?.name}</span>
                <span className="block text-xs text-stone-500">{user?.email}</span>
              </span>
            </Dropdown.Trigger>
            <Dropdown.Popover>
              <Dropdown.Menu
                aria-label="Account"
                onAction={(key) => {
                  if (key === "restore") restore();
                  if (key === "logout") {
                    logout();
                    navigate("/login");
                  }
                }}
              >
             
                <Dropdown.Item id="logout">
                  <Label>Sign out</Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
        <div className="flex justify-end px-4 pt-1 md:px-8">
          <Button variant="primary" onPress={() => navigate("/sections/new")}>
            <Plus size={16} /> Add Section
          </Button>
        </div>
        <nav aria-label="Sections" className="section-tabs flex gap-1 overflow-x-auto px-4 md:px-8">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm ${active ? "border-amber-700 text-ink" : "border-transparent text-stone-500 hover:text-ink"}`}
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
