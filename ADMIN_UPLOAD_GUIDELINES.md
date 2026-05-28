# Admin Upload Guidelines

Purpose
- Describe how admins should prepare and submit allowable-list Excel files for preview and ingestion.

Accepted formats
- `xlsx`, `xls` only; single workbook containing multiple sheets preserved in upload order.

Sheet layout
- Each sheet represents a category/section; keep sheet order as desired in final DB.

Header rows
- Provide two header rows per column when applicable (`gender` and `product_type`) and include a stable `column_key` identifier for each column.

Attribute sections
- Group rows by attribute (section header row) and include the attribute name in the first column for each section.

Filename & metadata
- Use a meaningful filename; backend returns an `upload_id` used for preview retrieval (`?upload_id=...`).

Size limits & performance
- Keep files reasonably sized; for very large files (>10k rows) split into multiple uploads.

Upload endpoint
- Use `POST /api/v1/allowable-lists/upload`.
- Do NOT set the `Content-Type` header manually; let the browser set multipart boundaries.

Client behavior
- After upload backend returns a preview and `upload_id`; the UI navigates to preview page which loads preview from `GET /api/v1/allowable-lists/preview?upload_id=...`.

Pre-upload checks
- Remove duplicates, ensure consistent attribute names, normalize casing where possible, and validate that expected header columns exist.

Error handling
- On upload errors surface backend-provided errors to the admin with guidance (row/sheet reference if available).

Recommended UX
- Show upload progress spinner, display total entries and validation error summary, and provide a “Download preview JSON” option.
