const fs = require('fs');
const path = require('path');
const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'backend_preview.json'),'utf8'));
const previewArray = Array.isArray(raw) ? raw : (Array.isArray(raw.preview) ? raw.preview : null);
if (!previewArray) { console.error('No preview array'); process.exit(1); }
const out = previewArray.map((s, sheetIdx) => {
  const sheetName = s.sheet_name || s.product_type || s.sheetName || `Sheet ${sheetIdx}`;
  const genders = Array.isArray(s.genders) ? s.genders : [];
  const headers = genders.map((g, idx) => ({ gender: g, product_type: g, column_key: `${sheetName}_${g}_${idx}` }));
  const sections = (Array.isArray(s.sections) ? s.sections : []).map((sec, secIdx) => ({
    attribute_name: sec.attribute_name || sec.attributeName || sec.name || `Section ${secIdx}`,
    rows: (Array.isArray(sec.rows) ? sec.rows : []).map((r, rowIdx) => {
      const allowed = Array.isArray(r.allowed_genders) ? r.allowed_genders : [];
      const cells = {};
      headers.forEach((h) => { cells[h.column_key] = allowed.includes(h.product_type); });
      return { attribute_value: r.attribute_value || r.value || '', cells };
    })
  }));
  return { sheet_name: sheetName, category: s.category || null, headers, sections };
});
fs.writeFileSync(path.join(__dirname,'normalized_preview.json'), JSON.stringify(out, null, 2));
console.log('Wrote scripts/normalized_preview.json');
