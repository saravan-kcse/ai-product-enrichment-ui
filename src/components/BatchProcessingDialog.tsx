import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { BatchInput, FolderUploadInput } from '../types';

interface BatchProcessingDialogProps {
  open: boolean;
  onSubmit: (input: BatchInput | FolderUploadInput) => void;
  onClose: () => void;
  isProcessing?: boolean;
  progress?: number;
  dataSource?: 'csv' | 'folder';
  onDataSourceChange?: (source: 'csv' | 'folder') => void;
}

export const BatchProcessingDialog: React.FC<BatchProcessingDialogProps> = ({
  open,
  onSubmit,
  onClose,
  isProcessing = false,
  progress = 0,
  dataSource = 'csv',
  onDataSourceChange,
}) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [source, setSource] = React.useState<'csv' | 'folder'>(dataSource);
  const [csvUrl, setCsvUrl] = React.useState('');
  const [folderPath, setFolderPath] = React.useState('');
  const [defaultCategory, setDefaultCategory] = React.useState('');
  const [defaultGender, setDefaultGender] = React.useState('');
  const [autoDetect, setAutoDetect] = React.useState(true);
  const [filePattern, setFilePattern] = React.useState('*.*');
  const [autoAcceptThreshold, setAutoAcceptThreshold] = React.useState(90);
  const [reviewThreshold, setReviewThreshold] = React.useState(70);

  const handleSourceChange = (event: React.MouseEvent<HTMLElement>, newSource: 'csv' | 'folder') => {
    if (newSource !== null) {
      setSource(newSource);
      onDataSourceChange?.(newSource);
    }
  };

  const steps = [
    'Select Source',
    'Configure Options',
    'Review & Process',
  ];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      if (source === 'folder') {
        onSubmit({
          folder_path: folderPath,
          default_category: defaultCategory,
          default_gender: defaultGender,
          auto_detect: autoDetect,
          file_pattern: filePattern,
        } as FolderUploadInput);
      } else {
        onSubmit({
          products: [], // Will be populated from CSV
          autoAcceptThreshold,
          reviewThreshold,
        } as BatchInput);
      }
      setActiveStep(0);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Batch Processing</DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                Select Data Source
              </Typography>
              <ToggleButtonGroup
                value={source}
                exclusive
                onChange={handleSourceChange}
                fullWidth
                sx={{ mb: 3 }}
              >
                <ToggleButton value="csv" aria-label="CSV">
                  📄 CSV File
                </ToggleButton>
                <ToggleButton value="folder" aria-label="Folder">
                  📁 Folder
                </ToggleButton>
              </ToggleButtonGroup>

              {source === 'csv' && (
                <Box>
                  <TextField
                    label="CSV URL / File Path"
                    fullWidth
                    value={csvUrl}
                    onChange={(e) => setCsvUrl(e.target.value)}
                    placeholder="https://example.com/products.csv"
                    helperText="Upload a CSV with columns: productId, imageUrl, category, gender"
                  />
                </Box>
              )}

              {source === 'folder' && (
                <Stack spacing={2}>
                  <TextField
                    label="Folder Path"
                    fullWidth
                    value={folderPath}
                    onChange={(e) => setFolderPath(e.target.value)}
                    placeholder="e.g., C:/Products/Images"
                    helperText="Local folder path containing product images"
                  />
                  <TextField
                    label="File Pattern"
                    fullWidth
                    value={filePattern}
                    onChange={(e) => setFilePattern(e.target.value)}
                    placeholder="*.*"
                    helperText="e.g., *.jpg, *.png, or *.*"
                  />
                </Stack>
              )}
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              {source === 'csv' && (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Configure Processing Thresholds
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2">
                        Auto-Accept (≥): {autoAcceptThreshold}%
                      </Typography>
                      <TextField
                        type="number"
                        inputProps={{ min: 0, max: 100 }}
                        fullWidth
                        value={autoAcceptThreshold}
                        onChange={(e) =>
                          setAutoAcceptThreshold(parseInt(e.target.value))
                        }
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2">
                        Review Required: {reviewThreshold}% -{' '}
                        {autoAcceptThreshold}%
                      </Typography>
                      <TextField
                        type="number"
                        inputProps={{ min: 0, max: autoAcceptThreshold }}
                        fullWidth
                        value={reviewThreshold}
                        onChange={(e) =>
                          setReviewThreshold(parseInt(e.target.value))
                        }
                      />
                    </Box>
                  </Stack>
                </>
              )}

              {source === 'folder' && (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Configure Folder Processing
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="Default Category"
                      fullWidth
                      value={defaultCategory}
                      onChange={(e) => setDefaultCategory(e.target.value)}
                      placeholder="e.g., Fashion, Home, Electronics"
                      helperText="Default category for all images in this folder"
                    />
                    <TextField
                      label="Default Gender"
                      fullWidth
                      value={defaultGender}
                      onChange={(e) => setDefaultGender(e.target.value)}
                      placeholder="e.g., Men, Women, Unisex"
                      helperText="Default gender for all images in this folder"
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2">Auto-detect attributes:</Typography>
                      <Button
                        variant={autoDetect ? 'contained' : 'outlined'}
                        onClick={() => setAutoDetect(!autoDetect)}
                        size="small"
                      >
                        {autoDetect ? 'Enabled' : 'Disabled'}
                      </Button>
                    </Box>
                  </Stack>
                </>
              )}
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Alert severity="info">
                Ready to process batch enrichment. This may take several minutes
                depending on the number of products.
              </Alert>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Source: {source === 'csv' ? '📄 CSV File' : '📁 Folder'}
                </Typography>
                {source === 'csv' && (
                  <>
                    <Typography variant="body2">
                      Data Source: {csvUrl}
                    </Typography>
                    <Typography variant="body2">
                      Auto-Accept Threshold: {autoAcceptThreshold}%
                    </Typography>
                    <Typography variant="body2">
                      Review Threshold: {reviewThreshold}%
                    </Typography>
                  </>
                )}
                {source === 'folder' && (
                  <>
                    <Typography variant="body2">
                      Folder Path: {folderPath}
                    </Typography>
                    <Typography variant="body2">
                      File Pattern: {filePattern}
                    </Typography>
                    <Typography variant="body2">
                      Default Category: {defaultCategory}
                    </Typography>
                    <Typography variant="body2">
                      Default Gender: {defaultGender}
                    </Typography>
                    <Typography variant="body2">
                      Auto-Detect: {autoDetect ? 'Enabled' : 'Disabled'}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          )}

          {isProcessing && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CircularProgress size={24} />
                <Typography variant="body2">Processing...</Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                Progress: {progress}%
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isProcessing}>
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={isProcessing}>
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          variant="contained"
          disabled={
            isProcessing ||
            (source === 'csv' ? !csvUrl : !folderPath || !defaultCategory || !defaultGender)
          }
        >
          {activeStep === steps.length - 1 ? 'Process' : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
