import { createStore } from "zustand/vanilla";
import { deepClone } from "../lib/clone";
import { createBlockDefaults, createEmptyFormSchema, createEmptyLogicRule, normalizeFormSchema } from "../domain/defaults";
import type { Block, BlockType, FormSchema, LogicRule } from "../domain/types";
import { getFormSchema, saveFormSchema } from "../persistence/forms-repository";
import { createFieldKey, createId } from "../lib/ids";

export interface EditorState {
  formId: string | null;
  schema: FormSchema | null;
  selectedBlockId: string | null;
  history: FormSchema[];
  future: FormSchema[];
  isDirty: boolean;
  actions: {
    loadForm: (formId: string) => Promise<void>;
    newForm: (title?: string) => void;
    setTitle: (title: string) => void;
    setDescription: (description: string) => void;
    selectBlock: (blockId: string | null) => void;
    insertBlock: (type: BlockType, afterBlockId?: string | null) => void;
    updateBlock: (blockId: string, patch: Partial<Block>) => void;
    duplicateBlock: (blockId: string) => void;
    deleteBlock: (blockId: string) => void;
    moveBlock: (blockId: string, targetIndex: number) => void;
    addLogicRule: () => void;
    updateLogicRule: (ruleId: string, patch: Partial<LogicRule>) => void;
    deleteLogicRule: (ruleId: string) => void;
    undo: () => void;
    redo: () => void;
    save: () => Promise<void>;
  };
}

export const editorStore = createStore<EditorState>((set, get) => ({
  formId: null,
  schema: null,
  selectedBlockId: null,
  history: [],
  future: [],
  isDirty: false,
  actions: {
    loadForm: async (formId: string) => {
      const schema = normalizeFormSchema((await getFormSchema(formId)) ?? (() => {
        const blank = createEmptyFormSchema();
        blank.id = formId;
        return blank;
      })());
      set({
        formId,
        schema: deepClone(schema),
        selectedBlockId: schema.blocks[0]?.id ?? null,
        history: [],
        future: [],
        isDirty: false
      });
    },
    newForm: (title = "Untitled Form") => {
      const schema = createEmptyFormSchema(title);
      set({
        formId: schema.id,
        schema,
        selectedBlockId: null,
        history: [],
        future: [],
        isDirty: true
      });
    },
    setTitle: (title: string) => {
      updateSchema((schema) => ({ ...schema, title }));
    },
    setDescription: (description: string) => {
      updateSchema((schema) => ({ ...schema, description }));
    },
    selectBlock: (blockId: string | null) => {
      set({ selectedBlockId: blockId });
    },
    insertBlock: (type: BlockType, afterBlockId = null) => {
      const schema = getSchemaOrThrow();
      const block = createBlockDefaults(type, getSuggestedLabel(type, schema.blocks));
      const blocks = [...schema.blocks];
      const sourceIndex = afterBlockId ? blocks.findIndex((item) => item.id === afterBlockId) : -1;
      const insertIndex = sourceIndex >= 0 ? sourceIndex + 1 : blocks.length;
      block.pageId = schema.pages[0]?.id ?? block.pageId;
      block.order = insertIndex + 1;
      blocks.splice(insertIndex, 0, block);
      renumberBlocks(blocks);
      pushSchema({ ...schema, blocks });
      set({ selectedBlockId: block.id });
    },
    updateBlock: (blockId: string, patch: Partial<Block>) => {
      const schema = getSchemaOrThrow();
      const blocks = schema.blocks.map((block) => {
        if (block.id !== blockId) {
          return block;
        }

        const nextBlock = { ...block, ...patch };
        if (Object.prototype.hasOwnProperty.call(patch, "label") && patch.label && patch.label !== block.label) {
          nextBlock.fieldKey = createFieldKey(String(patch.label), schema.blocks.filter((item) => item.id !== blockId).map((item) => item.fieldKey));
        }
        return nextBlock;
      });
      pushSchema({ ...schema, blocks });
    },
    duplicateBlock: (blockId: string) => {
      const schema = getSchemaOrThrow();
      const index = schema.blocks.findIndex((block) => block.id === blockId);
      if (index < 0) {
        return;
      }
      const duplicate = deepClone(schema.blocks[index]);
      duplicate.id = createId("block");
      duplicate.fieldKey = createFieldKey(duplicate.fieldKey, schema.blocks.map((block) => block.fieldKey));
      duplicate.order = schema.blocks[index].order + 0.5;
      const blocks = [...schema.blocks];
      blocks.splice(index + 1, 0, duplicate);
      renumberBlocks(blocks);
      pushSchema({ ...schema, blocks });
      set({ selectedBlockId: duplicate.id });
    },
    deleteBlock: (blockId: string) => {
      const schema = getSchemaOrThrow();
      const blocks = schema.blocks.filter((block) => block.id !== blockId);
      renumberBlocks(blocks);
      pushSchema({ ...schema, blocks });
      set({ selectedBlockId: blocks[0]?.id ?? null });
    },
    moveBlock: (blockId: string, targetIndex: number) => {
      const schema = getSchemaOrThrow();
      const blocks = [...schema.blocks];
      const sourceIndex = blocks.findIndex((block) => block.id === blockId);
      if (sourceIndex < 0 || targetIndex < 0 || targetIndex > blocks.length) {
        return;
      }
      const [moved] = blocks.splice(sourceIndex, 1);
      const adjustedTarget = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
      blocks.splice(adjustedTarget, 0, moved);
      renumberBlocks(blocks);
      pushSchema({ ...schema, blocks });
    },
    addLogicRule: () => {
      const schema = getSchemaOrThrow();
      pushSchema({
        ...schema,
        logic: [...schema.logic, createEmptyLogicRule()]
      });
    },
    updateLogicRule: (ruleId: string, patch: Partial<LogicRule>) => {
      const schema = getSchemaOrThrow();
      const logic = schema.logic.map((rule) => (rule.id === ruleId ? { ...rule, ...patch } : rule));
      pushSchema({ ...schema, logic });
    },
    deleteLogicRule: (ruleId: string) => {
      const schema = getSchemaOrThrow();
      pushSchema({
        ...schema,
        logic: schema.logic.filter((rule) => rule.id !== ruleId)
      });
    },
    undo: () => {
      const { history, schema } = get();
      if (!schema || history.length === 0) {
        return;
      }
      const previous = history[history.length - 1];
      set((state) => ({
        schema: deepClone(previous),
        history: state.history.slice(0, -1),
        future: schema ? [deepClone(schema), ...state.future] : state.future,
        isDirty: true
      }));
    },
    redo: () => {
      const { future, schema } = get();
      if (!schema || future.length === 0) {
        return;
      }
      const [next, ...rest] = future;
      set((state) => ({
        schema: deepClone(next),
        history: schema ? [...state.history, deepClone(schema)] : state.history,
        future: rest,
        isDirty: true
      }));
    },
    save: async () => {
      const { schema, formId } = get();
      if (!schema) {
        return;
      }
      const nextSchema = {
        ...schema,
        updatedAt: Date.now()
      };
      await saveFormSchema(nextSchema);
      set({ schema: nextSchema, isDirty: false, formId: formId ?? nextSchema.id });
    }
  }
}));

function updateSchema(updater: (schema: FormSchema) => FormSchema): void {
  const schema = getSchemaOrThrow();
  pushSchema(updater(schema));
}

function pushSchema(nextSchema: FormSchema): void {
  const current = editorStore.getState().schema;
  editorStore.setState((state) => ({
    schema: deepClone({
      ...nextSchema,
      updatedAt: Date.now()
    }),
    history: current ? [...state.history, deepClone(current)].slice(-100) : state.history,
    future: [],
    isDirty: true
  }));
}

function getSchemaOrThrow(): FormSchema {
  const schema = editorStore.getState().schema;
  if (!schema) {
    throw new Error("No active form loaded.");
  }
  return schema;
}

function renumberBlocks(blocks: Block[]): void {
  blocks.forEach((block, index) => {
    block.order = index + 1;
  });
}

function getSuggestedLabel(type: BlockType, blocks: Block[]): string {
  const baseMap: Record<BlockType, string> = {
    heading: "Heading",
    paragraph: "Paragraph",
    divider: "Divider",
    page_break: "Page break",
    image: "Image",
    video: "Video",
    spacer: "Spacer",
    short_text: "Short answer",
    long_text: "Long answer",
    email: "Email",
    phone: "Phone",
    number: "Number",
    website: "Website",
    single_choice: "Choice",
    multiple_choice: "Multiple choice",
    dropdown: "Dropdown",
    ranking: "Ranking",
    rating: "Rating",
    opinion_scale: "Scale",
    date: "Date",
    time: "Time",
    date_range: "Date range",
    file_upload: "File upload",
    signature: "Signature",
    payment: "Payment",
    matrix: "Matrix",
    calculated_field: "Calculation",
    hidden_field: "Hidden field",
    statement: "Statement",
    input_table: "Table"
  };
  const existing = blocks.filter((block) => block.type === type).length;
  return existing > 0 ? `${baseMap[type]} ${existing + 1}` : baseMap[type];
}
