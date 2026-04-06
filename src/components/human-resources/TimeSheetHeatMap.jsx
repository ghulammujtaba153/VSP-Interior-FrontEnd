"use client";

import React from 'react';
import { Box, Tooltip, Typography, Stack, useTheme } from '@mui/material';

const TimeSheetHeatMap = ({ data = [] }) => {
  const theme = useTheme();

  // Create a grid of dates for the last 365 days or current calendar year
  // For simplicity, let's create a 52-week grid (1 year approx)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Transform data into a frequency map by date
  const freqMap = data.reduce((acc, curr) => {
    const dateStr = curr.date ? new Date(curr.date).toISOString().split('T')[0] : '';
    if (dateStr) acc[dateStr] = (acc[dateStr] || 0) + 1;
    return acc;
  }, {});

  const getHeatColor = (count) => {
    if (!count) return theme.palette.mode === 'dark' ? 'rgba(155, 155, 155, 0.1)' : '#ebedf0';
    if (count === 1) return '#0e4429';
    if (count === 2) return '#006d32';
    if (count === 3) return '#26a641';
    return '#39d353'; // More than 3
  };

  const today = new Date();
  const currentYear = today.getFullYear();
  const startDate = new Date(currentYear, 0, 1); // January 1st of current year

  // Generate cells
  const cells = [];
  
  // To keep the grid aligned, we add empty placeholders if Jan 1st is not Sunday
  const firstDayOfWeek = startDate.getDay();
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push({ isPlaceholder: true });
  }

  let currentDate = new Date(startDate);
  const lastDayOfYear = new Date(currentYear, 11, 31);
  const endDate = today > lastDayOfYear ? today : lastDayOfYear;

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const count = freqMap[dateStr] || 0;
    
    cells.push({
      date: dateStr,
      count: count,
      day: currentDate.getDay(),
      month: currentDate.getMonth(),
      label: `${count} entries on ${currentDate.toLocaleDateString()}`
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Fill the rest of the last week with placeholders if needed
  while (cells.length % 7 !== 0) {
    cells.push({ isPlaceholder: true });
  }

  // Group by week (7 days)
  const columns = [];
  for (let i = 0; i < cells.length; i += 7) {
    columns.push(cells.slice(i, i + 7));
  }

  return (
    <Box sx={{ 
      p: 3, 
      bgcolor: 'background.paper', 
      borderRadius: 3, 
      boxShadow: 1, 
      width: '100%',
      overflow: 'hidden'
    }}>
      <Typography variant="subtitle1" fontWeight="600" mb={3} color="text.primary">
        Timesheet Activity {currentYear}
      </Typography>
      
      <Box sx={{ overflowX: 'auto', pb: 1 }}>
        <Stack direction="row" spacing={0.6} alignItems="flex-start" sx={{ minWidth: 'max-content' }}>
          {/* Day labels */}
          <Stack spacing={0.5} pt={3}>
            {days.map((day, idx) => (
              <Typography key={day} variant="caption" sx={{ height: 12, fontSize: '0.65rem', color: 'text.secondary', visibility: idx % 2 === 0 ? 'visible' : 'hidden' }}>
                {day}
              </Typography>
            ))}
          </Stack>

          {/* Heatmap Grid */}
          <Stack direction="row" spacing={0.5} sx={{ flexGrow: 1 }}>
            {columns.map((week, wIdx) => {
              // Show month label if any day in this week is the 1st of the month
              const dayOne = week.find(d => !d.isPlaceholder && new Date(d.date).getDate() === 1);
              
              return (
                <Stack 
                  key={wIdx} 
                  spacing={0.5} 
                  sx={{ 
                    // Add a larger margin if this is the start of a new month (except the first month)
                    ml: dayOne && wIdx !== 0 ? 1 : 0 
                  }}
                >
                  <Box sx={{ height: 20 }}>
                    {dayOne && (
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontWeight: 600 }}>
                        {months[dayOne.month]}
                      </Typography>
                    )}
                  </Box>
                  {week.map((day, dIdx) => {
                     if (day.isPlaceholder) {
                       return <Box key={dIdx} sx={{ width: 13, height: 13, borderRadius: '2px', bgcolor: 'transparent' }} />;
                     }
                     
                     const isFuture = new Date(day.date) > today;
                     return (
                      <Tooltip key={dIdx} title={isFuture ? 'Future date' : day.label} arrow>
                        <Box
                          sx={{
                            width: 13,
                            height: 13,
                            borderRadius: '2px',
                            bgcolor: isFuture ? (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') : getHeatColor(day.count),
                            cursor: isFuture ? 'default' : 'pointer',
                            '&:hover': { outline: isFuture ? 'none' : '1px solid gray' },
                            opacity: isFuture ? 0.3 : 1
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </Box>
      
      <Stack direction="row" justifyContent="space-between" mt={3} alignItems="center">
        <Typography variant="caption" color="text.secondary">
          Submissions for the year {currentYear}
        </Typography>
        <Stack direction="row" spacing={0.8} alignItems="center">
          <Typography variant="caption" color="text.secondary">Less</Typography>
          {[0, 1, 2, 3, 4].map(v => (
            <Box key={v} sx={{ width: 11, height: 11, borderRadius: '2px', bgcolor: getHeatColor(v) }} />
          ))}
          <Typography variant="caption" color="text.secondary">More</Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default TimeSheetHeatMap;
