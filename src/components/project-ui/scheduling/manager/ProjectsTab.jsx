"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddScheduleDialog from "./AddScheduleDialog";

// 🔹 Mock project data (you can later replace with API call)
const mockProjects = [
  {
    id: "1",
    name: "Bridge Construction",
    client: "Metro Engineering Co.",
    location: "Islamabad",
    startDate: "2025-02-01",
    endDate: "2025-08-15",
    status: "on-schedule",
    assignedWorkers: ["Ali", "Hamza", "Sara"],
  },
  {
    id: "2",
    name: "Road Expansion Project",
    client: "Highway Authority",
    location: "Lahore",
    startDate: "2025-01-10",
    endDate: "2025-07-20",
    status: "under-resourced",
    assignedWorkers: ["Ahmed", "Bilal"],
  },
  {
    id: "3",
    name: "Office Complex Build",
    client: "Real Estate Group",
    location: "Karachi",
    startDate: "2025-03-05",
    endDate: "2025-11-10",
    status: "overdue",
    assignedWorkers: ["Usman", "Zainab", "Hassan", "Ayesha"],
  },
  {
    id: "4",
    name: "Solar Plant Installation",
    client: "Green Energy Pvt Ltd",
    location: "Quetta",
    startDate: "2025-04-15",
    endDate: "2025-09-30",
    status: "on-schedule",
    assignedWorkers: ["Hina", "Tariq"],
  },
];

const ProjectsTab = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuProject, setMenuProject] = useState(null);

  const handleMenuOpen = (event, project) => {
    setAnchorEl(event.currentTarget);
    setMenuProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuProject(null);
  };

  // 🔹 Status chip color logic
  const getStatusChip = (status) => {
    switch (status) {
      case "on-schedule":
        return <Chip label="On Schedule" color="success" size="small" />;
      case "under-resourced":
        return <Chip label="Under-resourced" color="warning" size="small" />;
      case "overdue":
        return <Chip label="Overdue" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" fontWeight="bold">
          All Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddDialog(true)}
          sx={{ boxShadow: 2 }}
        >
          Add New Schedule
        </Button>
      </Box>

      {/* Projects Table */}
      <Card elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "action.hover" }}>
                <TableCell sx={{ fontWeight: 600 }}>Project Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Assigned Workers</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {mockProjects.map((project) => (
                <TableRow
                  key={project.id}
                  hover
                  sx={{
                    "&:hover": { backgroundColor: "action.selected" },
                    transition: "background 0.2s ease",
                  }}
                >
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.client}</TableCell>
                  <TableCell>{project.location}</TableCell>
                  <TableCell>{project.startDate}</TableCell>
                  <TableCell>{project.endDate}</TableCell>
                  <TableCell>{getStatusChip(project.status)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {project.assignedWorkers.map((worker, idx) => (
                        <Chip
                          key={idx}
                          label={worker}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={(e) => handleMenuOpen(e, project)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Edit Schedule</MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: "error.main" }}>
          Delete
        </MenuItem>
      </Menu>

      {/* Add Schedule Dialog */}
      <AddScheduleDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </Box>
  );
};

export default ProjectsTab;
