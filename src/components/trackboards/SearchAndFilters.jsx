"use client";

import React from "react";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  Chip,
  IconButton,
  InputLabel,
  FormControl,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";

export default function SearchAndFilters({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
}) {
  const activeFilters = Object.entries(filters).filter(
    ([_, value]) =>
      value !== "" &&
      value !== "all-statuses" &&
      value !== "all-staff" &&
      value !== "all-clients" &&
      value !== "all-dates"
  );

  const clearFilters = () => {
    onFiltersChange({
      status: "all-statuses",
      assignedTo: "all-staff",
      client: "all-clients",
      dateRange: "all-dates",
    });
  };

  const removeFilter = (key) => {
    const defaultValues = {
      status: "all-statuses",
      assignedTo: "all-staff",
      client: "all-clients",
      dateRange: "all-dates",
    };
    onFiltersChange({
      ...filters,
      [key]: defaultValues[key] || "",
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Search Bar */}
      <div style={{ display: "flex", gap: "16px" }}>
        <TextField
          variant="outlined"
          placeholder="Search by job ID, client name, or project..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon style={{ marginRight: 8 }} />,
          }}
          fullWidth
        />
        <Button variant="outlined" startIcon={<FilterListIcon />}>
          Filters
        </Button>
      </div>

      {/* Filter Controls */}
      <div style={{ display: "flex", gap: "16px" }}>
        <FormControl style={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) =>
              onFiltersChange({ ...filters, status: e.target.value })
            }
          >
            <MenuItem value="all-statuses">All Statuses</MenuItem>
            <MenuItem value="to-start">To Start</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="on-hold">On Hold</MenuItem>
            <MenuItem value="complete">Complete</MenuItem>
            <MenuItem value="ready-dispatch">Ready for Dispatch</MenuItem>
            <MenuItem value="in-transit">In Transit</MenuItem>
            <MenuItem value="on-site">On Site</MenuItem>
            <MenuItem value="installed">Installed</MenuItem>
          </Select>
        </FormControl>

        <FormControl style={{ minWidth: 180 }}>
          <InputLabel>Assigned To</InputLabel>
          <Select
            value={filters.assignedTo}
            label="Assigned To"
            onChange={(e) =>
              onFiltersChange({ ...filters, assignedTo: e.target.value })
            }
          >
            <MenuItem value="all-staff">All Staff</MenuItem>
            <MenuItem value="john-smith">John Smith</MenuItem>
            <MenuItem value="sarah-wilson">Sarah Wilson</MenuItem>
            <MenuItem value="mike-johnson">Mike Johnson</MenuItem>
            <MenuItem value="team-a">Team A</MenuItem>
            <MenuItem value="team-b">Team B</MenuItem>
          </Select>
        </FormControl>

        <FormControl style={{ minWidth: 180 }}>
          <InputLabel>Client</InputLabel>
          <Select
            value={filters.client}
            label="Client"
            onChange={(e) =>
              onFiltersChange({ ...filters, client: e.target.value })
            }
          >
            <MenuItem value="all-clients">All Clients</MenuItem>
            <MenuItem value="acme-corp">ACME Corporation</MenuItem>
            <MenuItem value="tech-solutions">Tech Solutions Ltd</MenuItem>
            <MenuItem value="global-manufacturing">
              Global Manufacturing
            </MenuItem>
            <MenuItem value="premier-construction">
              Premier Construction
            </MenuItem>
          </Select>
        </FormControl>

        {activeFilters.length > 0 && (
          <Button
            variant="text"
            startIcon={<ClearIcon />}
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {activeFilters.map(([key, value]) => (
            <Chip
              key={key}
              label={`${key}: ${value}`}
              onDelete={() => removeFilter(key)}
              deleteIcon={<ClearIcon />}
              color="default"
            />
          ))}
        </div>
      )}
    </div>
  );
}
