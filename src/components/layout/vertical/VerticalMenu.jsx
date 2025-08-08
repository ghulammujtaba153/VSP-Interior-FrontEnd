// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'
import { useAuth } from '@/context/authContext'
import PermissionWrapper from '@/components/PermissionWrapper'
import { usePermissions } from '@/hooks/usePermissions'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { user } = useAuth()
  const { canView } = usePermissions()
  
  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        
          <MenuItem href='/home' icon={<i className='tabler-smart-home' />}>
            Home
          </MenuItem>
        

        <SubMenu
          label='Users'
          icon={<i className='tabler-brain' />}
        // suffix={<CustomChip label='5' size='small' color='error' round='true' />}
        >
          <PermissionWrapper resource="users">
            <MenuItem href='/users'>Users</MenuItem>
          </PermissionWrapper>
          
          <PermissionWrapper resource="roles">
            <MenuItem href='/users/roles'>Roles</MenuItem>
          </PermissionWrapper>
          
          <PermissionWrapper resource="resources">
            <MenuItem href='/users/resources'>Resources</MenuItem>
          </PermissionWrapper>
        </SubMenu>


        <PermissionWrapper resource="clients">
          <MenuItem href='/clients' icon={<i className='tabler-users' />}>
            Clients
          </MenuItem>
        </PermissionWrapper>


        <PermissionWrapper resource="suppliers">
          <MenuItem href='/suppliers' icon={<i className='tabler-users' />}>
            Suppliers
          </MenuItem>
        </PermissionWrapper>

      </Menu>
      
    </ScrollWrapper>
  )
}

export default VerticalMenu
