"use client";

import { BASE_URL } from "@/configs/url";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Box,
} from "@mui/material";

const CreateProjectStep1 = ({ formData, setFormData }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/client/get?limit=1000`);
        setClients(res.data.data);
      } catch (error) {
        toast.error("Error fetching clients");
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        p: 2,
        backgroundColor: "#fafafa",
      }}
    >
      <CardContent>
        <Typography
          variant="h5"
          fontWeight="bold"
          gutterBottom
          sx={{ mb: 3, color: "primary.main" }}
        >
          Project Setup
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Project/Tender Name"
              name="projectName"
              value={formData.projectName || ""}
              onChange={handleChange}
              placeholder="Enter project/tender name"
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Site Location"
              name="siteLocation"
              value={formData.siteLocation || ""}
              onChange={handleChange}
              placeholder="Enter site location"
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Access Notes"
              name="accessNotes"
              value={formData.accessNotes || ""}
              onChange={handleChange}
              placeholder="Enter access notes"
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Client</InputLabel>
              <Select
                fullWidth
                sx={{ minWidth: 120 }}
                name="clientId"
                value={formData.clientId || ""}
                onChange={handleChange}
                label="Client"
                disabled={loading}
              >
                {loading ? (
                  <MenuItem value="">
                    <Box display="flex" alignItems="center" gap={1}>
                      <CircularProgress size={20} />
                      Loading...
                    </Box>
                  </MenuItem>
                ) : (
                  <MenuItem value="">Select client</MenuItem>
                )}
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.companyName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="QS Name"
              name="qsName"
              value={formData.qsName || ""}
              onChange={handleChange}
              placeholder="Enter QS name"
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="QS Phone"
              name="qsPhone"
              value={formData.qsPhone || ""}
              onChange={handleChange}
              placeholder="Enter QS phone"
              variant="outlined"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CreateProjectStep1;
