import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  actions
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-title">{title}</div>
      <p>{description}</p>
      {actions ? <div className="empty-actions">{actions}</div> : null}
    </div>
  );
}
