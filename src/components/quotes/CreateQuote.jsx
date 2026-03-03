"use client"

import Link from "next/link"
import { Box, Button, Typography, Card, CardContent } from "@mui/material"

export const CreateQuote = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 150px)",
        p: 4,
      }}
    >
      <Card 
        sx={{ 
          maxWidth: 500, 
          width: "100%", 
          borderRadius: "20px",
          backgroundImage: 'none',
          boxShadow: (theme) => theme.palette.mode === 'dark' 
            ? '0 10px 30px rgba(0, 0, 0, 0.4)' 
            : theme.shadows[3]
        }}
      >
        <CardContent sx={{ p: { xs: 4, sm: 6 }, textAlign: "center" }}>
          {/* Feature Icon */}
          <Box
            sx={{
              width: 80,
              height: 80,
              margin: "0 auto 24px",
              background: (theme) => theme.palette.primary.main,
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "2.5rem",
              boxShadow: (theme) => `0 8px 16px ${theme.palette.primary.main}33`,
            }}
          >
            💼
          </Box>

          {/* Title */}
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            sx={{
              color: "primary.main",
              mb: 2,
              fontSize: { xs: '1.75rem', sm: '2.125rem' }
            }}
          >
            Quote Management
          </Typography>

          {/* Description */}
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              mb: 4, 
              fontSize: "1.1rem",
              lineHeight: 1.6,
            }}
          >
            Streamline your quote creation process. Create new quotes, review past ones, 
            or add variations to existing projects with ease.
          </Typography>

          {/* Action Buttons */}
          <Box display="flex" flexDirection="column" gap={2.5}>
            <Button
              component={Link}
              href="/project/form"
              variant="contained"
              fullWidth
              size="large"
              startIcon={<Box sx={{ fontSize: "1.2rem" }}>✨</Box>}
              sx={{
                py: 2,
                borderRadius: "12px",
                fontSize: "1.05rem",
                textTransform: "none",
                fontWeight: 600,
                boxShadow: (theme) => `0 4px 12px ${theme.palette.primary.main}40`,
                '&:hover': {
                  boxShadow: (theme) => `0 6px 16px ${theme.palette.primary.main}60`,
                }
              }}
            >
              Create New Quote
            </Button>

            <Button
              component={Link}
              href="/project"
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<Box sx={{ fontSize: "1.2rem" }}>📋</Box>}
              sx={{
                py: 2,
                borderRadius: "12px",
                fontSize: "1.05rem",
                textTransform: "none",
                fontWeight: 600,
                borderWidth: '1.5px',
                '&:hover': {
                  borderWidth: '1.5px',
                }
              }}
            >
              View Past Quotes
            </Button>

            <Button
              component={Link}
              href="/project/variations"
              variant="outlined"
              color="secondary"
              fullWidth
              size="large"
              startIcon={<Box sx={{ fontSize: "1.2rem" }}>🔄</Box>}
              sx={{
                py: 2,
                borderRadius: "12px",
                fontSize: "1.05rem",
                textTransform: "none",
                fontWeight: 600,
                borderWidth: '1.5px',
                '&:hover': {
                  borderWidth: '1.5px',
                }
              }}
            >
              Add Variations
            </Button>
          </Box>

          {/* Additional Info */}
          <Typography 
            variant="caption" 
            color="text.disabled"
            sx={{ 
              mt: 4, 
              display: "block",
            }}
          >
            Manage all your quotes in one place
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}