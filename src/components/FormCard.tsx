import type { FormListItem } from "../domain/types";
import { Badge } from "./Badge";

export function FormCard({
  form,
  onEdit,
  onPreview,
  onResults
}: {
  form: FormListItem;
  onEdit: () => void;
  onPreview: () => void;
  onResults: () => void;
}) {
  return (
    <article className="form-card">
      <div className="form-card-top">
        <div>
          <div className="form-card-title">{form.title}</div>
          <div className="form-card-desc">Updated {new Date(form.updatedAt).toLocaleString()}</div>
        </div>
        <Badge tone={form.status === "published" ? "success" : form.status === "closed" ? "danger" : "warning"}>{form.status}</Badge>
      </div>
      <div className="form-card-meta">
        <span>{form.responseCount} responses</span>
        <span>{form.starred ? "Starred" : "Regular"}</span>
        <span>{form.lastResponseAt ? `Last ${new Date(form.lastResponseAt).toLocaleDateString()}` : "No responses yet"}</span>
      </div>
      <div className="form-card-actions">
        <button className="secondary-btn" type="button" onClick={onEdit}>Edit</button>
        <button className="secondary-btn" type="button" onClick={onPreview}>Preview</button>
        <button className="primary-btn" type="button" onClick={onResults}>Results</button>
      </div>
    </article>
  );
}
