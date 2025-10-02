"use client"

import Link from "next/link"
import { Box, Button } from "@mui/material"

export const CreateQuote = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Button
        component={Link}
        href="/project/form"
        variant="outlined"
        color="primary"
      >
        Create Quote
      </Button>

      {/* <Button
        component={Link}
        href="/quotes/amend"
        variant="outlined"
      >
        Amend Existing Quote
      </Button> */}

      <Button
        component={Link}
        href="/project"
        variant="outlined"
      >
        View Past Quotes
      </Button>

      <Button
        component={Link}
        href="/project/variations"
        variant="outlined"
      >
        Add Variations
      </Button>
    </Box>
  )
}
