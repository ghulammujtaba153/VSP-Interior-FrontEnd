'use client'

import React from 'react'
import { Box } from '@mui/material'

const Loader = () => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: 'background.default'
      }}
    >
      <Box sx={{ display: 'flex', gap: 1 }}>
        {[0, 1, 2, 3].map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 12,
              height: 12,
              borderRadius: 1,
              backgroundColor: 'primary.main',
              animation: `snake 0.8s ${index * 0.1}s infinite ease-in-out`
            }}
          />
        ))}
      </Box>

      {/* Animation keyframes */}
      <style jsx global>{`
        @keyframes snake {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.5);
            opacity: 1;
          }
        }
      `}</style>
    </Box>
  )
}

export default Loader
