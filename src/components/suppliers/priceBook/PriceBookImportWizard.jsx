"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { CloudUpload, CheckCircle } from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";
import { FORMAT_LABELS, IMPORT_CHUNK_SIZE, chunkArray } from "@/lib/priceBookUtils";
import PriceBookTierCell from "./PriceBookTierCell";

const PriceBookImportWizard = ({ supplierId, onImported }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formatKey, setFormatKey] = useState("");
  const [formats, setFormats] = useState([]);
  const [preview, setPreview] = useState(null);
  const [items, setItems] = useState([]);
  const [versionAction, setVersionAction] = useState("new");
  const [selectedVersion, setSelectedVersion] = useState("v1");
  const [versions, setVersions] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [done, setDone] = useState(null);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/pricebook/formats`).then((res) => {
      setFormats(res.data.formats || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (supplierId) {
      axios.get(`${BASE_URL}/api/pricebook/versions/${supplierId}`).then((res) => {
        setVersions(res.data.versions || []);
      }).catch(() => setVersions([]));
    }
  }, [supplierId]);

  const handleFile = async (f) => {
    if (!f) return;
    if (!supplierId) {
      toast.error("Select a supplier first");
      return;
    }
    setFile(f);
    setUploading(true);
    setDone(null);
    try {
      const form = new FormData();
      form.append("file", f);
      form.append("supplierId", String(supplierId));
      if (formatKey) form.append("formatKey", formatKey);

      const res = await axios.post(`${BASE_URL}/api/pricebook/import/preview`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPreview(res.data);
      setItems(res.data.items || []);
      if (res.data.formatKey) setFormatKey(res.data.formatKey);
      toast.success(`Parsed ${res.data.stats?.itemCount || 0} products from ${res.data.stats?.totalRows || 0} rows`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Preview failed");
      setPreview(null);
      setItems([]);
    } finally {
      setUploading(false);
    }
  };

  const rerunPreview = () => {
    if (file) handleFile(file);
  };

  const handleCommit = async () => {
    if (!items.length) {
      toast.error("No items to import");
      return;
    }
    setImporting(true);
    setDone(null);

    const chunks = chunkArray(items, IMPORT_CHUNK_SIZE);
    const totalChunks = chunks.length;
    setImportProgress({ current: 0, total: totalChunks });

    const basePayload = {
      supplierId: Number(supplierId),
      formatKey: preview?.formatKey || formatKey,
      fileName: file?.name,
      versionAction,
      version: versionAction === "existing" ? selectedVersion : undefined,
      replaceExisting: versionAction === "existing",
      totalItems: items.length,
      totalChunks,
    };

    let importBatchId = null;
    let lastResponse = null;

    try {
      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
        const res = await axios.post(`${BASE_URL}/api/pricebook/import/commit`, {
          ...basePayload,
          items: chunks[chunkIndex],
          chunkIndex,
          importBatchId: chunkIndex === 0 ? undefined : importBatchId,
          finalize: chunkIndex === chunks.length - 1,
        });
        importBatchId = res.data.importBatchId;
        lastResponse = res.data;
        setImportProgress({ current: chunkIndex + 1, total: totalChunks });
      }

      setDone(lastResponse);
      toast.success(lastResponse.message);
      onImported?.(lastResponse);
    } catch (err) {
      toast.error(err.response?.data?.error || "Import failed");
    } finally {
      setImporting(false);
      setImportProgress({ current: 0, total: 0 });
    }
  };

  if (!supplierId) {
    return (
      <Alert severity="info">Select a supplier above before importing a price list.</Alert>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, border: "2px dashed", borderColor: "divider", textAlign: "center" }}>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          id="pricebook-import-file"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <label htmlFor="pricebook-import-file">
          <Button component="span" variant="outlined" startIcon={<CloudUpload />} disabled={uploading}>
            Choose CSV or Excel file
          </Button>
        </label>
        {file && (
          <Typography variant="body2" color="text.secondary" mt={1}>
            {file.name}
          </Typography>
        )}
        {uploading && <LinearProgress sx={{ mt: 2 }} />}
      </Paper>

      {preview && (
        <Stack spacing={2} mb={3}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Format profile</InputLabel>
              <Select
                label="Format profile"
                value={formatKey}
                onChange={(e) => setFormatKey(e.target.value)}
              >
                {formats.map((f) => (
                  <MenuItem key={f.key} value={f.key}>{f.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button size="small" onClick={rerunPreview}>Re-parse</Button>
            <Chip label={FORMAT_LABELS[preview.formatKey] || preview.formatKey} color="primary" />
            <Chip label={`${preview.stats?.itemCount || 0} products`} />
          </Stack>

          {preview.warnings?.map((w, i) => (
            <Alert key={i} severity="warning">{w}</Alert>
          ))}
          {preview.errors?.map((e, i) => (
            <Alert key={i} severity="error">{e}</Alert>
          ))}

          <FormControl>
            <Typography variant="subtitle2" gutterBottom>Version</Typography>
            <RadioGroup row value={versionAction} onChange={(e) => setVersionAction(e.target.value)}>
              <FormControlLabel value="new" control={<Radio />} label="Create new version (deactivate previous)" />
              <FormControlLabel value="existing" control={<Radio />} label="Update existing version" />
            </RadioGroup>
          </FormControl>

          {versionAction === "existing" && (
            <FormControl size="small" sx={{ maxWidth: 200 }}>
              <InputLabel>Version</InputLabel>
              <Select label="Version" value={selectedVersion} onChange={(e) => setSelectedVersion(e.target.value)}>
                {versions.map((v) => (
                  <MenuItem key={v} value={v}>{v}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Button
            variant="contained"
            color="warning"
            disabled={importing || !items.length}
            onClick={handleCommit}
          >
            {importing
              ? `Importing batch ${importProgress.current} of ${importProgress.total}…`
              : `Import ${items.length} products${items.length > IMPORT_CHUNK_SIZE ? ` (${Math.ceil(items.length / IMPORT_CHUNK_SIZE)} batches)` : ""}`}
          </Button>
          {importing && importProgress.total > 0 && (
            <LinearProgress
              variant="determinate"
              value={(importProgress.current / importProgress.total) * 100}
            />
          )}
        </Stack>
      )}

      {done && (
        <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
          {done.message} — Version {done.version}
        </Alert>
      )}

      {items.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Price / Tiers</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.slice(0, 100).map((row, i) => (
                <TableRow key={`${row.sku}-${i}`}>
                  <TableCell>{row.sku}</TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>{row.description || row.name}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell>
                    <PriceBookTierCell tiers={row.priceTiers} basePrice={row.basePrice} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {items.length > 100 && (
            <Typography variant="caption" p={2} display="block">
              Showing first 100 of {items.length} products
            </Typography>
          )}
        </TableContainer>
      )}
    </Box>
  );
};

export default PriceBookImportWizard;
