import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Grid,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// Mock data example (replace with your mockProjects import)
const mockProjects = [
  {
    id: 1,
    name: "Bridge Renovation",
    client: "EuroConstructions GmbH",
    location: "Berlin, Germany",
    startDate: "2025-09-01",
    endDate: "2025-12-01",
    status: "on-schedule",
    assignedWorkers: ["Jean Dupont", "Lukas Schmidt"],
    phases: [
      {
        id: 1,
        name: "Foundation",
        status: "completed",
        estimatedHours: 40,
        actualHours: 42,
        startDate: "2025-09-01",
        endDate: "2025-09-10",
      },
      {
        id: 2,
        name: "Steel Structure",
        status: "in-progress",
        estimatedHours: 60,
        startDate: "2025-09-15",
        endDate: "2025-10-20",
      },
      {
        id: 3,
        name: "Finishing",
        status: "not-started",
        estimatedHours: 30,
        startDate: "2025-10-25",
        endDate: "2025-11-10",
      },
    ],
  },
];



const GanttTab = () => {
  const getPhaseColor = (status) => {
    switch (status) {
      case "completed":
        return "#4caf50"; // success
      case "in-progress":
        return "#1976d2"; // primary
      case "not-started":
        return "#9e9e9e"; // muted
      default:
        return "#bdbdbd";
    }
  };

  const getStatusIndicator = (status) => {
    const colorMap = {
      "on-schedule": "#4caf50",
      "under-resourced": "#ffb300",
      "overdue": "#f44336",
    };
    return (
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: colorMap[status] || "#9e9e9e",
        }}
      />
    );
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* Header Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h6" fontWeight="600">
          Project Timeline
        </Typography>
        <Box display="flex" gap={3} flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={10} height={10} borderRadius="50%" bgcolor="#4caf50" />
            <Typography variant="body3" color="text.secondary">
              On Schedule
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={10} height={10} borderRadius="50%" bgcolor="#ffb300" />
            <Typography variant="body3" color="text.secondary">
              Under-resourced
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={10} height={10} borderRadius="50%" bgcolor="#f44336" />
            <Typography variant="body3" color="text.secondary">
              Overdue
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Project Cards */}
      {mockProjects.map((project) => (
        <Card key={project.id} elevation={3}>
          <CardContent>
            {/* Project Header */}
            <Box
              mb={2}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                {getStatusIndicator(project.status)}
                <Typography variant="subtitle1" fontWeight="600">
                  {project.name}
                </Typography>
                <Chip
                  label={project.client}
                  size="small"
                  variant="outlined"
                  color="default"
                />
              </Box>
              <Typography variant="body3" color="text.secondary">
                {project.startDate} — {project.endDate}
              </Typography>
            </Box>

            {/* Phases */}
            <Box display="flex" flexDirection="column" gap={2}>
              {project.phases.map((phase) => (
                <Box key={phase.id}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <ChevronRightIcon fontSize="small" color="disabled" />
                    <Typography variant="body3" fontWeight="500">
                      {phase.name}
                    </Typography>

                    <Chip
                      label={phase.status.replace("-", " ")}
                      size="small"
                      sx={{
                        bgcolor:
                          phase.status === "completed"
                            ? "#4caf50" + "20"
                            : phase.status === "in-progress"
                            ? "#1976d2" + "20"
                            : "#e0e0e0",
                        color:
                          phase.status === "completed"
                            ? "#4caf50"
                            : phase.status === "in-progress"
                            ? "#1976d2"
                            : "#757575",
                      }}
                    />

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ marginLeft: "auto" }}
                    >
                      {phase.estimatedHours}h est
                      {phase.actualHours && ` • ${phase.actualHours}h actual`}
                    </Typography>
                  </Box>

                  {/* Progress Bar */}
                  <Box
                    sx={{
                      position: "relative",
                      height: 24,
                      bgcolor: "#eeeeee",
                      borderRadius: 1,
                      overflow: "hidden",
                      mt: 1,
                      ml: 3.5,
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        height: "100%",
                        width: phase.actualHours
                          ? `${Math.min(
                              (phase.actualHours / phase.estimatedHours) * 100,
                              100
                            )}%`
                          : phase.status === "in-progress"
                          ? "50%"
                          : phase.status === "completed"
                          ? "100%"
                          : "0%",
                        bgcolor: getPhaseColor(phase.status),
                        transition: "width 0.3s ease",
                        opacity: 0.9,
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.primary"
                        sx={{ mixBlendMode: "difference" }}
                      >
                        {phase.startDate} – {phase.endDate}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Assigned Workers */}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 3.5, mt: 0.5 }}
                  >
                    Assigned: {project.assignedWorkers.join(", ")}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default GanttTab;
