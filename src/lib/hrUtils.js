/** Compute logged hours from a timesheet row (netHours, or start/end/break). */
export function getTimesheetHours(ts, standardDay = 8) {
  if (ts?.netHours != null && Number(ts.netHours) > 0) {
    return Number(ts.netHours)
  }
  if (ts?.startTime && ts?.endTime) {
    const start = new Date(`1970-01-01T${ts.startTime}`)
    const end = new Date(`1970-01-01T${ts.endTime}`)
    let diff = (end - start) / (1000 * 60 * 60)
    if (diff < 0) diff += 24
    const breakH = (Number(ts.breakMinutes) || 0) / 60
    return Math.max(0, diff - breakH)
  }
  return 0
}

export function getOvertimeHours(ts, standardDay = 8) {
  if (ts?.overWork) {
    const parts = String(ts.overWork).split(':')
    return (parseInt(parts[0], 10) || 0) + ((parseInt(parts[1], 10) || 0) / 60)
  }
  const total = getTimesheetHours(ts, standardDay)
  return Math.max(0, total - standardDay)
}

/** Map legacy /uploads/... paths to authenticated secure route. */
export function toSecureUploadUrl(fileUrl) {
  if (!fileUrl) return null
  if (fileUrl.startsWith('/api/uploads/secure/')) return fileUrl
  const match = fileUrl.match(/\/uploads\/(employee-documents|notices)\/(.+)$/)
  if (match) return `/api/uploads/secure/${match[1]}/${match[2]}`
  return fileUrl
}

/** Format amounts for NZ payroll UI. */
export function formatNzd(n, { maximumFractionDigits = 2 } = {}) {
  return Number(n || 0).toLocaleString('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    maximumFractionDigits,
  })
}

export function getRequestDocuments(request) {
  return request?.documents || []
}

export function getLatestDocument(request) {
  const docs = getRequestDocuments(request)
  return docs.length ? docs[docs.length - 1] : null
}

export function docRequestStatusColor(status) {
  switch (status) {
    case 'approved': return 'success'
    case 'pending': return 'warning'
    case 'uploaded': return 'info'
    case 'rejected': return 'error'
    default: return 'default'
  }
}

export function docRequestStatusLabel(status) {
  switch (status) {
    case 'uploaded': return 'Awaiting review'
    default: return status
  }
}
