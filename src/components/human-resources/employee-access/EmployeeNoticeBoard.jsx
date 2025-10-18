"use client"

import React, { useEffect, useState, useMemo } from "react"
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
} from "@mui/material"
import VisibilityIcon from "@mui/icons-material/Visibility"
import DownloadIcon from "@mui/icons-material/Download"
import axios from "axios"
import { BASE_URL } from "@/configs/url"
import Loader from "@/components/loader/Loader"

const EmployeeNoticeBoard = () => {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const perPage = 6

  const [viewOpen, setViewOpen] = useState(false)
  const [activeNotice, setActiveNotice] = useState(null)

  // Fetch notices
  const fetchNotices = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${BASE_URL}/api/notices/get?status=active`)
      const data = res.data?.data || res.data || []
      setNotices(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to fetch notices:", err)
      setNotices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotices()
  }, [])

  // Filtered + paginated list
  const filtered = useMemo(() => {
    const result = notices.filter((n) => {
      if (statusFilter !== "all" && n.status.toLowerCase() !== statusFilter) return false
      if (!search) return true
      const q = search.toLowerCase()
      return (n.title || "").toLowerCase().includes(q)
    })
    return result.slice((page - 1) * perPage, page * perPage)
  }, [notices, page, perPage, search, statusFilter])

  // Handlers
  const handleView = (notice) => {
    setActiveNotice(notice)
    setViewOpen(true)
  }

  const handleClose = () => {
    setViewOpen(false)
    setActiveNotice(null)
  }

  const handleDownload = (notice) => {
    if (!notice.fileUrl) return
    const url = `${BASE_URL}${notice.fileUrl}`
    window.open(url, "_blank")
  }

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  if (loading) return <Loader />

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Employee Notice Board
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            variant="outlined"
            label="Search by Title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>

        
      </Grid>

      {/* Notices */}
      <Grid container spacing={2}>
        {filtered.length > 0 ? (
          filtered.map((notice) => (
            <Grid item xs={12} sm={6} md={4} key={notice.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {notice.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {notice.content?.length > 100
                      ? notice.content.slice(0, 100) + "..."
                      : notice.content}
                  </Typography>
                  <Chip
                    label={notice.status}
                    color={notice.status === "active" ? "success" : "default"}
                    size="small"
                  />
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleView(notice)}
                  >
                    View
                  </Button>
                  {notice.fileUrl && (
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(notice)}
                    >
                      Download
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography align="center" color="text.secondary">
              No notices found.
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Pagination */}
      {notices.length > perPage && (
        <Box mt={3} display="flex" justifyContent="center">
          <Pagination
            page={page}
            onChange={handlePageChange}
            count={Math.ceil(notices.length / perPage)}
            color="primary"
          />
        </Box>
      )}

      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{activeNotice?.title}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" gutterBottom>
            {activeNotice?.content}
          </Typography>

          {activeNotice?.fileUrl && (
            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownload(activeNotice)}
              >
                Download PDF
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EmployeeNoticeBoard
