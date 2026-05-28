import React, { useState } from 'react';
import { Box, Button, Snackbar, Alert } from '@mui/material';
import { useLocation } from 'react-router-dom';
import AdminAllowablePreview from './AdminAllowablePreview';
import { enrichmentAPI } from '../services/api';

const AdminPreviewGuidelines: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const uploadId = params.get('upload_id') || undefined;
  const [savingAll, setSavingAll] = useState(false);

  const handleSaveAll = async () => {
    setSavingAll(true);
    try {
      await enrichmentAPI.saveAllowablePreviewAll(uploadId);
      setSnackbarMessage('All allowables saved to master');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Save All failed', err);
      setSnackbarMessage('Save All failed');
      setSnackbarOpen(true);
    } finally {
      setSavingAll(false);
    }
  };

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  return (
    <Box>
      <AdminAllowablePreview onSaveAll={handleSaveAll} savingAll={savingAll} />
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPreviewGuidelines;
