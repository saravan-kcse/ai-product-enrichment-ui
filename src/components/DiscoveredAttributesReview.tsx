import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
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

interface DiscoveredAttribute {
  id: number;
  attribute_name: string;
  source: 'ai_discovered' | 'csv_discovered';
  confidence?: number;
  suggested_values?: string[];
  product_name?: string | null;
  gender?: string | null;
  product_count?: number;
  is_draft?: boolean;
}

export default function DiscoveredAttributesReview() {
  const [attributes, setAttributes] = useState<DiscoveredAttribute[]>([]);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<number | null>(null);

  // Use useCallback with empty dependency array to ensure function is stable
  const loadDiscoveredAttributes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await enrichmentAPI.getDiscoveredAttributes();
      
      // Handle different response formats
      let attributesArray: DiscoveredAttribute[] = [];
      
      if (Array.isArray(data)) {
        attributesArray = data.map((attr: any) => ({
          ...attr,
          product_name: attr.product_name ?? attr.example_product_name ?? attr.product_example ?? (attr.product && (attr.product.name || attr.product.product_name)) ?? null,
          gender: attr.gender ?? attr.product_gender ?? (attr.product && attr.product.gender) ?? null,
        }));
      } else if (data && typeof data === 'object') {
        // Check for pending_review key (main API response structure)
        if (data.pending_review && Array.isArray(data.pending_review)) {
          attributesArray = data.pending_review.map((attr: any) => ({
            id: attr.id,
            attribute_name: attr.name || attr.attribute_name || 'Unknown',
            source: attr.source || 'ai_discovered',
            confidence: attr.confidence,
            suggested_values: attr.discovered_values || attr.suggested_values || [],
            product_count: attr.product_count,
            is_draft: attr.is_draft,
            product_name: attr.product_name ?? attr.example_product_name ?? attr.product_example ?? (attr.product && (attr.product.name || attr.product.product_name)) ?? null,
            gender: attr.gender ?? attr.product_gender ?? (attr.product && attr.product.gender) ?? null,
          }));
        }
        // Check for data key (nested response)
        else if (data.data && Array.isArray(data.data)) {
          attributesArray = data.data;
        }
        // Check if response is array within another key
        else {
          attributesArray = Object.values(data).filter(
            (item): item is DiscoveredAttribute => 
              item && typeof item === 'object' && 'id' in item
          );
        }
      }
      
      setAttributes(attributesArray.filter(attr => attr && typeof attr === 'object'));
    } catch (error) {
      console.error('Failed to load discovered attributes:', error);
      toast.error('Failed to load discovered attributes');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array ensures function is created only once

  // Run only once on component mount
  useEffect(() => {
    loadDiscoveredAttributes();
  }, [loadDiscoveredAttributes]);

  const handleAccept = async (attributeId: number) => {
    try {
      setAccepting(attributeId);
      await enrichmentAPI.promoteAttribute(attributeId);
      toast.success('Attribute accepted and added to taxonomy');
      setAttributes(attributes.filter(a => a.id !== attributeId));
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
      setAttributes(attributes.filter(a => a.id !== attributeId));
    } catch (error) {
      console.error('Failed to reject attribute:', error);
      toast.error('Failed to reject attribute');
    } finally {
      setRejecting(null);
    }
  };

  const aiAttributes = attributes.filter(a => a.source === 'ai_discovered');

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
        </Box>

        <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell align="center"><strong>Gender</strong></TableCell>
                <TableCell><strong>Attribute Name</strong></TableCell>
                <TableCell align="center"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attrs.map((attr) => (
                <TableRow key={attr.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {attr.product_name ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{attr.gender ?? '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {attr.attribute_name}
                    </Typography>
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
              ))}
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
        </Typography>

        {renderAttributeTable(aiAttributes, <TrendIcon />, 'AI Discovered')}

        {attributes.length > 0 && (
          <Alert severity="success" sx={{ mt: 2 }}>
            ✓ Accept attributes to add them to the official taxonomy for future enrichments
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
