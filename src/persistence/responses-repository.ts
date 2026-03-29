import { appDb } from "./db";
import type { ResponseRecord } from "../domain/types";

export async function listLocalResponses(formId: string): Promise<ResponseRecord[]> {
  const rows = await appDb.localResponses.where("formId").equals(formId).sortBy("submittedAt");
  return rows.reverse();
}

export async function saveLocalResponse(response: ResponseRecord): Promise<void> {
  await appDb.localResponses.put(response);
}

export async function deleteLocalResponse(responseId: string): Promise<void> {
  await appDb.localResponses.delete(responseId);
}

export async function clearLocalResponses(formId: string): Promise<void> {
  await appDb.localResponses.where("formId").equals(formId).delete();
}
