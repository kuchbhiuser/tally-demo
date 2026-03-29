import type { ResponseRecord } from "../domain/types";
import { SectionCard } from "../components/SectionCard";

export function ResultsSummary({ rows }: { rows: ResponseRecord[] }) {
  const totalTime = rows.reduce((sum, row) => sum + (row.completionTime ?? 0), 0);
  const avgSeconds = rows.length ? Math.round(totalTime / rows.length / 1000) : 0;
  const completionRate = rows.length ? 100 : 0;
  const cards = [
    { label: "Responses", value: String(rows.length), note: "Total collected" },
    { label: "Completion", value: `${completionRate}%`, note: "Local success rate" },
    { label: "Average time", value: avgSeconds ? `${avgSeconds}s` : "—", note: "Across submissions" }
  ];

  return (
    <SectionCard title="Summary" subtitle="Analytics">
      <div className="summary-grid">
        {cards.map((card) => (
          <article key={card.label} className="summary-card">
            <div className="eyebrow">{card.label}</div>
            <div className="summary-value">{card.value}</div>
            <div className="summary-note">{card.note}</div>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
