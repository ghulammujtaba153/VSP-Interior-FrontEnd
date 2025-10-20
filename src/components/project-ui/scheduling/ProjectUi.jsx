"use client";

import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  ButtonGroup,
  Box,
  Paper,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import ManagerView from "./ManagerView";
import EmployeeView from "./EmployeeView";

const ProjectUi = () => {
  const [userRole, setUserRole] = useState("manager");

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar>
          <Container
            maxWidth="lg"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Job Scheduling
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userRole === "manager"
                  ? "Manage projects and resources"
                  : "View your schedule"}
              </Typography>
            </Box>

            {/* Role Switcher */}
            <Paper
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                borderRadius: 3,
                bgcolor: "action.hover",
                p: 0.5,
              }}
            >
              <ButtonGroup variant="text" size="small">
                <Button
                  startIcon={<GroupsIcon />}
                  onClick={() => setUserRole("manager")}
                  variant={
                    userRole === "manager" ? "contained" : "outlined"
                  }
                  color="primary"
                >
                  Manager
                </Button>
                <Button
                  startIcon={<PersonIcon />}
                  onClick={() => setUserRole("employee")}
                  variant={
                    userRole === "employee" ? "contained" : "outlined"
                  }
                  color="primary"
                >
                  Employee
                </Button>
              </ButtonGroup>
            </Paper>
          </Container>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {userRole === "manager" ? <ManagerView /> : <EmployeeView />}
      </Container>
    </Box>
  );
};

export default ProjectUi;
