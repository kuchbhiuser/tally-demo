import { appDb } from "./db";
import { createDefaultWorkspaceSettings } from "../domain/defaults";
import type { WorkspaceSettings } from "../domain/types";

export async function getWorkspaceSettings(): Promise<WorkspaceSettings> {
  const record = await appDb.workspaceSettings.get("workspace_default");
  if (record) {
    return record;
  }

  const defaults = createDefaultWorkspaceSettings();
  await appDb.workspaceSettings.put(defaults);
  return defaults;
}

export async function saveWorkspaceSettings(settings: WorkspaceSettings): Promise<WorkspaceSettings> {
  const next = {
    ...settings,
    updatedAt: Date.now()
  };
  await appDb.workspaceSettings.put(next);
  return next;
}

