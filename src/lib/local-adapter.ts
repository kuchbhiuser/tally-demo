import type { ResponseAdapter, ResponseRecord, SubmitResult } from "../domain/types";
import { createId } from "./ids";

const RESPONSE_PREFIX = "tallyweb:responses:";

export class LocalStorageAdapter implements ResponseAdapter {
  constructor(private readonly namespace = "default") {}

  isConfigured(): boolean {
    return true;
  }

  async submit(formId: string, response: ResponseRecord): Promise<SubmitResult> {
    const records = await this.fetchResponses(formId);
    const nextRecord = {
      ...response,
      id: response.id || createId("response"),
      formId
    };
    const filtered = records.filter((item) => item.id !== nextRecord.id);
    filtered.unshift(nextRecord);
    localStorage.setItem(this.storageKey(formId), JSON.stringify(filtered));
    return { success: true, responseId: nextRecord.id };
  }

  async fetchResponses(formId: string): Promise<ResponseRecord[]> {
    const raw = localStorage.getItem(this.storageKey(formId));
    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as ResponseRecord[];
    } catch {
      return [];
    }
  }

  async deleteResponse(formId: string, responseId: string): Promise<void> {
    const records = await this.fetchResponses(formId);
    const filtered = records.filter((record) => record.id !== responseId);
    localStorage.setItem(this.storageKey(formId), JSON.stringify(filtered));
  }

  clear(formId: string): void {
    localStorage.removeItem(this.storageKey(formId));
  }

  private storageKey(formId: string): string {
    return `${RESPONSE_PREFIX}${this.namespace}:${formId}`;
  }
}
