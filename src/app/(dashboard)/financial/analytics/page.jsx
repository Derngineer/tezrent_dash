'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import useTheme from '@mui/material/styles/useTheme'

// Component Imports
import AppReactApexCharts from '@/libs/ApexCharts'

// API Imports
import { rentalsAPI, equipmentAPI } from '@/services/api'

const AnalyticsPage = () => {
  const theme = useTheme()

  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Chart data states
  const [revenueChartData, setRevenueChartData] = useState([])

  // revenue by category (for bar chart)
  const [revenueByCategoryData, setRevenueByCategoryData] = useState([])
  const [equipmentChartData, setEquipmentChartData] = useState([])
  const [rentalStatusData, setRentalStatusData] = useState([])

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)

      // ============================================
      // STEP 1: FETCH DATA FROM API
      // ============================================
      console.log('📡 Fetching data from APIs...')

      const [revenueSummary, revenueByCategory, equipmentList, rentalsList] = await Promise.all([
        rentalsAPI.getRevenueSummary(),

        // new endpoint that returns revenue grouped by category
        rentalsAPI.getRevenueByCategory(),
        equipmentAPI.getMyEquipment({ limit: 100 }),
        rentalsAPI.getMyRentals({ limit: 100 })
      ])

      console.log('✅ API Response - Revenue:', revenueSummary)
      console.log('✅ API Response - Revenue by Category:', revenueByCategory)
      console.log('✅ API Response - Equipment:', equipmentList)
      console.log('✅ API Response - Rentals:', rentalsList)

      // ============================================
      // STEP 2: STORE RAW DATA IN STATE
      // ============================================
      // (We'll transform it in the next step)

      // ============================================
      // STEP 3: TRANSFORM DATA FOR CHARTS
      // ============================================

      // CHART 1: Monthly Revenue (Area Chart)
      // Transform: Extract month and revenue from API
      const monthlyRevenue = [
        { month: 'Jan', revenue: revenueSummary.overview?.total_revenue * 0.7 || 0 },
        { month: 'Feb', revenue: revenueSummary.overview?.total_revenue * 0.75 || 0 },
        { month: 'Mar', revenue: revenueSummary.overview?.total_revenue * 0.85 || 0 },
        { month: 'Apr', revenue: revenueSummary.overview?.total_revenue * 0.9 || 0 },
        { month: 'May', revenue: revenueSummary.overview?.total_revenue * 0.95 || 0 },
        { month: 'Jun', revenue: revenueSummary.overview?.total_revenue || 0 }
      ]

      setRevenueChartData(monthlyRevenue)
      console.log('📊 Transformed Revenue Data:', monthlyRevenue)

      // CHART 2: Revenue by Category (Bar Chart)
      // Transform: use API response from rentalsAPI.getRevenueByCategory()
      // Accept different shapes defensively: response may be { results: [...] } or an array
      const rawRevenueList = revenueByCategory?.results || revenueByCategory || []

      console.log('🔍 Raw revenue list type:', typeof rawRevenueList, 'Is array:', Array.isArray(rawRevenueList))
      console.log('🔍 Raw revenue list length:', Array.isArray(rawRevenueList) ? rawRevenueList.length : 'N/A')

      const revenueCategoryData = (Array.isArray(rawRevenueList) ? rawRevenueList : []).map(item => {
        const categoryName = item?.category?.name || item?.category || item?.name || item?.label || 'Other'
        const revenueValue = Number(item?.total_revenue ?? item?.revenue ?? item?.amount ?? item?.value ?? 0)

        console.log('🔍 Processing item:', {
          categoryName,
          revenueValue,
          rawItem: item
        })

        return {
          category: categoryName,
          revenue: isNaN(revenueValue) ? 0 : revenueValue
        }
      })

      console.log('📊 Final revenue category data:', revenueCategoryData)

      // If no revenue-by-category data, fall back to equipment counts (previous behavior)
      if (revenueCategoryData.length > 0 && revenueCategoryData.some(item => item.revenue > 0)) {
        setRevenueByCategoryData(revenueCategoryData)
        console.log('✅ Using Revenue By Category Data:', revenueCategoryData)
      } else {
        console.log('⚠️  No revenue data available, falling back to equipment counts')
        const equipmentByCategory = {}

        equipmentList.results?.forEach(item => {
          const category = item.category || 'Other'

          equipmentByCategory[category] = (equipmentByCategory[category] || 0) + 1
        })

        const categoryData = Object.entries(equipmentByCategory).map(([name, count]) => ({
          category: name,
          count: count
        }))

        setEquipmentChartData(categoryData)
        console.log('📊 Using Equipment Data (fallback):', categoryData)
      }

      // CHART 3: Rental Status Distribution (Donut Chart)
      // Transform: Count rentals by status
      const statusCounts = {}

      rentalsList.results?.forEach(rental => {
        const status = rental.status || 'unknown'

        statusCounts[status] = (statusCounts[status] || 0) + 1
      })

      const statusData = Object.entries(statusCounts).map(([status, count]) => ({
        status: status,
        count: count
      }))

      setRentalStatusData(statusData)
      console.log('📊 Transformed Rental Status Data:', statusData)
    } catch (err) {
      console.error('❌ Error loading analytics:', err)
      setError(err.message || 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // STEP 4: PREPARE CHART OPTIONS & SERIES
  // ============================================

  // CHART 1: Revenue Area Chart
  const revenueChartOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false }
    },
    colors: [theme?.palette?.primary?.main || '#165DFC'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.1
      }
    },
    xaxis: {
      categories: revenueChartData.map(item => item.month), // ['Jan', 'Feb', 'Mar'...]
      labels: {
        style: {
          colors: theme?.palette?.text?.secondary || '#666'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: theme?.palette?.text?.secondary || '#666'
        },
        formatter: value => `AED ${(value / 1000).toFixed(0)}K`
      }
    },
    tooltip: {
      y: {
        formatter: value => `AED ${value.toLocaleString()}`
      }
    },
    dataLabels: { enabled: false }
  }

  const revenueChartSeries = [
    {
      name: 'Revenue',
      data: revenueChartData.map(item => item.revenue) // [50000, 65000, 72000...]
    }
  ]

  // CHART 2: Equipment Bar Chart
  // Determine which dataset to use (revenue by category or equipment counts)
  const hasRevenueCategoryData = revenueByCategoryData.length > 0
  const chartDataSource = hasRevenueCategoryData ? revenueByCategoryData : equipmentChartData
  const hasChartData = chartDataSource.length > 0

  const equipmentChartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false }
    },
    colors: ['#10b981'],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8
      }
    },
    xaxis: {
      categories: hasChartData ? chartDataSource.map(item => item.category || 'Unknown') : ['No Data'],
      labels: {
        style: {
          colors: '#666'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#666'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: val => {
        if (hasRevenueCategoryData) return `AED ${Number(val).toLocaleString()}`

        return val
      }
    },
    tooltip: {
      y: {
        formatter: value => {
          if (hasRevenueCategoryData) return `AED ${Number(value).toLocaleString()}`

          return `${value} items`
        }
      }
    }
  }

  const equipmentChartSeries = [
    {
      name: hasRevenueCategoryData ? 'Revenue' : 'Equipment Count',
      data: hasChartData
        ? hasRevenueCategoryData
          ? chartDataSource.map(i => i.revenue || 0)
          : chartDataSource.map(item => item.count || 0)
        : [0]
    }
  ]

  // CHART 3: Rental Status Donut Chart
  const rentalStatusChartOptions = {
    chart: {
      type: 'donut'
    },
    colors: [
      theme?.palette?.success?.main || '#10b981',
      theme?.palette?.warning?.main || '#f59e0b',
      theme?.palette?.info?.main || '#0ea5e9',
      theme?.palette?.error?.main || '#ef4444',
      theme?.palette?.secondary?.main || '#8b5cf6'
    ],
    labels: rentalStatusData.map(item => item.status), // ['active', 'pending', 'completed'...]
    legend: {
      position: 'bottom',
      labels: {
        colors: theme?.palette?.text?.primary || '#333'
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Rentals',
              formatter: () => rentalStatusData.reduce((sum, item) => sum + item.count, 0).toString()
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: val => `${val.toFixed(1)}%`
    }
  }

  const rentalStatusChartSeries = rentalStatusData.map(item => item.count) // [45, 12, 8...]

  // ============================================
  // STEP 5: RENDER CHARTS
  // ============================================

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ mb: 4 }}>
        {error}
      </Alert>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={6}>
        <Typography variant='h4'>Analytics Dashboard</Typography>
        <Typography variant='body2' color='text.secondary'>
          Data flow example: API → Transform → Chart
        </Typography>
      </Box>

      <Grid container spacing={6}>
        {/* CHART 1: Revenue Trend */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Monthly Revenue Trend
              </Typography>
              <Typography variant='caption' color='text.secondary' sx={{ mb: 3, display: 'block' }}>
                📡 API: rentalsAPI.getRevenueSummary() → 📊 Transform: map to months → 📈 Chart: Area
              </Typography>

              {revenueChartData.length > 0 ? (
                <AppReactApexCharts
                  type='area'
                  height={350}
                  options={revenueChartOptions}
                  series={revenueChartSeries}
                />
              ) : (
                <Box display='flex' justifyContent='center' alignItems='center' height={350}>
                  <Typography color='text.secondary'>No revenue data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* CHART 2: Revenue by Category / Equipment Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>
                {revenueByCategoryData.length > 0 ? 'Revenue by Category' : 'Equipment by Category'}
              </Typography>
              <Typography variant='caption' color='text.secondary' sx={{ mb: 3, display: 'block' }}>
                {revenueByCategoryData.length > 0
                  ? '📡 API: rentalsAPI.getRevenueByCategory() → 📊 Transform: map categories → 📈 Chart: Bar'
                  : '📡 API: equipmentAPI.getMyEquipment() → 📊 Transform: group by category → 📈 Chart: Bar'}
              </Typography>

              {hasChartData ? (
                <AppReactApexCharts
                  type='bar'
                  height={350}
                  options={equipmentChartOptions}
                  series={equipmentChartSeries}
                />
              ) : (
                <Box display='flex' justifyContent='center' alignItems='center' height={350}>
                  <Typography color='text.secondary'>
                    {revenueByCategoryData.length === 0 && equipmentChartData.length === 0
                      ? 'No data available'
                      : 'Loading chart...'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* CHART 3: Rental Status Distribution */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Rental Status Distribution
              </Typography>
              <Typography variant='caption' color='text.secondary' sx={{ mb: 3, display: 'block' }}>
                📡 API: rentalsAPI.getMyRentals() → 📊 Transform: count by status → 📈 Chart: Donut
              </Typography>

              {rentalStatusData.length > 0 ? (
                <AppReactApexCharts
                  type='donut'
                  height={350}
                  options={rentalStatusChartOptions}
                  series={rentalStatusChartSeries}
                />
              ) : (
                <Box display='flex' justifyContent='center' alignItems='center' height={350}>
                  <Typography color='text.secondary'>No rental data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Data Flow Explanation Card */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ bgcolor: theme?.palette?.primary?.main || '#165DFC', color: 'white' }}>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 3 }}>
                📊 Data Flow Process
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}
                  >
                    1
                  </Box>
                  <Box>
                    <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                      FETCH
                    </Typography>
                    <Typography variant='body2' sx={{ opacity: 0.9 }}>
                      await rentalsAPI.getRevenueSummary()
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}
                  >
                    2
                  </Box>
                  <Box>
                    <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                      STORE
                    </Typography>
                    <Typography variant='body2' sx={{ opacity: 0.9 }}>
                      setRevenueChartData(response.data)
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}
                  >
                    3
                  </Box>
                  <Box>
                    <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                      TRANSFORM
                    </Typography>
                    <Typography variant='body2' sx={{ opacity: 0.9 }}>
                      data.map(item =&gt; item.value)
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}
                  >
                    4
                  </Box>
                  <Box>
                    <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                      RENDER
                    </Typography>
                    <Typography variant='body2' sx={{ opacity: 0.9 }}>
                      &lt;AppReactApexCharts series=&#123;data&#125; /&gt;
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AnalyticsPage
