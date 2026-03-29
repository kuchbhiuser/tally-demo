import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { ResultsSummary } from "../results/ResultsSummary";
import { ResponseDrawer } from "../results/ResponseDrawer";
import { ResultsTable } from "../results/ResultsTable";
import { useStore } from "../lib/use-store";
import { responseStore } from "../stores/response-store";
import { editorStore } from "../stores/editor-store";
import { buildCsv, downloadTextFile } from "../lib/response-helpers";

export function ResultsPage({
  formId
}: {
  formId: string;
}) {
  const responses = useStore(responseStore, (state) => state.responses);
  const selectedResponseId = useStore(responseStore, (state) => state.selectedResponseId);
  const schema = useStore(editorStore, (state) => state.schema);
  const actions = responseStore.getState().actions;
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    actions.hydrate(formId).then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, [actions, formId]);

  const filteredRows = useMemo(() => {
    if (!query.trim()) {
      return responses;
    }
    const lower = query.toLowerCase();
    return responses.filter((row) => {
      return [
        row.id,
        new Date(row.submittedAt).toLocaleString(),
        ...Object.values(row.answers).map((answer) => String(answer.value ?? "")),
        ...Object.values(row.hiddenFields)
      ].some((value) => value.toLowerCase().includes(lower));
    });
  }, [query, responses]);

  if (!ready) {
    return <EmptyState title="Loading responses" description="Fetching local response data..." />;
  }

  const selectedResponse = filteredRows.find((response) => response.id === selectedResponseId) ?? filteredRows[0];

  return (
    <div className="results-layout">
      <ResultsSummary rows={filteredRows} />
      <section className="panel">
        <div className="panel-head">
          <div>
            <div className="eyebrow">Tools</div>
            <h3>Exports and filters</h3>
          </div>
          <div className="btn-row">
            <button className="secondary-btn" type="button" onClick={() => actions.refresh()}>Refresh</button>
            <button className="secondary-btn" type="button" onClick={() => downloadTextFile(`${schema?.title || "responses"}.csv`, buildCsv(filteredRows, schema), "text/csv;charset=utf-8")}>Export CSV</button>
            <button className="secondary-btn" type="button" onClick={() => downloadTextFile(`${schema?.title || "responses"}.json`, JSON.stringify(filteredRows, null, 2), "application/json;charset=utf-8")}>Export JSON</button>
            <button className="secondary-btn" type="button" onClick={() => actions.clearResponses()}>Clear local responses</button>
          </div>
        </div>
        <input className="question-input" placeholder="Search responses" value={query} onChange={(event) => setQuery(event.target.value)} />
      </section>
      <div className="results-grid">
        <ResultsTable rows={filteredRows} selectedId={selectedResponse?.id} onSelect={(row) => actions.selectResponse(row.id)} schema={schema} />
        <ResponseDrawer row={selectedResponse} schema={schema} />
      </div>
      <div className="results-footer">
        <button className="secondary-btn" type="button" onClick={() => onExportSummary(filteredRows, schema)}>
          Quick export
        </button>
      </div>
    </div>
  );
}

function onExportSummary(rows: Parameters<typeof buildCsv>[0], schema: Parameters<typeof buildCsv>[1]): void {
  downloadTextFile(`responses-${Date.now()}.csv`, buildCsv(rows, schema), "text/csv;charset=utf-8");
}
