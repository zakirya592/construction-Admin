import { Chip } from "@heroui/react";
import { labelize } from "@/lib/format";
const tones = {
    active: "bg-emerald-100 text-emerald-900",
    complete: "bg-stone-200 text-stone-800",
    planning: "bg-sky-100 text-sky-900",
    "on-hold": "bg-amber-100 text-amber-950",
    "on-site": "bg-emerald-100 text-emerald-900",
    off: "bg-stone-200 text-stone-700",
    leave: "bg-violet-100 text-violet-900",
    "in-use": "bg-emerald-100 text-emerald-900",
    available: "bg-sky-100 text-sky-900",
    maintenance: "bg-rose-100 text-rose-900",
    paid: "bg-emerald-100 text-emerald-900",
    sent: "bg-sky-100 text-sky-900",
    draft: "bg-stone-200 text-stone-700",
    overdue: "bg-rose-100 text-rose-900",
};
export function StatusChip({ value }) {
    return (<Chip size="sm" className={`capitalize ${tones[value] ?? "bg-sand text-ink"}`}>
      {labelize(value)}
    </Chip>);
}
export function Meter({ value, warnAt = 100 }) {
    const width = Math.max(0, Math.min(100, value));
    const hot = value >= warnAt;
    return (<div className="h-1.5 w-full overflow-hidden rounded-full bg-sand">
      <div className={`h-full rounded-full ${hot ? "bg-rose-700" : "bg-amber-600"}`} style={{ width: `${width}%` }}/>
    </div>);
}
