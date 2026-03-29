export function createId(prefix = "tw"): string {
  const random = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID().replace(/-/g, "")
    : fallbackRandom(24);
  return `${prefix}_${random.slice(0, 12)}`;
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_");
}

export function createFieldKey(label: string, existingKeys: string[] = []): string {
  const base = slugify(label) || "field";
  let candidate = base;
  let index = 2;
  while (existingKeys.includes(candidate)) {
    candidate = `${base}_${index}`;
    index += 1;
  }
  return candidate;
}

export function fallbackRandom(length = 16): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let output = "";
  for (let index = 0; index < length; index += 1) {
    output += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return output;
}

