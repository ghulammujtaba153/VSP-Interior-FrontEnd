import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import { Close, Visibility } from '@mui/icons-material'

const ViewCabinetMaterialModal = ({ open, onClose, data }) => {
  if (!data) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            View Cabinet Material
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Material Details */}
          <Box mb={3}>
            <Typography variant="h6" color="primary" gutterBottom>
              Cabinet Information
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Title:</strong> {data.title || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Description:</strong> {data.description || 'No description available'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Created:</strong> {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
              {data.updatedAt && (
                <Typography variant="body1" gutterBottom>
                  <strong>Last Updated:</strong> {new Date(data.updatedAt).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Associated Cabinets */}
          <Box>
            <Typography variant="h6" color="primary" gutterBottom>
              Associated Cabinets
            </Typography>
            {data.cabinetMaterials && data.cabinetMaterials.length > 0 ? (
              <Box>
                {data.cabinetMaterials.map((cabinetMaterial, index) => {
                  const cabinet = cabinetMaterial.cabinet;
                  return (
                    <Box key={cabinet.id} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      {/* Cabinet Header */}
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Chip 
                          label={`#${index + 1}`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                        <Typography variant="body1" fontWeight="medium">
                          {cabinet.code}
                        </Typography>
                      </Box>

                      {/* Cabinet Details */}
                      <Box sx={{ pl: 2, mb: 2 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          <strong>Category:</strong> {cabinet.cabinetCategory?.name || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          <strong>Subcategory:</strong> {cabinet.cabinetSubCategory?.name || 'N/A'}
                        </Typography>
                        {cabinet.description && (
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            <strong>Description:</strong> {cabinet.description}
                          </Typography>
                        )}
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          <strong>Status:</strong> 
                          <Chip 
                            label={cabinet.status || 'N/A'} 
                            color={cabinet.status === 'active' ? 'success' : 'default'} 
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                      </Box>

                      {/* Dynamic Properties */}
                      {cabinet.dynamicData && Object.keys(cabinet.dynamicData).length > 0 && (
                        <Box sx={{ pl: 2 }}>
                          <Typography variant="subtitle2" color="primary" gutterBottom>
                            Properties:
                          </Typography>
                          <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
                            {Object.entries(cabinet.dynamicData).map(([key, value], index) => (
                              <Box
                                key={key}
                                sx={{
                                  display: 'flex',
                                  borderBottom: index < Object.keys(cabinet.dynamicData).length - 1 ? '1px solid #e0e0e0' : 'none',
                                  '&:nth-of-type(even)': { backgroundColor: '#fafafa' }
                                }}
                              >
                                <Box
                                  sx={{
                                    flex: '0 0 40%',
                                    p: 1.5,
                                    borderRight: '1px solid #e0e0e0',
                                    backgroundColor: '#f5f5f5',
                                    fontWeight: 'medium',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                >
                                  {key}:
                                </Box>
                                <Box
                                  sx={{
                                    flex: '1',
                                    p: 1.5,
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                >
                                  {value}
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ pl: 2 }}>
                No cabinets associated with this material.
              </Typography>
            )}
          </Box>

          {/* Dynamic Properties if any */}
          {data.dynamicData && Object.keys(data.dynamicData).length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="h6" color="primary" gutterBottom>
                  Additional Properties
                </Typography>
                <Box sx={{ pl: 2 }}>
                  {Object.entries(data.dynamicData).map(([key, value]) => (
                    <Typography key={key} variant="body2" gutterBottom>
                      <strong>{key}:</strong> {value}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ViewCabinetMaterialModal