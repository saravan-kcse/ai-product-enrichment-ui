import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AutoFixHigh as TrendIcon,
} from '@mui/icons-material';
import { useEffect, useState, useCallback } from 'react';
import { enrichmentAPI } from '../services/api';
import toast from 'react-hot-toast';

interface DiscoveryContext {
  product_name?: string;
  gender?: string;
}

interface DiscoveredAttribute {
  id: number;
  attribute_name: string;
  attribute_type?: string;
  source: 'ai_discovered' | 'csv_discovered' | string;
  review_status?: string;
  description?: string;
  discovered_values: string[];
  discovery_contexts: DiscoveryContext[];
  product_name?: string | null;
  gender?: string | null;
  is_draft?: boolean;
  created_at?: string;
}

function normalizeDiscoveredAttribute(raw: Record<string, unknown>): DiscoveredAttribute {
  const contextsRaw = raw.discovery_contexts;
  const discovery_contexts: DiscoveryContext[] = Array.isArray(contextsRaw)
    ? contextsRaw.map((ctx) => {
        const c = ctx as Record<string, unknown>;
        return {
          product_name: (c.product_name as string) ?? undefined,
          gender: (c.gender as string) ?? undefined,
        };
      })
    : [];

  const product_name =
    (raw.product_name as string) ??
    (raw.example_product_name as string) ??
    discovery_contexts[0]?.product_name ??
    null;

  const gender =
    (raw.gender as string) ??
    (raw.product_gender as string) ??
    discovery_contexts[0]?.gender ??
    null;

  const valuesRaw = raw.discovered_values ?? raw.suggested_values;
  const discovered_values = Array.isArray(valuesRaw)
    ? valuesRaw.map(String)
    : [];

  return {
    id: Number(raw.id),
    attribute_name: String(raw.name ?? raw.attribute_name ?? 'Unknown'),
    attribute_type: raw.attribute_type as string | undefined,
    source: (raw.source as string) || 'ai_discovered',
    review_status: raw.review_status as string | undefined,
    description: raw.description as string | undefined,
    discovered_values,
    discovery_contexts,
    product_name,
    gender,
    is_draft: raw.is_draft as boolean | undefined,
    created_at: raw.created_at as string | undefined,
  };
}

function parseDiscoveredAttributesResponse(data: unknown): DiscoveredAttribute[] {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data
      .filter((item) => item && typeof item === 'object')
      .map((item) => normalizeDiscoveredAttribute(item as Record<string, unknown>));
  }

  if (typeof data !== 'object') return [];

  const obj = data as Record<string, unknown>;
  const list =
    (Array.isArray(obj.discovered_attributes) && obj.discovered_attributes) ||
    (Array.isArray(obj.pending_review) && obj.pending_review) ||
    (Array.isArray(obj.data) && obj.data) ||
    null;

  if (list) {
    return list
      .filter((item) => item && typeof item === 'object')
      .map((item) => normalizeDiscoveredAttribute(item as Record<string, unknown>));
  }

  return [];
}

function contextsForDisplay(attr: DiscoveredAttribute): DiscoveryContext[] {
  if (attr.discovery_contexts.length > 0) return attr.discovery_contexts;
  if (attr.product_name || attr.gender) {
    return [{ product_name: attr.product_name ?? undefined, gender: attr.gender ?? undefined }];
  }
  return [];
}

export default function DiscoveredAttributesReview() {
  const [attributes, setAttributes] = useState<DiscoveredAttribute[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<number | null>(null);

  const loadDiscoveredAttributes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await enrichmentAPI.getDiscoveredAttributes();
      const parsed = parseDiscoveredAttributesResponse(data);
      setAttributes(parsed.filter((attr) => Number.isFinite(attr.id)));
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const t = (data as { total?: number }).total;
        setTotal(typeof t === 'number' ? t : parsed.length);
      } else {
        setTotal(parsed.length);
      }
    } catch (error) {
      console.error('Failed to load discovered attributes:', error);
      toast.error('Failed to load discovered attributes');
      setAttributes([]);
      setTotal(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDiscoveredAttributes();
  }, [loadDiscoveredAttributes]);

  const handleAccept = async (attributeId: number) => {
    try {
      setAccepting(attributeId);
      await enrichmentAPI.promoteAttribute(attributeId);
      toast.success('Attribute accepted and added to taxonomy');
      setAttributes((prev) => prev.filter((a) => a.id !== attributeId));
      setTotal((prev) => (prev != null ? Math.max(0, prev - 1) : prev));
    } catch (error) {
      console.error('Failed to accept attribute:', error);
      toast.error('Failed to accept attribute');
    } finally {
      setAccepting(null);
    }
  };

  const handleReject = async (attributeId: number) => {
    try {
      setRejecting(attributeId);
      await enrichmentAPI.rejectAttribute(attributeId);
      toast.success('Attribute rejected');
      setAttributes((prev) => prev.filter((a) => a.id !== attributeId));
      setTotal((prev) => (prev != null ? Math.max(0, prev - 1) : prev));
    } catch (error) {
      console.error('Failed to reject attribute:', error);
      toast.error('Failed to reject attribute');
    } finally {
      setRejecting(null);
    }
  };

  const aiAttributes = attributes.filter((a) => a.source === 'ai_discovered');

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (attributes.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No new attributes discovered yet. Upload a CSV or enrich products to discover new attributes.
      </Alert>
    );
  }

  const renderAttributeTable = (attrs: DiscoveredAttribute[], icon: React.ReactNode, title: string) => {
    if (attrs.length === 0) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          {icon}
          <Typography variant="h6">{title}</Typography>
          <Chip label={attrs.length} color="primary" size="small" />
          {total != null && total !== attrs.length && (
            <Typography variant="body2" color="text.secondary">
              ({total} total pending)
            </Typography>
          )}
        </Box>

        <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Attribute</strong></TableCell>
                <TableCell><strong>Discovered values</strong></TableCell>
                <TableCell><strong>Product / gender</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attrs.map((attr) => {
                const contexts = contextsForDisplay(attr);
                return (
                  <TableRow key={attr.id} hover>
                    <TableCell sx={{ minWidth: 140 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {attr.attribute_name}
                      </Typography>
                      {attr.attribute_type && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {attr.attribute_type.replace(/_/g, ' ')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ minWidth: 180 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {attr.discovered_values.length > 0 ? (
                          attr.discovered_values.map((value) => (
                            <Chip key={value} label={value} size="small" variant="outlined" />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">—</Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ minWidth: 200 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {contexts.length > 0 ? (
                          contexts.map((ctx, idx) => (
                            <Chip
                              key={`${ctx.product_name}-${ctx.gender}-${idx}`}
                              size="small"
                              label={[ctx.product_name, ctx.gender].filter(Boolean).join(' · ')}
                              sx={{ maxWidth: '100%' }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">—</Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      {attr.review_status ? (
                        <Chip
                          label={attr.review_status.replace(/_/g, ' ')}
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={0.5} justifyContent="center">
                        <Tooltip title="Accept and add to taxonomy">
                          <span>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleAccept(attr.id)}
                              disabled={accepting === attr.id || rejecting === attr.id}
                            >
                              {accepting === attr.id ? (
                                <CircularProgress size={20} />
                              ) : (
                                <CheckCircleIcon />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Reject attribute">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleReject(attr.id)}
                              disabled={accepting === attr.id || rejecting === attr.id}
                            >
                              {rejecting === attr.id ? (
                                <CircularProgress size={20} />
                              ) : (
                                <CancelIcon />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Review Discovered Attributes
          {total != null && (
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({total} pending)
            </Typography>
          )}
        </Typography>

        {renderAttributeTable(aiAttributes, <TrendIcon />, 'AI Discovered')}

        {attributes.filter((a) => a.source !== 'ai_discovered').length > 0 &&
          renderAttributeTable(
            attributes.filter((a) => a.source !== 'ai_discovered'),
            <TrendIcon />,
            'Other sources',
          )}

        {attributes.length > 0 && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Accept attributes to add them to the official taxonomy for future enrichments.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
