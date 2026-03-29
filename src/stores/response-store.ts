import { createStore } from "zustand/vanilla";
import type { ResponseRecord } from "../domain/types";
import { LocalStorageAdapter } from "../lib/local-adapter";
import { getFormRecord, saveFormSchema } from "../persistence/forms-repository";
import { clearLocalResponses, deleteLocalResponse, listLocalResponses, saveLocalResponse } from "../persistence/responses-repository";

const defaultAdapter = new LocalStorageAdapter("default");

export interface ResponseState {
  formId: string | null;
  responses: ResponseRecord[];
  selectedResponseId: string | null;
  isHydrated: boolean;
  actions: {
    hydrate: (formId: string) => Promise<void>;
    submit: (response: ResponseRecord) => Promise<void>;
    deleteResponse: (responseId: string) => Promise<void>;
    clearResponses: () => Promise<void>;
    selectResponse: (responseId: string | null) => void;
    refresh: () => Promise<void>;
  };
}

export const responseStore = createStore<ResponseState>((set, get) => ({
  formId: null,
  responses: [],
  selectedResponseId: null,
  isHydrated: false,
  actions: {
    hydrate: async (formId: string) => {
      const localResponses = await listLocalResponses(formId);
      const responses = localResponses.length ? localResponses : await defaultAdapter.fetchResponses(formId);
      set({
        formId,
        responses,
        selectedResponseId: responses[0]?.id ?? null,
        isHydrated: true
      });
    },
    submit: async (response: ResponseRecord) => {
      const { formId } = get();
      if (!formId) {
        throw new Error("No active form selected.");
      }
      const result = await defaultAdapter.submit(formId, response);
      const nextRecord = {
        ...response,
        id: result.responseId ?? response.id,
        formId
      };
      await saveLocalResponse(nextRecord);
      const responses = await listLocalResponses(formId);
      await syncFormResponseStats(formId, responses);
      set({
        responses,
        selectedResponseId: responses[0]?.id ?? null
      });
    },
    deleteResponse: async (responseId: string) => {
      const { formId } = get();
      if (formId) {
        await defaultAdapter.deleteResponse(formId, responseId);
        await deleteLocalResponse(responseId);
        const responses = await listLocalResponses(formId);
        await syncFormResponseStats(formId, responses);
        set({
          responses,
          selectedResponseId: responses[0]?.id ?? null
        });
      }
    },
    clearResponses: async () => {
      const { formId } = get();
      if (!formId) {
        return;
      }
      defaultAdapter.clear(formId);
      await clearLocalResponses(formId);
      await syncFormResponseStats(formId, []);
      set({ responses: [], selectedResponseId: null });
    },
    selectResponse: (responseId: string | null) => {
      set({ selectedResponseId: responseId });
    },
    refresh: async () => {
      const { formId } = get();
      if (!formId) {
        return;
      }
      const localResponses = await listLocalResponses(formId);
      const responses = localResponses.length ? localResponses : await defaultAdapter.fetchResponses(formId);
      set({
        responses,
        selectedResponseId: responses[0]?.id ?? null
      });
    }
  }
}));

async function syncFormResponseStats(formId: string, responses: ResponseRecord[]): Promise<void> {
  const formRecord = await getFormRecord(formId);
  if (!formRecord) {
    return;
  }

  await saveFormSchema({
    ...formRecord.schema,
    metaStats: {
      totalResponses: responses.length,
      lastResponseAt: responses[0]?.submittedAt
    }
  }, formRecord);
}
