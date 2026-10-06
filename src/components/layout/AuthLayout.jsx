import { motion } from "framer-motion";

export function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden bg-ink text-stone-100 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(115deg, transparent 0 42%, rgb(245 196 81 / 18%) 42% 43%, transparent 43%), radial-gradient(circle at 20% 80%, rgb(245 196 81 / 16%), transparent 36%)" }} />
        <div className="relative px-12 pt-12">
          <p className="text-[12px] tracking-[0.28em] text-amber-200">NORTHLINE CONSTRUCTION</p>
        </div>
        <div className="relative px-12 pb-16">
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="font-serif max-w-lg text-6xl leading-[0.95]">
            Every site, one desk.
          </motion.h1>
          <p className="mt-5 max-w-md text-stone-300">
            Jobs, crews, iron, and invoices for the Puget Sound office. Built for the people who already know which pour is late.
          </p>
          <div className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-6 text-sm">
            <div>
              <p className="font-serif text-3xl text-amber-200">6</p>
              <p className="text-stone-400">Jobs on the books</p>
            </div>
            <div>
              <p className="font-serif text-3xl text-amber-200">10</p>
              <p className="text-stone-400">Named leads</p>
            </div>
            <div>
              <p className="font-serif text-3xl text-amber-200">1</p>
              <p className="text-stone-400">Invoice past due</p>
            </div>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center bg-paper px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <p className="mb-6 text-[12px] tracking-[0.22em] text-amber-800 lg:hidden">NORTHLINE</p>
          {children}
        </motion.div>
      </section>
    </div>
  );
}
