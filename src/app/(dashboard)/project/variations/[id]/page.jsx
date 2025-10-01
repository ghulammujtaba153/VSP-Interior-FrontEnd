"use client"

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Alert,
  Fab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon
} from "@mui/icons-material";
import Loader from "@/components/loader/Loader";
import { BASE_URL } from "@/configs/url";
import Link from "next/link";

const Page = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, variationId: null });

  const [variations, setVariations] = useState([
    { title: "", description: "", cost: "" },
  ]);

  const steps = ['Variation Details', 'Review & Submit'];

  // Calculate total cost from all variation records
  const calculateTotalCost = (variationsData) => {
    if (!variationsData || !Array.isArray(variationsData)) return 0;
    
    return variationsData.reduce((total, record) => {
      if (record.variations && Array.isArray(record.variations)) {
        const recordTotal = record.variations.reduce((sum, variation) => {
          return sum + (Number(variation.cost) || 0);
        }, 0);
        return total + recordTotal;
      }
      return total;
    }, 0);
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/project-variation/get/${id}`);
      // Ensure we're working with an array
      const responseData = Array.isArray(res.data) ? res.data : [res.data];
      setData(responseData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch project variations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const addVariationField = () => {
    setVariations([...variations, { title: "", description: "", cost: "" }]);
  };

  const removeVariationField = (index) => {
    if (variations.length > 1) {
      const newVariations = variations.filter((_, i) => i !== index);
      setVariations(newVariations);
    }
  };

  const handleChange = (index, field, value) => {
    const newVariations = [...variations];
    newVariations[index][field] = value;
    setVariations(newVariations);
  };

  const handleNext = () => {
    // Validate all fields before proceeding to next step
    const allFieldsFilled = variations.every(v => v.title && v.description && v.cost);
    if (!allFieldsFilled) {
      toast.error("Please fill all fields before proceeding");
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const resetForm = () => {
    setVariations([{ title: "", description: "", cost: "" }]);
    setActiveStep(0);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Creating project variations...");

    try {
      const payload = {
        projectId: id,
        variations: variations.map((v) => ({
          title: v.title,
          description: v.description,
          cost: Number(v.cost),
        })),
      };

      await axios.post(`${BASE_URL}/api/project-variation/create`, payload);

      toast.dismiss(loadingToast);
      toast.success("Project variations created successfully!");
      resetForm();
      fetchData();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to create project variations!");
      console.error(error);
    }
  };

  const handleDeleteVariation = async (variationId) => {
    try {
      await axios.delete(`${BASE_URL}/api/project-variation/delete/${variationId}`);
      toast.success("Variation record deleted successfully!");
      setDeleteDialog({ open: false, variationId: null });
      fetchData();
    } catch (error) {
      toast.error("Failed to delete variation record!");
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalNewCost = variations.reduce((sum, variation) => sum + (Number(variation.cost) || 0), 0);
  const overallTotalCost = calculateTotalCost(data);

  if (loading) return <Loader />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 2 }}>
            <Link href="/project/variations">
                <Button variant="outlined" color="primary">
                Back to Variations
                </Button>
            </Link>
        </Box>

      {/* Header Section */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: 'primary.main', color: 'white' }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Project Variations
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
          <Box>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Project ID: {id}
            </Typography>
            {data[0]?.project && (
              <>
                <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                  <BusinessIcon sx={{ fontSize: 16, mr: 1 }} />
                  {data[0].project.projectName} - {data[0].project.client.companyName}
                </Typography>
              </>
            )}
          </Box>
          <Chip 
            icon={<MoneyIcon />} 
            label={`Total Project Cost: $${overallTotalCost.toLocaleString()}`}
            color="secondary"
            sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.2)', fontSize: '1.1rem', py: 2 }}
          />
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Existing Variations Section */}
        <Grid item xs={12} fullWidth>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight="bold">
                Variation History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.length} record(s) found
              </Typography>
            </Box>

            {data && data.length > 0 ? (
              <Box>
                {data.map((record, recordIndex) => {
                  const recordTotal = record.variations?.reduce((sum, variation) => 
                    sum + (Number(variation.cost) || 0), 0
                  ) || 0;

                  return (
                    <Accordion key={record.id} sx={{ mb: 3 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                Variation Record #{record.id}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <CalendarIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                {formatDate(record.created_at)}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              icon={<MoneyIcon />}
                              label={`Record Total: $${recordTotal.toLocaleString()}`}
                              color="primary"
                              variant="outlined"
                            />
                            <IconButton 
                              color="error" 
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent accordion from expanding/collapsing
                                setDeleteDialog({ open: true, variationId: record.id });
                              }}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Created: {formatDate(record.created_at)} | 
                            Updated: {formatDate(record.updated_at)}
                          </Typography>
                        </Box>
                        
                        {record.variations && record.variations.length > 0 ? (
                          <TableContainer component={Paper} variant="outlined">
                            <Table>
                              <TableHead>
                                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                                  <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Title</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', width: '50%' }}>Description</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', width: '25%', textAlign: 'right' }}>Cost</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {record.variations.map((variation, variationIndex) => (
                                  <TableRow 
                                    key={variationIndex}
                                    sx={{ 
                                      '&:last-child td, &:last-child th': { border: 0 },
                                      '&:hover': { backgroundColor: 'grey.50' }
                                    }}
                                  >
                                    <TableCell>
                                      <Typography variant="subtitle2" fontWeight="medium">
                                        {variation.title}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" color="text.secondary">
                                        {variation.description}
                                      </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'right' }}>
                                      <Chip 
                                        label={`$${Number(variation.cost).toLocaleString()}`}
                                        color="success"
                                        size="small"
                                        variant="outlined"
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                                {/* Total Row */}
                                <TableRow sx={{ backgroundColor: 'primary.light' }}>
                                  <TableCell colSpan={2} sx={{ textAlign: 'right', border: 'none' }}>
                                    <Typography variant="subtitle1" fontWeight="bold" color="white">
                                      Record Total:
                                    </Typography>
                                  </TableCell>
                                  <TableCell sx={{ textAlign: 'right', border: 'none' }}>
                                    <Typography variant="subtitle1" fontWeight="bold" color="white">
                                      ${recordTotal.toLocaleString()}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : (
                          <Alert severity="info">
                            No variations found in this record.
                          </Alert>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Box>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                No variation records found. Start by adding your first variation.
              </Alert>
            )}

            {/* Summary Card */}
            {data.length > 0 && (
              <Card sx={{ mt: 3, backgroundColor: 'success.main', color: 'white' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                      Project Total Cost
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      ${overallTotalCost.toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                    Sum of all variations across {data.length} record(s)
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Paper>
        </Grid>

        Add Variations Form Section
        {showForm && (
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Add New Variations
              </Typography>

              {/* <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper> */}

              <form onSubmit={handleSubmit}>
                {activeStep === 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom color="primary">
                      Variation Details
                    </Typography>
                    
                    {variations.map((variation, index) => (
                      <Card key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'grey.300' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="subtitle1" color="primary">
                            Variation #{index + 1}
                          </Typography>
                          {variations.length > 1 && (
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => removeVariationField(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>

                        <TextField
                          fullWidth
                          label="Variation Title"
                          value={variation.title}
                          onChange={(e) => handleChange(index, "title", e.target.value)}
                          required
                          margin="normal"
                          size="small"
                        />
                        <TextField
                          fullWidth
                          label="Variation Description"
                          value={variation.description}
                          onChange={(e) => handleChange(index, "description", e.target.value)}
                          required
                          multiline
                          rows={3}
                          margin="normal"
                          size="small"
                        />
                        <TextField
                          fullWidth
                          label="Cost ($)"
                          type="number"
                          value={variation.cost}
                          onChange={(e) => handleChange(index, "cost", e.target.value)}
                          required
                          margin="normal"
                          size="small"
                          InputProps={{
                            startAdornment: <MoneyIcon color="action" sx={{ mr: 1 }} />,
                          }}
                        />
                      </Card>
                    ))}

                    <Button
                      startIcon={<AddIcon />}
                      onClick={addVariationField}
                      variant="outlined"
                      sx={{ mt: 1 }}
                    >
                      Add Another Variation
                    </Button>

                    {totalNewCost > 0 && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Total new cost: <strong>${totalNewCost.toLocaleString()}</strong>
                      </Alert>
                    )}
                  </Box>
                )}

                {/* {activeStep === 1 && (
                  <Box>
                    <Typography variant="h6" gutterBottom color="primary">
                      Review Variations
                    </Typography>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      Please review the variations before submitting
                    </Alert>
                    
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: 'grey.50' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Cost</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {variations.map((variation, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Typography variant="subtitle2">
                                  {variation.title}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {variation.description}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ textAlign: 'right' }}>
                                <Typography variant="body2" fontWeight="medium">
                                  ${Number(variation.cost).toLocaleString()}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow sx={{ backgroundColor: 'primary.light' }}>
                            <TableCell colSpan={2} sx={{ textAlign: 'right', border: 'none' }}>
                              <Typography variant="subtitle1" fontWeight="bold" color="white">
                                Total:
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: 'right', border: 'none' }}>
                              <Typography variant="subtitle1" fontWeight="bold" color="white">
                                ${totalNewCost.toLocaleString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Alert severity="success" sx={{ mt: 2 }}>
                      <strong>Total to be added: ${totalNewCost.toLocaleString()}</strong>
                      <br />
                      New project total: ${(overallTotalCost + totalNewCost).toLocaleString()}
                    </Alert>
                  </Box>
                )} */}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  {activeStep === 0 ? (
                    <Button onClick={resetForm} color="inherit">
                      Cancel
                    </Button>
                  ) : (
                    <Button onClick={handleBack} color="inherit">
                      Back
                    </Button>
                  )}
                  
                  <Box>
                    
                      <Button 
                        variant="contained" 
                        onClick={handleNext}
                        disabled={!variations.every(v => v.title && v.description && v.cost)}
                      >
                        Submit
                      </Button>

                  </Box>
                </Box>
              </form>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Floating Action Button */}
      {!showForm && (
        <Fab
          color="primary"
          aria-label="add variations"
          onClick={() => setShowForm(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, variationId: null })}
      >
        <DialogTitle>Delete Variation Record</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this entire variation record? This will remove all variations in this record and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, variationId: null })}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleDeleteVariation(deleteDialog.variationId)} 
            color="error"
            variant="contained"
          >
            Delete Record
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Page;