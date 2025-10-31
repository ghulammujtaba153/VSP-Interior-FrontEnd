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
  Grid,
  Paper,
  Chip,
  Divider
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
  Description,
  Close
} from "@mui/icons-material";

const ViewInventoryModal = ({ open, setOpen, inventory }) => {
  if (!inventory) return null;

  const InfoRow = ({ icon: Icon, label, value }) => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'flex-start', 
      gap: 1.5,
      py: 1.5
    }}>
      <Box sx={{ 
        minWidth: 40, 
        height: 40, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#f0f0f5',
        color: '#6366f1',
        borderRadius: 1,
        flexShrink: 0
      }}>
        <Icon fontSize="small" />
      </Box>
      <Box flex={1} minWidth={0}>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, fontSize: '0.7rem' }}>
          {label}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            mt: 0.5, 
            fontWeight: 500,
            wordBreak: 'break-word'
          }}
        >
          {value || 'N/A'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={() => setOpen(false)} 
      maxWidth="md" 
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2, 
        pt: 3,
        px: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Inventory sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {inventory.name || 'Inventory Details'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Complete item information
            </Typography>
          </Box>
        </Box>
        <Chip 
          label={inventory.status || 'N/A'} 
          size="small"
          sx={{ 
            bgcolor: inventory.status === 'active' ? 'success.light' : 'error.light',
            color: 'white',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            fontSize: '0.7rem'
          }}
        />
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Stack spacing={0}>
          {/* Basic Information */}
          <Box sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              gutterBottom 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 2,
                color: 'primary.main'
              }}
            >
              <Inventory />
              Basic Information
            </Typography>

            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: 'white' }}>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={4}>
                  <Grid item xs={6} sx={{ mr: 20 }}>
                    <InfoRow 
                      icon={QrCode} 
                      label="Item Code" 
                      value={inventory.itemCode || `ID: ${inventory.id}`} 
                    />
                  </Grid>
                  <Grid item xs={6} sx={{ mr: 20 }}>
                    <InfoRow 
                      icon={Inventory} 
                      label="Item Name" 
                      value={inventory.name} 
                    />
                  </Grid>
                  <Grid item xs={6} sx={{ mr: 20 }}>
                    <InfoRow 
                      icon={Category} 
                      label="Category" 
                      value={inventory.categoryDetails?.name} 
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <InfoRow 
                      icon={Numbers} 
                      label="Quantity" 
                      value={`${inventory.quantity} units`} 
                    />
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Box>

          <Divider />

          {/* Pricing Information */}
          <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              gutterBottom 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 2,
                color: 'primary.main'
              }}
            >
              <AttachMoney />
              Pricing Information
            </Typography>

            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: 'white' }}>
              <Box sx={{ p: 3 }} >
                <Grid container spacing={4} >
                  <Grid item xs={6} sx={{ mr: 20 }}>
                    <InfoRow 
                      icon={AttachMoney} 
                      label="Cost Price" 
                      value={`$${parseFloat(inventory.costPrice || 0).toFixed(2)}`} 
                    />
                  </Grid>
                  <Grid item xs={6} sx={{ mr: 20 }}>
                    <InfoRow 
                      icon={Scale} 
                      label="Unit" 
                      value={inventory.priceBooks?.unit} 
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoRow 
                      icon={Receipt} 
                      label="Price Book" 
                      value={inventory.priceBooks?.name} 
                    />
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Box>

          <Divider />

          {/* Description */}
          {inventory.description && (
            <>
              <Box sx={{ p: 3, bgcolor: 'background.paper' }}>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  gutterBottom 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    mb: 2,
                    color: 'primary.main'
                  }}
                >
                  <Description />
                  Description
                </Typography>

                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: 'white' }}>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                      {inventory.description}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
              <Divider />
            </>
          )}

          {/* Supplier Information */}
          <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              gutterBottom 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 2,
                color: 'primary.main'
              }}
            >
              <Business />
              Supplier Information
            </Typography>

            {inventory.supplier && (inventory.supplier.name || inventory.supplier.email || inventory.supplier.phone) ? (
              <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: 'white' }}>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={4}>
                    <Grid item xs={6} sx={{ mr: 20 }}>
                      <InfoRow 
                        icon={Business} 
                        label="Supplier Name" 
                        value={inventory.supplier?.name} 
                      />
                    </Grid>
                    <Grid item xs={6} sx={{ mr: 20 }}>
                      <InfoRow 
                        icon={Phone} 
                        label="Phone" 
                        value={inventory.supplier?.phone} 
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <InfoRow 
                        icon={Email} 
                        label="Email" 
                        value={inventory.supplier?.email} 
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <InfoRow 
                        icon={LocationOn} 
                        label="Address" 
                        value={inventory.supplier?.address} 
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            ) : (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 2,
                  bgcolor: 'background.paper'
                }}
              >
                <Business color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  No supplier information available
                </Typography>
              </Paper>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'flex-end', bgcolor: 'grey.50' }}>
        <Button 
          onClick={() => setOpen(false)} 
          variant="contained" 
          color="primary"
          size="large"
          startIcon={<Close />}
          sx={{ 
            minWidth: 120,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewInventoryModal;