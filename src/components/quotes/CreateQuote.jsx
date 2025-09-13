"use client"

import { useState } from "react"
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material"

// ✅ Correct MUI icon imports
import AddIcon from "@mui/icons-material/Add"
import SaveIcon from "@mui/icons-material/Save"
import SendIcon from "@mui/icons-material/Send"
import DescriptionIcon from "@mui/icons-material/Description" // alternative for FileText
import CalculateIcon from "@mui/icons-material/Calculate"

// Mock data for area pricing
const mockAreaItems = {
  kitchen: [
    { id: 1, item: "Base Cabinets", rate: 450, qty: 8, unit: "lm", total: 3600 },
    { id: 2, item: "Wall Cabinets", rate: 380, qty: 6, unit: "lm", total: 2280 },
    { id: 3, item: "Benchtop", rate: 120, qty: 14, unit: "lm", total: 1680 },
    { id: 4, item: "Hardware & Accessories", rate: 50, qty: 14, unit: "set", total: 700 },
  ],
  laundry: [
    { id: 1, item: "Laundry Cabinets", rate: 420, qty: 4, unit: "lm", total: 1680 },
    { id: 2, item: "Benchtop", rate: 120, qty: 3, unit: "lm", total: 360 },
    { id: 3, item: "Splashback", rate: 85, qty: 3, unit: "lm", total: 255 },
  ],
  wardrobe: [
    { id: 1, item: "Wardrobe Frames", rate: 380, qty: 12, unit: "lm", total: 4560 },
    { id: 2, item: "Shelving", rate: 45, qty: 20, unit: "shelf", total: 900 },
    { id: 3, item: "Hanging Rails", rate: 25, qty: 8, unit: "rail", total: 200 },
    { id: 4, item: "Drawers", rate: 120, qty: 6, unit: "drawer", total: 720 },
  ],
}

export const CreateQuote = () => {
  const [activeArea, setActiveArea] = useState("kitchen")
  const [quoteData, setQuoteData] = useState({
    client: "",
    project: "",
    description: "",
    labour: 2500,
    subcontractor: 1200,
    overheads: 800,
    gst: 10,
    discount: 0,
  })

  const calculateAreaTotal = (area) => {
    return mockAreaItems[area].reduce((sum, item) => sum + item.total, 0)
  }

  const calculateSubtotal = () => {
    const areasTotal = Object.keys(mockAreaItems).reduce(
      (sum, area) => sum + calculateAreaTotal(area),
      0
    )
    return areasTotal + quoteData.labour + quoteData.subcontractor + quoteData.overheads
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const afterDiscount = subtotal - (subtotal * quoteData.discount) / 100
    return afterDiscount + (afterDiscount * quoteData.gst) / 100
  }

  const calculateMargin = () => {
    const total = calculateTotal()
    const costs = calculateSubtotal() * 0.7 // Assume 70% is cost
    return ((total - costs) / total * 100).toFixed(1)
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Quote Header */}
      <Card>
        <CardHeader title="Create New Quote" />
        <CardContent>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { md: "1fr 1fr" } }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Client"
                select
                SelectProps={{ native: true }}
                value={quoteData.client}
                onChange={(e) => setQuoteData({ ...quoteData, client: e.target.value })}
              >
                <option value="">Select client</option>
                <option value="modern">Modern Homes Ltd</option>
                <option value="city">City Apartments</option>
                <option value="luxury">Luxury Villas</option>
                <option value="heritage">Heritage Homes</option>
              </TextField>
              <TextField
                label="Project Name"
                value={quoteData.project}
                onChange={(e) => setQuoteData({ ...quoteData, project: e.target.value })}
              />
            </Box>
            <TextField
              label="Project Description"
              multiline
              rows={4}
              value={quoteData.description}
              onChange={(e) => setQuoteData({ ...quoteData, description: e.target.value })}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Area-wise Pricing */}
      <Card>
        <CardHeader title="Area-wise Pricing" />
        <CardContent>
          <Tabs
            value={activeArea}
            onChange={(e, newValue) => setActiveArea(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Kitchen" value="kitchen" />
            <Tab label="Laundry" value="laundry" />
            <Tab label="Wardrobe" value="wardrobe" />
          </Tabs>

          {Object.entries(mockAreaItems).map(([area, items]) => (
            <Box
              key={area}
              role="tabpanel"
              hidden={activeArea !== area}
              sx={{ mt: 2 }}
            >
              {activeArea === area && (
                <>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell>Rate</TableCell>
                          <TableCell>Qty</TableCell>
                          <TableCell>Unit</TableCell>
                          <TableCell>Total</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.item}</TableCell>
                            <TableCell>${item.rate}</TableCell>
                            <TableCell>{item.qty}</TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell>
                              <strong>${item.total}</strong>
                            </TableCell>
                            <TableCell>
                              <Button variant="outlined" size="small">
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 2,
                      p: 2,
                      bgcolor: "action.hover",
                      borderRadius: 2,
                    }}
                  >
                    <Button variant="outlined" size="small" startIcon={<AddIcon />}>
                      Add Item
                    </Button>
                    <Typography fontWeight="bold">
                      {area.charAt(0).toUpperCase() + area.slice(1)} Total: $
                      {calculateAreaTotal(area).toLocaleString()}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Additional Costs & Financial Summary */}
      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { lg: "1fr 1fr" } }}>
        <Card>
          <CardHeader title="Additional Costs" />
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Labour"
              type="number"
              value={quoteData.labour}
              onChange={(e) => setQuoteData({ ...quoteData, labour: Number(e.target.value) })}
            />
            <TextField
              label="Subcontractor"
              type="number"
              value={quoteData.subcontractor}
              onChange={(e) =>
                setQuoteData({ ...quoteData, subcontractor: Number(e.target.value) })
              }
            />
            <TextField
              label="Overheads"
              type="number"
              value={quoteData.overheads}
              onChange={(e) => setQuoteData({ ...quoteData, overheads: Number(e.target.value) })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Financial Summary" />
          <CardContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <span>Subtotal:</span>
                <strong>${calculateSubtotal().toLocaleString()}</strong>
              </Box>
              <TextField
                label="Discount (%)"
                type="number"
                size="small"
                sx={{ width: 100 }}
                value={quoteData.discount}
                onChange={(e) => setQuoteData({ ...quoteData, discount: Number(e.target.value) })}
              />
              <TextField
                label="GST (%)"
                type="number"
                size="small"
                sx={{ width: 100 }}
                value={quoteData.gst}
                onChange={(e) => setQuoteData({ ...quoteData, gst: Number(e.target.value) })}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                <Typography fontWeight="bold">Total:</Typography>
                <Typography fontWeight="bold">${calculateTotal().toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <span>Profit Margin:</span>
                <Chip color="success" label={`${calculateMargin()}%`} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Actions */}
      <Card>
        <CardActions sx={{ gap: 2, p: 2 }}>
          <Button variant="outlined" startIcon={<SaveIcon />}>
            Save Draft
          </Button>
          <Button startIcon={<SendIcon />}>Send Quote</Button>
          <Button variant="outlined" startIcon={<DescriptionIcon />}>
            Preview PDF
          </Button>
        </CardActions>
      </Card>
    </Box>
  )
}
