import { useEffect, useMemo, useState } from "react";
import { BlockPalette } from "../builder/BlockPalette";
import { BlockInspector } from "../builder/BlockInspector";
import { BuilderCanvas } from "../builder/BuilderCanvas";
import { LogicRail } from "../builder/LogicRail";
import { Badge } from "../components/Badge";
import { EmptyState } from "../components/EmptyState";
import { SectionCard } from "../components/SectionCard";
import { editorStore } from "../stores/editor-store";
import { workspaceStore } from "../stores/workspace-store";
import { useStore } from "../lib/use-store";
import type { BlockType } from "../domain/types";
import { buildShareUrl } from "../lib/url-schema";

export function BuilderPage({
  formId,
  onNavigate
}: {
  formId: string;
  onNavigate: (path: string) => void;
}) {
  const schema = useStore(editorStore, (state) => state.schema);
  const selectedBlockId = useStore(editorStore, (state) => state.selectedBlockId);
  const isDirty = useStore(editorStore, (state) => state.isDirty);
  const logic = useStore(editorStore, (state) => state.schema?.logic ?? []);
  const actions = editorStore.getState().actions;
  const workspaceActions = workspaceStore.getState().actions;
  const [shareState, setShareState] = useState<"idle" | "copying" | "copied">("idle");

  const selectedBlock = useMemo(() => schema?.blocks.find((block) => block.id === selectedBlockId), [schema, selectedBlockId]);

  useEffect(() => {
    if (!schema || !isDirty) {
      return;
    }

    const timeout = window.setTimeout(() => {
      actions.save().then(() => workspaceActions.refreshForms());
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [actions, isDirty, schema, workspaceActions]);

  if (!schema) {
    return <EmptyState title="Loading form" description={`Opening ${formId} in the editor...`} />;
  }

  const insertBlock = (type: BlockType) => actions.insertBlock(type, selectedBlockId);

  const copyShareLink = async () => {
    if (!schema) {
      return;
    }
    setShareState("copying");
    const shareUrl = await buildShareUrl(window.location.href, schema);
    await navigator.clipboard.writeText(shareUrl);
    setShareState("copied");
    window.setTimeout(() => setShareState("idle"), 1500);
  };

  return (
    <div className="builder-layout">
      <aside className="builder-left">
        <BlockPalette onInsert={insertBlock} />
        <LogicRail rules={logic} onAddRule={() => actions.addLogicRule()} onDeleteRule={(ruleId) => actions.deleteLogicRule(ruleId)} />
      </aside>

      <section className="builder-main">
        <SectionCard
          title={schema.title}
          subtitle="Builder shell"
          actions={
            <div className="builder-actions">
              <Badge tone={isDirty ? "warning" : "neutral"}>{isDirty ? "Unsaved" : schema.status}</Badge>
              <button className="secondary-btn" type="button" onClick={() => actions.addLogicRule()}>Add logic</button>
              <button className="secondary-btn" type="button" onClick={() => onNavigate(`/form/${schema.id}`)}>Preview</button>
              <button className="secondary-btn" type="button" onClick={() => void copyShareLink()}>
                {shareState === "copying" ? "Copying..." : shareState === "copied" ? "Copied" : "Share"}
              </button>
              <button className="primary-btn" type="button" onClick={() => onNavigate(`/results/${schema.id}`)}>Results</button>
            </div>
          }
        >
          <div className="builder-meta">
            <label className="inline-field">
              Title
              <input
                value={schema.title}
                onChange={(event) => actions.setTitle(event.target.value)}
                placeholder="Form title"
              />
            </label>
            <label className="inline-field">
              Description
              <textarea
                rows={3}
                value={schema.description ?? ""}
                onChange={(event) => actions.setDescription(event.target.value)}
                placeholder="Describe this form"
              />
            </label>
          </div>
          <p className="section-copy">{schema.description || "A clean block-based editor with inline settings and logic-ready structure."}</p>
          <div className="btn-row">
            <button className="secondary-btn" type="button" onClick={() => actions.undo()}>Undo</button>
            <button className="secondary-btn" type="button" onClick={() => actions.redo()}>Redo</button>
            <button className="secondary-btn" type="button" onClick={() => actions.save()}>Save draft</button>
          </div>
        </SectionCard>
        <BuilderCanvas
          blocks={schema.blocks}
          selectedId={selectedBlockId}
          onSelect={actions.selectBlock}
          onInsertAfter={(type, afterBlockId) => actions.insertBlock(type, afterBlockId)}
          onDuplicate={(blockId) => actions.duplicateBlock(blockId)}
          onDelete={(blockId) => actions.deleteBlock(blockId)}
          onMove={(blockId, targetIndex) => actions.moveBlock(blockId, targetIndex)}
        />
      </section>

      <aside className="builder-right">
        <BlockInspector
          block={selectedBlock}
          pages={schema.pages}
          onPatch={(patch) => {
            if (selectedBlock) {
              actions.updateBlock(selectedBlock.id, patch);
            }
          }}
          onDuplicate={() => {
            if (selectedBlock) {
              actions.duplicateBlock(selectedBlock.id);
            }
          }}
          onDelete={() => {
            if (selectedBlock) {
              actions.deleteBlock(selectedBlock.id);
            }
          }}
        />
      </aside>
    </div>
  );
}
