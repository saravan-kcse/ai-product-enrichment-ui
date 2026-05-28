# Quick Start Guide

## 🚀 Get Running in 2 Minutes

### Prerequisites
- ✅ Backend API running at `http://127.0.0.1:8000`
- ✅ Node.js 16+ installed
- ✅ npm installed

### Start Here

```bash
# 1. Install dependencies (takes ~2-3 min first time)
npm install

# 2. Start the development server
npm run dev

# 3. Open browser to http://localhost:3000
```

**Done!** The app is now running.

---

## 📋 First Time Setup Checklist

- [ ] Verify backend is running: `curl http://127.0.0.1:8000/health`
- [ ] Run `npm install` (first time only)
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000 in browser
- [ ] Navigate to Settings page
- [ ] Verify "API Connected" shows green checkmark

---

## 💡 Quick Tips

### Testing the App

**1. Test Single Product Enrichment**
- Go to "Enrich Product"
- Fill in form with:
  - Product ID: `TEST-001`
  - Category: `Dress`
  - Gender: `Womens`
  - Image URL: Any valid image URL
- Click "Enrich Product"
- Wait 2-5 seconds for results

**2. Test Batch Processing**
- Go to "Batch Processing"
- Click "Start New Batch"
- Follow the wizard

**3. Test Reports**
- Go to "Reports"
- Click any export button

### Useful Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for errors
npm run lint
```

### Access Links

- 🎨 **UI App**: http://localhost:3000
- 📚 **API Docs**: http://127.0.0.1:8000/docs
- 🔧 **Settings**: http://localhost:3000/settings
- 📊 **Reports**: http://localhost:3000/reports

---

## 🐛 Troubleshooting

### Backend Not Running?
```bash
# Make sure backend is accessible
curl http://127.0.0.1:8000/health
# Should return: {"status": "healthy"}
```

### Port 3000 Already in Use?
```bash
# Use a different port
npm run dev -- --port 3001
```

### Clear Everything and Restart
```bash
# Remove dependencies
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Start fresh
npm run dev
```

---

## 📖 Documentation

- **Full Setup Guide**: [SETUP.md](SETUP.md)
- **Requirements Implementation**: [REQUIREMENTS.md](REQUIREMENTS.md)
- **Main Documentation**: [README.md](README.md)

---

## 🎯 Main Features

| Feature | Location | How to Use |
|---------|----------|-----------|
| 📊 Dashboard | Home page | Overview of all enrichment activities |
| 🎨 Single Product | Enrich Product | Enrich one product at a time |
| 📁 Batch Process | Batch Processing | Process 100s-1000s of products |
| 📈 Reports | Reports | Export and analyze results |
| ⚙️ Settings | Settings | Configure thresholds & API |

---

## ✨ Key Workflows

### Enrich a Product (2 min)
1. Click "Enrich Product" in sidebar
2. Enter product details
3. Click "Enrich Product"
4. View results in tabs
5. (Optional) Provide feedback

### Export Data (1 min)
1. Click "Reports" in sidebar
2. Click "Configure & Export Data"
3. Select format (CSV/JSON)
4. Click "Export"
5. File downloads

### Monitor Progress (Real-time)
1. Go to Dashboard
2. See live stats
3. Check Batch Processing for ongoing jobs
4. View progress bars

---

## 💻 System Requirements

| Item | Minimum | Recommended |
|------|---------|-------------|
| RAM | 2GB | 4GB+ |
| CPU | Dual-core | Quad-core+ |
| Browser | Chrome 90+ | Latest Chrome/Firefox |
| Node.js | 16 | 18+ |
| Disk Space | 500MB | 1GB |

---

## 🔗 Next Steps

1. ✅ **Get it running** (You're here!)
2. 📖 **Read** [REQUIREMENTS.md](REQUIREMENTS.md) to understand features
3. 🧪 **Test** all workflows
4. 📊 **Export data** and verify format
5. 🚀 **Deploy** to production

---

## 🆘 Need Help?

1. **Check Console**: Press F12 → Console tab
2. **Verify Backend**: `curl http://127.0.0.1:8000/health`
3. **Review Logs**: Check browser DevTools
4. **Read Docs**: See [SETUP.md](SETUP.md)
5. **Check API**: Visit http://127.0.0.1:8000/docs

---

## 📱 Mobile/Tablet Support

✅ Fully responsive
✅ Touch-friendly
✅ Mobile navigation drawer
✅ Optimized layouts

---

## 🎓 Learning Resources

- React: https://react.dev
- Material-UI: https://mui.com
- TypeScript: https://www.typescriptlang.org
- Vite: https://vitejs.dev

---

**Happy Enriching! 🎉**

For detailed information, see the full documentation in [README.md](README.md) or [REQUIREMENTS.md](REQUIREMENTS.md).
