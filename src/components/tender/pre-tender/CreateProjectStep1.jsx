"use client";

import { BASE_URL } from "@/configs/url";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  TextField,
  Grid,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Box,
  Autocomplete,
} from "@mui/material";
import { MuiTelInput } from "mui-tel-input";

const CreateProjectStep1 = ({ formData, setFormData }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/client/get?limit=1000`);
        setClients(res.data.data || []);
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

  const normalizePhone = (raw) => {
    if (!raw) return "";
    // remove control chars, tabs, keep plus and digits
    const cleaned = String(raw).replace(/[\t\r\n]+/g, "").trim();
    return cleaned.replace(/[^\d+]/g, "");
  };

  const formatDateForInput = (val) => {
    if (!val) return "";
    // if already in YYYY-MM-DD return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const d = new Date(val);
    if (isNaN(d)) {
      // fallback: try to take first 10 chars (ISO)
      return String(val).slice(0, 10);
    }
    return d.toISOString().slice(0, 10);
  };

  const handleClientSelect = (_, client) => {
    if (client) {
      const phone = normalizePhone(
        client.phoneNumber ?? client.phone ?? client.phone_no ?? ""
      );
      const email = client.emailAddress ?? client.email ?? "";
      setFormData({
        ...formData,
        clientId: client.id,
        clientPhone: phone,
        clientEmail: email,
      });
    } else {
      setFormData({
        ...formData,
        clientId: "",
        clientPhone: "",
        clientEmail: "",
      });
    }
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

        <Grid container spacing={3} direction="column">
          <Grid item xs={12}>
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

          <Grid item xs={12}>
            <Autocomplete
              options={clients}
              getOptionLabel={(option) =>
                option?.companyName ? option.companyName : option?.name ?? ""
              }
              value={clients.find((c) => c.id === formData.clientId) || null}
              onChange={handleClientSelect}
              loading={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Client"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            <CircularProgress size={20} />
                          </Box>
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              disablePortal
              clearOnEscape
              fullWidth
              freeSolo={false}
            />
          </Grid>

          <Grid item xs={12}>
            <MuiTelInput
              fullWidth
              label="Client Phone"
              name="clientPhone"
              value={formData.clientPhone || ""}
              onChange={(val) => setFormData({ ...formData, clientPhone: val })}
              placeholder="Client phone"
              forceCallingCode
              disabled={true}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Client Email"
              name="clientEmail"
              value={formData.clientEmail || ""}
              onChange={handleChange}
              placeholder="Client email"
              variant="outlined"
              disabled
              InputProps={{ readOnly: true }}
            />
          </Grid>

          

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Quote Number"
              name="quoteNumber"
              value={formData.quoteNumber || ""}
              onChange={handleChange}
              placeholder="Enter project number"
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Quote Revision"
              name="quoteRevision"
              value={formData.quoteRevision || ""}
              onChange={handleChange}
              placeholder="Enter quote revision"
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Quote Due Date"
              name="quoteDueDate"
              type="date"
              value={formatDateForInput(formData.quoteDueDate)}
              onChange={(e) =>
                setFormData({ ...formData, quoteDueDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Estimator"
              name="estimator"
              value={formData.estimator || ""}
              onChange={handleChange}
              placeholder="Enter estimator"
              variant="outlined"
            />
          </Grid>


          <Grid item xs={12}>
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


          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tender Score"
              name="tenderScore"
              value={formData.tenderScore || ""}
              onChange={handleChange}
              placeholder="Enter tender score"
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Project Number"
              name="projectNumber"
              value={formData.projectNumber || ""}
              onChange={handleChange}
              placeholder="Enter project number"
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Project Date"
              name="projectDate"
              type="date"
              value={formatDateForInput(formData.projectDate)}
              onChange={(e) =>
                setFormData({ ...formData, projectDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CreateProjectStep1;
