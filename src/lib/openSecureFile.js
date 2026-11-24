import apiClient from '@/lib/axios'
import { toSecureUploadUrl } from '@/lib/hrUtils'

/** Open an authenticated API URL (e.g. payslip PDF/HTML) in a new tab. */
export async function openAuthenticatedFile(path) {
  const res = await apiClient.get(path, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

/** Open a secured upload (notices, employee documents) with auth headers. */
export async function openSecureUpload(fileUrl) {
  const path = toSecureUploadUrl(fileUrl)
  if (!path?.startsWith('/api/')) {
    window.open(fileUrl, '_blank')
    return
  }
  await openAuthenticatedFile(path)
}
