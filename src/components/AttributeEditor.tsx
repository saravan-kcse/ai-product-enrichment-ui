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
  LinearProgress,
  Chip,
} from '@mui/material';
import { Attribute } from '../types';

interface AttributeEditorProps {
  open: boolean;
  attribute: Attribute | null;
  onSave: (attribute: Attribute) => void;
  onClose: () => void;
}

export const AttributeEditor: React.FC<AttributeEditorProps> = ({
  open,
  attribute,
  onSave,
  onClose,
}) => {
  const [editedAttribute, setEditedAttribute] = React.useState<Attribute | null>(
    attribute
  );

  React.useEffect(() => {
    setEditedAttribute(attribute);
  }, [attribute]);

  if (!editedAttribute) return null;

  const handleSave = () => {
    if (editedAttribute) {
      onSave(editedAttribute);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Attribute: {editedAttribute.name}</DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Type: {editedAttribute.attributeType}
            </Typography>
            {editedAttribute.attributeType === 'percentage' && (
              <Typography variant="caption" color="textSecondary">
                Shows weighted breakdown (e.g., Color: 60% Black, 40% White)
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Current Values:
            </Typography>
            <Stack spacing={1}>
              {editedAttribute.values.map((val, idx) => (
                <Box key={idx}>
                  <Typography variant="body2">
                    {val.value}
                    {val.percentage !== undefined && ` (${val.percentage}%)`}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ flex: 1 }}>
                      Confidence: {val.confidence}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={val.confidence}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                  {val.isNew && (
                    <Chip
                      label="Trend Suggestion"
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              ))}
            </Stack>
          </Box>

          {editedAttribute.allowableValues && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Allowable Values:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {editedAttribute.allowableValues.map((val) => (
                  <Chip key={val} label={val} variant="outlined" />
                ))}
              </Box>
            </Box>
          )}

          {editedAttribute.isMandatory && (
            <Chip
              label="Mandatory Field"
              color="error"
              variant="outlined"
              sx={{ width: 'fit-content' }}
            />
          )}

          <TextField
            label="Notes"
            multiline
            rows={3}
            fullWidth
            defaultValue=""
            placeholder="Add notes about this attribute..."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
