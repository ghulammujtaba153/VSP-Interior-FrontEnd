"use client"

import Loader from '@/components/loader/Loader'
import { BASE_URL } from '@/configs/url'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  ArrowRightAlt as ArrowIcon,
  Download as DownloadIcon,
  Compare as CompareIcon,
  Person as PersonIcon,
  LocalShipping as SupplierIcon
} from '@mui/icons-material'
import Link from 'next/link'

const rateTypes = [
  {
    type: "Material",
    label: "Material",
    fields: [
      { name: "markup", label: "Material Markup %", placeholder: "Enter material markup %" },
      { name: "cost", label: "Material Cost", placeholder: "Enter material cost" },
      { name: "sell", label: "Material Sell Price", placeholder: "Enter material sell price" },
    ],
  },
  {
    type: "Hardware",
    label: "Hardware",
    fields: [
      { name: "markup", label: "Hardware Markup %", placeholder: "Enter hardware markup %" },
      { name: "cost", label: "Hardware Cost", placeholder: "Enter hardware cost" },
      { name: "sell", label: "Hardware Sell Price", placeholder: "Enter hardware sell price" },
    ],
  },
  {
    type: "BuyIn",
    label: "Buy-in Item",
    fields: [
      { name: "markup", label: "Buy-in Item Markup %", placeholder: "Enter buy-in item markup %" },
      { name: "cost", label: "Buy-in Item Cost", placeholder: "Enter buy-in item cost" },
      { name: "sell", label: "Buy-in Item Sell Price", placeholder: "Enter buy-in item sell price" },
    ],
  },
  {
    type: "Freight",
    label: "Freight",
    fields: [
      { name: "hourlyRate", label: "Freight Rate per M3", placeholder: "Enter freight rate per M3" },
      { name: "cost", label: "Freight Cost", placeholder: "Enter freight cost" },
      { name: "sell", label: "Freight Sell Price", placeholder: "Enter freight sell price" },
    ],
  },
  {
    type: "ShopDrawing",
    label: "Shop Drawing",
    fields: [
      { name: "hourlyRate", label: "Shop Drawing Hourly Rate", placeholder: "Enter shop drawing hourly rate" },
      { name: "cost", label: "Shop Drawing Cost", placeholder: "Enter shop drawing cost" },
      { name: "sell", label: "Shop Drawing Sell Price", placeholder: "Enter shop drawing sell price" },
    ],
  },
  {
    type: "Machining",
    label: "Machining",
    fields: [
      { name: "hourlyRate", label: "Machining Hourly Rate", placeholder: "Enter machining hourly rate" },
      { name: "cost", label: "Machining Cost", placeholder: "Enter machining cost" },
      { name: "sell", label: "Machining Sell Price", placeholder: "Enter machining sell price" },
    ],
  },
  {
    type: "Assembly",
    label: "Assembly",
    fields: [
      { name: "hourlyRate", label: "Assembly Hourly Rate", placeholder: "Enter assembly hourly rate" },
      { name: "cost", label: "Assembly Cost", placeholder: "Enter assembly cost" },
      { name: "sell", label: "Assembly Sell Price", placeholder: "Enter assembly sell price" },
    ],
  },
  {
    type: "Installation",
    label: "Installation",
    fields: [
      { name: "hourlyRate", label: "Installation Hourly Rate", placeholder: "Enter installation hourly rate" },
      { name: "cost", label: "Installation Cost", placeholder: "Enter installation cost" },
      { name: "sell", label: "Installation Sell Price", placeholder: "Enter installation sell price" },
    ],
  },
];

const Page = () => {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${BASE_URL}/api/project-setup/get/amend/${id}`)
      setData(res.data.data || [])
    } catch (error) {
      toast.error("Error fetching amendment details")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetch()
  }, [id])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderRateComparison = (previousRates, updatedRates) => {
    return (
      <Grid container spacing={3}>
        {/* Previous Rates Table */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '2px solid', borderColor: 'grey.400', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CompareIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Previous Rates
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Rate Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Markup %</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Cost</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Sell Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rateTypes.map((rateType) => {
                      const prevRate = previousRates?.find(rate => rate.type === rateType.type);
                      
                      return (
                        <TableRow key={rateType.type} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {rateType.label}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right' }}>
                            <Typography variant="body2">
                              {prevRate?.markup || 0}%
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right' }}>
                            <Typography variant="body2">
                              ${prevRate?.cost || 0}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right' }}>
                            <Typography variant="body2">
                              ${prevRate?.sell || 0}
                            </Typography>
                          </TableCell>
                          
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Updated Rates Table */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '2px solid', borderColor: 'primary.main', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CompareIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="primary">
                  Updated Rates
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Rate Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Markup %</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Cost</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Sell Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rateTypes.map((rateType) => {
                      const updatedRate = updatedRates?.find(rate => rate.type === rateType.type);
                      const prevRate = previousRates?.find(rate => rate.type === rateType.type);
                      const hasChanges = thisRateHasChanges(prevRate, updatedRate, rateType);
                      
                      return (
                        <TableRow 
                          key={rateType.type} 
                          hover
                          sx={{ 
                            backgroundColor: hasChanges ? 'warning.light' : 'transparent',
                            '&:hover': {
                              backgroundColor: hasChanges ? 'warning.light' : 'grey.50'
                            }
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {rateType.label}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right' }}>
                            <RateComparisonCell 
                              previous={prevRate?.markup} 
                              current={updatedRate?.markup} 
                              suffix="%"
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right' }}>
                            <RateComparisonCell 
                              previous={prevRate?.cost} 
                              current={updatedRate?.cost} 
                              prefix="$"
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right' }}>
                            <RateComparisonCell 
                              previous={prevRate?.sell} 
                              current={updatedRate?.sell} 
                              prefix="$"
                            />
                          </TableCell>
                          
                          
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const RateComparisonCell = ({ previous, current, prefix = "", suffix = "", emptyValue = "0" }) => {
    const hasChanged = previous !== current;
    const displayValue = current !== undefined && current !== null ? current : emptyValue;
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {hasChanged && previous !== undefined && (
          <Typography 
            variant="caption" 
            sx={{ 
              textDecoration: 'line-through', 
              color: 'text.secondary',
              lineHeight: 1
            }}
          >
            {prefix}{previous || emptyValue}{suffix}
          </Typography>
        )}
        <Typography 
          variant="body2" 
          fontWeight={hasChanged ? 'bold' : 'normal'}
          color={hasChanged ? 'success.main' : 'text.primary'}
          sx={{ lineHeight: 1.2 }}
        >
          {prefix}{displayValue}{suffix}
        </Typography>
      </Box>
    );
  };

  const thisRateHasChanges = (prevRate, updatedRate, rateType) => {
    if (!prevRate && !updatedRate) return false;
    if (!prevRate || !updatedRate) return true;
    
    return rateType.fields.some(field => 
      prevRate[field.name] !== updatedRate[field.name]
    );
  };

  const renderComparison = (previous, updated, title, fields) => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '2px solid', borderColor: 'grey.400' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="text.secondary">
                Previous {title}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Field</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fields.map((field) => (
                      <TableRow key={field.key} hover>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {field.label}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {previous?.[field.key] || 'N/A'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '2px solid', borderColor: 'primary.main' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Updated {title}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Field</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fields.map((field) => {
                      const prevValue = previous?.[field.key] || 'N/A';
                      const updatedValue = updated?.[field.key] || 'N/A';
                      const hasChanged = prevValue !== updatedValue;

                      return (
                        <TableRow 
                          key={field.key} 
                          hover
                          sx={{ 
                            backgroundColor: hasChanged ? 'warning.light' : 'transparent',
                            '&:hover': {
                              backgroundColor: hasChanged ? 'warning.light' : 'grey.50'
                            }
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {field.label}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {hasChanged && (
                                <>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                                  >
                                    {prevValue}
                                  </Typography>
                                  <ArrowIcon color="warning" fontSize="small" />
                                </>
                              )}
                              <Typography 
                                variant="body2" 
                                fontWeight={hasChanged ? 'bold' : 'normal'}
                                color={hasChanged ? 'success.main' : 'text.primary'}
                              >
                                {updatedValue}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            {hasChanged && (
                              <Chip label="Changed" color="warning" size="small" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderClientSupplierInfo = (previousData, updatedData) => {
    const prevClient = previousData?.project?.client;
    const updatedClient = updatedData?.project?.client;
    
    return (
      <Grid container spacing={3}>
        {/* Client Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
            <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Client Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ border: '2px solid', borderColor: 'grey.400' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="text.secondary">
                    Previous Client
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Field</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {prevClient ? (
                          [
                            { key: 'companyName', label: 'Company Name', value: prevClient.companyName },
                            { key: 'emailAddress', label: 'Email', value: prevClient.emailAddress },
                            { key: 'phoneNumber', label: 'Phone', value: prevClient.phoneNumber },
                            { key: 'address', label: 'Address', value: prevClient.address },
                            { key: 'postCode', label: 'Post Code', value: prevClient.postCode },
                          ].map((field) => (
                            <TableRow key={field.key} hover>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {field.label}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {field.value || 'N/A'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2} align="center">
                              <Typography variant="body2" color="text.secondary">
                                No client data available
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ border: '2px solid', borderColor: 'primary.main' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Updated Client
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Field</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {updatedClient ? (
                          [
                            { key: 'companyName', label: 'Company Name', value: updatedClient.companyName, prev: prevClient?.companyName },
                            { key: 'emailAddress', label: 'Email', value: updatedClient.emailAddress, prev: prevClient?.emailAddress },
                            { key: 'phoneNumber', label: 'Phone', value: updatedClient.phoneNumber, prev: prevClient?.phoneNumber },
                            { key: 'address', label: 'Address', value: updatedClient.address, prev: prevClient?.address },
                            { key: 'postCode', label: 'Post Code', value: updatedClient.postCode, prev: prevClient?.postCode },
                          ].map((field) => {
                            const hasChanged = field.value !== field.prev;

                            return (
                              <TableRow 
                                key={field.key} 
                                hover
                                sx={{ 
                                  backgroundColor: hasChanged ? 'warning.light' : 'transparent',
                                  '&:hover': {
                                    backgroundColor: hasChanged ? 'warning.light' : 'grey.50'
                                  }
                                }}
                              >
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    {field.label}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {hasChanged && field.prev && (
                                      <>
                                        <Typography 
                                          variant="body2" 
                                          sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                                        >
                                          {field.prev}
                                        </Typography>
                                        <ArrowIcon color="warning" fontSize="small" />
                                      </>
                                    )}
                                    <Typography 
                                      variant="body2" 
                                      fontWeight={hasChanged ? 'bold' : 'normal'}
                                      color={hasChanged ? 'success.main' : 'text.primary'}
                                    >
                                      {field.value || 'N/A'}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>
                                  {hasChanged && (
                                    <Chip label="Changed" color="warning" size="small" />
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} align="center">
                              <Typography variant="body2" color="text.secondary">
                                No client data available
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const renderMaterialsComparison = (previousData, updatedData) => {
    const previousMaterials = previousData?.materials || [];
    const updatedMaterials = updatedData?.materials || [];

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
            <SupplierIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Materials Comparison
          </Typography>
        </Grid>

        {/* Previous Materials Table */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '2px solid', borderColor: 'grey.400' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="text.secondary">
                Previous Materials ({previousMaterials.length})
              </Typography>
              {previousMaterials.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'grey.100' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Material</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Measure</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Material Cost</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Edging Cost</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Supplier</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previousMaterials.map((material, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {material.finishMaterial}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {material.materialType}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {material.measure}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right' }}>
                            <Typography variant="body2">
                              ${material.materialCost}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right' }}>
                            <Typography variant="body2">
                              ${material.edgingCost}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {material.supplier?.name || 'N/A'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No materials data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Updated Materials Table */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '2px solid', borderColor: 'primary.main' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Updated Materials ({updatedMaterials.length})
              </Typography>
              {updatedMaterials.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'grey.100' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Material</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Measure</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Material Cost</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Edging Cost</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Supplier</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {updatedMaterials.map((material, index) => {
                        const prevMaterial = previousMaterials[index] || {};
                        const hasChanges = 
                          material.finishMaterial !== prevMaterial.finishMaterial ||
                          material.materialType !== prevMaterial.materialType ||
                          material.measure !== prevMaterial.measure ||
                          material.materialCost !== prevMaterial.materialCost ||
                          material.edgingCost !== prevMaterial.edgingCost;

                        return (
                          <TableRow 
                            key={index} 
                            hover
                            sx={{ 
                              backgroundColor: hasChanges ? 'warning.light' : 'transparent',
                              '&:hover': {
                                backgroundColor: hasChanges ? 'warning.light' : 'grey.50'
                              }
                            }}
                          >
                            <TableCell>
                              <MaterialComparisonCell 
                                current={material.finishMaterial}
                                previous={prevMaterial.finishMaterial}
                              />
                            </TableCell>
                            <TableCell>
                              <MaterialComparisonCell 
                                current={material.materialType}
                                previous={prevMaterial.materialType}
                              />
                            </TableCell>
                            <TableCell>
                              <MaterialComparisonCell 
                                current={material.measure}
                                previous={prevMaterial.measure}
                              />
                            </TableCell>
                            <TableCell sx={{ textAlign: 'right' }}>
                              <MaterialComparisonCell 
                                current={`$${material.materialCost}`}
                                previous={prevMaterial.materialCost ? `$${prevMaterial.materialCost}` : null}
                              />
                            </TableCell>
                            <TableCell sx={{ textAlign: 'right' }}>
                              <MaterialComparisonCell 
                                current={`$${material.edgingCost}`}
                                previous={prevMaterial.edgingCost ? `$${prevMaterial.edgingCost}` : null}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {material.supplier?.name || 'N/A'}
                              </Typography>
                            </TableCell>
                            
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No materials data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const MaterialComparisonCell = ({ current, previous }) => {
    const hasChanged = current !== previous;
    
    return (
      <Box>
        {hasChanged && previous && (
          <Typography 
            variant="caption" 
            sx={{ 
              textDecoration: 'line-through', 
              color: 'text.secondary',
              display: 'block',
              lineHeight: 1
            }}
          >
            {previous}
          </Typography>
        )}
        <Typography 
          variant="body2" 
          fontWeight={hasChanged ? 'bold' : 'normal'}
          color={hasChanged ? 'success.main' : 'text.primary'}
          sx={{ lineHeight: 1.2 }}
        >
          {current}
        </Typography>
      </Box>
    );
  };

  if (loading) return <Loader />

  if (!data || data.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No Amendment History Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            There are no amendment records for this project.
          </Typography>
          <Link href="/project">
            <Button variant="contained" color="primary">
              Back to Projects
            </Button>
          </Link>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: 'primary.main', color: 'white' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap">
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              <AssignmentIcon sx={{ fontSize: 32, mr: 2, verticalAlign: 'middle' }} />
              Amendment History
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Project: {data[0]?.project?.projectName || 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
              <BusinessIcon sx={{ fontSize: 16, mr: 1 }} />
              Project ID: {id}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Chip 
              icon={<CalendarIcon />}
              label={`Total Amendments: ${data.length}`}
              color="secondary"
              sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.2)', fontSize: '1rem', py: 1.5 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Link href="/project">
          <Button variant="outlined" color="primary">
            Back
          </Button>
        </Link>
      </Box>

      {/* Amendments List */}
      {data.map((amendment, index) => (
        <Card key={amendment.id} sx={{ mb: 4, border: '2px solid', borderColor: 'primary.light' }}>
          <CardContent sx={{ p: 0 }}>
            {/* Amendment Header */}
            <Box sx={{ p: 3, backgroundColor: 'primary.light', color: 'white' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    Amendment #{data.length - index}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                    <CalendarIcon sx={{ fontSize: 14, mr: 1 }} />
                    Created: {formatDate(amendment.createdAt)}
                  </Typography>
                </Box>
                <Box>
                  <Chip 
                    label={`Revision: ${amendment.project?.revision || 'N/A'}`}
                    color="secondary"
                    sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.3)' }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Amendment Content */}
            <Box sx={{ p: 3 }}>
              {/* Project Details Comparison */}
              <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
                Project Details
              </Typography>
              {renderComparison(
                amendment.previousData?.project,
                amendment.updatedData?.project,
                'Project Details',
                [
                  { key: 'projectName', label: 'Project Name' },
                  { key: 'siteLocation', label: 'Site Location' },
                  { key: 'accessNotes', label: 'Access Notes' },
                  { key: 'qsName', label: 'QS Name' },
                  { key: 'qsPhone', label: 'QS Phone' },
                  { key: 'revision', label: 'Revision' }
                ]
              )}

              <Divider sx={{ my: 4 }} />

              {/* Client Information */}
              {renderClientSupplierInfo(amendment.previousData, amendment.updatedData)}

              <Divider sx={{ my: 4 }} />

              {/* Rates Comparison */}
              <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
                Rates Comparison
              </Typography>
              {renderRateComparison(
                amendment.previousData?.rates,
                amendment.updatedData?.rates
              )}

              <Divider sx={{ my: 4 }} />

              {/* Materials Comparison */}
              {renderMaterialsComparison(amendment.previousData, amendment.updatedData)}

              {/* Summary */}
              <Card sx={{ mt: 3, backgroundColor: 'grey.50' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Amendment Summary
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      This amendment was created on {formatDate(amendment.createdAt)}
                    </Typography>
                    
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* Overall Summary */}
      <Paper sx={{ p: 3, mt: 3, backgroundColor: 'success.light', color: 'white' }}>
        <Typography variant="h6" gutterBottom>
          Amendment History Summary
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Total of {data.length} amendment(s) recorded for this project. 
        </Typography>
      </Paper>
    </Container>
  )
}

export default Page