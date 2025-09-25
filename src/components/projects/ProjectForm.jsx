"use client";

import { BASE_URL } from "@/configs/url";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Paper,
  Grid,
  Divider,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Container,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

const ProjectForm = () => {
  const [clients, setClients] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [projectData, setProjectData] = useState({
    name: "",
    location: "",
    description: "",
    status: "planned",
    shopDrawingSubmissionDate: "",
    siteMeasureDate: "",
    installationDate: "",
    machiningDate: "",
    assemblyDate: "",
    deliveryDate: "",
    installPhaseDate: "",
    estimatedHours: "",
    availableHours: "",
    alertStatus: "green",
  });

  const [clientId, setClientId] = useState("");
  const [projectWorkers, setProjectWorkers] = useState([
    { workerId: "", role: "", assignedHours: "", startDate: "", endDate: "" },
  ]);
  const [allocations, setAllocations] = useState([
    { materialId: "", quantityAllocated: "" },
  ]);

  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchProject();
    }
  }, [id]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [clientRes, inventoryRes, workersRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/client/get`),
        axios.get(`${BASE_URL}/api/inventory/get`),
        axios.get(`${BASE_URL}/api/workers/get`),
      ]);

      setClients(clientRes.data.data || []);
      setInventory(inventoryRes.data.inventory || []);
      setWorkers(workersRes.data.workers || []);
    } catch (error) {
      toast.error("Error fetching initial data");
      console.error(error);
    }
  };

  const fetchProject = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${BASE_URL}/api/projects/get/${id}`);
      const project = res.data.project;

      // Set basic project data
      setProjectData({
        name: project.name || "",
        location: project.location || "",
        description: project.description || "",
        status: project.status || "planned",
        shopDrawingSubmissionDate: project.shopDrawingSubmissionDate
          ? project.shopDrawingSubmissionDate.split("T")[0]
          : "",
        siteMeasureDate: project.siteMeasureDate
          ? project.siteMeasureDate.split("T")[0]
          : "",
        installationDate: project.installationDate
          ? project.installationDate.split("T")[0]
          : "",
        machiningDate: project.machiningDate
          ? project.machiningDate.split("T")[0]
          : "",
        assemblyDate: project.assemblyDate
          ? project.assemblyDate.split("T")[0]
          : "",
        deliveryDate: project.deliveryDate
          ? project.deliveryDate.split("T")[0]
          : "",
        installPhaseDate: project.installPhaseDate
          ? project.installPhaseDate.split("T")[0]
          : "",
        estimatedHours: project.estimatedHours || "",
        availableHours: project.availableHours || "",
        alertStatus: project.alertStatus || "green",
      });

      // Set client
      setClientId(project.clientId || "");

      // Set workers
      if (project.workers && project.workers.length > 0) {
        setProjectWorkers(
          project.workers.map((worker) => ({
            workerId: worker.workerId || "",
            role: worker.role || "",
            assignedHours: worker.assignedHours || "",
            startDate: worker.startDate ? worker.startDate.split("T")[0] : "",
            endDate: worker.endDate ? worker.endDate.split("T")[0] : "",
          }))
        );
      }

      // Set allocations
      if (project.allocations && project.allocations.length > 0) {
        setAllocations(
          project.allocations.map((allocation) => ({
            materialId: allocation.materialId || "",
            quantityAllocated: allocation.quantityAllocated || "",
          }))
        );
      }
    } catch (error) {
      toast.error("Error fetching project data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle project data change
  const handleProjectChange = (e) => {
    setProjectData({ ...projectData, [e.target.name]: e.target.value });
  };

  // Handle worker change
  const handleWorkerChange = (index, field, value) => {
    const updatedWorkers = [...projectWorkers];
    updatedWorkers[index][field] = value;
    setProjectWorkers(updatedWorkers);
  };

  // Handle allocation change
  const handleAllocationChange = (index, field, value) => {
    const updatedAllocations = [...allocations];
    updatedAllocations[index][field] = value;
    setAllocations(updatedAllocations);
  };

  // Add new worker row
  const addWorker = () => {
    setProjectWorkers([
      ...projectWorkers,
      { workerId: "", role: "", assignedHours: "", startDate: "", endDate: "" },
    ]);
  };

  // Remove worker row
  const removeWorker = (index) => {
    if (projectWorkers.length > 1) {
      const updatedWorkers = [...projectWorkers];
      updatedWorkers.splice(index, 1);
      setProjectWorkers(updatedWorkers);
    }
  };

  // Add new allocation row
  const addAllocation = () => {
    setAllocations([...allocations, { materialId: "", quantityAllocated: "" }]);
  };

  // Remove allocation row
  const removeAllocation = (index) => {
    if (allocations.length > 1) {
      const updatedAllocations = [...allocations];
      updatedAllocations.splice(index, 1);
      setAllocations(updatedAllocations);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditMode) {
      await updateProject();
    } else {
      await createProject();
    }
  };

  const createProject = async () => {
    toast.loading("Creating project...");
    try {
      const res = await axios.post(`${BASE_URL}/api/projects/create`, {
        projectData,
        clientData: { id: clientId },
        workers: projectWorkers,
        allocations,
      });
      toast.dismiss();
      toast.success("Project created successfully!");
      console.log(res.data);

      // Reset form after successful submission
      resetForm();
    } catch (error) {
      toast.dismiss();
      toast.error("Error creating project");
      console.error(error);
    }
  };

  const updateProject = async () => {
    toast.loading("Updating project...");
    try {
      const res = await axios.put(`${BASE_URL}/api/projects/update/${id}`, {
        projectData,
        clientData: { id: clientId },
        workers: projectWorkers,
        allocations,
      });
      toast.dismiss();
      toast.success("Project updated successfully!");
      console.log(res.data);
    } catch (error) {
      toast.dismiss();
      toast.error("Error updating project");
      console.error(error);
    }
  };

  const resetForm = () => {
    setProjectData({
      name: "",
      location: "",
      description: "",
      status: "planned",
      shopDrawingSubmissionDate: "",
      siteMeasureDate: "",
      installationDate: "",
      machiningDate: "",
      assemblyDate: "",
      deliveryDate: "",
      installPhaseDate: "",
      estimatedHours: "",
      availableHours: "",
      alertStatus: "green",
    });
    setClientId("");
    setProjectWorkers([
      { workerId: "", role: "", assignedHours: "", startDate: "", endDate: "" },
    ]);
    setAllocations([{ materialId: "", quantityAllocated: "" }]);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <CircularProgress />
          <Typography variant="h6" color="text.secondary">
            Loading project data...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => window.history.back()}
            sx={{ mb: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1" gutterBottom>
            {isEditMode ? "Edit Project" : "Create New Project"}
          </Typography>
          <Divider />
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {/* Basic Information Section */}
          <Typography variant="h5" component="h2" sx={{ mb: 3, color: 'primary.main' }}>
            Basic Information
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Project Name"
                name="name"
                value={projectData.name}
                onChange={handleProjectChange}
                required
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={projectData.location}
                onChange={handleProjectChange}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={projectData.description}
                onChange={handleProjectChange}
                multiline
                rows={3}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={projectData.status}
                  onChange={handleProjectChange}
                  label="Status"
                >
                  <MenuItem value="planned">Planned</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="on-hold">On Hold</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Client</InputLabel>
                <Select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  label="Client"
                >
                  {clients.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.companyName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Workers Section */}
          <Typography variant="h5" component="h2" sx={{ mb: 3, color: 'primary.main' }}>
            Assign Workers
          </Typography>
          
          {projectWorkers.map((worker, index) => (
            <Card key={index} sx={{ mb: 3 }} variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" component="h3">
                    Worker #{index + 1}
                  </Typography>
                  {projectWorkers.length > 1 && (
                    <IconButton
                      color="error"
                      onClick={() => removeWorker(index)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
                {/* Two rows: first row for Worker, Role, Assigned Hours; second row for Start/End Date */}
                <Grid container spacing={2}>
                  {/* First Row */}
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth sx={{ minWidth: 300 }}>
                      <InputLabel>Worker</InputLabel>
                      <Select
                        minWidth={120}
                        value={worker.workerId}
                        onChange={(e) =>
                          handleWorkerChange(index, "workerId", e.target.value)
                        }
                        label="Worker"
                      >
                        {workers.map((w) => (
                          <MenuItem key={w.id} value={w.id}>
                            {w.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Role"
                      value={worker.role}
                      onChange={(e) =>
                        handleWorkerChange(index, "role", e.target.value)
                      }
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Assigned Hours"
                      type="number"
                      value={worker.assignedHours}
                      onChange={(e) =>
                        handleWorkerChange(index, "assignedHours", e.target.value)
                      }
                      inputProps={{ min: 0 }}
                      variant="outlined"
                    />
                  </Grid>
                  {/* Second Row */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={worker.startDate}
                      onChange={(e) =>
                        handleWorkerChange(index, "startDate", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      value={worker.endDate}
                      onChange={(e) =>
                        handleWorkerChange(index, "endDate", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
          
          <Button
            startIcon={<AddIcon />}
            onClick={addWorker}
            variant="outlined"
            sx={{ mb: 4 }}
          >
            Add Another Worker
          </Button>

          <Divider sx={{ my: 4 }} />

          {/* Inventory Section */}
          <Typography variant="h5" component="h2" sx={{ mb: 3, color: 'primary.main' }}>
            Inventory Allocation
          </Typography>
          
          {allocations.map((allocation, index) => (
            <Card key={index} sx={{ mb: 3 }} variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" component="h3">
                    Allocation #{index + 1}
                  </Typography>
                  {allocations.length > 1 && (
                    <IconButton
                      color="error"
                      onClick={() => removeAllocation(index)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required sx={{ minWidth: 300 }}>
                      <InputLabel>Material</InputLabel>
                      <Select
                        value={allocation.materialId}
                        onChange={(e) =>
                          handleAllocationChange(index, "materialId", e.target.value)
                        }
                        label="Material"
                      >
                        {inventory.map((i) => (
                          <MenuItem key={i.id} value={i.id}>
                            {i.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Quantity Allocated"
                      type="number"
                      value={allocation.quantityAllocated}
                      onChange={(e) =>
                        handleAllocationChange(index, "quantityAllocated", e.target.value)
                      }
                      inputProps={{ min: 0 }}
                      required
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
          
          <Button
            startIcon={<AddIcon />}
            onClick={addAllocation}
            variant="outlined"
            sx={{ mb: 4 }}
          >
            Add Another Allocation
          </Button>

          <Divider sx={{ my: 4 }} />

          {/* Timeline Section */}
          <Typography variant="h5" component="h2" sx={{ mb: 3, color: 'primary.main' }}>
            Project Timeline
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Shop Drawing Submission Date"
                name="shopDrawingSubmissionDate"
                type="date"
                value={projectData.shopDrawingSubmissionDate}
                onChange={handleProjectChange}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Site Measure Date"
                name="siteMeasureDate"
                type="date"
                value={projectData.siteMeasureDate}
                onChange={handleProjectChange}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Installation Date"
                name="installationDate"
                type="date"
                value={projectData.installationDate}
                onChange={handleProjectChange}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Machining Date"
                name="machiningDate"
                type="date"
                value={projectData.machiningDate}
                onChange={handleProjectChange}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Assembly Date"
                name="assemblyDate"
                type="date"
                value={projectData.assemblyDate}
                onChange={handleProjectChange}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Delivery Date"
                name="deliveryDate"
                type="date"
                value={projectData.deliveryDate}
                onChange={handleProjectChange}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Install Phase Date"
                name="installPhaseDate"
                type="date"
                value={projectData.installPhaseDate}
                onChange={handleProjectChange}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Resource Management Section */}
          <Typography variant="h5" component="h2" sx={{ mb: 3, color: 'primary.main' }}>
            Resource Management
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Estimated Hours"
                name="estimatedHours"
                type="number"
                value={projectData.estimatedHours}
                onChange={handleProjectChange}
                inputProps={{ min: 0 }}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Available Hours"
                name="availableHours"
                type="number"
                value={projectData.availableHours}
                onChange={handleProjectChange}
                inputProps={{ min: 0 }}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Alert Status</InputLabel>
                <Select
                  name="alertStatus"
                  value={projectData.alertStatus}
                  onChange={handleProjectChange}
                  label="Alert Status"
                >
                  <MenuItem value="green">Green (On Track)</MenuItem>
                  <MenuItem value="yellow">Yellow (Attention)</MenuItem>
                  <MenuItem value="red">Red (Critical)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Submit Buttons */}
          <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 4 }}>
            <Button
              type="button"
              onClick={resetForm}
              variant="outlined"
              color="secondary"
              size="large"
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
            >
              {isEditMode ? "Update Project" : "Create Project"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProjectForm;