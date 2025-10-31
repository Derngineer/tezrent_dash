'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'

// API Imports
import { rentalsAPI } from '@/services/api'

const PendingApprovals = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [rentals, setRentals] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [actionDialog, setActionDialog] = useState({
    open: false,
    type: null, // 'approve' or 'reject'
    rentalId: null,
    message: ''
  })

  useEffect(() => {
    loadPendingRentals()
  }, [])

  const loadPendingRentals = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching pending approvals from seller endpoint...')
      
      // Use the seller-specific pending approvals endpoint
      const data = await rentalsAPI.getPendingApprovals()

      console.log('Pending approvals API response:', data)
      console.log('Response structure:', {
        hasCount: 'count' in data,
        hasResults: 'results' in data,
        isArray: Array.isArray(data)
      })
      
      // Backend returns { count, next, previous, results: [...] }
      let rentalsData = []
      if (data && data.results && Array.isArray(data.results)) {
        rentalsData = data.results
        console.log('Using data.results (pagination response)')
      } else if (Array.isArray(data)) {
        rentalsData = data
        console.log('Using data directly (array response)')
      }
      
      console.log('Number of pending rentals:', rentalsData.length)
      
      if (rentalsData.length > 0) {
        console.log('First rental:', rentalsData[0])
        console.log('Rental reference:', rentalsData[0].rental_reference)
        console.log('Status:', rentalsData[0].status)
        console.log('Equipment:', rentalsData[0].equipment)
        console.log('Customer:', rentalsData[0].customer_name)
      }

      setRentals(rentalsData)
    } catch (err) {
      console.error('Failed to load pending rentals:', err)
      console.error('Error response:', err.response)
      setError(err.response?.data?.detail || err.message || 'Failed to load pending rentals')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    try {
      await rentalsAPI.approveRental(actionDialog.rentalId, actionDialog.message)
      setSuccess('Rental approved successfully!')
      setActionDialog({ open: false, type: null, rentalId: null, message: '' })
      loadPendingRentals()
    } catch (err) {
      setError(err.message || 'Failed to approve rental')
    }
  }

  const handleReject = async () => {
    try {
      await rentalsAPI.rejectRental(actionDialog.rentalId, actionDialog.message)
      setSuccess('Rental rejected')
      setActionDialog({ open: false, type: null, rentalId: null, message: '' })
      loadPendingRentals()
    } catch (err) {
      setError(err.message || 'Failed to reject rental')
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

  return (
    <Grid container spacing={6}>
      {/* Header */}
      <Grid item xs={12}>
        <Typography variant='h4'>Pending Approvals</Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
          Review and approve rental requests from customers
        </Typography>
      </Grid>

      {/* Alerts */}
      {error && (
        <Grid item xs={12}>
          <Alert severity='error' onClose={() => setError(null)}>
            {error}
          </Alert>
        </Grid>
      )}
      {success && (
        <Grid item xs={12}>
          <Alert severity='success' onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </Grid>
      )}

      {/* Content */}
      {loading ? (
        <Grid item xs={12}>
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='300px'>
            <CircularProgress />
          </Box>
        </Grid>
      ) : rentals.length === 0 ? (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box textAlign='center' py={4}>
                <i className='ri-checkbox-circle-line' style={{ fontSize: 64, opacity: 0.3 }} />
                <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
                  No pending approvals
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  All rental requests have been processed
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ) : (
        rentals.map(rental => (
          <Grid item xs={12} key={rental.id}>
            <Card>
              <CardContent>
                <Grid container spacing={4}>
                  {/* Equipment Image */}
                  <Grid item xs={12} md={2}>
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
                        alt={rental.equipment?.name || 'Equipment'}
                        sx={{
                          width: '100%',
                          height: 120,
                          objectFit: 'cover',
                          borderRadius: 1,
                          backgroundColor: 'grey.200'
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: 120,
                          backgroundColor: 'grey.200',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <i className='ri-image-line' style={{ fontSize: 32, opacity: 0.3 }} />
                      </Box>
                    )}
                  </Grid>

                  {/* Rental Details */}
                  <Grid item xs={12} md={6}>
                    <Typography variant='h6' sx={{ mb: 1 }}>
                      {rental.equipment?.name || 'Equipment'}
                    </Typography>

                    <Box display='flex' alignItems='center' gap={2} mb={2}>
                      <Box display='flex' alignItems='center' gap={1}>
                        <i className='ri-user-line' style={{ fontSize: 18, opacity: 0.6 }} />
                        <Typography variant='body2'>{rental.customer?.full_name || 'N/A'}</Typography>
                      </Box>
                      <Box display='flex' alignItems='center' gap={1}>
                        <i className='ri-phone-line' style={{ fontSize: 18, opacity: 0.6 }} />
                        <Typography variant='body2'>{rental.customer?.phone_number || 'N/A'}</Typography>
                      </Box>
                    </Box>

                    <Box display='flex' alignItems='center' gap={2} mb={2}>
                      <Box display='flex' alignItems='center' gap={1}>
                        <i className='ri-calendar-line' style={{ fontSize: 18, opacity: 0.6 }} />
                        <Typography variant='body2'>
                          {formatDate(rental.start_date)} - {formatDate(rental.end_date)}
                        </Typography>
                      </Box>
                      <Chip label={`${rental.total_days || 0} days`} size='small' variant='outlined' />
                    </Box>

                    {rental.customer_notes && (
                      <Box>
                        <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
                          Customer Notes:
                        </Typography>
                        <Typography variant='body2'>{rental.customer_notes}</Typography>
                      </Box>
                    )}

                    {rental.pickup_required && (
                      <Box mt={1}>
                        <Chip
                          icon={<i className='ri-truck-line' />}
                          label={`Delivery: ${rental.delivery_address || 'Address not provided'}`}
                          size='small'
                          variant='outlined'
                          color='primary'
                        />
                      </Box>
                    )}
                  </Grid>

                  {/* Amount & Actions */}
                  <Grid item xs={12} md={4}>
                    <Box display='flex' flexDirection='column' alignItems='flex-end' height='100%' justifyContent='space-between'>
                      <Box textAlign='right'>
                        <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
                          Total Amount
                        </Typography>
                        <Typography variant='h5' color='primary' sx={{ mb: 1 }}>
                          {formatCurrency(rental.total_amount)}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Requested: {formatDate(rental.created_at)}
                        </Typography>
                      </Box>

                      <Box display='flex' gap={1} mt={2}>
                        <Button
                          variant='outlined'
                          startIcon={<i className='ri-eye-line' />}
                          onClick={() => router.push(`/rentals/${rental.id}`)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant='outlined'
                          color='error'
                          onClick={() =>
                            setActionDialog({
                              open: true,
                              type: 'reject',
                              rentalId: rental.id,
                              message: ''
                            })
                          }
                        >
                          Reject
                        </Button>
                        <Button
                          variant='contained'
                          color='success'
                          onClick={() =>
                            setActionDialog({
                              open: true,
                              type: 'approve',
                              rentalId: rental.id,
                              message: 'Your rental request has been approved! Please proceed with payment.'
                            })
                          }
                        >
                          Approve
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))
      )}

      {/* Action Dialog (Approve/Reject) */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, type: null, rentalId: null, message: '' })}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>{actionDialog.type === 'approve' ? 'Approve Rental' : 'Reject Rental'}</DialogTitle>
        <DialogContent>
          <Typography variant='body2' sx={{ mb: 2 }}>
            {actionDialog.type === 'approve'
              ? 'Add a message for the customer about the approval:'
              : 'Please provide a reason for rejection:'}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label={actionDialog.type === 'approve' ? 'Message (Optional)' : 'Reason'}
            value={actionDialog.message}
            onChange={e => setActionDialog(prev => ({ ...prev, message: e.target.value }))}
            placeholder={
              actionDialog.type === 'approve'
                ? 'Your rental is approved! Please proceed with payment.'
                : 'Equipment not available for selected dates'
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, type: null, rentalId: null, message: '' })}>
            Cancel
          </Button>
          <Button
            onClick={actionDialog.type === 'approve' ? handleApprove : handleReject}
            color={actionDialog.type === 'approve' ? 'success' : 'error'}
            variant='contained'
          >
            {actionDialog.type === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default PendingApprovals
