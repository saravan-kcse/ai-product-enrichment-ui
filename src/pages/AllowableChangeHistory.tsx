import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button } from '@mui/material';
import { enrichmentAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AllowableChangeHistory: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await enrichmentAPI.getAllowableChangeHistory({ limit: 500 });
      if (Array.isArray(data)) setHistory(data);
      else if (data && Array.isArray(data.items)) setHistory(data.items);
      else setHistory(data || []);
    } catch (err: any) {
      setError('Failed to load change history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = history.filter((h) => {
    if (!search) return true;
    const s = search.toLowerCase();
    try {
      return JSON.stringify(h).toLowerCase().includes(s);
    } catch {
      return false;
    }
  });

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Allowable Lists — Change History</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button variant="outlined" onClick={fetchHistory}>Refresh</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Sheet / Category</TableCell>
              <TableCell>Attribute</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row, idx) => (
              <TableRow key={idx} hover sx={{ cursor: 'pointer' }} onClick={() => {
                // navigate to upload preview and request jump
                const sheet = encodeURIComponent(row.sheet_name || row.category || '');
                const attribute = encodeURIComponent(row.attribute_name || '');
                const value = encodeURIComponent(row.attribute_value || row.value || '');
                navigate(`/admin/allowable-upload?sheet=${sheet}&attribute=${attribute}&value=${value}`);
              }}>
                <TableCell>{row.timestamp || row.created_at || row.time || ''}</TableCell>
                <TableCell>{row.user_id || row.user || ''}</TableCell>
                <TableCell>{row.action || row.change_type || ''}</TableCell>
                <TableCell>{row.sheet_name || row.category || ''}</TableCell>
                <TableCell>{row.attribute_name || ''}</TableCell>
                <TableCell>{row.attribute_value || row.value || ''}</TableCell>
                <TableCell style={{ maxWidth: 400, overflow: 'auto' }}>
                  <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(row.details || row, null, 2)}</pre>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
    </Box>
  );
};

export default AllowableChangeHistory;
