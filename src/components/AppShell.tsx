import type { ReactNode } from "react";
import type { FormListItem, WorkspaceSettings } from "../domain/types";
import type { Route } from "../lib/hash-route";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({
  route,
  forms,
  activeFormId,
  settings,
  title,
  subtitle,
  actions,
  onNavigate,
  children
}: {
  route: Route;
  forms: FormListItem[];
  activeFormId?: string | null;
  settings: WorkspaceSettings;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  onNavigate: (path: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="app-shell" data-route={route.kind}>
      <Sidebar route={route} forms={forms} settings={settings} activeFormId={activeFormId} onNavigate={onNavigate} />
      <div className="app-content">
        <TopBar title={title} subtitle={subtitle} actions={actions} />
        <main className="page-wrap">{children}</main>
      </div>
    </div>
  );
}
