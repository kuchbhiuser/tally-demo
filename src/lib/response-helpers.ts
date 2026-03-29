import type { Block, FormSchema, ResponseFieldAnswer, ResponseRecord } from "../domain/types";

export function getVisiblePages(schema: FormSchema): Array<{ id: string; title: string; order: number; buttonLabel: string; blocks: Block[] }> {
  return schema.pages
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((page) => ({
      ...page,
      title: page.title || `Page ${page.order}`,
      blocks: schema.blocks
        .filter((block) => block.pageId === page.id)
        .slice()
        .sort((left, right) => left.order - right.order)
    }));
}

export function getBlockLabelMap(schema?: FormSchema | null): Record<string, Block> {
  const map: Record<string, Block> = {};
  schema?.blocks.forEach((block) => {
    map[block.fieldKey] = block;
  });
  return map;
}

export function formatAnswerValue(answer?: ResponseFieldAnswer | null): string {
  if (!answer) {
    return "—";
  }

  const value = answer.value;
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "object") {
    if ("fileName" in value && typeof value.fileName === "string") {
      return value.fileName;
    }
    if ("paymentId" in value && typeof value.paymentId === "string") {
      const amount = "amount" in value ? value.amount : undefined;
      const currency = "currency" in value ? value.currency : undefined;
      return [currency, amount].filter(Boolean).join(" ") || value.paymentId;
    }
    if ("from" in value || "to" in value) {
      const from = typeof value.from === "string" ? value.from : "—";
      const to = typeof value.to === "string" ? value.to : "—";
      return `${from} → ${to}`;
    }
    if ("signatureDataUrl" in value) {
      return "Signature captured";
    }
    return JSON.stringify(value);
  }
  return String(value);
}

export function buildCsv(rows: ResponseRecord[], schema?: FormSchema | null): string {
  const columns = [
    "submittedAt",
    "completionTime",
    "score",
    ...(schema?.blocks ?? []).map((block) => block.fieldKey),
    ...Object.keys(rows[0]?.hiddenFields ?? {}).map((key) => `hidden_${key}`)
  ];
  const header = columns.join(",");
  const blockMap = getBlockLabelMap(schema);

  const body = rows.map((row) => {
    const values = [
      quoteCsv(new Date(row.submittedAt).toISOString()),
      quoteCsv(row.completionTime ? String(Math.round(row.completionTime / 1000)) : ""),
      quoteCsv(row.score ?? 0)
    ];

    for (const key of Object.keys(blockMap)) {
      values.push(quoteCsv(formatAnswerValue(row.answers[key])));
    }

    for (const key of Object.keys(row.hiddenFields)) {
      values.push(quoteCsv(row.hiddenFields[key] ?? ""));
    }

    return values.join(",");
  });

  return [header, ...body].join("\n");
}

export function downloadTextFile(filename: string, content: string, mime = "text/plain;charset=utf-8"): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function quoteCsv(value: string | number): string {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}
