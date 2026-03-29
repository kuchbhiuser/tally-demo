import { createStore } from "zustand/vanilla";
import type { FormListItem, WorkspaceSettings } from "../domain/types";
import { createBlankForm, duplicateForm as duplicateFormRecord, listForms, removeForm, setFormStarred } from "../persistence/forms-repository";
import { getWorkspaceSettings, saveWorkspaceSettings } from "../persistence/workspace-repository";

export interface WorkspaceState {
  isHydrated: boolean;
  forms: FormListItem[];
  settings: WorkspaceSettings | null;
  activeFormId: string | null;
  searchQuery: string;
  viewMode: "grid" | "list";
  actions: {
    hydrate: () => Promise<void>;
    refreshForms: () => Promise<void>;
    createForm: (title?: string) => Promise<string>;
    duplicateForm: (formId: string) => Promise<string | null>;
    deleteForm: (formId: string) => Promise<void>;
    toggleStar: (formId: string) => Promise<void>;
    setActiveFormId: (formId: string | null) => void;
    setSearchQuery: (query: string) => void;
    setViewMode: (mode: "grid" | "list") => void;
    updateSettings: (settings: WorkspaceSettings) => Promise<void>;
  };
}

export const workspaceStore = createStore<WorkspaceState>((set, get) => ({
  isHydrated: false,
  forms: [],
  settings: null,
  activeFormId: null,
  searchQuery: "",
  viewMode: "grid",
  actions: {
    hydrate: async () => {
      const [forms, settings] = await Promise.all([listForms(), getWorkspaceSettings()]);
      set({
        isHydrated: true,
        forms,
        settings,
        activeFormId: settings.activeFormId ?? forms[0]?.id ?? null
      });
    },
    refreshForms: async () => {
      set({ forms: await listForms() });
    },
    createForm: async (title = "Untitled Form") => {
      const record = await createBlankForm(title);
      await get().actions.refreshForms();
      set({ activeFormId: record.id });
      return record.id;
    },
    duplicateForm: async (formId: string) => {
      const record = await duplicateFormRecord(formId);
      await get().actions.refreshForms();
      return record?.id ?? null;
    },
    deleteForm: async (formId: string) => {
      await removeForm(formId);
      await get().actions.refreshForms();
      if (get().activeFormId === formId) {
        set({ activeFormId: get().forms[0]?.id ?? null });
      }
    },
    toggleStar: async (formId: string) => {
      const form = get().forms.find((item) => item.id === formId);
      if (!form) {
        return;
      }
      await setFormStarred(formId, !form.starred);
      await get().actions.refreshForms();
    },
    setActiveFormId: (formId: string | null) => {
      set({ activeFormId: formId });
    },
    setSearchQuery: (query: string) => {
      set({ searchQuery: query });
    },
    setViewMode: (mode: "grid" | "list") => {
      set({ viewMode: mode });
    },
    updateSettings: async (settings: WorkspaceSettings) => {
      const saved = await saveWorkspaceSettings(settings);
      set({ settings: saved });
    }
  }
}));
