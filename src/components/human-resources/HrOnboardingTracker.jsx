"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Tooltip,
} from "@mui/material";
import { PersonAdd, CheckCircle, Warning } from "@mui/icons-material";
import Link from "next/link";
import apiClient from "@/lib/axios";
import Loader from "@/components/loader/Loader";
import { toast } from "react-toastify";

const HrOnboardingTracker = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, incomplete: 0, complete: 0, avgPercent: 0 });
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get("/api/hr/onboarding");
        const data = res.data.data || {};
        setSummary(data.summary || {});
        setEmployees(data.employees || []);
      } catch {
        toast.error("Failed to load onboarding data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader />;

  const incompleteRows = employees.filter((e) => e.percent < 100);

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <PersonAdd color="primary" fontSize="large" />
        <Box>
          <Typography variant="h5" fontWeight={700}>Employee Onboarding Tracker</Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor new-hire setup across employment profile, payroll, leave, documents, and compliance
          </Typography>
        </Box>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Active employees</Typography>
            <Typography variant="h4" fontWeight={700}>{summary.total}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Fully onboarded</Typography>
            <Typography variant="h4" color="success.main" fontWeight={700}>{summary.complete}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Needs attention</Typography>
            <Typography variant="h4" color="warning.main" fontWeight={700}>{summary.incomplete}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">Average completion</Typography>
            <Typography variant="h4" fontWeight={700}>{summary.avgPercent}%</Typography>
          </CardContent>
        </Card>
      </Stack>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Onboarding progress {incompleteRows.length > 0 && `(showing ${incompleteRows.length} incomplete)`}
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Missing steps</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(incompleteRows.length ? incompleteRows : employees).map((emp) => {
                  const missing = (emp.steps || []).filter((s) => !s.complete).map((s) => s.label);
                  return (
                    <TableRow key={emp.userId} hover>
                      <TableCell>
                        <Typography fontWeight={600}>{emp.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{emp.email}</Typography>
                      </TableCell>
                      <TableCell>{emp.department || "—"}</TableCell>
                      <TableCell sx={{ minWidth: 160 }}>
                        <Stack spacing={0.5}>
                          <LinearProgress variant="determinate" value={emp.percent} color={emp.percent === 100 ? "success" : "primary"} />
                          <Typography variant="caption">{emp.percent}% ({emp.completed}/{emp.total})</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {emp.percent === 100 ? (
                          <Chip icon={<CheckCircle />} label="Complete" color="success" size="small" />
                        ) : (
                          <Tooltip title={missing.join(", ")}>
                            <Chip icon={<Warning />} label={`${missing.length} step(s)`} color="warning" size="small" variant="outlined" />
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Button component={Link} href={`/human-resource/staff/${emp.userId}`} size="small" variant="outlined">
                          Open profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HrOnboardingTracker;
