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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

const emptyRecord = {
  supplierId: "",
  finishMaterial: "",
  materialType: "",
  measure: "",
  materialCost: "",
  edgingCost: "",
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

  const handleChange = (idx, field, value) => {
    const updated = records.map((rec, i) =>
      i === idx
        ? {
            ...rec,
            [field]: value,
          }
        : rec
    );
    setRecords(updated);
  };

  const handleAddRecord = () => {
    setRecords([...records, { ...emptyRecord }]);
  };

  const handleRemoveRecord = (idx) => {
    if (records.length > 1) {
      setRecords(records.filter((_, i) => i !== idx));
    }
  };

  // Initialize with one empty row if no records
  useEffect(() => {
    if (records.length === 0) {
      setRecords([{ ...emptyRecord }]);
    }
  }, [records.length, setRecords]);

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        Project Materials Setup
      </Typography>

      <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "primary.light" }}>
                  <TableCell sx={{ color: "white", fontWeight: "bold", width: "18%" }}>
                    Supplier
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", width: "18%" }}>
                    Finish Material
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", width: "15%" }}>
                    Material Type
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", width: "12%" }}>
                    Measure
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", width: "15%" }}>
                    Material Cost ($)
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", width: "15%" }}>
                    Edging Cost ($)
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", width: "7%" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((form, idx) => (
                  <TableRow 
                    key={idx}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    {/* Supplier */}
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        variant="standard"
                        value={form.supplierId}
                        onChange={(e) => handleChange(idx, "supplierId", e.target.value)}
                        disabled={loading}
                        InputProps={{ disableUnderline: true }}
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
                    </TableCell>

                    {/* Finish Material */}
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        variant="standard"
                        value={form.finishMaterial}
                        onChange={(e) => handleChange(idx, "finishMaterial", e.target.value)}
                        placeholder="Enter finish material"
                        InputProps={{ disableUnderline: true }}
                      />
                    </TableCell>

                    {/* Material Type */}
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        variant="standard"
                        value={form.materialType}
                        onChange={(e) => handleChange(idx, "materialType", e.target.value)}
                        placeholder="Enter material type"
                        InputProps={{ disableUnderline: true }}
                      />
                    </TableCell>

                    {/* Measure */}
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        variant="standard"
                        value={form.measure}
                        onChange={(e) => handleChange(idx, "measure", e.target.value)}
                        placeholder="M2/LM"
                        InputProps={{ disableUnderline: true }}
                      />
                    </TableCell>

                    {/* Material Cost */}
                    <TableCell>
                      <TextField
                        fullWidth
                        type="number"
                        size="small"
                        variant="standard"
                        value={form.materialCost}
                        onChange={(e) => handleChange(idx, "materialCost", e.target.value)}
                        placeholder="0.00"
                        inputProps={{ 
                          min: 0, 
                          step: "0.01",
                          style: { textAlign: 'right' }
                        }}
                        InputProps={{ 
                          disableUnderline: true,
                          startAdornment: <Typography variant="body2" sx={{ mr: 0.5 }}>$</Typography>
                        }}
                      />
                    </TableCell>

                    {/* Edging Cost */}
                    <TableCell>
                      <TextField
                        fullWidth
                        type="number"
                        size="small"
                        variant="standard"
                        value={form.edgingCost}
                        onChange={(e) => handleChange(idx, "edgingCost", e.target.value)}
                        placeholder="0.00"
                        inputProps={{ 
                          min: 0, 
                          step: "0.01",
                          style: { textAlign: 'right' }
                        }}
                        InputProps={{ 
                          disableUnderline: true,
                          startAdornment: <Typography variant="body2" sx={{ mr: 0.5 }}>$</Typography>
                        }}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveRecord(idx)}
                        disabled={records.length === 1}
                        color="error"
                        sx={{ 
                          opacity: records.length === 1 ? 0.3 : 1,
                          '&:hover': { backgroundColor: 'error.light', color: 'white' }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add Row Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddRecord}
          sx={{ fontWeight: "bold", borderRadius: 2 }}
        >
          Add Row
        </Button>
      </Box>

      {/* Summary */}
      {records.length > 0 && (
        <Card variant="outlined" sx={{ mt: 3, backgroundColor: 'grey.50' }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight="bold" color="primary">
              Materials Summary
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Total Materials:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {records.length}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Total Material Cost:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  ${records.reduce((sum, record) => sum + (parseFloat(record.materialCost) || 0), 0).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Total Edging Cost:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  ${records.reduce((sum, record) => sum + (parseFloat(record.edgingCost) || 0), 0).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Grand Total:
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="primary">
                  ${records.reduce((sum, record) => 
                    sum + (parseFloat(record.materialCost) || 0) + (parseFloat(record.edgingCost) || 0), 0
                  ).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CreateProjectStep3;