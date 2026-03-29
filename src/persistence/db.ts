import Dexie, { type Table } from "dexie";
import type { FormSchema, ResponseRecord, WorkspaceSettings } from "../domain/types";

export interface FormRecord {
  id: string;
  schema: FormSchema;
  starred: boolean;
  archived: boolean;
  trashed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DraftRecord {
  id: string;
  formId: string;
  data: FormSchema;
  updatedAt: number;
}

export interface AnalyticsEventRecord {
  id: string;
  formId: string;
  type: "form_view" | "form_start" | "page_advance" | "form_abandon" | "form_submit";
  payload: Record<string, unknown>;
  createdAt: number;
}

export interface SubmissionQueueRecord {
  id: string;
  formId: string;
  payload: ResponseRecord;
  status: "queued" | "sent" | "failed";
  attempts: number;
  createdAt: number;
  updatedAt: number;
  lastError?: string;
}

export interface WorkspaceSettingsRecord extends WorkspaceSettings {}

export interface TemplateSeedRecord {
  id: string;
  templateId: string;
  title: string;
  schema: FormSchema;
  createdAt: number;
}

export class TallyWebDatabase extends Dexie {
  forms!: Table<FormRecord, string>;
  drafts!: Table<DraftRecord, string>;
  workspaceSettings!: Table<WorkspaceSettingsRecord, string>;
  analyticsEvents!: Table<AnalyticsEventRecord, string>;
  submissionQueue!: Table<SubmissionQueueRecord, string>;
  localResponses!: Table<ResponseRecord, string>;
  templateSeeds!: Table<TemplateSeedRecord, string>;

  constructor() {
    super("tallyweb");

    this.version(1).stores({
      forms: "&id, updatedAt, createdAt, starred, archived, trashed",
      drafts: "&id, formId, updatedAt",
      workspaceSettings: "&id, activeFormId, updatedAt",
      analyticsEvents: "&id, formId, type, createdAt",
      submissionQueue: "&id, formId, status, createdAt, updatedAt",
      localResponses: "&id, formId, submittedAt, isPartial",
      templateSeeds: "&id, templateId, createdAt"
    });
  }
}

export const appDb = new TallyWebDatabase();

