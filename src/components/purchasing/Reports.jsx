"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Description as FileTextIcon,
} from "@mui/icons-material";
import { BASE_URL } from "@/configs/url";
import axios from "axios";
import Loader from "../loader/Loader";
import SummaryMetrics from "./SummaryMetrics";
import TopSuppliers from "./TopSuppliers";
import ProjectSpend from "./ProjectSpend";
import MonthlyTrend from "./MonthlyTrend";
import ItemStats from "./ItemStats";
import SupplierPerformance from "./SupplierPerformance";
import AttachmentStats from "./AttachmentStats";
import StatusCounts from "./StatusCounts";
import PurchasingCharts from "./PurchasingCharts";
import { PurchasingAnalysisTemplate } from "@/utils/PurchasingAnalysisTemplate";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);

  const fetchPurchaseStats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/purchases/stats`);
      setStatsData(res.data);
    } catch (error) {
      console.error("Error fetching purchase stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseStats();
  }, []);

  const handleExport = (format) => {
    if (format === "pdf" && statsData) {
      console.log("statsData", statsData);
      const generatePDF = PurchasingAnalysisTemplate(statsData);
      generatePDF();
    } else {
      alert(`Report has been exported as ${format.toUpperCase()}`);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!statsData) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={4}
        gap={2}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Reports & Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive purchasing insights and performance metrics
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          
          <Button
            variant="contained"
            startIcon={<FileTextIcon />}
            onClick={() => handleExport("pdf")}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      {/* Summary Metrics */}
      <SummaryMetrics summary={statsData.summary} />

      {/* Charts Section */}
      <PurchasingCharts statsData={statsData} />

      {/* Status Counts */}
      <StatusCounts statusCounts={statsData.summary?.statusCounts} />

      {/* Top Suppliers */}
      <TopSuppliers topSuppliers={statsData.topSuppliers} />

      {/* Project Spend */}
      <ProjectSpend projectSpend={statsData.projectSpend} />

      {/* Monthly Trend */}
      <MonthlyTrend monthlyTrend={statsData.monthlyTrend} />

      {/* Item Stats */}
      <ItemStats itemStats={statsData.itemStats} />

      {/* Supplier Performance */}
      <SupplierPerformance supplierPerformance={statsData.supplierPerformance} />

      {/* Attachment Stats */}
      <AttachmentStats attachmentStats={statsData.attachmentStats} />

      
    </Box>
  );
};

export default Reports;
