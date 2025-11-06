"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import Loader from "../loader/Loader";
import ProjectDetailsSection from "./ProjectDetailsSection";
import ProjectTablesSection from "./ProjectTablesSection";

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
          <ProjectDetailsSection projectStats={projectStats} />
          <ProjectTablesSection projectStats={projectStats} />
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
