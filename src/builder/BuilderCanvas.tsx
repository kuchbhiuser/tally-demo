import type { Block, BlockType } from "../domain/types";
import { Badge } from "../components/Badge";

export function BuilderCanvas({
  blocks,
  selectedId,
  onSelect,
  onInsertAfter,
  onDuplicate,
  onDelete,
  onMove
}: {
  blocks: Block[];
  selectedId: string | null;
  onSelect: (blockId: string) => void;
  onInsertAfter: (type: BlockType, afterBlockId: string | null) => void;
  onDuplicate: (blockId: string) => void;
  onDelete: (blockId: string) => void;
  onMove: (blockId: string, targetIndex: number) => void;
}) {
  const lastBlockId = blocks.at(-1)?.id ?? null;

  return (
    <section className="canvas">
      <div className="canvas-header">
        <div>
          <div className="eyebrow">Editor Canvas</div>
          <h3>Document-style form builder</h3>
        </div>
        <Badge tone="neutral">{blocks.length} blocks</Badge>
      </div>

      <div className="canvas-stack">
        {!blocks.length ? (
          <div className="empty-state compact">
            <div className="empty-title">Start from the palette</div>
            <p>Add a heading, question, or layout block from the left panel.</p>
          </div>
        ) : null}

        {blocks.map((block, index) => (
          <article
            key={block.id}
            className={`block-card ${selectedId === block.id ? "selected" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(block.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(block.id);
              }
            }}
          >
            <div className="block-card-head">
              <span className="drag-handle">⠿</span>
              <div className="block-card-copy">
                <div className="block-type">{block.type}</div>
                <div className="block-label">{block.label}</div>
                <div className="block-subcopy">{block.fieldKey}</div>
              </div>
              <div className="block-card-badges">
                {block.required ? <Badge tone="warning">Required</Badge> : <Badge tone="neutral">Optional</Badge>}
                {block.hidden ? <Badge tone="danger">Hidden</Badge> : null}
                {block.readOnly ? <Badge tone="neutral">Read only</Badge> : null}
              </div>
            </div>

            {block.description ? <div className="block-helper">{block.description}</div> : null}

            {"options" in block.config && Array.isArray((block.config as { options?: unknown[] }).options) ? (
              <div className="choice-grid">
                {((block.config as { options?: { label?: string }[] }).options ?? []).slice(0, 4).map((option, optionIndex) => (
                  <span key={option.label ?? String(optionIndex)} className="choice-pill">
                    {option.label ?? `Option ${optionIndex + 1}`}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="block-actions" onClick={(event) => event.stopPropagation()}>
              <button className="secondary-btn small" type="button" onClick={() => onInsertAfter("short_text", block.id)}>
                Insert below
              </button>
              <button className="secondary-btn small" type="button" disabled={index === 0} onClick={() => onMove(block.id, index - 1)}>
                Up
              </button>
              <button className="secondary-btn small" type="button" disabled={index === blocks.length - 1} onClick={() => onMove(block.id, index + 2)}>
                Down
              </button>
              <button className="secondary-btn small" type="button" onClick={() => onDuplicate(block.id)}>
                Duplicate
              </button>
              <button className="secondary-btn small danger" type="button" onClick={() => onDelete(block.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="canvas-footer">
        <button className="secondary-btn" type="button" onClick={() => onInsertAfter("short_text", lastBlockId)}>
          Add text block
        </button>
        <button className="secondary-btn" type="button" onClick={() => onInsertAfter("single_choice", lastBlockId)}>
          Add choice block
        </button>
      </div>
    </section>
  );
}
