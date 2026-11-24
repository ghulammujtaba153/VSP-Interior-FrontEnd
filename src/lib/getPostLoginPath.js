const OPERATIONAL_RESOURCES = [
  'users',
  'clients',
  'suppliers',
  'inventory',
  'cabinet',
  'human resource',
]

export function getPostLoginPath(user) {
  if (!user) return '/home'

  const roleName = user?.Role?.name || user?.role?.name
  if (
    roleName &&
    ['superadmin', 'super admin', 'super_admin'].includes(roleName.toLowerCase().trim())
  ) {
    return '/home'
  }

  const permissions = user?.Role?.Permissions || []
  const hasOperational = permissions.some(
    (p) => p.canView && OPERATIONAL_RESOURCES.includes(p.Resource?.name?.toLowerCase())
  )

  return hasOperational ? '/home' : '/employee-leave'
}
