# AI Product Enrichment POC - React UI

A comprehensive React TypeScript application for demonstrating AI-powered product enrichment capabilities with confidence scoring, multi-value attribution, trend discovery, and human-in-the-loop feedback mechanisms.

## 🎯 Features

### Core Enrichment Capabilities
- **Single Product Enrichment**: Enrich individual products with AI-generated attributes
- **Batch Processing**: Process up to 1,000+ products efficiently
- **Multi-Value Attribution**: Support for percentage-based color/pattern breakdown
- **Confidence Scoring**: Every attribute/value pair includes 0-100 confidence score
- **Trend Discovery**: AI-identified trending attributes based on market insights
- **Gap Analysis**: Identifies visually present attributes missing from allowable list

### Taxonomy Management
- **Contextual Mapping**: Category and Gender-specific attribute suggestions
- **Mandatory Field Validation**: Ensures required attributes are populated
- **Allowable Values Restriction**: Adheres to retailer's master attribute list
- **New Suggestion Flagging**: Marks trend-based suggestions separately

### Threshold Management
- **Auto-Accept**: Confidence ≥ 90% (automatic acceptance)
- **Human Review**: Confidence 70-90% (requires manual review)
- **Manual Review**: Confidence < 70% (requires verification)

### Feedback & Retraining
- **Feedback Loop**: Collect corrections on enrichment results
- **Model Retraining**: Enable procedural feedback-based retraining
- **Accuracy Tracking**: Monitor performance metrics over time

### Export & Analytics
- **Multiple Formats**: Export as CSV or JSON
- **Accuracy Reports**: Compare AI-generated tags against ground truth
- **Trend Reports**: Insights on newly discovered attributes
- **Confidence Filtering**: Export only results above minimum threshold

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Python backend running at `http://127.0.0.1:8000`

### Installation

1. **Navigate to project directory**
```bash
cd ai-product-enrichment-ui
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Header.tsx
│   ├── ProductCard.tsx
│   ├── AttributeDisplay.tsx
│   ├── AttributeEditor.tsx
│   ├── EnrichmentForm.tsx
│   ├── SettingsDialog.tsx
│   ├── FeedbackForm.tsx
│   └── BatchProcessingDialog.tsx
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── EnrichmentPage.tsx
│   ├── BatchPage.tsx
│   ├── ReportsPage.tsx
│   └── SettingsPage.tsx
├── services/
│   └── api.ts          # API client & endpoints
├── stores/
│   └── productStore.ts # Zustand state management
├── types/
│   └── index.ts        # TypeScript type definitions
├── styles/
│   └── theme.ts        # Material-UI theme configuration
├── App.tsx             # Main application component
└── main.tsx            # Entry point
```

## 🔧 Configuration

### API Connection
The application connects to the backend API at `http://127.0.0.1:8000`. This can be configured in [vite.config.ts](vite.config.ts).

### Threshold Settings
Configure confidence thresholds in the **Settings** page or programmatically:

```typescript
useProductStore.setAutoAcceptThreshold(90);
useProductStore.setReviewThreshold(70);
```

### Theme Customization
Modify the Material-UI theme in [src/styles/theme.ts](src/styles/theme.ts).

## 📊 Pages & Features

### 1. Dashboard
- Overview of enrichment status
- Key metrics (completed, pending, failed products)
- Average confidence scores
- Trend suggestion count
- Quick action buttons

### 2. Enrich Single Product
- Product ID, category, gender input
- Image URL input
- Real-time enrichment processing
- Tabbed results view:
  - **Results Tab**: Enriched attributes with confidence scores
  - **Detailed Analysis Tab**: In-depth attribute breakdown
  - **Feedback Tab**: Collect human corrections

### 3. Batch Processing
- CSV upload interface
- Configurable threshold settings
- Real-time progress tracking
- Pause/resume functionality
- Job history and status monitoring
- Error handling and reporting

### 4. Reports & Analytics
- Enriched data export (CSV/JSON)
- Accuracy report download
- Trend report download
- Confidence distribution visualization
- API integration status

### 5. Settings
- API configuration
- Threshold management
- Privacy & security settings
- UI preferences

## 🔌 API Integration

### Key Endpoints

```typescript
// Single Product Enrichment
POST /api/v1/enrich/single
Body: { productId, imageUrl, category, gender, currentAttributes? }

// Batch Processing
POST /api/v1/enrich/batch
Body: { products: [], autoAcceptThreshold?, reviewThreshold? }

// Submit Feedback
POST /api/v1/feedback/submit
Body: { productId, attributeName, userFeedback, correctValue?, notes? }

// Get Taxonomy
GET /api/v1/taxonomy/attributes

// Export Data
POST /api/v1/export/enriched
GET /api/v1/export/accuracy-report
GET /api/v1/export/trend-report
```

See [API Documentation](http://127.0.0.1:8000/docs) for complete details.

## 📦 Data Flow

### Single Product Enrichment Flow
1. User provides product details (ID, image URL, category, gender)
2. Form submitted to backend API
3. AI processes product image
4. Attributes generated with confidence scores
5. Results displayed with trend suggestions
6. User can provide feedback for retraining

### Batch Processing Flow
1. User uploads CSV with product data
2. Sets confidence thresholds
3. Batch job starts processing
4. Real-time progress tracking
5. Automatic results export on completion

## 🎨 Component Highlights

### AttributeDisplay
- Shows enriched attributes with confidence scores
- Multi-value percentage breakdowns
- Trend suggestion display
- Gap analysis indicators
- Color-coded confidence levels

### EnrichmentForm
- Form validation
- Loading states
- Error handling
- Toast notifications

### SettingsDialog
- Confidence threshold sliders
- Feature toggles
- Settings persistence

### FeedbackForm
- Three feedback types: Correct/Partial/Incorrect
- Optional correction input
- Additional notes field
- Timestamp tracking

## 📈 State Management

The application uses Zustand for state management:

```typescript
const store = useProductStore();
store.setProducts([...]);
store.setAutoAcceptThreshold(90);
store.setError(null);
```

## 🧪 Error Handling

- API error responses are caught and displayed
- Toast notifications for user feedback
- Error states in form components
- Graceful fallbacks for failed requests

## 🔐 Security Considerations

- HTTPS for API communication
- No credentials stored in local storage
- XSS protection via React's built-in sanitization
- CORS configured for backend API

## 📱 Responsive Design

- Mobile-first approach
- Drawer navigation on mobile devices
- Responsive grid layouts
- Touch-friendly interactive elements
- Optimized for tablets and desktops

## 🚀 Performance Optimizations

- Lazy component loading
- Memoized components
- Efficient re-rendering with Zustand
- Optimized Material-UI theme
- Code splitting via Vite

## 📚 Technologies

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Material-UI (MUI)**: Component library
- **Zustand**: State management
- **Axios**: HTTP client
- **React Router**: Navigation
- **React Hot Toast**: Notifications

## 🐛 Debugging

Enable browser DevTools:
1. Press `F12` or `Ctrl+Shift+I`
2. Check Console for errors
3. Use React DevTools extension for component inspection
4. Network tab to monitor API calls

## 📖 API Documentation

Full API documentation available at: `http://127.0.0.1:8000/docs`

## 🤝 Integration with EPIM

The exported data format is compatible with EPIM systems:

```json
{
  "productId": "PROD-001",
  "attributes": [
    {
      "name": "Color",
      "values": [
        {
          "value": "Black",
          "percentage": 60,
          "confidence": 95
        }
      ],
      "isMandatory": true
    }
  ],
  "overallConfidence": 92,
  "trendSuggestions": []
}
```

## 📞 Support

For issues or questions:
1. Check the backend API documentation
2. Review browser console for errors
3. Verify API connection at Settings page
4. Contact development team

## 📄 License

Proprietary - AI Product Enrichment POC

## 🎓 Training & Feedback

The system supports continuous improvement through:
- User feedback collection
- Model retraining procedures
- Accuracy tracking
- Performance metrics

For training data export: `GET /api/v1/feedback/training-dataset`
