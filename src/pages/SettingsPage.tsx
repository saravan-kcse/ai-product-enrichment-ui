import React from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import { Info, Security, Speed, Palette } from '@mui/icons-material';

export const SettingsPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Settings & Configuration
      </Typography>

      <Grid container spacing={3}>
        {/* API Configuration */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Info sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  API Configuration
                </Typography>
              </Box>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Backend URL
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    http://127.0.0.1:8000
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    API Version
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    v1.0.0
                  </Typography>
                </Box>
                <Button variant="outlined">Test Connection</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Enrichment Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Speed sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Enrichment Thresholds
                </Typography>
              </Box>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Auto-Accept Threshold"
                    secondary="Products with confidence ≥ 90% are automatically accepted"
                  />
                  <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 2 }}>
                    90%
                  </Typography>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Review Threshold"
                    secondary="Products with 70-90% confidence require human review"
                  />
                  <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 2 }}>
                    70%
                  </Typography>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Manual Review Threshold"
                    secondary="Products below 70% confidence require manual review"
                  />
                  <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 2 }}>
                    &lt; 70%
                  </Typography>
                </ListItem>
              </List>
              <Button variant="outlined" sx={{ mt: 2 }}>
                Adjust Thresholds
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Privacy & Security */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Security sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Privacy & Security
                </Typography>
              </Box>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Data Encryption"
                    secondary="All API communications use HTTPS"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Data Retention"
                    secondary="Enrichment results are retained for 90 days"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="GDPR Compliance"
                    secondary="System complies with GDPR data protection requirements"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* UI Customization */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Palette sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  UI Preferences
                </Typography>
              </Box>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Theme
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Light Mode
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Items Per Page
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    25 items
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};
