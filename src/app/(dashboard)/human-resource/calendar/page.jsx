'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Loader from '@/components/loader/Loader'
import { BASE_URL } from '@/configs/url'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Paper, Typography, Divider, Popover, Box } from '@mui/material'
import Link from 'next/link'

const LeaveCalendar = () => {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/employee-leave/get?page=1&limit=50&search=`)

      const leaveEvents = res.data.employeeLeaves.map(leave => {
        let color
        switch (leave.status.toLowerCase()) {
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
            createdAt: leave.createdAt,
            updatedAt: leave.updatedAt
          }
        }
      })

      setEvents(leaveEvents)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching leave data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleEventClick = clickInfo => {
    setSelectedEvent(clickInfo.event)
    setAnchorEl(clickInfo.el)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setSelectedEvent(null)
  }

  if (loading) return <Loader />

  return (
    <Box component={Paper} className='p-6'>
      <Link href='/human-resource' className='text-primary hover:underline mb-4 inline-block'> &larr; Back to HR & Reports</Link>
      <h2 className='text-xl font-bold mb-4'>Employee Leave Calendar</h2>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView='dayGridMonth'
        events={events}
        height='80vh'
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,dayGridDay'
        }}
        eventClick={handleEventClick}
        eventDidMount={info => {
          // Hand cursor
          info.el.style.cursor = 'pointer'

          // Add hover effect
          info.el.addEventListener('mouseenter', () => {
            info.el.style.boxShadow = '0px 4px 10px rgba(0,0,0,0.2)'
            info.el.style.transform = 'scale(1.02)'
            info.el.style.transition = 'all 0.2s ease-in-out'
          })

          info.el.addEventListener('mouseleave', () => {
            info.el.style.boxShadow = 'none'
            info.el.style.transform = 'scale(1)'
          })
        }}
      />

      {/* MUI Popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
      >
        {selectedEvent && (
          <Paper sx={{ p: 2, maxWidth: 300 }}>
            <Typography variant='h6' gutterBottom>
              {selectedEvent.extendedProps.employee?.name || 'Employee'}
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Typography variant='body2'>
              <b>Type:</b> {selectedEvent.extendedProps.leaveType}
            </Typography>
            <Typography variant='body2'>
              <b>Status:</b> {selectedEvent.extendedProps.status}
            </Typography>
            <Typography variant='body2'>
              <b>Reason:</b> {selectedEvent.extendedProps.reason || 'N/A'}
            </Typography>
            <Typography variant='body2'>
              <b>Start:</b> {selectedEvent.startStr}
            </Typography>
            <Typography variant='body2'>
              <b>End:</b> {selectedEvent.endStr}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant='caption' color='text.secondary' display='block'>
              <b>Created:</b> {new Date(selectedEvent.extendedProps.createdAt).toLocaleString()}
            </Typography>
            <Typography variant='caption' color='text.secondary' display='block'>
              <b>Updated:</b> {new Date(selectedEvent.extendedProps.updatedAt).toLocaleString()}
            </Typography>
          </Paper>
        )}
      </Popover>
    </Box>
  )
}

export default LeaveCalendar
