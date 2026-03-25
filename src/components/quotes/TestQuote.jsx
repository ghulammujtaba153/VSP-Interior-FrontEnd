"use client";

import React, { useState } from "react";
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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import SaveIcon from "@mui/icons-material/Save";
import CalculateIcon from "@mui/icons-material/Calculate";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PersonIcon from "@mui/icons-material/PersonOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PieChartIcon from "@mui/icons-material/PieChart";
import BusinessIcon from "@mui/icons-material/Business";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import PhoneIcon from "@mui/icons-material/PhoneOutlined";
import LocationIcon from "@mui/icons-material/LocationOnOutlined";
import DrawerIcon from "@mui/icons-material/ViewQuilt";
import HingeIcon from "@mui/icons-material/Hardware";
import HandleIcon from "@mui/icons-material/TouchApp";
import MiscIcon from "@mui/icons-material/ShoppingBasket";
import BuyInIcon from "@mui/icons-material/Inventory";
import SpecialIcon from "@mui/icons-material/Construction";
import ProjectIcon from "@mui/icons-material/AssignmentOutlined";
import UnitIcon from "@mui/icons-material/Inventory2Outlined";
import CabinetIcon from "@mui/icons-material/KitchenOutlined";
import PanelIcon from "@mui/icons-material/Straighten";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const steps = ["1. Internal Costing", "2. Pricing", "3. Quotation"];

const TestQuote = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  // --- Dummy Data for Initial Load ---
  const dummyCabinetRows = [
    { 
      id: 1, 
      code: "CAB-BASE-900", 
      description: "Base Cabinet 900mm with shelf", 
      qty: 3,
      carcassSubstrateFinish: "18mm Birch Plywood",
      externalFinish: "White Matte Laminate",
      totalCarcassM2: 2.5,
      totalExternalM2: 2.8,
      materialRateCarcass: 45.00,
      materialRateExternal: 38.00,
      totalCarcassCost: 112.50,
      totalExternalCost: 106.40,
      labourCost: 85.00
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
      materialRateCarcass: 45.00,
      materialRateExternal: 38.00,
      totalCarcassCost: 81.00,
      totalExternalCost: 76.00,
      labourCost: 75.00
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
      materialRateCarcass: 45.00,
      materialRateExternal: 65.00,
      totalCarcassCost: 189.00,
      totalExternalCost: 292.50,
      labourCost: 120.00
    }
  ];

  const dummyPanelRows = [
    { 
      id: 1, 
      code: "PANEL-END-900", 
      description: "End Panel for Base Cabinet", 
      qty: 2,
      carcassSubstrateFinish: "18mm Birch Plywood",
      externalFinish: "White Matte Laminate",
      totalCarcassM2: 1.2,
      totalExternalM2: 1.2,
      materialRateCarcass: 45.00,
      materialRateExternal: 38.00,
      totalCarcassCost: 54.00,
      totalExternalCost: 45.60,
      labourCost: 25.00
    }
  ];

  const dummyAccessorySections = {
    cabinetDrawers: [
      { id: 1, supplier: "Blum", code: "BLUM-TANDEM-550", description: "Tandem Full Extension Drawer 550mm", qty: 8, buyPrice: 45.00, totalPrice: 360.00 },
      { id: 2, supplier: "Hettich", code: "HETT-QUADRO-450", description: "Quadro Drawer System 450mm", qty: 4, buyPrice: 38.00, totalPrice: 152.00 }
    ],
    cabinetHinges: [
      { id: 1, supplier: "Blum", code: "BLUM-CLIP-110", description: "Clip Top Soft Close Hinge 110°", qty: 24, buyPrice: 8.50, totalPrice: 204.00 },
      { id: 2, supplier: "Hafele", code: "HAF-SENSO-110", description: "Senso Hinge with Soft Close", qty: 12, buyPrice: 7.20, totalPrice: 86.40 }
    ],
    cabinetHandles: [
      { id: 1, supplier: "Hafele", code: "HAF-SL-128", description: "Stainless Steel Handle 128mm", qty: 15, buyPrice: 12.00, totalPrice: 180.00 },
      { id: 2, supplier: "IKEA", code: "IKEA-VEDDINGE", description: "Veddinge Handle Black", qty: 8, buyPrice: 8.50, totalPrice: 68.00 }
    ],
    miscItems: [
      { id: 1, supplier: "Local", code: "SCREW-4X40", description: "Screws 4x40mm (Box)", qty: 2, buyPrice: 15.00, totalPrice: 30.00 },
      { id: 2, supplier: "Local", code: "SILICONE-CLEAR", description: "Silicone Sealant Clear", qty: 4, buyPrice: 8.00, totalPrice: 32.00 }
    ],
    buyInItems: [
      { id: 1, supplier: "Samsung", code: "SAM-RF8000", description: "Built-in Refrigerator", qty: 1, buyPrice: 1200.00, totalPrice: 1200.00 },
      { id: 2, supplier: "Bosch", code: "BOS-DW600", description: "Dishwasher 600mm", qty: 1, buyPrice: 850.00, totalPrice: 850.00 }
    ],
    specialHardware: [
      { id: 1, supplier: "Blum", code: "BLUM-AVENTOS", description: "Aventos Lift System", qty: 2, buyPrice: 185.00, totalPrice: 370.00 }
    ],
  };

  // --- State for Internal Costing with Dummy Data ---
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
  });

  const [cabinetRows, setCabinetRows] = useState(dummyCabinetRows);
  const [panelRows, setPanelRows] = useState(dummyPanelRows);
  const [accessorySections, setAccessorySections] = useState(dummyAccessorySections);

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
    totalCabinetM2: 28.5,
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
    totalCabinetM2: false,
  });

  // --- Step 2: Pricing State with Dummy Data ---
  const [pricingItems, setPricingItems] = useState([
    { category: "Total Carcass (M2) - Including Wastage", quantity: 0, costPrice: 0, markup: 20, sellPrice: 0 },
    { category: "Total External (M2) - Including Wastage", quantity: 0, costPrice: 0, markup: 20, sellPrice: 0 },
    { category: "Total Hours (Machining & Assembly)", quantity: 0, costPrice: 0, markup: 25, sellPrice: 0 },
    { category: "Cabinet Drawers", quantity: 0, costPrice: 0, markup: 35, sellPrice: 0 },
    { category: "Cabinet Hinges", quantity: 0, costPrice: 0, markup: 35, sellPrice: 0 },
    { category: "Cabinet Handles", quantity: 0, costPrice: 0, markup: 35, sellPrice: 0 },
    { category: "Misc Items", quantity: 0, costPrice: 0, markup: 25, sellPrice: 0 },
    { category: "Buy-in Items", quantity: 0, costPrice: 0, markup: 20, sellPrice: 0 },
    { category: "Special Hardware", quantity: 0, costPrice: 0, markup: 30, sellPrice: 0 },
    { category: "Extra Hours (Machining & Assembly)", quantity: 0, costPrice: 0, markup: 25, sellPrice: 0 },
    { category: "Extra Hours (Site Survey/Visit)", quantity: 0, costPrice: 0, markup: 25, sellPrice: 0 },
    { category: "Total Installation Hours", quantity: 0, costPrice: 0, markup: 25, sellPrice: 0 },
  ]);

  const [overheadPercentage, setOverheadPercentage] = useState(20);
  const [profitMargin, setProfitMargin] = useState(30);
  const [totalCost, setTotalCost] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  // --- Step 3: Quotation State with Dummy Data ---
  const [clientInfo, setClientInfo] = useState({
    name: "John Smith",
    company: "Smith Family Residence",
    address: "123 Main Street, Anytown, AN 12345",
    email: "john.smith@email.com",
    phone: "(555) 123-4567",
  });
  const [quoteNotes, setQuoteNotes] = useState(
    "Payment Terms: 50% deposit upon order confirmation, 25% upon delivery, 25% upon completion. " +
    "Lead Time: 4-6 weeks from deposit. Warranty: 5 years on all cabinetry and installation."
  );

  // Helper functions for calculations
  const calculateCabinetTotals = () => {
    let totalCarcassM2 = 0;
    let totalExternalM2 = 0;
    let totalCarcassCost = 0;
    let totalExternalCost = 0;
    let totalLabour = 0;

    cabinetRows.forEach(row => {
      totalCarcassM2 += row.totalCarcassM2 * row.qty;
      totalExternalM2 += row.totalExternalM2 * row.qty;
      totalCarcassCost += row.totalCarcassCost * row.qty;
      totalExternalCost += row.totalExternalCost * row.qty;
      totalLabour += row.labourCost * row.qty;
    });

    panelRows.forEach(row => {
      totalCarcassM2 += row.totalCarcassM2 * row.qty;
      totalExternalM2 += row.totalExternalM2 * row.qty;
      totalCarcassCost += row.totalCarcassCost * row.qty;
      totalExternalCost += row.totalExternalCost * row.qty;
      totalLabour += row.labourCost * row.qty;
    });

    const wastageFactor = 1 + (projectInfo.boardWastage / 100);
    const totalCarcassWithWastage = totalCarcassM2 * wastageFactor;
    const totalExternalWithWastage = totalExternalM2 * wastageFactor;

    return {
      totalCarcassM2,
      totalExternalM2,
      totalCarcassWithWastage,
      totalExternalWithWastage,
      totalCarcassCost,
      totalExternalCost,
      totalLabour,
    };
  };

  const calculateAccessoriesTotalBySection = () => {
    const totals = {
      cabinetDrawers: 0,
      cabinetHinges: 0,
      cabinetHandles: 0,
      miscItems: 0,
      buyInItems: 0,
      specialHardware: 0,
      total: 0,
    };
    
    Object.entries(accessorySections).forEach(([key, items]) => {
      const sectionTotal = items.reduce((sum, item) => sum + (item.buyPrice * item.qty), 0);
      totals[key] = sectionTotal;
      totals.total += sectionTotal;
    });
    
    return totals;
  };

  const updatePricingTotals = () => {
    const cabinetTotals = calculateCabinetTotals();
    const accessoryTotals = calculateAccessoriesTotalBySection();
    
    const updatedItems = [...pricingItems];
    
    updatedItems[0].quantity = cabinetTotals.totalCarcassWithWastage;
    updatedItems[0].costPrice = cabinetTotals.totalCarcassCost;
    updatedItems[0].sellPrice = updatedItems[0].costPrice * (1 + updatedItems[0].markup / 100);
    
    updatedItems[1].quantity = cabinetTotals.totalExternalWithWastage;
    updatedItems[1].costPrice = cabinetTotals.totalExternalCost;
    updatedItems[1].sellPrice = updatedItems[1].costPrice * (1 + updatedItems[1].markup / 100);
    
    updatedItems[2].costPrice = cabinetTotals.totalLabour;
    updatedItems[2].sellPrice = updatedItems[2].costPrice * (1 + updatedItems[2].markup / 100);
    
    updatedItems[3].costPrice = accessoryTotals.cabinetDrawers;
    updatedItems[3].sellPrice = updatedItems[3].costPrice * (1 + updatedItems[3].markup / 100);
    
    updatedItems[4].costPrice = accessoryTotals.cabinetHinges;
    updatedItems[4].sellPrice = updatedItems[4].costPrice * (1 + updatedItems[4].markup / 100);
    
    updatedItems[5].costPrice = accessoryTotals.cabinetHandles;
    updatedItems[5].sellPrice = updatedItems[5].costPrice * (1 + updatedItems[5].markup / 100);
    
    updatedItems[6].costPrice = accessoryTotals.miscItems;
    updatedItems[6].sellPrice = updatedItems[6].costPrice * (1 + updatedItems[6].markup / 100);
    
    updatedItems[7].costPrice = accessoryTotals.buyInItems;
    updatedItems[7].sellPrice = updatedItems[7].costPrice * (1 + updatedItems[7].markup / 100);
    
    updatedItems[8].costPrice = accessoryTotals.specialHardware;
    updatedItems[8].sellPrice = updatedItems[8].costPrice * (1 + updatedItems[8].markup / 100);
    
    setPricingItems(updatedItems);
    
    const totalDirectCost = updatedItems.reduce((sum, item) => sum + item.costPrice, 0);
    const overheadRecovery = totalDirectCost * (overheadPercentage / 100);
    const subtotal = totalDirectCost + overheadRecovery;
    const finalSellingPrice = subtotal / (1 - profitMargin / 100);
    
    setTotalCost(totalDirectCost);
    setFinalPrice(finalSellingPrice);
  };

  const handleCabinetRowChange = (id, field, value) => {
    setCabinetRows(prev => prev.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        
        if (field === 'totalCarcassM2' || field === 'materialRateCarcass' || field === 'qty') {
          updatedRow.totalCarcassCost = (updatedRow.totalCarcassM2 || 0) * (updatedRow.materialRateCarcass || 0);
        }
        if (field === 'totalExternalM2' || field === 'materialRateExternal') {
          updatedRow.totalExternalCost = (updatedRow.totalExternalM2 || 0) * (updatedRow.materialRateExternal || 0);
        }
        
        return updatedRow;
      }
      return row;
    }));
  };

  const handlePanelRowChange = (id, field, value) => {
    setPanelRows(prev => prev.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        
        if (field === 'totalCarcassM2' || field === 'materialRateCarcass' || field === 'qty') {
          updatedRow.totalCarcassCost = (updatedRow.totalCarcassM2 || 0) * (updatedRow.materialRateCarcass || 0);
        }
        if (field === 'totalExternalM2' || field === 'materialRateExternal') {
          updatedRow.totalExternalCost = (updatedRow.totalExternalM2 || 0) * (updatedRow.materialRateExternal || 0);
        }
        
        return updatedRow;
      }
      return row;
    }));
  };

  const addAccessoryRow = (section) => {
    setAccessorySections({
      ...accessorySections,
      [section]: [...accessorySections[section], { 
        id: Date.now(), 
        supplier: "", 
        code: "",
        description: "", 
        qty: 1, 
        buyPrice: 0,
        totalPrice: 0
      }]
    });
  };

  const updateAccessoryRow = (section, id, field, value) => {
    setAccessorySections(prev => ({
      ...prev,
      [section]: prev[section].map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          updated.totalPrice = updated.buyPrice * updated.qty;
          return updated;
        }
        return item;
      })
    }));
  };

  const removeAccessoryRow = (section, id) => {
    setAccessorySections({
      ...accessorySections,
      [section]: accessorySections[section].filter(item => item.id !== id)
    });
  };

  const addCabinetRow = () => {
    setCabinetRows([...cabinetRows, { 
      id: Date.now(), 
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
      labourCost: 0
    }]);
  };

  const addPanelRow = () => {
    setPanelRows([...panelRows, { 
      id: Date.now(), 
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
      labourCost: 0
    }]);
  };

  const removeCabinetRow = (id) => {
    setCabinetRows(cabinetRows.filter(r => r.id !== id));
  };

  const removePanelRow = (id) => {
    setPanelRows(panelRows.filter(r => r.id !== id));
  };

  const handlePricingItemChange = (index, field, value) => {
    const updated = [...pricingItems];
    updated[index][field] = value;
    if (field === 'costPrice' || field === 'markup') {
      updated[index].sellPrice = updated[index].costPrice * (1 + updated[index].markup / 100);
    }
    setPricingItems(updated);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      updatePricingTotals();
    }
    setActiveStep((prev) => prev + 1);
  };
  
  const handleBack = () => setActiveStep((prev) => prev - 1);

  // Run initial calculation on load
  React.useEffect(() => {
    updatePricingTotals();
  }, []);

  const cabinetTotals = calculateCabinetTotals();
  const accessoryTotals = calculateAccessoriesTotalBySection();

  // Section configurations with icons and colors
  const accessorySectionsConfig = [
    { 
      key: 'cabinetDrawers', 
      label: 'Cabinet Drawers Lookup', 
      icon: <DrawerIcon />, 
      color: theme.palette.primary.main,
      bgColor: theme.palette.action.hover,
      fields: ['Supplier (Hafele, Hettich, Blum, etc.)', 'Drawer Code and Description']
    },
    { 
      key: 'cabinetHinges', 
      label: 'Cabinet Hinges Lookup', 
      icon: <HingeIcon />, 
      color: theme.palette.primary.main,
      bgColor: theme.palette.action.hover,
      fields: ['Supplier', 'Hinges Code and Description']
    },
    { 
      key: 'cabinetHandles', 
      label: 'Cabinet Handle Lookup', 
      icon: <HandleIcon />, 
      color: theme.palette.primary.main,
      bgColor: theme.palette.action.hover,
      fields: ['Supplier', 'Handle Code and Description']
    },
    { 
      key: 'miscItems', 
      label: 'Misc Items Lookup', 
      icon: <MiscIcon />, 
      color: theme.palette.primary.main,
      bgColor: theme.palette.action.hover,
      fields: ['Supplier', 'Miscellaneous Item Code and Description']
    },
    { 
      key: 'buyInItems', 
      label: 'Buy-in Items Lookup', 
      icon: <BuyInIcon />, 
      color: theme.palette.primary.main,
      bgColor: theme.palette.action.hover,
      fields: ['Supplier', 'Supplier Quote Number and Description']
    },
    { 
      key: 'specialHardware', 
      label: 'Special Hardware Lookup', 
      icon: <SpecialIcon />, 
      color: theme.palette.primary.main,
      bgColor: theme.palette.action.hover,
      fields: ['Supplier', 'Code and Description']
    },
  ];

  return (
    <Box sx={{ p: 4, maxWidth: "1600px", margin: "auto", minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="primary" sx={{ mb: 3 }}>
        Kitchen Joinery Quote System
      </Typography>

      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}` }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel 
                StepIconProps={{ 
                  style: { 
                    color: activeStep >= index ? theme.palette.primary.main : theme.palette.text.disabled,
                  } 
                }}
              >
                <Typography variant="body2" fontWeight={activeStep === index ? 700 : 400}>
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* --- STEP 1: INTERNAL COSTING --- */}
      {activeStep === 0 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Internal Costing:</strong> Enter all cabinet, panel, and hardware costs. 
              Each section is separate for better organization.
            </Typography>
          </Alert>

          {/* Project Header Bar */}
          <Paper elevation={4} sx={{ p: 3, mb: 4, bgcolor: theme.palette.primary.main, color: 'white', borderRadius: 3, boxShadow: (theme) => `0 10px 20px ${theme.palette.primary.main}33` }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={1.5}>
                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Project Code</Typography>
                <Typography variant="h6" fontWeight="800">{projectInfo.code}</Typography>
              </Grid>
              <Grid item xs={12} md={2.5}>
                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Project Description</Typography>
                <Typography variant="body1" fontWeight="600" noWrap title={projectInfo.description}>{projectInfo.description || '-'}</Typography>
              </Grid>
              <Grid item xs={12} md={1}>
                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Qty</Typography>
                <Typography variant="h6" fontWeight="700">{projectInfo.quantity}</Typography>
              </Grid>
              <Grid item xs={12} md={1.5}>
                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Substrate</Typography>
                <Typography variant="body1" fontWeight="600">Birch Plywood</Typography>
              </Grid>
              <Grid item xs={12} md={1.5}>
                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Finishes</Typography>
                <Typography variant="body1" fontWeight="600" noWrap>Oak Veneer / White</Typography>
              </Grid>
              <Grid item xs={12} md={1.5}>
                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationIcon sx={{ fontSize: '0.85rem' }} /> Location
                </Typography>
                <Typography variant="body2" fontWeight="600" noWrap title={projectInfo.location}>{projectInfo.location || '-'}</Typography>
              </Grid>
              <Grid item xs={12} md={1.5} sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                  <CalculateIcon sx={{ fontSize: '0.85rem' }} /> Total S1 Cost
                </Typography>
                <Typography variant="h6" fontWeight="900" sx={{ color: '#4caf50' }}>${(cabinetTotals.totalCarcassCost + cabinetTotals.totalExternalCost + cabinetTotals.totalLabour + accessoryTotals.total).toFixed(0)}</Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Unit Information Card */}
          <Card elevation={0} sx={{ mb: 4, bgcolor: theme.palette.primary.lightOpacity || 'transparent', borderRadius: 3, border: `1px solid ${theme.palette.primary.main}20` }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="700" mb={3} sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <UnitIcon sx={{ fontSize: '1.8rem' }} /> Costing Sheet 1: Unit Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField 
                    fullWidth 
                    label="Unit Name / Area of Work Name" 
                    variant="filled" 
                    size="small" 
                    sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                    value={projectInfo.description}
                    onChange={(e) => setProjectInfo({...projectInfo, description: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={1.5}>
                  <TextField 
                    fullWidth 
                    label="Drawing No" 
                    variant="filled" 
                    size="small" 
                    sx={{ bgcolor: 'background.paper' }}
                    value={projectInfo.drawingNo}
                    onChange={(e) => setProjectInfo({...projectInfo, drawingNo: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <TextField 
                    fullWidth 
                    label="Revision" 
                    variant="filled" 
                    size="small" 
                    sx={{ bgcolor: 'background.paper' }}
                    value={projectInfo.revision}
                    onChange={(e) => setProjectInfo({...projectInfo, revision: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <TextField 
                    fullWidth 
                    label="Quantity" 
                    type="number" 
                    variant="filled" 
                    size="small" 
                    sx={{ bgcolor: 'background.paper' }}
                    value={projectInfo.quantity}
                    onChange={(e) => setProjectInfo({...projectInfo, quantity: parseInt(e.target.value) || 0})}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField 
                    fullWidth 
                    label="Cabinetry / Unit Type" 
                    variant="filled" 
                    size="small" 
                    sx={{ bgcolor: 'background.paper' }}
                    value={projectInfo.cabinetryType}
                    onChange={(e) => setProjectInfo({...projectInfo, cabinetryType: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={1.5}>
                  <TextField 
                    fullWidth 
                    label="Overall M2" 
                    type="number"
                    variant="filled" 
                    size="small" 
                    sx={{ bgcolor: 'background.paper' }}
                    value={projectInfo.overallM2}
                    onChange={(e) => setProjectInfo({...projectInfo, overallM2: parseFloat(e.target.value) || 0})}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField 
                    fullWidth 
                    label="Location" 
                    variant="filled" 
                    size="small" 
                    sx={{ bgcolor: 'background.paper' }}
                    value={projectInfo.location}
                    onChange={(e) => setProjectInfo({...projectInfo, location: e.target.value})}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Cabinet Lookup Section */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 4 }}>
            <Typography variant="h6" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CabinetIcon sx={{ color: theme.palette.primary.main }} /> Cabinet Lookup Section
            </Typography>
            <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={addCabinetRow} sx={{ borderRadius: '8px', textTransform: 'none' }}>
              Add Cabinet Row
            </Button>
          </Box>
          
          <TableContainer component={Paper} sx={{ mb: 4, maxHeight: 500, borderRadius: 2 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ "& .MuiTableCell-head": { backgroundColor: theme.palette.primary.main, color: 'white', fontWeight: 700, fontSize: '0.7rem', padding: '8px 4px' } }}>
                  <TableCell>Cabinet Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Carcass Substrate/Finish</TableCell>
                  <TableCell>External Finish</TableCell>
                  <TableCell>Carcass M2</TableCell>
                  <TableCell>External M2</TableCell>
                  <TableCell>Rate Carcass</TableCell>
                  <TableCell>Rate External</TableCell>
                  <TableCell>Total Carcass Cost</TableCell>
                  <TableCell>Total External Cost</TableCell>
                  <TableCell>Labour Cost</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cabinetRows.map((row, index) => (
                  <TableRow 
                    key={row.id}
                    hover
                    sx={{
                      backgroundColor: index % 2 === 0 ? theme.palette.action.hover : 'inherit',
                      "& .MuiTableCell-root": { padding: '6px 4px', fontSize: '0.75rem' }
                    }}
                  >
                    <TableCell><TextField size="small" variant="standard" placeholder="Code" value={row.code} onChange={(e) => handleCabinetRowChange(row.id, 'code', e.target.value)} /></TableCell>
                    <TableCell><TextField size="small" variant="standard" fullWidth value={row.description} onChange={(e) => handleCabinetRowChange(row.id, 'description', e.target.value)} /></TableCell>
                    <TableCell><TextField size="small" variant="standard" type="number" sx={{ width: 50 }} value={row.qty} onChange={(e) => handleCabinetRowChange(row.id, 'qty', parseInt(e.target.value) || 0)} /></TableCell>
                    <TableCell><TextField size="small" variant="standard" value={row.carcassSubstrateFinish} onChange={(e) => handleCabinetRowChange(row.id, 'carcassSubstrateFinish', e.target.value)} /></TableCell>
                    <TableCell><TextField size="small" variant="standard" value={row.externalFinish} onChange={(e) => handleCabinetRowChange(row.id, 'externalFinish', e.target.value)} /></TableCell>
                    <TableCell><TextField size="small" variant="standard" type="number" sx={{ width: 60 }} value={row.totalCarcassM2} onChange={(e) => handleCabinetRowChange(row.id, 'totalCarcassM2', parseFloat(e.target.value) || 0)} /></TableCell>
                    <TableCell><TextField size="small" variant="standard" type="number" sx={{ width: 60 }} value={row.totalExternalM2} onChange={(e) => handleCabinetRowChange(row.id, 'totalExternalM2', parseFloat(e.target.value) || 0)} /></TableCell>
                    <TableCell><TextField size="small" variant="standard" type="number" sx={{ width: 60 }} value={row.materialRateCarcass} onChange={(e) => handleCabinetRowChange(row.id, 'materialRateCarcass', parseFloat(e.target.value) || 0)} /></TableCell>
                    <TableCell><TextField size="small" variant="standard" type="number" sx={{ width: 60 }} value={row.materialRateExternal} onChange={(e) => handleCabinetRowChange(row.id, 'materialRateExternal', parseFloat(e.target.value) || 0)} /></TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>${row.totalCarcassCost.toFixed(2)}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>${row.totalExternalCost.toFixed(2)}</TableCell>
                    <TableCell><TextField size="small" variant="standard" type="number" sx={{ width: 60 }} value={row.labourCost} onChange={(e) => handleCabinetRowChange(row.id, 'labourCost', parseFloat(e.target.value) || 0)} /></TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => removeCabinetRow(row.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* End Panel & Loose Panel Section */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 6 }}>
            <Typography variant="h6" fontWeight="700" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PanelIcon sx={{ color: theme.palette.primary.main }} /> End Panel & Loose Panel Lookup Section
            </Typography>
            <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={addPanelRow} sx={{ borderRadius: '8px', textTransform: 'none' }}>
              Add Panel Row
            </Button>
          </Box>
          
          <TableContainer component={Paper} sx={{ mb: 4, maxHeight: 400, borderRadius: 2 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ "& .MuiTableCell-head": { backgroundColor: theme.palette.primary.main, color: 'white', fontWeight: 700, fontSize: '0.7rem', padding: '8px 4px' } }}>
                  <TableCell>Panel Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Carcass Substrate/Finish</TableCell>
                  <TableCell>External Finish</TableCell>
                  <TableCell>Carcass M2</TableCell>
                  <TableCell>External M2</TableCell>
                  <TableCell>Rate Carcass</TableCell>
                  <TableCell>Rate External</TableCell>
                  <TableCell>Total Carcass Cost</TableCell>
                  <TableCell>Total External Cost</TableCell>
                  <TableCell>Labour Cost</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {panelRows.map((row, index) => (
                  <TableRow key={row.id} hover sx={{ "& .MuiTableCell-root": { padding: '6px 4px', fontSize: '0.75rem' } }}>
                    <TableCell><TextField size="small" variant="standard" placeholder="Code" value={row.code} onChange={(e) => handlePanelRowChange(row.id, 'code', e.target.value)} /></TableCell>
                    <TableCell><TextField size="small" variant="standard" fullWidth value={row.description} onChange={(e) => handlePanelRowChange(row.id, 'description', e.target.value)} /></TableCell>
                    <TableCell><TextField size="small" variant="standard" type="number" sx={{ width: 50 }} value={row.qty} onChange={(e) => handlePanelRowChange(row.id, 'qty', parseInt(e.target.value) || 0)} /></TableCell>
                    <TableCell><TextField size="small" variant="standard" value={row.carcassSubstrateFinish} onChange={(e) => handlePanelRowChange(row.id, 'carcassSubstrateFinish', e.target.value)} /></TableCell>
                    <TableCell><TextField size="small" variant="standard" value={row.externalFinish} onChange={(e) => handlePanelRowChange(row.id, 'externalFinish', e.target.value)} /></TableCell>
                    <TableCell><TextField size="small" variant="standard" type="number" sx={{ width: 60 }} value={row.totalCarcassM2} onChange={(e) => handlePanelRowChange(row.id, 'totalCarcassM2', parseFloat(e.target.value) || 0)} /></TableCell>
                    <TableCell><TextField size="small" variant="standard" type="number" sx={{ width: 60 }} value={row.totalExternalM2} onChange={(e) => handlePanelRowChange(row.id, 'totalExternalM2', parseFloat(e.target.value) || 0)} /></TableCell>
                    <TableCell><TextField size="small" variant="standard" type="number" sx={{ width: 60 }} value={row.materialRateCarcass} onChange={(e) => handlePanelRowChange(row.id, 'materialRateCarcass', parseFloat(e.target.value) || 0)} /></TableCell>
                    <TableCell><TextField size="small" variant="standard" type="number" sx={{ width: 60 }} value={row.materialRateExternal} onChange={(e) => handlePanelRowChange(row.id, 'materialRateExternal', parseFloat(e.target.value) || 0)} /></TableCell>
                    <TableCell>${row.totalCarcassCost.toFixed(2)}</TableCell>
                    <TableCell>${row.totalExternalCost.toFixed(2)}</TableCell>
                    <TableCell><TextField size="small" variant="standard" type="number" sx={{ width: 60 }} value={row.labourCost} onChange={(e) => handlePanelRowChange(row.id, 'labourCost', parseFloat(e.target.value) || 0)} /></TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => removePanelRow(row.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* SEPARATE ACCESSORY SECTIONS - Each as its own distinct card */}
          <Typography variant="h6" fontWeight="600" mb={2} sx={{ mt: 2 }}>
            🔧 Hardware & Accessories Lookup
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            {/* Full-width Accessories Lookup Sections */}
              {accessorySectionsConfig.map((section) => (
                <Accordion 
                  key={section.key} 
                  defaultExpanded 
                  sx={{ 
                    mb: 2, 
                    borderRadius: 2,
                    '&:before': { display: 'none' },
                    boxShadow: 1,
                    borderLeft: `4px solid ${section.color}`
                  }}
                >
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                      bgcolor: section.bgColor,
                      borderRadius: '8px 8px 0 0',
                      '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1 }
                    }}
                  >
                    <Box sx={{ color: section.color }}>{section.icon}</Box>
                    <Typography variant="subtitle1" fontWeight="700" sx={{ color: section.color }}>
                      {section.label}
                    </Typography>
                    <Chip 
                      label={`${accessorySections[section.key].length} items`} 
                      size="small" 
                      sx={{ ml: 1, bgcolor: section.color, color: 'white' }}
                    />
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'white' }}>{section.fields[0]}</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'white' }}>{section.fields[1]}</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'white' }} align="center">Qty</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'white' }} align="right">Buy Price</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'white' }} align="right">Total</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'white' }} align="center">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {accessorySections[section.key].map((item) => (
                            <TableRow key={item.id} hover>
                              <TableCell sx={{ p: 1 }}>
                                <TextField 
                                  size="small" 
                                  variant="standard" 
                                  placeholder="Supplier name"
                                  value={item.supplier}
                                  onChange={(e) => updateAccessoryRow(section.key, item.id, 'supplier', e.target.value)}
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell sx={{ p: 1 }}>
                                <TextField 
                                  size="small" 
                                  variant="standard" 
                                  placeholder="Code & Description"
                                  value={item.description}
                                  onChange={(e) => updateAccessoryRow(section.key, item.id, 'description', e.target.value)}
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell align="center" sx={{ p: 1 }}>
                                <TextField 
                                  size="small" 
                                  variant="standard" 
                                  type="number" 
                                  sx={{ width: 60 }}
                                  value={item.qty}
                                  onChange={(e) => updateAccessoryRow(section.key, item.id, 'qty', parseInt(e.target.value) || 0)}
                                />
                              </TableCell>
                              <TableCell align="right" sx={{ p: 1 }}>
                                <TextField 
                                  size="small" 
                                  variant="standard" 
                                  type="number" 
                                  sx={{ width: 80 }}
                                  value={item.buyPrice}
                                  onChange={(e) => updateAccessoryRow(section.key, item.id, 'buyPrice', parseFloat(e.target.value) || 0)}
                                  InputProps={{ startAdornment: '$' }}
                                />
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600, p: 1 }}>
                                ${(item.buyPrice * item.qty).toFixed(2)}
                              </TableCell>
                              <TableCell align="center" sx={{ p: 1 }}>
                                <IconButton size="small" color="error" onClick={() => removeAccessoryRow(section.key, item.id)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                          {accessorySections[section.key].length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                No items added. Click "Add Item" to add {section.label.toLowerCase()}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box sx={{ p: 1.5, bgcolor: theme.palette.action.hover, display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${theme.palette.divider}` }}>
                      <Button 
                        size="small" 
                        startIcon={<AddIcon />} 
                        onClick={() => addAccessoryRow(section.key)}
                        sx={{ textTransform: 'none' }}
                      >
                        Add {section.label.replace('Lookup', '').trim()}
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
          </Box>

          <Grid container spacing={3} mb={4}>
            {/* Notes & Summary (Repositioned below Hardware) */}
            <Grid item xs={12} md={6}>
              <Card sx={{ mb: 3, bgcolor: theme.palette.action.hover, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="700" mb={1} sx={{ color: theme.palette.primary.main }}>
                    📄 TENDER SUBMISSION SECTION
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    (This section will appear in the client's tender submission)
                  </Typography>
                  <TextField 
                    fullWidth 
                    multiline 
                    rows={6} 
                    variant="outlined" 
                    placeholder="Enter tender text here..."
                    value={tenderText}
                    onChange={(e) => setTenderText(e.target.value)}
                  />
                </CardContent>
              </Card>

              <Card sx={{ mb: 3, bgcolor: theme.palette.action.hover, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="700" mb={1} sx={{ color: theme.palette.primary.main }}>
                    📝 INTERNAL COSTING SHEET 1 NOTES
                  </Typography>
                  <TextField 
                    fullWidth 
                    multiline 
                    rows={6} 
                    variant="outlined" 
                    placeholder="Internal notes only..."
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="700" mb={2} sx={{ bgcolor: theme.palette.primary.main, color: 'white', p: 1, borderRadius: 1, mt: -1, mx: -1 }}>
                    CABINET QUANTITY SUMMARY & CHECK
                  </Typography>
                  <TableContainer component={Paper} elevation={0}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                          <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '0.7rem' }}>ITEM CATEGORY</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '0.7rem' }} align="center">QUANTITY</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'white', fontSize: '0.7rem' }} align="center">✓</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[
                          { key: 'baseCabinets', label: "BASE CABINETS (DOOR & OPEN)" },
                          { key: 'baseDrawerCabinets', label: "BASE DRAWER CABINETS" },
                          { key: 'wallCabinets', label: "WALL CABINETS (DOOR & OPEN)" },
                          { key: 'tallCabinets', label: "TALL CABINETS (DOOR & OPEN)" },
                          { key: 'endPanelsBase', label: "END PANELS - BASE" },
                          { key: 'endPanelsWall', label: "END PANELS - WALL" },
                          { key: 'endPanelsTall', label: "END PANELS - TALL" },
                          { key: 'vanities', label: "VANITIES" },
                          { key: 'wardrobes', label: "WARDROBES" },
                          { key: 'totalCabinetM2', label: "TOTAL CABINETRY M2" }
                        ].map((item) => (
                          <TableRow key={item.key}>
                            <TableCell sx={{ fontSize: '0.7rem' }}>{item.label}</TableCell>
                            <TableCell align="center">
                              <TextField 
                                size="small" 
                                variant="standard" 
                                sx={{ width: 60 }} 
                                type="number"
                                value={cabinetSummary[item.key]}
                                onChange={(e) => setCabinetSummary({...cabinetSummary, [item.key]: parseFloat(e.target.value) || 0})}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox 
                                size="small" 
                                checked={!!cabinetSummaryChecks[item.key]} 
                                onChange={(e) => setCabinetSummaryChecks({...cabinetSummaryChecks, [item.key]: e.target.checked})}
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

          {/* Hardware Summary Card */}
          <Card sx={{ mb: 3, bgcolor: theme.palette.action.hover, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="700" mb={2}>💰 Hardware & Accessories Summary</Typography>
              <Grid container spacing={2}>
                {accessorySectionsConfig.map((section) => {
                  const total = accessorySections[section.key].reduce((sum, item) => sum + (item.buyPrice * item.qty), 0);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={section.key}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1.5, 
                        p: 1.5, 
                        bgcolor: 'background.paper', 
                        borderRadius: 2, 
                        border: `1px solid ${theme.palette.divider}`,
                        transition: '0.2s',
                        '&:hover': { bgcolor: theme.palette.action.hover }
                      }}>
                        <Box sx={{ color: section.color }}>{section.icon}</Box>
                        <Typography variant="body2" sx={{ flex: 1 }}>{section.label.replace('Lookup', '')}</Typography>
                        <Typography variant="body2" fontWeight="bold">${total.toFixed(2)}</Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>

          {/* Bottom Summary Section */}
          <Paper elevation={0} sx={{ p: 4, mb: 4, bgcolor: theme.palette.primary.main, color: 'white', borderRadius: 3 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon /> GENERAL NOTES & CALCULATIONS
                </Typography>
                <TextField 
                  fullWidth 
                  multiline 
                  rows={6} 
                  variant="outlined" 
                  placeholder="Enter general notes..."
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.05)', 
                    borderRadius: 2, 
                    '& .MuiOutlinedInput-root': { color: 'white' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }
                  }}
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalculateIcon /> Costing Sheet 1 Summary
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ "& .MuiTableCell-head": { color: 'white', borderBottom: '1px solid rgba(255,255,255,0.3)', fontWeight: 700 } }}>
                      <TableCell>Item Description</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow sx={{ "& .MuiTableCell-root": { color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem' } }}>
                      <TableCell>Total Carcass Cost (incl. wastage)</TableCell>
                      <TableCell align="right">${cabinetTotals.totalCarcassCost.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow sx={{ "& .MuiTableCell-root": { color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem' } }}>
                      <TableCell>Total External Cost (incl. wastage)</TableCell>
                      <TableCell align="right">${cabinetTotals.totalExternalCost.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow sx={{ "& .MuiTableCell-root": { color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem' } }}>
                      <TableCell>Total Labour</TableCell>
                      <TableCell align="right">${cabinetTotals.totalLabour.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow sx={{ "& .MuiTableCell-root": { color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem' } }}>
                      <TableCell>Total Hardware & Accessories</TableCell>
                      <TableCell align="right">${accessoryTotals.total.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.15)' }}>
                      <TableCell sx={{ fontWeight: 800 }}>TOTAL SHEET 1 COST</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 900, color: 'white', fontSize: '1.2rem' }}>
                        ${(cabinetTotals.totalCarcassCost + cabinetTotals.totalExternalCost + cabinetTotals.totalLabour + accessoryTotals.total).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
          </Paper>
          
          
        </Box>
      )}

      {/* --- STEP 2: PRICING --- */}
      {activeStep === 1 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Pricing:</strong> Apply different markups for each hardware category and calculate final selling price.
            </Typography>
          </Alert>

          <Typography variant="h5" fontWeight="600" mb={3} sx={{ color: theme.palette.primary.main }}>
            💵 Step 2: Pricing & Markup Calculation
          </Typography>

          <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                  <TableCell sx={{ fontWeight: 700, color: 'white' }}>Item Category</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'white' }} align="right">Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'white' }} align="right">Cost Price</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'white' }} align="center">Markup %</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'white' }} align="right">Markup Value</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'white', bgcolor: '#388e3c' }} align="right">Sell Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pricingItems.map((item, idx) => (
                  <TableRow key={item.category} sx={{ bgcolor: idx % 2 === 0 ? theme.palette.action.hover : 'inherit' }}>
                    <TableCell>{item.category}</TableCell>
                    <TableCell align="right">
                      <TextField size="small" variant="standard" type="number" sx={{ width: 80 }} 
                        value={item.quantity} 
                        onChange={(e) => handlePricingItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)} 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField size="small" variant="standard" type="number" sx={{ width: 100 }} 
                        value={item.costPrice} 
                        onChange={(e) => handlePricingItemChange(idx, 'costPrice', parseFloat(e.target.value) || 0)} 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField size="small" variant="standard" type="number" sx={{ width: 60 }} 
                        value={item.markup} 
                        onChange={(e) => handlePricingItemChange(idx, 'markup', parseFloat(e.target.value) || 0)} 
                      />
                    </TableCell>
                    <TableCell align="right">${(item.costPrice * item.markup / 100).toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "700", color: '#388e3c' }}>${item.sellPrice.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ p: 3, bgcolor: theme.palette.info.lightOpacity || '#e3f2fd', borderRadius: 3, border: `1px solid ${theme.palette.info.main}20` }}>
                <Typography variant="subtitle2" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PieChartIcon color="info" /> Overhead Recovery
                </Typography>
                <TextField 
                  fullWidth 
                  type="number" 
                  label="Overhead Percentage" 
                  value={overheadPercentage}
                  onChange={(e) => setOverheadPercentage(parseFloat(e.target.value) || 0)}
                  InputProps={{ endAdornment: '%' }}
                  size="small"
                  sx={{ mt: 1, bgcolor: 'background.paper' }}
                />
                <Typography variant="body2" sx={{ mt: 2, fontWeight: 600 }}>
                  Overhead Amount: ${(totalCost * overheadPercentage / 100).toFixed(2)}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ p: 3, bgcolor: theme.palette.warning.lightOpacity || '#fff3e0', borderRadius: 3, border: `1px solid ${theme.palette.warning.main}20` }}>
                <Typography variant="subtitle2" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="warning" /> Profit Margin
                </Typography>
                <TextField 
                  fullWidth 
                  type="number" 
                  label="Profit Margin" 
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
                  InputProps={{ endAdornment: '%' }}
                  size="small"
                  sx={{ mt: 1, bgcolor: 'background.paper' }}
                />
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card elevation={4} sx={{ p: 3, bgcolor: theme.palette.primary.main, color: 'white', borderRadius: 3, boxShadow: `0 8px 24px ${theme.palette.primary.main}40` }}>
                <Typography variant="subtitle2" fontWeight="700" gutterBottom sx={{ opacity: 0.8 }}>PRICE SUMMARY</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Direct Cost:</Typography>
                  <Typography variant="body2" fontWeight="700">${totalCost.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Overhead:</Typography>
                  <Typography variant="body2" fontWeight="700">${(totalCost * overheadPercentage / 100).toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 1.5, bgcolor: 'rgba(255,255,255,0.2)' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight="bold">Final Price:</Typography>
                  <Typography variant="h6" fontWeight="900">${finalPrice.toLocaleString()}</Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>

          <Button 
            variant="contained" 
            color="success" 
            onClick={updatePricingTotals}
            sx={{ mb: 2 }}
            startIcon={<CalculateIcon />}
          >
            Recalculate All Prices
          </Button>

          <Card sx={{ p: 4, textAlign: 'center', bgcolor: theme.palette.success.dark, color: theme.palette.success.contrastText, borderRadius: 3, boxShadow: (theme) => `0 10px 30px ${theme.palette.success.main}40` }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">🏷️ Final Proposal Price</Typography>
            <Typography variant="h2" fontWeight="bold">${finalPrice.toFixed(2)}</Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>* Excluding VAT/GST if applicable</Typography>
          </Card>
        </Box>
      )}

      {/* --- STEP 3: QUOTATION --- */}
      {activeStep === 2 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Quotation:</strong> Generate a professional quote to send to the end client.
            </Typography>
          </Alert>

          <Typography variant="h5" fontWeight="600" mb={3} sx={{ color: theme.palette.primary.main }}>
            📄 Step 3: Client Quotation
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: theme.palette.action.hover }}>
                <Typography variant="h6" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" /> Client Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 3 }}>
                  <TextField fullWidth label="Client Name" size="small" variant="outlined" value={clientInfo.name} onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})} sx={{ bgcolor: 'background.paper' }} />
                  <TextField fullWidth label="Company" size="small" variant="outlined" value={clientInfo.company} onChange={(e) => setClientInfo({...clientInfo, company: e.target.value})} sx={{ bgcolor: 'background.paper' }} />
                  <TextField fullWidth label="Address" size="small" variant="outlined" value={clientInfo.address} onChange={(e) => setClientInfo({...clientInfo, address: e.target.value})} sx={{ bgcolor: 'background.paper' }} />
                  <TextField fullWidth label="Email" size="small" variant="outlined" value={clientInfo.email} onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})} sx={{ bgcolor: 'background.paper' }} />
                  <TextField fullWidth label="Phone" size="small" variant="outlined" value={clientInfo.phone} onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})} sx={{ bgcolor: 'background.paper' }} />
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper elevation={0} sx={{ p: 6, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.default' }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h4" fontWeight="900" sx={{ color: theme.palette.primary.main, letterSpacing: 1 }}>VSP INTERIOR</Typography>
                  <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 600 }}>Premium Kitchen & Joinery Solutions</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>123 Business Street, Industrial Area | info@vspinterior.com | +1 234 567 890</Typography>
                </Box>
                <Divider sx={{ mb: 4 }} />
                
                <Grid container spacing={4} mb={4}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color={theme.palette.primary.main} fontWeight="bold">QUOTATION TO:</Typography>
                    <Typography fontWeight="bold">{clientInfo.name || "Client Name"}</Typography>
                    <Typography variant="body2">{clientInfo.company}</Typography>
                    <Typography variant="body2">{clientInfo.address}</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle2" color={theme.palette.primary.main} fontWeight="bold">QUOTE DETAILS:</Typography>
                    <Typography variant="body2">Date: {new Date().toLocaleDateString()}</Typography>
                    <Typography variant="body2">Quote No: {projectInfo.code}</Typography>
                    <Typography variant="body2">Valid Until: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</Typography>
                  </Grid>
                </Grid>
                
                <Typography variant="subtitle2" fontWeight="bold" mb={2}>Project Details:</Typography>
                <Typography variant="body2" mb={3}>Drawing No: {projectInfo.drawingNo || '-'} | Revision: {projectInfo.revision || '-'} | Location: {projectInfo.location || '-'}</Typography>
                
                <Table size="small" sx={{ mb: 4 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                      <TableCell sx={{ fontWeight: 700, color: 'white' }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'white' }} align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pricingItems.filter(item => item.costPrice > 0).map((item) => (
                      <TableRow key={item.category}>
                        <TableCell>{item.category}</TableCell>
                        <TableCell align="right">${item.sellPrice.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                      <TableCell align="right"><strong>Subtotal</strong></TableCell>
                      <TableCell align="right"><strong>${finalPrice.toFixed(2)}</strong></TableCell>
                    </TableRow>
                    <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                      <TableCell align="right"><strong style={{ color: 'white' }}>TOTAL</strong></TableCell>
                      <TableCell align="right"><strong style={{ color: 'white' }}>${finalPrice.toFixed(2)}</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                
                <TextField 
                  fullWidth 
                  multiline 
                  rows={4} 
                  label="Additional Notes / Terms & Conditions" 
                  variant="outlined" 
                  size="small"
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="Payment terms: 50% deposit, 50% upon completion. Lead time: 4-6 weeks. Warranty: 5 years on cabinetry."
                  sx={{ mb: 3 }}
                />
                
                {tenderText && (
                  <Paper sx={{ p: 2, bgcolor: theme.palette.action.hover, mb: 3, borderRadius: 1 }}>
                    <Typography variant="caption" color="primary" fontWeight="bold">TENDER NOTES:</Typography>
                    <Typography variant="body2">{tenderText}</Typography>
                  </Paper>
                )}
                
                <Divider sx={{ mb: 1 }} />
                <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                  This is a system generated document. Terms & Conditions apply.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 6 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
          size="large"
          sx={{ borderRadius: 2 }}
        >
          ← Back
        </Button>
        <Box>
          <Button variant="outlined" startIcon={<SaveIcon />} sx={{ mr: 2 }} size="large">
            Save Draft
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" color="success" startIcon={<PictureAsPdfIcon />} size="large" sx={{ borderRadius: 2, px: 4 }}>
              Generate PDF Quote
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext} size="large" sx={{ borderRadius: 2, bgcolor: theme.palette.primary.main }}>
              Next: {steps[activeStep + 1]} →
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TestQuote;