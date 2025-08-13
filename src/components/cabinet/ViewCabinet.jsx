"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
} from "@mui/material";

const ViewCabinet = ({ open, setOpen, data }) => {
  if (!data) return null;

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Cabinet Details</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Model Name</Typography>
            <Typography>{data.modelName}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Material</Typography>
            <Typography>{data.material}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="subtitle2">Height</Typography>
            <Typography>{data.height}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="subtitle2">Width</Typography>
            <Typography>{data.width}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="subtitle2">Depth</Typography>
            <Typography>{data.depth ?? "N/A"}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Base Price</Typography>
            <Typography>${data.basePrice}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Price per Sqft</Typography>
            <Typography>${data.pricePerSqft ?? "N/A"}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Status</Typography>
            <Typography>{data.status}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Created At</Typography>
            <Typography>{new Date(data.createdAt).toLocaleString()}</Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewCabinet;
