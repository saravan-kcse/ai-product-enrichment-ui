import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { enrichmentAPI } from '../services/api';
import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { UploadFile, Delete } from '@mui/icons-material';

interface AllowableItem {
  id: string;
  attribute: string;
  value: string;
  product: string;
}

const AdminAllowableUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState<AllowableItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<AllowableItem>>({});
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const response = await enrichmentAPI.uploadAllowableFile(file);
      if (response.preview && Array.isArray(response.preview)) {
        // Backend stores preview; navigate to preview page with upload_id so preview page fetches it
        navigate(`/admin/allowable-preview${response.upload_id ? `?upload_id=${encodeURIComponent(response.upload_id)}` : ''}`);
      } else if ((response as any).items) {
        setData((response as any).items || []);
      }
    } catch (err:any) {
      setError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => setData(prev => prev.filter(i => i.id !== id));

  const handleAdd = () => {
    if (newItem.attribute && newItem.value && newItem.product) {
      setData(prev => [...prev, { id: Date.now().toString(), attribute: newItem.attribute!, value: newItem.value!, product: newItem.product! }]);
      setNewItem({});
      setAddDialogOpen(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Admin: Upload Allowable List</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Button variant="contained" component="label" startIcon={<UploadFile />} disabled={uploading}>
          Select Excel File
          <input type="file" accept=".xlsx,.xls" hidden onChange={handleFileChange} />
        </Button>
        {file && <Typography>{file.name}</Typography>}
        <Button variant="contained" color="primary" onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? <CircularProgress size={20} /> : 'Upload'}
        </Button>
        <Button variant="outlined" onClick={() => navigate('/admin/allowable-preview')}>Open Preview</Button>
      </Box>

      {error && <Typography color="error">{error}</Typography>}

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Attribute</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.attribute}</TableCell>
                <TableCell>{item.value}</TableCell>
                <TableCell>{item.product}</TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleDelete(item.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add Allowable Row</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <input placeholder="Attribute" value={newItem.attribute || ''} onChange={(e) => setNewItem(prev => ({ ...prev, attribute: e.target.value }))} />
            <input placeholder="Value" value={newItem.value || ''} onChange={(e) => setNewItem(prev => ({ ...prev, value: e.target.value }))} />
            <input placeholder="Product" value={newItem.product || ''} onChange={(e) => setNewItem(prev => ({ ...prev, product: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminAllowableUpload;
