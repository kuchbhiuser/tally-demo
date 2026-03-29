import type { ReactNode } from "react";

export function TopBar({
  title,
  subtitle,
  actions
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <header className="topbar">
      <div className="topbar-copy">
        <div className="eyebrow">TallyWeb MVP</div>
        <h2>{title}</h2>
        <p className="topbar-subtitle">{subtitle}</p>
      </div>
      <div className="topbar-actions">{actions}</div>
    </header>
  );
}
