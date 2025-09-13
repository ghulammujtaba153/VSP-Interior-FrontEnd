"use client"

import React from "react"
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  LinearProgress,
  Grid,
  Divider,
} from "@mui/material"
import {
  BarChart,
  PieChart,
  TrendingUp,
  AttachMoney,
  People,
  TrackChanges,
} from "@mui/icons-material"

// Mock report data
const conversionData = [
  { month: "Jan 2024", sent: 12, won: 8, rate: 66.7 },
  { month: "Dec 2023", sent: 15, won: 9, rate: 60.0 },
  { month: "Nov 2023", sent: 18, won: 12, rate: 66.7 },
  { month: "Oct 2023", sent: 10, won: 7, rate: 70.0 },
]

const clientPerformance = [
  { client: "Modern Homes Ltd", quotes: 8, won: 6, value: 125000, margin: 24.5 },
  { client: "City Apartments", quotes: 5, won: 4, value: 89000, margin: 22.8 },
  { client: "Luxury Villas", quotes: 6, won: 3, value: 156000, margin: 28.2 },
  { client: "Heritage Homes", quotes: 4, won: 2, value: 67000, margin: 19.5 },
]

const areaPerformance = [
  { area: "Kitchen", quotes: 18, value: 245000, avgMargin: 25.3 },
  { area: "Wardrobe", quotes: 12, value: 168000, avgMargin: 23.8 },
  { area: "Laundry", quotes: 8, value: 89000, avgMargin: 21.2 },
]

export const QuoteReports = () => {
  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* KPIs */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              titleTypographyProps={{ variant: "subtitle2" }}
              title="Overall Win Rate"
              action={<TrackChanges fontSize="small" color="action" />}
            />
            <CardContent>
              <Typography variant="h5">65.8%</Typography>
              <LinearProgress
                variant="determinate"
                value={65.8}
                sx={{ mt: 1, mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                +2.3% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              titleTypographyProps={{ variant: "subtitle2" }}
              title="Avg Quote Value"
              action={<AttachMoney fontSize="small" color="action" />}
            />
            <CardContent>
              <Typography variant="h5">$23,850</Typography>
              <Typography variant="caption" color="text.secondary">
                +8.2% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              titleTypographyProps={{ variant: "subtitle2" }}
              title="Active Clients"
              action={<People fontSize="small" color="action" />}
            />
            <CardContent>
              <Typography variant="h5">23</Typography>
              <Typography variant="caption" color="text.secondary">
                4 new this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader
              titleTypographyProps={{ variant: "subtitle2" }}
              title="Avg Profit Margin"
              action={<TrendingUp fontSize="small" color="action" />}
            />
            <CardContent>
              <Typography variant="h5">24.1%</Typography>
              <Typography variant="caption" color="text.secondary">
                +1.2% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card>
        <CardHeader
          title="Report Filters"
          titleTypographyProps={{ variant: "subtitle1" }}
        />
        <CardContent sx={{ display: "flex", gap: 2 }}>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Time Period</InputLabel>
            <Select defaultValue="">
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Project Type</InputLabel>
            <Select defaultValue="">
              <MenuItem value="all">All Projects</MenuItem>
              <MenuItem value="kitchen">Kitchen Only</MenuItem>
              <MenuItem value="wardrobe">Wardrobe Only</MenuItem>
              <MenuItem value="laundry">Laundry Only</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Conversion Trends */}
      <Card>
        <CardHeader
          title="Quote Conversion Trends"
          avatar={<BarChart />}
          titleTypographyProps={{ variant: "subtitle1" }}
        />
        <CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Period</TableCell>
                  <TableCell>Quotes Sent</TableCell>
                  <TableCell>Quotes Won</TableCell>
                  <TableCell>Conversion Rate</TableCell>
                  <TableCell>Trend</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {conversionData.map((period, index) => (
                  <TableRow key={period.month}>
                    <TableCell>{period.month}</TableCell>
                    <TableCell>{period.sent}</TableCell>
                    <TableCell>{period.won}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight="bold">
                          {period.rate}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={period.rate}
                          sx={{ width: 60 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {index === 0 ? (
                        <Typography color="success.main" variant="caption">
                          ↑ +6.7%
                        </Typography>
                      ) : index === 1 ? (
                        <Typography color="error.main" variant="caption">
                          ↓ -6.7%
                        </Typography>
                      ) : (
                        <Typography color="text.secondary" variant="caption">
                          → 0%
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Client Performance */}
      <Card>
        <CardHeader
          title="Client Performance Analysis"
          avatar={<People />}
          titleTypographyProps={{ variant: "subtitle1" }}
        />
        <CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  <TableCell>Total Quotes</TableCell>
                  <TableCell>Won</TableCell>
                  <TableCell>Win Rate</TableCell>
                  <TableCell>Total Value</TableCell>
                  <TableCell>Avg Margin</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientPerformance.map((client) => (
                  <TableRow key={client.client}>
                    <TableCell>{client.client}</TableCell>
                    <TableCell>{client.quotes}</TableCell>
                    <TableCell>{client.won}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight="bold">
                          {((client.won / client.quotes) * 100).toFixed(1)}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(client.won / client.quotes) * 100}
                          sx={{ width: 60 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>${client.value.toLocaleString()}</TableCell>
                    <TableCell>
                      <Typography color="success.main" fontWeight="bold">
                        {client.margin}%
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Area Performance */}
      <Card>
        <CardHeader
          title="Performance by Project Area"
          avatar={<PieChart />}
          titleTypographyProps={{ variant: "subtitle1" }}
        />
        <CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Area</TableCell>
                  <TableCell>Total Quotes</TableCell>
                  <TableCell>Total Value</TableCell>
                  <TableCell>Avg Quote Value</TableCell>
                  <TableCell>Avg Margin</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {areaPerformance.map((area) => (
                  <TableRow key={area.area}>
                    <TableCell>{area.area}</TableCell>
                    <TableCell>{area.quotes}</TableCell>
                    <TableCell>${area.value.toLocaleString()}</TableCell>
                    <TableCell>
                      ${(area.value / area.quotes).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Typography color="success.main" fontWeight="bold">
                        {area.avgMargin}%
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}
