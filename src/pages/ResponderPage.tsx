import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { EmptyState } from "../components/EmptyState";
import { SectionCard } from "../components/SectionCard";
import { editorStore } from "../stores/editor-store";
import { responseStore } from "../stores/response-store";
import { useStore } from "../lib/use-store";
import type { Block, FormSchema, ResponseFieldAnswer, ResponseRecord } from "../domain/types";
import { getVisiblePages } from "../lib/response-helpers";
import { decodeSchemaFromUrlPayload } from "../lib/url-schema";
import { createId } from "../lib/ids";

const DRAFT_PREFIX = "tallyweb:draft:";

export function ResponderPage({
  formId,
  onNavigate
}: {
  formId: string;
  onNavigate: (path: string) => void;
}) {
  const editorSchema = useStore(editorStore, (state) => state.schema);
  const editorActions = editorStore.getState().actions;
  const responseActions = responseStore.getState().actions;
  const [sharedSchema, setSharedSchema] = useState<FormSchema | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ResponseFieldAnswer>>({});
  const [hiddenFields, setHiddenFields] = useState<Record<string, string>>({});
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const schemaFromUrl = await loadSharedSchemaFromHash();
        if (schemaFromUrl) {
          if (!active) return;
          setSharedSchema(schemaFromUrl);
          restoreDraft(schemaFromUrl.id, setAnswers, setHiddenFields, setPageIndex, setStartedAt);
          applyPrefillFromHash(schemaFromUrl, setAnswers, setHiddenFields);
          await responseActions.hydrate(schemaFromUrl.id);
          setIsReady(true);
          return;
        }
      } catch {
        // Fall through to the local workspace form.
      }

      await editorActions.loadForm(formId);
      await responseActions.hydrate(formId);
      if (!active) return;
      restoreDraft(formId, setAnswers, setHiddenFields, setPageIndex, setStartedAt);
      const loadedSchema = editorStore.getState().schema;
      if (loadedSchema) {
        applyPrefillFromHash(loadedSchema, setAnswers, setHiddenFields);
      }
      setIsReady(true);
    })();

    return () => {
      active = false;
    };
  }, [editorActions, formId, responseActions]);

  const schema = sharedSchema ?? editorSchema;
  const pages = useMemo(() => (schema ? getVisiblePages(schema) : []), [schema]);
  const currentPage = pages[pageIndex] ?? pages[0];
  const visibleBlocks = currentPage?.blocks ?? [];
  const progress = pages.length ? Math.round(((pageIndex + 1) / pages.length) * 100) : 0;
  const canGoBack = pageIndex > 0;
  const isLastPage = pageIndex >= pages.length - 1;

  useEffect(() => {
    if (!schema?.settings.saveAndContinue) {
      return;
    }
    persistDraft(schema.id, { answers, hiddenFields, pageIndex, startedAt });
  }, [answers, hiddenFields, pageIndex, schema, startedAt]);

  if (!isReady || !schema) {
    return <EmptyState title="Loading responder" description={`Preparing ${formId} for preview...`} />;
  }

  const blockedBlocks = visibleBlocks.filter((block) => block.type !== "hidden_field" && block.hidden);
  const renderableBlocks = visibleBlocks.filter((block) => shouldRenderBlock(block));
  const requiredMissing = renderableBlocks.filter((block) => block.required && isMissingAnswer(block, answers[block.fieldKey]?.value));

  const handleSubmit = async () => {
    if (requiredMissing.length || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    const response: ResponseRecord = {
      id: createId("response"),
      formId: schema.id,
      submittedAt: Date.now(),
      completionTime: Date.now() - startedAt,
      isPartial: false,
      pageReached: pageIndex + 1,
      answers,
      hiddenFields,
      score: 0,
      variables: {}
    };

    try {
      await responseActions.submit(response);
      clearDraft(schema.id);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="responder-shell">
        <SectionCard title={schema.settings.successPageTitle} subtitle="Submission complete">
          <p className="section-copy">{schema.settings.successMessage}</p>
          <div className="btn-row">
            <button className="secondary-btn" type="button" onClick={() => onNavigate("/")} >
              Back to dashboard
            </button>
            <button className="primary-btn" type="button" onClick={() => {
              setAnswers({});
              setHiddenFields({});
              setPageIndex(0);
              setStartedAt(Date.now());
              setIsSubmitted(false);
            }}>
              Submit another response
            </button>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="responder-shell">
      <SectionCard title={schema.title} subtitle="Responder preview">
        <p className="section-copy">{schema.description || "A calm, mobile-friendly respondent flow."}</p>
        {schema.settings.showProgressBar ? (
          <div className="progress-shell" aria-label="Progress">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-copy">{progress}% complete</div>
          </div>
        ) : null}
        {blockedBlocks.length ? <p className="section-copy">Hidden blocks are skipped from validation and response capture.</p> : null}
      </SectionCard>

      <div className="respondent-pages">
        <section className="respondent-page">
          <div className="page-pill">
            {currentPage ? currentPage.title : "Page"}
          </div>
          {visibleBlocks.map((block) => renderBlock(block, answers, setAnswers))}
        </section>
      </div>

      <div className="respondent-actions">
        <button className="secondary-btn" type="button" disabled={!canGoBack} onClick={() => setPageIndex((value) => Math.max(0, value - 1))}>
          Back
        </button>
        {!isLastPage ? (
          <button
            className="primary-btn"
            type="button"
            onClick={() => setPageIndex((value) => Math.min(pages.length - 1, value + 1))}
            disabled={requiredMissing.length > 0}
          >
            {currentPage?.buttonLabel || "Next"}
          </button>
        ) : (
          <button className="primary-btn" type="button" onClick={handleSubmit} disabled={requiredMissing.length > 0 || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit response"}
          </button>
        )}
      </div>
    </div>
  );
}

function renderBlock(
  block: Block,
  answers: Record<string, ResponseFieldAnswer>,
  setAnswers: Dispatch<SetStateAction<Record<string, ResponseFieldAnswer>>>,
) {
  if (block.type === "hidden_field" || block.hidden) {
    return null;
  }

  const value = answers[block.fieldKey]?.value;
  const onValue = (nextValue: ResponseFieldAnswer["value"]) => {
    setAnswers((current) => ({
      ...current,
      [block.fieldKey]: {
        fieldKey: block.fieldKey,
        value: nextValue,
        updatedAt: Date.now()
      }
    }));
  };

  return (
    <article key={block.id} className="question-card">
      <div className="question-label">{block.label}</div>
      {block.description ? <div className="question-helper">{block.description}</div> : null}

      {block.type === "heading" ? (
        <h2 className="question-heading">{block.label}</h2>
      ) : block.type === "paragraph" ? (
        <p className="statement-copy">{block.description || block.label}</p>
      ) : block.type === "divider" ? (
        <hr className="question-divider" />
      ) : block.type === "statement" ? (
        <div className="statement-card">
          <p className="statement-copy">{block.description || block.label}</p>
        </div>
      ) : block.type === "multiple_choice" ? (
        <div className="choice-list">
          {getChoiceOptions(block).map((option) => {
            const nextValue = Array.isArray(value) ? value : [];
            const checked = nextValue.includes(option.label);
            return (
              <label key={option.label} className="toggle-row">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    const next = event.target.checked ? [...nextValue, option.label] : nextValue.filter((item) => item !== option.label);
                    onValue(next);
                  }}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      ) : block.type === "single_choice" || block.type === "dropdown" ? (
        <select className="question-input" value={String(value ?? "")} onChange={(event) => onValue(event.target.value)}>
          <option value="">Choose one</option>
          {getChoiceOptions(block).map((option) => (
            <option key={option.label} value={option.label}>
              {option.label}
            </option>
          ))}
        </select>
      ) : block.type === "rating" || block.type === "opinion_scale" ? (
        <input
          className="question-input"
          type="range"
          min={block.type === "rating" ? 1 : 0}
          max={block.type === "rating" ? 5 : 10}
          value={Number(value ?? 0)}
          onChange={(event) => onValue(Number(event.target.value))}
        />
      ) : block.type === "number" ? (
        <input className="question-input" type="number" value={String(value ?? "")} onChange={(event) => onValue(Number(event.target.value))} />
      ) : block.type === "email" ? (
        <input className="question-input" type="email" value={String(value ?? "")} onChange={(event) => onValue(event.target.value)} />
      ) : block.type === "phone" ? (
        <input className="question-input" type="tel" value={String(value ?? "")} onChange={(event) => onValue(event.target.value)} />
      ) : block.type === "website" ? (
        <input className="question-input" type="url" value={String(value ?? "")} onChange={(event) => onValue(event.target.value)} />
      ) : block.type === "date" ? (
        <input className="question-input" type="date" value={String(value ?? "")} onChange={(event) => onValue(event.target.value)} />
      ) : block.type === "long_text" ? (
        <textarea className="question-input" rows={4} value={String(value ?? "")} onChange={(event) => onValue(event.target.value)} />
      ) : (
        <input className="question-input" type="text" value={String(value ?? "")} onChange={(event) => onValue(event.target.value)} />
      )}
    </article>
  );
}

function getChoiceOptions(block: Block): Array<{ label: string }> {
  if ("options" in block.config && Array.isArray((block.config as { options?: { label?: string }[] }).options)) {
    return ((block.config as { options?: { label?: string }[] }).options ?? []).map((option) => ({ label: option.label ?? "Option" }));
  }
  return [];
}

async function loadSharedSchemaFromHash(): Promise<FormSchema | null> {
  const hash = window.location.hash;
  const questionIndex = hash.indexOf("?");
  if (questionIndex < 0) {
    return null;
  }
  const params = new URLSearchParams(hash.slice(questionIndex + 1));
  const encoded = params.get("s");
  if (!encoded) {
    return null;
  }
  return decodeSchemaFromUrlPayload(encoded);
}

function applyPrefillFromHash(
  schema: FormSchema,
  setAnswers: Dispatch<SetStateAction<Record<string, ResponseFieldAnswer>>>,
  setHiddenFields: Dispatch<SetStateAction<Record<string, string>>>
): void {
  const params = getHashParams();
  const hiddenKeys = new Set(schema.hiddenFields.map((field) => field.fieldKey));
  const answerKeys = new Set(schema.blocks.filter((block) => block.type !== "hidden_field" && !block.hidden).map((block) => block.fieldKey));
  const nextAnswers: Record<string, ResponseFieldAnswer> = {};
  const nextHiddenFields: Record<string, string> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (key === "s") {
      return;
    }
    if (hiddenKeys.has(key)) {
      nextHiddenFields[key] = value;
    }
    if (answerKeys.has(key)) {
      nextAnswers[key] = {
        fieldKey: key,
        value,
        updatedAt: Date.now()
      };
    }
  });

  if (Object.keys(nextHiddenFields).length) {
    setHiddenFields((current) => ({ ...current, ...nextHiddenFields }));
  }
  if (Object.keys(nextAnswers).length) {
    setAnswers((current) => ({ ...current, ...nextAnswers }));
  }
}

function getHashParams(): Record<string, string> {
  const hash = window.location.hash;
  const questionIndex = hash.indexOf("?");
  if (questionIndex < 0) {
    return {};
  }
  const params = new URLSearchParams(hash.slice(questionIndex + 1));
  return Object.fromEntries(params.entries());
}

function restoreDraft(
  formId: string,
  setAnswers: Dispatch<SetStateAction<Record<string, ResponseFieldAnswer>>>,
  setHiddenFields: Dispatch<SetStateAction<Record<string, string>>>,
  setPageIndex: Dispatch<SetStateAction<number>>,
  setStartedAt: Dispatch<SetStateAction<number>>
): void {
  try {
    const raw = localStorage.getItem(`${DRAFT_PREFIX}${formId}`);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw) as {
      answers?: Record<string, ResponseFieldAnswer>;
      hiddenFields?: Record<string, string>;
      pageIndex?: number;
      startedAt?: number;
    };
    if (parsed.answers) setAnswers(parsed.answers);
    if (parsed.hiddenFields) setHiddenFields(parsed.hiddenFields);
    if (typeof parsed.pageIndex === "number") setPageIndex(parsed.pageIndex);
    if (typeof parsed.startedAt === "number") setStartedAt(parsed.startedAt);
  } catch {
    // Ignore corrupt drafts.
  }
}

function persistDraft(
  formId: string,
  payload: {
    answers: Record<string, ResponseFieldAnswer>;
    hiddenFields: Record<string, string>;
    pageIndex: number;
    startedAt: number;
  }
): void {
  localStorage.setItem(`${DRAFT_PREFIX}${formId}`, JSON.stringify(payload));
}

function clearDraft(formId: string): void {
  localStorage.removeItem(`${DRAFT_PREFIX}${formId}`);
}

function shouldRenderBlock(block: Block): boolean {
  return block.type !== "hidden_field" && !block.hidden;
}

function isMissingAnswer(block: Block, value: ResponseFieldAnswer["value"] | undefined): boolean {
  if (block.type === "statement") {
    return false;
  }
  if (value === null || value === undefined) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === "string") {
    return value.trim().length === 0;
  }
  return false;
}
