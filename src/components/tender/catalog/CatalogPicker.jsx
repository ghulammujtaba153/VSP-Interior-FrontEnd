"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  TextField,
  Box,
  Chip,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { fetchCatalogSearch, tierHint } from "@/lib/catalogUtils";
import { formatNzdPrice } from "@/lib/priceBookUtils";

const toggleSx = {
  flexShrink: 0,
  "& .MuiToggleButton-root": {
    px: 2,
    py: 0.85,
    minWidth: 108,
    textTransform: "none",
    fontSize: "0.8125rem",
    fontWeight: 500,
    borderColor: "divider",
    gap: 0.5,
  },
};

const CatalogPicker = ({
  supplierId,
  value = null,
  onSelect,
  onClear,
  label = "Search catalog",
  size = "small",
  disabled = false,
  layout = "stacked",
}) => {
  const [source, setSource] = useState("pricebook");
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedOption = useMemo(() => {
    if (!value?.sku && !value?.name && !value?.finishMaterial) return null;
    return {
      source: value.sourceType === "inventory" ? "inventory" : "pricebook",
      sku: value.sku || value.code,
      name: value.description || value.name || value.finishMaterial || value.sku,
      ...value,
    };
  }, [value]);

  const loadOptions = useCallback(async (q) => {
    if (source === "pricebook" && !supplierId) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchCatalogSearch(axios, BASE_URL, {
        supplierId,
        q,
        source,
        limit: 30,
      });
      setOptions(data);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [supplierId, source]);

  useEffect(() => {
    const t = setTimeout(() => loadOptions(inputValue), 300);
    return () => clearTimeout(t);
  }, [inputValue, loadOptions]);

  const handleChange = (_, option) => {
    if (!option) {
      onClear?.();
      return;
    }
    onSelect?.(option);
  };

  const getOptionLabel = (opt) => {
    if (!opt) return "";
    const sku = opt.sku || "";
    const name = opt.name || opt.description || "";
    return sku ? `${sku} — ${name}` : name;
  };

  const toggleGroup = (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={source}
      onChange={(_, v) => v && setSource(v)}
      sx={toggleSx}
    >
      <ToggleButton value="pricebook">
        <MenuBookOutlinedIcon sx={{ fontSize: 16 }} />
        Pricebook
      </ToggleButton>
      <ToggleButton value="inventory">
        <Inventory2OutlinedIcon sx={{ fontSize: 16 }} />
        Stock
      </ToggleButton>
    </ToggleButtonGroup>
  );

  const autocomplete = (
    <Autocomplete
      size={size}
      fullWidth
      disabled={disabled || (source === "pricebook" && !supplierId)}
      options={options}
      loading={loading}
      value={selectedOption}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={(_, v) => setInputValue(v)}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={(a, b) =>
        a?.source === b?.source && String(a?.id) === String(b?.id)
      }
      slotProps={{
        paper: {
          sx: { mt: 0.5, boxShadow: 4 },
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={source === "pricebook" ? "SKU, name, or category…" : "Search warehouse stock…"}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "transparent",
            },
          }}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={`${option.source}-${option.id}`}>
          <Box py={0.25}>
            <Typography variant="body2" fontWeight={600} lineHeight={1.3}>
              {option.sku}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              {option.name}
            </Typography>
            <Box display="flex" gap={0.5} flexWrap="wrap">
              <Chip size="small" label={option.source} variant="outlined" sx={{ height: 22 }} />
              {option.price != null && (
                <Chip size="small" label={formatNzdPrice(option.price)} sx={{ height: 22 }} />
              )}
              {option.stockQty > 0 && (
                <Chip size="small" color="success" label={`${option.stockQty} in stock`} sx={{ height: 22 }} />
              )}
            </Box>
          </Box>
        </Box>
      )}
    />
  );

  return (
    <Box>
      {layout === "inline" ? (
        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          gap={1.5}
          alignItems="stretch"
          width="100%"
        >
          <Box flexShrink={0}>{toggleGroup}</Box>
          <Box flex={1} minWidth={0} width="100%">
            {autocomplete}
          </Box>
        </Box>
      ) : (
        <>
          <Box display="flex" gap={1} mb={1} flexWrap="wrap" alignItems="center">
            {toggleGroup}
          </Box>
          {autocomplete}
        </>
      )}

      {source === "pricebook" && !supplierId && (
        <Typography variant="caption" color="warning.main" display="block" mt={0.75}>
          Select a supplier above to search their pricebook.
        </Typography>
      )}

      {value?.priceTiers?.length > 1 && value?.quantity && (
        <Typography variant="caption" color="text.secondary" display="block" mt={0.75}>
          {tierHint(value.priceTiers, value.quantity)}
        </Typography>
      )}
      {value?.sourceType === "pricebook" && value?.stockQty > 0 && (
        <Typography variant="caption" color="success.main" display="block" mt={0.5}>
          {value.stockQty} in stock — switch to Stock to allocate from warehouse
        </Typography>
      )}
    </Box>
  );
};

export default CatalogPicker;
