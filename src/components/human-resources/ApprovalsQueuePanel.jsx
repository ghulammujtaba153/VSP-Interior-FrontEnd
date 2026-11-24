"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  EventAvailable,
  AccessTime,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import apiClient from "@/lib/axios";
import { toast } from "react-toastify";
import Loader from "@/components/loader/Loader";

const ApprovalsQueuePanel = ({
  scope: initialScope = "all",
  showScopeToggle = false,
  title = "Approvals Queue",
}) => {
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState(initialScope);
  const [tab, setTab] = useState(0);
  const [queue, setQueue] = useState({
    leave: [],
    timesheets: [],
    counts: { leave: 0, timesheets: 0, total: 0 },
    isManager: false,
    isHrAdmin: false,
  });

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/hr/approvals/queue?scope=${scope}`);
      setQueue(res.data.data || {});
    } catch (error) {
      if (error.response?.status === 403) {
        setQueue({ leave: [], timesheets: [], counts: { total: 0 }, isManager: false });
      } else {
        toast.error("Failed to load approvals queue");
      }
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleLeaveAction = async (id, status) => {
    try {
      await apiClient.put(`/api/employee-leave/update/${id}`, { status });
      toast.success(`Leave ${status}`);
      fetchQueue();
    } catch {
      toast.error("Failed to update leave");
    }
  };

  const handleTimesheetAction = async (id, status) => {
    try {
      await apiClient.post(`/api/employee-timesheet/${id}/approve`, { status });
      toast.success(`Timesheet ${status}`);
      fetchQueue();
    } catch {
      toast.error("Failed to update timesheet");
    }
  };

  if (loading) return <Loader />;

  if (!queue.isHrAdmin && !queue.isManager && queue.counts?.total === 0) {
    return (
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography color="text.secondary">
            No team members assigned for manager approvals. HR can assign a manager on each employee&apos;s employment profile.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} mb={3} gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            Review and action pending leave and timesheet submissions
            {scope === "team" ? " for your direct reports" : ""}
          </Typography>
        </Box>
        {showScopeToggle && queue.isHrAdmin && (
          <ToggleButtonGroup
            size="small"
            value={scope}
            exclusive
            onChange={(e, v) => v && setScope(v)}
          >
            <ToggleButton value="all">All staff</ToggleButton>
            <ToggleButton value="team">My team</ToggleButton>
          </ToggleButtonGroup>
        )}
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Pending Leave</Typography>
                <Typography variant="h4" color="warning.main" fontWeight={700}>{queue.counts?.leave || 0}</Typography>
              </Box>
              <EventAvailable color="warning" fontSize="large" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Pending Timesheets</Typography>
                <Typography variant="h4" color="info.main" fontWeight={700}>{queue.counts?.timesheets || 0}</Typography>
              </Box>
              <AccessTime color="info" fontSize="large" />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">Total Queue</Typography>
                <Typography variant="h4" fontWeight={700}>{queue.counts?.total || 0}</Typography>
              </Box>
              <Chip label={scope === "team" ? "Team" : "Org-wide"} color="primary" variant="outlined" />
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Card sx={{ borderRadius: 3 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
          <Tab label={`Leave (${queue.leave?.length || 0})`} />
          <Tab label={`Timesheets (${queue.timesheets?.length || 0})`} />
        </Tabs>
        <CardContent>
          {tab === 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Dates</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(queue.leave || []).length === 0 ? (
                    <TableRow><TableCell colSpan={5} align="center">No pending leave requests</TableCell></TableRow>
                  ) : (
                    queue.leave.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.employee?.name || row.employeeName || "—"}</TableCell>
                        <TableCell>{row.leaveType}</TableCell>
                        <TableCell>{row.startDate} → {row.endDate}</TableCell>
                        <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{row.reason}</TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Button size="small" variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => handleLeaveAction(row.id, "approved")}>Approve</Button>
                            <Button size="small" variant="outlined" color="error" startIcon={<Cancel />} onClick={() => handleLeaveAction(row.id, "rejected")}>Reject</Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tab === 1 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Hours</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(queue.timesheets || []).length === 0 ? (
                    <TableRow><TableCell colSpan={5} align="center">No pending timesheets</TableCell></TableRow>
                  ) : (
                    queue.timesheets.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.employee?.name || "—"}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.startTime} – {row.endTime}</TableCell>
                        <TableCell><Chip label={row.status} size="small" color="warning" /></TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Button size="small" variant="contained" color="success" onClick={() => handleTimesheetAction(row.id, "approved")}>Approve</Button>
                            <Button size="small" variant="outlined" color="error" onClick={() => handleTimesheetAction(row.id, "rejected")}>Reject</Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ApprovalsQueuePanel;
