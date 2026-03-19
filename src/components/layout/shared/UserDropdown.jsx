'use client'

// React Imports
import { useRef, useState, useEffect } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

// API Import
import { authAPI, getUserProfile } from '@/services/api'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Refs
  const anchorRef = useRef(null)

  // Hooks
  const router = useRouter()

  // Load user profile on mount
  useEffect(() => {
    const loadUser = () => {
      const profile = getUserProfile()

      if (profile) {
        setUser(profile)
      }
    }

    loadUser()
  }, [])

  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false)
  }

  const handleDropdownClose = (event, url) => {
    if (url) {
      router.push(url)
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target)) {
      return
    }

    setOpen(false)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'User'

    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }

    if (user.first_name) return user.first_name
    if (user.company_name) return user.company_name
    if (user.email) return user.email.split('@')[0]

    return 'User'
  }

  // Get user role/company
  const getUserRole = () => {
    if (!user) return ''

    if (user.company_name) return user.company_name
    if (user.role) return user.role

    return 'Seller'
  }

  // Get initials for avatar fallback
  const getInitials = () => {
    const name = getUserDisplayName()
    const parts = name.split(' ')

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }

    return name.substring(0, 2).toUpperCase()
  }

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        <Avatar
          ref={anchorRef}
          alt={getUserDisplayName()}
          onClick={handleDropdownOpen}
          className='cursor-pointer bs-[38px] is-[38px]'
          sx={{ bgcolor: 'primary.main' }}
        >
          {getInitials()}
        </Avatar>
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-4'
        sx={{ zIndex: 1400 }}
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className='shadow-lg'>
              <ClickAwayListener onClickAway={e => handleDropdownClose(e)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-4 gap-2' tabIndex={-1}>
                    <Avatar alt={getUserDisplayName()} sx={{ bgcolor: 'primary.main' }}>
                      {getInitials()}
                    </Avatar>
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium' color='text.primary'>
                        {getUserDisplayName()}
                      </Typography>
                      <Typography variant='caption'>{getUserRole()}</Typography>
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/account-settings')}>
                    <i className='ri-user-3-line' />
                    <Typography color='text.primary'>My Profile</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/account-settings')}>
                    <i className='ri-settings-4-line' />
                    <Typography color='text.primary'>Settings</Typography>
                  </MenuItem>
                  <div className='flex items-center plb-2 pli-4'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={
                        isLoggingOut ? (
                          <CircularProgress size={16} color='inherit' />
                        ) : (
                          <i className='ri-logout-box-r-line' />
                        )
                      }
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
