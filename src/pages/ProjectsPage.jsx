import { useMemo, useState } from "react";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { ConfirmDialog, FormDialog, SearchBox, SelectControl, TextControl } from "@/components/Fields";
import { ErrorBlock, LoadingBlock, PageHeader } from "@/components/PageBits";
import { Meter, StatusChip } from "@/components/StatusChip";
import { useClients, useDeleteProject, useProjects, useSaveProject } from "@/hooks/resources";
import { money, matchesQuery } from "@/lib/format";
import { PROJECT_STATUSES } from "@/types";
const blank = {
    name: "",
    code: "",
    clientId: "",
    location: "",
    status: "planning",
    progress: "0",
    budget: "",
    spent: "0",
    startDate: "",
    endDate: "",
    manager: "",
};
export function ProjectsPage() {
    const projects = useProjects();
    const clients = useClients();
    const save = useSaveProject();
    const remove = useDeleteProject();
    const [query, setQuery] = useState("");
    const [editing, setEditing] = useState(null);
    const [removing, setRemoving] = useState(null);
    const clientName = useMemo(() => new Map((clients.data ?? []).map((client) => [client.id, client.company])), [clients.data]);
    const rows = (projects.data ?? []).filter((project) => matchesQuery(query, [project.name, project.code, project.location, project.manager, clientName.get(project.clientId)]));
    if (projects.isLoading || clients.isLoading)
        return <LoadingBlock />;
    if (projects.isError)
        return <ErrorBlock error={projects.error} onRetry={() => void projects.refetch()}/>;
    if (clients.isError)
        return <ErrorBlock error={clients.error} onRetry={() => void clients.refetch()}/>;
    function openNew() {
        setEditing({ form: { ...blank, clientId: clients.data?.[0]?.id ?? "" } });
    }
    function openEdit(project) {
        setEditing({
            id: project.id,
            form: {
                name: project.name,
                code: project.code,
                clientId: project.clientId,
                location: project.location,
                status: project.status,
                progress: String(project.progress),
                budget: String(project.budget),
                spent: String(project.spent),
                startDate: project.startDate,
                endDate: project.endDate,
                manager: project.manager,
            },
        });
    }
    return (<div>
      <PageHeader kicker="Jobs" title="Projects" description="Contract value, burn, and who is running the site. Harbor Point is still the biggest number on the board." action={<Button variant="primary" onPress={openNew}>
            <Plus size={16}/> New project
          </Button>}/>
      <div className="mb-4">
        <SearchBox value={query} onChange={setQuery} placeholder="Search name, code, city, or manager"/>
      </div>
      <DataTable label="Projects" rows={rows} empty="No project matches that search." onEdit={openEdit} onDelete={setRemoving} columns={[
            {
                header: "Project",
                rowHeader: true,
                cell: (project) => (<div>
                <p className="font-medium">{project.name}</p>
                <p className="text-xs text-stone-500">{project.code}</p>
              </div>),
            },
            { header: "Client", cell: (project) => clientName.get(project.clientId) ?? "—" },
            { header: "Site", cell: (project) => project.location },
            { header: "Status", cell: (project) => <StatusChip value={project.status}/> },
            {
                header: "Progress",
                cell: (project) => (<div className="min-w-28">
                <Meter value={project.progress}/>
                <p className="mt-1 text-xs text-stone-500">{project.progress}%</p>
              </div>),
            },
            {
                header: "Budget",
                cell: (project) => (<div>
                <p>{money(project.spent)}</p>
                <p className="text-xs text-stone-500">of {money(project.budget)}</p>
              </div>),
            },
        ]}/>
      <FormDialog title={editing?.id ? "Edit project" : "New project"} open={Boolean(editing)} onOpenChange={(open) => {
            if (!open)
                setEditing(null);
        }} pending={save.isPending} onSubmit={() => {
            if (!editing)
                return;
            const form = editing.form;
            save.mutate({
                id: editing.id,
                name: form.name.trim(),
                code: form.code.trim(),
                clientId: form.clientId,
                location: form.location.trim(),
                status: form.status,
                progress: Number(form.progress),
                budget: Number(form.budget),
                spent: Number(form.spent),
                startDate: form.startDate,
                endDate: form.endDate,
                manager: form.manager.trim(),
            }, { onSuccess: () => setEditing(null) });
        }}>
        {editing && (<>
            <TextControl label="Project name" value={editing.form.name} onChange={(name) => setEditing({ ...editing, form: { ...editing.form, name } })}/>
            <TextControl label="Code" value={editing.form.code} onChange={(code) => setEditing({ ...editing, form: { ...editing.form, code } })}/>
            <SelectControl label="Client" value={editing.form.clientId} onChange={(clientId) => setEditing({ ...editing, form: { ...editing.form, clientId } })} options={(clients.data ?? []).map((client) => ({ id: client.id, label: client.company }))}/>
            <SelectControl label="Status" value={editing.form.status} onChange={(status) => setEditing({ ...editing, form: { ...editing.form, status: status } })} options={PROJECT_STATUSES.map((status) => ({ id: status, label: status }))}/>
            <TextControl label="Location" value={editing.form.location} onChange={(location) => setEditing({ ...editing, form: { ...editing.form, location } })}/>
            <TextControl label="Manager" value={editing.form.manager} onChange={(manager) => setEditing({ ...editing, form: { ...editing.form, manager } })}/>
            <TextControl label="Progress %" type="number" value={editing.form.progress} onChange={(progress) => setEditing({ ...editing, form: { ...editing.form, progress } })}/>
            <TextControl label="Budget" type="number" value={editing.form.budget} onChange={(budget) => setEditing({ ...editing, form: { ...editing.form, budget } })}/>
            <TextControl label="Spent" type="number" value={editing.form.spent} onChange={(spent) => setEditing({ ...editing, form: { ...editing.form, spent } })}/>
            <TextControl label="Start" type="date" value={editing.form.startDate} onChange={(startDate) => setEditing({ ...editing, form: { ...editing.form, startDate } })}/>
            <TextControl label="Finish" type="date" value={editing.form.endDate} onChange={(endDate) => setEditing({ ...editing, form: { ...editing.form, endDate } })}/>
          </>)}
      </FormDialog>
      <ConfirmDialog title="Remove this project?" body={removing ? `${removing.name} leaves the board. Crew and invoices that point at it will stay.` : ""} open={Boolean(removing)} onOpenChange={(open) => {
            if (!open)
                setRemoving(null);
        }} pending={remove.isPending} onConfirm={() => {
            if (!removing)
                return;
            remove.mutate(removing.id, { onSuccess: () => setRemoving(null) });
        }}/>
    </div>);
}
