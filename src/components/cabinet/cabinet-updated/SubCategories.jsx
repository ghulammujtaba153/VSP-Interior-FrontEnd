"use client"

import React, { useState, useEffect } from 'react'
import SubCategoryModal from '../categories/SubCategoryModal'
import { BASE_URL } from '@/configs/url'
import { toast } from 'react-toastify'
import axios from 'axios'
import Loader from '@/components/loader/Loader'
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Box, Typography, Button, TablePagination
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'

const SubCategories = ({ id }) => {
  const [subCategories, setSubCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [editSubCategory, setEditSubCategory] = useState(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${BASE_URL}/api/cabinet-subcategories/get/${id}`)
      setSubCategories(response.data || [])
    } catch (error) {
      toast.error("Failed to fetch subcategories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line
  }, [id])

  const handleDeleteSubCategory = async (subCategoryId) => {
    toast.loading("Please wait...")
    try {
      await axios.delete(`${BASE_URL}/api/cabinet-subcategories/delete/${subCategoryId}`)
      toast.success("Subcategory deleted successfully")
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete subcategory")
    } finally {
      toast.dismiss()
    }
  }

  const handleAdd = () => {
    setEditSubCategory(null)
    setOpenModal(true)
  }

  const handleEdit = (subCategory) => {
    setEditSubCategory(subCategory)
    setOpenModal(true)
  }

  const handleModalClose = (refresh = false) => {
    setOpenModal(false)
    setEditSubCategory(null)
    if (refresh) fetchData()
  }

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Paginated data
  const paginatedSubCategories = subCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Subcategories</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Subcategory
        </Button>
      </Box>
      {loading ? (
        <Loader />
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {/* <TableCell>#</TableCell> */}
                <TableCell>Name</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSubCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No subcategories found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSubCategories.map((sub, index, idx) => (
                  <TableRow
                    key={sub.id}
                    hover
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
                      '&:hover': {
                        backgroundColor: index % 2 === 0 ? '#f3f4f6' : '#f9fafb',
                      }
                    }}
                  >
                    {/* <TableCell>{page * rowsPerPage + idx + 1}</TableCell> */}
                    <TableCell>{sub.name}</TableCell>
                    <TableCell>
                      {sub.createdAt ? new Date(sub.createdAt).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleEdit(sub)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteSubCategory(sub.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={subCategories.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </TableContainer>
      )}
      <SubCategoryModal
        open={openModal}
        onClose={handleModalClose}
        categoryId={id}
        subCategory={editSubCategory}
      />
    </Box>
  )
}

export default SubCategories