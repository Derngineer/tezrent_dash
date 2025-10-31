'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import InputAdornment from '@mui/material/InputAdornment'

// API Imports
import { rentalsAPI } from '@/services/api'

const Transactions = () => {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [error, setError] = useState(null)
  
  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('all')
  const [paymentMethod, setPaymentMethod] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  
  // Transaction Detail Drawer
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Statistics
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0
  })

  useEffect(() => {
    loadTransactions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [transactions, searchQuery, paymentStatus, paymentMethod, dateRange])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use the transactions API endpoint with filters
      const params = {}
      if (paymentStatus && paymentStatus !== 'all') {
        params.payout_status = paymentStatus
      }
      if (dateRange && dateRange !== 'all') {
        const now = new Date()
        if (dateRange === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          params.start_date = weekAgo.toISOString().split('T')[0]
        } else if (dateRange === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          params.start_date = monthAgo.toISOString().split('T')[0]
        }
        params.end_date = now.toISOString().split('T')[0]
      }

      const response = await rentalsAPI.getTransactions(params)

      console.log('Transactions Response:', response)

      // Handle different response structures
      let transactionData = []
      let totalsData = null

      if (response.results && Array.isArray(response.results)) {
        // API returns {results: [], totals: {}}
        transactionData = response.results.map(tx => ({
          id: tx.id,
          transactionId: `TXN-${String(tx.id).padStart(6, '0')}`,
          rentalId: tx.rental_reference || `RNT-${String(tx.id).padStart(6, '0')}`,
          date: tx.sale_date || tx.created_at,
          customer: tx.customer_name || 'N/A',
          customerEmail: tx.customer_email || 'N/A',
          customerPhone: tx.customer_phone || 'N/A',
          equipment: tx.equipment_name || 'N/A',
          equipmentCategory: tx.equipment_category || '',
          equipmentId: tx.equipment_id,
          rentalDays: tx.rental_days || 0,
          startDate: tx.rental_start_date,
          endDate: tx.rental_end_date,
          amount: parseFloat(tx.total_revenue || 0),
          commission: parseFloat(tx.platform_commission_amount || 0),
          payout: parseFloat(tx.seller_payout || 0),
          paymentStatus: tx.payout_status || 'pending',
          paymentMethod: tx.payment_method || 'bank_transfer',
          payoutDate: tx.payout_date,
          payoutReference: tx.payout_reference,
          formattedRevenue: tx.formatted_revenue || `AED ${parseFloat(tx.total_revenue || 0).toLocaleString()}`,
          formattedCommission: tx.formatted_commission || `AED ${parseFloat(tx.platform_commission_amount || 0).toLocaleString()}`,
          formattedPayout: tx.formatted_payout || `AED ${parseFloat(tx.seller_payout || 0).toLocaleString()}`,
          createdAt: tx.created_at
        }))
        totalsData = response.totals
      } else if (Array.isArray(response)) {
        // API returns array directly
        transactionData = response.map(tx => ({
          id: tx.id,
          transactionId: `TXN-${String(tx.id).padStart(6, '0')}`,
          rentalId: tx.rental_reference || `RNT-${String(tx.id).padStart(6, '0')}`,
          date: tx.sale_date || tx.created_at,
          customer: tx.customer_name || 'N/A',
          equipment: tx.equipment_name || 'N/A',
          amount: parseFloat(tx.total_revenue || 0),
          payout: parseFloat(tx.seller_payout || 0),
          paymentStatus: tx.payout_status || 'pending',
          createdAt: tx.created_at
        }))
      }

      setTransactions(transactionData)
      
      // Calculate stats from totals or from data
      if (totalsData) {
        setStats({
          totalTransactions: response.count || transactionData.length,
          totalAmount: totalsData.revenue || 0,
          paidAmount: totalsData.payout || 0,
          pendingAmount: 0,
          overdueAmount: 0
        })
      } else {
        calculateStats(transactionData)
      }

    } catch (err) {
      console.error('Failed to load transactions:', err)
      setError(err.message || 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (transactionData) => {
    const totalAmount = transactionData.reduce((sum, t) => sum + (t.amount || 0), 0)
    const paidAmount = transactionData.filter(t => t.paymentStatus === 'paid' || t.payment_status === 'paid').reduce((sum, t) => sum + (t.amount || 0), 0)
    const pendingAmount = transactionData.filter(t => t.paymentStatus === 'pending' || t.payment_status === 'pending').reduce((sum, t) => sum + (t.amount || 0), 0)
    const overdueAmount = transactionData.filter(t => t.paymentStatus === 'overdue' || t.payment_status === 'overdue').reduce((sum, t) => sum + (t.amount || 0), 0)

    setStats({
      totalTransactions: transactionData.length,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount
    })
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.transactionId.toLowerCase().includes(query) ||
        t.customer.toLowerCase().includes(query) ||
        t.equipment.toLowerCase().includes(query) ||
        t.customerEmail.toLowerCase().includes(query)
      )
    }

    // Payment status filter
    if (paymentStatus !== 'all') {
      filtered = filtered.filter(t => t.paymentStatus === paymentStatus)
    }

    // Payment method filter
    if (paymentMethod !== 'all') {
      filtered = filtered.filter(t => t.paymentMethod === paymentMethod)
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date()
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date)
        const diffTime = now - transactionDate
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (dateRange === 'today') return diffDays === 0
        if (dateRange === 'week') return diffDays <= 7
        if (dateRange === 'month') return diffDays <= 30
        if (dateRange === 'quarter') return diffDays <= 90
        return true
      })
    }

    setFilteredTransactions(filtered)
    setPage(0) // Reset to first page when filters change
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction)
    setDrawerOpen(true)
  }

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Date', 'Customer', 'Equipment', 'Amount', 'Payment Status', 'Payment Method']
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        t.transactionId,
        new Date(t.date).toLocaleDateString(),
        t.customer,
        t.equipment,
        t.amount,
        t.paymentStatus,
        t.paymentMethod
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success'
      case 'pending':
        return 'warning'
      case 'overdue':
        return 'error'
      case 'partial':
        return 'info'
      default:
        return 'default'
    }
  }

  const getPaymentMethodLabel = (method) => {
    const labels = {
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      bank_transfer: 'Bank Transfer',
      cash: 'Cash',
      cheque: 'Cheque'
    }
    return labels[method] || method
  }

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const paginatedTransactions = filteredTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

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
          <Typography variant='h4'>Transactions</Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            Manage and track all your payment transactions
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<i className='ri-download-line' />}
          onClick={handleExportCSV}
        >
          Export CSV
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' onClose={() => setError(null)} sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display='flex' alignItems='center' gap={2}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className='ri-file-list-3-line' style={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant='h5'>{stats.totalTransactions}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Transactions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display='flex' alignItems='center' gap={2}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    bgcolor: 'success.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className='ri-check-line' style={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant='h6'>{formatCurrency(stats.paidAmount)}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Paid Amount
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display='flex' alignItems='center' gap={2}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    bgcolor: 'warning.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className='ri-time-line' style={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant='h6'>{formatCurrency(stats.pendingAmount)}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Pending Amount
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display='flex' alignItems='center' gap={2}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    bgcolor: 'error.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className='ri-alert-line' style={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant='h6'>{formatCurrency(stats.overdueAmount)}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Overdue Amount
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size='small'
                placeholder='Search transactions...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-search-line' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size='small'
                label='Payment Status'
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value)}
              >
                <MenuItem value='all'>All Status</MenuItem>
                <MenuItem value='paid'>Paid</MenuItem>
                <MenuItem value='pending'>Pending</MenuItem>
                <MenuItem value='overdue'>Overdue</MenuItem>
                <MenuItem value='partial'>Partial</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size='small'
                label='Payment Method'
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
              >
                <MenuItem value='all'>All Methods</MenuItem>
                <MenuItem value='credit_card'>Credit Card</MenuItem>
                <MenuItem value='debit_card'>Debit Card</MenuItem>
                <MenuItem value='bank_transfer'>Bank Transfer</MenuItem>
                <MenuItem value='cash'>Cash</MenuItem>
                <MenuItem value='cheque'>Cheque</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size='small'
                label='Date Range'
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
              >
                <MenuItem value='all'>All Time</MenuItem>
                <MenuItem value='today'>Today</MenuItem>
                <MenuItem value='week'>Last 7 Days</MenuItem>
                <MenuItem value='month'>Last 30 Days</MenuItem>
                <MenuItem value='quarter'>Last 90 Days</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Equipment</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align='right'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map(transaction => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 500, color: 'primary.main' }}>
                        {transaction.transactionId}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant='body2'>{transaction.customer}</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {transaction.customerEmail}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{transaction.equipment}</TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>
                        {formatCurrency(transaction.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.paymentStatus}
                        color={getPaymentStatusColor(transaction.paymentStatus)}
                        size='small'
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>{getPaymentMethodLabel(transaction.paymentMethod)}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        size='small'
                        variant='outlined'
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align='right'>
                      <IconButton
                        size='small'
                        color='primary'
                        onClick={() => handleViewDetails(transaction)}
                      >
                        <i className='ri-eye-line' />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align='center'>
                    <Box py={6}>
                      <i className='ri-file-search-line' style={{ fontSize: 64, opacity: 0.3 }} />
                      <Typography variant='h6' color='text.secondary' sx={{ mt: 2 }}>
                        No transactions found
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Try adjusting your filters or search criteria
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component='div'
          count={filteredTransactions.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
        />
      </Card>

      {/* Transaction Detail Drawer */}
      <Drawer
        anchor='right'
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 500 } }
        }}
      >
        {selectedTransaction && (
          <Box>
            {/* Header */}
            <Box
              sx={{
                p: 4,
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}
            >
              <Box>
                <Typography variant='h5' sx={{ mb: 1 }}>
                  Transaction Details
                </Typography>
                <Typography variant='body2' sx={{ opacity: 0.9 }}>
                  {selectedTransaction.transactionId}
                </Typography>
              </Box>
              <IconButton size='small' onClick={() => setDrawerOpen(false)} sx={{ color: 'white' }}>
                <i className='ri-close-line' />
              </IconButton>
            </Box>

            {/* Content */}
            <Box sx={{ p: 4 }}>
              {/* Transaction Information */}
              <Box sx={{ mb: 4 }}>
                <Typography variant='h6' sx={{ mb: 3 }}>
                  Transaction Information
                </Typography>
                <Box display='flex' justifyContent='space-between' sx={{ mb: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Transaction ID
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {selectedTransaction.transactionId}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between' sx={{ mb: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Rental ID
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500, color: 'primary.main' }}>
                    {selectedTransaction.rentalId}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between' sx={{ mb: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Transaction Date
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {formatDate(selectedTransaction.date)}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between' sx={{ mb: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Payment Status
                  </Typography>
                  <Chip
                    label={selectedTransaction.paymentStatus}
                    color={getPaymentStatusColor(selectedTransaction.paymentStatus)}
                    size='small'
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='body2' color='text.secondary'>
                    Payment Method
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {getPaymentMethodLabel(selectedTransaction.paymentMethod)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Customer Information */}
              <Box sx={{ mb: 4 }}>
                <Typography variant='h6' sx={{ mb: 3 }}>
                  Customer Information
                </Typography>
                <Box display='flex' alignItems='center' gap={2} sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      bgcolor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <i className='ri-user-line' style={{ fontSize: 24, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant='body1' sx={{ fontWeight: 500 }}>
                      {selectedTransaction.customer}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Customer
                    </Typography>
                  </Box>
                </Box>
                <Box display='flex' gap={1} sx={{ mb: 2 }}>
                  <i className='ri-mail-line' style={{ marginTop: 2 }} />
                  <Box>
                    <Typography variant='caption' color='text.secondary' display='block'>
                      Email
                    </Typography>
                    <Typography variant='body2'>{selectedTransaction.customerEmail}</Typography>
                  </Box>
                </Box>
                <Box display='flex' gap={1}>
                  <i className='ri-phone-line' style={{ marginTop: 2 }} />
                  <Box>
                    <Typography variant='caption' color='text.secondary' display='block'>
                      Phone
                    </Typography>
                    <Typography variant='body2'>{selectedTransaction.customerPhone}</Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Equipment & Rental Details */}
              <Box sx={{ mb: 4 }}>
                <Typography variant='h6' sx={{ mb: 3 }}>
                  Equipment & Rental Details
                </Typography>
                <Box display='flex' justifyContent='space-between' sx={{ mb: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Equipment
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {selectedTransaction.equipment}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between' sx={{ mb: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Start Date
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {formatDate(selectedTransaction.startDate)}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between' sx={{ mb: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    End Date
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {formatDate(selectedTransaction.endDate)}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between' sx={{ mb: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Delivery Required
                  </Typography>
                  <Chip
                    label={selectedTransaction.deliveryRequired ? 'Yes' : 'No'}
                    size='small'
                    color={selectedTransaction.deliveryRequired ? 'success' : 'default'}
                  />
                </Box>
                {selectedTransaction.deliveryRequired && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.5 }}>
                      Delivery Address
                    </Typography>
                    <Typography variant='body2'>{selectedTransaction.deliveryAddress}</Typography>
                  </Box>
                )}
                {selectedTransaction.specialRequests && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.5 }}>
                      Special Requests
                    </Typography>
                    <Typography variant='body2'>{selectedTransaction.specialRequests}</Typography>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Payment Summary */}
              <Box>
                <Typography variant='h6' sx={{ mb: 3 }}>
                  Payment Summary
                </Typography>
                <Box display='flex' justifyContent='space-between' sx={{ mb: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Rental Amount
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {formatCurrency(selectedTransaction.amount)}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between' sx={{ mb: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Security Deposit
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {formatCurrency(selectedTransaction.securityDeposit)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='h6'>Total Amount</Typography>
                  <Typography variant='h6' color='primary'>
                    {formatCurrency(selectedTransaction.amount + selectedTransaction.securityDeposit)}
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button
                  fullWidth
                  variant='outlined'
                  startIcon={<i className='ri-printer-line' />}
                  onClick={() => window.print()}
                >
                  Print
                </Button>
                <Button
                  fullWidth
                  variant='contained'
                  startIcon={<i className='ri-download-line' />}
                >
                  Download Receipt
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  )
}

export default Transactions
