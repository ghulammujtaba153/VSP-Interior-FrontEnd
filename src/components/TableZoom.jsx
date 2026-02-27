"use client";

import React from 'react';
import { Box, Slider, Typography } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

const TableZoom = ({ zoom, onZoomChange }) => {
  return (
    <Box display="flex" alignItems="center" sx={{ ml: 1 }}>
      <ZoomOutIcon fontSize="small" />
      <Slider
        value={zoom}
        onChange={onZoomChange}
        step={0.05}
        min={0.7}
        max={1.6}
        aria-label="Zoom"
        sx={{ width: 140, mx: 1 }}
      />
      <ZoomInIcon fontSize="small" />
      <Typography variant="body2" sx={{ ml: 1, width: 48 }}>
        {Math.round(zoom * 100)}%
      </Typography>
    </Box>
  );
};

export default TableZoom;
