import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Button,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

interface HeaderProps {
  onExportClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onExportClick,
}) => {

  return (
    <AppBar position="sticky" sx={{ zIndex: 100 }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'secondary.main',
              width: 40,
              height: 40,
              fontWeight: 'bold',
            }}
          >
            AI
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              AI Product Enrichment
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              POC - Fashion & Home Catalog
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            color="inherit"
            onClick={onExportClick}
            title="Export Results"
          >
            <Download />
          </IconButton>
          <Button color="inherit" component={RouterLink} to="/admin/allowable-upload">
            Admin
          </Button>
          
        </Box>
      </Toolbar>
    </AppBar>
  );
};
