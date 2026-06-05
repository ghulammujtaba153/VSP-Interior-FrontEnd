"use client";

import ProjectUi from "@/components/tender/project-ui/scheduling/ProjectUi";
import LiveBoard from "@/components/tender/project-ui/scheduling/LiveBoard";
import React, { useState } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import AppsIcon from "@mui/icons-material/Apps";

const Page = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            "& .MuiTab-root": {
              minHeight: 60,
              fontSize: "0.95rem",
              fontWeight: 500,
              textTransform: "none",
              gap: 1,
            },
          }}
        >
          <Tab
            icon={<FiberManualRecordIcon sx={{ color: "error.main", fontSize: 14 }} />}
            iconPosition="start"
            label="Live Board"
          />
          <Tab
            icon={<AppsIcon />}
            iconPosition="start"
            label="Projects"
          />
        </Tabs>
      </Box>

      <Box>
        {tab === 0 && <LiveBoard />}
        {tab === 1 && <ProjectUi />}
      </Box>
    </Box>
  );
};

export default Page;
