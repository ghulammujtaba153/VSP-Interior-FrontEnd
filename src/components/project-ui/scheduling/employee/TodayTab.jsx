"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Divider,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { toast } from "react-toastify";

const mockTasks = [
  {
    id: "1",
    projectName: "Community Center Renovation",
    phase: "Painting",
    location: "Main Street, Downtown",
    dueDate: "2025-10-16",
    status: "in-progress",
  },
  {
    id: "2",
    projectName: "School Expansion Project",
    phase: "Foundation",
    location: "Elm Avenue, East Side",
    dueDate: "2025-10-16",
    status: "to-start",
  },
  {
    id: "3",
    projectName: "Park Lighting Setup",
    phase: "Inspection",
    location: "Riverside Park",
    dueDate: "2025-10-17",
    status: "complete",
  },
];

const TodayTab = () => {
  const [tasks, setTasks] = useState(
    mockTasks.filter((t) => t.dueDate === "2025-10-16")
  );

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    toast.success("Task status updated!");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "complete":
        return "success";
      case "in-progress":
        return "primary";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Today's Tasks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>
        </Box>
        <Chip
          label={`${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`}
          variant="outlined"
          color="primary"
          sx={{ fontSize: "0.9rem", px: 1.5, py: 0.5 }}
        />
      </Box>

      {/* Tasks List */}
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <Card
            key={task.id}
            sx={{
              mb: 2,
              p: 2,
              boxShadow: 2,
              "&:hover": { boxShadow: 4 },
              transition: "0.3s",
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {task.projectName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Phase:{" "}
                    <Chip
                      label={task.phase}
                      variant="outlined"
                      size="small"
                      sx={{ ml: 0.5 }}
                    />
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Location: {task.location}
                  </Typography>
                </Box>
                <Chip
                  label={task.status.replace("-", " ")}
                  color={getStatusColor(task.status)}
                  sx={{ textTransform: "capitalize" }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" alignItems="center" gap={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={task.status}
                    label="Status"
                    onChange={(e) =>
                      updateTaskStatus(task.id, e.target.value)
                    }
                  >
                    <MenuItem value="to-start">To Start</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="complete">Complete</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="outlined"
                  startIcon={<ChatBubbleOutlineIcon />}
                >
                  Note
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PhotoCameraIcon />}
                >
                  Photo
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card sx={{ p: 4, textAlign: "center", boxShadow: 1 }}>
          <Typography color="text.secondary">
            No tasks scheduled for today.
          </Typography>
        </Card>
      )}
    </Box>
  );
};

export default TodayTab;
