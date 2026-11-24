"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
} from "@mui/material";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";
import Loader from "@/components/loader/Loader";
import { FORMAT_LABELS } from "@/lib/priceBookUtils";

const PriceBookImportHistory = ({ supplierId, refreshKey = 0 }) => {
  const [loading, setLoading] = useState(true);
  const [imports, setImports] = useState([]);

  const fetchHistory = async () => {
    if (!supplierId) {
      setImports([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/pricebook/imports/${supplierId}`);
      setImports(res.data.data || []);
    } catch {
      toast.error("Failed to load import history");
      setImports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [supplierId, refreshKey]);

  if (!supplierId) {
    return (
      <Typography color="text.secondary">Select a supplier to view import history.</Typography>
    );
  }

  if (loading) return <Loader />;

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell><b>Date</b></TableCell>
            <TableCell><b>File</b></TableCell>
            <TableCell><b>Format</b></TableCell>
            <TableCell><b>Version</b></TableCell>
            <TableCell><b>Status</b></TableCell>
            <TableCell align="right"><b>Rows</b></TableCell>
            <TableCell align="right"><b>Inserted</b></TableCell>
            <TableCell align="right"><b>Updated</b></TableCell>
            <TableCell align="right"><b>Skipped</b></TableCell>
            <TableCell><b>Imported by</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {imports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} align="center">No imports yet</TableCell>
            </TableRow>
          ) : (
            imports.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
                <TableCell>{row.fileName}</TableCell>
                <TableCell>{FORMAT_LABELS[row.formatKey] || row.formatKey}</TableCell>
                <TableCell>{row.version}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={row.status}
                    color={row.status === "completed" ? "success" : row.status === "failed" ? "error" : "default"}
                  />
                </TableCell>
                <TableCell align="right">{row.rowCount}</TableCell>
                <TableCell align="right">{row.insertedCount}</TableCell>
                <TableCell align="right">{row.updatedCount}</TableCell>
                <TableCell align="right">{row.skippedCount}</TableCell>
                <TableCell>{row.importedBy?.name || "—"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PriceBookImportHistory;
