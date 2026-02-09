"use client"

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
} from '@mui/material'
import { statusConfig, processColumns } from './kanbanConstants'

/**
 * KanbanTaskModal Component
 * 
 * A modal dialog for editing task details in the Kanban board.
 * Allows editing task title, description, dates, status, priority, stage, and assigned worker.
 * 
 * @param {boolean} open - Whether the modal is open
 * @param {Function} onClose - Callback when modal is closed
 * @param {Object} editForm - The form data object
 * @param {Function} setEditForm - Callback to update form data
 * @param {Function} onUpdate - Callback when update button is clicked
 * @param {Array} workers - Array of available workers
 */
const KanbanTaskModal = ({ open, onClose, editForm, setEditForm, onUpdate, workers }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Task</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Task Title *"
          fullWidth
          variant="outlined"
          value={editForm.title}
          onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
          sx={{ mb: 2, mt: 1 }}
          required
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          value={editForm.description}
          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
          sx={{ mb: 2 }}
        />
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              label="Start Date"
              type="date"
              value={editForm.startDate}
              onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              label="End Date"
              type="date"
              value={editForm.endDate}
              onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              error={editForm.startDate && editForm.endDate && new Date(editForm.endDate) < new Date(editForm.startDate)}
              helperText={
                editForm.startDate && editForm.endDate && new Date(editForm.endDate) < new Date(editForm.startDate)
                  ? "End date cannot be before start date"
                  : ""
              }
            />
          </Grid>
        </Grid>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={editForm.status}
            label="Status"
            onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
          >
            {Object.entries(statusConfig).map(([key, config]) => (
              <MenuItem key={key} value={key}>
                <Box display="flex" alignItems="center">
                  {config.icon}
                  <Typography sx={{ ml: 1 }}>{config.label}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={editForm.priority}
            label="Priority"
            onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value }))}
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Stage</InputLabel>
          <Select
            value={editForm.stage}
            label="Stage"
            onChange={(e) => setEditForm(prev => ({ ...prev, stage: e.target.value }))}
          >
            {Object.values(processColumns).map(column => (
              <MenuItem key={column.id} value={column.id}>
                {column.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Assign Worker</InputLabel>
          <Select
            value={editForm.workerId}
            label="Assign Worker"
            onChange={(e) => setEditForm(prev => ({ ...prev, workerId: e.target.value }))}
          >
            <MenuItem value="">Unassigned</MenuItem>
            {workers.map(worker => (
              <MenuItem key={worker.id} value={worker.id}>
                {worker.name} ({worker.jobTitle})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onUpdate} variant="contained">
          Update Task
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default KanbanTaskModal

