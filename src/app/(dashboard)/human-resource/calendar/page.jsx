'use client'

import React, { useEffect, useState } from 'react'
import apiClient from '@/lib/axios'
import Loader from '@/components/loader/Loader'
import PermissionRoute from '@/components/PermissionRoute'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Paper, Typography, Popover, Box } from '@mui/material'
import Link from 'next/link'

const LeaveCalendar = () => {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)

  const fetchData = async () => {
    try {
      let page = 1
      let allLeaves = []
      let totalPages = 1

      while (page <= totalPages) {
        const res = await apiClient.get(`/api/employee-leave/get?page=${page}&limit=100&search=`)
        const leaves = res.data.employeeLeaves || res.data.data || []
        allLeaves = allLeaves.concat(leaves)
        totalPages = res.data.totalPages || res.data.pagination?.totalPages || 1
        page += 1
      }

      const leaveEvents = allLeaves.map(leave => {
        let color
        switch ((leave.status || '').toLowerCase()) {
          case 'approved':
            color = '#4caf50'
            break
          case 'pending':
            color = '#ff9800'
            break
          case 'rejected':
            color = '#f44336'
            break
          default:
            color = '#2196f3'
        }

        const start = leave.startDate
        const end = new Date(leave.endDate)
        end.setDate(end.getDate() + 1)

        return {
          id: leave.id,
          title: `${leave.employee?.name || 'Employee'} - ${leave.leaveType}`,
          start,
          end: end.toISOString().split('T')[0],
          backgroundColor: color,
          borderColor: color,
          allDay: true,
          extendedProps: {
            employee: leave.employee,
            leaveType: leave.leaveType,
            reason: leave.reason,
            status: leave.status,
          }
        }
      })

      setEvents(leaveEvents)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleEventClick = (info) => {
    setSelectedEvent(info.event)
    setAnchorEl(info.el)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setSelectedEvent(null)
  }

  if (loading) return <Loader />

  return (
    <PermissionRoute resource="human resource">
      <Box sx={{ p: 4 }}>
        <Link href="/human-resource" style={{ textDecoration: 'none' }}>
          <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
            &larr; Back to HR
          </Typography>
        </Link>

        <Typography variant="h5" fontWeight="bold" mb={2}>
          Leave Calendar
        </Typography>

        <Paper sx={{ p: 2 }}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            eventClick={handleEventClick}
            height="auto"
          />
        </Paper>

        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Box sx={{ p: 2, maxWidth: 280 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {selectedEvent?.title}
            </Typography>
            <Typography variant="body2">Status: {selectedEvent?.extendedProps?.status}</Typography>
            <Typography variant="body2">Type: {selectedEvent?.extendedProps?.leaveType}</Typography>
            {selectedEvent?.extendedProps?.reason && (
              <Typography variant="body2">Reason: {selectedEvent.extendedProps.reason}</Typography>
            )}
          </Box>
        </Popover>
      </Box>
    </PermissionRoute>
  )
}

export default LeaveCalendar
