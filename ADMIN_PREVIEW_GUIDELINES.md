# Admin Preview Guidelines

Purpose
- Let admins review, correct, add, delete and save allowable entries before persisting to DB.

Loading preview
- Fetch preview from `GET /api/v1/allowable-lists/preview?upload_id=<id>`; do not rely on client-side sessionStorage.

Primary controls
- Sheet selector (preserves original sheet order) and attribute filter (shows only sections for a selected attribute).

Header display
- Render two header rows — `gender` (top) and `product_type` (below) — maintaining `column_key` alignment.

Row actions
- Toggle: Checkbox per cell toggles allowed/disallowed — each toggle submits audit via `POST /api/v1/feedback/submit` and updates preview state.
- Add row: Provide an "Add Row" flow to choose target sheet/section and column cells; added rows should create a feedback entry and update preview state.
- Delete row: Confirm destructive deletes; delete should submit a feedback entry and remove the row from preview state.

Save flow
- `Save Changes` calls `POST /api/v1/allowable-lists/save-preview` with `{ upload_id, preview }`; show success/failure details and keep an undo/rollback option if backend supports it.

Audit & history
- Edits must be auditable — link each change to a feedback entry and surface a changelog view `GET /api/v1/allowable-lists/change-history` that can jump back to the preview row via query params.

Validation
- Block save if required schema problems exist (missing attribute names, header column mismatches); show per-sheet validation hints.

UX polish
- Sticky column headers, highlight row when navigated from change-history, downloadable preview JSON, and a clear “Re-upload original file” option.

Permissions & safety
- Only admin roles should see save/approve buttons; show who made each correction and a timestamp in the change history.

Frontend references
- Implementation lives in `src/pages/AdminAllowableUpload.tsx` and `src/pages/AdminAllowablePreview.tsx`.

APIs referenced
- `POST /api/v1/allowable-lists/upload`
- `GET /api/v1/allowable-lists/preview?upload_id=...`
- `POST /api/v1/allowable-lists/save-preview`
- `POST /api/v1/feedback/submit`
- `GET /api/v1/allowable-lists/change-history`
