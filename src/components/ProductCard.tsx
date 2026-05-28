import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Box,
  Typography,
  Chip,
  LinearProgress,
  Button,
  Stack,
  Rating,
} from '@mui/material';
import { Product } from '../types';
import { CheckCircle, Schedule, Error, HourglassBottom } from '@mui/icons-material';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  onEnrich?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  onEnrich,
}) => {
  const getStatusIcon = () => {
    switch (product.enrichmentStatus) {
      case 'completed':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'processing':
        return <HourglassBottom sx={{ color: 'info.main' }} />;
      case 'pending':
        return <Schedule sx={{ color: 'warning.main' }} />;
      case 'failed':
        return <Error sx={{ color: 'error.main' }} />;
    }
  };

  const getStatusColor = () => {
    switch (product.enrichmentStatus) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'info';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={() => onClick(product)}
    >
      <CardMedia
        component="img"
        height="200"
        image={product.imageUrl}
        alt={product.productName}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent>
        <Typography variant="h6" noWrap sx={{ mb: 1 }}>
          {product.productName}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Chip
            label={product.category}
            size="small"
            variant="outlined"
            color="primary"
          />
          <Chip
            label={product.gender}
            size="small"
            variant="outlined"
            color="secondary"
          />
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {getStatusIcon()}
          <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
            {product.enrichmentStatus}
          </Typography>
        </Box>

        {product.confidence !== undefined && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
              Confidence: {product.confidence}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={product.confidence}
              color={
                product.confidence >= 90
                  ? 'success'
                  : product.confidence >= 70
                    ? 'warning'
                    : 'error'
              }
            />
          </Box>
        )}

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            size="small"
            variant="outlined"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onClick(product);
            }}
          >
            Details
          </Button>
          {product.enrichmentStatus === 'pending' && onEnrich && (
            <Button
              size="small"
              variant="contained"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                onEnrich(product);
              }}
            >
              Enrich
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
