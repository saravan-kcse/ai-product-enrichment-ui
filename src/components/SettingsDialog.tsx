import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Box,
  Typography,
  Slider,
  FormControlLabel,
  Switch,
} from '@mui/material';

interface ThresholdSettings {
  autoAcceptThreshold: number;
  reviewThreshold: number;
  enableAutoExport: boolean;
  enableNotifications: boolean;
}

interface SettingsDialogProps {
  open: boolean;
  settings: ThresholdSettings;
  onSave: (settings: ThresholdSettings) => void;
  onClose: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  settings,
  onSave,
  onClose,
}) => {
  const [editedSettings, setEditedSettings] = React.useState<ThresholdSettings>(
    settings
  );

  React.useEffect(() => {
    setEditedSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(editedSettings);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Enrichment Settings</DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
              Confidence Thresholds
            </Typography>

            <Box sx={{ px: 2, mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Auto-Accept Threshold: {editedSettings.autoAcceptThreshold}%
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: 'block', mb: 1 }}
              >
                Products with confidence ≥ {editedSettings.autoAcceptThreshold}%
                are automatically accepted
              </Typography>
              <Slider
                value={editedSettings.autoAcceptThreshold}
                onChange={(e, value) =>
                  setEditedSettings({
                    ...editedSettings,
                    autoAcceptThreshold: value as number,
                  })
                }
                min={50}
                max={100}
                marks={[
                  { value: 50, label: '50%' },
                  { value: 75, label: '75%' },
                  { value: 100, label: '100%' },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>

            <Box sx={{ px: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Review Threshold: {editedSettings.reviewThreshold}%
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: 'block', mb: 1 }}
              >
                Products with confidence {editedSettings.reviewThreshold}% -{' '}
                {editedSettings.autoAcceptThreshold}% need human review
              </Typography>
              <Slider
                value={editedSettings.reviewThreshold}
                onChange={(e, value) =>
                  setEditedSettings({
                    ...editedSettings,
                    reviewThreshold: value as number,
                  })
                }
                min={0}
                max={editedSettings.autoAcceptThreshold}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 50, label: '50%' },
                  { value: 100, label: '100%' },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
              Features
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={editedSettings.enableAutoExport}
                  onChange={(e) =>
                    setEditedSettings({
                      ...editedSettings,
                      enableAutoExport: e.target.checked,
                    })
                  }
                />
              }
              label="Auto-export enriched data on completion"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editedSettings.enableNotifications}
                  onChange={(e) =>
                    setEditedSettings({
                      ...editedSettings,
                      enableNotifications: e.target.checked,
                    })
                  }
                />
              }
              label="Enable browser notifications"
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};
