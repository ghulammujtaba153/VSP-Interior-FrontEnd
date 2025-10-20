"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Box,
} from "@mui/material";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";

// Mock projects with Europe locations
const mockProjects = [
  {
    id: 1,
    name: "Eiffel Tower Renovation",
    location: "Paris, France",
    status: "on-schedule",
    assignedWorkers: ["Pierre", "Marie"],
    phases: [
      { id: 1, name: "Foundation Check", status: "in-progress", estimatedHours: 40 },
      { id: 2, name: "Lighting Upgrade", status: "pending", estimatedHours: 60 },
    ],
  },
  {
    id: 2,
    name: "Berlin Office Build",
    location: "Berlin, Germany",
    status: "under-resourced",
    assignedWorkers: ["Hans", "Anna", "Karl"],
    phases: [
      { id: 3, name: "Excavation", status: "in-progress", estimatedHours: 30 },
      { id: 4, name: "Interior Work", status: "completed", estimatedHours: 25 },
    ],
  },
  {
    id: 3,
    name: "London Bridge Repairs",
    location: "London, UK",
    status: "delayed",
    assignedWorkers: ["John", "Emma"],
    phases: [
      { id: 5, name: "Survey", status: "completed", estimatedHours: 10 },
      { id: 6, name: "Paving", status: "pending", estimatedHours: 20 },
    ],
  },
];

const CalendarTab = () => {
  const [date, setDate] = useState(new Date());

  return (
    <Grid container spacing={3}>
      {/* Calendar Section */}
      <Grid item xs={12} md={4}>
        <Card elevation={3}>
          <CardContent>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateCalendar value={date} onChange={(newDate) => setDate(newDate)} />
            </LocalizationProvider>
          </CardContent>
        </Card>
      </Grid>

      {/* Tasks Section */}
      <Grid item xs={12} md={8}>
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="600">
              Tasks for {format(date, "MMMM d, yyyy")}
            </Typography>
          </Box>

          <Box display="flex" flexDirection="column" gap={2}>
            {mockProjects.map((project) =>
              project.phases
                .filter((phase) => phase.status !== "completed")
                .map((phase) => (
                  <Card
                    key={phase.id}
                    variant="outlined"
                    sx={{ p: 2.5, "&:hover": { boxShadow: 3 }, transition: "all 0.2s ease" }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                          <Typography variant="subtitle1" fontWeight="600">
                            {project.name}
                          </Typography>
                          <Chip
                            size="small"
                            label={project.status.replace("-", " ")}
                            variant="outlined"
                            color={
                              project.status === "on-schedule"
                                ? "success"
                                : project.status === "under-resourced"
                                ? "warning"
                                : "error"
                            }
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Phase: {phase.name}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={3} color="text.secondary" fontSize="0.875rem">
                          <span>📍 {project.location}</span>
                          <span>⏱️ {phase.estimatedHours}h</span>
                          <span>👥 {project.assignedWorkers.length} workers</span>
                        </Box>
                      </Box>
                      <Chip
                        label={phase.status.replace("-", " ")}
                        color={phase.status === "in-progress" ? "primary" : "default"}
                        size="small"
                      />
                    </Box>
                  </Card>
                ))
            )}

            {mockProjects.every((p) => p.phases.every((ph) => ph.status === "completed")) && (
              <Card sx={{ p: 5, textAlign: "center" }}>
                <Typography color="text.secondary">No tasks scheduled for this date.</Typography>
              </Card>
            )}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default CalendarTab;
