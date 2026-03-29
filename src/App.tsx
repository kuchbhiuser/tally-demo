import { useEffect, useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { EmptyState } from "./components/EmptyState";
import { workspaceStore } from "./stores/workspace-store";
import { editorStore } from "./stores/editor-store";
import { useStore } from "./lib/use-store";
import { parseRoute, toHash } from "./lib/hash-route";
import { DashboardPage } from "./pages/DashboardPage";
import { BuilderPage } from "./pages/BuilderPage";
import { ResponderPage } from "./pages/ResponderPage";
import { ResultsPage } from "./pages/ResultsPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  const workspaceState = useStore(workspaceStore, (state) => ({
    isHydrated: state.isHydrated,
    forms: state.forms,
    settings: state.settings,
    activeFormId: state.activeFormId,
    actions: state.actions
  }));
  const [hash, setHash] = useState(() => window.location.hash || "#/");
  const editorState = useStore(editorStore, (state) => ({
    schema: state.schema,
    actions: state.actions
  }));

  useEffect(() => {
    const sync = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", sync);
    if (!window.location.hash) {
      window.location.hash = "#/";
    }
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const route = useMemo(() => parseRoute(hash), [hash]);
  const isSharedFormRoute = route.kind === "form" && !route.formId;

  useEffect(() => {
    workspaceState.actions.hydrate();
  }, [workspaceState.actions]);

  useEffect(() => {
    if (route.kind === "builder") {
      editorState.actions.loadForm(route.formId);
      workspaceState.actions.setActiveFormId(route.formId);
    }
    if (route.kind === "results" && route.formId) {
      editorState.actions.loadForm(route.formId);
      workspaceState.actions.setActiveFormId(route.formId);
    }
    if (route.kind === "form" && route.formId) {
      editorState.actions.loadForm(route.formId);
    }
  }, [editorState.actions, route, workspaceState.actions]);

  const activeForm = useMemo(() => {
    if (isSharedFormRoute) {
      return undefined;
    }
    const targetFormId = route.kind === "builder" || route.kind === "results"
      ? route.formId
      : route.kind === "form" && route.formId
        ? route.formId
        : workspaceState.activeFormId ?? workspaceState.forms[0]?.id ?? null;
    return workspaceState.forms.find((form) => form.id === targetFormId) ?? workspaceState.forms[0];
  }, [isSharedFormRoute, route, workspaceState.activeFormId, workspaceState.forms]);

  const navigate = (path: string) => {
    window.location.hash = toHash(path);
  };

  if (!workspaceState.isHydrated || !workspaceState.settings) {
    return (
      <div className="app-shell loading-shell">
        <div className="loading-card">
          <div className="eyebrow">TallyWeb MVP</div>
          <h2>Loading workspace</h2>
          <p className="topbar-subtitle">Hydrating forms, settings, and response data from IndexedDB.</p>
        </div>
      </div>
    );
  }

  const title =
    route.kind === "dashboard"
      ? "Dashboard"
      : route.kind === "builder"
        ? `Builder: ${activeForm?.title ?? "Form"}`
        : route.kind === "form"
          ? route.formId
            ? `Preview: ${activeForm?.title ?? "Form"}`
            : "Shared form"
          : route.kind === "results"
            ? `Results: ${activeForm?.title ?? "Form"}`
            : "Settings";

  const subtitle =
    route.kind === "dashboard"
      ? "Forms, drafts, and quick actions in one workspace."
      : route.kind === "builder"
        ? "Document-style editing with block selection and logic rails."
        : route.kind === "form"
          ? route.formId
            ? "A calm, mobile-friendly respondent flow."
            : "A browser-only shared form loaded from the URL."
          : route.kind === "results"
            ? "Local responses, summary cards, and a detail drawer."
            : "Workspace preferences and future integrations.";

  const actions =
    route.kind === "dashboard" ? (
      <button className="primary-btn" type="button" onClick={() => workspaceState.actions.createForm().then((formId) => navigate(`/builder/${formId}`))}>
        Create form
      </button>
    ) : route.kind === "builder" ? (
      <>
        <button className="secondary-btn" type="button" onClick={() => navigate(`/form/${activeForm?.id ?? ""}`)}>Preview</button>
        <button className="primary-btn" type="button" onClick={() => navigate(`/results/${activeForm?.id ?? ""}`)}>Results</button>
      </>
    ) : route.kind === "results" ? (
      <button className="primary-btn" type="button" onClick={() => navigate(`/builder/${activeForm?.id ?? ""}`)}>Edit form</button>
    ) : null;

  return (
    <AppShell
      route={route}
      forms={workspaceState.forms}
      activeFormId={activeForm?.id}
      settings={workspaceState.settings}
      title={title}
      subtitle={subtitle}
      actions={actions}
      onNavigate={navigate}
    >
      {route.kind === "dashboard" && <DashboardPage forms={workspaceState.forms} onNavigate={navigate} onCreate={() => workspaceState.actions.createForm().then((formId) => navigate(`/builder/${formId}`))} />}
      {route.kind === "builder" && <BuilderPage formId={route.formId} onNavigate={navigate} />}
      {route.kind === "form" && <ResponderPage formId={route.formId ?? activeForm?.id ?? ""} onNavigate={navigate} />}
      {route.kind === "results" && <ResultsPage formId={route.formId ?? activeForm?.id ?? ""} />}
      {route.kind === "settings" && <SettingsPage />}
      {!workspaceState.forms.length && route.kind === "dashboard" ? (
        <EmptyState title="No forms yet" description="Hydration is still loading or the workspace is empty." />
      ) : null}
    </AppShell>
  );
}
