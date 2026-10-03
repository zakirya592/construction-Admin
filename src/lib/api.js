import axios, { AxiosError } from "axios";
import { seedDatabase } from "@/lib/seed";
const DB_KEY = "northline-db-v1";
export const TOKEN_KEY = "northline-token";
export const SESSION_KEY = "northline-session";
const DEMO_EMAIL = "admin@northline.build";
const DEMO_PASSWORD = "buildadmin";
class HttpError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
function readDb() {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
        const seeded = seedDatabase();
        localStorage.setItem(DB_KEY, JSON.stringify(seeded));
        return seeded;
    }
    return JSON.parse(raw);
}
function writeDb(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
}
export function resetOfficeData() {
    localStorage.removeItem(DB_KEY);
    readDb();
}
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function readBody(config) {
    if (!config.data)
        return {};
    if (typeof config.data === "string")
        return JSON.parse(config.data);
    return config.data;
}
function authHeader(config) {
    const headers = config.headers;
    const value = headers?.Authorization ?? headers?.authorization;
    return typeof value === "string" ? value : "";
}
function requireUser(config) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || authHeader(config) !== `Bearer ${token}`) {
        throw new HttpError(401, "Sign in to open the site office.");
    }
}
const collections = ["projects", "crew", "equipment", "materials", "clients", "invoices", "logs"];
function handleCollection(name, method, id, payload) {
    const data = readDb();
    const list = data[name];
    if (method === "get" && !id)
        return list;
    if (method === "get" && id) {
        const found = list.find((item) => item.id === id);
        if (!found)
            throw new HttpError(404, "Record not found.");
        return found;
    }
    if (method === "post") {
        validate(name, payload);
        const item = { ...payload, id: crypto.randomUUID() };
        list.unshift(item);
        writeDb(data);
        return item;
    }
    if (method === "patch" && id) {
        validate(name, payload);
        const index = list.findIndex((item) => item.id === id);
        if (index < 0)
            throw new HttpError(404, "Record not found.");
        list[index] = { ...list[index], ...payload, id };
        writeDb(data);
        return list[index];
    }
    if (method === "delete" && id) {
        const next = list.filter((item) => item.id !== id);
        if (next.length === list.length)
            throw new HttpError(404, "Record not found.");
        data[name] = next;
        writeDb(data);
        return { ok: true };
    }
    throw new HttpError(404, "That route is not on the board.");
}
function validate(name, payload) {
    const required = {
        projects: "name",
        crew: "name",
        equipment: "name",
        materials: "name",
        clients: "company",
        invoices: "number",
        logs: "summary",
    };
    const field = required[name];
    if (field && !String(payload[field] ?? "").trim()) {
        throw new HttpError(400, "Fill in the required fields before saving.");
    }
    if (name === "projects" && payload.progress != null) {
        const progress = Number(payload.progress);
        if (Number.isNaN(progress) || progress < 0 || progress > 100) {
            throw new HttpError(400, "Progress has to sit between 0 and 100.");
        }
    }
}
function route(config) {
    const path = axios.getUri(config).replace(/^\/api/, "").split("?")[0] ?? "/";
    const method = (config.method ?? "get").toLowerCase();
    const payload = readBody(config);
    if (method === "post" && path === "/auth/login") {
        const email = String(payload.email ?? "").trim().toLowerCase();
        const password = String(payload.password ?? "");
        if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
            throw new HttpError(401, "Those credentials do not match the site office.");
        }
        return {
            token: crypto.randomUUID(),
            user: {
                name: "Maya Chen",
                email: DEMO_EMAIL,
                role: "Operations Director",
            },
        };
    }
    requireUser(config);
    const match = path.match(/^\/(projects|crew|equipment|materials|clients|invoices|logs)(?:\/([^/]+))?$/);
    if (!match)
        throw new HttpError(404, "That route is not on the board.");
    const name = match[1];
    if (!collections.includes(name))
        throw new HttpError(404, "That route is not on the board.");
    return handleCollection(name, method, match[2], payload);
}
export const api = axios.create({
    baseURL: "/api",
    headers: { "Content-Type": "application/json" },
});
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token)
        config.headers.Authorization = `Bearer ${token}`;
    return config;
});
api.defaults.adapter = async (config) => {
    await delay(220);
    try {
        return {
            data: route(config),
            status: 200,
            statusText: "OK",
            headers: {},
            config,
        };
    }
    catch (error) {
        const status = error instanceof HttpError ? error.status : 500;
        const message = error instanceof Error ? error.message : "Request failed";
        if (status === 401 && !axios.getUri(config).endsWith("/auth/login")) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(SESSION_KEY);
            window.dispatchEvent(new Event("northline-unauthorized"));
        }
        throw new AxiosError(message, String(status), config, null, {
            data: { message },
            status,
            statusText: "Error",
            headers: {},
            config,
        });
    }
};
