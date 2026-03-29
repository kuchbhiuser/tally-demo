import { TEMPLATE_LIBRARY } from "../domain/templates";
import { createId } from "../lib/ids";
import { appDb } from "./db";

export async function seedTemplateLibrary(): Promise<number> {
  const now = Date.now();
  const records = TEMPLATE_LIBRARY.map((template) => ({
    id: createId("seed"),
    templateId: template.id,
    title: template.title,
    schema: template.schema,
    createdAt: now
  }));

  await appDb.templateSeeds.bulkPut(records);
  return records.length;
}

export async function clearSeedTemplates(): Promise<void> {
  await appDb.templateSeeds.clear();
}

