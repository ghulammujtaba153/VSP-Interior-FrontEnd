"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Card,
  CardContent,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import SaveIcon from "@mui/icons-material/Save";
import CalculateIcon from "@mui/icons-material/Calculate";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PersonIcon from "@mui/icons-material/PersonOutline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PieChartIcon from "@mui/icons-material/PieChart";
import LocationIcon from "@mui/icons-material/LocationOnOutlined";
import DrawerIcon from "@mui/icons-material/ViewQuilt";
import HingeIcon from "@mui/icons-material/Hardware";
import HandleIcon from "@mui/icons-material/TouchApp";
import MiscIcon from "@mui/icons-material/ShoppingBasket";
import BuyInIcon from "@mui/icons-material/Inventory";
import SpecialIcon from "@mui/icons-material/Construction";
import UnitIcon from "@mui/icons-material/Inventory2Outlined";
import CabinetIcon from "@mui/icons-material/KitchenOutlined";
import PanelIcon from "@mui/icons-material/Straighten";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { GenerateTenderTemplate } from "@/utils/GenerateTenderTemplate";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const STEPS = ["1. Internal Costing", "2. Pricing", "3. Quotation"];

const EMPTY_CABINET_ROW = () => ({
  id: Date.now() + Math.random(),
  code: "",
  description: "",
  qty: 1,
  carcassSubstrateFinish: "",
  externalFinish: "",
  totalCarcassM2: 0,
  totalExternalM2: 0,
  materialRateCarcass: 0,
  materialRateExternal: 0,
  totalCarcassCost: 0,
  totalExternalCost: 0,
  labourCostPerCabinet: 0,   // ← PDF label: "Labour Cost Per Cabinet"
});

const EMPTY_ACCESSORY_ROW = () => ({
  id: Date.now() + Math.random(),
  supplier: "",
  code: "",
  description: "",
  qty: 1,
  buyPrice: 0,
});

// ─── INITIAL DATA ────────────────────────────────────────────────────────────
const INITIAL_CABINET_ROWS = [
  {
    id: 1,
    code: "CAB-BASE-900",
    description: "Base Cabinet 900mm with shelf",
    qty: 3,
    carcassSubstrateFinish: "18mm Birch Plywood",
    externalFinish: "White Matte Laminate",
    totalCarcassM2: 2.5,
    totalExternalM2: 2.8,
    materialRateCarcass: 45.0,
    materialRateExternal: 38.0,
    totalCarcassCost: 112.5,
    totalExternalCost: 106.4,
    labourCostPerCabinet: 85.0,
  },
  {
    id: 2,
    code: "CAB-WALL-600",
    description: "Wall Cabinet 600mm",
    qty: 4,
    carcassSubstrateFinish: "18mm Birch Plywood",
    externalFinish: "White Matte Laminate",
    totalCarcassM2: 1.8,
    totalExternalM2: 2.0,
    materialRateCarcass: 45.0,
    materialRateExternal: 38.0,
    totalCarcassCost: 81.0,
    totalExternalCost: 76.0,
    labourCostPerCabinet: 75.0,
  },
  {
    id: 3,
    code: "CAB-TALL-600",
    description: "Tall Cabinet 600mm",
    qty: 1,
    carcassSubstrateFinish: "18mm Birch Plywood",
    externalFinish: "Oak Veneer",
    totalCarcassM2: 4.2,
    totalExternalM2: 4.5,
    materialRateCarcass: 45.0,
    materialRateExternal: 65.0,
    totalCarcassCost: 189.0,
    totalExternalCost: 292.5,
    labourCostPerCabinet: 120.0,
  },
];

const INITIAL_PANEL_ROWS = [
  {
    id: 1,
    code: "PANEL-END-900",
    description: "End Panel for Base Cabinet",
    qty: 2,
    carcassSubstrateFinish: "18mm Birch Plywood",
    externalFinish: "White Matte Laminate",
    totalCarcassM2: 1.2,
    totalExternalM2: 1.2,
    materialRateCarcass: 45.0,
    materialRateExternal: 38.0,
    totalCarcassCost: 54.0,
    totalExternalCost: 45.6,
    labourCostPerCabinet: 25.0,
  },
];

const INITIAL_ACCESSORIES = {
  cabinetDrawers: [
    { id: 1, supplier: "Blum", code: "BLUM-TANDEM-550", description: "Tandem Full Extension Drawer 550mm", qty: 8, buyPrice: 45.0 },
    { id: 2, supplier: "Hettich", code: "HETT-QUADRO-450", description: "Quadro Drawer System 450mm", qty: 4, buyPrice: 38.0 },
  ],
  cabinetHinges: [
    { id: 1, supplier: "Blum", code: "BLUM-CLIP-110", description: "Clip Top Soft Close Hinge 110°", qty: 24, buyPrice: 8.5 },
    { id: 2, supplier: "Hafele", code: "HAF-SENSO-110", description: "Senso Hinge with Soft Close", qty: 12, buyPrice: 7.2 },
  ],
  cabinetHandles: [
    { id: 1, supplier: "Hafele", code: "HAF-SL-128", description: "Stainless Steel Handle 128mm", qty: 15, buyPrice: 12.0 },
    { id: 2, supplier: "IKEA", code: "IKEA-VEDDINGE", description: "Veddinge Handle Black", qty: 8, buyPrice: 8.5 },
  ],
  miscItems: [
    { id: 1, supplier: "Local", code: "SCREW-4X40", description: "Screws 4x40mm (Box)", qty: 2, buyPrice: 15.0 },
    { id: 2, supplier: "Local", code: "SILICONE-CLEAR", description: "Silicone Sealant Clear", qty: 4, buyPrice: 8.0 },
  ],
  buyInItems: [
    { id: 1, supplier: "Samsung", code: "SAM-RF8000", description: "Built-in Refrigerator", qty: 1, buyPrice: 1200.0 },
    { id: 2, supplier: "Bosch", code: "BOS-DW600", description: "Dishwasher 600mm", qty: 1, buyPrice: 850.0 },
  ],
  specialHardware: [
    { id: 1, supplier: "Blum", code: "BLUM-AVENTOS", description: "Aventos Lift System", qty: 2, buyPrice: 185.0 },
  ],
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toFixed(2);
const fmtK = (n) => Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function recalcCabinetRow(row, changedField) {
  const r = { ...row };
  if (["totalCarcassM2", "materialRateCarcass"].includes(changedField)) {
    r.totalCarcassCost = r.totalCarcassM2 * r.materialRateCarcass;
  }
  if (["totalExternalM2", "materialRateExternal"].includes(changedField)) {
    r.totalExternalCost = r.totalExternalM2 * r.materialRateExternal;
  }
  return r;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const TestQuote = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  // ── Step 1 State ──
  const [projectInfo, setProjectInfo] = useState({
    code: "VSP-2024-001",
    description: "Modern Kitchen Renovation - Oak & White",
    quantity: 1,
    location: "123 Main Street, Downtown",
    drawingNo: "KIT-2401",
    revision: "A",
    cabinetryType: "Modern Frameless",
    overallM2: 28.5,
    boardWastage: 15,
    // ← PDF header also shows "Total Labour Hours" at top level
    totalLabourHours: 0,
  });

  const [cabinetRows, setCabinetRows] = useState(INITIAL_CABINET_ROWS);
  const [panelRows, setPanelRows] = useState(INITIAL_PANEL_ROWS);
  const [accessories, setAccessories] = useState(INITIAL_ACCESSORIES);

  const [tenderText, setTenderText] = useState(
    "We propose to supply and install a modern frameless kitchen with soft-close Blum hardware, " +
      "oak veneer exteriors, and white laminate interiors. Includes installation of all appliances " +
      "as per drawings. Warranty: 5 years on cabinetry, 10 years on hardware."
  );
  const [internalNotes, setInternalNotes] = useState(
    "Client prefers Blum hardware. Need to confirm drawer sizes. Site visit scheduled for next week."
  );
  const [generalNotes, setGeneralNotes] = useState(
    "All cabinets: 18mm Birch plywood carcass. External finish: Oak veneer for exposed ends, white laminate for interiors."
  );

  // Cabinet Quantity Summary — PDF says "M3" on the last row (kept as-is from template)
  const [cabinetSummary, setCabinetSummary] = useState({
    baseCabinets: 6,
    baseDrawerCabinets: 4,
    wallCabinets: 5,
    tallCabinets: 1,
    endPanelsBase: 2,
    endPanelsWall: 1,
    endPanelsTall: 1,
    vanities: 0,
    wardrobes: 0,
    totalCabinetM3: 28.5, // ← PDF uses "M3" label on this row
  });
  const [cabinetSummaryChecks, setCabinetSummaryChecks] = useState({
    baseCabinets: false,
    baseDrawerCabinets: false,
    wallCabinets: false,
    tallCabinets: false,
    endPanelsBase: false,
    endPanelsWall: false,
    endPanelsTall: false,
    vanities: false,
    wardrobes: false,
    totalCabinetM3: false,
  });

  // ── Step 2 State ──
  // PDF Sheet 1 Summary rows (exact order from PDF):
  // 1. Total Carcass (M2) – Including Wastage
  // 2. Total External (M2) – Including Wastage
  // 3. Total Hours (Machining & Assembly)
  // 4. Total Hardware Cost (Drawers, Hinges, Handles)   ← GROUPED, not split
  // 5. Total Miscellaneous
  // 6. Total Buy-in Items
  // 7. Total Special Hardware
  // 8. Extra Hours (Machining and Assembly)
  // 9. Extra Hours (Site Survey/Visit)
  // 10. Total Installation Hours (VSP to Estimate)
  // 11. Total Cost for Sheet 1
  const [pricingItems, setPricingItems] = useState([
    { key: "carcass",       category: "Total Carcass (M2) – Including Wastage",            quantity: 0, costPrice: 0, markup: 20, sellPrice: 0 },
    { key: "external",      category: "Total External (M2) – Including Wastage",            quantity: 0, costPrice: 0, markup: 20, sellPrice: 0 },
    { key: "machineHours",  category: "Total Hours (Machining & Assembly)",                  quantity: 0, costPrice: 0, markup: 25, sellPrice: 0 },
    { key: "hardware",      category: "Total Hardware Cost (Drawers, Hinges, Handles)",     quantity: 0, costPrice: 0, markup: 35, sellPrice: 0 }, // ← GROUPED per PDF
    { key: "misc",          category: "Total Miscellaneous",                                quantity: 0, costPrice: 0, markup: 25, sellPrice: 0 },
    { key: "buyIn",         category: "Total Buy-in Items",                                 quantity: 0, costPrice: 0, markup: 20, sellPrice: 0 },
    { key: "specialHW",     category: "Total Special Hardware",                             quantity: 0, costPrice: 0, markup: 30, sellPrice: 0 },
    { key: "extraMachine",  category: "Extra Hours (Machining and Assembly)",               quantity: 0, costPrice: 0, markup: 25, sellPrice: 0 },
    { key: "extraSurvey",   category: "Extra Hours (Site Survey/Visit)",                    quantity: 0, costPrice: 0, markup: 25, sellPrice: 0 },
    { key: "installation",  category: "Total Installation Hours (VSP to Estimate)",         quantity: 0, costPrice: 0, markup: 25, sellPrice: 0 },
  ]);

  const [overheadPercentage, setOverheadPercentage] = useState(20);
  const [profitMargin, setProfitMargin] = useState(30);

  // ── Step 3 State ──
  const [clientInfo, setClientInfo] = useState({
    name: "John Smith",
    company: "Smith Family Residence",
    address: "123 Main Street, Anytown, AN 12345",
    email: "john.smith@email.com",
    phone: "(555) 123-4567",
  });
  const [quoteNotes, setQuoteNotes] = useState(
    "Payment Terms: 50% deposit upon order confirmation, 25% upon delivery, 25% upon completion.\n" +
      "Lead Time: 4-6 weeks from deposit.\nWarranty: 5 years on all cabinetry and installation."
  );

  // ─── DERIVED CALCULATIONS ──────────────────────────────────────────────────
  const calcSheet1 = () => {
    const allRows = [...cabinetRows, ...panelRows];
    let carcassM2 = 0, externalM2 = 0, carcassCost = 0, externalCost = 0, labourCost = 0;
    allRows.forEach((r) => {
      carcassM2  += (r.totalCarcassM2 || 0) * (r.qty || 0);
      externalM2 += (r.totalExternalM2 || 0) * (r.qty || 0);
      carcassCost  += (r.totalCarcassCost || 0) * (r.qty || 0);
      externalCost += (r.totalExternalCost || 0) * (r.qty || 0);
      labourCost   += (r.labourCostPerCabinet || 0) * (r.qty || 0);
    });
    const wf = 1 + (projectInfo.boardWastage || 0) / 100;
    return {
      carcassM2WithWastage: carcassM2 * wf,
      externalM2WithWastage: externalM2 * wf,
      carcassCost,
      externalCost,
      labourCost,
    };
  };

  const calcAccessories = () => {
    const sum = (arr) => arr.reduce((s, i) => s + (i.buyPrice || 0) * (i.qty || 0), 0);
    const drawers  = sum(accessories.cabinetDrawers);
    const hinges   = sum(accessories.cabinetHinges);
    const handles  = sum(accessories.cabinetHandles);
    const misc     = sum(accessories.miscItems);
    const buyIn    = sum(accessories.buyInItems);
    const special  = sum(accessories.specialHardware);
    // PDF groups drawers+hinges+handles as "Total Hardware Cost"
    return { hardware: drawers + hinges + handles, misc, buyIn, special, total: drawers + hinges + handles + misc + buyIn + special };
  };

  const sheet1 = calcSheet1();
  const accTotals = calcAccessories();

  // Total direct cost for Sheet 1 summary footer
  const totalSheet1Cost =
    sheet1.carcassCost + sheet1.externalCost + sheet1.labourCost + accTotals.total;

  // Pricing derived totals
  const totalDirectCost = pricingItems.reduce((s, i) => s + (i.costPrice || 0), 0);
  const totalSellSubtotal = pricingItems.reduce((s, i) => s + (i.sellPrice || 0), 0);
  const overheadAmount = totalDirectCost * (overheadPercentage / 100);
  const subtotalWithOverhead = totalDirectCost + overheadAmount;
  const finalPrice = profitMargin < 100 ? subtotalWithOverhead / (1 - profitMargin / 100) : 0;

  // ─── SYNC PRICING FROM SHEET 1 ────────────────────────────────────────────
  const syncPricingFromSheet1 = () => {
    setPricingItems((prev) => {
      const next = prev.map((item) => {
        let qty = item.quantity;
        let cost = item.costPrice;
        switch (item.key) {
          case "carcass":
            qty = sheet1.carcassM2WithWastage;
            cost = sheet1.carcassCost;
            break;
          case "external":
            qty = sheet1.externalM2WithWastage;
            cost = sheet1.externalCost;
            break;
          case "machineHours":
            cost = sheet1.labourCost;
            break;
          case "hardware":
            cost = accTotals.hardware;
            break;
          case "misc":
            cost = accTotals.misc;
            break;
          case "buyIn":
            cost = accTotals.buyIn;
            break;
          case "specialHW":
            cost = accTotals.special;
            break;
          default:
            break;
        }
        return { ...item, quantity: qty, costPrice: cost, sellPrice: cost * (1 + item.markup / 100) };
      });
      return next;
    });
  };

  useEffect(() => {
    syncPricingFromSheet1();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── ROW HANDLERS ─────────────────────────────────────────────────────────
  const handleCabinetChange = (setter, id, field, value) => {
    setter((prev) =>
      prev.map((r) => (r.id === id ? recalcCabinetRow({ ...r, [field]: value }, field) : r))
    );
  };

  const addAccessoryRow = (section) => {
    setAccessories((prev) => ({ ...prev, [section]: [...prev[section], EMPTY_ACCESSORY_ROW()] }));
  };

  const updateAccessoryRow = (section, id, field, value) => {
    setAccessories((prev) => ({
      ...prev,
      [section]: prev[section].map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const removeAccessoryRow = (section, id) => {
    setAccessories((prev) => ({ ...prev, [section]: prev[section].filter((i) => i.id !== id) }));
  };

  const handlePricingChange = (idx, field, value) => {
    setPricingItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === "costPrice" || field === "markup") {
        next[idx].sellPrice = next[idx].costPrice * (1 + next[idx].markup / 100);
      }
      return next;
    });
  };

  // ─── NAVIGATION ───────────────────────────────────────────────────────────
  const handleNext = () => {
    if (activeStep === 0) syncPricingFromSheet1();
    setActiveStep((s) => s + 1);
  };
  const handleBack = () => setActiveStep((s) => s - 1);

  // ─── PDF GENERATION ───────────────────────────────────────────────────────
  const handleGeneratePDF = async () => {
    // Re-derive all calculated values at click time so they are fresh
    const latestSheet1 = calcSheet1();
    const latestAcc    = calcAccessories();
    const latestDirect = pricingItems.reduce((s, i) => s + (i.costPrice || 0), 0);
    const latestOH     = latestDirect * (overheadPercentage / 100);
    const latestSub    = latestDirect + latestOH;
    const latestFinal  = profitMargin < 100 ? latestSub / (1 - profitMargin / 100) : 0;

    const quoteData = {
      finalPrice:   latestFinal,
      pricingItems: pricingItems,
      projectData:  projectInfo,
      clientInfo:   clientInfo,
    };

    // By passing projectData, GenerateTenderTemplate will skip the server fetch
    // and use this local data instead.
    await GenerateTenderTemplate(projectInfo.code, quoteData);
  };

  const handleSaveDraft = async () => {
    try {
      toast.info("Saving quote...");
      const payload = {
        quoteData: {
          projectInfo,
          clientInfo,
          cabinetRows,
          panelRows,
          accessories,
          pricingItems,
          overheadPercentage,
          profitMargin,
          tenderText,
          internalNotes,
          generalNotes,
          quoteNotes,
          cabinetSummary
        },
        startDate: new Date(),
        status: "Draft",
      };
      
      const res = await axios.post(`${BASE_URL}/api/quotes`, payload);
      if (res.data.success) {
        toast.success("Quote saved successfully");
      }
    } catch (error) {
      console.error("Error saving quote:", error);
      toast.error("Failed to save quote");
    }
  };

  // ─── ACCESSORY SECTIONS CONFIG ────────────────────────────────────────────
  const SECTION_CFG = [
    { key: "cabinetDrawers",  label: "Cabinet Drawers Lookup",       icon: <DrawerIcon />,  col1: "Hardware Supplier (Hafele, Hettich, Blum, etc.)", col2: "Drawer Code and Description" },
    { key: "cabinetHinges",   label: "Cabinet Hinges Lookup",         icon: <HingeIcon />,   col1: "Supplier",                                        col2: "Hinges Code and Description" },
    { key: "cabinetHandles",  label: "Cabinet Handle Lookup",         icon: <HandleIcon />,  col1: "Supplier",                                        col2: "Handle Code and Description" },
    { key: "miscItems",       label: "Misc Items Lookup",             icon: <MiscIcon />,    col1: "Supplier",                                        col2: "Miscellaneous Item Code and Description" },
    { key: "buyInItems",      label: "Buy-in Items Lookup",           icon: <BuyInIcon />,   col1: "Supplier",                                        col2: "Supplier Quote Number and Description" },
    { key: "specialHardware", label: "Special Hardware Lookup",       icon: <SpecialIcon />, col1: "Supplier",                                        col2: "Code and Description" },
  ];

  // ── Shared table header style ──
  const thStyle = {
    "& .MuiTableCell-head": {
      backgroundColor: theme.palette.primary.main,
      color: "white",
      fontWeight: 700,
      fontSize: "0.72rem",
      padding: "8px 6px",
      whiteSpace: "nowrap",
    },
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1700, margin: "auto", minHeight: "100vh" }}>
      {/* Title */}
      <Typography variant="h4" fontWeight="bold" gutterBottom color="primary" sx={{ mb: 3 }}>
        Kitchen Joinery Quote System — VSP Interiors
      </Typography>

      {/* Stepper */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label, index) => (
            <Step key={label}>
              <StepLabel>
                <Typography variant="body2" fontWeight={activeStep === index ? 700 : 400}>
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* ════════════════════════════════════════════════════════════════
          STEP 1 — INTERNAL COSTING
      ════════════════════════════════════════════════════════════════ */}
      {activeStep === 0 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            <strong>Internal Costing Sheet 1:</strong> Enter all cabinet, panel, and hardware costs. This data is internal only and feeds directly into the Pricing step.
          </Alert>

          {/* ── Project Header Bar ── */}
          <Paper
            elevation={4}
            sx={{
              p: 3, mb: 4, bgcolor: theme.palette.primary.main, color: "white", borderRadius: 3,
              boxShadow: `0 10px 20px ${theme.palette.primary.main}33`,
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6} sm={3} md={1.5}>
                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
                  Project Code
                </Typography>
                <Typography variant="h6" fontWeight="800">{projectInfo.code}</Typography>
              </Grid>
              <Grid item xs={6} sm={3} md={2.5}>
                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
                  Description
                </Typography>
                <Typography variant="body2" fontWeight="600" noWrap title={projectInfo.description}>
                  {projectInfo.description || "—"}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={2} md={1}>
                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
                  Qty
                </Typography>
                <Typography variant="h6" fontWeight="700">{projectInfo.quantity}</Typography>
              </Grid>
              <Grid item xs={6} sm={2} md={1.5}>
                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
                  Overall M²
                </Typography>
                <Typography variant="h6" fontWeight="700">{projectInfo.overallM2}</Typography>
              </Grid>
              <Grid item xs={6} sm={2} md={1.5}>
                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
                  Board Wastage
                </Typography>
                <Typography variant="h6" fontWeight="700">{projectInfo.boardWastage}%</Typography>
              </Grid>
              <Grid item xs={6} sm={3} md={1.5}>
                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, display: "flex", alignItems: "center", gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: "0.85rem" }} /> Total Labour Hrs
                </Typography>
                <Typography variant="h6" fontWeight="700">{projectInfo.totalLabourHours}</Typography>
              </Grid>
              <Grid item xs={6} sm={3} md={1.5}>
                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, display: "flex", alignItems: "center", gap: 0.5 }}>
                  <LocationIcon sx={{ fontSize: "0.85rem" }} /> Location
                </Typography>
                <Typography variant="body2" fontWeight="600" noWrap title={projectInfo.location}>
                  {projectInfo.location || "—"}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3} md={1.5} sx={{ textAlign: "right" }}>
                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
                  Total S1 Cost
                </Typography>
                <Typography variant="h6" fontWeight="900" sx={{ color: "#4caf50" }}>
                  ${fmt(totalSheet1Cost)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* ── Unit Information ── */}
          <Card elevation={0} sx={{ mb: 4, borderRadius: 3, border: `1px solid ${theme.palette.primary.main}20` }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="700" mb={3} sx={{ color: theme.palette.primary.main, display: "flex", alignItems: "center", gap: 1.5 }}>
                <UnitIcon sx={{ fontSize: "1.8rem" }} /> Costing Sheet 1 — Unit Information
              </Typography>
              <Grid container spacing={2}>
                {[
                  { label: "Unit Name / Area of Work Name", field: "description", md: 3 },
                  { label: "Drawing No",                    field: "drawingNo",   md: 1.5 },
                  { label: "Revision",                      field: "revision",    md: 1 },
                  { label: "Quantity",                      field: "quantity",    md: 1, type: "number" },
                  { label: "Cabinetry / Unit Type",         field: "cabinetryType", md: 2 },
                  { label: "Overall Cabinetry M²",          field: "overallM2",   md: 1.5, type: "number" },
                  { label: "Board Wastage %",               field: "boardWastage", md: 1, type: "number" },
                  { label: "Total Labour Hours",            field: "totalLabourHours", md: 1.5, type: "number" },
                  { label: "Location",                      field: "location",    md: 2 },
                ].map(({ label, field, md, type }) => (
                  <Grid item xs={12} md={md} key={field}>
                    <TextField
                      fullWidth
                      label={label}
                      variant="filled"
                      size="small"
                      type={type || "text"}
                      sx={{ bgcolor: "background.paper", borderRadius: 1 }}
                      value={projectInfo[field]}
                      onChange={(e) =>
                        setProjectInfo({
                          ...projectInfo,
                          [field]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value,
                        })
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* ── Cabinet Lookup Section ── */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight="700" sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <CabinetIcon sx={{ color: theme.palette.primary.main }} /> Cabinet Lookup Section
            </Typography>
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCabinetRows((p) => [...p, EMPTY_CABINET_ROW()])}
              sx={{ borderRadius: "8px", textTransform: "none" }}
            >
              Add Cabinet Row
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ mb: 5, maxHeight: 420, borderRadius: 2 }}>
            <Table size="small" stickyHeader sx={{ ...thStyle, minWidth: 1600 }}>
              <TableHead>
                <TableRow>
                  {[
                    "Cabinet Code (Look Up)", "Description", "Qty",
                    "Carcass Substrate Finish", "External Finish",
                    "Total Carcass M²", "Total External M²",
                    "Material Rate Carcass", "Material Rate External",
                    "Total Carcass Cost", "Total External Cost",
                    "Labour Cost Per Cabinet",
                    "",
                  ].map((h) => (
                    <TableCell key={h}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {cabinetRows.map((row, idx) => (
                  <CabinetRow
                    key={row.id}
                    row={row}
                    odd={idx % 2 === 0}
                    onChange={(field, val) =>
                      handleCabinetChange(setCabinetRows, row.id, field, val)
                    }
                    onDelete={() => setCabinetRows((p) => p.filter((r) => r.id !== row.id))}
                    theme={theme}
                  />
                ))}
                {cabinetRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={13} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      No cabinet rows — click "Add Cabinet Row" to begin.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ── End Panel & Loose Panel Section ── */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight="700" color="primary" sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <PanelIcon sx={{ color: theme.palette.primary.main }} /> End Panel & Loose Panel Lookup Section
            </Typography>
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setPanelRows((p) => [...p, EMPTY_CABINET_ROW()])}
              sx={{ borderRadius: "8px", textTransform: "none" }}
            >
              Add Panel Row
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ mb: 5, maxHeight: 360, borderRadius: 2 }}>
            <Table size="small" stickyHeader sx={{ ...thStyle, minWidth: 1600 }}>
              <TableHead>
                <TableRow>
                  {[
                    "Panel Code", "Description", "Qty",
                    "Carcass Substrate Finish", "External Finish",
                    "Total Carcass M²", "Total External M²",
                    "Material Rate Carcass", "Material Rate External",
                    "Total Carcass Cost", "Total External Cost",
                    "Labour Cost Per Panel",
                    "",
                  ].map((h) => (
                    <TableCell key={h}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {panelRows.map((row, idx) => (
                  <CabinetRow
                    key={row.id}
                    row={row}
                    odd={idx % 2 === 0}
                    onChange={(field, val) =>
                      handleCabinetChange(setPanelRows, row.id, field, val)
                    }
                    onDelete={() => setPanelRows((p) => p.filter((r) => r.id !== row.id))}
                    theme={theme}
                  />
                ))}
                {panelRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={13} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      No panel rows — click "Add Panel Row" to begin.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ── Hardware & Accessories ── */}
          <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
            🔧 Hardware & Accessories Lookup
          </Typography>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            <strong>Note:</strong> Drawers, Hinges and Handles are grouped as "Total Hardware Cost" in the Pricing step, matching the costing sheet template.
          </Alert>

          {SECTION_CFG.map((sec) => (
            <AccessorySection
              key={sec.key}
              cfg={sec}
              rows={accessories[sec.key]}
              onAdd={() => addAccessoryRow(sec.key)}
              onUpdate={(id, field, val) => updateAccessoryRow(sec.key, id, field, val)}
              onRemove={(id) => removeAccessoryRow(sec.key, id)}
              theme={theme}
            />
          ))}

          {/* ── Notes & Cabinet Summary ── */}
          <Grid container spacing={3} mt={1} mb={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 3, bgcolor: theme.palette.action.hover, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="700" mb={1} sx={{ color: theme.palette.primary.main }}>
                    📄 TENDER SUBMISSION SECTION
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    (This section will appear in the client's tender submission)
                  </Typography>
                  <TextField fullWidth multiline rows={5} variant="outlined" value={tenderText}
                    onChange={(e) => setTenderText(e.target.value)} />
                </CardContent>
              </Card>
              <Card sx={{ bgcolor: theme.palette.action.hover, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="700" mb={1} sx={{ color: theme.palette.primary.main }}>
                    📝 INTERNAL COSTING SHEET 1 NOTES
                  </Typography>
                  <TextField fullWidth multiline rows={5} variant="outlined" value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)} />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              {/* Cabinet Quantity Summary */}
              <Card sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 0 }}>
                  <Typography variant="subtitle2" fontWeight="700" sx={{ bgcolor: theme.palette.primary.main, color: "white", p: 1.5, borderRadius: "8px 8px 0 0" }}>
                    CABINET QUANTITY SUMMARY & CHECK FOR COSTING SHEET 1
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                          <TableCell sx={{ color: "white", fontWeight: 700, fontSize: "0.7rem" }}>ITEM CATEGORY</TableCell>
                          <TableCell sx={{ color: "white", fontWeight: 700, fontSize: "0.7rem" }} align="center">QUANTITY</TableCell>
                          <TableCell sx={{ color: "white", fontWeight: 700, fontSize: "0.7rem" }} align="center">CHECK LIST</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[
                          { key: "baseCabinets",       label: "TOTAL NUMBER OF BASE CABINETS (DOOR & OPEN)" },
                          { key: "baseDrawerCabinets", label: "TOTAL NUMBER OF BASE DRAWER CABINETS" },
                          { key: "wallCabinets",       label: "TOTAL NUMBER OF WALL CABINETS (DOOR & OPEN)" },
                          { key: "tallCabinets",       label: "TOTAL NUMBER OF TALL CABINETS (DOOR & OPEN)" },
                          { key: "endPanelsBase",      label: "TOTAL NUMBER OF END PANELS – BASE" },
                          { key: "endPanelsWall",      label: "TOTAL NUMBER OF END PANELS – WALL" },
                          { key: "endPanelsTall",      label: "TOTAL NUMBER OF END PANELS – TALL" },
                          { key: "vanities",           label: "TOTAL NUMBER OF VANITIES" },
                          { key: "wardrobes",          label: "TOTAL NUMBER OF WARDROBES" },
                          { key: "totalCabinetM3",     label: "TOTAL CABINETRY M3" },  // ← PDF label is M3
                        ].map((item) => (
                          <TableRow key={item.key} hover>
                            <TableCell sx={{ fontSize: "0.72rem" }}>{item.label}</TableCell>
                            <TableCell align="center">
                              <TextField
                                size="small"
                                variant="standard"
                                type="number"
                                sx={{ width: 70 }}
                                value={cabinetSummary[item.key]}
                                onChange={(e) =>
                                  setCabinetSummary({ ...cabinetSummary, [item.key]: parseFloat(e.target.value) || 0 })
                                }
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox
                                size="small"
                                checked={!!cabinetSummaryChecks[item.key]}
                                onChange={(e) =>
                                  setCabinetSummaryChecks({ ...cabinetSummaryChecks, [item.key]: e.target.checked })
                                }
                                icon={<CheckCircleIcon sx={{ color: theme.palette.divider }} />}
                                checkedIcon={<CheckCircleIcon sx={{ color: theme.palette.success.main }} />}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ── Sheet 1 Summary (bottom banner) ── */}
          <Paper elevation={0} sx={{ p: 4, mb: 4, bgcolor: theme.palette.primary.main, color: "white", borderRadius: 3 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <DescriptionIcon /> GENERAL NOTES AND INTERNAL CALCULATIONS
                </Typography>
                <TextField
                  fullWidth multiline rows={6} variant="outlined"
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.07)", borderRadius: 2,
                    "& .MuiOutlinedInput-root": { color: "white" },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.25)" },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalculateIcon /> Costing Sheet 1 Summary
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ "& .MuiTableCell-head": { color: "white", borderBottom: "1px solid rgba(255,255,255,0.3)", fontWeight: 700 } }}>
                      <TableCell>Totals</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Cost Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      { label: "Total Carcass (M²) – incl. Wastage",        qty: fmt(sheet1.carcassM2WithWastage),  cost: fmt(sheet1.carcassCost) },
                      { label: "Total External (M²) – incl. Wastage",       qty: fmt(sheet1.externalM2WithWastage), cost: fmt(sheet1.externalCost) },
                      { label: "Total Hours (Machining & Assembly)",          qty: projectInfo.totalLabourHours,      cost: fmt(sheet1.labourCost) },
                      { label: "Total Hardware Cost (Drawers/Hinges/Handles)",qty: "—",                              cost: fmt(accTotals.hardware) },
                      { label: "Total Miscellaneous",                         qty: "—",                              cost: fmt(accTotals.misc) },
                      { label: "Total Buy-in Items",                          qty: "—",                              cost: fmt(accTotals.buyIn) },
                      { label: "Total Special Hardware",                      qty: "—",                              cost: fmt(accTotals.special) },
                    ].map((r) => (
                      <TableRow key={r.label} sx={{ "& .MuiTableCell-root": { color: "white", borderBottom: "1px solid rgba(255,255,255,0.1)", fontSize: "0.78rem" } }}>
                        <TableCell>{r.label}</TableCell>
                        <TableCell align="right">{r.qty}</TableCell>
                        <TableCell align="right">${r.cost}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: "rgba(255,255,255,0.18)" }}>
                      <TableCell colSpan={2} sx={{ fontWeight: 800, color: "white" }}>TOTAL COST FOR SHEET 1</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 900, color: "#a5d6a7", fontSize: "1.15rem" }}>
                        ${fmtK(totalSheet1Cost)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: "block" }}>
                  — END OF SHEET 1 —
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {/* ════════════════════════════════════════════════════════════════
          STEP 2 — PRICING
      ════════════════════════════════════════════════════════════════ */}
      {activeStep === 1 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            <strong>Pricing:</strong> Cost prices are auto-filled from Sheet 1. Adjust markups per category, then set overhead recovery and profit margin to generate the final selling price.
          </Alert>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h5" fontWeight="600" sx={{ color: theme.palette.primary.main }}>
              💵 Pricing & Markup Calculation
            </Typography>
            <Button variant="outlined" startIcon={<CalculateIcon />} onClick={syncPricingFromSheet1} sx={{ borderRadius: 2, textTransform: "none" }}>
              Re-sync from Sheet 1
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                  {["Item Category", "Quantity", "Cost Price ($)", "Markup %", "Markup Value ($)", "Sell Price ($)"].map((h) => (
                    <TableCell key={h} align={h === "Item Category" ? "left" : "right"} sx={{ color: "white", fontWeight: 700 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {pricingItems.map((item, idx) => (
                  <TableRow key={item.key} sx={{ bgcolor: idx % 2 === 0 ? theme.palette.action.hover : "inherit" }}>
                    <TableCell>{item.category}</TableCell>
                    <TableCell align="right">
                      <TextField size="small" variant="standard" type="number" sx={{ width: 90 }}
                        value={item.quantity} onChange={(e) => handlePricingChange(idx, "quantity", parseFloat(e.target.value) || 0)} />
                    </TableCell>
                    <TableCell align="right">
                      <TextField size="small" variant="standard" type="number" sx={{ width: 110 }}
                        value={item.costPrice} onChange={(e) => handlePricingChange(idx, "costPrice", parseFloat(e.target.value) || 0)} />
                    </TableCell>
                    <TableCell align="right">
                      <TextField size="small" variant="standard" type="number" sx={{ width: 65 }}
                        value={item.markup} onChange={(e) => handlePricingChange(idx, "markup", parseFloat(e.target.value) || 0)} />
                    </TableCell>
                    <TableCell align="right" sx={{ color: "text.secondary" }}>
                      ${fmt(item.costPrice * item.markup / 100)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: "#388e3c" }}>
                      ${fmt(item.sellPrice)}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Subtotal row */}
                <TableRow sx={{ bgcolor: theme.palette.action.selected }}>
                  <TableCell colSpan={4} sx={{ fontWeight: 700 }}>Subtotal (all sell prices)</TableCell>
                  <TableCell />
                  <TableCell align="right" sx={{ fontWeight: 800, color: "#388e3c" }}>
                    ${fmtK(totalSellSubtotal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Overhead + Profit + Final */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.info.main}40`, bgcolor: theme.palette.action.hover }}>
                <Typography variant="subtitle2" fontWeight="700" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PieChartIcon color="info" /> Overhead Recovery
                </Typography>
                <TextField
                  fullWidth type="number" label="Overhead Percentage"
                  value={overheadPercentage}
                  onChange={(e) => setOverheadPercentage(parseFloat(e.target.value) || 0)}
                  InputProps={{ endAdornment: "%" }}
                  size="small" sx={{ mt: 1, bgcolor: "background.paper" }}
                />
                <Typography variant="body2" sx={{ mt: 2, fontWeight: 600 }}>
                  Direct Cost: ${fmtK(totalDirectCost)}
                </Typography>
                <Typography variant="body2" fontWeight="700">
                  Overhead: ${fmtK(overheadAmount)}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.warning.main}40`, bgcolor: theme.palette.action.hover }}>
                <Typography variant="subtitle2" fontWeight="700" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TrendingUpIcon color="warning" /> Profit Margin
                </Typography>
                <TextField
                  fullWidth type="number" label="Profit Margin (%)"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
                  InputProps={{ endAdornment: "%" }}
                  size="small" sx={{ mt: 1, bgcolor: "background.paper" }}
                />
                <Typography variant="body2" sx={{ mt: 2, fontWeight: 600 }}>
                  Subtotal + Overhead: ${fmtK(subtotalWithOverhead)}
                </Typography>
                <Typography variant="body2" fontWeight="700">
                  Margin Amount: ${fmtK(finalPrice - subtotalWithOverhead)}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card elevation={4} sx={{ p: 3, bgcolor: theme.palette.primary.main, color: "white", borderRadius: 3, boxShadow: `0 8px 24px ${theme.palette.primary.main}40` }}>
                <Typography variant="subtitle2" fontWeight="700" gutterBottom sx={{ opacity: 0.85 }}>PRICE SUMMARY</Typography>
                {[
                  ["Direct Cost:", fmtK(totalDirectCost)],
                  ["Overhead:", fmtK(overheadAmount)],
                  ["Subtotal:", fmtK(subtotalWithOverhead)],
                  ["Profit Margin:", fmtK(finalPrice - subtotalWithOverhead)],
                ].map(([label, val]) => (
                  <Box key={label} sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2">{label}</Typography>
                    <Typography variant="body2" fontWeight="700">${val}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1.5, bgcolor: "rgba(255,255,255,0.25)" }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="h6" fontWeight="bold">Final Price:</Typography>
                  <Typography variant="h6" fontWeight="900">${fmtK(finalPrice)}</Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ p: 4, textAlign: "center", bgcolor: theme.palette.success.dark, color: "white", borderRadius: 3, boxShadow: `0 10px 30px ${theme.palette.success.main}40` }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">🏷️ Final Proposal Price</Typography>
            <Typography variant="h2" fontWeight="bold">${fmtK(finalPrice)}</Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>* Excluding VAT / GST if applicable</Typography>
          </Card>
        </Box>
      )}

      {/* ════════════════════════════════════════════════════════════════
          STEP 3 — QUOTATION
          Only shows sell-price line items (client-facing — no costs)
      ════════════════════════════════════════════════════════════════ */}
      {activeStep === 2 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            <strong>Quotation:</strong> This is the client-facing document. It shows sell prices only — no internal costs or markups are visible.
          </Alert>

          <Typography variant="h5" fontWeight="600" mb={3} sx={{ color: theme.palette.primary.main }}>
            📄 Client Quotation
          </Typography>

          <Grid container spacing={3}>
            {/* Client Details */}
            <Grid item xs={12} md={3}>
              <Card elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: theme.palette.action.hover }}>
                <Typography variant="h6" fontWeight="700" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PersonIcon color="primary" /> Client Details
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                  {[
                    { label: "Client Name", field: "name" },
                    { label: "Company",     field: "company" },
                    { label: "Address",     field: "address" },
                    { label: "Email",       field: "email" },
                    { label: "Phone",       field: "phone" },
                  ].map(({ label, field }) => (
                    <TextField
                      key={field}
                      fullWidth label={label} size="small" variant="outlined"
                      value={clientInfo[field]}
                      onChange={(e) => setClientInfo({ ...clientInfo, [field]: e.target.value })}
                      sx={{ bgcolor: "background.paper" }}
                    />
                  ))}
                </Box>
              </Card>
            </Grid>

            {/* Quotation Document */}
            <Grid item xs={12} md={9}>
              <Paper elevation={0} sx={{ p: 5, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                {/* Letterhead */}
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Typography variant="h4" fontWeight="900" sx={{ color: theme.palette.primary.main, letterSpacing: 2 }}>
                    VSP INTERIORS
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="600">Premium Kitchen & Joinery Solutions</Typography>
                  <Typography variant="body2" color="text.secondary">
                    123 Business Street, Industrial Area &nbsp;|&nbsp; info@vspinterior.com &nbsp;|&nbsp; +1 234 567 890
                  </Typography>
                </Box>
                <Divider sx={{ mb: 4 }} />

                {/* Quote Header */}
                <Grid container spacing={3} mb={4}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="primary" fontWeight="bold">QUOTATION TO:</Typography>
                    <Typography fontWeight="bold">{clientInfo.name || "Client Name"}</Typography>
                    <Typography variant="body2">{clientInfo.company}</Typography>
                    <Typography variant="body2">{clientInfo.address}</Typography>
                    <Typography variant="body2">{clientInfo.email}</Typography>
                    <Typography variant="body2">{clientInfo.phone}</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: "right" }}>
                    <Typography variant="subtitle2" color="primary" fontWeight="bold">QUOTE DETAILS:</Typography>
                    <Typography variant="body2">Date: {new Date().toLocaleDateString()}</Typography>
                    <Typography variant="body2">Quote No: {projectInfo.code}</Typography>
                    <Typography variant="body2">Drawing No: {projectInfo.drawingNo} — Rev {projectInfo.revision}</Typography>
                    <Typography variant="body2">
                      Valid Until: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>

                <Typography variant="subtitle2" fontWeight="bold" mb={1}>Project Description:</Typography>
                <Typography variant="body2" mb={1}>{projectInfo.description}</Typography>
                <Typography variant="body2" mb={3}>Location: {projectInfo.location}</Typography>

                {/* Line Items — sell prices only */}
                <TableContainer component={Paper} elevation={0} sx={{ mb: 4, border: `1px solid ${theme.palette.divider}` }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                        <TableCell sx={{ color: "white", fontWeight: 700 }}>Description</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 700 }} align="right">Amount ($)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pricingItems
                        .filter((item) => item.sellPrice > 0)
                        .map((item) => (
                          <TableRow key={item.key} hover>
                            <TableCell>{item.category}</TableCell>
                            <TableCell align="right">${fmtK(item.sellPrice)}</TableCell>
                          </TableRow>
                        ))}
                      <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                        <TableCell align="right"><strong>Subtotal</strong></TableCell>
                        <TableCell align="right"><strong>${fmtK(totalSellSubtotal)}</strong></TableCell>
                      </TableRow>
                      <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                        <TableCell align="right" sx={{ color: "white", fontWeight: 800 }}>TOTAL (excl. VAT)</TableCell>
                        <TableCell align="right" sx={{ color: "white", fontWeight: 900, fontSize: "1.1rem" }}>
                          ${fmtK(finalPrice)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Tender / Scope text */}
                {tenderText && (
                  <Paper sx={{ p: 2.5, bgcolor: theme.palette.action.hover, mb: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="caption" color="primary" fontWeight="bold" display="block" mb={0.5}>
                      SCOPE OF WORK / TENDER NOTES:
                    </Typography>
                    <Typography variant="body2">{tenderText}</Typography>
                  </Paper>
                )}

                {/* T&C Notes */}
                <TextField
                  fullWidth multiline rows={4}
                  label="Terms & Conditions / Additional Notes"
                  variant="outlined" size="small"
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  sx={{ mb: 3 }}
                />

                <Divider sx={{ mb: 1 }} />
                <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                  This is a computer-generated document. All prices are subject to the attached Terms & Conditions.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ── Navigation Buttons ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 5 }}>
        <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined" size="large" sx={{ borderRadius: 2 }}>
          ← Back
        </Button>
        <Box>
          <Button variant="outlined" startIcon={<SaveIcon />} sx={{ mr: 2 }} size="large" onClick={handleSaveDraft}>
            Save Draft
          </Button>
          {activeStep === STEPS.length - 1 ? (
            <Button variant="contained" color="success" startIcon={<PictureAsPdfIcon />} size="large" sx={{ borderRadius: 2, px: 4 }} onClick={handleGeneratePDF}>
              Generate PDF Quote
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext} size="large" sx={{ borderRadius: 2 }}>
              Next: {STEPS[activeStep + 1]} →
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

/** Reusable editable row for cabinet / panel tables */
const CabinetRow = ({ row, odd, onChange, onDelete, theme }) => {
  const cell = { padding: "5px 4px", fontSize: "0.74rem" };
  const inp = (field, width, type = "text") => (
    <TextField
      size="small"
      variant="standard"
      type={type}
      sx={{ width }}
      value={row[field]}
      onChange={(e) => onChange(field, type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
    />
  );
  return (
    <TableRow hover sx={{ bgcolor: odd ? theme.palette.action.hover : "inherit", "& .MuiTableCell-root": cell }}>
      <TableCell>{inp("code", 120)}</TableCell>
      <TableCell>{inp("description", 250)}</TableCell>
      <TableCell>{inp("qty", 50, "number")}</TableCell>
      <TableCell>{inp("carcassSubstrateFinish", 180)}</TableCell>
      <TableCell>{inp("externalFinish", 180)}</TableCell>
      <TableCell>{inp("totalCarcassM2", 70, "number")}</TableCell>
      <TableCell>{inp("totalExternalM2", 70, "number")}</TableCell>
      <TableCell>{inp("materialRateCarcass", 75, "number")}</TableCell>
      <TableCell>{inp("materialRateExternal", 75, "number")}</TableCell>
      <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>${fmt(row.totalCarcassCost)}</TableCell>
      <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>${fmt(row.totalExternalCost)}</TableCell>
      <TableCell>{inp("labourCostPerCabinet", 100, "number")}</TableCell>
      <TableCell>
        <Tooltip title="Remove row">
          <IconButton size="small" color="error" onClick={onDelete}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

/** Reusable accessory accordion section */
const AccessorySection = ({ cfg, rows, onAdd, onUpdate, onRemove, theme }) => {
  const sectionTotal = rows.reduce((s, i) => s + (i.buyPrice || 0) * (i.qty || 0), 0);
  return (
    <Accordion
      defaultExpanded
      sx={{ mb: 2, borderRadius: 2, "&:before": { display: "none" }, boxShadow: 1, borderLeft: `4px solid ${theme.palette.primary.main}` }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: theme.palette.action.hover, borderRadius: "8px 8px 0 0", "& .MuiAccordionSummary-content": { alignItems: "center", gap: 1 } }}>
        <Box sx={{ color: theme.palette.primary.main }}>{cfg.icon}</Box>
        <Typography variant="subtitle1" fontWeight="700" sx={{ color: theme.palette.primary.main }}>{cfg.label}</Typography>
        <Chip label={`${rows.length} items`} size="small" sx={{ ml: 1, bgcolor: theme.palette.primary.main, color: "white" }} />
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant="body2" fontWeight="700" sx={{ mr: 2, color: theme.palette.primary.main }}>
          Total: ${fmt(sectionTotal)}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                {[cfg.col1, cfg.col2, "Qty", "Buy Price ($)", "Total ($)", ""].map((h) => (
                  <TableCell key={h} align={["Qty", "Buy Price ($)", "Total ($)"].includes(h) ? "right" : "left"}
                    sx={{ color: "white", fontWeight: 700, fontSize: "0.74rem" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ p: 1 }}>
                    <TextField size="small" variant="standard" placeholder="Supplier" fullWidth value={item.supplier}
                      onChange={(e) => onUpdate(item.id, "supplier", e.target.value)} />
                  </TableCell>
                  <TableCell sx={{ p: 1 }}>
                    <TextField size="small" variant="standard" placeholder="Code & Description" fullWidth value={item.description}
                      onChange={(e) => onUpdate(item.id, "description", e.target.value)} />
                  </TableCell>
                  <TableCell align="right" sx={{ p: 1 }}>
                    <TextField size="small" variant="standard" type="number" sx={{ width: 60 }} value={item.qty}
                      onChange={(e) => onUpdate(item.id, "qty", parseInt(e.target.value) || 0)} />
                  </TableCell>
                  <TableCell align="right" sx={{ p: 1 }}>
                    <TextField size="small" variant="standard" type="number" sx={{ width: 90 }} value={item.buyPrice}
                      onChange={(e) => onUpdate(item.id, "buyPrice", parseFloat(e.target.value) || 0)} />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, p: 1 }}>
                    ${fmt((item.buyPrice || 0) * (item.qty || 0))}
                  </TableCell>
                  <TableCell align="center" sx={{ p: 1 }}>
                    <IconButton size="small" color="error" onClick={() => onRemove(item.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 2.5, color: "text.secondary", fontSize: "0.8rem" }}>
                    No items — click "Add" below.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ p: 1.5, bgcolor: theme.palette.action.hover, display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button size="small" startIcon={<AddIcon />} onClick={onAdd} sx={{ textTransform: "none" }}>
            Add {cfg.label.replace(" Lookup", "")}
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default TestQuote;