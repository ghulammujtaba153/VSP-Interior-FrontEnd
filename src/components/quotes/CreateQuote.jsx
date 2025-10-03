"use client"

import Link from "next/link"
import { Box, Button, Typography, Paper, Container } from "@mui/material"
import { styled } from "@mui/material/styles"

const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  // background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  display: "flex",
  alignItems: "center",
  position: "relative",
  overflow: "hidden",
}))

const BackgroundPattern = styled(Box)({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
  opacity: 0.3,
})

const ContentCard = styled(Paper)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  borderRadius: "24px",
  padding: theme.spacing(6),
  textAlign: "center",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  maxWidth: 500,
  width: "100%",
  position: "relative",
  zIndex: 1,
}))

const FeatureIcon = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  margin: "0 auto 24px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  borderRadius: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  fontSize: "2rem",
  boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)",
}))

const ActionButton = styled(Button)(({ theme, variant }) => ({
  padding: theme.spacing(2),
  fontSize: "1.1rem",
  borderRadius: "16px",
  fontWeight: 600,
  textTransform: "none",
  transition: "all 0.3s ease",
  ...(variant === "contained" && {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 12px 35px rgba(102, 126, 234, 0.4)",
    },
  }),
  ...(variant === "outlined" && {
    borderWidth: "2px",
    "&:hover": {
      transform: "translateY(-2px)",
      borderWidth: "2px",
    },
  }),
}))

export const CreateQuote = () => {
  return (
    <HeroSection>
      {/* <BackgroundPattern /> */}
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            py: 4,
          }}
        >
          <ContentCard elevation={0}>
            {/* Feature Icon */}
            <FeatureIcon>
              💼
            </FeatureIcon>

            {/* Title */}
            <Typography 
              variant="h3" 
              fontWeight="bold" 
              gutterBottom
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 2,
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
              <ActionButton
                component={Link}
                href="/project/form"
                variant="contained"
                color="primary"
                size="large"
                startIcon={
                  <Box sx={{ fontSize: "1.2rem" }}>
                    ✨
                  </Box>
                }
              >
                Create New Quote
              </ActionButton>

              <ActionButton
                component={Link}
                href="/project"
                variant="outlined"
                color="primary"
                size="large"
                startIcon={
                  <Box sx={{ fontSize: "1.2rem" }}>
                    📋
                  </Box>
                }
              >
                View Past Quotes
              </ActionButton>

              <ActionButton
                component={Link}
                href="/project/variations"
                variant="outlined"
                color="secondary"
                size="large"
                startIcon={
                  <Box sx={{ fontSize: "1.2rem" }}>
                    🔄
                  </Box>
                }
              >
                Add Variations
              </ActionButton>
            </Box>

            {/* Additional Info */}
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                mt: 4, 
                display: "block",
                opacity: 0.7,
              }}
            >
              Manage all your quotes in one place
            </Typography>
          </ContentCard>
        </Box>
      </Container>
    </HeroSection>
  )
}