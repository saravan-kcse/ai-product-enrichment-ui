const axios = require('axios');
const fs = require('fs');
(async () => {
  try {
    const resp = await axios.get('http://127.0.0.1:8000/api/v1/allowable-lists/preview', { params: { upload_id: '3' }, timeout: 30000 });
    fs.writeFileSync('scripts/backend_preview.json', JSON.stringify(resp.data, null, 2));
    console.log('Wrote scripts/backend_preview.json');
  } catch (e) {
    console.error('Request failed', e.message);
    if (e.response && e.response.data) {
      fs.writeFileSync('scripts/backend_preview_error.json', JSON.stringify(e.response.data, null, 2));
      console.log('Wrote scripts/backend_preview_error.json');
    }
  }
})();
