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
  Stack,
  Grid
} from "@mui/material";
import {
  Inventory,
  Category,
  Receipt,
  Scale,
  AttachMoney,
  Numbers,
  Business,
  Email,
  Phone,
  LocationOn,
  QrCode,
  Description
} from "@mui/icons-material";

const ViewInventoryModal = ({ open, setOpen, inventory }) => {
  if (!inventory) return null;

  return (
    <Dialog 
      open={open} 
      onClose={() => setOpen(false)} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Inventory color="primary" />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Inventory Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete information about the inventory item
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={4}>
          {/* Basic Information */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Basic Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <QrCode fontSize="small" />
                      ID & Code
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                      <Typography variant="body1">ID: {inventory.id}</Typography>
                      {inventory.itemCode && (
                        <Typography variant="body1">Code: {inventory.itemCode}</Typography>
                      )}
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Inventory fontSize="small" />
                      Item Name
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {inventory.name}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Category fontSize="small" />
                      Category
                    </Typography>
                    <Typography variant="body1">
                      {inventory.categoryDetails?.name || "N/A"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Numbers fontSize="small" />
                      Quantity
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {inventory.quantity} units
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          {/* Pricing Information */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Pricing Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AttachMoney fontSize="small" />
                      Cost Price
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      ${parseFloat(inventory.costPrice || 0).toFixed(2)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Receipt fontSize="small" />
                      Price Book
                    </Typography>
                    <Typography variant="body1">
                      {inventory.priceBooks?.name || "N/A"}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Scale fontSize="small" />
                      Unit
                    </Typography>
                    <Typography variant="body1">
                      {inventory.priceBooks?.unit || "N/A"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Status
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      textTransform: 'capitalize',
                      color: inventory.status === 'active' ? 'success.main' : 'text.primary'
                    }}>
                      {inventory.status}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          {/* Description */}
          {inventory.description && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Description
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Description color="action" sx={{ mt: 0.5 }} />
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {inventory.description}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Supplier Information */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Supplier Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Business fontSize="small" />
                      Supplier Name
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {inventory.supplier?.name || "N/A"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Email fontSize="small" />
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {inventory.supplier?.email || "N/A"}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Phone fontSize="small" />
                      Phone
                    </Typography>
                    <Typography variant="body1">
                      {inventory.supplier?.phone || "N/A"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationOn fontSize="small" />
                      Address
                    </Typography>
                    <Typography variant="body1">
                      {inventory.supplier?.address || "N/A"}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={() => setOpen(false)} 
          variant="contained" 
          color="primary"
          size="large"
          sx={{ minWidth: 120 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewInventoryModal;