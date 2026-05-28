import React, { useState } from 'react';
import { Box, Typography, Paper, Stack, Button, Alert, CircularProgress } from '@mui/material';
import { CloudUpload, Close } from '@mui/icons-material';
import { enrichmentAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminUploadGuidelines: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const resp = await enrichmentAPI.uploadAllowableFile(file);
      const uid = (resp && resp.upload_id) || undefined;
      // Navigate to the Preview Guidelines page and pass upload_id so preview is shown there
      navigate(`/admin/guidelines/preview${uid ? `?upload_id=${encodeURIComponent(uid)}` : ''}`);
    } catch (err:any) {
      setError(err?.response?.data?.detail || err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ p: 3, width: '100%', maxWidth: 900 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>Admin Upload Guidelines</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Upload an Excel workbook that contains allowable lists across one or more sheets. The UI below matches the Enrichment upload style for consistency.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack direction="column" spacing={3} alignItems="center">
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
              width: { xs: '100%', md: 560 },
            }}
            component="label"
          >
            <input type="file" accept=".xlsx,.xls" hidden onChange={handleFile} />
            <Stack spacing={1} alignItems="center">
              {uploading ? (
                <CircularProgress />
              ) : (
                <CloudUpload sx={{ fontSize: 40, color: 'primary.main' }} />
              )}
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Click to upload Excel workbook or drag and drop
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Accepted: .xlsx, .xls — file will be parsed and a preview generated
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/admin/guidelines/preview')}>Preview Guidelines</Button>
            <Button variant="text" onClick={() => window.open('/ADMIN_UPLOAD_GUIDELINES.md', '_blank')}>Open Full Guidelines</Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default AdminUploadGuidelines;
