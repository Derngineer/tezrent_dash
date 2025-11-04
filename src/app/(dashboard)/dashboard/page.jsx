'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// Component Imports
import CardStatVertical from '@components/card-statistics/Vertical'

// API Imports
import { equipmentAPI, rentalsAPI } from '@/services/api'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState({
    totalEquipment: 0,
    activeRentals: 0,
    pendingApprovals: 0,
    monthlyRevenue: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [topEquipment, setTopEquipment] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('⏳ Loading dashboard data...')
      const startTime = Date.now()

      // Use the single dashboard summary endpoint
      const dashboardData = await rentalsAPI.getDashboardSummary()

      console.log('Dashboard Summary:', dashboardData)
      console.log('Summary object:', dashboardData?.summary)
      console.log('Recent activity:', dashboardData?.recent_activity)
      console.log('Top equipment:', dashboardData?.top_equipment)
      console.log(`✅ Dashboard loaded in ${Date.now() - startTime}ms`)

      // Set metrics from summary
      if (dashboardData && dashboardData.summary) {
        setMetrics({
          totalEquipment: dashboardData.summary.total_equipment || 0,
          activeRentals: dashboardData.summary.active_rentals || 0,
          pendingApprovals: dashboardData.summary.pending_approvals || 0,
          monthlyRevenue: parseFloat(dashboardData.summary.monthly_revenue || 0)
        })
      }

      // Set recent activity
      if (dashboardData && dashboardData.recent_activity) {
        setRecentActivity(dashboardData.recent_activity.map((item, index) => ({
          ...item,
          id: item.id || `activity-${index}`
        })))
      }

      // Set top equipment
      if (dashboardData && dashboardData.top_equipment) {
        setTopEquipment(dashboardData.top_equipment.map((item, index) => ({
          id: item.id || `equipment-${index}`,
          name: item.name,
          category: item.category,
          category_name: item.category_name || item.category,
          times_rented: item.total_rentals || item.times_rented || 0,
          revenue: parseFloat(item.total_revenue || 0),
          daily_rate: parseFloat(item.daily_rate || 0)
        })))
      }

    } catch (err) {
      console.error('Dashboard loading error:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = status => {
    const colors = {
      pending: 'warning',
      approved: 'info',
      in_progress: 'primary',
      delivered: 'success',
      in_use: 'success',
      completed: 'success',
      rejected: 'error',
      cancelled: 'error'
    }

    return colors[status] || 'default'
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      {/* Error Alert */}
      {error && (
        <Grid item xs={12}>
          <Alert severity='error' onClose={() => setError(null)}>
            {error}
          </Alert>
        </Grid>
      )}

      {/* Key Metrics Cards */}
      <Grid item xs={12} sm={6} md={3}>
        <CardStatVertical
          title='Total Equipment'
          stats={metrics.totalEquipment.toString()}
          avatarIcon='ri-tools-line'
          avatarColor='primary'
          subtitle='In your inventory'
          trendNumber=''
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <CardStatVertical
          title='Active Rentals'
          stats={metrics.activeRentals.toString()}
          avatarIcon='ri-calendar-check-line'
          avatarColor='success'
          subtitle='Currently ongoing'
          trendNumber=''
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
              <Box>
                <Typography variant='body2' color='text.secondary'>
                  Pending Approvals
                </Typography>
                <Typography variant='h4' sx={{ mt: 1, mb: 1 }}>
                  {metrics.pendingApprovals}
                </Typography>
                <Button variant='outlined' size='small' href='/rentals/pending' sx={{ mt: 1 }}>
                  View All
                </Button>
              </Box>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'warning.main',
                  color: 'warning.contrastText'
                }}
              >
                <i className='ri-time-line text-[26px]' />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <CardStatVertical
          title='Monthly Revenue'
          stats={formatCurrency(metrics.monthlyRevenue)}
          avatarIcon='ri-money-dollar-circle-line'
          avatarColor='success'
          subtitle='This month'
          trendNumber=''
        />
      </Grid>

      {/* Quick Actions */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 3 }}>
              Quick Actions
            </Typography>
            <Box display='flex' gap={2} flexWrap='wrap'>
              <Button variant='contained' startIcon={<i className='ri-add-line' />} href='/equipment/add'>
                Add New Equipment
              </Button>
              <Button
                variant='outlined'
                startIcon={<i className='ri-time-line' />}
                href='/rentals/pending'
                color='warning'
              >
                Pending Approvals {metrics.pendingApprovals > 0 && `(${metrics.pendingApprovals})`}
              </Button>
              <Button variant='outlined' startIcon={<i className='ri-file-chart-line' />} href='/analytics'>
                View Analytics
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activity */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 3 }}>
              Recent Activity
            </Typography>
            {recentActivity.length === 0 ? (
              <Typography variant='body2' color='text.secondary'>
                No recent activity
              </Typography>
            ) : (
              <Box>
                {recentActivity.map(rental => (
                  <Box
                    key={rental.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 3,
                      pb: 3,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { mb: 0, pb: 0, borderBottom: 'none' }
                    }}
                  >
                    <Box>
                      <Typography variant='body1' sx={{ fontWeight: 500 }}>
                        {rental.equipment_name}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {rental.renter_name} • {formatDate(rental.created_at)}
                      </Typography>
                    </Box>
                    <Chip label={rental.status} color={getStatusColor(rental.status)} size='small' />
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Top Equipment */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 3 }}>
              Top Equipment
            </Typography>
            {topEquipment.length === 0 ? (
              <Typography variant='body2' color='text.secondary'>
                No equipment data available
              </Typography>
            ) : (
              <Box>
                {topEquipment.map((equipment, index) => (
                  <Box
                    key={equipment.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 3,
                      pb: 3,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { mb: 0, pb: 0, borderBottom: 'none' }
                    }}
                  >
                    <Box display='flex' alignItems='center' gap={2}>
                      <Typography variant='h6' color='text.secondary'>
                        #{index + 1}
                      </Typography>
                      <Box>
                        <Typography variant='body1' sx={{ fontWeight: 500 }}>
                          {equipment.name}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {equipment.category_name} • {formatCurrency(equipment.daily_rate)}/day
                        </Typography>
                      </Box>
                    </Box>
                    <Chip label={`${equipment.times_rented || 0} rentals`} size='small' variant='outlined' />
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Dashboard
