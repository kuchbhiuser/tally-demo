export type FormStatus = "draft" | "published" | "closed";

export type PageProgressStyle = "percentage" | "steps" | "bar";
export type LayoutMode = "classic" | "card" | "conversational";
export type ThemeMode = "light" | "dark" | "auto";
export type BorderRadiusScale = "none" | "small" | "medium" | "large" | "pill";
export type ButtonStyle = "filled" | "outline" | "ghost";
export type AnimationStyle = "none" | "fade" | "slide" | "pop";

export type BlockType =
  | "heading"
  | "paragraph"
  | "divider"
  | "page_break"
  | "short_text"
  | "long_text"
  | "email"
  | "phone"
  | "number"
  | "website"
  | "single_choice"
  | "multiple_choice"
  | "dropdown"
  | "ranking"
  | "rating"
  | "opinion_scale"
  | "date"
  | "time"
  | "date_range"
  | "file_upload"
  | "signature"
  | "payment"
  | "matrix"
  | "calculated_field"
  | "hidden_field"
  | "statement"
  | "input_table";

export interface ChoiceOption {
  id: string;
  label: string;
  value?: string;
  description?: string;
  imageUrl?: string;
  score?: number;
}

export interface ValidationRule {
  id: string;
  comparator:
    | "equals"
    | "not_equals"
    | "contains"
    | "not_contains"
    | "starts_with"
    | "ends_with"
    | "greater_than"
    | "less_than"
    | "greater_equal"
    | "less_equal"
    | "is_empty"
    | "is_not_empty"
    | "includes_any"
    | "includes_all"
    | "includes_none";
  value?: string | number | string[];
  message: string;
}

export interface HeadingConfig {
  level: 1 | 2 | 3;
  text: string;
  alignment: "left" | "center" | "right";
}

export interface ParagraphConfig {
  content: string;
  alignment: "left" | "center" | "right";
}

export interface DividerConfig {
  style: "line" | "dots" | "thick";
  marginTop: number;
  marginBottom: number;
}

export interface PageBreakConfig {
  title?: string;
}

export interface TextFieldConfig {
  minLength?: number;
  maxLength?: number;
}

export interface ShortTextConfig extends TextFieldConfig {
  inputType: "text" | "tel" | "url" | "search";
  prefix?: string;
  suffix?: string;
}

export interface LongTextConfig extends TextFieldConfig {
  rows: number;
  autoGrow: boolean;
  showWordCount: boolean;
  showCharCount: boolean;
}

export interface EmailConfig {
  validateFormat: boolean;
  validateDomain?: string[];
  blockFreeEmail: boolean;
}

export interface PhoneConfig {
  defaultCountry: string;
  allowCountrySelection: boolean;
  validateFormat: boolean;
}

export interface NumberConfig {
  min?: number;
  max?: number;
  step?: number;
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
  thousandSeparator: boolean;
  format: "integer" | "decimal" | "currency" | "percentage";
  currency?: string;
}

export interface WebsiteConfig {
  requireProtocol: boolean;
  allowedDomains?: string[];
}

export interface ChoiceFieldConfig {
  options: ChoiceOption[];
  otherOption: boolean;
  noneOption: boolean;
  layout: "vertical" | "horizontal" | "grid";
  gridColumns?: 2 | 3 | 4;
  shuffleOptions: boolean;
  imageOptions: boolean;
  buttonStyle: "radio" | "button" | "card";
}

export interface MultipleChoiceConfig extends ChoiceFieldConfig {
  minSelections?: number;
  maxSelections?: number;
}

export interface DropdownConfig {
  options: ChoiceOption[];
  searchable: boolean;
  placeholder: string;
  otherOption: boolean;
  multiSelect: boolean;
}

export interface RankingConfig {
  items: { id: string; label: string }[];
  shuffleItems: boolean;
}

export interface RatingConfig {
  scale: 3 | 4 | 5 | 6 | 7 | 10;
  icon: "star" | "heart" | "thumb" | "circle" | "emoji";
  startLabel?: string;
  endLabel?: string;
  startValue: 0 | 1;
}

export interface OpinionScaleConfig {
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
  step: number;
  displayAs: "buttons" | "slider";
  npsCategories: boolean;
}

export interface DateConfig {
  format: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  includeTime: boolean;
  timeFormat: "12h" | "24h";
  minDate?: string;
  maxDate?: string;
  disablePast: boolean;
  disableFuture: boolean;
  disabledDays?: number[];
  defaultValue: "none" | "today" | "custom";
  defaultCustomDate?: string;
}

export interface TimeConfig {
  format: "12h" | "24h";
  minuteStep: 1 | 5 | 10 | 15 | 30;
  minTime?: string;
  maxTime?: string;
}

export interface DateRangeConfig extends DateConfig {
  minDuration?: number;
  maxDuration?: number;
  showNights: boolean;
}

export interface FileUploadConfig {
  maxSizeMB: number;
  maxFiles: number;
  acceptedTypes: string[];
  showPreview: boolean;
  storageStrategy: "cloudinary" | "local";
}

export interface SignatureConfig {
  backgroundColor: string;
  penColor: string;
  penWidth: number;
  placeholder: string;
  outputFormat: "png" | "svg";
}

export interface MatrixConfig {
  rows: { id: string; label: string }[];
  columns: { id: string; label: string; value: string }[];
  type: "single_choice" | "multiple_choice" | "short_text" | "rating";
  ratingScale?: number;
  requireAll: boolean;
}

export interface CalculatedFieldConfig {
  formula: string;
  format: "number" | "percentage" | "currency" | "text";
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
  showToRespondent: boolean;
}

export interface HiddenFieldConfig {
  defaultValue?: string;
}

export interface StatementConfig {
  content: string;
  buttonLabel: string;
  buttonStyle: "primary" | "outline";
}

export interface InputTableConfig {
  columns: {
    id: string;
    label: string;
    type: "short_text" | "number" | "dropdown" | "date";
    options?: ChoiceOption[];
    required?: boolean;
  }[];
  minRows: number;
  maxRows?: number;
  addRowLabel: string;
}

export type BlockConfigMap = {
  heading: HeadingConfig;
  paragraph: ParagraphConfig;
  divider: DividerConfig;
  page_break: PageBreakConfig;
  short_text: ShortTextConfig;
  long_text: LongTextConfig;
  email: EmailConfig;
  phone: PhoneConfig;
  number: NumberConfig;
  website: WebsiteConfig;
  single_choice: ChoiceFieldConfig;
  multiple_choice: MultipleChoiceConfig;
  dropdown: DropdownConfig;
  ranking: RankingConfig;
  rating: RatingConfig;
  opinion_scale: OpinionScaleConfig;
  date: DateConfig;
  time: TimeConfig;
  date_range: DateRangeConfig;
  file_upload: FileUploadConfig;
  signature: SignatureConfig;
  payment: {
    mode: "link" | "elements";
    amount?: number;
    currency: string;
    description?: string;
    redirectUrl?: string;
    paymentLinkUrl?: string;
  };
  matrix: MatrixConfig;
  calculated_field: CalculatedFieldConfig;
  hidden_field: HiddenFieldConfig;
  statement: StatementConfig;
  input_table: InputTableConfig;
};

export type BlockConfig = BlockConfigMap[BlockType];

export interface Block<TType extends BlockType = BlockType> {
  id: string;
  type: TType;
  order: number;
  pageId: string;
  fieldKey: string;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  hidden: boolean;
  readOnly: boolean;
  config: BlockConfigMap[TType];
  validation: ValidationRule[];
  style?: Record<string, string | number>;
}

export interface Page {
  id: string;
  title?: string;
  order: number;
  buttonLabel: string;
}

export interface LogicTrigger {
  type: "field_answer" | "always" | "score_threshold";
  fieldId?: string;
}

export interface LogicCondition {
  fieldId: string;
  comparator: ValidationRule["comparator"];
  value: string | number | string[];
}

export interface LogicConditionGroup {
  operator: "AND" | "OR";
  conditions: LogicCondition[];
}

export type LogicActionType =
  | "jump_to_page"
  | "jump_to_field"
  | "show_field"
  | "hide_field"
  | "require_field"
  | "unrequire_field"
  | "close_form"
  | "submit_form";

export interface LogicAction {
  type: LogicActionType;
  target?: string;
  message?: string;
}

export interface LogicRule {
  id: string;
  trigger: LogicTrigger;
  conditions: LogicConditionGroup;
  action: LogicAction;
}

export interface Variable {
  id: string;
  name: string;
  type: "sum" | "formula";
  formula?: string;
  fields?: string[];
}

export interface HiddenField {
  fieldKey: string;
  defaultValue?: string;
}

export interface FormSettings {
  redirectAfterSubmit: boolean;
  redirectUrl?: string;
  showSuccessPage: boolean;
  successMessage: string;
  successPageTitle: string;
  requirePassword: boolean;
  password?: string;
  closedFormMessage: string;
  limitResponses: boolean;
  maxResponses?: number;
  closeAfterDate: boolean;
  closeDate?: string;
  allowMultipleSubmissions: boolean;
  saveAndContinue: boolean;
  showProgressBar: boolean;
  progressBarStyle: PageProgressStyle;
  shuffleFields: boolean;
  shuffleOptions: boolean;
  collectEmail: boolean;
  requireEmailVerification: boolean;
  sendConfirmationEmail: boolean;
  confirmationEmailSubject?: string;
  confirmationEmailBody?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: string;
  gdprConsent: boolean;
  gdprConsentText: string;
  scheduledOpenAt?: string;
  scheduledCloseAt?: string;
  enterToContinue: boolean;
}

export interface FormTheme {
  mode: ThemeMode;
  fontFamily: string;
  fontSize: "small" | "medium" | "large";
  colorPrimary: string;
  colorBackground: string;
  colorText: string;
  colorInputBackground: string;
  colorInputBorder: string;
  borderRadius: BorderRadiusScale;
  layout: LayoutMode;
  coverImage?: string;
  coverImagePosition: "top" | "left" | "background";
  logo?: string;
  buttonStyle: ButtonStyle;
  animationStyle: AnimationStyle;
  customCSS?: string;
}

export interface ResponseFieldAnswer {
  fieldKey: string;
  value: string | number | string[] | Record<string, unknown> | null;
  updatedAt: number;
}

export interface ResponseRecord {
  id: string;
  formId: string;
  submittedAt: number;
  completionTime?: number;
  isPartial: boolean;
  pageReached?: number;
  ipCountry?: string;
  userAgent?: string;
  answers: Record<string, ResponseFieldAnswer>;
  hiddenFields: Record<string, string>;
  score?: number;
  variables: Record<string, string | number>;
}

export interface SubmitResult {
  success: boolean;
  responseId?: string;
  message?: string;
}

export interface ResponseAdapter {
  submit(formId: string, response: ResponseRecord): Promise<SubmitResult>;
  fetchResponses(formId: string): Promise<ResponseRecord[]>;
  isConfigured(): boolean;
}

export interface AdapterConfig {
  type: "local";
  config?: {
    namespace?: string;
  };
}

export interface FormMetaStats {
  totalResponses: number;
  lastResponseAt?: number;
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
  status: FormStatus;
  blocks: Block[];
  pages: Page[];
  logic: LogicRule[];
  variables: Variable[];
  hiddenFields: HiddenField[];
  settings: FormSettings;
  theme: FormTheme;
  responseAdapter: AdapterConfig;
  metaStats: FormMetaStats;
}

export interface WorkspaceSettings {
  id: string;
  activeFormId?: string;
  displayName: string;
  themePreference: ThemeMode;
  defaultLayout: LayoutMode;
  createdAt: number;
  updatedAt: number;
}

export interface FormListItem {
  id: string;
  title: string;
  status: FormStatus;
  updatedAt: number;
  createdAt: number;
  responseCount: number;
  lastResponseAt?: number;
  starred: boolean;
}

export interface TemplateDefinition {
  id: string;
  title: string;
  description: string;
  category: string;
  schema: FormSchema;
}

export interface EncodedSchemaPayload {
  version: 1;
  mode: "json" | "gzip";
  data: string;
}

export interface SchemaSourceResult {
  schema: FormSchema;
  source: "local" | "encoded" | "remote";
}

