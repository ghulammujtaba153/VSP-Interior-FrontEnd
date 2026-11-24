'use client'

import Loader from '@/components/loader/Loader'
import { useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { BASE_URL } from '@/configs/url'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  useTheme,
  Tabs,
  Tab,
  Chip,
  Stack,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import * as XLSX from 'xlsx'
import PermissionWrapper from '@/components/PermissionWrapper'
import PriceBookTierCell from '@/components/suppliers/priceBook/PriceBookTierCell'
import PriceBookImportWizard from '@/components/suppliers/priceBook/PriceBookImportWizard'
import PriceBookImportHistory from '@/components/suppliers/priceBook/PriceBookImportHistory'
import { formatNzdPrice } from '@/lib/priceBookUtils'

const PriceBookPage = ({ supplierId: propSupplierId, embedded = false }) => {
  const theme = useTheme()
  const searchParams = useSearchParams()
  const supplierQueryId = searchParams.get('supplierId')
  const [selectedSupplierId, setSelectedSupplierId] = useState(
    propSupplierId || supplierQueryId || ''
  )
  const supplierId = propSupplierId || selectedSupplierId || supplierQueryId

  const [tabIndex, setTabIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [suppliers, setSuppliers] = useState([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(true)
  const [versions, setVersions] = useState([])
  const [activeVersion, setActiveVersion] = useState('all')

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)

  const [open, setOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    unit: '',
    basePrice: '',
    variant: '',
    supplierId: supplierId || '',
    status: 'active',
  })

  const [openVersionDialog, setOpenVersionDialog] = useState(false)
  const [versionAction, setVersionAction] = useState('new')
  const [selectedVersion, setSelectedVersion] = useState('v1')
  const [availableVersions, setAvailableVersions] = useState([])

  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyData, setHistoryData] = useState([])
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)

  const fetchSuppliers = async () => {
    setLoadingSuppliers(true)
    try {
      const response = await axios.get(`${BASE_URL}/api/suppliers/get?limit=1000`)
      setSuppliers(response.data.data || [])
    } catch {
      toast.error('Failed to fetch suppliers')
    } finally {
      setLoadingSuppliers(false)
    }
  }

  const fetchVersions = async (sid) => {
    if (!sid) {
      setVersions([])
      return
    }
    try {
      const res = await axios.get(`${BASE_URL}/api/pricebook/versions/${sid}`)
      setVersions(res.data.versions || [])
    } catch {
      setVersions([])
    }
  }

  const fetchPriceBooks = useCallback(async () => {
    setLoading(true)
    try {
      const sid = supplierId
      const endpoint = sid
        ? `${BASE_URL}/api/pricebook/get/${sid}`
        : `${BASE_URL}/api/pricebook/get/`
      const response = await axios.get(endpoint, {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          version: activeVersion,
          status: statusFilter,
        },
      })
      setData(response.data.data || [])
      setTotal(response.data.total || 0)
    } catch {
      toast.error('Failed to fetch price books')
      setData([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [supplierId, page, rowsPerPage, searchQuery, activeVersion, statusFilter])

  useEffect(() => {
    fetchSuppliers()
  }, [])

  useEffect(() => {
    if (propSupplierId) setSelectedSupplierId(propSupplierId)
  }, [propSupplierId])

  useEffect(() => {
    fetchPriceBooks()
    fetchVersions(supplierId)
  }, [fetchPriceBooks, supplierId])

  const handleDelete = async (rowId) => {
    toast.loading('Please wait...')
    try {
      await axios.delete(`${BASE_URL}/api/pricebook/delete/${rowId}`)
      toast.dismiss()
      toast.success('Item deleted successfully')
      fetchPriceBooks()
    } catch {
      toast.dismiss()
      toast.error('Failed to delete item')
    }
  }

  const handleEdit = (row) => {
    setSelectedRow(row)
    setFormData({
      sku: row.sku || row.name,
      name: row.name,
      description: row.description || '',
      category: row.category || '',
      unit: row.unit || '',
      basePrice: row.basePrice ?? '',
      variant: row.variant || '',
      supplierId: row.supplierId || supplierId || '',
      status: row.status || 'active',
    })
    setOpen(true)
  }

  const handleUpdate = async () => {
    if (!formData.name || !formData.supplierId) {
      toast.error('Name and supplier are required')
      return
    }

    if (selectedRow) {
      toast.loading('Please wait...')
      try {
        await axios.put(`${BASE_URL}/api/pricebook/update/${selectedRow.id}`, {
          ...formData,
          sku: formData.sku || formData.name,
          version: selectedRow.version,
        })
        toast.dismiss()
        toast.success('Item updated successfully')
        setOpen(false)
        setSelectedRow(null)
        fetchPriceBooks()
      } catch (error) {
        toast.dismiss()
        toast.error(error.response?.data?.error || 'Failed to update item')
      }
      return
    }

    await fetchAvailableVersions(formData.sku || formData.name)
    setOpen(false)
    setOpenVersionDialog(true)
  }

  const fetchAvailableVersions = async (sku) => {
    if (!sku || !supplierId) {
      setAvailableVersions([])
      return
    }
    try {
      const res = await axios.get(`${BASE_URL}/api/pricebook/history`, {
        params: { sku, supplierId },
      })
      const items = res.data.items || res.data || []
      const vers = [...new Set(items.map((item) => item.version))].filter(Boolean)
      setAvailableVersions(vers)
    } catch {
      setAvailableVersions([])
    }
  }

  const handleVersionConfirm = async () => {
    toast.loading('Please wait...')
    try {
      let version = selectedVersion
      if (versionAction === 'new') {
        version = versions.length
          ? `v${Math.max(...versions.map((v) => parseInt(String(v).replace('v', ''), 10) || 0)) + 1}`
          : 'v1'
      }

      if (versionAction === 'existing') {
        const existingItem = data.find(
          (item) => item.sku === (formData.sku || formData.name) && item.version === selectedVersion
        )
        if (!existingItem) {
          toast.dismiss()
          toast.error(`SKU not found in ${selectedVersion}`)
          return
        }
        await axios.put(`${BASE_URL}/api/pricebook/update/${existingItem.id}`, {
          ...formData,
          sku: formData.sku || formData.name,
          supplierId: formData.supplierId,
          version: selectedVersion,
        })
        toast.dismiss()
        toast.success('Item updated successfully')
      } else {
        await axios.post(`${BASE_URL}/api/pricebook/create`, {
          ...formData,
          sku: formData.sku || formData.name,
          supplierId: formData.supplierId,
          version,
          priceTiers: formData.basePrice
            ? [{ minQty: 1, maxQty: null, price: Number(formData.basePrice) }]
            : [],
        })
        toast.dismiss()
        toast.success('Item added successfully')
      }

      setOpenVersionDialog(false)
      resetForm()
      fetchPriceBooks()
      fetchVersions(supplierId)
    } catch (error) {
      toast.dismiss()
      toast.error(error.response?.data?.error || 'Failed to save item')
    }
  }

  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      category: '',
      unit: '',
      basePrice: '',
      variant: '',
      supplierId: supplierId || '',
      status: 'active',
    })
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedRow(null)
    resetForm()
  }

  const handleAddNew = () => {
    if (!supplierId) {
      toast.error('Select a supplier first')
      return
    }
    setSelectedRow(null)
    resetForm()
    setVersionAction('new')
    setSelectedVersion('v1')
    setOpen(true)
  }

  const handleExport = async () => {
    try {
      const sid = supplierId
      if (!sid) {
        toast.error('Select a supplier to export')
        return
      }
      const response = await axios.get(`${BASE_URL}/api/pricebook/get/${sid}`, {
        params: { limit: 5000, version: activeVersion, status: statusFilter },
      })
      const rows = response.data.data || []
      if (!rows.length) {
        toast.error('No data to export')
        return
      }

      const exportData = rows.map((item) => ({
        SKU: item.sku,
        Name: item.name,
        Description: item.description,
        Category: item.category,
        Unit: item.unit,
        BasePrice: item.basePrice,
        Tiers: JSON.stringify(item.priceTiers || []),
        Version: item.version,
        Supplier: item.supplier?.name || 'N/A',
        Status: item.status,
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'PriceBook')
      const supplierName = rows[0]?.supplier?.name || 'Supplier'
      XLSX.writeFile(workbook, `${supplierName} Pricebook.xlsx`)
    } catch {
      toast.error('Export failed')
    }
  }

  const fetchHistory = async (row) => {
    setHistoryLoading(true)
    try {
      const res = await axios.get(`${BASE_URL}/api/pricebook/history`, {
        params: { sku: row.sku || row.name, supplierId: row.supplierId },
      })
      setHistoryData(res.data.items || res.data || [])
    } catch {
      toast.error('Failed to fetch history')
      setHistoryData([])
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleViewHistory = (row) => {
    fetchHistory(row)
    setHistoryOpen(true)
  }

  const handleImportComplete = () => {
    fetchPriceBooks()
    fetchVersions(supplierId)
    setHistoryRefreshKey((k) => k + 1)
    setTabIndex(0)
  }

  const supplierName = suppliers.find((s) => String(s.id) === String(supplierId))?.name

  return (
    <Box className={embedded ? '' : 'p-4'} component={embedded ? Box : Paper}>
      {!embedded && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
          <Button variant="contained" color="primary" onClick={() => window.history.back()}>
            Back
          </Button>
          <Typography variant="h6" fontWeight="bold">
            Supplier Price Book
          </Typography>
        </Box>
      )}

      <Stack direction="row" spacing={2} alignItems="center" mb={2} flexWrap="wrap">
        {!propSupplierId && (
          <FormControl size="small" sx={{ minWidth: 260 }} required>
            <InputLabel>Supplier</InputLabel>
            <Select
              label="Supplier"
              value={selectedSupplierId}
              onChange={(e) => {
                setSelectedSupplierId(e.target.value)
                setPage(0)
              }}
              disabled={loadingSuppliers}
            >
              <MenuItem value="">
                <em>All suppliers</em>
              </MenuItem>
              {suppliers.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {propSupplierId && supplierName && (
          <Chip label={supplierName} color="primary" variant="outlined" />
        )}
        {versions.length > 0 && tabIndex === 0 && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Version</InputLabel>
            <Select
              label="Version"
              value={activeVersion}
              onChange={(e) => {
                setActiveVersion(e.target.value)
                setPage(0)
              }}
            >
              <MenuItem value="all">All versions</MenuItem>
              {versions.map((v) => (
                <MenuItem key={v} value={v}>
                  {v}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>

      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
        <Tab label="Price List" />
        <Tab label="Import" disabled={!supplierId} />
        <Tab label="Import History" disabled={!supplierId} />
      </Tabs>

      {tabIndex === 1 && (
        <PriceBookImportWizard supplierId={supplierId} onImported={handleImportComplete} />
      )}

      {tabIndex === 2 && (
        <PriceBookImportHistory supplierId={supplierId} refreshKey={historyRefreshKey} />
      )}

      {tabIndex === 0 && (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
            <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
              <TextField
                label="Search SKU, name, category…"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(0)
                }}
                sx={{ minWidth: 220 }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPage(0)
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Button variant="contained" color="success" onClick={handleExport} sx={{ mr: 1 }}>
                Export XLS
              </Button>
              <PermissionWrapper resource="suppliers" action="canCreate">
                <Button
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  onClick={() => setTabIndex(1)}
                  sx={{ mr: 1 }}
                  disabled={!supplierId}
                >
                  Import
                </Button>
                <Button variant="contained" color="secondary" onClick={handleAddNew} disabled={!supplierId}>
                  Add Item
                </Button>
              </PermissionWrapper>
            </Box>
          </Box>

          {loading ? (
            <Loader />
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><b>SKU</b></TableCell>
                    <TableCell><b>Name / Description</b></TableCell>
                    <TableCell><b>Category</b></TableCell>
                    <TableCell><b>Unit</b></TableCell>
                    <TableCell><b>Price / Tiers</b></TableCell>
                    <TableCell><b>Version</b></TableCell>
                    {!supplierId && <TableCell><b>Supplier</b></TableCell>}
                    <TableCell><b>Status</b></TableCell>
                    <TableCell align="center"><b>Actions</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.length > 0 ? (
                    data.map((row, index) => (
                      <TableRow
                        key={row.id}
                        hover
                        sx={{
                          backgroundColor: index % 2 === 0 ? theme.palette.action.hover : 'inherit',
                        }}
                      >
                        <TableCell>{row.sku || row.name}</TableCell>
                        <TableCell sx={{ maxWidth: 240 }}>
                          <Typography variant="body2" fontWeight={500}>{row.name}</Typography>
                          {row.description && row.description !== row.name && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {row.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{row.category || '—'}</TableCell>
                        <TableCell>{row.unit || '—'}</TableCell>
                        <TableCell>
                          <PriceBookTierCell tiers={row.priceTiers} basePrice={row.basePrice} />
                        </TableCell>
                        <TableCell>{row.version}</TableCell>
                        {!supplierId && <TableCell>{row.supplier?.name || 'N/A'}</TableCell>}
                        <TableCell>
                          <Chip
                            size="small"
                            label={row.status}
                            color={row.status === 'active' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <PermissionWrapper resource="suppliers" action="canView">
                            <IconButton color="info" onClick={() => handleViewHistory(row)} title="History">
                              <VisibilityIcon />
                            </IconButton>
                          </PermissionWrapper>
                          <PermissionWrapper resource="suppliers" action="canEdit">
                            <IconButton color="primary" onClick={() => handleEdit(row)}>
                              <EditIcon />
                            </IconButton>
                          </PermissionWrapper>
                          <PermissionWrapper resource="suppliers" action="canDelete">
                            <IconButton color="error" onClick={() => handleDelete(row.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </PermissionWrapper>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={supplierId ? 8 : 9} align="center">
                        {supplierId ? 'No price list items — import a file or add manually' : 'Select a supplier or search all'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10))
                  setPage(0)
                }}
                rowsPerPageOptions={[10, 20, 50, 100]}
              />
            </TableContainer>
          )}
        </>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedRow ? 'Edit Price Book Item' : 'Add Price Book Item'}</DialogTitle>
        <DialogContent>
          <TextField
            label="SKU"
            fullWidth
            margin="dense"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          />
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label="Description"
            fullWidth
            margin="dense"
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <TextField
            label="Category"
            fullWidth
            margin="dense"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
          <TextField
            label="Unit"
            fullWidth
            margin="dense"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          />
          <TextField
            label="Base Price (NZD)"
            fullWidth
            margin="dense"
            type="number"
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
          />
          <TextField
            label="Variant"
            fullWidth
            margin="dense"
            value={formData.variant}
            onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
          />
          {!supplierId && (
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Supplier</InputLabel>
              <Select
                value={formData.supplierId}
                label="Supplier"
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              >
                {suppliers.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button onClick={handleUpdate} color="primary" variant="contained">
            {selectedRow ? 'Save' : 'Next'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openVersionDialog} onClose={() => setOpenVersionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select Version</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" fullWidth>
            <FormLabel>Version Action</FormLabel>
            <RadioGroup value={versionAction} onChange={(e) => setVersionAction(e.target.value)}>
              <FormControlLabel value="new" control={<Radio />} label="Create new version" />
              <FormControlLabel value="existing" control={<Radio />} label="Update existing version" />
            </RadioGroup>
          </FormControl>
          {versionAction === 'existing' && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Version</InputLabel>
              <Select value={selectedVersion} label="Version" onChange={(e) => setSelectedVersion(e.target.value)}>
                {availableVersions.map((v) => (
                  <MenuItem key={v} value={v}>{v}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenVersionDialog(false); setOpen(true) }} color="inherit">Back</Button>
          <Button onClick={handleVersionConfirm} color="primary" variant="contained">Add Item</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>SKU Version History</DialogTitle>
        <DialogContent dividers>
          {historyLoading ? (
            <Loader />
          ) : historyData.length === 0 ? (
            <Typography>No history found.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><b>Version</b></TableCell>
                  <TableCell><b>Base Price</b></TableCell>
                  <TableCell><b>Tiers</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                  <TableCell><b>Created</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyData.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>{h.version}</TableCell>
                    <TableCell>{formatNzdPrice(h.basePrice)}</TableCell>
                    <TableCell>
                      <PriceBookTierCell tiers={h.priceTiers} basePrice={h.basePrice} />
                    </TableCell>
                    <TableCell>{h.status}</TableCell>
                    <TableCell>{h.createdAt ? new Date(h.createdAt).toLocaleString() : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryOpen(false)} color="inherit">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PriceBookPage
