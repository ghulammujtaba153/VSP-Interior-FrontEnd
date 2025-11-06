"use client";

import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";

const ProjectTablesSection = ({ projectStats }) => {
  if (!projectStats) return null;

  return (
    <>
      {/* Jobs with Dates */}
      {projectStats.jobs && projectStats.jobs.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Jobs Schedule ({projectStats.jobs.length} jobs)
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Start Date</strong></TableCell>
                    <TableCell><strong>End Date</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="right"><strong>Workers</strong></TableCell>
                    <TableCell align="right"><strong>Tasks</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectStats.jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>{job.startDate ? new Date(job.startDate).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>{job.endDate ? new Date(job.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        <Chip label={job.status} size="small" />
                      </TableCell>
                      <TableCell align="right">{job.workersCount}</TableCell>
                      <TableCell align="right">{job.tasksCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Purchasing Items */}
      {projectStats.purchasingItems && projectStats.purchasingItems.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Purchasing Items ({projectStats.purchasingItems.length})
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Supplier</strong></TableCell>
                    <TableCell align="right"><strong>Amount</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Expected Delivery</strong></TableCell>
                    <TableCell><strong>Delivery Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectStats.purchasingItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.supplierName}</TableCell>
                      <TableCell align="right">${item.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <Chip label={item.status} size="small" />
                      </TableCell>
                      <TableCell>
                        {item.expectedDelivery ? new Date(item.expectedDelivery).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {item.deliveryStatus && (
                          <Chip label={item.deliveryStatus} size="small" color={item.deliveryStatus === 'on-time' ? 'success' : item.deliveryStatus === 'late' ? 'error' : 'warning'} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Kanban Tasks Detail */}
      {projectStats.tasks && projectStats.tasks.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Kanban Tasks Detail ({projectStats.tasks.length} tasks)
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 1000 }}>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Task Title</strong></TableCell>
                    <TableCell><strong>Stage</strong></TableCell>
                    <TableCell><strong>Priority</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Start Date</strong></TableCell>
                    <TableCell><strong>End Date</strong></TableCell>
                    <TableCell align="right"><strong>Progress</strong></TableCell>
                    <TableCell><strong>Assigned Worker</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectStats.tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.title || 'Untitled Task'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={task.stage || 'To Do'} 
                          size="small" 
                          color={
                            task.stage === 'Done' ? 'success' : 
                            task.stage === 'In Progress' ? 'primary' : 
                            'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={task.priority || 'medium'} 
                          size="small" 
                          color={
                            task.priority === 'high' ? 'error' : 
                            task.priority === 'medium' ? 'warning' : 
                            'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={task.status || 'active'} size="small" />
                      </TableCell>
                      <TableCell>
                        {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {task.endDate ? new Date(task.endDate).toLocaleDateString() : 'N/A'}
                        {task.daysUntilDeadline !== null && task.daysUntilDeadline < 0 && task.stage !== 'Done' && (
                          <Typography variant="caption" color="error" display="block">
                            {Math.abs(task.daysUntilDeadline)} days overdue
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                          <Typography variant="body2">{task.progress || 0}%</Typography>
                          <Box sx={{ width: 60, height: 8, bgcolor: 'grey.300', borderRadius: 1 }}>
                            <Box 
                              sx={{ 
                                width: `${task.progress || 0}%`, 
                                height: '100%', 
                                bgcolor: task.progress >= 100 ? 'success.main' : task.progress >= 50 ? 'primary.main' : 'warning.main',
                                borderRadius: 1,
                              }} 
                            />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {task.assignedWorker ? task.assignedWorker.name : 'Unassigned'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Worker Performance */}
      {projectStats.workerPerformance && projectStats.workerPerformance.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Worker Performance ({projectStats.workerPerformance.length} workers)
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Worker Name</strong></TableCell>
                    <TableCell><strong>Role</strong></TableCell>
                    <TableCell align="right"><strong>Hours Assigned</strong></TableCell>
                    <TableCell align="right"><strong>Overtime Hours</strong></TableCell>
                    <TableCell align="right"><strong>Total Leaves</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectStats.workerPerformance.map((worker, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{worker.workerName}</TableCell>
                      <TableCell>{worker.jobTitle || worker.role}</TableCell>
                      <TableCell align="right">{worker.hoursAssigned}</TableCell>
                      <TableCell align="right">{worker.totalOvertimeHours || 0}</TableCell>
                      <TableCell align="right">{worker.totalLeaves || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Supplier Details */}
      {projectStats.supplierPerformance && projectStats.supplierPerformance.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Supplier Details ({projectStats.supplierPerformance.length} suppliers)
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Supplier Name</strong></TableCell>
                    <TableCell align="right"><strong>Total Orders</strong></TableCell>
                    <TableCell align="right"><strong>Total Spent</strong></TableCell>
                    <TableCell align="right"><strong>Delivered</strong></TableCell>
                    <TableCell align="right"><strong>Pending</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectStats.supplierPerformance.map((supplier) => (
                    <TableRow key={supplier.supplierId}>
                      <TableCell>{supplier.supplierName}</TableCell>
                      <TableCell align="right">{supplier.totalOrders}</TableCell>
                      <TableCell align="right">${supplier.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell align="right">{supplier.deliveredOrders}</TableCell>
                      <TableCell align="right">{supplier.pendingOrders}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ProjectTablesSection;

