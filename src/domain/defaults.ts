import { createFieldKey, createId } from "../lib/ids";
import type {
  AdapterConfig,
  Block,
  BlockType,
  FormSchema,
  FormSettings,
  FormTheme,
  HiddenField,
  LogicRule,
  Page,
  TemplateDefinition,
  Variable,
  WorkspaceSettings
} from "./types";

export function createDefaultFormTheme(): FormTheme {
  return {
    mode: "light",
    fontFamily: "Space Grotesk",
    fontSize: "medium",
    colorPrimary: "#0d6b5c",
    colorBackground: "#f3ede4",
    colorText: "#1f1f1a",
    colorInputBackground: "#fff9f1",
    colorInputBorder: "#d7cab7",
    borderRadius: "large",
    layout: "classic",
    coverImagePosition: "top",
    buttonStyle: "filled",
    animationStyle: "fade"
  };
}

export function createDefaultFormSettings(): FormSettings {
  return {
    redirectAfterSubmit: false,
    showSuccessPage: true,
    successMessage: "Thanks for your response.",
    successPageTitle: "Submission received",
    requirePassword: false,
    closedFormMessage: "This form is currently closed.",
    limitResponses: false,
    closeAfterDate: false,
    allowMultipleSubmissions: true,
    saveAndContinue: true,
    showProgressBar: true,
    progressBarStyle: "percentage",
    shuffleFields: false,
    shuffleOptions: false,
    collectEmail: false,
    requireEmailVerification: false,
    sendConfirmationEmail: false,
    gdprConsent: false,
    gdprConsentText: "I agree to the terms and privacy policy.",
    enterToContinue: true
  };
}

export function createDefaultAdapterConfig(): AdapterConfig {
  return { type: "local", config: { namespace: "default" } };
}

export function createDefaultWorkspaceSettings(): WorkspaceSettings {
  const now = Date.now();
  return {
    id: "workspace_default",
    displayName: "My Workspace",
    themePreference: "light",
    defaultLayout: "classic",
    createdAt: now,
    updatedAt: now
  };
}

export function createDefaultPage(title = "Page 1", order = 1): Page {
  return {
    id: createId("page"),
    title,
    order,
    buttonLabel: "Next"
  };
}

export function createDefaultHiddenField(fieldKey: string, defaultValue = ""): HiddenField {
  return { fieldKey, defaultValue };
}

export function createEmptyLogicRule(): LogicRule {
  return {
    id: createId("rule"),
    trigger: { type: "always" },
    conditions: { operator: "AND", conditions: [] },
    action: { type: "show_field" }
  };
}

export function createDefaultVariable(name = "total_score"): Variable {
  return {
    id: createId("var"),
    name,
    type: "sum",
    fields: []
  };
}

export function createBlockDefaults<T extends BlockType>(type: T, label = "Untitled"): Block<T> {
  const pageId = createId("page");
  const fieldKey = createFieldKey(label);
  const common = {
    id: createId("block"),
    type,
    order: 1,
    pageId,
    fieldKey,
    label,
    description: "",
    placeholder: "",
    required: false,
    hidden: false,
    readOnly: false,
    validation: []
  };

  const configByType: Record<BlockType, unknown> = {
    heading: { level: 2, text: label, alignment: "left" },
    paragraph: { content: "", alignment: "left" },
    divider: { style: "line", marginTop: 16, marginBottom: 16 },
    page_break: { title: label },
    image: { src: "", alt: label, width: "large", alignment: "center", caption: "", linkUrl: "" },
    video: { src: "", autoPlay: false, showControls: true, width: "large", aspectRatio: "16:9" },
    spacer: { height: 32 },
    short_text: { inputType: "text", minLength: undefined, maxLength: undefined, prefix: "", suffix: "" },
    long_text: { rows: 4, autoGrow: true, showWordCount: false, showCharCount: false, minLength: undefined, maxLength: undefined },
    email: { validateFormat: true, blockFreeEmail: false },
    phone: { defaultCountry: "US", allowCountrySelection: true, validateFormat: true },
    number: { thousandSeparator: true, format: "decimal", min: undefined, max: undefined, step: 1, decimalPlaces: 0, prefix: "", suffix: "", currency: "USD" },
    website: { requireProtocol: true, allowedDomains: [] },
    single_choice: { options: [], otherOption: false, noneOption: false, layout: "vertical", shuffleOptions: false, imageOptions: false, buttonStyle: "radio" },
    multiple_choice: { options: [], otherOption: false, noneOption: false, layout: "vertical", shuffleOptions: false, imageOptions: false, buttonStyle: "radio" },
    dropdown: { options: [], searchable: true, placeholder: "Select an option", otherOption: false, multiSelect: false },
    ranking: { items: [], shuffleItems: false },
    rating: { scale: 5, icon: "star", startValue: 1 },
    opinion_scale: { min: 0, max: 10, step: 1, displayAs: "buttons", npsCategories: false },
    date: { format: "YYYY-MM-DD", includeTime: false, timeFormat: "24h", disablePast: false, disableFuture: false, defaultValue: "none" },
    time: { format: "24h", minuteStep: 5 },
    date_range: { format: "YYYY-MM-DD", includeTime: false, timeFormat: "24h", disablePast: false, disableFuture: false, defaultValue: "none", showNights: false },
    file_upload: { maxSizeMB: 10, maxFiles: 1, acceptedTypes: ["*/*"], showPreview: true, storageStrategy: "local" },
    signature: { backgroundColor: "#ffffff", penColor: "#111111", penWidth: 2, placeholder: "Sign here", outputFormat: "png" },
    payment: { mode: "link", currency: "USD", amount: 0, description: "", paymentLinkUrl: "", redirectUrl: "" },
    matrix: { rows: [], columns: [], type: "single_choice", requireAll: false },
    calculated_field: { formula: "", format: "number", showToRespondent: true },
    hidden_field: { defaultValue: "" },
    statement: { content: "", buttonLabel: "Continue", buttonStyle: "primary" },
    input_table: { columns: [], minRows: 1, addRowLabel: "+ Add row" }
  };

  return {
    ...common,
    config: configByType[type]
  } as Block<T>;
}

export function createEmptyFormSchema(title = "Untitled Form"): FormSchema {
  const now = Date.now();
  const page = createDefaultPage();
  return {
    id: createId("form"),
    title,
    description: "",
    createdAt: now,
    updatedAt: now,
    status: "draft",
    blocks: [],
    pages: [page],
    logic: [],
    variables: [],
    hiddenFields: [],
    settings: createDefaultFormSettings(),
    theme: createDefaultFormTheme(),
    responseAdapter: createDefaultAdapterConfig(),
    metaStats: {
      totalResponses: 0
    }
  };
}

export function normalizeFormSchema(schema: FormSchema): FormSchema {
  const seen = new Set<string>();
  return {
    ...schema,
    blocks: schema.blocks.map((block) => {
      const nextFieldKey = createFieldKey(block.fieldKey || block.label || block.type, Array.from(seen));
      seen.add(nextFieldKey);
      return {
        ...block,
        fieldKey: nextFieldKey
      };
    }),
    pages: schema.pages.length ? schema.pages : [createDefaultPage()],
    settings: {
      ...createDefaultFormSettings(),
      ...schema.settings
    },
    theme: {
      ...createDefaultFormTheme(),
      ...schema.theme
    },
    responseAdapter: schema.responseAdapter ?? createDefaultAdapterConfig(),
    metaStats: {
      ...schema.metaStats,
      totalResponses: schema.metaStats?.totalResponses ?? 0
    }
  };
}

export function createTemplateDefinition(input: Omit<TemplateDefinition, "schema"> & { schema: FormSchema }): TemplateDefinition {
  return input;
}
