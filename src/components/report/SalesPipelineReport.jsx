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
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import PeopleIcon from "@mui/icons-material/People";



export const SalesPipelineReport = ({ period, project }) => {
  const pipelineData = {
    totalPipelineValue: 847500,
    conversionRate: 24.5,
    quotesToJobs: 73,
    activeLeads: 142,
    stages: [
      { name: "Leads", count: 142, value: 284000 },
      { name: "Qualified", count: 89, value: 445000 },
      { name: "Proposals", count: 34, value: 340000 },
      { name: "Negotiations", count: 18, value: 180000 },
      { name: "Won", count: 12, value: 120000 },
    ],
  };

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
        <Button variant="contained">Generate Report</Button>
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
                ${pipelineData.totalPipelineValue.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="success.main" sx={{ display: "flex", alignItems: "center" }}>
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                +12.5% from last month
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
                {pipelineData.conversionRate}%
              </Typography>
              <Typography variant="caption" color="success.main" sx={{ display: "flex", alignItems: "center" }}>
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                +2.1% from last month
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
              <Typography variant="caption" color="success.main" sx={{ display: "flex", alignItems: "center" }}>
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                +8 from last month
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
              <Typography variant="caption" color="success.main" sx={{ display: "flex", alignItems: "center" }}>
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                +15 from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pipeline Stages */}
      <Card>
        <CardHeader
          title={<Typography variant="h6" color="primary">Pipeline Stages</Typography>}
          subheader="Current opportunities by stage"
        />
        <CardContent>
          {pipelineData.stages.map((stage) => (
            <Box key={stage.name} sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography fontWeight="medium">{stage.name}</Typography>
                <Box textAlign="right">
                  <Typography fontWeight="bold">{stage.count} opportunities</Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${stage.value.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(stage.count / pipelineData.activeLeads) * 100}
                sx={{ height: 8, borderRadius: 5 }}
              />
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader
          title={<Typography variant="h6" color="primary">Recent Pipeline Activity</Typography>}
          subheader="Latest updates and conversions"
        />
        <CardContent>
          {[
            { client: "Acme Construction", action: "Moved to Negotiations", value: "$45,000", time: "2 hours ago" },
            { client: "BuildCorp Ltd", action: "Quote Submitted", value: "$78,500", time: "4 hours ago" },
            { client: "Metro Developers", action: "Won Project", value: "$125,000", time: "1 day ago" },
            { client: "Urban Planners Inc", action: "Qualified Lead", value: "$92,000", time: "1 day ago" },
          ].map((activity, index) => (
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
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};
