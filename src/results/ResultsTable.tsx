import type { FormSchema, ResponseRecord } from "../domain/types";
import { Badge } from "../components/Badge";
import { formatAnswerValue, getBlockLabelMap } from "../lib/response-helpers";

export function ResultsTable({
  rows,
  selectedId,
  onSelect,
  schema
}: {
  rows: ResponseRecord[];
  selectedId?: string;
  onSelect: (row: ResponseRecord) => void;
  schema?: FormSchema | null;
}) {
  const blockMap = getBlockLabelMap(schema);

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <div className="eyebrow">Responses</div>
          <h3>Submission register</h3>
        </div>
      </div>
      <div className="table-wrap">
        <table className="results-table">
          <thead>
            <tr>
              <th>Submitted</th>
              <th>Time</th>
              <th>Score</th>
              <th>First answer</th>
              <th>Labels</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const firstAnswerKey = Object.keys(row.answers)[0];
              const firstAnswer = firstAnswerKey ? row.answers[firstAnswerKey] : undefined;
              const labels = Object.entries(row.answers)
                .slice(0, 3)
                .map(([key, answer]) => `${blockMap[key]?.label ?? key}: ${formatAnswerValue(answer)}`)
                .join(" • ");
              return (
                <tr key={row.id} className={selectedId === row.id ? "selected" : ""} onClick={() => onSelect(row)}>
                  <td>{new Date(row.submittedAt).toLocaleString()}</td>
                  <td>{row.completionTime ? `${Math.round(row.completionTime / 1000)}s` : "—"}</td>
                  <td><Badge tone="success">{row.score ?? 0}</Badge></td>
                  <td>{firstAnswer ? formatAnswerValue(firstAnswer) : "—"}</td>
                  <td>{labels || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
