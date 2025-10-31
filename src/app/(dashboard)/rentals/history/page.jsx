'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'

// API Imports
import { rentalsAPI } from '@/services/api'

const RentalHistory = () => {
  const [loading, setLoading] = useState(true)
  const [rentals, setRentals] = useState([])
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    payment_status: '',
    start_date: '',
    end_date: '',
    search: ''
  })

  useEffect(() => {
    loadRentalHistory()
  }, [page, rowsPerPage, filters])

  const loadRentalHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching rental history...')

      const params = {
        // owner_company: true, // Removed filter to show all rentals
        status: 'completed,cancelled,disputed',
        ordering: '-end_date',
        page: page + 1,
        page_size: rowsPerPage
      }

      // Apply filters
      if (filters.status) params.status = filters.status
      if (filters.payment_status) params.payment_status = filters.payment_status
      if (filters.start_date) params.start_date_after = filters.start_date
      if (filters.end_date) params.end_date_before = filters.end_date
      if (filters.search) params.search = filters.search

      const data = await rentalsAPI.getRentals(params)
      console.log('History rentals API response:', data)
      
      let rentalsData = []
      if (Array.isArray(data)) {
        rentalsData = data
      } else if (data && data.results && Array.isArray(data.results)) {
        rentalsData = data.results
      }
      
      console.log('Number of history rentals:', rentalsData.length)
      
      setRentals(rentalsData)
      setTotalCount(data.count || rentalsData.length)
    } catch (err) {
      console.error('Failed to load rental history:', err)
      setError(err.message || 'Failed to load rental history')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPage(0)
  }

  const handleClearFilters = () => {
    setFilters({
      status: '',
      payment_status: '',
      start_date: '',
      end_date: '',
      search: ''
    })
    setPage(0)
  }

  const handleExport = () => {
    // Export to CSV functionality
    const csvContent = [
      ['Rental ID', 'Equipment', 'Customer', 'Start Date', 'End Date', 'Duration', 'Amount', 'Status', 'Payment Status'].join(','),
      ...rentals.map(rental =>
        [
          rental.id,
          `"${rental.equipment_name}"`,
          `"${rental.renter_name}"`,
          formatDate(rental.start_date),
          formatDate(rental.end_date),
          rental.rental_duration_days,
          rental.total_amount,
          rental.status,
          rental.payment_status
        ].join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rental-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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
      payment_pending: 'warning',
      confirmed: 'success',
      preparing: 'primary',
      ready_for_pickup: 'info',
      out_for_delivery: 'primary',
      delivered: 'success',
      in_progress: 'success',
      return_requested: 'warning',
      returning: 'info',
      completed: 'success',
      cancelled: 'error',
      overdue: 'error',
      dispute: 'error'
    }
    return colors[status] || 'default'
  }

  const getPaymentStatusColor = status => {
    const colors = {
      paid: 'success',
      pending: 'warning',
      partial: 'warning',
      refunded: 'default',
      overdue: 'error'
    }
    return colors[status] || 'default'
  }

  return (
    <Box>
      {/* Header */}
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={6}>
        <Box>
          <Typography variant='h4'>Rental History</Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            View all past rentals and their details
          </Typography>
        </Box>
        <Button variant='contained' startIcon={<i className='ri-download-line' />} onClick={handleExport}>
          Export to CSV
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' onClose={() => setError(null)} sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label='Search'
                placeholder='Equipment, customer...'
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <i className='ri-search-line' style={{ marginRight: 8, opacity: 0.6 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label='Status'
                value={filters.status}
                onChange={e => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value=''>All Status</MenuItem>
                <MenuItem value='completed'>Completed</MenuItem>
                <MenuItem value='cancelled'>Cancelled</MenuItem>
                <MenuItem value='disputed'>Disputed</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label='Payment Status'
                value={filters.payment_status}
                onChange={e => handleFilterChange('payment_status', e.target.value)}
              >
                <MenuItem value=''>All Payments</MenuItem>
                <MenuItem value='paid'>Paid</MenuItem>
                <MenuItem value='pending'>Pending</MenuItem>
                <MenuItem value='partial'>Partial</MenuItem>
                <MenuItem value='refunded'>Refunded</MenuItem>
                <MenuItem value='overdue'>Overdue</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type='date'
                label='Start Date'
                value={filters.start_date}
                onChange={e => handleFilterChange('start_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type='date'
                label='End Date'
                value={filters.end_date}
                onChange={e => handleFilterChange('end_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <Button fullWidth variant='outlined' onClick={handleClearFilters} sx={{ height: 56 }}>
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rental ID</TableCell>
                <TableCell>Equipment</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell align='center'>Duration</TableCell>
                <TableCell align='right'>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell align='center'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align='center' sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : rentals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align='center' sx={{ py: 8 }}>
                    <Box>
                      <i className='ri-history-line' style={{ fontSize: 48, opacity: 0.3 }} />
                      <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
                        No rental history found
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {filters.search || filters.status || filters.payment_status
                          ? 'Try adjusting your filters'
                          : 'Past rentals will appear here'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                rentals.map(rental => (
                  <TableRow key={rental.id} hover>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>
                        #{rental.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display='flex' alignItems='center' gap={2}>
                        {(rental.equipment?.primary_image || 
                          rental.equipment?.main_image_url || 
                          rental.equipment?.equipment_image || 
                          rental.equipment?.image_gallery?.[0]?.url ||
                          rental.equipment?.images?.[0]?.url) ? (
                          <Box
                            component='img'
                            src={
                              rental.equipment?.primary_image || 
                              rental.equipment?.main_image_url || 
                              rental.equipment?.equipment_image || 
                              rental.equipment?.image_gallery?.[0]?.url ||
                              rental.equipment?.images?.[0]?.url
                            }
                            alt={rental.equipment_name}
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              objectFit: 'cover',
                              backgroundColor: 'grey.200'
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              backgroundColor: 'grey.200',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <i className='ri-image-line' style={{ fontSize: 20, opacity: 0.3 }} />
                          </Box>
                        )}
                        <Box>
                          <Typography variant='body2' sx={{ fontWeight: 500 }}>
                            {rental.equipment_name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{rental.renter_name}</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {rental.renter_phone}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{formatDate(rental.start_date)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{formatDate(rental.end_date)}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Chip label={`${rental.rental_duration_days} days`} size='small' variant='outlined' />
                    </TableCell>
                    <TableCell align='right'>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>
                        {formatCurrency(rental.total_amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={rental.status} color={getStatusColor(rental.status)} size='small' />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={rental.payment_status}
                        color={getPaymentStatusColor(rental.payment_status)}
                        size='small'
                        variant='outlined'
                      />
                    </TableCell>
                    <TableCell align='center'>
                      <IconButton size='small' title='View Details'>
                        <i className='ri-eye-line' />
                      </IconButton>
                      <IconButton size='small' title='Download Invoice'>
                        <i className='ri-download-line' />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component='div'
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Box>
  )
}

export default RentalHistory
