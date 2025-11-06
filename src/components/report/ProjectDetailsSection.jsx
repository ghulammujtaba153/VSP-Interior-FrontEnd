"use client";

import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";

const ProjectDetailsSection = ({ projectStats }) => {
  if (!projectStats) return null;

  return (
    <>
      {/* Project Basic Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Project Details
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Project Name
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {projectStats.project.projectName}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Status
              </Typography>
              <Chip label={projectStats.project.status} size="small" />
            </Box>

            {projectStats.project.client && (
              <>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Client
                  </Typography>
                  <Typography variant="body1">
                    {projectStats.project.client.companyName}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {projectStats.project.client.emailAddress}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {projectStats.project.client.phoneNumber}
                  </Typography>
                </Box>
              </>
            )}

            <Divider />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Cost
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="error">
                ${projectStats.financialSummary.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Sell
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="primary">
                ${projectStats.financialSummary.totalSell.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Profit
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="success.main">
                ${projectStats.financialSummary.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Profit Margin
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {projectStats.financialSummary.profitMargin}%
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Financial Breakdown */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Cost Breakdown
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Rates Cost
              </Typography>
              <Typography variant="body1">
                ${projectStats.financialSummary.ratesTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Materials Cost
              </Typography>
              <Typography variant="body1">
                ${projectStats.financialSummary.materialsTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Worker Costs
              </Typography>
              <Typography variant="body1">
                ${projectStats.financialSummary.workerCosts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Kanban Tasks Summary */}
      {projectStats.taskProgressSummary && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Kanban Tasks Summary
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Tasks
                </Typography>
                <Typography variant="h6">
                  {projectStats.taskProgressSummary.totalTasks}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Completed
                </Typography>
                <Typography variant="h6" color="success.main">
                  {projectStats.taskProgressSummary.completedTasks}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  In Progress
                </Typography>
                <Typography variant="h6" color="primary">
                  {projectStats.taskProgressSummary.inProgressTasks}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Pending
                </Typography>
                <Typography variant="h6" color="warning.main">
                  {projectStats.taskProgressSummary.pendingTasks}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Average Progress
                </Typography>
                <Typography variant="h6">
                  {projectStats.taskProgressSummary.averageProgress}%
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ProjectDetailsSection;

