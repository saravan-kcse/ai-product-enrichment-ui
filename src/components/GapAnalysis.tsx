import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Box,
  Avatar,
  Button,
  LinearProgress,
  Grid,
} from '@mui/material';

interface GapAnalysisProps {
  gaps?: any[];
  gapStrings?: string[];
}

const sanitize = (v: any, fallback = ''): string => {
  if (v === undefined || v === null) return fallback;
  const s = typeof v === 'string' ? v : String(v);
  const t = s.trim();
  if (!t || t.toLowerCase() === 'undefined' || t.toLowerCase() === 'null') return fallback;
  return t;
};

export const GapAnalysis: React.FC<GapAnalysisProps> = ({ gaps = [], gapStrings = [] }) => {
  if ((gaps || []).length === 0 && (gapStrings || []).length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>No gaps found. Product is fully enriched!</Typography>
        </CardContent>
      </Card>
    );
  }

  // If structured gaps available, render rich cards
  if (gaps && gaps.length > 0) {
    return (
      <Stack spacing={2}>
        {gaps.map((g, i) => {
          const name = sanitize(g.attribute_name ?? g.suggested_attribute ?? g.attribute ?? g.name ?? g.field, 'Unknown');
          const suggestedObjs = Array.isArray(g.suggested_values)
            ? g.suggested_values.map((v: any) => ({
                value: v && typeof v === 'object' ? (v.value ?? v.name ?? String(v)) : String(v),
                percentage: v && typeof v === 'object' && v.percentage !== undefined ? Number(v.percentage) : undefined,
                confidence: v && typeof v === 'object' && v.confidence !== undefined ? Number(v.confidence) : undefined,
              }))
            : [{ value: sanitize(g.missing_value ?? g.suggested_value ?? g.missing ?? 'N/A') }];
          const visualRaw = g.visual_evidence ?? g.visual ?? g.evidence ?? '';
          const visuals = Array.isArray(visualRaw) ? visualRaw.map((v:any)=>sanitize(v)).filter(Boolean) : [sanitize(visualRaw)].filter(Boolean);
          const recommendation = sanitize(g.recommendation ?? g.recommendation_action ?? g.action ?? '');
          const confidence = g.confidence !== undefined && g.confidence !== null ? Number(g.confidence) : undefined;
          const confPct = typeof confidence === 'number' ? (confidence > 1 ? Math.min(100, confidence) : Math.round(confidence * 100)) : undefined;
          const priority = g.priority_score !== undefined && g.priority_score !== null ? Number(g.priority_score) : undefined;
          const trends = g.google_trends ?? g.trends ?? null;

          return (
            <Card key={i} variant="outlined" sx={{ boxShadow: 0 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Avatar sx={{ bgcolor: '#ffb300', color: '#000' }}>{name.charAt(0)}</Avatar>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Gap found
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Chip
                      label={(g.gap_type ?? g.raw?.gap_type ?? g.raw?.type ?? 'missing_attribute').toString()}
                      size="small"
                      variant="outlined"
                      color={((g.gap_type ?? g.raw?.gap_type ?? g.raw?.type) === 'missing_attribute') ? 'secondary' : 'default'}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <Box sx={{ mt: 0.5 }}>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                      {suggestedObjs && suggestedObjs.length > 0 ? (
                        suggestedObjs.map((s: any, idx: number) => (
                          <Chip
                            key={idx}
                            label={`${sanitize(s.value)}${s.percentage !== undefined ? ` — ${s.percentage}%` : ''}${s.confidence !== undefined ? ` (${s.confidence})` : ''}`}
                            variant="outlined"
                            color="primary"
                            size="small"
                          />
                        ))
                      ) : (
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>N/A</Typography>
                      )}
                    </Stack>
                  </Box>
                  {recommendation && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                      Recommendation: {recommendation}
                    </Typography>
                  )}
                </Box>

                {visuals.length > 0 && (
                  <Stack direction="row" spacing={1} sx={{ my: 1 }}>
                    {visuals.map((v: string, idx: number) => (
                      (/^https?:\/\//i.test(v) || v.startsWith('data:')) ? (
                        <Avatar
                          key={idx}
                          src={v}
                          alt={`${name}-evidence-${idx}`}
                          variant="rounded"
                          sx={{ width: 72, height: 72, border: '1px solid rgba(0,0,0,0.08)' }}
                        />
                      ) : (
                        <Box key={idx} sx={{ p: 1, border: '1px solid rgba(0,0,0,0.04)', borderRadius: 1, bgcolor: 'background.paper', minWidth: 200 }}>
                          <Typography variant="body2">{v}</Typography>
                        </Box>
                      )
                    ))}
                  </Stack>
                )}

                <Box sx={{ mt: 1 }}>
                  {typeof confPct === 'number' ? (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="caption" color="textSecondary">Confidence</Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{confPct}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={confPct}
                        sx={{ height: 8, borderRadius: 1, bgcolor: 'divider' }}
                        color={confPct >= 80 ? 'success' : confPct >= 50 ? 'warning' : 'error'}
                      />
                    </>
                  ) : null}
                </Box>

                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button size="small" variant="contained" color="primary">Resolve</Button>
                  <Button size="small" variant="outlined">Suggest Value</Button>
                  {typeof priority === 'number' && <Chip label={`Priority ${Math.round(priority)}`} size="small" />}
                </Box>

                {trends && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="textSecondary">Market Trend</Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5, flexWrap: 'wrap' }}>
                      <Chip label={`Interest ${trends.interest_score ?? ''}`} size="small" />
                      <Chip label={`Direction: ${trends.direction ?? ''}`} size="small" />
                      {Array.isArray(trends.related_searches) && (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>{trends.related_searches.slice(0,5).map((r: any, ri: number) => <Chip key={ri} label={r} size="small" variant="outlined" />)}</Box>
                      )}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    );
  }

  // Fallback: string-based gaps
  return (
    <Stack spacing={1.5}>
      {gapStrings.map((s, idx) => (
        <Card key={idx} variant="outlined">
          <CardContent>
            <Typography variant="body2">{s}</Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

export default GapAnalysis;
