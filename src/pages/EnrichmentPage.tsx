import React, { useState } from 'react';
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Alert,
  LinearProgress,
  Button,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import { Feedback } from '@mui/icons-material';
import {
  EnrichmentForm,
  AttributeDisplay,
  FeedbackForm,
  GapAnalysis,
} from '../components';
import { enrichmentAPI } from '../services/api';
import {
  EnrichmentInput,
  EnrichmentResponse,
  Attribute,
  FeedbackSubmission,
} from '../types';
import toast from 'react-hot-toast';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

export const EnrichmentPage: React.FC = () => {
  const [enrichmentResult, setEnrichmentResult] =
    useState<EnrichmentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(
    null
  );

  const handleEnrich = async (input: EnrichmentInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await enrichmentAPI.enrichSingleProduct(input);
      setEnrichmentResult(result);
      setTabValue(0);
      toast.success('Product enriched successfully!');
    } catch (err: any) {
      let errorMessage = 'Failed to enrich product';
      const detail = err.response?.data?.detail;
      
      if (Array.isArray(detail)) {
        errorMessage = detail.map((e: any) => e.msg || JSON.stringify(e)).join('; ');
      } else if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };



  const handleSubmitFeedback = async (feedback: FeedbackSubmission) => {
    try {
      await enrichmentAPI.submitFeedback(feedback);
      setFeedbackOpen(false);
      toast.success('Feedback submitted successfully!');
    } catch (err: any) {
      let errorMessage = 'Failed to submit feedback';
      const detail = err.response?.data?.detail;
      
      if (Array.isArray(detail)) {
        // Handle Pydantic validation errors (array of error objects)
        errorMessage = detail.map((e: any) => e.msg || JSON.stringify(e)).join('; ');
      } else if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleAcceptTrend = async (trend: Attribute) => {
    if (enrichmentResult) {
      setEnrichmentResult({
        ...enrichmentResult,
        attributes: [...enrichmentResult.attributes, trend],
        trend_suggestions: enrichmentResult.trend_suggestions.filter(
          (t) => t.name !== trend.name
        ),
      });
      toast.success('Trend suggestion accepted!');
    }
  };

  return (
    <Container maxWidth={false} sx={{ py: 2, px: { xs: 1, sm: 2, md: 3 }, width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
        Single Product Enrichment
      </Typography>

      <Grid container spacing={2}>
        {/* Form - Left Side */}
        <Grid item xs={12} md={5}>
          <EnrichmentForm
            onEnrich={handleEnrich}
            isLoading={isLoading}
            error={error}
          />
        </Grid>

        {/* Results - Right Side */}
        <Grid item xs={12} md={7}>
          {enrichmentResult ? (
            <Stack spacing={2}>
              {/* Quick Stats */}
              <Card sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Product ID
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {enrichmentResult.product_id}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Confidence
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {enrichmentResult.overall_confidence}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={enrichmentResult.overall_confidence}
                          sx={{ flex: 1, height: 4, borderRadius: 1 }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Processing
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {enrichmentResult.processing_time}ms
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Model
                      </Typography>
                      <Chip
                        label={enrichmentResult.model_version}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Card>

              {/* Results Tabs */}
              <Card>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs
                    value={tabValue}
                    onChange={(_e, newValue) => setTabValue(newValue)}
                    variant="fullWidth"
                    aria-label="enrichment results"
                  >
                    <Tab
                      label={`Attributes (${enrichmentResult.attributes.length})`}
                    />
                    <Tab
                      label={`Trends (${enrichmentResult.trend_suggestions.length})`}
                    />
                    <Tab label="Gap Analysis" />
                  </Tabs>
                </Box>

                <CardContent sx={{ p: 2 }}>
                  <TabPanel value={tabValue} index={0}>
                    <AttributeDisplay
                      attributes={enrichmentResult.attributes}
                      onFeedback={(attribute, _value) => {
                        setSelectedAttribute(attribute);
                        setFeedbackOpen(true);
                      }}
                      autoAcceptThreshold={90}
                      reviewThreshold={70}
                    />
                  </TabPanel>

                  <TabPanel value={tabValue} index={1}>
                    {enrichmentResult.trend_suggestions.length > 0 ? (
                      <Stack spacing={2}>
                        {enrichmentResult.trend_suggestions.map((trend) => (
                          <Card key={trend.name} variant="outlined" sx={{ borderLeft: '4px solid #4caf50' }}>
                            <CardContent>
                              <Box sx={{ mb: 1.5 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                  {trend.name}
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} alignItems="center">
                                  <Chip label={trend.suggestion_type ?? 'Trend Suggestion'} size="small" color="success" />
                                  {trend.final_score && <Chip label={`Score: ${Math.round(trend.final_score)}`} size="small" />}
                                </Stack>
                              </Box>
                              {trend.justification && (
                                <Typography variant="body2" color="textSecondary" sx={{ display: 'block', mb: 1.5 }}>
                                  {trend.justification}
                                </Typography>
                              )}
                              {trend.what_is_trending && (
                                <Alert severity="info">{trend.what_is_trending}</Alert>
                              )}
                              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                                {trend.values.map((value, idx) => (
                                  <Chip
                                    key={idx}
                                    label={`${value.value}${value.percentage !== undefined ? ` — ${value.percentage}%` : ''}${value.confidence !== undefined ? ` (${value.confidence})` : ''}`}
                                    variant="outlined"
                                    color="success"
                                  />
                                ))}
                              </Stack>
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => handleAcceptTrend(trend)}
                              >
                                Accept Suggestion
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    ) : (
                      <Alert severity="info">
                        No trend suggestions at this time
                      </Alert>
                    )}
                  </TabPanel>

                  <TabPanel value={tabValue} index={2}>
                    <GapAnalysis gaps={enrichmentResult.gaps_normalized || enrichmentResult.gaps_raw} gapStrings={enrichmentResult.gap_analysis} />
                  </TabPanel>
                </CardContent>
              </Card>

              {/* Feedback Button */}
              <Button
                variant="contained"
                startIcon={<Feedback />}
                onClick={() => setFeedbackOpen(true)}
              >
                Provide Feedback
              </Button>
            </Stack>
          ) : (
            <Card sx={{ p: 3, textAlign: 'center', color: 'textSecondary' }}>
              <Typography>
                Fill out the form on the left and click "Enrich Product" to see
                results here
              </Typography>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Modals */}
      <FeedbackForm
        open={feedbackOpen}
        productId={enrichmentResult?.product_id || ''}
        attributeName={selectedAttribute?.name || ''}
        suggestedValue={selectedAttribute?.values[0]?.value || ''}
        onSubmit={handleSubmitFeedback}
        onClose={() => setFeedbackOpen(false)}
      />
    </Container>
  );
};
