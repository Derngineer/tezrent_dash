// MUI Imports
import Chip from '@mui/material/Chip'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }) => {
  // Hooks
  const theme = useTheme()
  const { isBreakpointReached, transitionDuration } = useVerticalNav()
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
      {/* Vertical Menu */}
      <Menu
        menuItemStyles={menuItemStyles(theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(theme)}
      >
        <MenuItem href='/dashboard' icon={<i className='ri-dashboard-line' />}>
          Dashboard
        </MenuItem>
        
        <MenuSection label='Equipment'>
          <MenuItem href='/equipment' icon={<i className='ri-tools-line' />}>
            My Equipment
          </MenuItem>
          <MenuItem href='/equipment/add' icon={<i className='ri-add-circle-line' />}>
            Add Equipment
          </MenuItem>
          <MenuItem href='/equipment/media' icon={<i className='ri-dashboard-3-line' />}>
            Media Hub
          </MenuItem>
          <MenuItem href='/equipment/categories' icon={<i className='ri-folder-line' />}>
            Categories
          </MenuItem>
          <MenuItem href='/equipment/banners' icon={<i className='ri-image-2-line' />}>
            Banners
          </MenuItem>
          <MenuItem href='/equipment/tags' icon={<i className='ri-price-tag-3-line' />}>
            Tags
          </MenuItem>
        </MenuSection>
        
        <MenuSection label='Rentals'>
          <MenuItem href='/rentals/pending' icon={<i className='ri-time-line' />}>
            Pending Approvals
          </MenuItem>
          <MenuItem href='/rentals/active' icon={<i className='ri-calendar-check-line' />}>
            Active Rentals
          </MenuItem>
          <MenuItem href='/rentals/history' icon={<i className='ri-history-line' />}>
            Rental History
          </MenuItem>
        </MenuSection>
        
        <MenuSection label='CRM'>
          <MenuItem href='/crm/leads' icon={<i className='ri-user-add-line' />}>
            Leads
          </MenuItem>
          <MenuItem href='/crm/opportunities' icon={<i className='ri-briefcase-line' />}>
            Sales Opportunities
          </MenuItem>
          <MenuItem href='/crm/tickets' icon={<i className='ri-customer-service-line' />}>
            Support Tickets
          </MenuItem>
        </MenuSection>
        
        <MenuSection label='Financial'>
          <MenuItem href='/financial/revenue' icon={<i className='ri-money-dollar-circle-line' />}>
            Revenue Dashboard
          </MenuItem>
          <MenuItem href='/financial/transactions' icon={<i className='ri-file-list-line' />}>
            Transactions
          </MenuItem>
        </MenuSection>
        
        <MenuSection label='Settings'>
          <MenuItem href='/account-settings' icon={<i className='ri-user-settings-line' />}>
            Account Settings
          </MenuItem>
          
          <SubMenu label='Auth Pages' icon={<i className='ri-shield-keyhole-line' />}>
            <MenuItem href='/login'>
              Login
            </MenuItem>
            <MenuItem href='/register'>
              Register
            </MenuItem>
            <MenuItem href='/forgot-password'>
              Forgot Password
            </MenuItem>
          </SubMenu>
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
