import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { enrichmentAPI } from '../services/api';
import JumpHandler from './JumpHandler';
import { Box, Button, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Select, MenuItem, CircularProgress, Checkbox, FormControl, InputLabel } from '@mui/material';
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
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0);
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);
  const [totalEntries, setTotalEntries] = useState<number | null>(null);
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
          setTotalEntries(null);
        } else if (resp && resp.preview && Array.isArray(resp.preview)) {
          setPreview(resp.preview);
          setTotalEntries(typeof resp.total_entries === 'number' ? resp.total_entries : null);
          const firstSection = resp.preview[0]?.sections?.[0]?.attribute_name;
          setSelectedAttribute(firstSection ?? null);
        } else {
          setPreview([]);
          setTotalEntries(null);
          setSelectedAttribute(null);
        }
        setSelectedSheetIndex(0);
      } catch (err:any) {
        setError('Failed to fetch preview from backend');
      } finally {
        setLoading(false);
      }
    })();
  }, [location.search]);

  const activeSheet = useMemo(() => {
    if (!preview.length) return null;
    const idx = Math.min(Math.max(0, selectedSheetIndex), preview.length - 1);
    return preview[idx] ?? null;
  }, [preview, selectedSheetIndex]);

  const sectionsToShow = useMemo((): PreviewSection[] => {
    if (!activeSheet?.sections?.length) return [];
    if (!selectedAttribute) return activeSheet.sections;
    const target = selectedAttribute.trim().toLowerCase();
    return activeSheet.sections.filter(
      (s) => (s.attribute_name || '').trim().toLowerCase() === target,
    );
  }, [activeSheet, selectedAttribute]);

  const showSectionHeaders = !selectedAttribute;

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
        {totalEntries != null && (
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            ({totalEntries.toLocaleString()} entries)
          </Typography>
        )}
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            gap: 2,
            rowGap: 2,
          }}
        >
          <FormControl size="small" sx={{ width: { xs: '100%', sm: 220 } }}>
            <InputLabel id="preview-product-type-label">Product type</InputLabel>
            <Select
              labelId="preview-product-type-label"
              label="Product type"
              value={selectedSheetIndex}
              onChange={(e) => {
                const idx = Number(e.target.value);
                setSelectedSheetIndex(idx);
                const firstAttr = preview[idx]?.sections?.[0]?.attribute_name ?? null;
                setSelectedAttribute(firstAttr);
              }}
            >
              {preview.map((s, idx) => (
                <MenuItem key={`${s.sheet_name}-${idx}`} value={idx}>{s.sheet_name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ width: { xs: '100%', sm: 280 } }}>
            <InputLabel id="preview-attribute-label">Attribute</InputLabel>
            <Select
              labelId="preview-attribute-label"
              label="Attribute"
              value={selectedAttribute ?? ''}
              onChange={(e) => setSelectedAttribute(e.target.value === '' ? null : String(e.target.value))}
            >
              <MenuItem value="">All attributes</MenuItem>
              {(activeSheet?.sections ?? []).map((sec, idx) => (
                <MenuItem key={`${sec.attribute_name}-${idx}`} value={sec.attribute_name}>
                  {sec.attribute_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: { sm: 'auto' }, width: { xs: '100%', sm: 'auto' } }}>
            <Button variant="outlined" onClick={handleDownloadPreview}>Download Preview</Button>
            {onSaveAll && (
              <Button variant="outlined" color="secondary" onClick={onSaveAll} disabled={savingAll || saving}>
                {savingAll ? 'Saving All...' : 'Save All'}
              </Button>
            )}
            <Button variant="contained" color="success" onClick={handleSave} disabled={saving || savingAll}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {activeSheet && (() => {
        const sheetIndex = Math.min(Math.max(0, selectedSheetIndex), preview.length - 1);
        const sheet = activeSheet;
        const displayedHeaders = sheet.headers ?? [];
        const valueColWidth = 220;
        const genderColMinWidth = 72;
        const tableMinWidth = valueColWidth + displayedHeaders.length * genderColMinWidth;
        const headerCellSx = {
          minWidth: genderColMinWidth,
          px: 0.5,
          textAlign: 'center' as const,
          verticalAlign: 'middle' as const,
        };
        const bodyGenderCellSx = { ...headerCellSx, py: 0.5 };
        const valueCellSx = {
          width: valueColWidth,
          minWidth: valueColWidth,
          position: 'sticky' as const,
          left: 0,
          zIndex: 1,
          bgcolor: 'background.paper',
          verticalAlign: 'middle' as const,
        };

        const renderDataRow = (section: PreviewSection, sectionIndex: number, row: PreviewRow, rowIndex: number) => {
          const rowId = `allowable-row-${sheetIndex}-${sectionIndex}-${rowIndex}`;
          return (
            <TableRow
              id={rowId}
              key={`${section.attribute_name}-${row.attribute_value}-${rowIndex}`}
              sx={highlightedRowId === rowId ? { backgroundColor: 'rgba(255,235,59,0.3)' } : undefined}
            >
              <TableCell sx={valueCellSx}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box component="span" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.attribute_value}
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
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
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
              {displayedHeaders.map((h) => (
                <TableCell key={h.column_key} align="center" sx={bodyGenderCellSx}>
                  <Checkbox
                    size="small"
                    checked={!!row.cells[h.column_key]}
                    disabled={!row.cells[h.column_key]}
                    sx={{ p: 0.5 }}
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
        };

        return (
          <Paper key={`${sheet.sheet_name}-${sheetIndex}`} sx={{ p: 2, mb: 2, width: '100%', overflow: 'auto' }}>
            <Table
              size="small"
              stickyHeader
              sx={{
                tableLayout: 'fixed',
                width: '100%',
                minWidth: tableMinWidth,
                '& .MuiTableCell-head': { fontWeight: 600, bgcolor: 'grey.100' },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    rowSpan={2}
                    align="left"
                    sx={{
                      ...valueCellSx,
                      zIndex: 3,
                      bgcolor: 'grey.100',
                    }}
                  >
                    Attribute value
                  </TableCell>
                  {displayedHeaders.map((h) => (
                    <TableCell key={`${h.column_key}-gender`} align="center" sx={headerCellSx}>
                      {h.gender || ''}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  {displayedHeaders.map((h) => (
                    <TableCell
                      key={`${h.column_key}-ptype`}
                      align="center"
                      sx={{ ...headerCellSx, fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.2 }}
                    >
                      {h.product_type || sheet.sheet_name || ''}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sectionsToShow.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={1 + displayedHeaders.length}>
                      <em>No records for selected attribute.</em>
                    </TableCell>
                  </TableRow>
                ) : (
                  sectionsToShow.map((section) => {
                    const sectionIndex = sheet.sections.findIndex(
                      (s) => s.attribute_name === section.attribute_name,
                    );
                    return (
                      <React.Fragment key={`${section.attribute_name}-${sectionIndex}`}>
                        {showSectionHeaders && (
                          <TableRow>
                            <TableCell
                              colSpan={1 + displayedHeaders.length}
                              sx={{ backgroundColor: '#f5f5f5', py: 1, fontWeight: 600 }}
                            >
                              {section.attribute_name}
                            </TableCell>
                          </TableRow>
                        )}
                        {(section.rows ?? []).map((row, rowIndex) =>
                          renderDataRow(section, sectionIndex, row, rowIndex),
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Paper>
        );
      })()}

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
