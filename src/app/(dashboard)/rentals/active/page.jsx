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
import LinearProgress from '@mui/material/LinearProgress'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'

// API Imports
import { rentalsAPI } from '@/services/api'

const ActiveRentals = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [rentals, setRentals] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [actionDialog, setActionDialog] = useState({
    open: false,
    type: null, // 'delivered' or 'returned'
    rentalId: null,
    notes: ''
  })

  // Helper function to get equipment image
  const getEquipmentImage = (rental) => {
    const equipment = rental?.equipment
    if (!equipment) return null
    
    console.log('Getting image for rental:', rental.id, 'Equipment:', equipment)
    
    // Try all possible image field variations
    const image = equipment.primary_image || 
           equipment.main_image_url || 
           equipment.equipment_image || 
           equipment.image_gallery?.[0]?.url ||
           equipment.images?.[0]?.url ||
           equipment.image_gallery?.[0]?.image ||
           equipment.images?.[0]?.image ||
           rental.equipment_image ||
           null
    
    console.log('Selected image:', image)
    return image
  }

  useEffect(() => {
    loadActiveRentals()
  }, [])

  const loadActiveRentals = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching active rentals from seller endpoint...')
      
      // Use the seller-specific active rentals endpoint
      const data = await rentalsAPI.getActiveRentals()

      console.log('Active rentals API response:', data)
      
      // Backend returns { count, next, previous, results: [...] }
      let rentalsData = []
      if (data && data.results && Array.isArray(data.results)) {
        rentalsData = data.results
      } else if (Array.isArray(data)) {
        rentalsData = data
      }
      
      console.log('Number of active rentals:', rentalsData.length)
      
      if (rentalsData.length > 0) {
        console.log('First active rental:', rentalsData[0])
        console.log('First rental equipment:', rentalsData[0].equipment)
        console.log('First rental equipment keys:', rentalsData[0].equipment ? Object.keys(rentalsData[0].equipment) : 'no equipment')
        console.log('First rental equipment?.primary_image:', rentalsData[0].equipment?.primary_image)
        console.log('First rental equipment?.main_image_url:', rentalsData[0].equipment?.main_image_url)
        console.log('First rental equipment?.equipment_image:', rentalsData[0].equipment?.equipment_image)
        console.log('First rental equipment?.image_gallery:', rentalsData[0].equipment?.image_gallery)
        console.log('First rental equipment?.images:', rentalsData[0].equipment?.images)
      }

      setRentals(rentalsData)
    } catch (err) {
      console.error('Failed to load active rentals:', err)
      console.error('Error response:', err.response)
      setError(err.response?.data?.detail || err.message || 'Failed to load active rentals')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkDelivered = async () => {
    try {
      await rentalsAPI.markDelivered(actionDialog.rentalId, actionDialog.notes)
      setSuccess('Rental marked as delivered')
      setActionDialog({ open: false, type: null, rentalId: null, notes: '' })
      loadActiveRentals()
    } catch (err) {
      setError(err.message || 'Failed to mark as delivered')
    }
  }

  const handleMarkReturned = async () => {
    try {
      await rentalsAPI.markReturned(actionDialog.rentalId, actionDialog.notes)
      setSuccess('Rental marked as returned')
      setActionDialog({ open: false, type: null, rentalId: null, notes: '' })
      loadActiveRentals()
    } catch (err) {
      setError(err.message || 'Failed to mark as returned')
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

  const calculateProgress = (startDate, endDate) => {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    const now = Date.now()
    const total = end - start
    const elapsed = now - start

    return Math.min(Math.max((elapsed / total) * 100, 0), 100)
  }

  const getDaysRemaining = endDate => {
    const end = new Date(endDate).getTime()
    const now = Date.now()
    const diff = end - now
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    return Math.max(days, 0)
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
      pending: 'warning',
      partial: 'warning',
      paid: 'success',
      overdue: 'error'
    }

    return colors[status] || 'default'
  }

  return (
    <Grid container spacing={6}>
      {/* Header */}
      <Grid item xs={12}>
        <Typography variant='h4'>Active Rentals</Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
          Monitor and manage ongoing equipment rentals
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
                <i className='ri-calendar-line' style={{ fontSize: 64, opacity: 0.3 }} />
                <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
                  No active rentals
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  All rentals have been completed or there are no ongoing rentals
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ) : (
        rentals.map(rental => {
          const progress = calculateProgress(rental.start_date, rental.end_date)
          const daysRemaining = getDaysRemaining(rental.end_date)

          return (
            <Grid item xs={12} key={rental.id}>
              <Card>
                <CardContent>
                  <Grid container spacing={4}>
                    {/* Equipment Image */}
                    <Grid item xs={12} md={2}>
                      {getEquipmentImage(rental) ? (
                        <Box
                          component='img'
                          src={getEquipmentImage(rental)}
                          alt={rental.equipment?.name || 'Equipment'}
                          sx={{
                            width: '100%',
                            height: 120,
                            objectFit: 'cover',
                            borderRadius: 1,
                            backgroundColor: 'grey.200'
                          }}
                          onError={(e) => {
                            console.error('Failed to load image:', e.target.src)
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
                    <Grid item xs={12} md={7}>
                      <Box display='flex' justifyContent='space-between' alignItems='start' mb={2}>
                        <Typography variant='h6'>{rental.equipment?.name || 'Equipment'}</Typography>
                        <Box display='flex' gap={1}>
                          <Chip label={rental.status_display || rental.status} color={getStatusColor(rental.status)} size='small' />
                        </Box>
                      </Box>

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

                      <Box mb={2}>
                        <Box display='flex' justifyContent='space-between' mb={1}>
                          <Typography variant='body2' color='text.secondary'>
                            Rental Period: {formatDate(rental.start_date)} - {formatDate(rental.end_date)}
                          </Typography>
                          <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
                            {daysRemaining} days remaining
                          </Typography>
                        </Box>
                        <LinearProgress variant='determinate' value={progress} sx={{ height: 8, borderRadius: 1 }} />
                      </Box>

                      <Box display='flex' gap={2}>
                        <Typography variant='body2' color='text.secondary'>
                          Duration: {rental.total_days || 0} days
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          •
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Amount: {formatCurrency(rental.total_amount)}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Actions */}
                    <Grid item xs={12} md={3}>
                      <Box display='flex' flexDirection='column' gap={1}>
                        <Button
                          variant='contained'
                          size='small'
                          startIcon={<i className='ri-eye-line' />}
                          onClick={() => router.push(`/rentals/${rental.id}`)}
                        >
                          View Details
                        </Button>
                        <Button variant='outlined' size='small' startIcon={<i className='ri-mail-line' />}>
                          Contact Customer
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )
        })
      )}

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, type: null, rentalId: null, notes: '' })}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>{actionDialog.type === 'delivered' ? 'Mark as Delivered' : 'Mark as Returned'}</DialogTitle>
        <DialogContent>
          <Typography variant='body2' sx={{ mb: 2 }}>
            {actionDialog.type === 'delivered'
              ? 'Add notes about the delivery (optional):'
              : 'Add notes about the return condition (optional):'}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label='Notes'
            value={actionDialog.notes}
            onChange={e => setActionDialog(prev => ({ ...prev, notes: e.target.value }))}
            placeholder={
              actionDialog.type === 'delivered'
                ? 'Equipment delivered in excellent condition'
                : 'Equipment returned with normal wear and tear'
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, type: null, rentalId: null, notes: '' })}>Cancel</Button>
          <Button
            onClick={actionDialog.type === 'delivered' ? handleMarkDelivered : handleMarkReturned}
            color='primary'
            variant='contained'
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default ActiveRentals
