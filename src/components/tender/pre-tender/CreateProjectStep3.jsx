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
  Chip,
  Divider,
  Stack,
  alpha,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Inventory2Outlined,
  AttachMoney,
  SummarizeOutlined,
} from "@mui/icons-material";
import CatalogPicker from "@/components/tender/catalog/CatalogPicker";
import { catalogItemToLineFields, CATALOG_LINE_DEFAULTS } from "@/lib/catalogUtils";
import { formatNzdPrice } from "@/lib/priceBookUtils";

const emptyRecord = {
  ...CATALOG_LINE_DEFAULTS,
  supplierId: "",
  finishMaterial: "",
  materialType: "",
  measure: "",
  materialCost: "",
  edgingCost: "",
  quantity: "",
  unit: "",
  quotedUnitPrice: null,
};

function SectionLabel({ children }) {
  return (
    <Typography
      variant="overline"
      sx={{
        display: "block",
        color: "text.secondary",
        fontWeight: 700,
        letterSpacing: 1,
        mb: 1.5,
      }}
    >
      {children}
    </Typography>
  );
}

function StatTile({ label, value, accent, highlight }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: { xs: "100%", sm: 140 },
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: highlight ? "success.main" : "divider",
        bgcolor: "transparent",
        ...(highlight && {
          boxShadow: (t) => `0 0 0 1px ${alpha(t.palette.success.main, 0.25)}`,
        }),
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        gutterBottom
        sx={{ fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography
        variant="h6"
        fontWeight={700}
        color={accent || "text.primary"}
        sx={{ lineHeight: 1.2 }}
      >
        {value}
      </Typography>
    </Box>
  );
}

const CreateProjectStep3 = ({ records, setRecords }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/suppliers/get?limit=1000`);
        setSuppliers(res.data.data || []);
      } catch {
        toast.error("Error fetching suppliers");
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  const handleChange = (idx, field, value) => {
    setRecords(records.map((rec, i) => (i === idx ? { ...rec, [field]: value } : rec)));
  };

  const handleCatalogSelect = (idx, item) => {
    const fields = catalogItemToLineFields(item);
    setRecords(records.map((rec, i) =>
      i === idx
        ? {
            ...rec,
            ...fields,
            supplierId: item.supplierId || rec.supplierId,
            finishMaterial: fields.finishMaterial || fields.description,
            materialType: item.category || rec.materialType,
            measure: fields.unit || rec.measure,
            materialCost: fields.materialCost,
            quotedUnitPrice: fields.quotedUnitPrice,
            stockQty: item.stockQty,
            priceTiers: item.priceTiers,
          }
        : rec
    ));
  };

  const handleCatalogClear = (idx) => {
    setRecords(records.map((rec, i) =>
      i === idx
        ? {
            ...rec,
            ...CATALOG_LINE_DEFAULTS,
            supplierId: rec.supplierId,
            finishMaterial: "",
            materialType: "",
            measure: "",
            materialCost: "",
            edgingCost: "",
          }
        : rec
    ));
  };

  const handleAddRecord = () => setRecords([...records, { ...emptyRecord }]);
  const handleRemoveRecord = (idx) => {
    if (records.length > 1) setRecords(records.filter((_, i) => i !== idx));
  };

  useEffect(() => {
    if (records.length === 0) setRecords([{ ...emptyRecord }]);
  }, [records.length, setRecords]);

  const totalMaterial = records.reduce((s, r) => s + (parseFloat(r.materialCost) || 0), 0);
  const totalEdging = records.reduce((s, r) => s + (parseFloat(r.edgingCost) || 0), 0);
  const catalogCount = records.filter(
    (r) => r.sourceType === "pricebook" || r.sourceType === "inventory"
  ).length;

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Project Materials Setup
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={640}>
          Select a supplier, pick from their pricebook or warehouse stock, then review costs.
          Quoted prices are snapshotted when you save the project.
        </Typography>
      </Box>

      <Stack spacing={2.5}>
        {records.map((form, idx) => (
          <Card
            key={idx}
            elevation={0}
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {/* Row header */}
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5} minWidth={0}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </Box>
                <Typography variant="subtitle1" fontWeight={600} noWrap>
                  Material line
                </Typography>
                {form.sourceType !== "manual" && (
                  <Chip
                    size="small"
                    label={form.sourceType === "inventory" ? "From stock" : "From pricebook"}
                    color={form.sourceType === "inventory" ? "success" : "primary"}
                    variant="outlined"
                    sx={{ height: 24 }}
                  />
                )}
                {form.sku && (
                  <Chip
                    size="small"
                    label={form.sku}
                    variant="filled"
                    sx={{ height: 24, maxWidth: 160 }}
                  />
                )}
              </Box>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveRecord(idx)}
                disabled={records.length === 1}
                sx={{
                  bgcolor: (t) => alpha(t.palette.error.main, 0.08),
                  "&:hover": { bgcolor: (t) => alpha(t.palette.error.main, 0.16) },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>

            <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
              {/* Supplier + catalog */}
              <SectionLabel>Supplier &amp; catalog</SectionLabel>
              <Stack spacing={2} sx={{ mb: 2.5 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Supplier"
                  value={form.supplierId}
                  onChange={(e) => handleChange(idx, "supplierId", e.target.value)}
                  disabled={loading}
                  SelectProps={{
                    displayEmpty: true,
                    MenuProps: { PaperProps: { sx: { maxHeight: 360 } } },
                  }}
                >
                  <MenuItem value="">
                    <em>Select supplier</em>
                  </MenuItem>
                  {suppliers.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>
                <CatalogPicker
                  layout="inline"
                  supplierId={form.supplierId}
                  value={form}
                  onSelect={(item) => handleCatalogSelect(idx, item)}
                  onClear={() => handleCatalogClear(idx)}
                  label="Search catalog"
                />
              </Stack>

              <Divider sx={{ mb: 2.5 }} />

              {/* Material details */}
              <SectionLabel>Material details</SectionLabel>
              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Finish material"
                    value={form.finishMaterial}
                    onChange={(e) => handleChange(idx, "finishMaterial", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Material type / category"
                    value={form.materialType}
                    onChange={(e) => handleChange(idx, "materialType", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Unit of measure"
                    value={form.measure}
                    onChange={(e) => handleChange(idx, "measure", e.target.value)}
                    placeholder="e.g. M², LM, Each"
                  />
                </Grid>
                {form.quotedUnitPrice != null && form.sourceType !== "manual" && (
                  <Grid item xs={12}>
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      height="100%"
                      px={1.5}
                      py={1}
                      borderRadius={1}
                      sx={{ bgcolor: (t) => alpha(t.palette.success.main, 0.08) }}
                    >
                      <AttachMoney fontSize="small" color="success" />
                      <Typography variant="body2" color="text.secondary">
                        Catalog price snapshot:
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="success.main">
                        {formatNzdPrice(form.quotedUnitPrice)}
                      </Typography>
                      {form.stockQty > 0 && (
                        <Chip
                          size="small"
                          icon={<Inventory2Outlined sx={{ fontSize: "14px !important" }} />}
                          label={`${form.stockQty} in stock`}
                          color="success"
                          variant="outlined"
                          sx={{ ml: "auto", height: 24 }}
                        />
                      )}
                    </Box>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ mb: 2.5 }} />

              {/* Costs */}
              <SectionLabel>Quoted costs</SectionLabel>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Material cost"
                    value={form.materialCost}
                    onChange={(e) => handleChange(idx, "materialCost", e.target.value)}
                    inputProps={{ min: 0, step: "0.01" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Edging cost"
                    value={form.edgingCost}
                    onChange={(e) => handleChange(idx, "edgingCost", e.target.value)}
                    inputProps={{ min: 0, step: "0.01" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Box display="flex" justifyContent="flex-end" mt={2.5}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddRecord}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          Add material line
        </Button>
      </Box>

      {records.length > 0 && (
        <Card
          elevation={0}
          sx={{
            mt: 3,
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "transparent",
          }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
            }}
          >
            <SummarizeOutlined fontSize="small" color="primary" />
            <Typography variant="subtitle2" fontWeight={700}>
              Materials summary
            </Typography>
          </Box>
          <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: "1fr 1fr",
                sm: "repeat(3, 1fr)",
                md: "repeat(5, 1fr)",
              }}
              gap={2}
            >
              <StatTile label="Lines" value={records.length} />
              <StatTile
                label="From catalog"
                value={catalogCount}
                accent="primary.main"
              />
              <StatTile label="Material cost" value={formatNzdPrice(totalMaterial)} />
              <StatTile label="Edging cost" value={formatNzdPrice(totalEdging)} />
              <StatTile
                label="Line total"
                value={formatNzdPrice(totalMaterial + totalEdging)}
                accent="success.main"
                highlight
              />
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CreateProjectStep3;
