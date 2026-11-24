"use client";

import React, { Suspense } from "react";
import { Container, CircularProgress, Box } from "@mui/material";
import HumanResourcePageInner from "./HumanResourcePageInner";

export default function Page() {
  return (
    <Suspense fallback={
      <Container sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    }>
      <HumanResourcePageInner />
    </Suspense>
  );
}
