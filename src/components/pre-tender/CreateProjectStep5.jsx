"use client";

import { useEffect, useState, useCallback, memo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Card,
  CardContent,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

// Memoized TextField to prevent unnecessary re-renders
const MemoizedTextField = memo(({ fullWidth, label, value, onChange, size }) => (
  <TextField
    fullWidth={fullWidth}
    label={label}
    value={value}
    onChange={onChange}
    size={size}
  />
));

MemoizedTextField.displayName = 'MemoizedTextField';

const CreateProjectStep5 = ({ formData = {}, setFormData }) => {
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize form with default values if formData is empty
  useEffect(() => {
    if (!formData || Object.keys(formData).length === 0) {
      setIsInitializing(true);
      // Use setTimeout to prevent blocking the UI
      setTimeout(() => {
        setFormData({
        unitName: "",
        drawingNo: "",
        Revision: "",
        Measure: "",
        qunatity: "",
        unitType: "",
        unitLength: "",
        wasteOverRide: "",
        location: "",
        cabinetLookUp: [{
          code: "",
          description: "",
          measure: "",
          qunatity: "",
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
          qunatity: "",
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
          qunatity: "",
          mateialRate: "",
          materialTotal: "",
          grain: "",
          notes: ""
        }],
        trims: [{
          code: "",
          description: "",
          measure: "",
          qunatity: "",
          mateialRate: "",
          materialTotal: "",
          grain: "",
          notes: ""
        }],
        splitBattens: [{
          code: "",
          description: "",
          measure: "",
          qunatity: "",
          mateialRate: "",
          materialTotal: "",
          grain: "",
          notes: ""
        }],
        drawers: [{
          code: "",
          description: "",
          measure: "",
          qunatity: "",
          mateialRate: "",
          materialTotal: "",
          grain: "",
          notes: ""
        }],
        hinges: [{
          code: "",
          description: "",
          measure: "",
          qunatity: "",
          mateialRate: "",
          materialTotal: "",
          grain: "",
          notes: ""
        }],
        miscItems: [{
          description: "",
          measure: "",
          qunatity: "",
          mateialRate: "",
          materialTotal: "",
          grain: "",
          notes: ""
        }],
        buyInItems: [{
          description: "",
          measure: "",
          qunatity: "",
          mateialRate: "",
          materialTotal: "",
          grain: "",
          notes: ""
        }],
        other: {
          extraFreight: {
            description: "",
            extraQunatity: "",
            height: "",
            length: "",
            depth: "",
            measures: "",
            qunatity: "",
            rate: "",
            subTotal: "",
            notes: ""
          }, 
          draftingHours: {
            measures: "",
            qunatity: "",
            rate: "",
            subTotal: "",
            notes: ""
          },
        },
        extraLabourHours: {
          extraHourMachining: {
            measures: "",
            qunatity: "",
            rate: "",
            subTotal: "",
            notes: ""
          },
          extraHourAssembly: {
            measures: "",
            qunatity: "",
            rate: "",
            subTotal: "",
            notes: ""
          },
          extraHourSite: {
            measures: "",
            qunatity: "",
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
        code: "", description: "", measure: "", qunatity: "", carcaseFinish: "",
        externalFinish: "", mateialRate: "", materialTotal: "", grain: "", notes: ""
      },
      wallPanelling: {
        code: "", description: "", measure: "", qunatity: "", carcaseFinish: "",
        externalFinish: "", mateialRate: "", materialTotal: "", grain: "", notes: ""
      },
      hardwareLookUp: {
        code: "", description: "", measure: "", qunatity: "", mateialRate: "",
        materialTotal: "", grain: "", notes: ""
      },
      trims: {
        code: "", description: "", measure: "", qunatity: "", mateialRate: "",
        materialTotal: "", grain: "", notes: ""
      },
      splitBattens: {
        code: "", description: "", measure: "", qunatity: "", mateialRate: "",
        materialTotal: "", grain: "", notes: ""
      },
      drawers: {
        code: "", description: "", measure: "", qunatity: "", mateialRate: "",
        materialTotal: "", grain: "", notes: ""
      },
      hinges: {
        code: "", description: "", measure: "", qunatity: "", mateialRate: "",
        materialTotal: "", grain: "", notes: ""
      },
      miscItems: {
        description: "", measure: "", qunatity: "", mateialRate: "", materialTotal: "",
        grain: "", notes: ""
      },
      buyInItems: {
        description: "", measure: "", qunatity: "", mateialRate: "", materialTotal: "",
        grain: "", notes: ""
      }
    };
    return templates[section] || {};
  };

  const renderArraySection = (title, section, fields) => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {(form[section] || []).map((item, index) => (
          <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">{title} Item {index + 1}</Typography>
              <IconButton 
                onClick={() => removeArrayItem(section, index)}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              {fields.map(field => (
                <Grid item xs={12} sm={6} md={4} key={field}>
                  <TextField
                    fullWidth
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={item[field] || ''}
                    onChange={(e) => handleInputChange(section, field, e.target.value, index)}
                    size="small"
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
        <Button
          startIcon={<AddIcon />}
          onClick={() => addArrayItem(section)}
          variant="outlined"
          sx={{ mt: 1 }}
        >
          Add {title} Item
        </Button>
      </AccordionDetails>
    </Accordion>
  );

  const renderNestedSection = (title, section, fields) => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {fields.map(field => (
            <Grid item xs={12} sm={6} key={field}>
              <TextField
                fullWidth
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                value={form.other?.[section]?.[field] || ''}
                onChange={(e) => handleInputChange(`other.${section}`, field, e.target.value)}
                size="small"
              />
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  const renderLabourSection = (title, section, fields) => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {fields.map(field => (
            <Grid item xs={12} sm={6} key={field}>
              <TextField
                fullWidth
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                value={form.extraLabourHours?.[section]?.[field] || ''}
                onChange={(e) => handleInputChange(`extraLabourHours.${section}`, field, e.target.value)}
                size="small"
              />
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  const renderTotalsSection = (title, section, fields) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Grid container spacing={2}>
          {fields.map(field => (
            <Grid item xs={12} sm={6} md={4} key={field}>
              <TextField
                fullWidth
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                value={form.totals?.[section]?.[field] || ''}
                onChange={(e) => handleInputChange(`totals.${section}`, field, e.target.value)}
                size="small"
              />
            </Grid>
          ))}
        </Grid>
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

      <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
          Costing Sheet
        </Typography>

        {/* Basic Information */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>Basic Information</Typography>
          <Grid container spacing={2}>
            {['unitName', 'drawingNo', 'Revision', 'Measure', 'qunatity', 'unitType', 'unitLength', 'wasteOverRide', 'location'].map(field => (
              <Grid item xs={12} sm={6} md={4} key={field}>
                <MemoizedTextField
                  fullWidth
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={form[field] || ''}
                  onChange={(e) => handleBasicFieldChange(field, e.target.value)}
                  size="small"
                />
              </Grid>
            ))}
          </Grid>
        </Paper>

      {/* Array Sections */}
      {renderArraySection('Cabinet Lookup', 'cabinetLookUp', ['code', 'description', 'measure', 'qunatity', 'carcaseFinish', 'externalFinish', 'mateialRate', 'materialTotal', 'grain', 'notes'])}
      {renderArraySection('Wall Panelling', 'wallPanelling', ['code', 'description', 'measure', 'qunatity', 'carcaseFinish', 'externalFinish', 'mateialRate', 'materialTotal', 'grain', 'notes'])}
      {renderArraySection('Hardware Lookup', 'hardwareLookUp', ['code', 'description', 'measure', 'qunatity', 'mateialRate', 'materialTotal', 'grain', 'notes'])}
      {renderArraySection('Trims', 'trims', ['code', 'description', 'measure', 'qunatity', 'mateialRate', 'materialTotal', 'grain', 'notes'])}
      {renderArraySection('Split Battens', 'splitBattens', ['code', 'description', 'measure', 'qunatity', 'mateialRate', 'materialTotal', 'grain', 'notes'])}
      {renderArraySection('Drawers', 'drawers', ['code', 'description', 'measure', 'qunatity', 'mateialRate', 'materialTotal', 'grain', 'notes'])}
      {renderArraySection('Hinges', 'hinges', ['code', 'description', 'measure', 'qunatity', 'mateialRate', 'materialTotal', 'grain', 'notes'])}
      {renderArraySection('Misc Items', 'miscItems', ['description', 'measure', 'qunatity', 'mateialRate', 'materialTotal', 'grain', 'notes'])}
      {renderArraySection('Buy In Items', 'buyInItems', ['description', 'measure', 'qunatity', 'mateialRate', 'materialTotal', 'grain', 'notes'])}

      {/* Other Sections */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Other Costs</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {renderNestedSection('Extra Freight', 'extraFreight', ['description', 'extraQunatity', 'height', 'length', 'depth', 'measures', 'qunatity', 'rate', 'subTotal', 'notes'])}
          {renderNestedSection('Drafting Hours', 'draftingHours', ['measures', 'qunatity', 'rate', 'subTotal', 'notes'])}
        </AccordionDetails>
      </Accordion>

      {/* Extra Labour Hours */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Extra Labour Hours</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {renderLabourSection('Extra Hour Machining', 'extraHourMachining', ['measures', 'qunatity', 'rate', 'subTotal', 'notes'])}
          {renderLabourSection('Extra Hour Assembly', 'extraHourAssembly', ['measures', 'qunatity', 'rate', 'subTotal', 'notes'])}
          {renderLabourSection('Extra Hour Site', 'extraHourSite', ['measures', 'qunatity', 'rate', 'subTotal', 'notes'])}
        </AccordionDetails>
      </Accordion>

      {/* Totals Section */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>Totals</Typography>
        {renderTotalsSection('Materials', 'materials', ['quantity', 'cost', 'markup', 'sell', 'overRideMarkUp'])}
        {renderTotalsSection('Buy In Items', 'BuyInItems', ['quantity', 'cost', 'markup', 'sell', 'overRideMarkUp'])}
        {renderTotalsSection('Freight', 'freight', ['quantity', 'cost', 'markup', 'sell', 'overRideMarkUp'])}
        {renderTotalsSection('Drafting', 'drafting', ['quantity', 'cost', 'markup', 'sell', 'overRideMarkUp'])}
        {renderTotalsSection('Machining', 'machining', ['quantity', 'cost', 'markup', 'sell', 'overRideMarkUp'])}
        {renderTotalsSection('Assembly', 'assembly', ['quantity', 'cost', 'markup', 'sell', 'overRideMarkUp'])}
        {renderTotalsSection('Install', 'install', ['quantity', 'cost', 'markup', 'sell', 'overRideMarkUp'])}
      </Paper>
      </Box>
    </>
  );
};

export default CreateProjectStep5;
