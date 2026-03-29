import type { Block, Page } from "../domain/types";
import { EmptyState } from "../components/EmptyState";
import { SectionCard } from "../components/SectionCard";
import { editorStore } from "../stores/editor-store";

export function BlockInspector({
  block,
  pages,
  onPatch,
  onDuplicate,
  onDelete
}: {
  block?: Block;
  pages: Page[];
  onPatch: (patch: Partial<Block>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const actions = editorStore.getState().actions;

  return (
    <SectionCard title="Inspector" subtitle="Selected block">
      {!block ? (
        <EmptyState title="Select a block" description="Click any block in the canvas to inspect its label, key, and page placement." />
      ) : (
        <div className="inspector">
          <label className="inline-field">
            Label
            <input value={block.label} onChange={(event) => onPatch({ label: event.target.value })} />
          </label>
          <label className="inline-field">
            Field key
            <input value={block.fieldKey} onChange={(event) => onPatch({ fieldKey: event.target.value })} />
          </label>
          <label className="inline-field">
            Description
            <textarea rows={3} value={block.description ?? ""} onChange={(event) => onPatch({ description: event.target.value })} />
          </label>
          {block.type === "statement" ? (
            <label className="inline-field">
              Statement copy
              <textarea
                rows={4}
                value={String((block.config as { content?: string }).content ?? "")}
                onChange={(event) => onPatch({ config: { ...(block.config as Record<string, unknown>), content: event.target.value } as Block["config"] })}
              />
            </label>
          ) : null}
          <label className="inline-field">
            Page
            <select value={block.pageId} onChange={(event) => onPatch({ pageId: event.target.value })}>
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.title ?? `Page ${page.order}`}
                </option>
              ))}
            </select>
          </label>
          <label className="toggle-row">
            <input type="checkbox" checked={block.required} onChange={(event) => onPatch({ required: event.target.checked })} />
            Required
          </label>
          <label className="toggle-row">
            <input type="checkbox" checked={block.hidden} onChange={(event) => onPatch({ hidden: event.target.checked })} />
            Hidden
          </label>
          <label className="toggle-row">
            <input type="checkbox" checked={block.readOnly} onChange={(event) => onPatch({ readOnly: event.target.checked })} />
            Read only
          </label>
          {"options" in block.config ? (
            <div className="setting-field">
              <span>Options</span>
              <textarea
                rows={4}
                value={((block.config.options ?? []) as Array<{ label?: string }>)
                  .map((option) => option.label ?? "")
                  .join("\n")}
                onChange={(event) => {
                  const options = event.target.value
                    .split("\n")
                    .map((label) => label.trim())
                    .filter(Boolean)
                    .map((label) => ({ id: label.toLowerCase().replace(/\s+/g, "-"), label }));
                  onPatch({ config: { ...(block.config as Record<string, unknown>), options } as Block["config"] });
                }}
                placeholder="One option per line"
              />
            </div>
          ) : null}
          <div className="inspect-row"><span>Type</span><strong>{block.type}</strong></div>
          <div className="inspect-row"><span>Block ID</span><strong>{block.id}</strong></div>
          <div className="inspect-row"><span>Field key</span><strong>{block.fieldKey}</strong></div>
          <div className="inspect-row"><span>Page</span><strong>{pages.find((page) => page.id === block.pageId)?.title ?? block.pageId}</strong></div>
          <div className="builder-actions stacked">
            <button className="secondary-btn" type="button" onClick={onDuplicate}>
              Duplicate block
            </button>
            <button className="secondary-btn danger" type="button" onClick={onDelete}>
              Delete block
            </button>
            <button
              className="secondary-btn"
              type="button"
              onClick={() => actions.addLogicRule()}
            >
              Add logic rule
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
