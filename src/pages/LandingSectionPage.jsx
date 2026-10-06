import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip } from "@heroui/react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { DataTable } from "@/components/DataTable";
import { AreaControl, ConfirmDialog, TextControl } from "@/components/Fields";
import { PageHeader } from "@/components/PageBits";
import { findSection } from "@/landing/sections";
import newRequest from "@/utils/userRequest";

function messageFromApi(error, fallback) {
  const data = error?.response?.data;
  const details = Array.isArray(data?.errors) ? data.errors.map((item) => item.message).filter(Boolean) : [];
  if (details.length) return details.join(". ");
  return data?.message || error?.message || fallback;
}

function blankItem(section) {
  const item = { id: crypto.randomUUID(), imageFile: null, imageUrl: "" };
  for (const field of section.itemFields ?? []) {
    if (field.type !== "file") item[field.key] = "";
  }
  return item;
}

function itemFromApi(section, raw) {
  const item = blankItem(section);
  for (const field of section.itemFields ?? []) {
    if (field.type === "file") item.imageUrl = raw?.[field.key] ?? "";
    else item[field.key] = raw?.[field.key] ?? "";
  }
  return item;
}

function emptyForm(section) {
  const settings = {};
  for (const field of section.settings ?? []) settings[field.key] = "";
  return {
    sectionName: section.name,
    order: String(section.order),
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    settings,
    file: null,
    fileUrl: "",
    items: section.itemFields?.length ? [blankItem(section)] : [],
  };
}

function formFromApi(section, data) {
  const next = emptyForm(section);
  next.sectionName = data.sectionName || section.name;
  next.order = String(data.order ?? section.order);
  next.title = data.title ?? "";
  next.subtitle = data.subtitle ?? "";
  next.description = data.description ?? "";
  next.buttonText = data.button?.text ?? "";
  next.buttonLink = data.button?.link ?? "";
  for (const field of section.settings ?? []) {
    next.settings[field.key] = data.settings?.[field.key] ?? "";
  }
  if (section.file?.key === "logo") next.fileUrl = data.settings?.logo || data.logo || "";
  if (section.file?.key === "image") next.fileUrl = data.image || "";
  const items = (data.items ?? []).map((raw) => itemFromApi(section, raw));
  next.items = items.length ? items : next.items;
  next.raw = data;
  return next;
}

function shown(value) {
  if (value == null || value === "") return "—";
  if (typeof value === "object") {
    const text = Object.entries(value)
      .filter(([, entry]) => entry)
      .map(([key, entry]) => `${key}: ${entry}`)
      .join(" · ");
    return text || "—";
  }
  return String(value);
}

function shownDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.16em] text-stone-500 uppercase">{label}</p>
      <p className="mt-1 text-sm break-words text-ink">{shown(value)}</p>
    </div>
  );
}

function HeaderPreview({ form }) {
  const links = form.items.filter((item) => item.label || item.link);
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-ink text-stone-100">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
        {form.fileUrl ? (
          <img src={form.fileUrl} alt="" className="h-10 w-auto max-w-[140px] object-contain" />
        ) : (
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 text-sm font-semibold text-ink">N</span>
        )}
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {links.map((item) => (
            <span key={item.id}>{item.label || item.link}</span>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-4 text-sm text-stone-300">
          {form.settings.phone && <span>{form.settings.phone}</span>}
          {form.settings.email && <span>{form.settings.email}</span>}
          {form.buttonText && <span className="rounded-full bg-amber-400 px-4 py-2 font-medium text-ink">{form.buttonText}</span>}
        </div>
      </div>
    </div>
  );
}

function HeaderBoard({ form }) {
  const record = form.raw ?? {};
  const settings = record.settings ?? {};
  return (
    <div className="flex flex-col gap-6">
      <HeaderPreview form={form} />
      <section className="rounded-2xl border border-line bg-white p-5 md:p-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Section key" value={record.sectionKey || "header"} />
          <Detail label="Section name" value={form.sectionName} />
          <Detail label="Order" value={form.order} />
          <Detail label="Title" value={form.title} />
          <Detail label="Subtitle" value={form.subtitle} />
          <Detail label="Description" value={form.description} />
          <Detail label="Image" value={record.image} />
          <Detail label="Button text" value={form.buttonText} />
          <Detail label="Button link" value={form.buttonLink} />
          <Detail label="Logo" value={settings.logo || form.fileUrl} />
          <Detail label="Phone" value={settings.phone || form.settings.phone} />
          <Detail label="Email" value={settings.email || form.settings.email} />
          <Detail label="Created" value={shownDate(record.createdAt)} />
          <Detail label="Updated" value={shownDate(record.updatedAt)} />
          <Detail label="ID" value={record._id || record.id} />
        </div>
      </section>
      <DataTable
        label="Header links"
        rows={form.items}
        empty="No links in this header yet."
        columns={[
          { header: "Label", rowHeader: true, cell: (row) => row.label || "—" },
          { header: "Link", cell: (row) => row.link || "—" },
        ]}
      />
    </div>
  );
}

function ProjectsBoard({ form }) {
  const record = form.raw ?? {};
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-line bg-white p-5 md:p-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Section key" value={record.sectionKey || "projects"} />
          <Detail label="Section name" value={form.sectionName} />
          <Detail label="Order" value={form.order} />
          <Detail label="Title" value={form.title} />
          <Detail label="Subtitle" value={form.subtitle} />
          <Detail label="Description" value={form.description} />
          <Detail label="Image" value={record.image} />
          <Detail label="Button" value={form.buttonText ? `${form.buttonText} ${form.buttonLink}` : ""} />
          <Detail label="Settings" value={record.settings} />
          <Detail label="Created" value={shownDate(record.createdAt)} />
          <Detail label="Updated" value={shownDate(record.updatedAt)} />
          <Detail label="ID" value={record._id || record.id} />
        </div>
      </section>
      <DataTable
        label="Projects"
        rows={form.items}
        empty="No projects in this section yet."
        columns={[
          { header: "Title", rowHeader: true, cell: (row) => row.title || "—" },
          { header: "Category", cell: (row) => row.category || "—" },
          { header: "Description", cell: (row) => row.description || "—" },
          {
            header: "Image",
            cell: (row) =>
              row.imageUrl ? <img src={row.imageUrl} alt="" className="h-12 w-20 rounded-lg object-cover" /> : "—",
          },
          { header: "Link", cell: (row) => row.link || "—" },
        ]}
      />
    </div>
  );
}

function itemIsEmpty(section, item) {
  const hasText = (section.itemFields ?? []).some((field) => field.type !== "file" && String(item[field.key] ?? "").trim());
  const hasFile = item.imageFile instanceof File && item.imageFile.size > 0;
  return !hasText && !hasFile && !item.imageUrl;
}

function appendForm(section, form) {
  const body = new FormData();
  body.append("sectionKey", section.key);
  body.append("sectionName", form.sectionName.trim() || section.name);
  body.append("order", String(form.order ?? section.order));
  for (const key of section.scalars ?? []) body.append(key, form[key] ?? "");
  if (section.button) {
    body.append("button[text]", form.buttonText ?? "");
    body.append("button[link]", form.buttonLink ?? "");
  }
  for (const field of section.settings ?? []) {
    body.append(`settings[${field.key}]`, form.settings?.[field.key] ?? "");
  }
  if (form.file instanceof File && form.file.size > 0) {
    body.append(section.file.key, form.file, form.file.name);
  }
  const items = (form.items ?? []).filter((item) => !itemIsEmpty(section, item));
  items.forEach((item, index) => {
    for (const field of section.itemFields ?? []) {
      if (field.type === "file") {
        if (item.imageFile instanceof File && item.imageFile.size > 0) {
          body.append(`items[${index}][${field.key}]`, item.imageFile, item.imageFile.name);
        } else if (item.imageUrl) {
          body.append(`items[${index}][${field.key}]`, item.imageUrl);
        }
      } else {
        body.append(`items[${index}][${field.key}]`, item[field.key] ?? "");
      }
    }
  });
  return body;
}

function FileField({ label, file, url, onChange }) {
  return (
    <label className="flex flex-col gap-2 text-sm sm:col-span-2">
      <span>{label}</span>
      <input
        type="file"
        accept="image/*"
        className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-xl file:border-0 file:bg-sand file:px-3 file:py-2 file:text-sm file:text-ink"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <span className="text-xs text-stone-500">{file ? file.name : url || "No image yet"}</span>
    </label>
  );
}

export function LandingSectionPage({ sectionKey, mode = "view" }) {
  const section = findSection(sectionKey);
  const navigate = useNavigate();
  const isAdd = mode === "add";
  const isEdit = mode === "edit";
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [statusPending, setStatusPending] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const current = findSection(sectionKey);
    if (!current) return undefined;
    let active = true;
    setLoading(true);
    setError("");
    setForm(emptyForm(current));
    if (isAdd && current.key === "header") {
      setLoading(false);
      return () => {
        active = false;
      };
    }
    newRequest
      .get(`/api/landing-page/${current.key}`)
      .then((response) => {
        if (!active) return;
        const data = response.data?.data;
        if (data) setForm(formFromApi(current, data));
      })
      .catch((err) => {
        if (!active) return;
        setError(messageFromApi(err, "Could not load this section"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [sectionKey, isAdd]);

  if (!section) {
    return <p className="text-sm text-stone-500">That section is not part of the landing page.</p>;
  }

  function updateItem(id, patch) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setPending(true);
    try {
      const body = appendForm(section, form);
      const response = isAdd
        ? await newRequest.post("/api/landing-page", body)
        : await newRequest.put(`/api/landing-page/${section.key}`, body);
      const message = response.data?.message;
      if (response.data?.status === false) throw new Error(message || "Could not save this section");
      toast.success(message || `${section.name} saved`);
      if (isAdd || isEdit) navigate(section.path);
    } catch (err) {
      toast.error(messageFromApi(err, "Could not save this section"));
    } finally {
      setPending(false);
    }
  }

  const hasAddPage = section.key === "header" || section.key === "projects";
  const addLabel = section.key === "header" ? "Add header" : "Add project";
  const pageTitle = isAdd ? addLabel : isEdit ? `Edit ${section.name}` : section.key === "projects" && form?.title ? form.title : section.name;
  const pageDescription = isAdd
    ? section.key === "header"
      ? "Create the header. This page does not load the saved header."
      : "Fill in this section, then save. Existing items stay in the form so they are not dropped."
    : isEdit
      ? `Update the saved ${section.name.toLowerCase()}.`
      : section.key === "header"
        ? "Loaded from the header section."
        : section.key === "projects" && form?.description
          ? form.description
          : "Saved with the landing page form, including pictures only when you choose a file.";

  async function onToggleStatus() {
    if (!form?.raw) return;
    const next = form.raw.isActive === false;
    setStatusPending(true);
    try {
      const response = await newRequest.patch(`/api/landing-page/${section.key}/status`, { isActive: next });
      const message = response.data?.message;
      if (response.data?.status === false) throw new Error(message || "Could not update status");
      const data = response.data?.data;
      if (data && typeof data === "object" && data.sectionKey) setForm(formFromApi(section, data));
      else setForm((current) => ({ ...current, raw: { ...current.raw, isActive: next } }));
      toast.success(message || (next ? `${section.name} is active` : `${section.name} is hidden`));
    } catch (err) {
      toast.error(messageFromApi(err, "Could not update status"));
    } finally {
      setStatusPending(false);
    }
  }

  async function onDelete() {
    setPending(true);
    try {
      const response = await newRequest.delete(`/api/landing-page/${section.key}`);
      const message = response.data?.message;
      if (response.data?.status === false) throw new Error(message || "Could not delete this section");
      toast.success(message || `${section.name} deleted`);
      setForm(emptyForm(section));
      setDeleteOpen(false);
    } catch (err) {
      toast.error(messageFromApi(err, "Could not delete this section"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <PageHeader
        kicker="Landing"
        title={pageTitle}
        description={pageDescription}
        action={
          <div className="flex flex-wrap items-center gap-3">
            {form?.raw ? (
              <Chip size="sm" className={form.raw.isActive === false ? "bg-stone-200 text-stone-700" : "bg-emerald-100 text-emerald-900"}>
                {form.raw.isActive === false ? "Hidden" : "Active"}
              </Chip>
            ) : null}
            {!isAdd && !isEdit && form?.raw && (
              <Button variant="outline" onPress={onToggleStatus} isPending={statusPending}>
                {form.raw.isActive === false ? "Show" : "Hide"}
              </Button>
            )}
            {!isAdd && !isEdit && hasAddPage && form?.raw && (
              <Button variant="outline" onPress={() => navigate(`${section.path}/edit`)}>
                <Pencil size={16} /> Edit
              </Button>
            )}
            {!isAdd && !isEdit && form?.raw && (
              <Button variant="danger" onPress={() => setDeleteOpen(true)}>
                <Trash2 size={16} /> Delete
              </Button>
            )}
            {!isAdd && !isEdit && hasAddPage && (
              <Button variant="primary" onPress={() => navigate(`${section.path}/new`)}>
                <Plus size={16} /> {addLabel}
              </Button>
            )}
          </div>
        }
      />
      {loading && <p className="text-sm text-stone-500">Loading {section.name.toLowerCase()}…</p>}
      {error && <p className="mb-4 text-sm text-stone-500">{error}</p>}
      {form && !isAdd && !isEdit && section.key === "header" && (
        <div className="mb-6">
          <HeaderBoard form={form} />
        </div>
      )}
      {form && !isAdd && !isEdit && section.key === "projects" && (
        <div className="mb-8">
          <ProjectsBoard form={form} />
        </div>
      )}
      {form && (isAdd || isEdit || !hasAddPage) && (
        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
          <section className="rounded-2xl border border-line bg-white p-5 md:p-6">
            <h2 className="font-serif text-2xl">Section</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TextControl label="Section name" value={form.sectionName} onChange={(sectionName) => setForm({ ...form, sectionName })} />
              <TextControl label="Order" type="number" value={form.order} onChange={(order) => setForm({ ...form, order })} />
              {(section.scalars ?? []).map((key) =>
                key === "description" ? (
                  <div key={key} className="sm:col-span-2">
                    <AreaControl label="Description" value={form.description} onChange={(description) => setForm({ ...form, description })} />
                  </div>
                ) : (
                  <TextControl key={key} label={key === "subtitle" ? "Subtitle" : "Title"} value={form[key]} onChange={(value) => setForm({ ...form, [key]: value })} />
                ),
              )}
              {section.button && (
                <>
                  <TextControl label="Button text" value={form.buttonText} onChange={(buttonText) => setForm({ ...form, buttonText })} />
                  <TextControl label="Button link" value={form.buttonLink} onChange={(buttonLink) => setForm({ ...form, buttonLink })} />
                </>
              )}
              {(section.settings ?? []).map((field) => (
                <TextControl
                  key={field.key}
                  label={field.label}
                  value={form.settings[field.key] ?? ""}
                  onChange={(value) => setForm({ ...form, settings: { ...form.settings, [field.key]: value } })}
                />
              ))}
              {section.file && <FileField label={section.file.label} file={form.file} url={form.fileUrl} onChange={(file) => setForm({ ...form, file })} />}
            </div>
          </section>

          {form.items.map((item, index) => (
            <section key={item.id} className="rounded-2xl border border-line bg-white p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-serif text-2xl">Item {index + 1}</h2>
                <Button
                  isIconOnly
                  aria-label={`Remove item ${index + 1}`}
                  variant="ghost"
                  onPress={() => setForm({ ...form, items: form.items.filter((entry) => entry.id !== item.id) })}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {(section.itemFields ?? []).map((field) => {
                  if (field.type === "file") {
                    return (
                      <FileField
                        key={field.key}
                        label={field.label}
                        file={item.imageFile}
                        url={item.imageUrl}
                        onChange={(imageFile) => updateItem(item.id, { imageFile })}
                      />
                    );
                  }
                  if (field.type === "area") {
                    return (
                      <div key={field.key} className="sm:col-span-2">
                        <AreaControl label={field.label} value={item[field.key] ?? ""} onChange={(value) => updateItem(item.id, { [field.key]: value })} />
                      </div>
                    );
                  }
                  return <TextControl key={field.key} label={field.label} value={item[field.key] ?? ""} onChange={(value) => updateItem(item.id, { [field.key]: value })} />;
                })}
              </div>
            </section>
          ))}

          <div className="flex flex-wrap items-center gap-3">
            {section.itemFields?.length ? (
              <Button type="button" variant="outline" onPress={() => setForm({ ...form, items: [...form.items, blankItem(section)] })}>
                <Plus size={16} /> Add item
              </Button>
            ) : null}
            <Button type="submit" variant="primary" isPending={pending}>
              Save {section.name}
            </Button>
          </div>
        </form>
      )}
      <ConfirmDialog
        title={`Delete ${section.name}?`}
        body={`This removes the ${section.name.toLowerCase()} section from the landing page.`}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={onDelete}
        pending={pending}
      />
    </div>
  );
}
