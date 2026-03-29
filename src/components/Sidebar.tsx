import type { FormListItem, WorkspaceSettings } from "../domain/types";
import type { Route } from "../lib/hash-route";
import { Badge } from "./Badge";

export function Sidebar({
  route,
  forms,
  settings,
  activeFormId,
  onNavigate
}: {
  route: Route;
  forms: FormListItem[];
  settings: WorkspaceSettings;
  activeFormId?: string | null;
  onNavigate: (path: string) => void;
}) {
  const isActive = (kind: Route["kind"]) => route.kind === kind;

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">TW</div>
        <div>
          <div className="eyebrow">Workspace</div>
          <h1>{settings.displayName}</h1>
          <p className="sidebar-subtitle">Browser-only forms for GitHub Pages</p>
        </div>
      </div>

      <nav className="side-nav" aria-label="Primary">
        <button className={`side-link ${isActive("dashboard") ? "active" : ""}`} type="button" onClick={() => onNavigate("/")}>Dashboard</button>
        <button className={`side-link ${isActive("settings") ? "active" : ""}`} type="button" onClick={() => onNavigate("/settings")}>Settings</button>
      </nav>

      <section className="side-section">
        <div className="section-title-row">
          <div className="section-title">Forms</div>
          <span className="sidebar-count">{forms.length}</span>
        </div>
        <div className="side-form-list">
          {forms.map((form) => (
            <button
              key={form.id}
              className={`side-form-item ${activeFormId === form.id ? "active" : ""}`}
              type="button"
              onClick={() => onNavigate(`/builder/${form.id}`)}
            >
              <div>
                <div className="side-form-title">{form.title}</div>
                <div className="side-form-meta">{form.responseCount} responses</div>
              </div>
              <Badge tone={form.status === "published" ? "success" : form.status === "closed" ? "danger" : "warning"}>
                {form.status}
              </Badge>
            </button>
          ))}
        </div>
      </section>

      <section className="side-section sidebar-note">
        <div className="section-title">Coverage</div>
        <ul>
          <li>Builder and preview</li>
          <li>Local response flow</li>
          <li>Results and exports</li>
          <li>GitHub Pages ready</li>
        </ul>
      </section>
    </aside>
  );
}
