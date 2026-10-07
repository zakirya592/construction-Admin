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

function itemIsEmpty(section, item) {
  const hasText = (section.itemFields ?? []).some((field) => {
    if (field.type === "file") return false;
    const text = String(item[field.key] ?? "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .trim();
    return Boolean(text);
  });
  const hasFile = item.imageFile instanceof File && item.imageFile.size > 0;
  return !hasText && !hasFile && !item.imageUrl;
}

function hasNewFile(section, form) {
  if (form.file instanceof File && form.file.size > 0) return true;
  return (form.items ?? []).some((item) => item.imageFile instanceof File && item.imageFile.size > 0);
}

function itemPayload(section, item) {
  const next = {};
  for (const field of section.itemFields ?? []) {
    if (field.type === "file") next[field.key] = item.imageUrl || "";
    else next[field.key] = item[field.key] ?? "";
  }
  return next;
}

function jsonBody(section, form) {
  const payload = {
    sectionKey: section.key,
    sectionName: (form.sectionName || section.name || "").trim(),
    order: Number(form.order ?? section.order) || 0,
  };
  for (const key of section.scalars ?? []) payload[key] = form[key] ?? "";
  if (section.button) {
    payload.button = { text: form.buttonText ?? "", link: form.buttonLink ?? "" };
  }
  if (section.settings?.length || section.file?.key === "logo") {
    payload.settings = {};
    for (const field of section.settings ?? []) {
      payload.settings[field.key] = form.settings?.[field.key] ?? "";
    }
    if (section.file?.key === "logo") payload.settings.logo = form.fileUrl || payload.settings.logo || "";
  }
  if (section.itemFields?.length) {
    const items = (form.items ?? []).filter((item) => !itemIsEmpty(section, item)).map((item) => itemPayload(section, item));
    if (items.length || form.raw) payload.items = items;
  }
  return payload;
}

function sectionBody(section, form) {
  if (hasNewFile(section, form)) return appendForm(section, form);
  return jsonBody(section, form);
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

export { appendForm, blankItem, emptyForm, formFromApi, itemIsEmpty, sectionBody };
