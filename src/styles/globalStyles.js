// Global styling variables and configurations
export const globalStyles = {
  // Colors
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    success: '#2e7d32',
    warning: '#ed6c02',
    error: '#d32f2f',
    info: '#0288d1',
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
      tableHeader: '#f5f5f5',
      errorRow: '#fff3cd',
      hover: '#f5f5f5',
    },
  },

  // Spacing
  spacing: {
    xs: 0.5,
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
  },

  // Typography
  typography: {
    h1: {
      fontSize: '2.125rem',
      fontWeight: 400,
      lineHeight: 1.167,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 400,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 400,
      lineHeight: 1.167,
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 400,
      lineHeight: 1.235,
    },
    h5: {
      fontSize: '1.0625rem',
      fontWeight: 400,
      lineHeight: 1.334,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.43,
    },
  },

  // Modal styles
  modal: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "1200px",
    maxHeight: "90vh",
    bgcolor: "background.paper",
    p: 4,
    borderRadius: 2,
    overflow: "auto",
  },

  // Table styles
  table: {
    header: {
      backgroundColor: '#f5f5f5',
      fontWeight: 'bold',
    },
    row: {
      hover: {
        backgroundColor: '#f5f5f5',
      },
      error: {
        backgroundColor: '#fff3cd',
      },
    },
    cell: {
      padding: '8px 16px',
    },
  },

  // Button styles
  button: {
    small: {
      size: 'small',
      variant: 'outlined',
    },
    medium: {
      size: 'medium',
      variant: 'outlined',
    },
    large: {
      size: 'large',
      variant: 'outlined',
    },
  },

  // Form styles
  form: {
    field: {
      margin: 'normal',
      fullWidth: true,
    },
    spacing: {
      gap: 2,
      marginTop: 2,
    },
  },

  // Layout styles
  layout: {
    container: {
      padding: 2,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    searchSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    buttonGroup: {
      display: 'flex',
      gap: 1,
    },
  },

  // Card styles
  card: {
    elevation: 3,
    padding: 2,
  },

  // Chip styles
  chip: {
    size: 'small',
    variant: 'outlined',
  },

  // Icon styles
  icon: {
    small: {
      fontSize: 'small',
    },
    medium: {
      fontSize: 'medium',
    },
    large: {
      fontSize: 'large',
    },
  },
};

// Common component styles
export const componentStyles = {
  // Table header row
  tableHeaderRow: {
    backgroundColor: globalStyles.colors.background.tableHeader,
  },

  // Table data row
  tableDataRow: {
    '&:hover': {
      backgroundColor: globalStyles.colors.background.hover,
    },
  },

  // Error row styling
  errorRow: {
    backgroundColor: globalStyles.colors.background.errorRow,
  },

  // Action buttons container
  actionButtons: {
    display: 'flex',
    gap: 0.5,
  },

  // Search section
  searchSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },

  // Button group
  buttonGroup: {
    display: 'flex',
    gap: 1,
  },

  // Modal content
  modalContent: {
    position: 'relative',
    padding: 3,
  },

  // Form field
  formField: {
    margin: 'normal',
    fullWidth: true,
  },

  // Status chip
  statusChip: {
    size: 'small',
    variant: 'outlined',
  },

  // Expand/collapse button
  expandButton: {
    size: 'small',
    color: 'primary',
  },

  // Tooltip
  tooltip: {
    placement: 'top',
  },
};

// Export individual style objects for easy importing
export const { colors, spacing, typography, modal, table, button, form, layout, card, chip, icon } = globalStyles;
export const { tableHeaderRow, tableDataRow, errorRow, actionButtons, searchSection, buttonGroup, modalContent, formField, statusChip, expandButton, tooltip } = componentStyles;
