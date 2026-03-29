export function StatGrid({
  items
}: {
  items: { label: string; value: string; note?: string }[];
}) {
  return (
    <div className="stats-grid">
      {items.map((item) => (
        <article key={item.label} className="stat-card">
          <div className="eyebrow">{item.label}</div>
          <div className="stat-value">{item.value}</div>
          {item.note ? <div className="stat-note">{item.note}</div> : null}
        </article>
      ))}
    </div>
  );
}
