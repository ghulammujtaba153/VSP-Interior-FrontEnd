"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Badge,
  TextField,
  IconButton,
  Button,
  Stack,
} from "@mui/material";
import {
  Search,
  Add,
  Mail,
  Phone,
  LocationOn,
  CalendarToday,
} from "@mui/icons-material";

const StaffProfiles = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const staffMembers = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Project Manager",
      department: "Operations",
      email: "sarah.johnson@company.com",
      phone: "+1 (555) 123-4567",
      location: "Sydney, NSW",
      startDate: "2022-03-15",
      status: "Active",
      avatar: "/placeholder-avatar.jpg",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Site Supervisor",
      department: "Construction",
      email: "michael.chen@company.com",
      phone: "+1 (555) 234-5678",
      location: "Melbourne, VIC",
      startDate: "2021-08-22",
      status: "Active",
      avatar: "/placeholder-avatar.jpg",
    },
    {
      id: 3,
      name: "Emma Williams",
      role: "Safety Officer",
      department: "Health & Safety",
      email: "emma.williams@company.com",
      phone: "+1 (555) 345-6789",
      location: "Brisbane, QLD",
      startDate: "2023-01-10",
      status: "On Leave",
      avatar: "/placeholder-avatar.jpg",
    },
  ];

  const filteredStaff = staffMembers.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container sx={{ py: 6 }}>
      {/* Header with Search and Add Button */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={4}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Staff Profiles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage employee information and roles
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} width={{ xs: "100%", sm: "auto" }}>
          <TextField
            size="small"
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            color="primary"
          >
            Add Staff
          </Button>
        </Stack>
      </Stack>

      {/* Staff Cards Grid */}
      <Grid container spacing={3}>
        {filteredStaff.map((staff) => (
          <Grid item xs={12} md={6} lg={4} key={staff.id}>
            <Card sx={{ cursor: "pointer" }}>
              <CardHeader
                avatar={
                  <Avatar
                    alt={staff.name}
                    src={staff.avatar}
                  >
                    {staff.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </Avatar>
                }
                action={
                  <Badge
                    color={staff.status === "Active" ? "success" : "warning"}
                    badgeContent={staff.status}
                  />
                }
                title={
                  <Typography variant="h6">{staff.name}</Typography>
                }
                subheader={
                  <Typography variant="body2" color="text.secondary">
                    {staff.role}
                  </Typography>
                }
              />
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Mail fontSize="small" />
                    <Typography variant="body2">{staff.email}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Phone fontSize="small" />
                    <Typography variant="body2">{staff.phone}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationOn fontSize="small" />
                    <Typography variant="body2">{staff.location}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarToday fontSize="small" />
                    <Typography variant="body2">
                      Started {new Date(staff.startDate).toLocaleDateString()}
                    </Typography>
                  </Stack>
                  <Box pt={1}>
                    <Badge
                      color="primary"
                      badgeContent={staff.department}
                      sx={{ fontSize: 12 }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {filteredStaff.length === 0 && (
          <Box textAlign="center" py={6} width="100%">
            <Typography color="text.secondary">
              No staff members found matching your search.
            </Typography>
          </Box>
        )}
      </Grid>
    </Container>
  );
};

export default StaffProfiles;
