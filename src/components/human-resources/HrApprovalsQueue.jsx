"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Chip,
} from "@mui/material";
import { PendingActions, EventAvailable, AccessTime } from "@mui/icons-material";
import apiClient from "@/lib/axios";
import Link from "next/link";

const HrApprovalsQueue = () => {
  const [stats, setStats] = useState({ pendingLeave: 0, pendingTimesheets: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get("/api/hr/approvals/queue?scope=all");
        const data = res.data.data || {};
        setStats({
          pendingLeave: data.counts?.leave || 0,
          pendingTimesheets: data.counts?.timesheets || 0,
        });
      } catch {
        try {
          const fallback = await apiClient.get("/api/hr/reports/dashboard");
          const data = fallback.data.data || {};
          setStats({
            pendingLeave: data.pendingLeave || 0,
            pendingTimesheets: data.pendingTimesheets || 0,
          });
        } catch {
          /* ignore */
        }
      }
    };
    load();
  }, []);

  const total = stats.pendingLeave + stats.pendingTimesheets;
  if (total === 0) return null;

  return (
    <Card sx={{ mb: 3, borderRadius: 3, borderLeft: 4, borderColor: "warning.main" }}>
      <CardContent>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <PendingActions color="warning" />
              <Typography variant="h6" fontWeight={700}>
                Approvals Queue
              </Typography>
              <Chip label={total} color="warning" size="small" />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {stats.pendingLeave} leave request(s) and {stats.pendingTimesheets} timesheet(s) awaiting review
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/human-resource?tab=approvals"
            variant="contained"
            size="small"
            startIcon={<PendingActions />}
          >
            Open Approvals Center
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default HrApprovalsQueue;
