import type { EncodedSchemaPayload, FormSchema, SchemaSourceResult } from "../domain/types";
import { deepClone } from "./clone";

export async function encodeSchemaToUrlPayload(schema: FormSchema): Promise<string> {
  const cleaned = deepClone(schema);
  const json = JSON.stringify(cleaned);

  if (typeof CompressionStream === "function") {
    const compressed = await compressString(json);
    return wrapPayload({
      version: 1,
      mode: "gzip",
      data: bytesToBase64Url(compressed)
    });
  }

  return wrapPayload({
    version: 1,
    mode: "json",
    data: bytesToBase64Url(new TextEncoder().encode(json))
  });
}

export async function decodeSchemaFromUrlPayload(payload: string): Promise<FormSchema> {
  const parsed = unwrapPayload(payload);
  const bytes = base64UrlToBytes(parsed.data);

  if (parsed.mode === "gzip") {
    const decompressed = await decompressBytes(bytes);
    return JSON.parse(new TextDecoder().decode(decompressed)) as FormSchema;
  }

  return JSON.parse(new TextDecoder().decode(bytes)) as FormSchema;
}

export async function buildShareUrl(baseUrl: string, schema: FormSchema): Promise<string> {
  const encoded = await encodeSchemaToUrlPayload(schema);
  const trimmedBase = baseUrl.replace(/\/$/, "");
  return `${trimmedBase}/#/form?s=${encodeURIComponent(encoded)}`;
}

export async function resolveSchemaSourceFromUrl(url: string): Promise<SchemaSourceResult | null> {
  const parsedUrl = new URL(url);
  const payload = parsedUrl.searchParams.get("s") ?? getPayloadFromHash(parsedUrl.hash);
  if (!payload) {
    return null;
  }

  const schema = await decodeSchemaFromUrlPayload(payload);
  return { schema, source: "encoded" };
}

function wrapPayload(payload: EncodedSchemaPayload): string {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
}

function unwrapPayload(payload: string): EncodedSchemaPayload {
  const json = new TextDecoder().decode(base64UrlToBytes(payload));
  return JSON.parse(json) as EncodedSchemaPayload;
}

function getPayloadFromHash(hash: string): string | null {
  if (!hash.includes("?")) {
    return null;
  }

  const query = hash.slice(hash.indexOf("?") + 1);
  return new URLSearchParams(query).get("s");
}

async function compressString(value: string): Promise<Uint8Array> {
  const stream = new Blob([value]).stream().pipeThrough(new CompressionStream("gzip"));
  const response = new Response(stream);
  return new Uint8Array(await response.arrayBuffer());
}

async function decompressBytes(value: Uint8Array): Promise<Uint8Array> {
  const copy = new Uint8Array(value.byteLength);
  copy.set(value);
  const stream = new Blob([copy.buffer]).stream().pipeThrough(new DecompressionStream("gzip"));
  const response = new Response(stream);
  return new Uint8Array(await response.arrayBuffer());
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}
