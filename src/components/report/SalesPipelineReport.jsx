"use client"

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  LinearProgress,
  Grid,
  Box,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import PeopleIcon from "@mui/icons-material/People";
import Loader from "../loader/Loader";
import axios from "axios";
import { BASE_URL } from "@/configs/url";

export const SalesPipelineReport = ({ period, project }) => {
  const [loading, setLoading] = useState(true);
  const [pipelineData, setPipelineData] = useState(null);

  const fetchPipelineData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/project-setup/get/sales/stats`);
      const data = res.data.data;

      // Map API data to pipeline structure
      const mappedData = {
        // Key Metrics
        totalPipelineValue: data.summary.totalSell || 0,
        conversionRate: data.conversionRate || 0,
        quotesToJobs: data.summary.projectsWithJobs || 0,
        activeLeads: data.summary.totalProjects || 0,
        
        // Pipeline Stages - Map from statusCounts
        stages: data.statusCounts.map(status => {
          return {
            name: status.status.charAt(0).toUpperCase() + status.status.slice(1),
            count: status.count,
            value: status.totalCost || 0, // Use actual totalCost (SELL + GST) from API
          };
        }),

        // Recent Activity - Map from recentActivity
        recentActivity: data.recentActivity.map(activity => {
          // Find project in topProjectsByCost to get value
          const projectData = data.topProjectsByCost.find(p => p.projectId === activity.id);
          const projectValue = projectData ? projectData.totalSell : 0;
          
          // Format time ago
          const updatedAt = new Date(activity.updatedAt);
          const now = new Date();
          const diffMs = now - updatedAt;
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffDays = Math.floor(diffHours / 24);
          
          let timeAgo = "";
          if (diffHours < 1) {
            timeAgo = "Just now";
          } else if (diffHours < 24) {
            timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
          } else {
            timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
          }

          // Map status to action
          const statusActions = {
            draft: "Draft Created",
            pending: "Quote Sent",
            approved: "Quote Approved",
            rejected: "Quote Rejected",
            revised: "Quote Revised",
            completed: "Project Completed",
            cancelled: "Project Cancelled",
          };

          return {
            client: activity.clientName,
            action: statusActions[activity.status] || activity.status,
            value: `$${projectValue.toLocaleString()}`,
            time: timeAgo,
          };
        }),

        // Increase rates from API
        increasingRate: {
          projects: data.increasingRate?.projects || 0,
          cost: data.increasingRate?.cost || 0,
        },
      };

      setPipelineData(mappedData);
    } catch (error) {
      console.error("Error fetching pipeline data:", error);
      setPipelineData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelineData();
  }, [period, project]);

  if (loading) return <Loader />;

  if (!pipelineData) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Failed to load pipeline data
        </Typography>
        <Button onClick={fetchPipelineData} variant="contained" sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  // Helper to format percentage change
  const formatChange = (value) => {
    const sign = value >= 0 ? "+" : "";
    const color = value >= 0 ? "success.main" : "error.main";
    const IconComponent = value >= 0 ? TrendingUpIcon : TrendingDownIcon;
    return { sign, value: Math.abs(value).toFixed(1), color, IconComponent };
  };

  const projectsChange = formatChange(pipelineData.increasingRate.projects);
  const costChange = formatChange(pipelineData.increasingRate.cost);
  const ProjectsIcon = projectsChange.IconComponent;
  const CostIcon = costChange.IconComponent;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Sales Pipeline
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track quotes, conversions, and pipeline value
          </Typography>
        </Box>
        <Button variant="contained" onClick={fetchPipelineData}>
          Refresh Data
        </Button>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardHeader
              title={<Typography variant="subtitle2">Pipeline Value</Typography>}
              action={<AttachMoneyIcon color="action" />}
            />
            <CardContent>
              <Typography variant="h6" color="primary">
                ${pipelineData.totalPipelineValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography 
                variant="caption" 
                color={costChange.color} 
                sx={{ display: "flex", alignItems: "center" }}
              >
                <CostIcon fontSize="small" sx={{ mr: 0.5 }} />
                {costChange.sign}{costChange.value}% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardHeader
              title={<Typography variant="subtitle2">Conversion Rate</Typography>}
              action={<TrackChangesIcon color="action" />}
            />
            <CardContent>
              <Typography variant="h6" color="primary">
                {pipelineData.conversionRate.toFixed(2)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Draft to Approved rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardHeader
              title={<Typography variant="subtitle2">Quotes to Jobs</Typography>}
              action={<TrackChangesIcon color="action" />}
            />
            <CardContent>
              <Typography variant="h6" color="primary">
                {pipelineData.quotesToJobs}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Projects with jobs assigned
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardHeader
              title={<Typography variant="subtitle2">Active Leads</Typography>}
              action={<PeopleIcon color="action" />}
            />
            <CardContent>
              <Typography variant="h6" color="primary">
                {pipelineData.activeLeads}
              </Typography>
              <Typography 
                variant="caption" 
                color={projectsChange.color} 
                sx={{ display: "flex", alignItems: "center" }}
              >
                <ProjectsIcon fontSize="small" sx={{ mr: 0.5 }} />
                {projectsChange.sign}{projectsChange.value}% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pipeline Stages */}
      <Card>
        <CardHeader
          title={<Typography variant="h6" color="primary">Pipeline Stages</Typography>}
          subheader="Current opportunities by status"
        />
        <CardContent>
          {pipelineData.stages.length > 0 ? (
            pipelineData.stages.map((stage) => {
              const percentage = pipelineData.activeLeads > 0 
                ? (stage.count / pipelineData.activeLeads) * 100 
                : 0;
              return (
                <Box key={stage.name} sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography fontWeight="medium">{stage.name}</Typography>
                    <Box textAlign="right">
                      <Typography fontWeight="bold">{stage.count} {stage.count === 1 ? 'project' : 'projects'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${stage.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{ height: 8, borderRadius: 5 }}
                  />
                </Box>
              );
            })
          ) : (
            <Typography color="text.secondary" align="center" py={3}>
              No pipeline data available
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader
          title={<Typography variant="h6" color="primary">Recent Pipeline Activity</Typography>}
          subheader="Latest updates and conversions"
        />
        <CardContent>
          {pipelineData.recentActivity.length > 0 ? (
            pipelineData.recentActivity.map((activity, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  mb: 2,
                  bgcolor: "action.hover",
                  borderRadius: 2,
                }}
              >
                <Box>
                  <Typography fontWeight="medium">{activity.client}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activity.action}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography fontWeight="bold" color="primary">
                    {activity.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activity.time}
                  </Typography>
                </Box>
              </Box>
            ))
          ) : (
            <Typography color="text.secondary" align="center" py={3}>
              No recent activity
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
