"use client";

import React, { useEffect, useState } from "react";
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
  TablePagination,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ConstructionIcon from "@mui/icons-material/Construction";
import Loader from "@/components/loader/Loader";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";
import Link from "next/link"
import { useAuth } from "@/context/authContext";

const EmployeeProjects = () => {

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const {user} = useAuth()

  // 🔹 Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchProjects = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/api/job-scheduling/worker`, {email: user.email});
      setProjects(res.data.jobs || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  

  // 🔹 Open Add/Edit dialog
  const handleAddNew = () => {
    setEditingJob(null);
    setShowDialog(true);
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setShowDialog(true);
  };

  // 🔹 Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return <Loader />;

  const getStatusChip = (status) => {
    switch (status) {
      case "scheduled":
        return <Chip label="Scheduled" color="success" size="small" />;
      case "in-progress":
        return <Chip label="In Progress" color="warning" size="small" />;
      case "completed":
        return <Chip label="Completed" color="primary" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  // 🔹 Calculate paginated data
  const paginatedProjects = projects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <Typography variant="h6" fontWeight="bold">
            Assigned Projects
        </Typography>
        
      </Box>

      {/* Jobs Table */}
      <Card elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "action.hover" }}>
                <TableCell sx={{ fontWeight: 600 }}>Project Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Assigned Workers</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedProjects.map((job) => (
                <TableRow key={job.id} hover>
                  <TableCell>{job.projectSetup?.projectName || "N/A"}</TableCell>
                  <TableCell>{job.projectSetup?.siteLocation || "N/A"}</TableCell>
                  <TableCell>{job.startDate?.slice(0, 10)}</TableCell>
                  <TableCell>{job.endDate?.slice(0, 10)}</TableCell>
                  <TableCell>{getStatusChip(job.status)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {job.workers?.length > 0 ? (
                        job.workers.map((w) => (
                          <Chip
                            key={w.id}
                            label={`${w.name} (${w.ProjectSetupJobWorker?.hoursAssigned || 0} hrs)`}
                            size="small"
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No workers
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Link href={`/projects/worker/${job.id}`}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="info"
                          startIcon={<ConstructionIcon />}
                        >
                          Manage
                        </Button>
                      </Link>
                      
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination controls */}
        <TablePagination
          component="div"
          count={projects.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{ px: 2 }}
        />
      </Card>

      
    </Box>
  );
};

export default EmployeeProjects;
