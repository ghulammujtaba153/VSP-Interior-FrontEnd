"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";

const GanttTaskModal = ({
  open,
  onClose,
  editingTask,
  newTask,
  setNewTask,
  onSave,
  saving,
  projectStages,
  tasks,
}) => {
  const handleSubmit = () => {
    onSave();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingTask ? `Edit Task: ${editingTask.name}` : "Add New Task"}
      </DialogTitle>
      <DialogContent className="space-y-3 mt-2">
        <TextField
          label="Task Title *"
          fullWidth
          value={newTask.title}
          onChange={(e) =>
            setNewTask((p) => ({ ...p, title: e.target.value }))
          }
          required
        />
        
        <Box display="flex" gap={2}>
          <TextField
            label="Start Date *"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newTask.startDate}
            onChange={(e) =>
              setNewTask((p) => ({ ...p, startDate: e.target.value }))
            }
            required
          />
          <TextField
            label="End Date *"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newTask.endDate}
            onChange={(e) =>
              setNewTask((p) => ({ ...p, endDate: e.target.value }))
            }
            required
          />
        </Box>

        <Box display="flex" gap={2}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={newTask.status}
              label="Status"
              onChange={(e) =>
                setNewTask((p) => ({ ...p, status: e.target.value }))
              }
            >
              <MenuItem value="upcoming">Upcoming</MenuItem>
              <MenuItem value="inProgress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={newTask.priority}
              label="Priority"
              onChange={(e) =>
                setNewTask((p) => ({ ...p, priority: e.target.value }))
              }
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <FormControl fullWidth>
          <InputLabel>Project Stage *</InputLabel>
          <Select
            value={newTask.stage}
            label="Project Stage *"
            onChange={(e) =>
              setNewTask((p) => ({ ...p, stage: e.target.value }))
            }
            required
          >
            {projectStages.map(stage => (
              <MenuItem key={stage} value={stage}>
                {stage}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Worker Assignment - You can expand this with actual worker data from your API */}
        <FormControl fullWidth>
          <InputLabel>Assigned Worker</InputLabel>
          <Select
            value={newTask.workerId || ""}
            label="Assigned Worker"
            onChange={(e) =>
              setNewTask((p) => ({ ...p, workerId: e.target.value || null }))
            }
          >
            <MenuItem value="">Unassigned</MenuItem>
            {/* You can populate this with actual workers from your API */}
            <MenuItem value={4}>Jane Smith (Electrician)</MenuItem>
            <MenuItem value={7}>Worker1 (Worker)</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={newTask.description}
          onChange={(e) =>
            setNewTask((p) => ({ ...p, description: e.target.value }))
          }
          placeholder="Enter task description..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={saving || !newTask.title || !newTask.startDate || !newTask.endDate || !newTask.stage}
        >
          {saving ? "Saving..." : editingTask ? "Update Task" : "Add Task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GanttTaskModal;