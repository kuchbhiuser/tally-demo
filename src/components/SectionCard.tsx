import type { ReactNode } from "react";

export function SectionCard({
  title,
  subtitle,
  children,
  actions
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          {subtitle ? <div className="eyebrow">{subtitle}</div> : null}
          <h3>{title}</h3>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
