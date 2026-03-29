import { TEMPLATE_LIBRARY } from "../domain/templates";
import type { FormListItem } from "../domain/types";
import { EmptyState } from "../components/EmptyState";
import { FormCard } from "../components/FormCard";
import { SectionCard } from "../components/SectionCard";
import { StatGrid } from "../components/StatGrid";

export function DashboardPage({
  forms,
  onNavigate,
  onCreate
}: {
  forms: FormListItem[];
  onNavigate: (path: string) => void;
  onCreate: () => void;
}) {
  return (
    <div className="page-grid">
      <SectionCard
        title="Build, publish, repeat"
        subtitle="Workspace overview"
        actions={<button className="secondary-btn" type="button" onClick={() => onNavigate("/settings")}>Open settings</button>}
      >
        <div className="dashboard-hero">
          <div>
            <p className="section-copy">
              Create forms locally, preview them instantly, and keep the workspace deployable on GitHub Pages with no backend.
            </p>
            <div className="btn-row">
              <button className="primary-btn" type="button" onClick={onCreate}>Create form</button>
              <button className="secondary-btn" type="button" onClick={onCreate}>Start from blank canvas</button>
            </div>
          </div>
          <div className="dashboard-hero-card">
            <div className="eyebrow">Deployment</div>
            <strong>GitHub Pages ready</strong>
            <p>Static hosting only. No backend required for the MVP.</p>
          </div>
        </div>
      </SectionCard>

      <StatGrid
        items={[
          { label: "Forms", value: String(forms.length), note: "Active in workspace" },
          { label: "Published", value: String(forms.filter((form) => form.status === "published").length), note: "Live now" },
          { label: "Responses", value: String(forms.reduce((sum, form) => sum + form.responseCount, 0)), note: "Across all forms" }
        ]}
      />

      <SectionCard
        title="Workspace forms"
        subtitle="Dashboard"
        actions={<button className="primary-btn" type="button" onClick={onCreate}>Create form</button>}
      >
        {forms.length ? (
          <div className="card-grid">
            {forms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                onEdit={() => onNavigate(`/builder/${form.id}`)}
                onPreview={() => onNavigate(`/form/${form.id}`)}
                onResults={() => onNavigate(`/results/${form.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No forms yet" description="Create a blank form or start from one of the built-in templates." actions={<button className="primary-btn" type="button" onClick={onCreate}>Create your first form</button>} />
        )}
      </SectionCard>

      <SectionCard title="Templates" subtitle="Starter kits">
        <div className="card-grid">
          {TEMPLATE_LIBRARY.map((template) => (
            <article key={template.id} className="mini-card">
              <div className="form-card-title">{template.title}</div>
              <div className="form-card-desc">{template.description}</div>
              <div className="chip-row">
                <span className="chip">{template.category}</span>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
