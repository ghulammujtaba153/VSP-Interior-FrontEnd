'use client'

import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Loader from '../loader/Loader'
import { BASE_URL } from '@/configs/url'
import AddIcon from "@mui/icons-material/Add";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  TablePagination,
  TextField,
  Box,
  Button
} from '@mui/material'

import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import Link from 'next/link'

const ProjectTable = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  // Pagination state
  const [page, setPage] = useState(0) // frontend page index (starts from 0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [totalCount, setTotalCount] = useState(0)

  // Search state
  const [search, setSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch projects
  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await axios.get(
        `${BASE_URL}/api/projects/get?page=${page + 1}&limit=${rowsPerPage}&search=${searchQuery}`
      )
      setData(res.data.projects || [])
      setTotalCount(res.data.total || 0)
    } catch (error) {
      console.error('error', error.message)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Debounce search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearchQuery(search)
      setPage(0) // reset to first page on new search
    }, 500)

    return () => clearTimeout(delayDebounce)
  }, [search])

  useEffect(() => {
    fetchProjects()
  }, [page, rowsPerPage, searchQuery])

  const handleChangePage = (_, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleView = id => toast.info(`View project ${id}`)
  const handleEdit = id => toast.info(`Edit project ${id}`)
  const handleDelete = async id => {
    if (!confirm('Are you sure you want to delete this project?')) return
    try {
      await axios.delete(`${BASE_URL}/api/projects/delete/${id}`)
      toast.success('Project deleted successfully')
      fetchProjects()
    } catch (error) {
      console.error('Delete error:', error.message)
      toast.error('Failed to delete project')
    }
  }

  if (loading) return <Loader />

  return (
    <div className='p-4'>
      <Typography variant='h5' gutterBottom>
        Projects
      </Typography>

      {/* 🔎 Search Bar */}
      <Box mb={2} display='flex' justifyContent='flex-start'>
        <TextField
          label='Search Projects'
          variant='outlined'
          size='small'
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </Box>

      <Box mb={2} display='flex' justifyContent='flex-end'>
        <Link href='/projects/form' passHref>
          <Button variant='contained' color='primary' startIcon={<AddIcon />}>
            Add Project
          </Button>
        </Link>
      </Box>

      {data.length === 0 ? (
        <Typography>No projects found</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Workers</TableCell>
                <TableCell>Allocations</TableCell>
                <TableCell sx={{ minWidth: 200 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(project => (
                <TableRow key={project.id} hover>
                  <TableCell>{project.id}</TableCell>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.clientDetails?.companyName || 'N/A'}</TableCell>
                  <TableCell>{project.description}</TableCell>
                  <TableCell>
                    {project.workers?.length > 0 ? (
                      <ul style={{ paddingLeft: 16 }}>
                        {project.workers.map(w => (
                          <li key={w.id}>
                            {w.worker?.name || w.workerId} ({w.role})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      'No workers'
                    )}
                  </TableCell>
                  <TableCell>
                    {project.allocations?.length > 0 ? (
                      <ul style={{ paddingLeft: 16 }}>
                        {project.allocations.map(a => (
                          <li key={a.id}>
                            {a.material?.name || `Material ${a.materialId}`} - {a.quantityAllocated}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      'No allocations'
                    )}
                  </TableCell>
                  <TableCell align='center'>
                    <IconButton color='primary'>
                      <Link href={`/projects/${project.id}`} passHref>
                       <VisibilityIcon />

                      </Link>
                    </IconButton>
                    <IconButton color='secondary' onClick={() => handleEdit(project.id)}>
                      <Link href={`/projects/form?id=${project.id}`} passHref>
                        <EditIcon />
                      </Link>
                    </IconButton>
                    <IconButton color='error' onClick={() => handleDelete(project.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <TablePagination
            component='div'
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </TableContainer>
      )}
    </div>
  )
}

export default ProjectTable
