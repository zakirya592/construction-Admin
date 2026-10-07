import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip, Modal } from "@heroui/react";
import { Building2, ClipboardList, Clock, Eye, House, Pencil, Plus, ShieldCheck, Trash2, TriangleAlert, User, Users } from "lucide-react";
import { toast } from "react-toastify";
import { DataTable } from "@/components/DataTable";
import { AreaControl, ConfirmDialog, RichTextControl, TextControl } from "@/components/Fields";
import { PageHeader } from "@/components/PageBits";
import { blankItem, emptyForm, formFromApi, sectionBody } from "@/landing/payload";
import { resolveSection } from "@/landing/sections";
import { useDeleteLandingSection, useLandingSection, useLandingStatus, useSaveLandingSection } from "@/landing/queries";

function messageFromApi(error, fallback) {
  const data = error?.response?.data;
  const details = Array.isArray(data?.errors) ? data.errors.map((item) => item.message).filter(Boolean) : [];
  if (details.length) return details.join(". ");
  return data?.message || error?.message || fallback;
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

function plainText(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function RichCopy({ html, className = "" }) {
  if (!plainText(html)) return null;
  return <div className={`rich-text-view min-w-0 whitespace-normal wrap-break-word ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

function Detail({ label, value }) {
  const html = label === "Description" && typeof value === "string" && /<[a-z][\s\S]*>/i.test(value);
  return (
    <div>
      <p className="text-[11px] tracking-[0.16em] text-stone-500 uppercase">{label}</p>
      {html ? (
        <div className="rich-text-view mt-1 text-sm text-ink" dangerouslySetInnerHTML={{ __html: value }} />
      ) : (
        <p className="mt-1 text-sm break-words text-ink">{shown(value)}</p>
      )}
    </div>
  );
}

function useLocalImage(file, url) {
  const [src, setSrc] = useState(url || "");
  useEffect(() => {
    if (!(file instanceof File)) {
      setSrc(url || "");
      return undefined;
    }
    const next = URL.createObjectURL(file);
    setSrc(next);
    return () => URL.revokeObjectURL(next);
  }, [file, url]);
  return src;
}

function splitHeroTitle(title) {
  const words = String(title ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length < 6) return { lead: words.join(" "), accent: "" };
  return { lead: words.slice(0, -4).join(" "), accent: words.slice(-4).join(" ") };
}

function HeroDesign({ form }) {
  const { lead, accent } = splitHeroTitle(form.title);
  const image = useLocalImage(form.file, form.fileUrl);
  const buttonLabel = String(form.buttonText ?? "").trim();
  const buttonText = buttonLabel && !/→\s*$/.test(buttonLabel) ? `${buttonLabel} →` : buttonLabel;
  return (
    <div
      className="relative flex min-h-[460px] items-center overflow-hidden bg-[#1c2430] px-8 py-14 text-white sm:px-12"
    >
      {image ? <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
      <div className="absolute inset-0 bg-linear-to-r from-[#0c1016]/80 via-[#0c1016]/35 to-[#0c1016]/10" />
      <div className="relative max-w-3xl">
        {form.subtitle ? (
          <div className="flex items-center gap-3 text-[11px] tracking-[0.28em] text-[#d4bc86] uppercase">
            <span className="h-px w-8 bg-[#d4bc86]" />
            {form.subtitle}
          </div>
        ) : null}
        {lead ? (
          <h2 className="mt-4 font-serif text-4xl leading-[1.05] text-white sm:text-6xl">
            {lead}
            {accent ? (
              <>
                <br />
                <span className="text-[#c6a15b] italic">{accent}</span>
              </>
            ) : null}
          </h2>
        ) : null}
        <RichCopy html={form.description} className="mt-6 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base" />
        {buttonText ? (
          <span className="mt-8 inline-flex border border-[#ead9ad] bg-[#c6a15b] px-4 py-2.5 text-sm font-medium text-[#1c1408]">{buttonText}</span>
        ) : null}
      </div>
    </div>
  );
}

const aboutIcons = [User, ShieldCheck, TriangleAlert, Clock];

function AboutDesign({ form, imageSide = "left" }) {
  const image = useLocalImage(form.file, form.fileUrl);
  const imageFirst = imageSide !== "right";
  const filled = form.items.filter((item) => item.title || item.value || plainText(item.description));
  const stat = filled.find((item) => String(item.value ?? "").trim());
  const cards = filled.filter((item) => (item !== stat || item.title) && (item.title || plainText(item.description)));
  const photo = (
    <div className={`relative ${imageFirst ? "" : "ml-auto w-full max-w-70"}`}>
      <div className={`absolute -bottom-3 h-[86%] w-[92%] border border-[#c9bfae] ${imageFirst ? "left-0" : "right-0"}`} />
      <div className={`relative overflow-hidden bg-[#ddd4c4] ${imageFirst ? "ml-4" : "mr-3"}`}>
        {image ? (
          <img src={image} alt="" className={`w-full object-contain ${imageFirst ? "aspect-4/5" : "h-80"}`} />
        ) : (
          <div className={`w-full ${imageFirst ? "aspect-4/5" : "h-80"}`} />
        )}
        {stat ? (
          <div className={`absolute bottom-4 max-w-45 bg-ink px-4 py-3 text-white ${imageFirst ? "right-4" : "left-4"}`}>
            <p className="font-serif text-3xl text-[#c6a15b]">{stat.value}</p>
            {plainText(stat.description) ? (
              <RichCopy html={stat.description} className="mt-1 text-xs leading-snug text-white/80" />
            ) : (
              <p className="mt-1 text-xs leading-snug text-white/80">{stat.title}</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
  const copy = (
    <div>
          {form.subtitle ? <p className="text-[11px] tracking-[0.22em] text-[#9a7433] uppercase">{form.subtitle}</p> : null}
          {form.title ? <h2 className="mt-3 font-serif text-4xl leading-[1.05] sm:text-5xl">{form.title}</h2> : null}
          <RichCopy html={form.description} className="mt-5 max-w-xl text-sm leading-relaxed text-stone-600 sm:text-base" />
          {cards.length ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {cards.map((item, index) => {
                const Icon = aboutIcons[index % aboutIcons.length];
                return (
                  <div key={item.id} className="rounded-xl border border-[#e4dccb] bg-white px-4 py-4">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f4efe6] text-[#9a7433]">
                      <Icon size={16} />
                    </span>
                    {item.title ? <p className="mt-3 text-sm font-semibold">{item.title}</p> : null}
                    <RichCopy html={item.description} className="mt-1 text-sm leading-relaxed text-stone-500" />
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
  );
  return (
    <div className="bg-[#f4efe6] px-5 py-8 text-ink sm:px-8 sm:py-10">
      <div className={`grid items-center gap-8 ${imageFirst ? "lg:grid-cols-2" : "lg:grid-cols-[minmax(0,1fr)_280px]"} lg:gap-12`}>
        {imageFirst ? photo : copy}
        {imageFirst ? copy : photo}
      </div>
    </div>
  );
}

const serviceIcons = [House, Building2, House, TriangleAlert, ClipboardList, Users];

function ServiceCard({ item, index }) {
  const image = useLocalImage(item.imageFile, item.imageUrl);
  const Icon = serviceIcons[index % serviceIcons.length];
  const number = String(item.number || index + 1).padStart(2, "0");
  return (
    <article className="flex h-full flex-col bg-[#fbf8f2] px-5 py-5">
      <div className="flex items-start justify-between text-[#9a7433]">
        {image ? <img src={image} alt="" className="h-8 w-8 object-contain" /> : <Icon size={22} strokeWidth={1.5} />}
        <span className="text-xs tracking-[0.18em] text-stone-400">{number}</span>
      </div>
      {item.title ? <h3 className="mt-8 text-lg">{item.title}</h3> : null}
      <RichCopy html={item.description} className="mt-2 text-sm leading-relaxed text-stone-500" />
     
    </article>
    //  <span className="mt-auto pt-6 text-sm text-[#9a7433]">Learn more ›</span>
  );
}

function isVisionSection(section) {
  return /vision|mission/i.test(`${section?.key ?? ""} ${section?.name ?? ""}`);
}

function isGoalsSection(section) {
  return /goals/i.test(`${section?.key ?? ""} ${section?.name ?? ""}`);
}

function hasSectionPreview(section) {
  return ["header", "hero", "about", "services"].includes(section.key) || isVisionSection(section) || isGoalsSection(section);
}

function VisionDesign({ form }) {
  const cards = form.items.filter((item) => item.title || plainText(item.description));
  return (
    <div className="bg-[#f3efe6] px-6 py-10 text-ink sm:px-10 sm:py-14">
      <p className="text-[11px] tracking-[0.22em] text-stone-500 uppercase">{form.subtitle || "Purpose"}</p>
      <div className="mt-4 grid items-start gap-8 lg:grid-cols-2 lg:gap-20">
        {form.title ? <h2 className="font-serif text-4xl leading-tight sm:text-5xl">{form.title}</h2> : <div />}
        <RichCopy html={form.description} className="max-w-md text-sm leading-relaxed text-stone-500 lg:pt-3" />
      </div>
      {cards.length ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {cards.map((item, index) => (
            <article key={item.id} className="border border-[#e4dccb] bg-[#f7f4ee] px-6 py-7">
              <p className="font-serif text-sm text-stone-400 italic">{String(item.number || index + 1).padStart(2, "0")}</p>
              {item.title ? <h3 className="mt-4 font-serif text-2xl">{item.title}</h3> : null}
              <RichCopy html={item.description} className="mt-3 text-sm leading-relaxed text-stone-600" />
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ServicesDesign({ form }) {
  const cards = form.items.filter((item) => item.title || item.number || plainText(item.description) || item.imageUrl || item.imageFile);
  return (
    <div className="bg-[#f4efe6] px-5 py-8 text-ink sm:px-8 sm:py-10">
      <p className="text-[11px] tracking-[0.22em] text-stone-500 uppercase">{form.sectionName || "Services"}</p>
      <div className="mt-4 grid items-start gap-6 lg:grid-cols-2 lg:gap-16">
        {form.title ? <h2 className="font-serif text-4xl leading-[1.05] sm:text-5xl">{form.title}</h2> : <div />}
        <RichCopy html={form.description} className="text-sm leading-relaxed text-stone-500 lg:pt-2" />
      </div>
      {cards.length ? (
        <div className="mt-8 grid gap-px bg-[#e6dfd2] sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((item, index) => (
            <ServiceCard key={item.id} item={item} index={index} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function HeaderDesign({ form }) {
  const links = form.items.filter((item) => item.label || item.link);
  const brand = form.sectionName && form.sectionName !== "Header" ? form.sectionName : "NORTHLINE";
  const logo = useLocalImage(form.file, form.fileUrl);
  return (
    <div className="header-preview-bar flex flex-wrap items-center gap-x-8 gap-y-4 px-6 py-4 text-white sm:px-8">
      <div className="flex shrink-0 items-center gap-3">
        {logo ? (
          <img src={logo} alt="" className="h-11 w-11 object-contain" />
        ) : (
          <span className="grid h-11 w-11 place-items-center border border-[#e4d0a0] bg-[#c6a15b] font-serif text-lg text-[#1c1408]">N</span>
        )}
        <span className="text-[13px] font-medium tracking-[0.28em]">{brand}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        {links.map((item, index) => (
          <span key={item.id} className={index === 0 ? "border-b border-[#d4bc86] pb-0.5" : "text-white/90"}>
            {item.label || item.link}
          </span>
        ))}
      </div>
      {form.settings.phone || form.settings.email ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/75">
          {form.settings.phone ? <span>{form.settings.phone}</span> : null}
          {form.settings.email ? <span>{form.settings.email}</span> : null}
        </div>
      ) : null}
      {form.buttonText ? (
        <span className="shrink-0 border border-[#ead9ad] bg-[#c6a15b] px-4 py-2 text-sm font-medium text-[#1c1408]">{form.buttonText}</span>
      ) : null}
    </div>
  );
}

function HeaderPreview({ form }) {
  const links = form.items.filter((item) => item.label || item.link);
  const logo = useLocalImage(form.file, form.fileUrl);
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-ink text-stone-100">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
        {logo ? (
          <img src={logo} alt="" className="h-10 w-auto max-w-35 object-contain" />
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
          { header: "Description", cell: (row) => (plainText(row.description) ? <RichCopy html={row.description} className="max-w-sm text-sm" /> : "—") },
          {
            header: "Image",
            cell: (row) =>
              <ChosenImage file={row.imageFile} url={row.imageUrl} className="h-12 w-20 rounded-lg object-cover" />,
          },
          { header: "Link", cell: (row) => row.link || "—" },
        ]}
      />
    </div>
  );
}

function ChosenImage({ file, url, className }) {
  const src = useLocalImage(file, url);
  if (!src) return "—";
  return <img src={src} alt="" className={className} />;
}

function FileField({ label, file, url, onChange }) {
  const src = useLocalImage(file, url);
  return (
    <label className="flex flex-col gap-2 text-sm sm:col-span-2">
      <span>{label}</span>
      <input
        type="file"
        accept="image/*"
        className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-xl file:border-0 file:bg-sand file:px-3 file:py-2 file:text-sm file:text-ink"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      {src ? <img src={src} alt="" className="h-28 w-full max-w-xs rounded-xl object-cover" /> : null}
      <span className="text-xs text-stone-500">{file ? file.name : url || "No image yet"}</span>
    </label>
  );
}

export function LandingSectionPage({ sectionKey, mode = "view" }) {
  const navigate = useNavigate();
  const isAdd = mode === "add";
  const isEdit = mode === "edit";
  const [form, setForm] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const skipLoad = isAdd;
  const sectionQuery = useLandingSection(sectionKey, { enabled: Boolean(sectionKey) && !skipLoad });
  const section = resolveSection(sectionKey, sectionQuery.data);
  const saveSection = useSaveLandingSection();
  const statusChange = useLandingStatus();
  const deleteSection = useDeleteLandingSection();

  useEffect(() => {
    const current = resolveSection(sectionKey, sectionQuery.data);
    if (!current) return;
    if (skipLoad) {
      setForm(emptyForm(current));
      return;
    }
    if (sectionQuery.data) setForm(formFromApi(current, sectionQuery.data));
    else if (sectionQuery.isError || sectionQuery.isSuccess) setForm(emptyForm(current));
  }, [sectionKey, skipLoad, sectionQuery.data, sectionQuery.dataUpdatedAt, sectionQuery.isError, sectionQuery.isSuccess]);

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
    try {
      const missing = sectionQuery.isError && sectionQuery.error?.response?.status === 404;
      const body = await saveSection.mutateAsync({
        sectionKey: section.key,
        body: sectionBody(section, form),
        create: isAdd || missing,
      });
      toast.success(body?.message || `${section.name} saved`);
      if (isAdd || isEdit) navigate(section.path);
    } catch (err) {
      toast.error(messageFromApi(err, "Could not save this section"));
    }
  }

  const hasAddPage = section.key === "header" || section.key === "projects";
  const pageTitle = isAdd ? `Add ${section.name}` : isEdit ? `Edit ${section.name}` : section.name;
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
    try {
      const body = await statusChange.mutateAsync({ sectionKey: section.key, isActive: next });
      toast.success(body?.message || (next ? `${section.name} is active` : `${section.name} is hidden`));
    } catch (err) {
      toast.error(messageFromApi(err, "Could not update status"));
    }
  }

  async function onDelete() {
    try {
      const body = await deleteSection.mutateAsync(section.key);
      toast.success(body?.message || `${section.name} deleted`);
      setForm(emptyForm(section));
      setDeleteOpen(false);
      if (section.custom) navigate("/header", { replace: true });
    } catch (err) {
      toast.error(messageFromApi(err, "Could not delete this section"));
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
            {hasSectionPreview(section) && form ? (
              <Button variant="outline" onPress={() => setPreviewOpen(true)}>
                <Eye size={16} /> Preview
              </Button>
            ) : null}
            {form?.raw ? (
              <Chip size="sm" className={form.raw.isActive === false ? "bg-stone-200 text-stone-700" : "bg-emerald-100 text-emerald-900"}>
                {form.raw.isActive === false ? "Hidden" : "Active"}
              </Chip>
            ) : null}
            {!isAdd && !isEdit && form?.raw && (
              <Button variant="outline" onPress={onToggleStatus} isPending={statusChange.isPending}>
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
           
          </div>
        }
      />
      {sectionQuery.isLoading && <p className="text-sm text-stone-500">Loading {section.name.toLowerCase()}…</p>}
      {sectionQuery.isError && <p className="mb-4 text-sm text-stone-500">{messageFromApi(sectionQuery.error, "Could not load this section")}</p>}
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
                    <RichTextControl label="Description" value={form.description} onChange={(description) => setForm({ ...form, description })} />
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
                  if (field.key === "description") {
                    return (
                      <RichTextControl
                        key={field.key}
                        label={field.label}
                        value={item[field.key] ?? ""}
                        onChange={(value) => updateItem(item.id, { [field.key]: value })}
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
            <Button type="submit" variant="primary" isPending={saveSection.isPending}>
              Save {section.name}
            </Button>
          </div>
        </form>
      )}
      {hasSectionPreview(section) && form ? (
        <Modal isOpen={previewOpen} onOpenChange={setPreviewOpen}>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog className="w-[90vw] max-w-[90vw]">
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading className="font-serif text-2xl">
                    {section.key === "hero"
                      ? "Hero preview"
                      : section.key === "about"
                        ? "About preview"
                        : section.key === "services"
                          ? "Services preview"
                          : isVisionSection(section)
                            ? "Vision & Mission preview"
                            : isGoalsSection(section)
                              ? "Our Goals preview"
                              : "Header preview"}
                  </Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <div className="overflow-hidden rounded-xl">
                    {section.key === "hero" ? (
                      <HeroDesign form={form} />
                    ) : section.key === "about" ? (
                      <AboutDesign form={form} />
                    ) : section.key === "services" ? (
                      <ServicesDesign form={form} />
                    ) : isVisionSection(section) ? (
                      <VisionDesign form={form} />
                    ) : isGoalsSection(section) ? (
                      <AboutDesign form={form} imageSide="right" />
                    ) : (
                      <HeaderDesign form={form} />
                    )}
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button slot="close" variant="ghost">
                    Close
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      ) : null}
      <ConfirmDialog
        title={`Delete ${section.name}?`}
        body={`This removes the ${section.name.toLowerCase()} section from the landing page.`}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={onDelete}
        pending={deleteSection.isPending}
      />
    </div>
  );
}
