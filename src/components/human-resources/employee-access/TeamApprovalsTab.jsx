"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import apiClient from "@/lib/axios";
import ApprovalsQueuePanel from "../ApprovalsQueuePanel";
import Loader from "@/components/loader/Loader";

const TeamApprovalsTab = () => {
  const [checking, setChecking] = useState(true);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await apiClient.get("/api/hr/approvals/queue?scope=team");
        const data = res.data.data || {};
        setCanAccess(data.isManager || data.isHrAdmin || (data.counts?.total > 0));
      } catch {
        setCanAccess(false);
      } finally {
        setChecking(false);
      }
    };
    check();
  }, []);

  if (checking) return <Loader />;

  if (!canAccess) {
    return (
      <Box py={4} textAlign="center">
        <Typography color="text.secondary">
          You don&apos;t have any direct reports assigned. Ask HR to set your manager link on team members&apos; employment profiles.
        </Typography>
      </Box>
    );
  }

  return (
    <ApprovalsQueuePanel
      scope="team"
      title="Team Approvals"
    />
  );
};

export default TeamApprovalsTab;
