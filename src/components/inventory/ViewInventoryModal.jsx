"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider
} from "@mui/material";

const ViewInventoryModal = ({ open, setOpen, inventory }) => {
  if (!inventory) return null;

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Inventory Details</DialogTitle>
      <Divider />
      <DialogContent>
        <Box mb={1}>
          <Typography variant="subtitle2">ID:</Typography>
          <Typography>{inventory.id}</Typography>
        </Box>

        <Box mb={1}>
          <Typography variant="subtitle2">Item Code:</Typography>
          <Typography>{inventory.itemCode}</Typography>
        </Box>

        <Box mb={1}>
          <Typography variant="subtitle2">Name:</Typography>
          <Typography>{inventory.name}</Typography>
        </Box>

        <Box mb={1}>
          <Typography variant="subtitle2">Description:</Typography>
          <Typography>{inventory.description}</Typography>
        </Box>

        <Box mb={1}>
          <Typography variant="subtitle2">Category:</Typography>
          <Typography>{inventory.category}</Typography>
        </Box>

        <Box mb={1}>
          <Typography variant="subtitle2">Unit:</Typography>
          <Typography>{inventory.unit}</Typography>
        </Box>

        <Box mb={1}>
          <Typography variant="subtitle2">Cost Price:</Typography>
          <Typography>${inventory.costPrice}</Typography>
        </Box>

        <Box mb={1}>
          <Typography variant="subtitle2">Quantity:</Typography>
          <Typography>{inventory.quantity}</Typography>
        </Box>

        <Box mb={1}>
          <Typography variant="subtitle2">Status:</Typography>
          <Typography>{inventory.status}</Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6">Supplier Details</Typography>
        <Box mt={1}>
          <Typography variant="subtitle2">Name:</Typography>
          <Typography>{inventory.supplier?.companyName || "N/A"}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2">Email:</Typography>
          <Typography>{inventory.supplier?.email || "N/A"}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2">Phone:</Typography>
          <Typography>{inventory.supplier?.phone || "N/A"}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2">Address:</Typography>
          <Typography>{inventory.supplier?.address || "N/A"}</Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setOpen(false)} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewInventoryModal;
