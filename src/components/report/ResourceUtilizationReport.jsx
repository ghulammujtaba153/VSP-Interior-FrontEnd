"use client"

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Button,
  LinearProgress,
  Grid,
  Box,
  Chip,
  Divider
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import Loader from "../loader/Loader";

export default function ResourceUtilizationReport({ period, project }) {
  const [loading, setLoading] = useState(true);
  const [resourceData, setResourceData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchWorkerStats = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (period?.startDate) params.append('startDate', period.startDate);
      if (period?.endDate) params.append('endDate', period.endDate);
      
      const url = `${BASE_URL}/api/workers/get/stats${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await axios.get(url);
      
      if (res.data.success) {
        setResourceData(res.data.data);
      } else {
        setResourceData(null);
      }
    } catch (error) {
      console.error("Error fetching worker stats:", error);
      setResourceData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerStats();
  }, [period, project, refreshKey]);

  if (loading) return <Loader />;

  if (!resourceData) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Failed to load resource utilization data
        </Typography>
        <Button onClick={() => setRefreshKey(prev => prev + 1)} variant="contained" sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Resource Utilization
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Worker allocation, available hours, and overtime tracking
          </Typography>
        </Box>
        <Button variant="contained" color="primary" onClick={() => setRefreshKey(prev => prev + 1)}>
          Refresh Data
        </Button>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              title={<Typography variant="body2">Total Workers</Typography>}
              action={<PeopleIcon color="action" />}
            />
            <CardContent>
              <Typography variant="h5" color="primary">
                {resourceData.totalWorkers}
              </Typography>
              <Typography variant="caption" color="success.main">
                {resourceData.activeWorkers} currently active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              title={<Typography variant="body2">Utilization Rate</Typography>}
              action={<CheckCircleIcon color="action" />}
            />
            <CardContent>
              <Typography variant="h5" color="primary">
                {resourceData.utilizationRate}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {resourceData.allocatedHours.toLocaleString()} / {resourceData.availableHours.toLocaleString()} hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              title={<Typography variant="body2">Available Hours</Typography>}
              action={<AccessTimeIcon color="action" />}
            />
            <CardContent>
              <Typography variant="h5" color="primary">
                {resourceData.availableHours.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {resourceData.allocatedHours.toLocaleString()} allocated
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              title={<Typography variant="body2">Overtime Hours</Typography>}
              action={<WarningAmberIcon color="action" />}
            />
            <CardContent>
              <Typography variant="h5" color="error">
                {resourceData.overtimeHours}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total overtime across all workers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Worker Utilization */}
      <Card sx={{ mt: 4 }}>
        <CardHeader
          title={<Typography color="primary">Individual Worker Utilization</Typography>}
          subheader="Utilization rates and hours by team member"
        />
        <CardContent>
          {resourceData.workers && resourceData.workers.length > 0 ? (
            resourceData.workers.map((worker, i) => (
            <Box key={i} mb={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography fontWeight="bold">{worker.name}</Typography>
                    {worker.isOnLeave && (
                      <Chip 
                        label={`On Leave (${worker.leaveDays}d)`} 
                        color="warning" 
                        size="small"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {worker.role}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography fontWeight="bold" color="primary">
                    {worker.utilization}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {worker.hours}h total{" "}
                    {worker.overtime > 0 && (
                      <span style={{ color: "red" }}> (+{worker.overtime}h OT)</span>
                    )}
                  </Typography>
                </Box>
              </Box>
              <LinearProgress variant="determinate" value={worker.utilization} sx={{ mt: 1 }} />
            </Box>
          ))
          ) : (
            <Typography color="text.secondary" align="center" py={3}>
              No worker utilization data available
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Resource Allocation by Project */}
      <Card sx={{ mt: 4 }}>
        <CardHeader
          title={<Typography color="primary">Resource Allocation by Project</Typography>}
          subheader="How resources are distributed across active projects"
        />
        <CardContent>
          {resourceData.resourceAllocationByProject && resourceData.resourceAllocationByProject.length > 0 ? (
            resourceData.resourceAllocationByProject.map((allocation, index) => (
            <Box key={index} mb={3} p={2} bgcolor="grey.100" borderRadius={2}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography fontWeight="bold">{allocation.project}</Typography>
                <Typography color="primary" fontWeight="bold">
                  {allocation.utilization}%
                </Typography>
              </Box>
              <Grid container spacing={2} mb={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Workers: <b>{allocation.workers}</b>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Hours: <b>{allocation.hours}</b>
                  </Typography>
                </Grid>
              </Grid>
              <LinearProgress variant="determinate" value={allocation.utilization} />
            </Box>
          ))
          ) : (
            <Typography color="text.secondary" align="center" py={3}>
              No project allocation data available
            </Typography>
          )}
        </CardContent>
      </Card>

    </Box>
  );
}
