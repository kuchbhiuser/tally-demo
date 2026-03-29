import { SectionCard } from "../components/SectionCard";
import { useStore } from "../lib/use-store";
import { workspaceStore } from "../stores/workspace-store";

export function SettingsPage() {
  const settings = useStore(workspaceStore, (state) => state.settings);
  const forms = useStore(workspaceStore, (state) => state.forms);
  const actions = workspaceStore.getState().actions;

  if (!settings) {
    return null;
  }

  const save = (patch: Partial<typeof settings>) => {
    actions.updateSettings({
      ...settings,
      ...patch,
      updatedAt: Date.now()
    });
  };

  return (
    <div className="settings-grid">
      <SectionCard title="Workspace" subtitle="Settings">
        <div className="settings-list">
          <label className="setting-field">
            <span>Display name</span>
            <input value={settings.displayName} onChange={(event) => save({ displayName: event.target.value })} />
          </label>
          <label className="setting-field">
            <span>Theme preference</span>
            <select value={settings.themePreference} onChange={(event) => save({ themePreference: event.target.value as typeof settings.themePreference })}>
              <option value="light">light</option>
              <option value="dark">dark</option>
              <option value="auto">auto</option>
            </select>
          </label>
          <label className="setting-field">
            <span>Default layout</span>
            <select value={settings.defaultLayout} onChange={(event) => save({ defaultLayout: event.target.value as typeof settings.defaultLayout })}>
              <option value="classic">classic</option>
              <option value="card">card</option>
              <option value="conversational">conversational</option>
            </select>
          </label>
          <div className="inspect-row"><span>Active form</span><strong>{settings.activeFormId ?? "None"}</strong></div>
          <div className="inspect-row"><span>Forms in workspace</span><strong>{forms.length}</strong></div>
        </div>
      </SectionCard>

      <SectionCard title="Future integrations" subtitle="Planned">
        <div className="settings-grid-cards">
          <article className="mini-card"><strong>JSONBin</strong><span>Remote schema publish</span></article>
          <article className="mini-card"><strong>Airtable</strong><span>Response storage</span></article>
          <article className="mini-card"><strong>Cloudinary</strong><span>File upload target</span></article>
          <article className="mini-card"><strong>EmailJS</strong><span>Confirmation emails</span></article>
        </div>
      </SectionCard>
    </div>
  );
}
