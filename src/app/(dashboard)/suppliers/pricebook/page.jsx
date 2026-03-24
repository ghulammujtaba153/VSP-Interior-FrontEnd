'use client'

import Loader from '@/components/loader/Loader'
import { useParams, useSearchParams } from 'next/navigation'
import React, { useEffect, useState, useMemo } from 'react'
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
  FormLabel
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import AddIcon from '@mui/icons-material/Add'
import * as XLSX from 'xlsx'

const PriceBookPage = ({ supplierId: propSupplierId }) => {
  const searchParams = useSearchParams()
  const supplierQueryId = searchParams.get('supplierId')
  const supplierId = propSupplierId || supplierQueryId

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(true)

  // Search
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Modal
  const [open, setOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    variant: '',
    dynamic: '',
    supplierId: supplierId || '',
    status: 'Active' // default active, status dropdown removed
  })

  // Version management states
  const [openVersionDialog, setOpenVersionDialog] = useState(false)
  const [versionAction, setVersionAction] = useState('new')
  const [selectedVersion, setSelectedVersion] = useState('v1')
  const [availableVersions, setAvailableVersions] = useState([])
  const [availableLoading, setAvailableLoading] = useState(false)
  
  // Dynamic fields state for modal
  const [dynamicFields, setDynamicFields] = useState([{ key: '', value: '' }])

  // History modal
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyData, setHistoryData] = useState([])

  // New: versions list & selected version for history filter
  const [historyVersions, setHistoryVersions] = useState([])
  const [historyVersionSelected, setHistoryVersionSelected] = useState('All')

  // Fetch suppliers
  const fetchSuppliers = async () => {
    setLoadingSuppliers(true)
    try {
      const response = await axios.get(`${BASE_URL}/api/suppliers/get?limit=1000`)
      setSuppliers(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch suppliers', error)
      toast.error('Failed to fetch suppliers')
    } finally {
      setLoadingSuppliers(false)
    }
  }

  // Fetch pricebooks
  const fetchPriceBooks = async () => {
    setLoading(true)
    try {
      const endpoint = supplierId 
        ? `${BASE_URL}/api/pricebook/get/${supplierId}` 
        : `${BASE_URL}/api/pricebook/get/`
      const response = await axios.get(endpoint)
      setData(response.data)
    } catch (error) {
      toast.error('Failed to fetch price books')
    } finally {
      setLoading(false)
    }
  }

  // Fetch available versions for a given item name + category
  const fetchAvailableVersions = async itemName => {
    setAvailableLoading(true)
    // if no name, default to v1
    if (!itemName) {
      setAvailableVersions([])
      setAvailableLoading(false)
      return
    }

    try {
      const res = await axios.get(`${BASE_URL}/api/pricebook/history`, {
        params: { name: itemName }
      })

      const items = res.data.items || res.data || []
      const versions = Array.from(new Set(items.map(item => item.version)))
        .filter(Boolean)
        .sort((a, b) => parseInt(a.replace('v', '')) - parseInt(b.replace('v', '')))

      setAvailableVersions(versions.length > 0 ? versions : [])
    } catch (error) {
      console.error('Failed to fetch versions', error)
      setAvailableVersions([])
    } finally {
      setAvailableLoading(false)
    }
  }

  useEffect(() => {
    fetchPriceBooks()
    fetchSuppliers()
  }, [])

  // Removed categoryInfo effect

  const handleDelete = async rowId => {
    toast.loading('Please wait...')
    try {
      await axios.delete(`${BASE_URL}/api/pricebook/delete/${rowId}`)
      toast.dismiss()
      toast.success('Item deleted successfully')
      fetchPriceBooks()
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to delete item')
    }
  }

  const handleEdit = async row => {
    setSelectedRow(row)
    setFormData({
      name: row.name,
      variant: row.variant,
      dynamic: row.dynamic,
      supplierId: row.supplierId || '',
      status: 'Active' // ensure status remains active on update
    })
    // keep version unchanged for updates
    setSelectedVersion(row.version || 'v1')
    setVersionAction('existing')

    // open edit dialog directly (no second step)
    setOpen(true)
  }

  const handleUpdate = async () => {
    // Validate required fields (Price is now optional)
    if (!formData.name || !formData.supplierId) {
      toast.error('Please fill all required fields including Supplier')
      return
    }

    // Prepare dynamic JSON from fields
    const dynamicObject = {}
    dynamicFields.forEach(field => {
      if (field.key.trim()) {
        dynamicObject[field.key.trim()] = field.value
      }
    })

    // If editing an existing item - update directly keeping its version
    if (selectedRow) {
      toast.loading('Please wait...')
      try {
        await axios.put(`${BASE_URL}/api/pricebook/update/${selectedRow.id}`, {
          ...formData,
          dynamic: dynamicObject,
          version: selectedRow.version, // preserve previous version
          status: 'Active' // enforce active
        })
        toast.dismiss()
        toast.success('Item updated successfully')
        setOpen(false)
        setSelectedRow(null)
        fetchPriceBooks()
      } catch (error) {
        toast.dismiss()
        const errorMessage = error.response?.data?.error || 'Failed to update item'
        toast.error(errorMessage)
      }
      return
    }

    // Update formData with the dynamic object for handleVersionConfirm
    setFormData(prev => ({ ...prev, dynamic: dynamicObject }))
    
    // If adding new item -> fetch versions for the entered name and go to version dialog
    await fetchAvailableVersions(formData.name)
    setOpen(false)
    setOpenVersionDialog(true)
  }

  const handleVersionConfirm = async () => {
    toast.loading('Please wait...')
    try {
      let version = selectedVersion
      
      if (versionAction === 'new') {
        // For new versions, auto-increment version number
        if (availableVersions.length === 0) {
          version = 'v1'
        } else {
          const maxVersion = Math.max(...availableVersions.map(v => parseInt(v.replace('v', ''))))
          version = `v${maxVersion + 1}`
        }
      }
      
      // If updating existing version, find and UPDATE that item
      if (versionAction === 'existing') {
        const existingItem = data.find(
          item => item.name.toLowerCase() === formData.name.toLowerCase() && item.version === selectedVersion
        )
        
        if (!existingItem) {
          toast.dismiss()
          toast.error(`Item "${formData.name}" with version ${selectedVersion} not found`)
          return
        }
        
        // Update existing item
        await axios.put(`${BASE_URL}/api/pricebook/update/${existingItem.id}`, {
          ...formData,
          supplierId: formData.supplierId,
          version: selectedVersion,
          status: 'Active'
        })
        
        toast.dismiss()
        toast.success('Item updated successfully')
      } else {
        // Creating new version - check for duplicates
        const duplicate = data.find(
          item => item.name.toLowerCase() === formData.name.toLowerCase() && item.version === version
        )

        if (duplicate) {
          toast.dismiss()
          toast.error(`Item "${formData.name}" already exists in version ${version}`)
          return
        }

        // Create new pricebook item
        await axios.post(`${BASE_URL}/api/pricebook/create`, {
          ...formData,
          supplierId: formData.supplierId,
          version: version,
          status: 'Active'
        })

        toast.dismiss()
        toast.success('Item added successfully')
      }
      
      setOpenVersionDialog(false)
      setFormData({ name: '', variant: '', dynamic: '', supplierId: '', status: 'Active' })
      fetchPriceBooks()
    } catch (error) {
      toast.dismiss()
      const errorMessage = error.response?.data?.error || 'Failed to save item'
      toast.error(errorMessage)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedRow(null)
    setFormData({
      name: '',
      variant: '',
      dynamic: '',
      price: '',
      supplierId: supplierId || '',
      status: 'Active'
    })
    setDynamicFields([{ key: '', value: '' }])
  }

  const handleAddNew = () => {
    setSelectedRow(null)
    setFormData({
      name: '',
      variant: '',
      dynamic: '',
      price: '',
      supplierId: supplierId || '',
      status: 'Active'
    })
    setDynamicFields([{ key: 'Unit', value: '' }]) // Start with a 'Unit' field as default
    setVersionAction('new')
    setSelectedVersion('v1')
    setOpen(true)
  }

  // Export XLS
  const handleExport = () => {
    if (!data || data.length === 0) {
      toast.error('No data to export')
      return
    }

    const exportData = data.map(item => ({
      ID: item.id,
      Name: item.name,
      Variant: item.variant,
      Dynamic: item.dynamic,
      Version: item.version,
      Supplier: item.Suppliers ? item.Suppliers.name : 'N/A',
      Status: item.status,
      CreatedAt: item.createdAt,
      UpdatedAt: item.updatedAt
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    
    // Set column widths for better readability
    const columnWidths = []
    if (exportData.length > 0) {
      // Get all column names from the first row
      const columnNames = Object.keys(exportData[0])
      columnNames.forEach((col, index) => {
        let maxLength = col.length // Start with header length
        // Find max length in this column
        exportData.forEach(row => {
          const cellValue = String(row[col] || '')
          if (cellValue.length > maxLength) {
            maxLength = cellValue.length
          }
        })
        // Set width: min 12, max 50, or content width + 5 for padding
        columnWidths[index] = { wch: Math.min(Math.max(maxLength + 5, 12), 50) }
      })
    } else {
      // Default widths if no data
      const defaultColumns = ['ID', 'Name', 'Description', 'Unit', 'Price', 'Version', 'Supplier', 'Status', 'Category', 'CreatedAt', 'UpdatedAt']
      defaultColumns.forEach(() => {
        columnWidths.push({ wch: 15 })
      })
    }
    
    worksheet['!cols'] = columnWidths
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PriceBook')
    XLSX.writeFile(
      workbook,
      `${data[0]?.Suppliers?.name || 'Supplier'} - ${
        data[0]?.PriceBookCategory?.name || 'Category'
      } VSP.xlsx`
    )
  }

  // Filtered rows
  const filteredData = data.filter(item =>
    Object.values(item).some(value => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Paginated rows
  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  // Fetch history (all versions) for a given pricebook name
  const fetchHistory = async name => {
    if (!name) return
    setHistoryLoading(true)
    try {
      const res = await axios.get(`${BASE_URL}/api/pricebook/history`, {
        params: { name: name }
      })

      const items = res.data.items || res.data || []
      setHistoryData(items)

      // compute available versions for this history and set default to 'All'
      const versions = Array.from(new Set(items.map(item => item.version)))
        .filter(Boolean)
        .sort((a, b) => parseInt(a.replace('v', ''), 10) - parseInt(b.replace('v', ''), 10))

      setHistoryVersions(versions)
      setHistoryVersionSelected('All')
    } catch (error) {
      console.error('Failed to fetch history', error)
      toast.error('Failed to fetch history')
      setHistoryData([])
      setHistoryVersions([])
      setHistoryVersionSelected('All')
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleViewHistory = row => {
    fetchHistory(row.name)
    setHistoryOpen(true)
  }

  // Dynamic fields utility handlers
  const handleDynamicChange = (index, field, value) => {
    const updated = [...dynamicFields]
    updated[index][field] = value
    setDynamicFields(updated)
  }

  const addDynamicField = () => {
    setDynamicFields([...dynamicFields, { key: '', value: '' }])
  }

  const removeDynamicField = (index) => {
    if (dynamicFields.length > 1) {
      const updated = dynamicFields.filter((_, i) => i !== index)
      setDynamicFields(updated)
    } else {
      setDynamicFields([{ key: '', value: '' }])
    }
  }

  const renderDynamicValue = (val) => {
    if (!val) return '-'
    if (typeof val === 'object') {
      return Object.entries(val)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')
    }
    return String(val)
  }

  if (loading) return <Loader />

  return (
    <Box className='p-4' component={Paper}>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <Button variant='contained' color='primary' onClick={() => window.history.back()}>
          Back
        </Button>

        <Box>
          <Button variant='contained' color='success' onClick={handleExport} sx={{ mr: 2 }}>
            Export XLS
          </Button>
          <Button variant='contained' color='secondary' onClick={handleAddNew}>
            Add Item
          </Button>
        </Box>
      </Box>

      <Typography variant='h6' fontWeight='bold' mb={2}>
        Price Book
      </Typography>

      <Box className='my-2' display='flex' alignItems='center'>
        <TextField
          label='Search...'
          variant='outlined'
          size='small'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          sx={{ mx: 2, flex: 1, maxWidth: 300 }}
        />
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>ID</b>
              </TableCell>
              <TableCell>
                <b>Name</b>
              </TableCell>
              <TableCell>
                <b>Variant</b>
              </TableCell>
              <TableCell>
                <b>Dynamic</b>
              </TableCell>
              <TableCell>
                <b>Version</b>
              </TableCell>
              <TableCell>
                <b>Supplier</b>
              </TableCell>
              <TableCell>
                <b>Status</b>
              </TableCell>
              <TableCell align='center'>
                <b>Actions</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map(row => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.variant}</TableCell>
                  <TableCell title={renderDynamicValue(row.dynamic)} sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {renderDynamicValue(row.dynamic)}
                  </TableCell>
                  <TableCell>{row.version}</TableCell>
                  <TableCell>{row.Supplier?.name || 'N/A'}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell align='center'>
                    <IconButton color='info' onClick={() => handleViewHistory(row)} title='History'>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton color='primary' onClick={() => handleEdit(row)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color='error' onClick={() => handleDelete(row.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align='center'>
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <TablePagination
          component='div'
          count={filteredData.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </TableContainer>

      {/* Add/Edit Modal (status removed from form) */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{selectedRow ? 'Edit Price Book Item' : 'Add Price Book Item'}</DialogTitle>
        <DialogContent>
          <TextField
            label='Name'
            fullWidth
            margin='dense'
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label='Variant'
            fullWidth
            margin='dense'
            value={formData.variant}
            onChange={e => setFormData({ ...formData, variant: e.target.value })}
          />
          
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Dynamic Fields
            </Typography>
            {dynamicFields.map((field, index) => (
              <Box key={index} display="flex" gap={1} mb={1} alignItems="center">
                <TextField
                  label="Field Name"
                  size="small"
                  value={field.key}
                  onChange={(e) => handleDynamicChange(index, 'key', e.target.value)}
                  placeholder="e.g. Unit, Size"
                  autoComplete="off"
                />
                <TextField
                  label="Value"
                  size="small"
                  value={field.value}
                  onChange={(e) => handleDynamicChange(index, 'value', e.target.value)}
                  placeholder="e.g. Piece, 10mm"
                  autoComplete="off"
                />
                <IconButton color="error" size="small" onClick={() => removeDynamicField(index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button 
              startIcon={<AddIcon />} 
              size="small" 
              onClick={addDynamicField}
              sx={{ mt: 0.5 }}
            >
              Add Field
            </Button>
          </Box>
          {!supplierId && (
            <FormControl fullWidth margin='dense' required>
              <InputLabel>Supplier</InputLabel>
              <Select
                value={formData.supplierId}
                label='Supplier'
                onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                disabled={loadingSuppliers}
              >
                {suppliers.map(supplier => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {/* status removed; default 'Active' is used */}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color='inherit'>
            Cancel
          </Button>
          <Button onClick={handleUpdate} color='primary' variant='contained'>
            {availableLoading ? 'Loading' : 'Next'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Version Selection Dialog (used only for creation) */}
      <Dialog open={openVersionDialog} onClose={() => setOpenVersionDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Select Version</DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' mb={2}>
            Choose whether to create a new version or update an existing one.
          </Typography>

          <FormControl component='fieldset' fullWidth>
            <FormLabel component='legend'>Version Action</FormLabel>
            <RadioGroup value={versionAction} onChange={e => setVersionAction(e.target.value)}>
              <FormControlLabel value='new' control={<Radio />} label='Create New Version (for new tenders)' />
              <FormControlLabel value='existing' control={<Radio />} label='Update Existing Version' />
            </RadioGroup>
          </FormControl>

          {versionAction === 'existing' && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <FormLabel>Select Version to Update</FormLabel>
              <Select value={selectedVersion} onChange={e => setSelectedVersion(e.target.value)}>
                {availableVersions.map(version => (
                  <MenuItem key={version} value={version}>
                    {version}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {versionAction === 'new' && (
            <Typography variant='body2' color='primary' sx={{ mt: 2 }}>
              A new version will be created automatically
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenVersionDialog(false)
              setOpen(true) // Go back to item form
            }}
            color='inherit'
          >
            Back
          </Button>
          <Button onClick={handleVersionConfirm} color='primary' variant='contained'>
            Add Item
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog with timeline (Created At -> Version End) */}
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>Price Book History</DialogTitle>
        <DialogContent dividers>
          {historyLoading ? (
            <Box display='flex' justifyContent='center' alignItems='center' p={4}>
              <Typography>Loading...</Typography>
            </Box>
          ) : historyData.length === 0 ? (
            <Typography>No history found for this item.</Typography>
          ) : (
            <>
              {/* Version selector to filter history */}
              <Box display='flex' alignItems='center' gap={2} mb={2}>
                <Typography variant='body2'>Show:</Typography>
                <FormControl size='small' sx={{ minWidth: 160 }}>
                  <Select
                    value={historyVersionSelected}
                    onChange={(e) => setHistoryVersionSelected(e.target.value)}
                  >
                    <MenuItem value='All'>All Versions</MenuItem>
                    {historyVersions.map(v => (
                      <MenuItem key={v} value={v}>{v}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell><b>Version</b></TableCell>
                      <TableCell><b>Variant</b></TableCell>
                      <TableCell><b>Dynamic</b></TableCell>
                      <TableCell><b>Status</b></TableCell>
                      <TableCell><b>Created At</b></TableCell>
                      <TableCell><b>Version End</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(
                      historyVersionSelected === 'All'
                        ? historyData
                        : historyData.filter(h => h.version === historyVersionSelected)
                    ).map(h => (
                      <TableRow key={h.id}>
                        <TableCell>{h.version}</TableCell>
                        <TableCell>{h.variant}</TableCell>
                        <TableCell>{renderDynamicValue(h.dynamic)}</TableCell>
                        <TableCell>{h.status}</TableCell>
                        <TableCell>{h.createdAt ? new Date(h.createdAt).toLocaleString() : '-'}</TableCell>
                        <TableCell>
                          {h.versionEndDate
                            ? new Date(h.versionEndDate).toLocaleString()
                            : 'active'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryOpen(false)} color='inherit'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PriceBookPage


