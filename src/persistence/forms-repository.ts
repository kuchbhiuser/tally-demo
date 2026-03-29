import { appDb, type FormRecord } from "./db";
import type { FormListItem, FormSchema } from "../domain/types";
import { createEmptyFormSchema } from "../domain/defaults";
import { deepClone } from "../lib/clone";
import { createId } from "../lib/ids";

export async function listForms(): Promise<FormListItem[]> {
  const records = await appDb.forms.orderBy("updatedAt").reverse().toArray();
  return records.map(toFormListItem);
}

export async function getFormRecord(formId: string): Promise<FormRecord | undefined> {
  return appDb.forms.get(formId);
}

export async function getFormSchema(formId: string): Promise<FormSchema | undefined> {
  const record = await getFormRecord(formId);
  return record ? deepClone(record.schema) : undefined;
}

export async function saveFormSchema(schema: FormSchema, extra?: Partial<FormRecord>): Promise<FormRecord> {
  const now = Date.now();
  const record: FormRecord = {
    id: schema.id,
    schema: deepClone({
      ...schema,
      updatedAt: now
    }),
    starred: extra?.starred ?? false,
    archived: extra?.archived ?? false,
    trashed: extra?.trashed ?? false,
    createdAt: extra?.createdAt ?? schema.createdAt ?? now,
    updatedAt: now
  };

  await appDb.forms.put(record);
  return record;
}

export async function createBlankForm(title = "Untitled Form"): Promise<FormRecord> {
  const schema = createEmptyFormSchema(title);
  await saveFormSchema(schema);
  return (await appDb.forms.get(schema.id)) as FormRecord;
}

export async function duplicateForm(formId: string): Promise<FormRecord | undefined> {
  const existing = await getFormRecord(formId);
  if (!existing) {
    return undefined;
  }

  const now = Date.now();
  const schema = deepClone(existing.schema);
  schema.id = createId("form");
  schema.title = `Copy of ${schema.title}`;
  schema.createdAt = now;
  schema.updatedAt = now;
  schema.status = "draft";
  schema.metaStats = { totalResponses: 0 };
  schema.publishedAt = undefined;

  return saveFormSchema(schema, {
    starred: false,
    archived: false,
    trashed: false,
    createdAt: now
  });
}

export async function removeForm(formId: string): Promise<void> {
  await appDb.forms.delete(formId);
  await appDb.drafts.where("formId").equals(formId).delete();
  await appDb.localResponses.where("formId").equals(formId).delete();
  await appDb.submissionQueue.where("formId").equals(formId).delete();
  await appDb.analyticsEvents.where("formId").equals(formId).delete();
}

export async function setFormStarred(formId: string, starred: boolean): Promise<void> {
  const record = await appDb.forms.get(formId);
  if (!record) {
    return;
  }
  await appDb.forms.put({
    ...record,
    starred,
    updatedAt: Date.now()
  });
}

export async function archiveForm(formId: string, archived: boolean): Promise<void> {
  const record = await appDb.forms.get(formId);
  if (!record) {
    return;
  }
  await appDb.forms.put({
    ...record,
    archived,
    updatedAt: Date.now()
  });
}

export async function trashForm(formId: string, trashed: boolean): Promise<void> {
  const record = await appDb.forms.get(formId);
  if (!record) {
    return;
  }
  await appDb.forms.put({
    ...record,
    trashed,
    updatedAt: Date.now()
  });
}

function toFormListItem(record: FormRecord): FormListItem {
  return {
    id: record.id,
    title: record.schema.title,
    status: record.schema.status,
    updatedAt: record.updatedAt,
    createdAt: record.createdAt,
    responseCount: record.schema.metaStats.totalResponses,
    lastResponseAt: record.schema.metaStats.lastResponseAt,
    starred: record.starred
  };
}

