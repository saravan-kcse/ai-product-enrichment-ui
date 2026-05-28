import React, { useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Grid,
  TextField,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Upload,
  PlayArrow,
  Pause,
  Stop,
} from '@mui/icons-material';
import { BatchProcessingDialog } from '../components';
import { enrichmentAPI } from '../services/api';
import toast from 'react-hot-toast';

interface BatchJob {
  id: string;
  name: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'paused';
  totalProducts: number;
  processedProducts: number;
  failedProducts: number;
  progress: number;
}

export const BatchPage: React.FC = () => {
  const [batchOpen, setBatchOpen] = useState(false);
  const [jobs, setJobs] = useState<BatchJob[]>([
    {
      id: '1',
      name: 'Fashion Department - Week 1',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed',
      totalProducts: 500,
      processedProducts: 500,
      failedProducts: 0,
      progress: 100,
    },
    {
      id: '2',
      name: 'Home Furniture Collection',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'processing',
      totalProducts: 300,
      processedProducts: 187,
      failedProducts: 3,
      progress: 62,
    },
  ]);
  const [selectedJob, setSelectedJob] = useState<BatchJob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobProgress, setJobProgress] = useState(0);

  const handleBatchSubmit = async (input: any) => {
    setIsProcessing(true);
    try {
      // Simulate batch processing
      for (let i = 0; i <= 100; i += 10) {
        setJobProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const newJob: BatchJob = {
        id: String(jobs.length + 1),
        name: `Batch Job ${jobs.length + 1}`,
        createdAt: new Date().toISOString(),
        status: 'completed',
        totalProducts: 100,
        processedProducts: 100,
        failedProducts: 0,
        progress: 100,
      };

      setJobs([newJob, ...jobs]);
      toast.success('Batch processing completed!');
      setBatchOpen(false);
    } catch (error) {
      toast.error('Batch processing failed');
    } finally {
      setIsProcessing(false);
      setJobProgress(0);
    }
  };

  const getStatusColor = (status: BatchJob['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'info';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'paused':
        return 'default';
      default:
        return 'default';
    }
  };

  const handlePauseJob = (jobId: string) => {
    setJobs(
      jobs.map((job) =>
        job.id === jobId ? { ...job, status: 'paused' } : job
      )
    );
    toast.info('Job paused');
  };

  const handleResumeJob = (jobId: string) => {
    setJobs(
      jobs.map((job) =>
        job.id === jobId ? { ...job, status: 'processing' } : job
      )
    );
    toast.info('Job resumed');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Batch Processing
        </Typography>
        <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={() => setBatchOpen(true)}
        >
          Start New Batch
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="textSecondary">
                Total Jobs
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {jobs.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="textSecondary">
                Processing
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {jobs.filter((j) => j.status === 'processing').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="textSecondary">
                Completed
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {jobs.filter((j) => j.status === 'completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="textSecondary">
                Total Processed
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {jobs.reduce((sum, j) => sum + j.processedProducts, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Jobs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Active & Recent Jobs
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell>Job Name</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Progress</TableCell>
                  <TableCell align="center">Products</TableCell>
                  <TableCell align="center">Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id} hover>
                    <TableCell>{job.name}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={job.status}
                        color={getStatusColor(job.status)}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={job.progress}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ minWidth: 40 }}>
                          {job.progress}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box>
                        <Typography variant="caption">
                          {job.processedProducts}/{job.totalProducts}
                        </Typography>
                        {job.failedProducts > 0 && (
                          <Typography variant="caption" color="error" sx={{ display: 'block' }}>
                            {job.failedProducts} failed
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5}>
                        {job.status === 'processing' && (
                          <Button
                            size="small"
                            startIcon={<Pause />}
                            onClick={() => handlePauseJob(job.id)}
                          >
                            Pause
                          </Button>
                        )}
                        {job.status === 'paused' && (
                          <Button
                            size="small"
                            startIcon={<PlayArrow />}
                            onClick={() => handleResumeJob(job.id)}
                          >
                            Resume
                          </Button>
                        )}
                        {(job.status === 'processing' || job.status === 'paused') && (
                          <Button size="small" startIcon={<Stop />}>
                            Stop
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Information Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Batch Processing Features
              </Typography>
              <Stack spacing={1}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    ✓ CSV Import
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Upload product data in CSV format
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    ✓ Real-time Progress
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Monitor enrichment progress in real-time
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    ✓ Pause & Resume
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Control batch processing as needed
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    ✓ Error Handling
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Automatic retry and error reporting
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Processing Capacity
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Average daily processing: 1,500-2,000 items
              </Alert>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Current Load
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={45}
                    sx={{ mb: 0.5 }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    45% of daily capacity used
                  </Typography>
                </Box>
                <Button variant="outlined" fullWidth>
                  View Capacity Planning
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Batch Dialog */}
      <BatchProcessingDialog
        open={batchOpen}
        onClose={() => {
          setBatchOpen(false);
          setJobProgress(0);
        }}
        onSubmit={handleBatchSubmit}
        isProcessing={isProcessing}
        progress={jobProgress}
      />
    </Container>
  );
};
