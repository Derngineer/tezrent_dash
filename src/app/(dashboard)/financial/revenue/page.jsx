'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import useTheme from '@mui/material/styles/useTheme'

// Component Imports
import AppReactApexCharts from '@/libs/ApexCharts'

// API Imports
import { rentalsAPI, equipmentAPI } from '@/services/api'

const RevenueDashboard = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('month') // week, month, quarter, year
  
  // Safe color getter with fallback
  const getColor = (path, fallback) => {
    try {
      const keys = path.split('.')
      let value = theme
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key]
        } else {
          return fallback
        }
      }
      return value || fallback
    } catch {
      return fallback
    }
  }
  
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    averageRentalValue: 0,
    totalRentals: 0,
    growthRate: 0
  })

  const [revenueData, setRevenueData] = useState([])
  const [trendSummary, setTrendSummary] = useState(null) // Summary from revenue_trends API
  const [currentPeriod, setCurrentPeriod] = useState('daily') // Track current period for display
  const [categoryRevenue, setCategoryRevenue] = useState([])
  const [topEquipment, setTopEquipment] = useState([])
  const [paymentStatusData, setPaymentStatusData] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [timeRange])

  const loadDashboardData = async () => {
    try {
      console.log('=== Loading Revenue Dashboard Data ===')
      console.log('TimeRange:', timeRange)
      setLoading(true)
      setError(null)

      // Load revenue summary from API
      console.log('Fetching revenue summary...')
      const revenueSummary = await rentalsAPI.getRevenueSummary()

      console.log('Revenue Summary:', revenueSummary)
      console.log('All Time Data:', revenueSummary?.all_time)

      // Set metrics from API response - prioritize all_time for lifetime totals
      if (revenueSummary) {
        setMetrics({
          totalRevenue: revenueSummary.all_time?.total_revenue || revenueSummary.overview?.total_revenue || 0,
          monthlyRevenue: revenueSummary.this_month?.revenue || 0,
          weeklyRevenue: revenueSummary.overview?.total_revenue || 0,
          averageRentalValue: revenueSummary.overview?.average_payout || 0,
          totalRentals: revenueSummary.all_time?.total_sales || revenueSummary.overview?.total_sales || 0,
          growthRate: revenueSummary.growth?.revenue_percentage || 0
        })
      } else {
        setError('Failed to load revenue data')
      }

      // Map timeRange to API parameters
      const trendParams = {
        week: { period: 'daily', days: 7 },
        month: { period: 'daily', days: 30 },
        quarter: { period: 'weekly', days: 84 },
        year: { period: 'monthly', days: 365 },
        alltime: { period: 'monthly', days: 3650 } // ~10 years for all time
      }[timeRange] || { period: 'daily', days: 30 }

      // Store current period for display
      setCurrentPeriod(trendParams.period)

      // Load revenue trends from API
      const trendsResponse = await rentalsAPI.getRevenueTrends(trendParams).catch((err) => {
        console.error('Revenue trends API error:', err)
        return null
      })
      
      if (trendsResponse?.data) {
        console.log('Revenue trends response:', trendsResponse)
        
        // Transform API response to chart format
        const chartData = trendsResponse.data.map(d => ({
          date: d.label,           // Use label for x-axis (e.g., "Nov 04", "Week of Nov 04")
          revenue: d.payout || 0,  // Show payout (what seller receives after commission)
          rentals: d.sales || 0    // Number of rentals
        }))
        setRevenueData(chartData)
        
        // Store summary data
        if (trendsResponse.summary) {
          setTrendSummary(trendsResponse.summary)
        }
      } else {
        console.log('Using fallback mock data for revenue trends')
        // Fallback to mock data if API fails
        const monthlyData = generateRevenueData(timeRange)
        setRevenueData(monthlyData)
        setTrendSummary(null)
      }

      // Generate category revenue
      const categoryData = generateCategoryRevenue([])
      setCategoryRevenue(categoryData)

      // Load top equipment
      const equipment = await equipmentAPI.getMyEquipment({ ordering: '-times_rented', limit: 10 }).catch(() => ({ results: [] }))
      const equipmentRevenue = (equipment.results || []).slice(0, 5).map((item) => ({
        name: item.name,
        revenue: parseFloat(item.daily_rate) * (item.times_rented || 0),
        rentals: item.times_rented || 0
      }))
      setTopEquipment(equipmentRevenue)

      // Payment status distribution - use mock data for now
      const paymentData = [
        { 
          name: 'Paid', 
          value: revenueSummary?.overview?.total_sales || revenueSummary?.all_time?.total_sales || 0, 
          amount: revenueSummary?.overview?.total_revenue || revenueSummary?.all_time?.total_revenue || 0 
        },
        { 
          name: 'Pending', 
          value: revenueSummary?.pending_payouts?.count || 0, 
          amount: revenueSummary?.pending_payouts?.amount || 0 
        },
        { 
          name: 'Overdue', 
          value: 0, 
          amount: 0 
        }
      ]
      console.log('Payment Status Data:', paymentData)
      setPaymentStatusData(paymentData)
    } catch (err) {
      console.error('=== Revenue Dashboard Error ===')
      console.error('Error details:', err)
      console.error('Error response:', err.response)
      console.error('Error message:', err.message)
      setError(err.response?.data?.detail || err.message || 'Failed to load revenue data')
    } finally {
      setLoading(false)
    }
  }

  const generateRevenueData = (range) => {
    // Generate mock data based on time range
    const now = new Date()
    const data = []
    
    if (range === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        data.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: Math.floor(Math.random() * 5000) + 3000,
          rentals: Math.floor(Math.random() * 10) + 5
        })
      }
    } else if (range === 'month') {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        data.push({
          date: date.getDate().toString(),
          revenue: Math.floor(Math.random() * 8000) + 2000,
          rentals: Math.floor(Math.random() * 15) + 5
        })
      }
    } else if (range === 'quarter') {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now)
        date.setMonth(date.getMonth() - i)
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue: Math.floor(Math.random() * 50000) + 30000,
          rentals: Math.floor(Math.random() * 100) + 50
        })
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now)
        date.setMonth(date.getMonth() - i)
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue: Math.floor(Math.random() * 80000) + 40000,
          rentals: Math.floor(Math.random() * 150) + 80
        })
      }
    }
    
    return data
  }

  const generateCategoryRevenue = (rentals) => {
    // In real implementation, you'd calculate this from actual data
    return [
      { name: 'Heavy Machinery', value: 45, revenue: 450000 },
      { name: 'Construction Tools', value: 25, revenue: 250000 },
      { name: 'Power Tools', value: 15, revenue: 150000 },
      { name: 'Lifting Equipment', value: 10, revenue: 100000 },
      { name: 'Others', value: 5, revenue: 50000 }
    ]
  }

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatCompactCurrency = amount => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`
    }
    return amount.toString()
  }

  // ApexCharts Options
  const revenueChartOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: [getColor('palette.primary.main', '#165DFC')],
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      categories: (revenueData && revenueData.length > 0) 
        ? revenueData.map(d => d?.date || '').filter(date => date) 
        : ['No Data'],
      labels: {
        style: {
          colors: getColor('palette.text.secondary', '#666')
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: getColor('palette.text.secondary', '#666')
        },
        formatter: value => formatCompactCurrency(value)
      }
    },
    grid: {
      borderColor: getColor('palette.divider', '#e0e0e0')
    },
    tooltip: {
      theme: getColor('palette.mode', 'light'),
      y: {
        formatter: value => formatCurrency(value)
      }
    }
  }

  const revenueSeries = [{
    name: 'Payout (After Commission)',
    data: revenueData && revenueData.length > 0 
      ? revenueData.filter(d => d && d.revenue != null).map(d => Number(d.revenue) || 0)
      : []
  }]

  const paymentStatusChartOptions = {
    chart: {
      type: 'donut'
    },
    colors: [
      getColor('palette.success.main', '#10b981'),
      getColor('palette.warning.main', '#f59e0b'),
      getColor('palette.error.main', '#ef4444')
    ],
    labels: (paymentStatusData && paymentStatusData.length > 0) 
      ? paymentStatusData
          .filter(d => d && d.name)
          .map(d => String(d.name)) 
      : ['No Data'],
    legend: {
      position: 'bottom',
      labels: {
        colors: getColor('palette.text.primary', '#333')
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              color: getColor('palette.text.primary', '#333'),
              formatter: () => {
                if (!paymentStatusData || paymentStatusData.length === 0) return 'AED 0'
                const total = paymentStatusData.reduce((sum, d) => sum + (d?.amount || 0), 0)
                return formatCurrency(total)
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(0)}%`,
      style: {
        colors: [getColor('palette.common.white', '#ffffff')]
      }
    },
    tooltip: {
      theme: getColor('palette.mode', 'light'),
      y: {
        formatter: (value, { seriesIndex }) => {
          if (!paymentStatusData || !paymentStatusData[seriesIndex]) return 'AED 0'
          return formatCurrency(paymentStatusData[seriesIndex].amount || 0)
        }
      }
    }
  }

  const paymentStatusSeries = paymentStatusData && paymentStatusData.length > 0 
    ? paymentStatusData
        .filter(d => d && d.value != null)
        .map(d => Number(d.value) || 0)
    : []

  const categoryRevenueChartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false }
    },
    colors: [getColor('palette.primary.main', '#165DFC')],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      labels: {
        style: {
          colors: getColor('palette.text.secondary', '#666')
        },
        formatter: value => formatCompactCurrency(value)
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: getColor('palette.text.secondary', '#666')
        }
      }
    },
    grid: {
      borderColor: getColor('palette.divider', '#e0e0e0')
    },
    tooltip: {
      theme: getColor('palette.mode', 'light'),
      y: {
        formatter: value => formatCurrency(value)
      }
    }
  }

  const categoryRevenueSeries = [{
    name: 'Revenue',
    data: categoryRevenue && categoryRevenue.length > 0 
      ? categoryRevenue
          .filter(d => d && d.name && d.revenue != null)
          .map(d => ({
            x: String(d.name),
            y: Number(d.revenue) || 0
          }))
      : []
  }]

  const COLORS = [
    getColor('palette.primary.main', '#165DFC'),
    getColor('palette.success.main', '#10b981'),
    getColor('palette.warning.main', '#f59e0b'),
    getColor('palette.error.main', '#ef4444'),
    getColor('palette.info.main', '#0ea5e9')
  ]

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={6}>
        <Box>
          <Typography variant='h4'>Revenue Dashboard</Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            Track your financial performance and revenue trends
          </Typography>
        </Box>
        <TextField
          select
          size='small'
          value={timeRange}
          onChange={e => setTimeRange(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value='week'>Daily (Last 7 Days)</MenuItem>
          <MenuItem value='month'>Daily (Last 30 Days)</MenuItem>
          <MenuItem value='quarter'>Weekly (Last 12 Weeks)</MenuItem>
          <MenuItem value='year'>Monthly (Last Year)</MenuItem>
          <MenuItem value='alltime'>All Time</MenuItem>
        </TextField>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' onClose={() => setError(null)} sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={6}>
        {/* Key Metrics */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ background: `linear-gradient(135deg, ${getColor('palette.primary.main', '#165DFC')} 0%, ${getColor('palette.primary.dark', '#0d3f9f')} 100%)`, color: 'white' }}>
            <CardContent>
              <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
                <Box>
                  <Typography variant='body2' sx={{ opacity: 0.9, mb: 1 }}>
                    Total Revenue (All Time)
                  </Typography>
                  <Typography variant='h4' sx={{ mb: 1 }}>
                    {formatCurrency(metrics.totalRevenue)}
                  </Typography>
                  <Chip 
                    label={metrics.growthRate >= 0 ? `+${metrics.growthRate}%` : `${metrics.growthRate}%`} 
                    size='small' 
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                    icon={<i className={metrics.growthRate >= 0 ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} style={{ color: 'white' }} />}
                  />
                </Box>
                <Box sx={{ width: 50, height: 50, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className='ri-money-dollar-circle-line' style={{ fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ background: `linear-gradient(135deg, ${getColor('palette.success.main', '#10b981')} 0%, ${getColor('palette.success.dark', '#059669')} 100%)`, color: 'white' }}>
            <CardContent>
              <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
                <Box>
                  <Typography variant='body2' sx={{ opacity: 0.9, mb: 1 }}>
                    Monthly Revenue
                  </Typography>
                  <Typography variant='h4' sx={{ mb: 1 }}>
                    {formatCurrency(metrics.monthlyRevenue)}
                  </Typography>
                  <Typography variant='caption' sx={{ opacity: 0.8 }}>
                    This month
                  </Typography>
                </Box>
                <Box sx={{ width: 50, height: 50, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className='ri-calendar-line' style={{ fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ background: `linear-gradient(135deg, ${getColor('palette.warning.main', '#f59e0b')} 0%, ${getColor('palette.warning.dark', '#d97706')} 100%)`, color: 'white' }}>
            <CardContent>
              <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
                <Box>
                  <Typography variant='body2' sx={{ opacity: 0.9, mb: 1 }}>
                    Avg Rental Value
                  </Typography>
                  <Typography variant='h4' sx={{ mb: 1 }}>
                    {formatCurrency(metrics.averageRentalValue)}
                  </Typography>
                  <Typography variant='caption' sx={{ opacity: 0.8 }}>
                    Per rental
                  </Typography>
                </Box>
                <Box sx={{ width: 50, height: 50, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className='ri-bar-chart-line' style={{ fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ background: `linear-gradient(135deg, ${getColor('palette.info.main', '#0ea5e9')} 0%, ${getColor('palette.info.dark', '#0284c7')} 100%)`, color: 'white' }}>
            <CardContent>
              <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
                <Box>
                  <Typography variant='body2' sx={{ opacity: 0.9, mb: 1 }}>
                    Total Rentals (All Time)
                  </Typography>
                  <Typography variant='h4' sx={{ mb: 1 }}>
                    {metrics.totalRentals}
                  </Typography>
                  <Typography variant='caption' sx={{ opacity: 0.8 }}>
                    All completed rentals
                  </Typography>
                </Box>
                <Box sx={{ width: 50, height: 50, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className='ri-file-list-line' style={{ fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box display='flex' justifyContent='space-between' alignItems='flex-start' mb={3}>
                <Box>
                  <Typography variant='h6'>
                    Payout Trend (After Commission)
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Showing {currentPeriod} breakdown
                  </Typography>
                </Box>
                {trendSummary && (
                  <Box display='flex' gap={3}>
                    <Box textAlign='right'>
                      <Typography variant='caption' color='text.secondary' display='block'>
                        Total Sales
                      </Typography>
                      <Typography variant='h6' color='primary'>
                        {trendSummary.total_sales || 0}
                      </Typography>
                    </Box>
                    <Box textAlign='right'>
                      <Typography variant='caption' color='text.secondary' display='block'>
                        Your Earnings
                      </Typography>
                      <Typography variant='h6' color='success.main'>
                        AED {(trendSummary.total_payout || 0).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box textAlign='right'>
                      <Typography variant='caption' color='text.secondary' display='block'>
                        Avg/{currentPeriod === 'daily' ? 'Day' : currentPeriod === 'weekly' ? 'Week' : 'Month'}
                      </Typography>
                      <Typography variant='h6'>
                        AED {(trendSummary.average_daily || 0).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
              {!loading && revenueData.length > 0 ? (
                <AppReactApexCharts
                  type='area'
                  height={350}
                  options={revenueChartOptions}
                  series={revenueSeries}
                />
              ) : (
                <Box display='flex' justifyContent='center' alignItems='center' height={350}>
                  <Typography color='text.secondary'>No data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Status Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 3 }}>
                Payment Status
              </Typography>
              {!loading && paymentStatusData.length > 0 ? (
                <AppReactApexCharts
                  type='donut'
                  height={350}
                  options={paymentStatusChartOptions}
                  series={paymentStatusSeries}
                />
              ) : (
                <Box display='flex' justifyContent='center' alignItems='center' height={350}>
                  <Typography color='text.secondary'>No data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Category Revenue */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 3 }}>
                Revenue by Category
              </Typography>
              {!loading && categoryRevenue.length > 0 ? (
                <AppReactApexCharts
                  type='bar'
                  height={350}
                  options={categoryRevenueChartOptions}
                  series={categoryRevenueSeries}
                />
              ) : (
                <Box display='flex' justifyContent='center' alignItems='center' height={350}>
                  <Typography color='text.secondary'>No data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Revenue Equipment */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 3 }}>
                Top Revenue Equipment
              </Typography>
              <Box>
                {topEquipment.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 3,
                      pb: 3,
                      borderBottom: index < topEquipment.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider'
                    }}
                  >
                    <Box display='flex' alignItems='center' gap={2}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: COLORS[index % COLORS.length],
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600
                        }}
                      >
                        #{index + 1}
                      </Box>
                      <Box>
                        <Typography variant='body1' sx={{ fontWeight: 500 }}>
                          {item.name}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {item.rentals} rentals
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant='h6' color='primary'>
                      {formatCurrency(item.revenue)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default RevenueDashboard
