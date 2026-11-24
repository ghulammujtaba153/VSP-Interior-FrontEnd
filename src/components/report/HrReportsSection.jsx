"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import apiClient from "@/lib/axios";
import Loader from "@/components/loader/Loader";

export default function HrReportsSection() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const res = await apiClient.get("/api/hr/reports/dashboard");
        setData(res.data.data || res.data);
      } catch (err) {
        setError(err.response?.status === 403
          ? 'You need HR admin access to view these reports.'
          : 'Failed to load HR reports.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">{error}</Typography>
      </Box>
    );
  }

  const cards = [
    { label: "Headcount", value: Object.values(data?.headcountByDepartment || {}).reduce((a, b) => a + b, 0) },
    { label: "Pending leave", value: data?.pendingLeave ?? 0 },
    { label: "Recent labour (100 payslips)", value: `$${(data?.recentLabourCost || []).reduce((a, p) => a + Number(p.grossPay || 0), 0).toFixed(0)}` },
    { label: "Certs expiring soon", value: data?.expiringCertifications ?? 0 },
    { label: "Timesheet backlog", value: data?.pendingTimesheets ?? 0 },
  ];

  const byDepartment = Object.entries(data?.headcountByDepartment || {}).map(([department, count]) => ({
    department,
    count,
  }));

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={2}>
        HR Reports
      </Typography>
      <Grid container spacing={2}>
        {cards.map((c) => (
          <Grid item xs={12} sm={6} md={4} key={c.label}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {c.label}
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {c.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {byDepartment.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={1} mt={3}>
          {byDepartment.map((d) => (
            <Chip key={d.department} label={`${d.department || "Unassigned"}: ${d.count}`} />
          ))}
        </Stack>
      )}
    </Box>
  );
}
