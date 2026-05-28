import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { enrichmentAPI } from '../services/api';
import JumpHandler from './JumpHandler';
import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Select, MenuItem, CircularProgress, Checkbox } from '@mui/material';
import { Delete } from '@mui/icons-material';

interface PreviewHeader {
  gender?: string;
  product_type?: string;
  column_key: string;
}

interface PreviewRow {
  attribute_value: string;
  cells: Record<string, boolean>;
}

interface PreviewSection {
  attribute_name: string;
  rows: PreviewRow[];
}

interface PreviewSheet {
  sheet_name: string;
  category?: string;
  headers: PreviewHeader[];
  sections: PreviewSection[];
}

type AdminAllowablePreviewProps = {
  onSaveAll?: () => Promise<void>;
  savingAll?: boolean;
};

const AdminAllowablePreview: React.FC<AdminAllowablePreviewProps> = ({ onSaveAll, savingAll }) => {
  const [preview, setPreview] = useState<PreviewSheet[]>([]);
  const [uploadId, setUploadId] = useState<string | undefined>(undefined);
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);
  const [selectedSheetIndex, setSelectedSheetIndex] = useState<number | null>(null);
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const uid = params.get('upload_id') || undefined;
    setUploadId(uid);
    // Fetch preview from backend preview endpoint (do not use sessionStorage)
    (async () => {
      setLoading(true);
      try {
        const resp = await enrichmentAPI.getAllowablePreview(uid);
        if (resp && Array.isArray(resp)) {
          setPreview(resp);
        } else if (resp && resp.preview && Array.isArray(resp.preview)) {
          setPreview(resp.preview);
        } else {
          setPreview([]);
        }
      } catch (err:any) {
        setError('Failed to fetch preview from backend');
      } finally {
        setLoading(false);
      }
    })();
  }, [location.search]);

  useEffect(() => {
    // default select first sheet
    if (preview && preview.length && selectedSheetIndex === null) setSelectedSheetIndex(0);
  }, [preview]);

  useEffect(() => {
    // default select first attribute for the selected sheet
    if (selectedSheetIndex === null) {
      setSelectedAttribute(null);
      return;
    }
    const sheet = preview[selectedSheetIndex];
    if (!sheet || !sheet.sections || sheet.sections.length === 0) {
      setSelectedAttribute(null);
      return;
    }
    if (!selectedAttribute) {
      setSelectedAttribute(sheet.sections[0].attribute_name);
    }
  }, [preview, selectedSheetIndex]);

  const saveToSession = (id?: string, data?: PreviewSheet[]) => {
    // No-op: we no longer use sessionStorage for previews. Persist via save API.
    // Consume params to avoid unused-variable diagnostics
    void id;
    void data;
  };

  const handleDownloadPreview = () => {
    try {
      const blob = new Blob([JSON.stringify(preview, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'allowable-preview.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download preview', err);
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" onClick={() => navigate('/admin/allowable-upload')}>Go to Upload</Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!preview || preview.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>No preview loaded.</Typography>
      </Box>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await enrichmentAPI.saveAllowablePreview(uploadId, preview);
      setSaving(false);
    } catch (err:any) {
      setSaving(false);
      setError('Failed to save preview to backend');
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Admin: Allowable Preview
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="subtitle1">Sheet:</Typography>
          <Select value={selectedSheetIndex ?? ''} onChange={(e) => setSelectedSheetIndex(e.target.value === '' ? null : Number(e.target.value))} size="small" sx={{ minWidth: 140 }}>
            {preview.map((s, idx) => (
              <MenuItem key={`${s.sheet_name}-${idx}`} value={idx}>{s.sheet_name}</MenuItem>
            ))}
          </Select>

          <Typography variant="subtitle1" sx={{ ml: 4 }}>Attribute:</Typography>
            <Select value={selectedAttribute ?? ''} onChange={(e) => setSelectedAttribute(e.target.value === '' ? null : String(e.target.value))} size="small" sx={{ minWidth: 180 }}>
            <MenuItem value="">All</MenuItem>
            {(selectedSheetIndex !== null ? (preview[selectedSheetIndex]?.sections ?? []) : []).map((sec, idx) => (
              <MenuItem key={`${sec.attribute_name}-${idx}`} value={sec.attribute_name}>{sec.attribute_name}</MenuItem>
            ))}
          </Select>

          <Button variant="outlined" onClick={handleDownloadPreview} sx={{ ml: 'auto' }}>Download Preview</Button>
          {onSaveAll && (
            <Button variant="outlined" color="secondary" onClick={onSaveAll} disabled={savingAll || saving} sx={{ ml: 1 }}>
              {savingAll ? 'Saving All...' : 'Save All'}
            </Button>
          )}
          <Button variant="contained" color="success" onClick={handleSave} disabled={saving || savingAll} sx={{ ml: 1 }}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </Box>
      </Paper>

        {preview.map((sheet, sheetIndex) => {
        if (selectedSheetIndex !== null && sheetIndex !== selectedSheetIndex) return null;
        const displayedHeaders = sheet.headers ?? [];
        const hasProductTypes = displayedHeaders.some(h => {
          const g = (h.gender || '').toString().trim();
          const p = (h.product_type || '').toString().trim();
          return p !== '' && p !== g;
        });
        return (
          <Paper key={`${sheet.sheet_name}-${sheetIndex}`} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">{sheet.sheet_name} — {sheet.category}</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell rowSpan={2} sx={{ verticalAlign: 'middle' }}>Value</TableCell>
                  {displayedHeaders.map((h) => (
                    <TableCell key={`${h.column_key}-gender`} align="center">{h.gender || ''}</TableCell>
                  ))}
                </TableRow>
                {hasProductTypes && (
                  <TableRow>
                    {displayedHeaders.map((h) => (
                      <TableCell key={`${h.column_key}-ptype`} align="center">{h.product_type || ''}</TableCell>
                    ))}
                  </TableRow>
                )}
              </TableHead>
              <TableBody>
                {(() => {
                  const sectionsToShow = ((): PreviewSection[] => {
                    const sheetSections = sheet.sections ?? [];
                    if (!selectedAttribute) return sheetSections;
                    const target = selectedAttribute.trim().toLowerCase();
                    return sheetSections.filter(s => (s.attribute_name || '').trim().toLowerCase() === target);
                  })();
                  if (!sectionsToShow || sectionsToShow.length === 0) {
                    return (
                      <TableRow>
                        <TableCell colSpan={1 + displayedHeaders.length}>
                          <em>No records for selected attribute.</em>
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return sectionsToShow.map((section, sectionIndex) => (
                    <React.Fragment key={`${section.attribute_name}-${sectionIndex}`}>
                      <TableRow>
                        <TableCell colSpan={1 + displayedHeaders.length} sx={{ backgroundColor: '#f5f5f5', verticalAlign: 'middle', py: 1 }}>
                          <strong>{section.attribute_name}</strong>
                        </TableCell>
                      </TableRow>
                      {(section.rows ?? []).map((row, rowIndex) => {
                        const rowId = `allowable-row-${sheetIndex}-${sectionIndex}-${rowIndex}`;
                        return (
                          <TableRow id={rowId} key={`${row.attribute_value}-${rowIndex}`} sx={ highlightedRowId === rowId ? { backgroundColor: 'rgba(255,235,59,0.3)' } : {} }>
                            <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {row.attribute_value}
                              <IconButton size="small" color="error" onClick={() => {
                                const newPreview = [...preview];
                                newPreview[sheetIndex].sections[sectionIndex].rows.splice(rowIndex, 1);
                                setPreview(newPreview);
                                saveToSession();
                                enrichmentAPI.submitFeedback({
                                  product_id: uploadId || '',
                                  feedback_type: 'correction',
                                  attribute_name: section.attribute_name,
                                  original_prediction: row.attribute_value,
                                  corrected_value: 'DELETED',
                                  notes: `Deleted row ${row.attribute_value} in ${sheet.sheet_name}`,
                                  user_id: 'ui',
                                }).catch(() => {});
                              }}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </TableCell>
                            {displayedHeaders.map((h) => (
                              <TableCell key={h.column_key} align="center">
                                <Checkbox
                                  size="small"
                                  checked={!!row.cells[h.column_key]}
                                  disabled={!row.cells[h.column_key]}
                                  onChange={() => {
                                    if (!row.cells[h.column_key]) return;
                                    const newPreview = [...preview];
                                    const current = newPreview[sheetIndex].sections[sectionIndex].rows[rowIndex].cells;
                                    const prev = !!current[h.column_key];
                                    current[h.column_key] = !prev;
                                    setPreview(newPreview);
                                    saveToSession();
                                    enrichmentAPI.submitFeedback({
                                      product_id: uploadId || '',
                                      feedback_type: 'correction',
                                      attribute_name: section.attribute_name,
                                      original_prediction: String(prev),
                                      corrected_value: String(!prev),
                                      notes: `Toggled ${h.column_key} for ${row.attribute_value} in ${sheet.sheet_name}`,
                                      user_id: 'ui',
                                    }).catch(() => {});
                                  }}
                                />
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                    </React.Fragment>
                  ));
                })()}
              </TableBody>
            </Table>
          </Paper>
        );
      })}

      <JumpHandler
        jumpTarget={null}
        preview={preview}
        onHighlight={(id) => {
          setHighlightedRowId(id);
          setTimeout(() => setHighlightedRowId(null), 6000);
          navigate('/admin/allowable-preview', { replace: true });
        }}
      />
    </Box>
  );
};

export default AdminAllowablePreview;
