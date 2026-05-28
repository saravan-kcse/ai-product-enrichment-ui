import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Grid,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import { EnrichmentInput } from '../types';
import { Send } from '@mui/icons-material';

interface EnrichmentFormProps {
  onEnrich: (input: EnrichmentInput) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export const EnrichmentForm: React.FC<EnrichmentFormProps> = ({
  onEnrich,
  isLoading = false,
  error = null,
}) => {
  const [formData, setFormData] = React.useState<EnrichmentInput>({
    product_id: '',
    image_url: '',
    category: '',
    gender: '',
    brand: '',
    is_own_brand: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.product_id &&
      formData.image_url &&
      formData.category
    ) {
      await onEnrich(formData);
    }
  };

  const isFormValid =
    formData.product_id &&
    formData.image_url &&
    formData.category;

  return (
    <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
      <CardContent>
        <Typography
          variant="h5"
          sx={{ mb: 0.5, fontWeight: 'bold', color: 'primary.main' }}
        >
          Product Enrichment
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ mb: 3 }}
        >
          Upload product details to generate AI-powered attributes
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Required Fields Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Required Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Product ID"
                    name="product_id"
                    value={formData.product_id}
                    onChange={handleChange}
                    placeholder="e.g., SKU-12345"
                    disabled={isLoading}
                    required
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Image URL"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    disabled={isLoading}
                    required
                    type="url"
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g., Dress, Trouser, Sofa"
                    disabled={isLoading}
                    required
                    variant="outlined"
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Optional Fields Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Optional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    placeholder="e.g., Womens, Mens, Unisex"
                    disabled={isLoading}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Brand"
                    name="brand"
                    value={formData.brand || ''}
                    onChange={handleChange}
                    placeholder="e.g., Nike, Adidas"
                    disabled={isLoading}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ pt: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="is_own_brand"
                          checked={formData.is_own_brand || false}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                      }
                      label="Own Brand Product"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Submit Button */}
            <Box sx={{ pt: 1 }}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={!isFormValid || isLoading}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Send />
                  )
                }
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                {isLoading ? 'Processing...' : 'Enrich Product'}
              </Button>
            </Box>

            {isLoading && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CircularProgress size={40} sx={{ mb: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Analyzing product image and generating attributes...
                </Typography>
              </Box>
            )}
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
};
