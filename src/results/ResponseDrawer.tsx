import type { FormSchema, ResponseRecord } from "../domain/types";
import { EmptyState } from "../components/EmptyState";
import { SectionCard } from "../components/SectionCard";
import { formatAnswerValue, getBlockLabelMap } from "../lib/response-helpers";

export function ResponseDrawer({ row, schema }: { row?: ResponseRecord; schema?: FormSchema | null }) {
  const blockMap = getBlockLabelMap(schema);
  return (
    <SectionCard title="Response details" subtitle="Selected row">
      {!row ? (
        <EmptyState title="Select a response" description="Click any table row to inspect its answers and metadata." />
      ) : (
        <div className="response-drawer">
          <div className="inspect-row"><span>Submitted at</span><strong>{new Date(row.submittedAt).toLocaleString()}</strong></div>
          <div className="inspect-row"><span>Completion time</span><strong>{row.completionTime ? `${Math.round(row.completionTime / 1000)}s` : "—"}</strong></div>
          <div className="inspect-row"><span>Score</span><strong>{row.score ?? 0}</strong></div>
          <div className="inspect-row"><span>Hidden fields</span><strong>{Object.keys(row.hiddenFields).length ? "Captured" : "None"}</strong></div>
          <div className="detail-list">
            {Object.entries(row.answers).map(([key, answer]) => (
              <div key={key} className="inspect-row">
                <span>{blockMap[key]?.label ?? key}</span>
                <strong>{formatAnswerValue(answer)}</strong>
              </div>
            ))}
          </div>
          {Object.entries(row.hiddenFields).length ? (
            <div className="detail-list">
              {Object.entries(row.hiddenFields).map(([key, value]) => (
                <div key={key} className="inspect-row">
                  <span>Hidden: {key}</span>
                  <strong>{value || "—"}</strong>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </SectionCard>
  );
}
