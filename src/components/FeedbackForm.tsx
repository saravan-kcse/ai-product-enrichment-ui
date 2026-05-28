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
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
} from '@mui/material';
import { FeedbackSubmission } from '../types';

interface FeedbackFormProps {
  open: boolean;
  productId: string;
  attributeName: string;
  suggestedValue: string;
  onSubmit: (feedback: FeedbackSubmission) => void;
  onClose: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  open,
  productId,
  attributeName,
  suggestedValue,
  onSubmit,
  onClose,
}) => {
  const [feedbackType, setFeedbackType] = React.useState<
    'correct' | 'incorrect' | 'partial'
  >('correct');
  const [correctValue, setCorrectValue] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const handleSubmit = () => {
    // For general feedback, use "General Enrichment Quality" as attribute name
    const finalAttributeName = attributeName || 'General Enrichment Quality';
    const feedback: FeedbackSubmission = {
      productId,
      attributeName: finalAttributeName,
      suggestedValue,
      userFeedback: feedbackType,
      correctValue: feedbackType !== 'correct' ? correctValue : undefined,
      notes: notes || undefined,
      timestamp: new Date().toISOString(),
    };
    onSubmit(feedback);
    setFeedbackType('correct');
    setCorrectValue('');
    setNotes('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Provide Feedback</DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          <Alert severity="info">
            <Typography variant="body2">
              Your feedback helps us retrain and improve the AI model. Thank you!
            </Typography>
          </Alert>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Details:
            </Typography>
            {attributeName ? (
              <>
                <Typography variant="body2" color="textSecondary">
                  Attribute: <strong>{attributeName}</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                  Suggested Value: <strong>{suggestedValue}</strong>
                </Typography>
              </>
            ) : (
              <Alert severity="info" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  Provide general feedback about the enrichment quality for this product.
                </Typography>
              </Alert>
            )}
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              Product: <strong>{productId}</strong>
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Is this suggestion:
            </Typography>
            <RadioGroup
              value={feedbackType}
              onChange={(e) =>
                setFeedbackType(e.target.value as typeof feedbackType)
              }
            >
              <FormControlLabel
                value="correct"
                control={<Radio />}
                label="Correct ✓"
              />
              <FormControlLabel
                value="partial"
                control={<Radio />}
                label="Partially Correct (needs adjustment)"
              />
              <FormControlLabel
                value="incorrect"
                control={<Radio />}
                label="Incorrect ✗"
              />
            </RadioGroup>
          </Box>

          {feedbackType !== 'correct' && (
            <TextField
              label="What should it be?"
              fullWidth
              value={correctValue}
              onChange={(e) => setCorrectValue(e.target.value)}
              placeholder="Enter the correct value"
              required
            />
          )}

          <TextField
            label="Additional Notes (optional)"
            multiline
            rows={3}
            fullWidth
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any context or observations..."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            feedbackType !== 'correct' && !correctValue
          }
        >
          Submit Feedback
        </Button>
      </DialogActions>
    </Dialog>
  );
};
