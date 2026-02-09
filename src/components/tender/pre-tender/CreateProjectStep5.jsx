"use client";

import { useEffect, useState, useCallback, memo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  IconButton,
  Card,
  CardContent,
  CircularProgress,
  Backdrop,
  Tabs,
  Tab,
  Divider,
  Chip,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  Construction as ConstructionIcon,
  Hardware as HardwareIcon,
  AttachMoney as MoneyIcon,
  Info as InfoIcon,
  LibraryBooks as LibraryIcon,
  Build as BuildIcon,
} from "@mui/icons-material";

// Memoized TextField to prevent unnecessary re-renders
const MemoizedTextField = memo(({ fullWidth, label, value, onChange, size, type }) => (
  <TextField
    fullWidth={fullWidth}
    label={label}
    value={value}
    onChange={onChange}
    size={size}
    type={type}
    variant="outlined"
  />
));

MemoizedTextField.displayName = 'MemoizedTextField';

// Custom TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`costing-tabpanel-${index}`}
      aria-labelledby={`costing-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const CreateProjectStep5 = ({ formData = {}, setFormData }) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Initialize form with default values if formData is empty
  useEffect(() => {
    if (!formData || Object.keys(formData).length === 0) {
      setIsInitializing(true);
      setTimeout(() => {
        setFormData({
    unitName: "",
    drawingNo: "",
    Revision: "",
    Measure: "",
    quantity: "",
    unitType: "",
    unitLength: "",
    wasteOverRide: "",
    location: "",
    cabinetLookUp: [{
      code: "",
      description: "",
      measure: "",
      quantity: "",
      carcaseFinish: "",
      externalFinish: "",
      mateialRate: "",
      materialTotal: "",
      grain: "",
      notes: ""
    }],
    wallPanelling: [{
      code: "",
      description: "",
      measure: "",
      quantity: "",
      carcaseFinish: "",
      externalFinish: "",
      mateialRate: "",
      materialTotal: "",
      grain: "",
      notes: ""
    }],
    hardwareLookUp: [{
      code: "",
      description: "",
      measure: "",
      quantity: "",
      mateialRate: "",
      materialTotal: "",
      grain: "",
      notes: ""
    }],
    trims: [{
      code: "",
      description: "",
      measure: "",
      quantity: "",
      mateialRate: "",
      materialTotal: "",
      grain: "",
      notes: ""
    }],
    splitBattens: [{
      code: "",
      description: "",
      measure: "",
      quantity: "",
      mateialRate: "",
      materialTotal: "",
      grain: "",
      notes: ""
    }],
    drawers: [{
      code: "",
      description: "",
      measure: "",
      quantity: "",
      mateialRate: "",
      materialTotal: "",
      grain: "",
      notes: ""
    }],
    hinges: [{
      code: "",
      description: "",
      measure: "",
      quantity: "",
      mateialRate: "",
      materialTotal: "",
      grain: "",
      notes: ""
    }],
    miscItems: [{
      description: "",
      measure: "",
      quantity: "",
      mateialRate: "",
      materialTotal: "",
      grain: "",
      notes: ""
    }],
    buyInItems: [{
      description: "",
      measure: "",
      quantity: "",
      mateialRate: "",
      materialTotal: "",
      grain: "",
      notes: ""
    }],
    other: {
      extraFreight: {
        description: "",
        extraQuantity: "",
        height: "",
        length: "",
        depth: "",
        measures: "",
        quantity: "",
        rate: "",
        subTotal: "",
        notes: ""
      }, 
      draftingHours: {
        measures: "",
        quantity: "",
        rate: "",
        subTotal: "",
        notes: ""
      },
    },
    extraLabourHours: {
      extraHourMachining: {
        measures: "",
        quantity: "",
        rate: "",
        subTotal: "",
        notes: ""
      },
      extraHourAssembly: {
        measures: "",
        quantity: "",
        rate: "",
        subTotal: "",
        notes: ""
      },
      extraHourSite: {
        measures: "",
        quantity: "",
        rate: "",
        subTotal: "",
        notes: ""
      },
    },
    totals: {
      materials: {
        quantity: "",
        cost: "",
        markup: "",
        sell: "",
        overRideMarkUp: "",
      },
      BuyInItems: {
        quantity: "",
        cost: "",
        markup: "",
        sell: "",
        overRideMarkUp: "",
      },
      freight: {
        quantity: "",
        cost: "",
        markup: "",
        sell: "",
        overRideMarkUp: "",
      },
      drafting: {
        quantity: "",
        cost: "",
        markup: "",
        sell: "",
        overRideMarkUp: "",
      },
      machining: {
        quantity: "",
        cost: "",
        markup: "",
        sell: "",
        overRideMarkUp: "",
      },
      assembly: {
        quantity: "",
        cost: "",
        markup: "",
        sell: "",
        overRideMarkUp: "",
      },
      install: {
        quantity: "",
        cost: "",
        markup: "",
        sell: "",
        overRideMarkUp: "",
      }
    }
  });
        setIsInitializing(false);
      }, 0);
    }
  }, []);

  const form = formData || {};

  // Optimized handler for basic fields (non-nested)
  const handleBasicFieldChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, [setFormData]);

  // Optimized handler for all other fields
  const handleInputChange = useCallback((section, field, value, index = null) => {
    setFormData(prev => {
      const currentPrev = prev || {};
      if (index !== null && Array.isArray(currentPrev[section])) {
        const updatedArray = [...currentPrev[section]];
        updatedArray[index] = { ...updatedArray[index], [field]: value };
        return { ...currentPrev, [section]: updatedArray };
      } else if (section.includes('.')) {
        const [parent, child, subChild] = section.split('.');
        if (subChild) {
          return {
            ...currentPrev,
            [parent]: {
              ...currentPrev[parent],
              [child]: {
                ...currentPrev[parent]?.[child],
                [subChild]: {
                  ...currentPrev[parent]?.[child]?.[subChild],
                  [field]: value
                }
              }
            }
          };
        }
        return {
          ...currentPrev,
          [parent]: {
            ...currentPrev[parent],
            [child]: {
              ...currentPrev[parent]?.[child],
              [field]: value
            }
          }
        };
      }
      return { ...currentPrev, [section]: { ...currentPrev[section], [field]: value } };
    });
  }, [setFormData]);

  const addArrayItem = useCallback((section) => {
    setFormData(prev => {
      const currentPrev = prev || {};
      const template = getArrayTemplate(section);
      return { ...currentPrev, [section]: [...(currentPrev[section] || []), template] };
    });
  }, [setFormData]);

  const removeArrayItem = useCallback((section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  }, [setFormData]);

  const getArrayTemplate = (section) => {
    const templates = {
      cabinetLookUp: {
        code: "", description: "", measure: "", quantity: "", carcaseFinish: "",
        externalFinish: "", mateialRate: "", materialTotal: "", grain: "", notes: ""
      },
      wallPanelling: {
        code: "", description: "", measure: "", quantity: "", carcaseFinish: "",
        externalFinish: "", mateialRate: "", materialTotal: "", grain: "", notes: ""
      },
      hardwareLookUp: {
        code: "", description: "", measure: "", quantity: "", mateialRate: "",
        materialTotal: "", grain: "", notes: ""
      },
      trims: {
        code: "", description: "", measure: "", quantity: "", mateialRate: "",
        materialTotal: "", grain: "", notes: ""
      },
      splitBattens: {
        code: "", description: "", measure: "", quantity: "", mateialRate: "",
        materialTotal: "", grain: "", notes: ""
      },
      drawers: {
        code: "", description: "", measure: "", quantity: "", mateialRate: "",
        materialTotal: "", grain: "", notes: ""
      },
      hinges: {
        code: "", description: "", measure: "", quantity: "", mateialRate: "",
        materialTotal: "", grain: "", notes: ""
      },
      miscItems: {
        description: "", measure: "", quantity: "", mateialRate: "", materialTotal: "",
        grain: "", notes: ""
      },
      buyInItems: {
        description: "", measure: "", quantity: "", mateialRate: "", materialTotal: "",
        grain: "", notes: ""
      }
    };
    return templates[section] || {};
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderArraySection = (title, section, fields) => (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
          {title}
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => addArrayItem(section)}
          variant="contained"
          size="small"
          sx={{ borderRadius: 2 }}
        >
          Add Item
        </Button>
      </Box>
      
      {(form[section] || []).map((item, index) => (
        <Card 
          key={index} 
          sx={{ 
            mb: 2, 
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 1,
            '&:hover': {
              boxShadow: 3,
              borderColor: 'primary.light'
            },
            transition: 'all 0.3s'
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Chip 
                label={`Item #${index + 1}`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
              <IconButton 
                onClick={() => removeArrayItem(section, index)}
                color="error"
                size="small"
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'error.lighter',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              {fields.map(field => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={field}>
                  <MemoizedTextField
                    fullWidth
                    label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                    value={item[field] || ''}
                    onChange={(e) => handleInputChange(section, field, e.target.value, index)}
                    size="small"
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      ))}
      
      {(!form[section] || form[section].length === 0) && (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            backgroundColor: 'grey.50',
            border: '2px dashed',
            borderColor: 'grey.300'
          }}
        >
          <Typography color="text.secondary">
            No items added yet. Click "Add Item" to start.
          </Typography>
        </Paper>
      )}
    </Box>
  );

  const renderNestedSection = (title, section, fields, icon) => (
    <Card sx={{ mb: 3, boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {fields.map(field => (
            <Grid item xs={12} sm={6} md={4} key={field}>
              <MemoizedTextField
                fullWidth
                label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                value={form.other?.[section]?.[field] || ''}
                onChange={(e) => handleInputChange(`other.${section}`, field, e.target.value)}
                size="small"
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderLabourSection = (title, section, fields) => (
    <Card sx={{ mb: 2, boxShadow: 1 }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
          {title}
        </Typography>
        <Grid container spacing={2}>
          {fields.map(field => (
            <Grid item xs={12} sm={6} md={4} key={field}>
              <MemoizedTextField
                fullWidth
                label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                value={form.extraLabourHours?.[section]?.[field] || ''}
                onChange={(e) => handleInputChange(`extraLabourHours.${section}`, field, e.target.value)}
                size="small"
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderTotalsCard = (title, section, fields) => (
    <Card 
      sx={{ 
        height: '100%',
        boxShadow: 2,
        border: '1px solid',
        borderColor: 'primary.light',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)'
        },
        transition: 'all 0.3s'
      }}
    >
      <CardContent>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            fontWeight: 600, 
            color: 'primary.main',
            borderBottom: '2px solid',
            borderColor: 'primary.main',
            pb: 1,
            mb: 2
          }}
        >
          {title}
        </Typography>
        <Stack spacing={2}>
          {fields.map(field => (
            <MemoizedTextField
              key={field}
                fullWidth
              label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
              value={form.totals?.[section]?.[field] || ''}
                onChange={(e) => handleInputChange(`totals.${section}`, field, e.target.value)}
                size="small"
              type={field.includes('quantity') || field.includes('cost') || field.includes('markup') || field.includes('sell') ? 'number' : 'text'}
              />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isInitializing}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Box sx={{ width: '100%' }}>
        {/* Header */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 3, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Project Costing Sheet
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Comprehensive cost breakdown and materials management
      </Typography>
        </Paper>

        {/* Basic Information Section */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <InfoIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Basic Information
            </Typography>
          </Box>
        <Grid container spacing={2}>
          {['unitName', 'drawingNo', 'Revision', 'Measure', 'quantity', 'unitType', 'unitLength', 'wasteOverRide', 'location'].map(field => (
            <Grid item xs={12} sm={6} md={4} key={field}>
                <MemoizedTextField
                fullWidth
                  label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                value={form[field] || ''}
                  onChange={(e) => handleBasicFieldChange(field, e.target.value)}
                size="small"
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

        {/* Tabs Section */}
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 64,
                fontSize: '0.95rem',
                fontWeight: 500,
              }
            }}
          >
            <Tab icon={<CategoryIcon />} iconPosition="start" label="Materials & Cabinets" />
            <Tab icon={<HardwareIcon />} iconPosition="start" label="Hardware & Trims" />
            <Tab icon={<BuildIcon />} iconPosition="start" label="Additional Items" />
            <Tab icon={<ConstructionIcon />} iconPosition="start" label="Other Costs" />
            <Tab icon={<MoneyIcon />} iconPosition="start" label="Totals & Summary" />
          </Tabs>

          {/* Tab Panel 0: Materials & Cabinets */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ p: 2 }}>
      {renderArraySection('Cabinet Lookup', 'cabinetLookUp', ['code', 'description', 'measure', 'quantity', 'carcaseFinish', 'externalFinish', 'mateialRate', 'materialTotal', 'grain', 'notes'])}
      {renderArraySection('Wall Panelling', 'wallPanelling', ['code', 'description', 'measure', 'quantity', 'carcaseFinish', 'externalFinish', 'mateialRate', 'materialTotal', 'grain', 'notes'])}
            </Box>
          </TabPanel>

          {/* Tab Panel 1: Hardware & Trims */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ p: 2 }}>
      {renderArraySection('Hardware Lookup', 'hardwareLookUp', ['code', 'description', 'measure', 'quantity', 'mateialRate', 'materialTotal', 'grain', 'notes'])}
      {renderArraySection('Trims', 'trims', ['code', 'description', 'measure', 'quantity', 'mateialRate', 'materialTotal', 'grain', 'notes'])}
              {renderArraySection('Hinges', 'hinges', ['code', 'description', 'measure', 'quantity', 'mateialRate', 'materialTotal', 'grain', 'notes'])}
            </Box>
          </TabPanel>

          {/* Tab Panel 2: Additional Items */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ p: 2 }}>
      {renderArraySection('Split Battens', 'splitBattens', ['code', 'description', 'measure', 'quantity', 'mateialRate', 'materialTotal', 'grain', 'notes'])}
      {renderArraySection('Drawers', 'drawers', ['code', 'description', 'measure', 'quantity', 'mateialRate', 'materialTotal', 'grain', 'notes'])}
      {renderArraySection('Misc Items', 'miscItems', ['description', 'measure', 'quantity', 'mateialRate', 'materialTotal', 'grain', 'notes'])}
      {renderArraySection('Buy In Items', 'buyInItems', ['description', 'measure', 'quantity', 'mateialRate', 'materialTotal', 'grain', 'notes'])}
            </Box>
          </TabPanel>

          {/* Tab Panel 3: Other Costs */}
          <TabPanel value={activeTab} index={3}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                Additional Costs
              </Typography>
              {renderNestedSection('Extra Freight', 'extraFreight', ['description', 'extraQuantity', 'height', 'length', 'depth', 'measures', 'quantity', 'rate', 'subTotal', 'notes'], <LibraryIcon color="primary" />)}
              {renderNestedSection('Drafting Hours', 'draftingHours', ['measures', 'quantity', 'rate', 'subTotal', 'notes'], <BuildIcon color="primary" />)}

              <Typography variant="h6" sx={{ mt: 4, mb: 3, fontWeight: 600, color: 'primary.main' }}>
                Extra Labour Hours
              </Typography>
          {renderLabourSection('Extra Hour Machining', 'extraHourMachining', ['measures', 'quantity', 'rate', 'subTotal', 'notes'])}
          {renderLabourSection('Extra Hour Assembly', 'extraHourAssembly', ['measures', 'quantity', 'rate', 'subTotal', 'notes'])}
          {renderLabourSection('Extra Hour Site', 'extraHourSite', ['measures', 'quantity', 'rate', 'subTotal', 'notes'])}
            </Box>
          </TabPanel>

          {/* Tab Panel 4: Totals */}
          <TabPanel value={activeTab} index={4}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 700, color: 'primary.main' }}>
                Cost Summary & Totals
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={4}>
                  {renderTotalsCard('Materials', 'materials', ['quantity', 'cost', 'markup', 'sell', 'overRideMarkUp'])}
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  {renderTotalsCard('Buy In Items', 'BuyInItems', ['quantity', 'cost', 'markup', 'sell', 'overRideMarkUp'])}
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  {renderTotalsCard('Freight', 'freight', ['quantity', 'cost', 'markup', 'sell', 'overRideMarkUp'])}
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  {renderTotalsCard('Drafting', 'drafting', ['quantity', 'cost', 'markup', 'sell', 'overRideMarkUp'])}
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  {renderTotalsCard('Machining', 'machining', ['quantity', 'cost', 'markup', 'sell', 'overRideMarkUp'])}
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  {renderTotalsCard('Assembly', 'assembly', ['quantity', 'cost', 'markup', 'sell', 'overRideMarkUp'])}
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  {renderTotalsCard('Install', 'install', ['quantity', 'cost', 'markup', 'sell', 'overRideMarkUp'])}
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
      </Paper>
      </Box>
    </>
  );
};

export default CreateProjectStep5;
