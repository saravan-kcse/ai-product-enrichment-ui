import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  LinearProgress,
  Divider,
  Grid,
  IconButton,
} from '@mui/material';
import { Attribute } from '../types';
import { Feedback } from '@mui/icons-material';

interface AttributeDisplayProps {
  attributes: Attribute[];
  trendSuggestions?: Attribute[];
  gapAnalysis?: string[];
  onEditAttribute?: (attribute: Attribute) => void;
  onAcceptTrend?: (attribute: Attribute) => void;
  onFeedback?: (attribute: Attribute, attributeValue: string) => void;
  autoAcceptThreshold?: number;
  reviewThreshold?: number;
}

export const AttributeDisplay: React.FC<AttributeDisplayProps> = ({
  attributes,
  onFeedback,
  autoAcceptThreshold = 90,
  reviewThreshold = 70,
}) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= autoAcceptThreshold) return 'success';
    if (confidence >= reviewThreshold) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Standard Attributes */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Enriched Attributes
          </Typography>
          <Stack spacing={2}>
            {attributes.map((attribute) => (
              <Box key={attribute.name}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {attribute.name}
                    </Typography>
                    {attribute.isMandatory && (
                      <Chip
                        label="Mandatory"
                        size="small"
                        color="error"
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => onFeedback?.(attribute, attribute.values[0]?.value || '')}
                      title="Provide feedback"
                    >
                      <Feedback sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Box>

                <Grid container spacing={1}>
                  {attribute.values.map((value, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Box>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body2">
                            {value.value}
                            {value.percentage !== undefined &&
                              ` (${value.percentage}%)`}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" sx={{ minWidth: 60 }}>
                            {value.confidence}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={value.confidence ?? 0}
                            sx={{ flex: 1 }}
                            color={getConfidenceColor(value.confidence ?? 0)}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ my: 1.5 }} />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>


    </Box>
  );
};
