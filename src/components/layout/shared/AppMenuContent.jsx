'use client'

import PermissionWrapper from '@/components/PermissionWrapper'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuth } from '@/context/authContext'

const OPERATIONAL_RESOURCES = [
  'users',
  'clients',
  'suppliers',
  'inventory',
  'cabinet',
  'human resource',
]

const AppMenuContent = ({ MenuItem, SubMenu }) => {
  const { getAccessibleResources } = usePermissions()
  const { user } = useAuth()
  const accessible = getAccessibleResources()

  const roleName = user?.Role?.name || user?.role?.name
  const isSuperAdmin =
    roleName &&
    ['superadmin', 'super admin', 'super_admin'].includes(roleName.toLowerCase().trim())

  const hasOperationalAccess =
    isSuperAdmin ||
    OPERATIONAL_RESOURCES.some((r) => accessible.includes(r))

  if (user && !hasOperationalAccess) {
    return (
      <>
        <MenuItem href='/home' icon={<i className='tabler-smart-home' />}>
          Home
        </MenuItem>
        <MenuItem href='/employee-leave' icon={<i className='tabler-user-check' />}>
          My HR
        </MenuItem>
        <SubMenu label='Settings' icon={<i className='tabler-settings' />}>
          <MenuItem href='/profile' icon={<i className='tabler-user' />}>
            My Profile
          </MenuItem>
        </SubMenu>
      </>
    )
  }

  return (
    <>
      <MenuItem href='/home' icon={<i className='tabler-smart-home' />}>
        Home
      </MenuItem>

      <PermissionWrapper resource='users'>
        <SubMenu label='User & Access Control' icon={<i className='tabler-brain' />}>
          <PermissionWrapper resource='users'>
            <MenuItem href='/users'>Users</MenuItem>
          </PermissionWrapper>

          <PermissionWrapper resource='roles'>
            <MenuItem href='/users/roles'>Roles</MenuItem>
          </PermissionWrapper>

          <PermissionWrapper resource='users'>
            <MenuItem href='/users/permissions'>Permissions</MenuItem>
          </PermissionWrapper>

          <PermissionWrapper resource='users'>
            <MenuItem href='/users/resources'>Resources</MenuItem>
          </PermissionWrapper>
        </SubMenu>
      </PermissionWrapper>

      <PermissionWrapper resource='clients'>
        <MenuItem href='/clients' icon={<i className='tabler-users' />}>
          Clients
        </MenuItem>
      </PermissionWrapper>

      <SubMenu label='Supplier Management' icon={<i className='tabler-building-warehouse' />}>
        <PermissionWrapper resource='suppliers'>
          <MenuItem href='/suppliers'>Supplier List</MenuItem>
        </PermissionWrapper>

        <PermissionWrapper resource='suppliers'>
          <MenuItem href='/suppliers/pricebook'>Price Book</MenuItem>
        </PermissionWrapper>
      </SubMenu>

      <SubMenu label='Inventory' icon={<i className='tabler-file-text' />}>
        <PermissionWrapper resource='inventory'>
          <MenuItem href='/inventory'>Inventory</MenuItem>
        </PermissionWrapper>

        <PermissionWrapper resource='inventory'>
          <MenuItem href='/inventory/category'>Category</MenuItem>
        </PermissionWrapper>
      </SubMenu>

      <PermissionWrapper resource='cabinet'>
        <MenuItem href='/cabinet/categories' icon={<i className='tabler-door' />}>
          Cabinet
        </MenuItem>
      </PermissionWrapper>

      <MenuItem href='/project' icon={<i className='tabler-briefcase' />}>
        Project Setup
      </MenuItem>

      <MenuItem href='/quotes' icon={<i className='tabler-report' />}>
        Tender / Quotes
      </MenuItem>

      <MenuItem href='/purchasing' icon={<i className='tabler-moneybag' />}>
        Purchasing
      </MenuItem>

      <SubMenu label='Job Scheduling' icon={<i className='tabler-calendar' />}>
        <MenuItem href='/workers'>Workers</MenuItem>
        <MenuItem href='/projects'>Projects</MenuItem>
      </SubMenu>

      <MenuItem href='/tracking-board' icon={<i className='tabler-chart-bar' />}>
        VSP TrackBoard
      </MenuItem>

      <MenuItem href='/accounts' icon={<i className='tabler-cash' />}>
        Accounts
      </MenuItem>

      <MenuItem href='/reports' icon={<i className='tabler-file-text' />}>
        Reports
      </MenuItem>

      <SubMenu label='HR' icon={<i className='tabler-users-group' />}>
        <PermissionWrapper resource='human resource'>
          <MenuItem href='/human-resource'>HR Administration</MenuItem>
        </PermissionWrapper>

        <MenuItem href='/employee-leave'>My HR</MenuItem>
      </SubMenu>

      <SubMenu label='Settings' icon={<i className='tabler-settings' />}>
        <MenuItem href='/profile' icon={<i className='tabler-user' />}>
          My Profile
        </MenuItem>
      </SubMenu>
    </>
  )
}

export default AppMenuContent
