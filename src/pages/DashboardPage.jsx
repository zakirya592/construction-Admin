import { Card } from "@heroui/react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { ErrorBlock, LoadingBlock, PageHeader } from "@/components/PageBits";
import { Meter, StatusChip } from "@/components/StatusChip";
import { useCrew, useEquipment, useInvoices, useLogs, useMaterials, useProjects } from "@/hooks/resources";
import { money, prettyDate } from "@/lib/format";
export function DashboardPage() {
    const { user } = useAuth();
    const projects = useProjects();
    const crew = useCrew();
    const equipment = useEquipment();
    const materials = useMaterials();
    const invoices = useInvoices();
    const logs = useLogs();
    const pending = [projects, crew, equipment, materials, invoices, logs].some((query) => query.isLoading);
    const failed = [projects, crew, equipment, materials, invoices, logs].find((query) => query.isError);
    if (pending)
        return <LoadingBlock />;
    if (failed) {
        return (<ErrorBlock error={failed.error} onRetry={() => {
                void projects.refetch();
                void crew.refetch();
                void equipment.refetch();
                void materials.refetch();
                void invoices.refetch();
                void logs.refetch();
            }}/>);
    }
    const projectRows = projects.data ?? [];
    const crewRows = crew.data ?? [];
    const equipmentRows = equipment.data ?? [];
    const materialRows = materials.data ?? [];
    const invoiceRows = invoices.data ?? [];
    const logRows = [...(logs.data ?? [])].sort((a, b) => b.date.localeCompare(a.date));
    const active = projectRows.filter((item) => item.status === "active");
    const onSite = crewRows.filter((item) => item.status === "on-site");
    const openInvoices = invoiceRows.filter((item) => item.status === "sent" || item.status === "overdue");
    const lowStock = materialRows.filter((item) => item.onHand <= item.reorderAt);
    const downEquipment = equipmentRows.filter((item) => item.status === "maintenance");
    const budget = projectRows.reduce((sum, item) => sum + item.budget, 0);
    const spent = projectRows.reduce((sum, item) => sum + item.spent, 0);
    const lead = [...active].sort((a, b) => b.progress - a.progress)[0];
    const stats = [
        { label: "Active jobs", value: String(active.length), note: lead ? `${lead.name} leads at ${lead.progress}%` : "No active jobs" },
        { label: "Crew on site", value: String(onSite.length), note: `${crewRows.length} people on the roster` },
        { label: "Open invoices", value: money(openInvoices.reduce((sum, item) => sum + item.amount, 0)), note: `${openInvoices.length} still out for collection` },
        { label: "Budget burned", value: `${Math.round((spent / Math.max(budget, 1)) * 100)}%`, note: `${money(spent)} of ${money(budget)}` },
    ];
    const attention = [
        ...invoiceRows.filter((item) => item.status === "overdue").map((item) => `${item.number} is overdue · ${money(item.amount)}`),
        ...lowStock.map((item) => `${item.name} is under the reorder line`),
        ...downEquipment.map((item) => `${item.name} is in the shop`),
        ...projectRows.filter((item) => item.status === "on-hold").map((item) => `${item.name} is on hold`),
    ];
    return (<div>
      <PageHeader kicker="Overview" title={`Good ${greeting()}, ${user?.name.split(" ")[0] ?? "there"}.`} description={lead
            ? `${active.length} jobs are moving. ${lead.name} is the furthest along, and ${attention.length} items need a look before the afternoon meeting.`
            : "No active jobs on the board."}/>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (<motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card className="h-full border border-line bg-white shadow-none">
              <Card.Content className="gap-2">
                <p className="text-[11px] tracking-[0.16em] text-stone-500 uppercase">{stat.label}</p>
                <p className="font-serif text-4xl leading-none">{stat.value}</p>
                <p className="text-sm text-stone-500">{stat.note}</p>
              </Card.Content>
            </Card>
          </motion.div>))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Card className="border border-line bg-white shadow-none xl:col-span-3">
          <Card.Header className="flex-row items-center justify-between">
            <div>
              <Card.Title className="font-serif text-2xl">Job health</Card.Title>
              <Card.Description>Progress against the contract value.</Card.Description>
            </div>
            <Link to="/projects" className="text-sm text-amber-800">
              All projects
            </Link>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4">
            {projectRows.map((project) => {
            const burn = Math.round((project.spent / Math.max(project.budget, 1)) * 100);
            return (<div key={project.id} className="grid gap-2 border-b border-sand pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-xs text-stone-500">
                        {project.code} · {project.location} · {project.manager}
                      </p>
                    </div>
                    <StatusChip value={project.status}/>
                  </div>
                  <Meter value={project.progress}/>
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>{project.progress}% complete</span>
                    <span>
                      {money(project.spent)} spent · {burn}% of budget
                    </span>
                  </div>
                </div>);
        })}
          </Card.Content>
        </Card>

        <div className="flex flex-col gap-6 xl:col-span-2">
          <Card className="border border-line bg-ink text-stone-100 shadow-none">
            <Card.Header>
              <Card.Title className="font-serif text-2xl text-amber-100">Needs a look</Card.Title>
              <Card.Description className="text-stone-400">Pulled from invoices, stock, and the yard.</Card.Description>
            </Card.Header>
            <Card.Content>
              <ul className="flex flex-col gap-3 text-sm">
                {attention.length === 0 && <li>The board is clear.</li>}
                {attention.map((item) => (<li key={item} className="border-b border-white/10 pb-3 last:border-0 last:pb-0">
                    {item}
                  </li>))}
              </ul>
            </Card.Content>
          </Card>

          <Card className="border border-line bg-white shadow-none">
            <Card.Header>
              <Card.Title className="font-serif text-2xl">Latest logs</Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              {logRows.slice(0, 3).map((log) => {
            const project = projectRows.find((item) => item.id === log.projectId);
            return (<div key={log.id}>
                    <p className="text-xs tracking-wide text-stone-500 uppercase">
                      {prettyDate(log.date)} · {project?.code ?? "Job"} · {log.weather}
                    </p>
                    <p className="mt-1 text-sm">{log.summary}</p>
                  </div>);
        })}
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>);
}
function greeting() {
    const hour = new Date().getHours();
    if (hour < 12)
        return "morning";
    if (hour < 17)
        return "afternoon";
    return "evening";
}
