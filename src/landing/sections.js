export const landingSections = [
  {
    key: "header",
    name: "Header",
    order: 0,
    path: "/header",
    button: true,
    settings: [
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
    ],
    file: { key: "logo", label: "Logo" },
    itemFields: [
      { key: "label", label: "Label" },
      { key: "link", label: "Link" },
    ],
  },
  {
    key: "hero",
    name: "Hero",
    order: 1,
    path: "/hero",
    scalars: ["title", "subtitle", "description"],
    button: true,
    file: { key: "image", label: "Image" },
  },
  {
    key: "about",
    name: "About",
    order: 2,
    path: "/about",
    scalars: ["title", "subtitle", "description"],
    button: true,
    file: { key: "image", label: "Image" },
    itemFields: [
      { key: "title", label: "Title" },
      { key: "value", label: "Value" },
      { key: "description", label: "Description", type: "area" },
    ],
  },
  {
    key: "services",
    name: "Services",
    order: 3,
    path: "/services",
    scalars: ["title", "description"],
    itemFields: [
      { key: "number", label: "Number" },
      { key: "title", label: "Title" },
      { key: "description", label: "Description", type: "area" },
      { key: "image", label: "Image", type: "file" },
    ],
  },
  {
    key: "projects",
    name: "Projects",
    order: 4,
    path: "/projects",
    scalars: ["title", "description"],
    itemFields: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "description", label: "Description", type: "area" },
      { key: "link", label: "Link" },
      { key: "image", label: "Image", type: "file" },
    ],
  },
  {
    key: "why-us",
    name: "Why Us",
    order: 5,
    path: "/why-us",
    scalars: ["title", "description"],
    itemFields: [
      { key: "icon", label: "Icon" },
      { key: "title", label: "Title" },
      { key: "description", label: "Description", type: "area" },
    ],
  },
  {
    key: "process",
    name: "Process",
    order: 6,
    path: "/process",
    scalars: ["title", "description"],
    itemFields: [
      { key: "number", label: "Number" },
      { key: "title", label: "Title" },
      { key: "description", label: "Description", type: "area" },
    ],
  },
  {
    key: "testimonials",
    name: "Testimonials",
    order: 7,
    path: "/testimonials",
    scalars: ["title", "description"],
    itemFields: [
      { key: "name", label: "Name" },
      { key: "position", label: "Position" },
      { key: "company", label: "Company" },
      { key: "message", label: "Message", type: "area" },
      { key: "image", label: "Image", type: "file" },
    ],
  },
  {
    key: "cta",
    name: "CTA",
    order: 8,
    path: "/cta",
    scalars: ["title", "subtitle", "description"],
    button: true,
    file: { key: "image", label: "Image" },
  },
  {
    key: "contact",
    name: "Contact",
    order: 9,
    path: "/contact",
    scalars: ["title", "description"],
    settings: [
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "address", label: "Address" },
      { key: "hours", label: "Hours" },
      { key: "mapUrl", label: "Map URL" },
    ],
    itemFields: [
      { key: "label", label: "Label" },
      { key: "value", label: "Value" },
      { key: "type", label: "Type" },
    ],
  },
  {
    key: "footer",
    name: "Footer",
    order: 10,
    path: "/footer",
    scalars: ["description"],
    settings: [{ key: "copyright", label: "Copyright" }],
    file: { key: "logo", label: "Logo" },
    itemFields: [
      { key: "group", label: "Group" },
      { key: "label", label: "Label" },
      { key: "link", label: "Link" },
    ],
  },
];

export const RESERVED_SECTION_KEYS = new Set(["sections", "new", "config", "reorder"]);

export function isSectionSlug(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 40 &&
    /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value) &&
    !RESERVED_SECTION_KEYS.has(value)
  );
}

export function sectionSlug(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

export function genericSection(sectionKey, name, order = 0) {
  return {
    key: sectionKey,
    name: name || sectionKey,
    order,
    path: `/${sectionKey}`,
    custom: true,
    scalars: ["title", "subtitle", "description"],
    button: true,
    file: { key: "image", label: "Image" },
    itemFields: [
      { key: "title", label: "Title" },
      { key: "description", label: "Description", type: "area" },
    ],
  };
}

export function findSection(sectionKey) {
  return landingSections.find((section) => section.key === sectionKey) ?? null;
}

export function resolveSection(sectionKey, record) {
  const known = findSection(sectionKey);
  if (known) return known;
  if (!isSectionSlug(sectionKey)) return null;
  return genericSection(sectionKey, record?.sectionName, record?.order ?? 0);
}
