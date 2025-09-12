"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Chip,
} from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";

const StatCard = ({ icon, title, value }) => (
  <Card sx={{ p: 3, height: "100%", bgcolor: "grey.50" }}>
    <Box display="flex"  gap={2}>
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          p: 1.5,
          width: 50,
          height: 50,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          {title}
        </Typography>
        <Typography variant="h6">{value}</Typography>
      </Box>
    </Box>
  </Card>
);

const OverAllProject = ({ project }) => {
  if (!project) return null;

  return (
    <Box sx={{ mt: 3 }}>
      {/* Header */}
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Project Overview
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<WorkOutlineIcon />}
            title="Project"
            value={project.name}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<PersonIcon />}
            title="Client"
            value={project.client}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<LocationOnIcon />}
            title="Location"
            value={project.location}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<AccessTimeIcon />}
            title="Estimated / Available Hours"
            value={`${project.estimatedHours} / ${project.availableHours}`}
          />
        </Grid>
      </Grid>

      {/* Client Details */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Client Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography>
                <strong>Company:</strong> {project.clientDetails.companyName}
              </Typography>
              <Typography>
                <strong>Email:</strong> {project.clientDetails.emailAddress}
              </Typography>
              <Typography>
                <strong>Phone:</strong> {project.clientDetails.phoneNumber}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography>
                <strong>Address:</strong> {project.clientDetails.address}
              </Typography>
              <Typography>
                <strong>Post Code:</strong> {project.clientDetails.postCode}
              </Typography>
              <Typography>
                <strong>Status:</strong>{" "}
                <Chip
                  label={project.clientDetails.accountStatus}
                  color="success"
                  size="small"
                />
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Materials Table */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Allocated Materials
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "grey.100" }}>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Quantity Allocated</TableCell>
                  <TableCell>Total Stocks</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {project.allocations?.length > 0 ? (
                  project.allocations.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.material.name}</TableCell>
                      <TableCell>{a.material.category}</TableCell>
                      <TableCell>{a.material.unit}</TableCell>
                      <TableCell>{a.quantityAllocated}</TableCell>
                      <TableCell>{a.material.totalStocks}</TableCell>
                      <TableCell>
                        <Chip
                          label={a.material.status}
                          color={
                            a.material.status === "active"
                              ? "success"
                              : "warning"
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No materials allocated
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Workers Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Assigned Workers
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "grey.100" }}>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Assigned Hours</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {project.workers?.length > 0 ? (
                  project.workers.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell>{w.worker?.name}</TableCell>
                      <TableCell>{w.worker?.jobTitle}</TableCell>
                      <TableCell>{w.assignedHours}</TableCell>
                      <TableCell>
                        {new Date(w.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(w.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={w.worker?.status}
                          color={
                            w.worker?.status === "active"
                              ? "success"
                              : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No workers assigned
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OverAllProject;
