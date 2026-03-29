# TallyWeb Roadmap

This file is the working checklist for the delivery plan. It tracks progress milestone by milestone and keeps the scope grounded in the browser-only, GitHub-Pages-deployable plan.

## Milestone 1 - Platform and Workspace Shell

### Done
- [x] Replace the old static prototype with a React + Vite + TypeScript app.
- [x] Configure GitHub Pages deployment and a hash-based route strategy.
- [x] Add PWA build output and GitHub Pages-friendly base path handling.
- [x] Create the app shell, top bar, sidebar, and page layout.
- [x] Implement dashboard, builder, responder, results, and settings surfaces.
- [x] Wire browser storage for workspace state and form persistence.
- [x] Add the live GitHub Pages deployment workflow.
- [x] Polish shell spacing so the app no longer feels overly loose or broken.
- [x] Tighten shell copy so the workspace reads like a real product instead of a placeholder.

### Pending
- [ ] Verify live GitHub Pages behavior after the latest UI polish and cache reset.
- [ ] Remove any leftover prototype-era assumptions in the shell.
- [ ] Do a final responsive pass on dashboard, builder, and results if any breakpoints still look off.

### Exit Criteria
Milestone 1 is complete when the shell is stable, deployable, and clean enough that the next milestone can start without revisiting the foundation.

## Milestone 2 - Builder and Responder MVP

### Not started
- [ ] Real block insertion in the builder.
- [ ] Inline block editing.
- [ ] Reorder, duplicate, and delete blocks.
- [ ] Real form rendering in the responder.
- [ ] Required-field validation.
- [ ] Local response saving.
- [ ] Shareable form schema loading.
- [ ] Results connected to real responses.

### Exit Criteria
Milestone 2 is complete when a user can create a form, fill it out, save responses locally, and see those responses in results.

## Milestone 3 - Full Field Library

### Not started
- [ ] Add `phone`, `website`, `time`, `date_range`, `ranking`, `opinion_scale`, `matrix`, and `input_table`.
- [ ] Add `image`, `video`, `spacer`, `signature`, `calculated_field`, `file_upload`, and `payment`.
- [ ] Add richer configuration UI for advanced options.

## Milestone 4 - Logic and Multi-Page Forms

### Not started
- [ ] Add page breaks and page model support.
- [ ] Build logic CRUD UI.
- [ ] Implement conditional show/hide and page jump behavior.
- [ ] Add progress indicators and page navigation flow.

## Milestone 5 - Sharing, Results, and Adapters

### Not started
- [ ] Add URL schema sharing and compression.
- [ ] Add export/import and share modal polish.
- [ ] Add response filtering, detail view, and CSV/JSON export.
- [ ] Add external adapters like Airtable, Google Sheets, Formspree, and JSONBin.

## Milestone 6 - Themes, Embeds, Analytics, Offline

### Not started
- [ ] Add preset themes and theme editor.
- [ ] Add embed modes and sharing helpers.
- [ ] Add analytics dashboards and event logging.
- [ ] Add offline queueing, templates, and final accessibility/performance hardening.
