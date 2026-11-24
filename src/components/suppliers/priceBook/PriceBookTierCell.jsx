"use client";

import React, { useState } from "react";
import { Box, Chip, Collapse, IconButton, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { formatNzdPrice, formatTierLabel, formatTierSummary } from "@/lib/priceBookUtils";

const PriceBookTierCell = ({ tiers = [], basePrice }) => {
  const [open, setOpen] = useState(false);
  const list = Array.isArray(tiers) ? tiers : [];
  const hasTiers = list.length > 0;

  if (!hasTiers) {
    return <Typography variant="body2">{formatNzdPrice(basePrice)}</Typography>;
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={0.5}>
        <Typography variant="body2" fontWeight={500}>
          {formatTierSummary(list)}
        </Typography>
        {list.length > 1 && (
          <IconButton size="small" onClick={() => setOpen(!open)}>
            <ExpandMoreIcon
              fontSize="small"
              sx={{ transform: open ? "rotate(180deg)" : "none", transition: "0.2s" }}
            />
          </IconButton>
        )}
      </Box>
      <Collapse in={open || list.length === 1}>
        <Box mt={0.5} display="flex" flexDirection="column" gap={0.5}>
          {list.map((tier, i) => (
            <Chip key={i} size="small" variant="outlined" label={formatTierLabel(tier)} />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default PriceBookTierCell;
