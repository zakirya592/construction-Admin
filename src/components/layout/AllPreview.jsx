import { useState } from "react";
import { Button, Modal } from "@heroui/react";
import { Eye } from "lucide-react";
import { formFromApi } from "@/landing/payload";
import { useLandingSectionDetails } from "@/landing/queries";
import { resolveSection } from "@/landing/sections";
import { AnySectionPreview } from "@/pages/LandingSectionPage";

const previewSlots = [
  (row) => row.sectionKey === "header",
  (row) => row.sectionKey === "hero",
  (row) => row.sectionKey === "about",
  (row) => /vision|mission/i.test(`${row.sectionKey} ${row.sectionName ?? ""}`),
  (row) => /goals/i.test(`${row.sectionKey} ${row.sectionName ?? ""}`),
  (row) => row.sectionKey === "services",
  (row) => /landscape/i.test(`${row.sectionKey} ${row.sectionName ?? ""}`),
  (row) => row.sectionKey === "testimonials",
  (row) => row.sectionKey === "contact",
  (row) => row.sectionKey === "footer",
];

function isActiveSection(row) {
  return row?.isActive !== false;
}

function pickRow(rows, used, match) {
  const row = rows
    .filter((item) => !used.has(item.sectionKey) && match(item))
    .sort((left, right) => (Number(left.order) || 0) - (Number(right.order) || 0))[0];
  if (row) used.add(row.sectionKey);
  return row;
}

export function previewRows(saved) {
  const rows = (Array.isArray(saved) ? saved : []).filter((row) => row?.sectionKey && isActiveSection(row));
  const used = new Set();
  const placed = previewSlots.map((match) => pickRow(rows, used, match)).filter(Boolean);
  const landscapeIndex = placed.findIndex((row) => /landscape/i.test(`${row.sectionKey} ${row.sectionName ?? ""}`));
  const servicesIndex = placed.findIndex((row) => row.sectionKey === "services");
  const extras = rows
    .filter((row) => !used.has(row.sectionKey))
    .sort((left, right) => (Number(left.order) || 0) - (Number(right.order) || 0));
  const insertAt = landscapeIndex !== -1 ? landscapeIndex : servicesIndex === -1 ? placed.length : servicesIndex + 1;
  return [...placed.slice(0, insertAt), ...extras, ...placed.slice(insertAt)];
}

function AllPreviewDialog({ open, onOpenChange, rows }) {
  const details = useLandingSectionDetails(
    rows.map((row) => row.sectionKey),
    open,
  );
  const blocks = rows
    .map((row, index) => {
      const query = details[index];
      const record = query?.data || row;
      if (!isActiveSection(record)) return null;
      const section = resolveSection(row.sectionKey, record);
      if (!section) return null;
      return {
        key: section.key,
        name: record?.sectionName || section.name,
        pending: Boolean(query?.isLoading) && !query?.data,
        failed: Boolean(query?.isError) && !query?.data,
        section,
        form: formFromApi(section, record),
      };
    })
    .filter(Boolean);

  return (
    <Modal isOpen={open} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="w-[90vw] max-w-[90vw]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="font-serif text-2xl">All preview</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {blocks.length ? (
                <div className="m-0 flex flex-col p-0">
                  {blocks.map((block) => (
                    <section key={block.key} className="m-0 p-0">
                      {block.pending ? <p className="text-sm text-stone-500">Loading {block.name.toLowerCase()}…</p> : null}
                      {block.failed ? <p className="text-sm text-stone-500">Could not load {block.name.toLowerCase()}.</p> : null}
                      {!block.pending && !block.failed ? <AnySectionPreview section={block.section} form={block.form} /> : null}
                    </section>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-stone-500">No sections to preview yet.</p>
              )}
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
  );
}

export function AllPreview({ saved }) {
  const [open, setOpen] = useState(false);
  const rows = previewRows(saved);
  return (
    <>
      <Button variant="outline" className="rounded-full px-4" onPress={() => setOpen(true)}>
        <Eye size={15} /> All Preview
      </Button>
      <AllPreviewDialog open={open} onOpenChange={setOpen} rows={rows} />
    </>
  );
}
