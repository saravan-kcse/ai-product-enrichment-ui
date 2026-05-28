const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const wb = XLSX.readFile(path.join(__dirname, '../src/UST Allowable Guide.xlsx'));
const out = {};
wb.SheetNames.forEach((name) => {
  const sheet = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: null });
  out[name] = data;
});
fs.writeFileSync(path.join(__dirname, 'ust_preview.json'), JSON.stringify(out, null, 2));
console.log('Wrote scripts/ust_preview.json');
