"use client";

import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  MenuItem,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Search, Add, Upload, CalendarToday, CheckCircle, Warning, Cancel } from "@mui/icons-material";

const Certifications = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const certifications = [
    {
      id: 1,
      employee: "Sarah Johnson",
      certification: "Project Management Professional (PMP)",
      issuer: "PMI",
      issueDate: "2022-06-15",
      expiryDate: "2025-06-15",
      status: "Valid",
      daysToExpiry: 545,
    },
    {
      id: 2,
      employee: "Michael Chen",
      certification: "Construction Safety Certificate",
      issuer: "SafeWork NSW",
      issueDate: "2023-03-10",
      expiryDate: "2024-03-10",
      status: "Expiring Soon",
      daysToExpiry: 45,
    },
    {
      id: 3,
      employee: "Emma Williams",
      certification: "First Aid Certificate",
      issuer: "Red Cross",
      issueDate: "2021-11-20",
      expiryDate: "2024-11-20",
      status: "Valid",
      daysToExpiry: 298,
    },
    {
      id: 4,
      employee: "David Rodriguez",
      certification: "Heavy Vehicle License",
      issuer: "Transport NSW",
      issueDate: "2020-08-15",
      expiryDate: "2024-01-30",
      status: "Expired",
      daysToExpiry: -15,
    },
    {
      id: 5,
      employee: "Michael Chen",
      certification: "White Card",
      issuer: "Master Builders",
      issueDate: "2023-01-15",
      expiryDate: "2026-01-15",
      status: "Valid",
      daysToExpiry: 730,
    },
  ];

  const filteredCertifications = certifications.filter((cert) => {
    const matchesSearch =
      cert.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certification.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.issuer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || cert.status.toLowerCase().replace(" ", "-") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Valid":
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <CheckCircle fontSize="small" color="success" />
            <Typography variant="body2" color="success.main">
              Valid
            </Typography>
          </Stack>
        );
      case "Expiring Soon":
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Warning fontSize="small" color="warning" />
            <Typography variant="body2" color="warning.main">
              Expiring Soon
            </Typography>
          </Stack>
        );
      case "Expired":
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Cancel fontSize="small" color="error" />
            <Typography variant="body2" color="error.main">
              Expired
            </Typography>
          </Stack>
        );
      default:
        return <Typography variant="body2">{status}</Typography>;
    }
  };

  const getExpiryInfo = (expiryDate, daysToExpiry) => {
    const expiry = new Date(expiryDate);
    if (daysToExpiry < 0) {
      return (
        <Typography variant="body2" color="error.main" fontWeight={500}>
          Expired {Math.abs(daysToExpiry)} days ago
        </Typography>
      );
    } else if (daysToExpiry <= 90) {
      return (
        <Typography variant="body2" color="warning.main" fontWeight={500}>
          Expires in {daysToExpiry} days
        </Typography>
      );
    } else {
      return <Typography variant="body2">{expiry.toLocaleDateString()}</Typography>;
    }
  };

  return (
    <Container sx={{ py: 6, spaceY: 6 }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={4}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Certifications & Licences
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track employee certifications and renewal dates
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Upload />}>
            Upload
          </Button>
          <Button variant="contained" startIcon={<Add />} color="primary">
            Add Certification
          </Button>
        </Stack>
      </Stack>

      {/* Status Overview */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={4}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Valid
                </Typography>
                <Typography variant="h5" color="success.main" fontWeight={600}>
                  3
                </Typography>
              </Box>
              <CheckCircle fontSize="large" color="success" />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Expiring Soon
                </Typography>
                <Typography variant="h5" color="warning.main" fontWeight={600}>
                  1
                </Typography>
              </Box>
              <Warning fontSize="large" color="warning" />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Expired
                </Typography>
                <Typography variant="h5" color="error.main" fontWeight={600}>
                  1
                </Typography>
              </Box>
              <Cancel fontSize="large" color="error" />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total
                </Typography>
                <Typography variant="h5" fontWeight={600}>
                  5
                </Typography>
              </Box>
              <CalendarToday fontSize="large" color="action" />
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Search & Filter */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search certifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} /> }}
            />
            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="valid">Valid</MenuItem>
              <MenuItem value="expiring-soon">Expiring Soon</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {/* Certifications Table */}
      <Card>
        <CardHeader
          title={<Typography variant="h6">Certifications & Licences</Typography>}
        />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.100" }}>
                  <TableCell>Employee</TableCell>
                  <TableCell>Certification</TableCell>
                  <TableCell>Issuer</TableCell>
                  <TableCell>Issue Date</TableCell>
                  <TableCell>Expiry Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCertifications.map((cert) => (
                  <TableRow key={cert.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{cert.employee}</TableCell>
                    <TableCell sx={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis" }} title={cert.certification}>
                      {cert.certification}
                    </TableCell>
                    <TableCell>{cert.issuer}</TableCell>
                    <TableCell>{new Date(cert.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{getExpiryInfo(cert.expiryDate, cert.daysToExpiry)}</TableCell>
                    <TableCell>{getStatusBadge(cert.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {filteredCertifications.length === 0 && (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">No certifications found matching your criteria.</Typography>
        </Box>
      )}
    </Container>
  );
};

export default Certifications;
