import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminAllowableUpload from './pages/AdminAllowableUpload';
import AdminAllowablePreview from './pages/AdminAllowablePreview';
import AllowableChangeHistory from './pages/AllowableChangeHistory';
import AdminUploadGuidelines from './pages/AdminUploadGuidelines';
import AdminPreviewGuidelines from './pages/AdminPreviewGuidelines';
import { ThemeProvider, createTheme, CssBaseline, Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, useMediaQuery, Button } from '@mui/material';
import { Dashboard as DashboardIcon, FileUpload as FileUploadIcon, Description as DescriptionIcon, HelpOutline as HelpOutlineIcon, ErrorOutline } from '@mui/icons-material';
import { Header } from './components';
import { Dashboard, DataInputPage, EnrichmentPage } from './pages';
import { themeConfig } from './styles/theme';
import toast, { Toaster } from 'react-hot-toast';

const theme = createTheme(themeConfig);

// Global error boundary to catch uncaught render errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: 3,
            p: 4,
            bgcolor: 'background.default',
          }}
        >
          <ErrorOutline sx={{ fontSize: 64, color: 'error.main' }} />
          <Typography variant="h5" fontWeight="bold">
            Something went wrong
          </Typography>
          <Typography variant="body2" color="textSecondary" textAlign="center" maxWidth={400}>
            {this.state.errorMessage || 'An unexpected error occurred.'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              this.setState({ hasError: false, errorMessage: '' });
              window.location.href = '/';
            }}
          >
            Go to Dashboard
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { label: 'Enrichment', icon: <FileUploadIcon />, path: '/enrichment' },
  { label: 'Upload Guidelines', icon: <DescriptionIcon />, path: '/admin/guidelines/upload' },
  { label: 'Preview Guidelines', icon: <HelpOutlineIcon />, path: '/admin/guidelines/preview' },
];

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleExport = () => {
    toast.success('Export started! Check your downloads folder.');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Header */}
          <Header onExportClick={handleExport} />

          {/* Main Content Area */}
          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Sidebar Navigation */}
            {!isMobile && (
              <Drawer
                variant="permanent"
                sx={{
                  width: 280,
                  '& .MuiDrawer-paper': {
                    width: 280,
                    boxSizing: 'border-box',
                    top: 'auto',
                    height: '100%',
                  },
                }}
              >
                <Toolbar variant="dense" />
                <List>
                  {navItems.map((item) => (
                    <ListItem
                      button
                      key={item.path}
                      href={item.path}
                      component="a"
                      sx={{
                        '&:hover': {
                          bgcolor: 'primary.light',
                          '& .MuiListItemIcon-root': {
                            color: 'primary.main',
                          },
                        },
                      }}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItem>
                  ))}
                </List>
              </Drawer>
            )}

            {/* Mobile Drawer */}
            {isMobile && (
              <>
                <Drawer
                  anchor="left"
                  open={drawerOpen}
                  onClose={() => setDrawerOpen(false)}
                >
                  <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      Navigation
                    </Typography>
                  </Toolbar>
                  <List>
                    {navItems.map((item) => (
                      <ListItem
                        button
                        key={item.path}
                        href={item.path}
                        component="a"
                        onClick={() => setDrawerOpen(false)}
                      >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                      </ListItem>
                    ))}
                  </List>
                </Drawer>
              </>
            )}

            {/* Main Content */}
            <Box
              component="main"
              sx={{
                flex: 1,
                overflow: 'auto',
                bgcolor: 'background.default',
              }}
            >
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/admin/allowable-upload" element={<AdminAllowableUpload />} />
                  <Route path="/admin/allowable-preview" element={<AdminAllowablePreview />} />
                  <Route path="/admin/guidelines/upload" element={<AdminUploadGuidelines />} />
                  <Route path="/admin/guidelines/preview" element={<AdminPreviewGuidelines />} />
                  <Route path="/admin/allowable-change-history" element={<AllowableChangeHistory />} />
                  <Route path="/enrichment" element={<DataInputPage />} />
                  <Route path="/enrich" element={<EnrichmentPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ErrorBoundary>
            </Box>
          </Box>
        </Box>

      </Router>
    </ThemeProvider>
  );
}

export default App;
