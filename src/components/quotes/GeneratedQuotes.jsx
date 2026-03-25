"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  CircularProgress
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";
import { GenerateTenderTemplate } from "@/utils/GenerateTenderTemplate";

export const GeneratedQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/quotes`);
      if (res.data.success) {
        setQuotes(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching quotes:", error);
      toast.error("Failed to load quotes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quote?")) return;
    try {
      const res = await axios.delete(`${BASE_URL}/api/quotes/${id}`);
      if (res.data.success) {
        toast.success("Quote deleted successfully");
        fetchQuotes();
      }
    } catch (error) {
      console.error("Error deleting quote:", error);
      toast.error("Failed to delete quote");
    }
  };

  const handleDownloadPDF = async (quote) => {
    try {
      const { quoteData } = quote;
      
      // We need to shape it up for GenerateTenderTemplate exactly like TestQuote does
      // We stored projectInfo, clientInfo, pricingItems, etc. inside quoteData
      const payloadData = {
        projectData: quoteData.projectInfo,
        clientInfo: quoteData.clientInfo,
        pricingItems: quoteData.pricingItems,
        // Calculate the same final price that was shown on the front
        finalPrice: calculateFinalPrice(quoteData) 
      };

      await GenerateTenderTemplate(quoteData.projectInfo?.code || "quote", payloadData);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Error generating PDF");
    }
  };

  const calculateFinalPrice = (data) => {
    const directCost = data.pricingItems?.reduce((ac, item) => ac + (item.costPrice || 0), 0) || 0;
    const oh = directCost * ((data.overheadPercentage || 0) / 100);
    const sub = directCost + oh;
    const pm = data.profitMargin || 0;
    return pm < 100 ? sub / (1 - pm / 100) : 0;
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Generated Quotes</Typography>
        <Button variant="outlined" startIcon={<Box component="span" sx={{ fontSize: 18 }}>↺</Box>} onClick={fetchQuotes}>
          Refresh
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>Project Code / Date</b></TableCell>
                <TableCell><b>Client Name</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell align="right"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    No quotes generated yet.
                  </TableCell>
                </TableRow>
              ) : (
                quotes.map((quote) => (
                  <TableRow key={quote.id} hover>
                    <TableCell>#{quote.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {quote.quoteData?.projectInfo?.code || "N/A"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{quote.quoteData?.clientInfo?.company || quote.quoteData?.clientInfo?.name || "N/A"}</TableCell>
                    <TableCell>
                      <Chip label={quote.status} color={quote.status === "Draft" ? "warning" : "success"} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleDownloadPDF(quote)} size="small" title="Download PDF">
                        <PictureAsPdfIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(quote.id)} size="small" title="Delete Quote">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
