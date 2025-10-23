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
          label="Task Name *"
          fullWidth
          value={newTask.name}
          onChange={(e) =>
            setNewTask((p) => ({ ...p, name: e.target.value }))
          }
          required
        />
        
        <Box display="flex" gap={2}>
          <TextField
            label="Start Date *"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newTask.start}
            onChange={(e) =>
              setNewTask((p) => ({ ...p, start: e.target.value }))
            }
            required
          />
          <TextField
            label="End Date *"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newTask.end}
            onChange={(e) =>
              setNewTask((p) => ({ ...p, end: e.target.value }))
            }
            required
          />
        </Box>

        <Box display="flex" gap={2}>
          <TextField
            label="Progress (%)"
            type="number"
            fullWidth
            inputProps={{ min: 0, max: 100 }}
            value={newTask.progress}
            onChange={(e) =>
              setNewTask((p) => ({ ...p, progress: e.target.value }))
            }
          />
          <FormControl fullWidth>
            <InputLabel>Project Stage</InputLabel>
            <Select
              value={newTask.project}
              label="Project Stage"
              onChange={(e) =>
                setNewTask((p) => ({ ...p, project: e.target.value }))
              }
            >
              {projectStages.map(stage => (
                <MenuItem key={stage} value={stage}>
                  {stage}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={newTask.status}
            label="Status"
            onChange={(e) =>
              setNewTask((p) => ({ ...p, status: e.target.value }))
            }
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Dependencies (optional)"
          select
          fullWidth
          value={newTask.dependencies[0] || ""}
          onChange={(e) =>
            setNewTask((p) => ({ 
              ...p, 
              dependencies: e.target.value ? [e.target.value] : [] 
            }))
          }
        >
          <MenuItem value="">None</MenuItem>
          {tasks.filter(t => t.id !== editingTask?.id).map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={newTask.description}
          onChange={(e) =>
            setNewTask((p) => ({ ...p, description: e.target.value }))
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={saving}
        >
          {saving ? "Saving..." : editingTask ? "Update Task" : "Add Task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GanttTaskModal;