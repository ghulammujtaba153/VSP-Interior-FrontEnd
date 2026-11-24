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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Stack,
  Divider,
  IconButton,
  Checkbox,
  FormControlLabel,
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
import apiClient from "@/lib/axios"
import Loader from "@/components/loader/Loader"
import { openSecureUpload } from "@/lib/openSecureFile"
import { toast } from "react-toastify"

const ACK_KEY = (id) => `notice_ack_${id}`

const EmployeeNoticeBoard = () => {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const perPage = 6

  const [viewOpen, setViewOpen] = useState(false)
  const [activeNotice, setActiveNotice] = useState(null)
  const [acknowledged, setAcknowledged] = useState(false)

  const fetchNotices = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get(`/api/notices/get?status=active`)
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

  const filtered = useMemo(() => {
    const result = notices.filter((n) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (n.title || "").toLowerCase().includes(q)
    })
    return result.slice((page - 1) * perPage, page * perPage)
  }, [notices, page, perPage, search])

  const isAcknowledged = (id) => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(ACK_KEY(id)) === "true"
  }

  const handleView = (notice) => {
    setActiveNotice(notice)
    setAcknowledged(isAcknowledged(notice.id))
    setViewOpen(true)
  }

  const handleClose = () => {
    setViewOpen(false)
    setActiveNotice(null)
    setAcknowledged(false)
  }

  const handleDownload = async (notice) => {
    if (!notice.fileUrl) return
    try {
      await openSecureUpload(notice.fileUrl)
    } catch {
      toast.error("Could not download attachment")
    }
  }

  const handleAcknowledge = () => {
    if (!activeNotice) return
    localStorage.setItem(ACK_KEY(activeNotice.id), "true")
    setAcknowledged(true)
    toast.success("Notice acknowledged")
  }

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const getCategoryChip = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c === 'emergency') return <Chip icon={<Warning />} label="URGENT" size="small" color="error" variant="soft" />;
    if (c === 'hr_policy') return <Chip icon={<Policy />} label="POLICY" size="small" color="info" variant="soft" />;
    if (c === 'announcement') return <Chip icon={<Campaign />} label="ANNOUNCEMENT" size="small" color="success" variant="soft" />;
    if (c === 'holiday') return <Chip icon={<Info />} label="HOLIDAY" size="small" color="warning" variant="soft" />;
    if (c === 'event') return <Chip icon={<Campaign />} label="EVENT" size="small" color="primary" variant="soft" />;
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
                <Box sx={{ height: 4, bgcolor: notice.category === 'emergency' ? 'error.main' : 'primary.main' }} />
                <CardContent sx={{ pt: 3 }}>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    {getCategoryChip(notice.category)}
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {isAcknowledged(notice.id) && (
                        <Chip label="Acknowledged" size="small" color="success" variant="outlined" />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
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

      <Dialog open={viewOpen} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{activeNotice?.title}</DialogTitle>
        <DialogContent dividers>
          <Box mb={2}>{getCategoryChip(activeNotice?.category)}</Box>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{activeNotice?.content}</Typography>
          {activeNotice?.fileUrl && (
            <Box mt={4} p={2} sx={{ bgcolor: 'action.hover', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" fontWeight="medium">Attachment available</Typography>
              <Button variant="contained" size="small" startIcon={<DownloadIcon />} onClick={() => handleDownload(activeNotice)}>Download</Button>
            </Box>
          )}
          <Box mt={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={acknowledged}
                  onChange={handleAcknowledge}
                  disabled={acknowledged}
                />
              }
              label="I have read and understood this notice"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 2 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EmployeeNoticeBoard
