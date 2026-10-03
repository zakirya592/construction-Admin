export function money(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}
export function moneyExact(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);
}
export function prettyDate(iso) {
    const [year, month, day] = iso.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(year, (month ?? 1) - 1, day ?? 1));
}
export function labelize(value) {
    return value
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}
export function matchesQuery(query, values) {
    const needle = query.trim().toLowerCase();
    if (!needle)
        return true;
    return values.some((value) => String(value ?? "").toLowerCase().includes(needle));
}
export function errorMessage(error) {
    if (typeof error === "object" && error && "message" in error && typeof error.message === "string") {
        const response = "response" in error ? error.response : undefined;
        if (typeof response === "object" && response && "data" in response) {
            const data = response.data;
            if (typeof data === "object" && data && "message" in data && typeof data.message === "string") {
                return data.message;
            }
        }
        return error.message;
    }
    return "Something went wrong in the site office.";
}
