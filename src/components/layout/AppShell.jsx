import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button, Dropdown, Label } from "@heroui/react";
import { motion } from "framer-motion";
import { BadgeCheck, HardHat, Image, Info, ListOrdered, Megaphone, Menu, PanelBottom, PanelTop, Phone, Quote, Wrench, X } from "lucide-react";
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
    const [open, setOpen] = useState(false);
    const today = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    }).format(new Date());
    return (<div className="min-h-screen bg-paper text-ink lg:grid lg:grid-cols-[248px_1fr]">
      {open && (<button className="fixed inset-0 z-30 bg-ink/40 lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)}/>)}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col bg-ink text-stone-200 transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 font-semibold text-ink">N</div>
            <div>
              <p className="text-[11px] tracking-[0.22em] text-amber-200">NORTHLINE</p>
              <p className="text-sm text-stone-400">Site office</p>
            </div>
          </div>
          <Button isIconOnly aria-label="Close menu" variant="ghost" className="text-stone-200 lg:hidden" onPress={() => setOpen(false)}>
            <X size={16}/>
          </Button>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3">
          {nav.map((item) => {
            const Icon = item.icon;
            return (<NavLink key={item.to} to={item.to} end={item.to === "/"} onClick={() => setOpen(false)} className="relative">
                {({ isActive }) => (<span className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${isActive ? "text-amber-100" : "text-stone-300 hover:text-white"}`}>
                    {isActive && (<motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl bg-white/10" transition={{ type: "spring", stiffness: 380, damping: 34 }}/>)}
                    <Icon size={16} className="relative"/>
                    <span className="relative">{item.label}</span>
                  </span>)}
              </NavLink>);
        })}
        </nav>
        <div className="px-4 py-5 text-xs leading-5 text-stone-500">
          Sample records stay in this session.
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line/80 bg-paper/90 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <Button isIconOnly aria-label="Open menu" variant="outline" className="lg:hidden" onPress={() => setOpen(true)}>
              <Menu size={16}/>
            </Button>
            <p className="text-sm text-stone-500">{today}</p>
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
              <Dropdown.Menu aria-label="Account" onAction={(key) => {
            if (key === "restore")
                restore();
            if (key === "logout") {
                logout();
                navigate("/login");
            }
        }}>
                <Dropdown.Item id="restore">
                  <Label>Restore sample data</Label>
                </Dropdown.Item>
                <Dropdown.Item id="logout">
                  <Label>Sign out</Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </header>
        <main className="px-4 py-6 md:px-8 md:py-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>);
}
