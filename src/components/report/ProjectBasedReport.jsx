"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Divider,
} from "@mui/material";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import Loader from "../loader/Loader";

const ProjectBasedReport = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectStats, setProjectStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchAllProject = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/project-setup/get?limit=1000`);
      if (res.data.success) {
        // Map the response to extract id and projectName
        const projectsList = res.data.data.map(project => ({
          id: project.id,
          name: project.projectName || project.name || 'Unnamed Project',
          client: project.client ? {
            id: project.client.id,
            name: project.client.companyName,
          } : null,
        }));
        setProjects(projectsList);
      }
    } catch (error) {
      console.error("Error fetching all projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProject();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectStats(selectedProjectId);
    } else {
      setProjectStats(null);
    }
  }, [selectedProjectId]);

  const fetchProjectStats = async (projectId) => {
    try {
      setLoadingStats(true);
      const res = await axios.get(`${BASE_URL}/api/project-setup/get/stats/${projectId}`);
      if (res.data.success) {
        setProjectStats(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching project stats:", error);
      setProjectStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Project Based Report
        </Typography>
        <Button variant="contained" onClick={fetchAllProject}>
          Refresh Projects
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl fullWidth>
            <InputLabel>Select Project</InputLabel>
            <Select
              value={selectedProjectId}
              label="Select Project"
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <MenuItem value="">-- Select a Project --</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name} {project.client ? `- ${project.client.name}` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {loadingStats && <Loader />}

      {projectStats && !loadingStats && (
        <>
          {/* Project Basic Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Project Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">Project Name</Typography>
                  <Typography variant="body1" fontWeight="bold">{projectStats.project.projectName}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip label={projectStats.project.status} size="small" />
                </Grid>
                {projectStats.project.client && (
                  <>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Client</Typography>
                      <Typography variant="body1">{projectStats.project.client.companyName}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{projectStats.project.client.emailAddress}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1">{projectStats.project.client.phoneNumber}</Typography>
                    </Grid>
                  </>
                )}
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">Total Cost</Typography>
                  <Typography variant="body1" fontWeight="bold" color="error">
                    ${projectStats.financialSummary.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">Total Sell</Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary">
                    ${projectStats.financialSummary.totalSell.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">Total Profit</Typography>
                  <Typography variant="body1" fontWeight="bold" color="success.main">
                    ${projectStats.financialSummary.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">Profit Margin</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {projectStats.financialSummary.profitMargin}%
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Financial Breakdown */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Cost Breakdown
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">Rates Cost</Typography>
                  <Typography variant="body1">${projectStats.financialSummary.ratesTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">Materials Cost</Typography>
                  <Typography variant="body1">${projectStats.financialSummary.materialsTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">Worker Costs</Typography>
                  <Typography variant="body1">${projectStats.financialSummary.workerCosts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Purchasing Items */}
          {projectStats.purchasingItems && projectStats.purchasingItems.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Purchasing Items ({projectStats.purchasingItems.length})
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Supplier</strong></TableCell>
                      <TableCell align="right"><strong>Amount</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Delivery Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projectStats.purchasingItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.supplierName}</TableCell>
                        <TableCell align="right">${item.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell>
                          <Chip label={item.status} size="small" />
                        </TableCell>
                        <TableCell>
                          {item.deliveryStatus && (
                            <Chip label={item.deliveryStatus} size="small" color={item.deliveryStatus === 'on-time' ? 'success' : item.deliveryStatus === 'late' ? 'error' : 'warning'} />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Kanban Tasks */}
          {projectStats.taskProgressSummary && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Kanban Tasks Progress
                </Typography>
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Total Tasks</Typography>
                    <Typography variant="h6">{projectStats.taskProgressSummary.totalTasks}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Completed</Typography>
                    <Typography variant="h6" color="success.main">{projectStats.taskProgressSummary.completedTasks}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">In Progress</Typography>
                    <Typography variant="h6" color="primary">{projectStats.taskProgressSummary.inProgressTasks}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Pending</Typography>
                    <Typography variant="h6" color="warning.main">{projectStats.taskProgressSummary.pendingTasks}</Typography>
                  </Grid>
                </Grid>
                <Typography variant="body2" color="text.secondary">Average Progress</Typography>
                <Typography variant="h6">{projectStats.taskProgressSummary.averageProgress}%</Typography>
              </CardContent>
            </Card>
          )}

          {/* Worker Performance */}
          {projectStats.workerPerformance && projectStats.workerPerformance.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Worker Performance ({projectStats.workerPerformance.length} workers)
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Worker Name</strong></TableCell>
                      <TableCell><strong>Role</strong></TableCell>
                      <TableCell align="right"><strong>Hours Assigned</strong></TableCell>
                      <TableCell align="right"><strong>Overtime Hours</strong></TableCell>
                      <TableCell align="right"><strong>Total Leaves</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projectStats.workerPerformance.map((worker, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{worker.workerName}</TableCell>
                        <TableCell>{worker.jobTitle || worker.role}</TableCell>
                        <TableCell align="right">{worker.hoursAssigned}</TableCell>
                        <TableCell align="right">{worker.totalOvertimeHours || 0}</TableCell>
                        <TableCell align="right">{worker.totalLeaves || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Supplier Details */}
          {projectStats.supplierPerformance && projectStats.supplierPerformance.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Supplier Details ({projectStats.supplierPerformance.length} suppliers)
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Supplier Name</strong></TableCell>
                      <TableCell align="right"><strong>Total Orders</strong></TableCell>
                      <TableCell align="right"><strong>Total Spent</strong></TableCell>
                      <TableCell align="right"><strong>Delivered</strong></TableCell>
                      <TableCell align="right"><strong>Pending</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projectStats.supplierPerformance.map((supplier) => (
                      <TableRow key={supplier.supplierId}>
                        <TableCell>{supplier.supplierName}</TableCell>
                        <TableCell align="right">{supplier.totalOrders}</TableCell>
                        <TableCell align="right">${supplier.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell align="right">{supplier.deliveredOrders}</TableCell>
                        <TableCell align="right">{supplier.pendingOrders}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!selectedProjectId && !loadingStats && (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center" py={3}>
              Please select a project to view its statistics
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ProjectBasedReport;
