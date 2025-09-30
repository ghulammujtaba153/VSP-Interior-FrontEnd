"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";
import {
  Box,
  Grid,
  TextField,
  Typography,
  IconButton,
  Button,
  Card,
  CardContent,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Close";

const emptyRecord = {
  supplierId: "",
  finishMaterial: "",
  materialType: "",
  measure: "",
  materialCost: 0,
  edgingCost: 0,
};

const CreateProjectStep3 = ({ records, setRecords }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/suppliers/get?limit=1000`);
        setSuppliers(res.data.data || []);
      } catch (error) {
        toast.error("Error fetching suppliers");
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  const handleChange = (idx, e) => {
    const { name, value } = e.target;
    const updated = records.map((rec, i) =>
      i === idx
        ? {
            ...rec,
            [name]: name.includes("Cost")
              ? value === ""
                ? 0
                : parseFloat(value)
              : value,
          }
        : rec
    );
    setRecords(updated);
  };

  const handleAddRecord = () => {
    setRecords([...records, { ...emptyRecord }]);
  };

  const handleRemoveRecord = (idx) => {
    setRecords(records.filter((_, i) => i !== idx));
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Project Materials Setup
      </Typography>

      {records.map((form, idx) => (
        <Card
          key={idx}
          variant="outlined"
          sx={{ mb: 3, position: "relative", borderRadius: 2, boxShadow: 2 }}
        >
          <CardContent>
            {/* Remove button */}
            <IconButton
              aria-label="remove"
              onClick={() => handleRemoveRecord(idx)}
              disabled={records.length === 1}
              sx={{ position: "absolute", top: 8, right: 8 }}
            >
              <DeleteIcon color="error" />
            </IconButton>

            <Grid container spacing={2}>
              {/* Supplier */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  sx={{ minWidth: 120 }}
                  size="small"
                  label="Supplier"
                  name="supplierId"
                  value={form.supplierId}
                  onChange={(e) => handleChange(idx, e)}
                  disabled={loading}
                >
                  <MenuItem value="">Select supplier</MenuItem>
                  {loading ? (
                    <MenuItem disabled>
                      <CircularProgress size={18} sx={{ mr: 1 }} /> Loading...
                    </MenuItem>
                  ) : (
                    suppliers.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              </Grid>

              {/* Finish Material */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Finish Material"
                  name="finishMaterial"
                  value={form.finishMaterial}
                  onChange={(e) => handleChange(idx, e)}
                  placeholder="Enter finish material"
                />
              </Grid>

              {/* Material Type */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Material Type"
                  name="materialType"
                  value={form.materialType}
                  onChange={(e) => handleChange(idx, e)}
                  placeholder="Enter material type"
                />
              </Grid>

              {/* Measure */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Measure (M2/LM)"
                  name="measure"
                  value={form.measure}
                  onChange={(e) => handleChange(idx, e)}
                  placeholder="Enter measure (M2/LM)"
                />
              </Grid>

              {/* Material Cost */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  size="small"
                  label="Material Cost"
                  name="materialCost"
                  value={form.materialCost}
                  onChange={(e) => handleChange(idx, e)}
                  placeholder="Enter material cost"
                  inputProps={{ min: 0, step: "0.01" }}
                />
              </Grid>

              {/* Edging Cost */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  size="small"
                  label="Edging Cost"
                  name="edgingCost"
                  value={form.edgingCost}
                  onChange={(e) => handleChange(idx, e)}
                  placeholder="Enter edging cost"
                  inputProps={{ min: 0, step: "0.01" }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}

      {/* Add Material Button */}
      <Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddRecord}
          sx={{ fontWeight: "bold", borderRadius: 2 }}
        >
          + Add Material
        </Button>
      </Box>
    </Box>
  );
};

export default CreateProjectStep3;
