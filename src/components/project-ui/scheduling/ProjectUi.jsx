"use client";

import React, { useEffect, useState } from "react";
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
import { useAuth } from '@/context/authContext'

const ProjectUi = () => {
  const [userRole, setUserRole] = useState("project manager");
  const {user} = useAuth()

  console.log("Authenticated user:", user);

  useEffect(() => {
    if (user && user.Role && user.Role.name) {
      setUserRole(user.Role.name);
    }
  }, [user]);

  

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
                {userRole == "project manager"
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
                  onClick={() => setUserRole("project manager")}
                  variant={
                    userRole === "project manager" ? "contained" : "outlined"
                  }
                  color="primary"
                >
                  Manager
                </Button>
                <Button
                  startIcon={<PersonIcon />}
                  onClick={() => setUserRole("Worker")}
                  variant={
                    userRole === "Worker" ? "contained" : "outlined"
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
        {userRole === "project manager" ? <ManagerView /> : <EmployeeView />}
      </Container>
    </Box>
  );
};

export default ProjectUi;
