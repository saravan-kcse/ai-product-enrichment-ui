import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip,
  Tabs,
  Tab,
  TextField,
  IconButton,
  Switch,
  FormControlLabel,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload,
  FolderOpen,
  EditNote,
  Download,
  CheckCircle,
  Close,
  Feedback as FeedbackIcon,
  Star,
  Delete,
  Add,
  RuleFolder,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { enrichmentAPI } from '../services/api';
import { DiscoveredAttributesReview } from '../components';
import { FolderUploadInput, GlobalRule } from '../types';
import toast from 'react-hot-toast';

type InputMethod = 'single' | 'csv' | 'folder' | null;

interface UploadProgress {
  isUploading: boolean;
  progress: number;
  fileName?: string;
  jobId?: string;
  downloadUrl?: string;
  csvBlob?: Blob;
  error?: string;
  isComplete?: boolean;
}

export const DataInputPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<InputMethod>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [currentDataSource, setCurrentDataSource] = useState<'csv' | 'folder'>('csv');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
  });
  const [batchFeedback, setBatchFeedback] = useState({
    productId: '',
    gender: '',
    notes: '',
    userId: 'system',
    isSubmitting: false,
    feedbackSubmitted: false,
  });

  

  

  const handleMethodSelect = (method: InputMethod) => {
    setSelectedMethod(method);
    if (method === 'single') {
      navigate('/enrich');
    } else {
      setShowDialog(true);
    }
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadProgress({ 
      isUploading: true, 
      progress: 0, 
      fileName: file.name,
      isComplete: false,
      error: undefined,
    });

    try {
      // Simulate progress while uploading (0-90%)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + Math.random() * 15, 90),
        }));
      }, 1000);

      // Upload CSV - receives enriched CSV file directly
      // This can take a long time (potentially hours)
      const csvBlob = await enrichmentAPI.enrichFromCSV(file);

      clearInterval(progressInterval);
      
      // Upload complete - set to 100%
      setUploadProgress((prev) => ({
        ...prev,
        progress: 100,
        isUploading: false,
        isComplete: true,
        csvBlob: csvBlob,
      }));

      toast.success('✅ CSV enriched successfully! File is ready to download.');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Failed to enrich CSV';
      
      setUploadProgress((prev) => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
        isComplete: false,
      }));
      
      toast.error(errorMessage);
    }
  };

  const handleDownloadCSV = () => {
    if (uploadProgress.csvBlob && uploadProgress.fileName) {
      const url = window.URL.createObjectURL(uploadProgress.csvBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `enriched-${uploadProgress.fileName}`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success('Download started!');
    }
  };

  const pollJobStatus = async (jobId: string) => {
    // This method is no longer needed as CSV enrichment returns results directly
    return;
  };

  const handleFolderUpload = async (folderInput: FolderUploadInput) => {
    setUploadProgress({ 
      isUploading: true, 
      progress: 0, 
      fileName: 'Folder enrichment',
      isComplete: false,
      error: undefined,
    });

    try {
      // Simulate progress while uploading (0-90%)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + Math.random() * 15, 90),
        }));
      }, 1000);

      // Upload folder - receives enriched file directly
      const enrichedBlob = await enrichmentAPI.enrichFromFolder(folderInput);

      clearInterval(progressInterval);
      
      // Upload complete - set to 100%
      setUploadProgress((prev) => ({
        ...prev,
        progress: 100,
        isUploading: false,
        isComplete: true,
        csvBlob: enrichedBlob,
      }));

      toast.success('✅ Folder enriched successfully! File is ready to download.');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || error.message || 'Failed to enrich folder';
      
      setUploadProgress((prev) => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
        isComplete: false,
      }));
      
      toast.error(errorMessage);
    }
  };

  const handleBatchFeedbackSubmit = async () => {
    if (!batchFeedback.productId.trim()) {
      toast.error('Please enter a Product ID');
      return;
    }
    if (!batchFeedback.notes.trim()) {
      toast.error('Please enter feedback text');
      return;
    }
    setBatchFeedback((prev) => ({ ...prev, isSubmitting: true }));
    try {
      // Include gender in notes if provided to preserve context
      const notes = batchFeedback.gender.trim()
        ? `Gender: ${batchFeedback.gender.trim()}\n\n${batchFeedback.notes.trim()}`
        : batchFeedback.notes.trim();

      await enrichmentAPI.submitFeedback({
        product_id: batchFeedback.productId.trim(),
        feedback_type: 'correction',
        attribute_name: null,
        original_prediction: null,
        corrected_value: null,
        notes,
        user_id: batchFeedback.userId || 'system',
      });

      setBatchFeedback((prev) => ({ ...prev, isSubmitting: false, feedbackSubmitted: true }));
      toast.success('✅ Feedback submitted successfully!');
      setTimeout(() => {
        setBatchFeedback({ productId: '', gender: '', notes: '', userId: 'system', isSubmitting: false, feedbackSubmitted: false });
      }, 1500);
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      let errorMessage = 'Failed to submit feedback';
      if (Array.isArray(detail)) errorMessage = detail.map((e: any) => e.msg || JSON.stringify(e)).join('; ');
      else if (typeof detail === 'string') errorMessage = detail;
      else if (error.message) errorMessage = error.message;
      toast.error(errorMessage);
      setBatchFeedback((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleDownload = () => {
    if (uploadProgress.downloadUrl) {
      window.location.href = `http://127.0.0.1:8000${uploadProgress.downloadUrl}`;
      toast.success('Download started!');
      setTimeout(() => setShowDialog(false), 1000);
    }
  };

  const handleDialogClose = () => {
    // Only allow closing if not currently uploading
    if (!uploadProgress.isUploading) {
      setShowDialog(false);
      setSelectedMethod(null);
      // Reset only after closing
      setUploadProgress({ isUploading: false, progress: 0 });
    }
  };

  const InputMethodCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
  }> = ({ icon, title, description, onClick }) => (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-4px)',
          borderColor: 'primary.main',
          borderWidth: 2,
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2,
            color: 'primary.main',
            fontSize: 48,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="100%" sx={{ py: 3, px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Product Enrichment
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Choose how you want to enrich your product data
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="standard"
          sx={{
            '& .MuiTab-root': {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              minHeight: 48,
            },
          }}
        >
          <Tab icon={<CloudUpload />} iconPosition="start" label="Upload Data" />
          <Tab icon={<CheckCircle />} iconPosition="start" label="Review Attributes" />
          <Tab icon={<FeedbackIcon />} iconPosition="start" label="Provide Feedback" />
        </Tabs>
      </Box>

      {/* Tab 1: Upload Data */}
      {tabValue === 0 && (
        <>
      {/* Input Method Selection Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <InputMethodCard
            icon={<EditNote sx={{ fontSize: 48 }} />}
            title="Single Product"
            description="Enrich one product at a time with detailed analysis"
            onClick={() => handleMethodSelect('single')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <InputMethodCard
            icon={<CloudUpload sx={{ fontSize: 48 }} />}
            title="CSV File"
            description="Upload a CSV with multiple products for batch enrichment"
            onClick={() => handleMethodSelect('csv')}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <InputMethodCard
            icon={<FolderOpen sx={{ fontSize: 48 }} />}
            title="Folder"
            description="Enrich all images in a local folder"
            onClick={() => handleMethodSelect('folder')}
          />
        </Grid>
      </Grid>

      {/* Features Info */}
      <Card sx={{ bgcolor: '#f5f5f5', border: '1px solid #e0e0e0' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            📋 Supported Features
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                  <Typography variant="body2">
                    AI-powered attribute generation
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                  <Typography variant="body2">
                    Confidence scoring (0-100%)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                  <Typography variant="body2">
                    Trend suggestions & gap analysis
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                  <Typography variant="body2">
                    Multi-value attribution
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                  <Typography variant="body2">
                    Taxonomy adherence
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                  <Typography variant="body2">
                    Human feedback loop
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* CSV Upload Dialog */}
      <Dialog
        open={showDialog && selectedMethod === 'csv'}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CloudUpload />
            CSV Upload
            <Box sx={{ flexGrow: 1 }} />
            <Button
              size="small"
              onClick={handleDialogClose}
              disabled={uploadProgress.isUploading}
            >
              <Close />
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            {!uploadProgress.isUploading && !uploadProgress.isComplete && !uploadProgress.error && (
              <>
                <Alert severity="info">
                  Upload a CSV file with columns: product_id, image_url, category,
                  gender (optional: brand, existing_attributes)
                </Alert>

                <Box
                  sx={{
                    border: '2px dashed #1976d2',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    bgcolor: '#f5f5f5',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': { bgcolor: '#e3f2fd' },
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    hidden
                  />
                  <Stack spacing={1}>
                    <CloudUpload sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Click to upload CSV or drag and drop
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      CSV file only
                    </Typography>
                  </Stack>
                </Box>
              </>
            )}

            {(uploadProgress.isUploading || uploadProgress.progress > 0) && !uploadProgress.isComplete && !uploadProgress.error && (
              <Stack spacing={2}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {uploadProgress.fileName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                      {Math.round(uploadProgress.progress)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress.progress}
                    sx={{ height: 10, borderRadius: 1 }}
                  />
                </Box>

                <Alert severity="info" icon={<CircularProgress size={20} />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      {uploadProgress.progress < 100
                        ? '⏳ Processing your CSV file... This may take a while.'
                        : '✅ Processing complete! Preparing download...'}
                    </Typography>
                  </Box>
                </Alert>

                <Alert severity="warning">
                  <Typography variant="caption">
                    💡 <strong>Tip:</strong> Keep this window open while processing. Do not close or refresh.
                  </Typography>
                </Alert>
              </Stack>
            )}

            {uploadProgress.isComplete && !uploadProgress.error && (
              <Stack spacing={2}>
                <Alert severity="success" sx={{ py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ color: 'success.main' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ✅ CSV enriched successfully!
                    </Typography>
                  </Box>
                </Alert>

                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Download sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    {uploadProgress.fileName}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Your enriched CSV file is ready
                  </Typography>
                </Box>

                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1,
                  border: '1px solid #e0e0e0'
                }}>
                  <Typography variant="caption" color="textSecondary">
                    📊 Your CSV has been processed with AI-generated attributes. Download it to see all the enriched data.
                  </Typography>
                </Box>
              </Stack>
            )}

            {uploadProgress.error && (
              <Stack spacing={2}>
                <Alert severity="error">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ❌ Error processing CSV
                  </Typography>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    {uploadProgress.error}
                  </Typography>
                </Alert>
              </Stack>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={handleDialogClose} 
            disabled={uploadProgress.isUploading}
            variant="text"
          >
            Close
          </Button>
          {uploadProgress.isComplete && uploadProgress.csvBlob && (
            <Button 
              onClick={handleDownloadCSV}
              variant="contained"
              color="success"
              startIcon={<Download />}
            >
              Download CSV
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Folder Upload Dialog */}
      <Dialog
        open={showDialog && selectedMethod === 'folder'}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderOpen />
            Folder Upload
            <Box sx={{ flexGrow: 1 }} />
            <Button
              size="small"
              onClick={handleDialogClose}
              disabled={uploadProgress.isUploading}
            >
              <Close />
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            {!uploadProgress.isUploading && !uploadProgress.isComplete && !uploadProgress.error && (
              <>
                <Alert severity="info">
                  Process all product images in a folder for batch enrichment
                </Alert>

                <TextField
                  label="Folder Path"
                  fullWidth
                  placeholder="C:/Products/Images"
                  helperText="Absolute path to your folder containing images"
                  defaultValue=""
                  onChange={(e) => {
                    const folderPath = e.target.value;
                    if (folderPath) {
                      // Store for later use when processing
                      (e.target as any).folderPath = folderPath;
                    }
                  }}
                />

                <TextField
                  label="Default Category"
                  fullWidth
                  placeholder="e.g., Fashion"
                  helperText="Category for all images in this folder"
                  defaultValue=""
                  onChange={(e) => {
                    (e.target as any).defaultCategory = e.target.value;
                  }}
                />

                <TextField
                  label="Default Gender"
                  fullWidth
                  placeholder="e.g., Women"
                  helperText="Gender for all images in this folder"
                  defaultValue=""
                  onChange={(e) => {
                    (e.target as any).defaultGender = e.target.value;
                  }}
                />

                <TextField
                  label="File Pattern"
                  fullWidth
                  placeholder="*.*"
                  defaultValue="*.*"
                  helperText="e.g., *.jpg, *.png, or *.* for all files"
                  onChange={(e) => {
                    (e.target as any).filePattern = e.target.value;
                  }}
                />
              </>
            )}

            {(uploadProgress.isUploading || uploadProgress.progress > 0) && !uploadProgress.isComplete && !uploadProgress.error && (
              <Stack spacing={2}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {uploadProgress.fileName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                      {Math.round(uploadProgress.progress)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress.progress}
                    sx={{ height: 10, borderRadius: 1 }}
                  />
                </Box>

                <Alert severity="info" icon={<CircularProgress size={20} />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      {uploadProgress.progress < 100
                        ? '⏳ Processing your folder... This may take a while.'
                        : '✅ Processing complete! Preparing download...'}
                    </Typography>
                  </Box>
                </Alert>

                <Alert severity="warning">
                  <Typography variant="caption">
                    💡 <strong>Tip:</strong> Keep this window open while processing. Do not close or refresh.
                  </Typography>
                </Alert>
              </Stack>
            )}

            {uploadProgress.isComplete && !uploadProgress.error && (
              <Stack spacing={2}>
                <Alert severity="success" sx={{ py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ color: 'success.main' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ✅ Folder enriched successfully!
                    </Typography>
                  </Box>
                </Alert>

                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Download sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    {uploadProgress.fileName}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Your enriched file is ready
                  </Typography>
                </Box>

                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1,
                  border: '1px solid #e0e0e0'
                }}>
                  <Typography variant="caption" color="textSecondary">
                    📊 Your folder has been processed with AI-generated attributes. Download it to see all the enriched data.
                  </Typography>
                </Box>
              </Stack>
            )}

            {uploadProgress.error && (
              <Stack spacing={2}>
                <Alert severity="error">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ❌ Error processing folder
                  </Typography>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    {uploadProgress.error}
                  </Typography>
                </Alert>
              </Stack>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={handleDialogClose} 
            disabled={uploadProgress.isUploading}
            variant="text"
          >
            Close
          </Button>
          {!uploadProgress.isUploading && !uploadProgress.isComplete && !uploadProgress.error && (
            <Button 
              onClick={() => {
                const inputs = document.querySelectorAll('input');
                const folderInput: FolderUploadInput = {
                  folder_path: (inputs[0] as any).value || '',
                  default_category: (inputs[1] as any).value || '',
                  default_gender: (inputs[2] as any).value || '',
                  auto_detect: true,
                  file_pattern: (inputs[3] as any).value || '*.*',
                };

                if (!folderInput.folder_path.trim()) {
                  toast.error('Please enter a folder path');
                  return;
                }
                if (!folderInput.default_category.trim()) {
                  toast.error('Please enter a default category');
                  return;
                }
                if (!folderInput.default_gender.trim()) {
                  toast.error('Please enter a default gender');
                  return;
                }

                handleFolderUpload(folderInput);
              }}
              variant="contained"
              color="primary"
              startIcon={<FolderOpen />}
            >
              Process Folder
            </Button>
          )}
          {uploadProgress.isComplete && uploadProgress.csvBlob && (
            <Button 
              onClick={handleDownloadCSV}
              variant="contained"
              color="success"
              startIcon={<Download />}
            >
              Download Results
            </Button>
          )}
        </DialogActions>
      </Dialog>
        </>
      )}

      {/* Tab 2: Review Discovered Attributes */}
      {tabValue === 1 && (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            📋 Review all discovered attributes from AI and CSV enrichments. Accept attributes to add them to the official taxonomy.
          </Alert>
          <DiscoveredAttributesReview />
        </Box>
      )}

      {/* Tab 3: Provide Feedback (simplified) */}
      {tabValue === 2 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            Submit simple feedback: enter Product ID, optionally Gender, and your feedback message.
          </Alert>

          {batchFeedback.feedbackSubmitted ? (
            <Card sx={{ textAlign: 'center', p: 4, bgcolor: '#e8f5e9', border: '2px solid #4caf50' }}>
              <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>Feedback Submitted!</Typography>
              <Typography variant="body2" color="textSecondary">Thank you — your feedback helps improve the AI model.</Typography>
            </Card>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Product ID *"
                  placeholder="e.g., Y80392"
                  value={batchFeedback.productId}
                  onChange={(e) => setBatchFeedback((prev) => ({ ...prev, productId: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Gender (optional)"
                  placeholder="e.g., Womens"
                  value={batchFeedback.gender}
                  onChange={(e) => setBatchFeedback((prev) => ({ ...prev, gender: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Feedback *"
                  placeholder="Enter feedback about this product..."
                  value={batchFeedback.notes}
                  onChange={(e) => setBatchFeedback((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={batchFeedback.isSubmitting ? <CircularProgress size={18} color="inherit" /> : <FeedbackIcon />}
                  onClick={handleBatchFeedbackSubmit}
                  disabled={batchFeedback.isSubmitting || !batchFeedback.productId.trim() || !batchFeedback.notes.trim()}
                  sx={{ px: 4 }}
                >
                  {batchFeedback.isSubmitting ? 'Submitting…' : 'Submit Feedback'}
                </Button>
              </Grid>
            </Grid>
          )}
        </Box>
      )}

      
    </Container>
  );
};
