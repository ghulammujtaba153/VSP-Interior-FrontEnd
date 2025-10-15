'use client'

import { BASE_URL } from '@/configs/url'
import axios from 'axios'
import { useEffect, useState } from 'react'
import Loader from '@components/loader/Loader'
import {
  Box,
  Button,
  IconButton,
  Typography,
  Paper,
  TextField,
  Chip,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  MenuItem,
} from '@mui/material'
import { Visibility, Edit, Delete, Add } from '@mui/icons-material'
import CabinetModal from '@components/cabinet/CabinetModal'
import ViewCabinet from '@components/cabinet/ViewCabinet'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/authContext'
// import CSVFileModal from './CSVFileModal'
import * as XLSX from 'xlsx'
import ConfirmationDialog from '@/components/ConfirmationDialog'
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';


const MaterialTable = ({id}) => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [rowCount, setRowCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewData, setViewData] = useState(null)
  const { user } = useAuth()
  const [csvModalOpen, setCsvModalOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(100)
  const [orderBy, setOrderBy] = useState('id')
  const [order, setOrder] = useState('asc')
  const [dynamicColumns, setDynamicColumns] = useState([])
  const [subCategories, setSubCategories] = useState([])
  


  const [searchInput, setSearchInput] = useState('') // typing state
  const [search, setSearch] = useState('') // applied state

  // Confirmation dialog states
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [confirmationConfig, setConfirmationConfig] = useState({
    title: '',
    message: '',
    action: null,
    severity: 'warning'
  })

  // Export dialog states
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportSubCodes, setExportSubCodes] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedSubCode, setSelectedSubCode] = useState('all');
  const [subCodeFilter, setSubCodeFilter] = useState('all');
  const [uniqueSubCodes, setUniqueSubCodes] = useState([]);

  
  // Update fetchCabinets to accept subCodeFilter
  const fetchCabinets = async (subCode = subCodeFilter) => {
    setLoading(true);
    try {
      // Add subCode as a query param if not 'all'
      let subCodeParam = subCode && subCode !== 'all' ? `&subCode=${encodeURIComponent(subCode)}` : '';
      const res = await axios.get(
        `${BASE_URL}/api/cabinet/get/${id}?page=${page + 1}&limit=${limit}&search=${search}&subCode=${subCodeParam}`
      );
      const cabinets = res.data.cabinets || [];
      setData(cabinets);
      setRowCount(res.data.total);

      // Collect all dynamic field names from all cabinets
      const columnsSet = new Set()
      cabinets.forEach(cabinet => {
        let list = []
        if (Array.isArray(cabinet.dynamicData)) {
          list = cabinet.dynamicData.map(f => f.columnName || f.label).filter(Boolean)
        } else if (cabinet.dynamicData && Array.isArray(cabinet.dynamicData.arrayList)) {
          list = cabinet.dynamicData.arrayList.map(f => f.label).filter(Boolean)
        } else if (typeof cabinet.dynamicData === 'object') {
          list = Object.keys(cabinet.dynamicData)
        }
        list.forEach(col => columnsSet.add(col))
      })
      setDynamicColumns(Array.from(columnsSet))


      const response = await axios.get(`${BASE_URL}/api/cabinet-subcategories/get/${id}`);

// ✅ Extract only the unique "name" values
const subCodes = [...new Set(response.data.map(item => item.name))];

setUniqueSubCodes(subCodes);

    } catch (error) {
      console.error('Error fetching cabinets:', error)
      toast.error('Failed to fetch cabinets')
    } finally {
      setLoading(false)
    }
  }

  const showConfirmation = (config) => {
    setConfirmationConfig(config)
    setConfirmationOpen(true)
  }

  const handleConfirmationClose = () => {
    setConfirmationOpen(false)
    setConfirmationConfig({
      title: '',
      message: '',
      action: null,
      severity: 'warning'
    })
  }

  const handleDelete = (cabinetRow) => {
    showConfirmation({
      title: 'Delete Cabinet',
      message: `Are you sure you want to delete cabinet with code "${cabinetRow.code}"? This action cannot be undone and will remove all associated data.`,
      action: () => confirmDeleteCabinet(cabinetRow.id),
      severity: 'error'
    })
  }

  const confirmDeleteCabinet = async (id) => {
    toast.loading('Deleting Cabinet...')
    try {
      await axios.delete(`${BASE_URL}/api/cabinet/delete/${id}`, {
        data: {
          userId: user.id
        }
      })
      fetchCabinets()
      toast.dismiss()
      toast.success('Cabinet deleted successfully')
    } catch (error) {
      console.error('Error deleting cabinet:', error)
      toast.dismiss()
      toast.error('Error deleting cabinet')
    }
  }

  // Fetch all cabinets for export (no pagination)
  const fetchAllCabinets = async () => {
    setExportLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/cabinet/get/${id}?page=1&limit=500&search=${search}`);
      setExportLoading(false);
      return res.data.cabinets;
    } catch (error) {
      setExportLoading(false);
      toast.error('Failed to fetch cabinets for export');
      return [];
    }
  };

  // Open export dialog and fetch all sub codes
  const handleExportExcel = async () => {
    setExportDialogOpen(true);
    setExportLoading(true);
    const allData = await fetchAllCabinets();
    // Extract unique sub codes
    const subCodes = Array.from(new Set(allData.map(item => item.cabinetSubCategory?.name).filter(Boolean)));
    setExportSubCodes(subCodes);
    setExportLoading(false);
  };

  // Export filtered data
  const handleExportConfirm = async () => {
    setExportLoading(true);
    const allData = await fetchAllCabinets();
    let exportData = allData;
    if (selectedSubCode !== 'all') {
      exportData = allData.filter(item => item.cabinetSubCategory?.name === selectedSubCode);
    }
    // Prepare export
    const formatted = exportData.map((cabinet) => {
      const baseData = {
        ID: cabinet.id,
        'Code': cabinet.code,
        'Category': cabinet.cabinetCategory?.name || 'N/A',
        'Subcategory': cabinet.cabinetSubCategory?.name || 'N/A',
        'Description': cabinet.description || 'N/A',
        'Status': cabinet.status || 'N/A',
        
      };
      // Add dynamic properties
      if (cabinet.dynamicData && Array.isArray(cabinet.dynamicData.arrayList)) {
        cabinet.dynamicData.arrayList.forEach(item => {
          baseData[item.label] = item.value || 'N/A';
        });
      }

      // 'Created Date': cabinet.createdAt ? formatDate(cabinet.createdAt) : 'N/A',
        // 'Updated Date': cabinet.updatedAt ? formatDate(cabinet.updatedAt) : 'N/A'

      baseData['Created Date'] = cabinet.createdAt ? new Date(cabinet.createdAt).toLocaleDateString() : 'N/A';
      baseData['Updated Date'] = cabinet.updatedAt ? new Date(cabinet.updatedAt).toLocaleDateString() : 'N/A';


      return baseData;
    });
    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cabinets');
    XLSX.writeFile(workbook, selectedSubCode === 'all' ? 'Cabinet Items VSP.xlsx' : `${selectedSubCode} Cabinets.xlsx`);
    setExportLoading(false);
    setExportDialogOpen(false);
    toast.success('Cabinet data exported successfully');
  };

  useEffect(() => {
    fetchCabinets()
  }, [page, limit, search]) // ✅ only runs when Apply updates `search`

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const handleResetSearch = () => {
    setSearchInput('')
    setSearch('')
    setPage(0)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setLimit(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  // Normalize dynamicData to ordered array of { label, value }
  const getArrayList = (dynamicData) => {
    if (!dynamicData) return []
    if (Array.isArray(dynamicData?.arrayList)) {
      return dynamicData.arrayList
    }
    if (Array.isArray(dynamicData)) {
      return dynamicData.map(it => ({ label: it.columnName ?? it.label, value: it.value }))
    }
    if (typeof dynamicData === 'object') {
      return Object.entries(dynamicData).map(([label, value]) => ({ label, value }))
    }
    return []
  }

  // Helper function to get dynamic data value by column name/label
  const getDynamicValue = (cabinet, columnName) => {
    const list = getArrayList(cabinet?.dynamicData)
    if (list.length > 0) {
      const found = list.find(item => item.label === columnName || item.columnName === columnName)
      return found ? (found.value ?? 'N/A') : 'N/A'
    }
    // fallback to object map
    if (cabinet?.dynamicData && typeof cabinet.dynamicData === 'object') {
      return cabinet.dynamicData[columnName] ?? 'N/A'
    }
    return 'N/A'
  }

  // Filter data by subCodeFilter
  const filteredData = subCodeFilter === 'all'
    ? data
    : data.filter(item => item.cabinetSubCategory?.name === subCodeFilter);

  if (loading) return <Loader />

  return (
    <Paper p={8} sx={{ padding: 2 }}>
      {/* Header */}
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <Typography variant='h5' fontWeight='bold'>
          Material Management
        </Typography>
        <Box display='flex' gap={2}>
          <Button
            variant='outlined'
            color='success'
            onClick={handleExportExcel}
          >
            Export Excel
          </Button>
          <Button
            variant='contained'
            color='primary'
            startIcon={<Add />}
            onClick={() => {
              setEditData(null)
              setOpen(true)
            }}
          >
            Add Item
          </Button>
        </Box>
      </Box>

      {/* Sub Code Filter Dropdown */}
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Typography variant="body2" fontWeight="bold">Filter by Sub Code:</Typography>
        <TextField
          select
          size="small"
          value={subCodeFilter}
          onChange={e => {
            setSubCodeFilter(e.target.value);
            setPage(0);
            fetchCabinets(e.target.value); // <-- Call API when dropdown changes
          }}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">All</MenuItem>
          {uniqueSubCodes.map(subCode => (
            <MenuItem key={subCode} value={subCode}>{subCode}</MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Search + Apply */}
      <Box display="flex" gap={1} mb={2}>
        <TextField
          label="Search by code, description"
          size="small"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ width: '300px' }}
          placeholder="Search..."
        />
        <Button
          variant="contained"
          onClick={() => {
            setPage(0)
            setSearch(searchInput)
          }}
        >
          Apply
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleResetSearch}
        >
          Reset
        </Button>
      </Box>

      {/* Custom Table */}
      <Paper elevation={1}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="cabinet table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'id'}
                    direction={orderBy === 'id' ? order : 'asc'}
                    onClick={() => handleSort('id')}
                  >
                    VSP_ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'code'}
                    direction={orderBy === 'code' ? order : 'asc'}
                    onClick={() => handleSort('code')}
                  >
                    Sub Code
                  </TableSortLabel>
                </TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                
                {/* Dynamic Columns */}
                {dynamicColumns.map((column, index) => (
                  <TableCell key={index}>
                    <Tooltip title={`Dynamic property: ${column}`}>
                      <span>{column}</span>
                    </Tooltip>
                  </TableCell>
                ))}
                
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'createdAt'}
                    direction={orderBy === 'createdAt' ? order : 'asc'}
                    onClick={() => handleSort('createdAt')}
                  >
                    Created
                  </TableSortLabel>
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((cabinet, index) => (
                <TableRow
                  key={cabinet.id}
                  hover
                  sx={{
                    backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
                    '&:hover': {
                      backgroundColor: index % 2 === 0 ? '#f3f4f6' : '#f9fafb',
                    }
                  }}
                >
                  <TableCell>{cabinet.id}</TableCell>
                  <TableCell>
                    {cabinet.cabinetSubCategory ? (
                      <Chip 
                        label={cabinet.cabinetSubCategory.name} 
                        color="secondary" 
                        variant="outlined" 
                        size="small"
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">N/A</Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontWeight="medium" noWrap sx={{ maxWidth: 300 }}>
                      {cabinet.code || 'N/A'}
                    </Typography>
                  </TableCell>
                  
                  
                  <TableCell>
                    <Tooltip title={cabinet.description || 'No description'}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {cabinet.description || 'No description'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={cabinet.status || 'N/A'} 
                      color={cabinet.status === 'active' ? 'success' : 'default'} 
                      size="small"
                    />
                  </TableCell>
                  
                  {/* Dynamic Data Cells */}
                  {dynamicColumns.map((column, index) => (
                    <TableCell key={index}>
                      <Tooltip title={getDynamicValue(cabinet, column)}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                          {getDynamicValue(cabinet, column)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                  ))}
                  
                  <TableCell>{formatDate(cabinet.createdAt)}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="View Cabinet">
                        <IconButton
                          color='primary'
                          size="small"
                          onClick={() => {
                            setViewData(cabinet)
                            setViewOpen(true)
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Cabinet">
                        <IconButton
                          color='secondary'
                          size="small"
                          onClick={() => {
                            setEditData(cabinet)
                            setOpen(true)
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Cabinet">
                        <IconButton
                          color='error'
                          size="small"
                          onClick={() => handleDelete(cabinet)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[25, 50, 75, 100, 150]}
          component="div"
          count={rowCount}
          rowsPerPage={limit}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
          }
        />
      </Paper>

      <CabinetModal
        open={open}
        setOpen={setOpen}
        editData={editData}
        setEditData={setEditData}
        onSuccess={fetchCabinets}
        existingDynamicColumns={dynamicColumns} // <-- Pass as prop
      />
      <ViewCabinet open={viewOpen} setOpen={setViewOpen} data={viewData} />

      {/* <CSVFileModal
        open={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        onSuccess={fetchCabinets}
      /> */}

      <ConfirmationDialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        onConfirm={confirmationConfig.action}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        severity={confirmationConfig.severity}
        confirmText={
          confirmationConfig.severity === 'error' ? 'Delete' : 'Confirm'
        }
        cancelText='Cancel'
      />

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Cabinets</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Select a Sub Code to export only its data, or choose "All" to export all cabinets.
          </Typography>
          {exportLoading ? (
            <Typography>Loading...</Typography>
          ) : (
            <Box>
              <Button
                variant={selectedSubCode === 'all' ? 'contained' : 'outlined'}
                color="primary"
                sx={{ mb: 1, mr: 1 }}
                onClick={() => setSelectedSubCode('all')}
              >
                Export All
              </Button>
              {exportSubCodes.map((subCode, idx) => (
                <Button
                  key={subCode}
                  variant={selectedSubCode === subCode ? 'contained' : 'outlined'}
                  color="secondary"
                  sx={{ mb: 1, mr: 1 }}
                  onClick={() => setSelectedSubCode(subCode)}
                >
                  {subCode}
                </Button>
              ))}
              <Typography variant="caption" sx={{ display: 'block', mt: 2 }}>
                {selectedSubCode === 'all'
                  ? `Exporting all cabinets (${rowCount} items)`
                  : `Exporting cabinets for Sub Code "${selectedSubCode}"`
                }
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleExportConfirm}
            disabled={exportLoading}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default MaterialTable