export type Route =
  | { kind: "dashboard" }
  | { kind: "builder"; formId: string }
  | { kind: "form"; formId?: string }
  | { kind: "results"; formId?: string }
  | { kind: "settings" };

export function parseRoute(hash: string): Route {
  const value = hash.replace(/^#/, "") || "/";
  const [path] = value.split("?");
  const parts = path.split("/").filter(Boolean);

  if (parts.length === 0) return { kind: "dashboard" };
  if (parts[0] === "settings") return { kind: "settings" };
  if (parts[0] === "builder" && parts[1]) return { kind: "builder", formId: parts[1] };
  if (parts[0] === "form") return parts[1] ? { kind: "form", formId: parts[1] } : { kind: "form" };
  if (parts[0] === "results") return parts[1] ? { kind: "results", formId: parts[1] } : { kind: "results" };
  return { kind: "dashboard" };
}

export function toHash(path: string): string {
  return path.startsWith("#") ? path : `#${path}`;
}
