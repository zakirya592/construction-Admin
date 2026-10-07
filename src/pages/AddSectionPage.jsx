import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { AreaControl, RichTextControl, TextControl } from "@/components/Fields";
import { PageHeader } from "@/components/PageBits";
import { blankItem, sectionBody } from "@/landing/payload";
import { useLandingSections, useSaveLandingSection } from "@/landing/queries";
import { findSection, genericSection, isSectionSlug, sectionSlug } from "@/landing/sections";

function messageFromApi(error, fallback) {
  const data = error?.response?.data;
  const details = Array.isArray(data?.errors) ? data.errors.map((item) => item.message).filter(Boolean) : [];
  if (details.length) return details.join(". ");
  return data?.message || error?.message || fallback;
}

function contentFor(kind) {
  const section = kind === "custom" ? genericSection("custom", "Section", 0) : findSection(kind);
  if (!section) return null;
  const settings = {};
  for (const field of section.settings ?? []) settings[field.key] = "";
  return {
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    settings,
    file: null,
    items: section.itemFields?.length ? [blankItem(section)] : [],
  };
}

export function AddSectionPage() {
  const navigate = useNavigate();
  const saved = useLandingSections();
  const saveSection = useSaveLandingSection();
  const [name, setName] = useState("");
  const [order, setOrder] = useState("11");
  const [orderTouched, setOrderTouched] = useState(false);
  const [content, setContent] = useState(null);

  const slug = sectionSlug(name);
  const known = isSectionSlug(slug) ? findSection(slug) : null;
  const section = known ?? (isSectionSlug(slug) ? genericSection(slug, name.trim() || slug, Number(order) || 0) : null);
  const kind = known?.key ?? (section ? "custom" : "");
  const taken = Boolean(slug) && (saved.data ?? []).some((row) => row.sectionKey === slug);

  useEffect(() => {
    if (orderTouched || !saved.data) return;
    const max = saved.data.reduce((highest, row) => Math.max(highest, Number(row.order) || 0), -1);
    if (max >= 0) setOrder(String(max + 1));
  }, [orderTouched, saved.data]);

  useEffect(() => {
    setContent(kind ? contentFor(kind) : null);
  }, [kind]);

  function updateItem(id, patch) {
    setContent((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!section || !content || taken) return;
    try {
      const body = await saveSection.mutateAsync({
        sectionKey: section.key,
        create: true,
        body: sectionBody(section, {
          ...content,
          sectionName: name.trim(),
          order,
        }),
      });
      toast.success(body?.message || `${name.trim()} saved`);
      navigate(`/${section.key}`);
    } catch (err) {
      toast.error(messageFromApi(err, "Could not save this section"));
    }
  }

  return (
    <div>
      <PageHeader
        kicker="Landing"
        title="Add section"
        description="Name the section, such as FAQ, and save it on the landing page."
      />
      <form className="flex flex-col gap-6" onSubmit={onSubmit}>
        <section className="rounded-2xl border border-line bg-white p-5 md:p-6">
          <h2 className="font-serif text-2xl">Section</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextControl label="Section name" value={name} onChange={setName} placeholder="FAQ" />
            <TextControl
              label="Order"
              type="number"
              value={order}
              onChange={(value) => {
                setOrderTouched(true);
                setOrder(value);
              }}
            />
            {slug ? (
              <p className="text-sm text-stone-500 sm:col-span-2">
                Landing key: {slug}
                {known ? ` · uses the ${known.name} fields` : ""}
              </p>
            ) : name.trim() ? (
              <p className="text-sm text-stone-500 sm:col-span-2">Use letters or numbers in the section name.</p>
            ) : null}
            {taken ? (
              <p className="text-sm text-stone-500 sm:col-span-2">
                This section is already on the landing page.{" "}
                <button type="button" className="underline" onClick={() => navigate(`/${slug}`)}>
                  Open it
                </button>
              </p>
            ) : null}
            {content &&
              section &&
              (section.scalars ?? []).map((key) =>
                key === "description" ? (
                  <div key={key} className="sm:col-span-2">
                    <RichTextControl
                      label="Description"
                      value={content.description}
                      onChange={(description) => setContent((current) => ({ ...current, description }))}
                    />
                  </div>
                ) : (
                  <TextControl
                    key={key}
                    label={key === "subtitle" ? "Subtitle" : "Title"}
                    value={content[key]}
                    onChange={(value) => setContent((current) => ({ ...current, [key]: value }))}
                  />
                ),
              )}
            {content && section?.button && (
              <>
                <TextControl
                  label="Button text"
                  value={content.buttonText}
                  onChange={(buttonText) => setContent((current) => ({ ...current, buttonText }))}
                />
                <TextControl
                  label="Button link"
                  value={content.buttonLink}
                  onChange={(buttonLink) => setContent((current) => ({ ...current, buttonLink }))}
                />
              </>
            )}
            {content &&
              (section?.settings ?? []).map((field) => (
                <TextControl
                  key={field.key}
                  label={field.label}
                  value={content.settings[field.key] ?? ""}
                  onChange={(value) =>
                    setContent((current) => ({ ...current, settings: { ...current.settings, [field.key]: value } }))
                  }
                />
              ))}
            {content && section?.file && (
              <label className="flex flex-col gap-2 text-sm sm:col-span-2">
                <span>{section.file.label}</span>
                <input
                  key={kind}
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-xl file:border-0 file:bg-sand file:px-3 file:py-2 file:text-sm file:text-ink"
                  onChange={(event) => setContent((current) => ({ ...current, file: event.target.files?.[0] ?? null }))}
                />
                <span className="text-xs text-stone-500">{content.file ? content.file.name : "No image yet"}</span>
              </label>
            )}
          </div>
        </section>

        {content?.items.map((item, index) => (
          <section key={item.id} className="rounded-2xl border border-line bg-white p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-2xl">Item {index + 1}</h2>
              <Button
                isIconOnly
                aria-label={`Remove item ${index + 1}`}
                variant="ghost"
                onPress={() =>
                  setContent((current) => ({ ...current, items: current.items.filter((entry) => entry.id !== item.id) }))
                }
              >
                <Trash2 size={16} />
              </Button>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {(section?.itemFields ?? []).map((field) => {
                if (field.type === "file") {
                  return (
                    <label key={field.key} className="flex flex-col gap-2 text-sm sm:col-span-2">
                      <span>{field.label}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-xl file:border-0 file:bg-sand file:px-3 file:py-2 file:text-sm file:text-ink"
                        onChange={(event) => updateItem(item.id, { imageFile: event.target.files?.[0] ?? null })}
                      />
                      <span className="text-xs text-stone-500">{item.imageFile ? item.imageFile.name : "No image yet"}</span>
                    </label>
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
                      <AreaControl
                        label={field.label}
                        value={item[field.key] ?? ""}
                        onChange={(value) => updateItem(item.id, { [field.key]: value })}
                      />
                    </div>
                  );
                }
                return (
                  <TextControl
                    key={field.key}
                    label={field.label}
                    value={item[field.key] ?? ""}
                    onChange={(value) => updateItem(item.id, { [field.key]: value })}
                  />
                );
              })}
            </div>
          </section>
        ))}

        <div className="flex flex-wrap items-center gap-3">
          {content && section?.itemFields?.length ? (
            <Button
              type="button"
              variant="outline"
              onPress={() => setContent((current) => ({ ...current, items: [...current.items, blankItem(section)] }))}
            >
              <Plus size={16} /> Add item
            </Button>
          ) : null}
          <Button type="submit" variant="primary" isDisabled={!section || taken || !name.trim()} isPending={saveSection.isPending}>
            Save section
          </Button>
        </div>
      </form>
    </div>
  );
}
