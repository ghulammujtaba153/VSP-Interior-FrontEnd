"use client"

import React from "react";
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

export default function ResourceUtilizationReport({ period, project }) {
  const resourceData = {
    totalWorkers: 45,
    activeWorkers: 38,
    utilizationRate: 84.4,
    overtimeHours: 127,
    availableHours: 1800,
    allocatedHours: 1520,
    workers: [
      { name: "John Smith", role: "Project Manager", utilization: 95, hours: 168, overtime: 8 },
      { name: "Sarah Johnson", role: "Senior Developer", utilization: 88, hours: 154, overtime: 14 },
      { name: "Mike Wilson", role: "Designer", utilization: 72, hours: 126, overtime: 0 },
      { name: "Lisa Brown", role: "QA Engineer", utilization: 91, hours: 159, overtime: 9 },
      { name: "David Chen", role: "Developer", utilization: 76, hours: 133, overtime: 3 },
    ]
  };

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
        <Button variant="contained" color="primary">
          Generate Report
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
              <Typography variant="caption" color="success.main">
                +3.2% from last month
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
              <Typography variant="caption" color="error">
                -12 from last month
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
          {resourceData.workers.map((worker, i) => (
            <Box key={i} mb={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography fontWeight="bold">{worker.name}</Typography>
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
          ))}
        </CardContent>
      </Card>

      {/* Resource Allocation by Project */}
      <Card sx={{ mt: 4 }}>
        <CardHeader
          title={<Typography color="primary">Resource Allocation by Project</Typography>}
          subheader="How resources are distributed across active projects"
        />
        <CardContent>
          {[
            { project: "Project Alpha", workers: 15, hours: 600, utilization: 88 },
            { project: "Project Beta", workers: 12, hours: 480, utilization: 92 },
            { project: "Project Gamma", workers: 11, hours: 440, utilization: 79 },
          ].map((allocation, index) => (
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
          ))}
        </CardContent>
      </Card>

      {/* Capacity Planning */}
      <Card sx={{ mt: 4 }}>
        <CardHeader
          title={<Typography color="primary">Capacity Planning</Typography>}
          subheader="Forecasted resource needs for upcoming projects"
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center" p={2} bgcolor="green.50" borderRadius={2}>
                <Typography variant="h6" color="success.main">
                  Available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  280 hours next month
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center" p={2} bgcolor="blue.50" borderRadius={2}>
                <Typography variant="h6" color="primary">
                  Forecasted
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  1,650 hours needed
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center" p={2} bgcolor="red.50" borderRadius={2}>
                <Typography variant="h6" color="error">
                  Shortage
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  1,370 hours deficit
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
