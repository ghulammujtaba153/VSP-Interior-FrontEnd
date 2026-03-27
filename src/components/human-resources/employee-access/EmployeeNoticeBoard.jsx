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
  Stack,
  Divider,
} from "@mui/material"
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Search,
  Campaign,
  Info,
  Policy,
  Warning
} from "@mui/icons-material"
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

  const getCategoryChip = (cat) => {
    const c = cat?.toLowerCase();
    if (c === 'urgent') return <Chip icon={<Warning />} label="URGENT" size="small" color="error" variant="soft" />;
    if (c === 'policy') return <Chip icon={<Policy />} label="POLICY" size="small" color="info" variant="soft" />;
    if (c === 'news') return <Chip icon={<Campaign />} label="NEWS" size="small" color="success" variant="soft" />;
    return <Chip icon={<Info />} label={cat || "GENERAL"} size="small" variant="soft" />;
  };

  if (loading) return <Loader />

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Live Notice Feed</Typography>
          <Typography variant="body2" color="text.secondary">Stay updated with the latest company news and announcements</Typography>
        </Box>
        <TextField
          size="small"
          placeholder="Search notices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
          sx={{ minWidth: 300 }}
        />
      </Box>

      <Grid container spacing={4}>
        {filtered.length > 0 ? (
          filtered.map((notice) => (
            <Grid item xs={12} sm={6} md={4} key={notice.id}>
              <Card sx={{ height: "100%", borderRadius: 3, boxShadow: 3, position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ height: 4, bgcolor: notice.category === 'Urgent' ? 'error.main' : 'primary.main' }} />
                <CardContent sx={{ pt: 3 }}>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    {getCategoryChip(notice.category)}
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </Typography>
                  </Stack>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>{notice.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ minHeight: 60, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {notice.content}
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions sx={{ px: 2, justifyContent: 'space-between' }}>
                  <Button size="small" startIcon={<VisibilityIcon />} onClick={() => handleView(notice)}>Read More</Button>
                  {notice.fileUrl && (
                    <IconButton size="small" color="primary" onClick={() => handleDownload(notice)}>
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box textAlign="center" py={10}>
              <Campaign sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">No announcements at the moment</Typography>
            </Box>
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
      <Dialog open={viewOpen} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{activeNotice?.title}</DialogTitle>
        <DialogContent dividers>
          <Box mb={2}>{getCategoryChip(activeNotice?.category)}</Box>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{activeNotice?.content}</Typography>
          {activeNotice?.fileUrl && (
            <Box mt={4} p={2} sx={{ bgcolor: 'action.hover', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" fontWeight="medium">Attachment: {activeNotice.title}.pdf</Typography>
              <Button variant="contained" size="small" startIcon={<DownloadIcon />} onClick={() => handleDownload(activeNotice)}>Download</Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 2 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EmployeeNoticeBoard
