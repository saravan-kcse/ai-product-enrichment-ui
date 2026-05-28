import React, { useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Grid,
  TextField,
  Alert,
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Download,
  Assessment,
  TrendingUp,
  CheckCircle,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

interface ExportStats {
  enrichedProducts: number;
  averageConfidence: number;
  lastExportDate: string;
  totalTrendSuggestions: number;
}

export const ReportsPage: React.FC = () => {
  const [stats, setStats] = useState<ExportStats>({
    enrichedProducts: 342,
    averageConfidence: 87.5,
    lastExportDate: new Date().toISOString().split('T')[0],
    totalTrendSuggestions: 45,
  });

  const [exporting, setExporting] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [includeScores, setIncludeScores] = useState(true);
  const [includeTrends, setIncludeTrends] = useState(true);
  const [minConfidence, setMinConfidence] = useState(0);

  const handleExportEnrichedData = async () => {
    setExporting(true);
    try {
      // Simulate export
      setTimeout(() => {
        toast.success(`Data exported as ${exportFormat.toUpperCase()}!`);
        setExporting(false);
        setShowExportDialog(false);
      }, 2000);
    } catch (error) {
      toast.error('Failed to export data');
      setExporting(false);
    }
  };

  const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    description?: string;
  }> = ({ icon, label, value, description }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'primary.light',
              color: 'primary.main',
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              {label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            {description && (
              <Typography variant="caption" color="textSecondary">
                {description}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Reports & Analytics
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CheckCircle />}
            label="Enriched Products"
            value={stats.enrichedProducts}
            description="Successfully processed"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Assessment />}
            label="Avg Confidence"
            value={`${stats.averageConfidence}%`}
            description="Quality indicator"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUp />}
            label="Trend Suggestions"
            value={stats.totalTrendSuggestions}
            description="New market insights"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<Download />}
            label="Last Export"
            value={stats.lastExportDate}
            description="Recent activity"
          />
        </Grid>
      </Grid>

      {/* Export Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Export Enriched Data
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Export all enriched product data for integration with your EPIM
            system
          </Alert>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => setShowExportDialog(true)}
            >
              Configure & Export Data
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() =>
                toast.success('Accuracy report downloaded!')
              }
            >
              Download Accuracy Report
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() =>
                toast.success('Trend report downloaded!')
              }
            >
              Download Trend Report
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Confidence Distribution
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">Auto-Accept (≥90%)</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      65%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={65} />
                </Box>
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">
                      Human Review (70-90%)
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      30%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={30} />
                </Box>
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">Manual Review (&lt;70%)</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      5%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={5} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                API Integration Status
              </Typography>
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.5,
                    bgcolor: 'success.light',
                    borderRadius: 1,
                  }}
                >
                  <CheckCircle sx={{ color: 'success.main' }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      API Connected
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      http://127.0.0.1:8000
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  RESTful API endpoints are ready for EPIM system integration
                </Typography>
                <Button variant="outlined" fullWidth>
                  View API Documentation
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Configure Export</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <TextField
              select
              label="Format"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
              SelectProps={{ native: true }}
              fullWidth
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </TextField>

            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Minimum Confidence: {minConfidence}%
              </Typography>
              <TextField
                type="number"
                inputProps={{ min: 0, max: 100 }}
                value={minConfidence}
                onChange={(e) => setMinConfidence(parseInt(e.target.value))}
                fullWidth
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>Include confidence scores: {includeScores ? '✓' : '✗'}</Typography>
              <Button
                size="small"
                variant={includeScores ? 'contained' : 'outlined'}
                onClick={() => setIncludeScores(!includeScores)}
              >
                {includeScores ? 'Included' : 'Excluded'}
              </Button>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>Include trend suggestions: {includeTrends ? '✓' : '✗'}</Typography>
              <Button
                size="small"
                variant={includeTrends ? 'contained' : 'outlined'}
                onClick={() => setIncludeTrends(!includeTrends)}
              >
                {includeTrends ? 'Included' : 'Excluded'}
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>Cancel</Button>
          <Button
            onClick={handleExportEnrichedData}
            variant="contained"
            disabled={exporting}
          >
            {exporting ? <CircularProgress size={20} /> : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
