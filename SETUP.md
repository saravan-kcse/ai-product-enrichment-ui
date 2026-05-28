# Setup & Installation Guide

## Quick Start (5 minutes)

### 1. Prerequisites Check
```bash
# Verify Node.js version (16+)
node --version

# Verify npm version (8+)
npm --version

# Verify backend is running
curl http://127.0.0.1:8000/health
```

### 2. Install & Run
```bash
# Navigate to project
cd ai-product-enrichment-ui

# Install dependencies (takes 2-3 minutes)
npm install

# Start development server
npm run dev
```

The app opens automatically at `http://localhost:3000`

## Detailed Setup Steps

### Step 1: Install Node.js
If you don't have Node.js installed:
1. Download from https://nodejs.org/ (LTS version 18+)
2. Follow installation wizard
3. Verify: `node --version` and `npm --version`

### Step 2: Clone/Navigate to Project
```bash
cd ai-product-enrichment-ui
```

### Step 3: Install Dependencies
```bash
npm install
```

This installs:
- React & React DOM
- Material-UI components
- TypeScript
- Vite build tools
- Axios HTTP client
- Zustand state management
- React Router
- React Hot Toast

Dependencies are in [package.json](package.json)

### Step 4: Verify Backend Connection
Before starting the UI, ensure your Python backend is running:

```bash
# Test backend connectivity
curl -X GET http://127.0.0.1:8000/health
```

Expected response:
```json
{"status": "healthy"}
```

### Step 5: Start Development Server
```bash
npm run dev
```

Output should show:
```
  VITE v4.4.0  ready in 234 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

### Step 6: Access the Application
Open browser and navigate to `http://localhost:3000`

## Environment Configuration

### API Backend URL
The backend URL is configured in `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true
    }
  }
}
```

To change the backend URL:
1. Edit `vite.config.ts`
2. Update the `target` URL
3. Restart dev server

## Common Issues & Troubleshooting

### Issue: Port 3000 Already in Use
```bash
# On Windows - find process on port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F

# Or use different port
npm run dev -- --port 3001
```

### Issue: API Connection Failed
```bash
# Verify backend is running
curl http://127.0.0.1:8000/docs

# Check firewall settings
# Ensure port 8000 is not blocked
```

### Issue: Dependencies Installation Failed
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: TypeScript Errors
```bash
# Rebuild TypeScript
npm run build

# Check for syntax errors
npx tsc --noEmit
```

## Development Workflow

### Running Development Server
```bash
npm run dev
```
- Hot module reloading enabled
- Source maps available
- Detailed error messages

### Building for Production
```bash
npm run build
```

Outputs optimized build to `dist/` folder:
- Minified JavaScript
- CSS optimized
- Assets optimized

### Preview Production Build
```bash
npm run build
npm run preview
```

## Directory Structure

```
ai-product-enrichment-ui/
├── src/
│   ├── components/        # Reusable React components
│   ├── pages/             # Page components
│   ├── services/          # API client
│   ├── stores/            # State management
│   ├── types/             # TypeScript definitions
│   ├── styles/            # Theme configuration
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── index.html             # HTML template
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite configuration
├── README.md              # Documentation
└── SETUP.md               # This file
```

## Initial Configuration

### 1. Set Confidence Thresholds
Navigate to **Settings** page:
- Auto-Accept: 90%
- Review: 70%

### 2. Verify API Connection
Check API status at Settings → API Configuration

### 3. Load Taxonomy (Optional)
If needed, load product taxonomy via API

## Testing the Application

### Test Single Product Enrichment
1. Go to "Enrich Product" page
2. Enter:
   - Product ID: `TEST-001`
   - Category: `Dress`
   - Gender: `Womens`
   - Image URL: Any valid image URL
3. Click "Enrich Product"
4. View results

### Test Batch Processing
1. Go to "Batch Processing" page
2. Click "Start New Batch"
3. Provide CSV URL or file
4. Configure thresholds
5. Submit batch

### Test Reports
1. Go to "Reports" page
2. Click "Configure & Export Data"
3. Select format (CSV/JSON)
4. Download

## Performance Tips

### Optimize Build
```bash
npm run build
# Generates production-optimized bundle
```

### Enable Compression
Configure your web server to enable gzip compression

### Caching
Browser caching is automatically handled by Vite

## Production Deployment

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Deploy to Custom Server
```bash
# Build
npm run build

# Upload dist/ folder to your server
# Configure reverse proxy to backend API
```

## Monitoring & Logs

### Browser Console
- Right-click → Inspect → Console tab
- Shows errors, warnings, logs

### Network Tab
- Right-click → Inspect → Network tab
- Monitor API calls
- Check response times

### Application Tab
- View application state
- Inspect components
- Check storage

## Support Resources

- **API Docs**: http://127.0.0.1:8000/docs
- **React Docs**: https://react.dev
- **Material-UI**: https://mui.com
- **TypeScript**: https://www.typescriptlang.org
- **Vite**: https://vitejs.dev

## Next Steps

1. ✅ Complete setup (you're here!)
2. 📖 Read main [README.md](README.md)
3. 🎯 Start enriching products
4. 📊 Monitor reports
5. 🔄 Collect feedback for model retraining

## Getting Help

If you encounter issues:

1. **Check logs**: Browser console (F12)
2. **Verify backend**: `curl http://127.0.0.1:8000/health`
3. **Check configuration**: Review `vite.config.ts` and `src/services/api.ts`
4. **Clear cache**: `npm cache clean --force`
5. **Reinstall**: `rm -rf node_modules && npm install`

## Additional Commands

```bash
# Format code
npm run lint

# Type check
npx tsc --noEmit

# View all scripts
npm run
```

## Performance Metrics

Typical performance:
- Page load: < 2 seconds
- Single product enrichment: 2-5 seconds (backend dependent)
- Batch processing: Varies by product count
- API response: < 500ms average

## Security Checklist

✅ HTTPS recommended for production
✅ API credentials handled securely
✅ No sensitive data in localStorage
✅ CORS configured
✅ XSS protection via React

---

**Questions?** Review the main [README.md](README.md) or contact the development team.
