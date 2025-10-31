'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

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
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Timeline from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'
import Avatar from '@mui/material/Avatar'

// API Imports
import { rentalsAPI } from '@/services/api'

const RentalDetail = () => {
  const params = useParams()
  const router = useRouter()
  const rentalId = params.id

  const [loading, setLoading] = useState(true)
  const [rental, setRental] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [updateDialog, setUpdateDialog] = useState({
    open: false,
    newStatus: '',
    notes: ''
  })
  const [uploadDialog, setUploadDialog] = useState({
    open: false,
    documentType: '',
    file: null,
    title: ''
  })

  // Status options for update - matches backend RENTAL_STATUS_CHOICES
  const statusOptions = [
    { value: 'approved', label: 'Approved', allowedFrom: ['pending'] },
    { value: 'payment_pending', label: 'Payment Pending', allowedFrom: ['approved'] },
    { value: 'confirmed', label: 'Confirmed', allowedFrom: ['payment_pending', 'approved'] },
    { value: 'preparing', label: 'Preparing Equipment', allowedFrom: ['confirmed'] },
    { value: 'ready_for_pickup', label: 'Ready for Pickup', allowedFrom: ['preparing'] },
    { value: 'out_for_delivery', label: 'Out for Delivery', allowedFrom: ['ready_for_pickup'] },
    { value: 'delivered', label: 'Equipment Delivered', allowedFrom: ['out_for_delivery'] },
    { value: 'in_progress', label: 'Rental in Progress', allowedFrom: ['delivered'] },
    { value: 'return_requested', label: 'Return Requested', allowedFrom: ['in_progress'] },
    { value: 'returning', label: 'Equipment Returning', allowedFrom: ['return_requested'] },
    { value: 'completed', label: 'Completed', allowedFrom: ['returning', 'in_progress'] },
    { value: 'cancelled', label: 'Cancelled', allowedFrom: ['pending', 'approved', 'payment_pending'] },
    { value: 'overdue', label: 'Overdue', allowedFrom: ['in_progress', 'delivered'] },
    { value: 'dispute', label: 'Under Dispute', allowedFrom: ['in_progress', 'delivered', 'return_requested'] }
  ]

  // Document types - matches backend DOCUMENT_TYPES
  const documentTypes = [
    { value: 'rental_agreement', label: 'Rental Agreement' },
    { value: 'operating_manual', label: 'Operating Manual' },
    { value: 'insurance_document', label: 'Insurance Document' },
    { value: 'delivery_receipt', label: 'Delivery Receipt' },
    { value: 'return_receipt', label: 'Return Receipt' },
    { value: 'damage_report', label: 'Damage Report' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'payment_receipt', label: 'Payment Receipt' },
    { value: 'other', label: 'Other' }
  ]

  useEffect(() => {
    loadRental()
  }, [rentalId])

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  const loadRental = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await rentalsAPI.getRental(rentalId)
      console.log('Rental detail:', data)
      console.log('Equipment object:', data.equipment)
      console.log('Equipment object keys:', data.equipment ? Object.keys(data.equipment) : 'no equipment')
      console.log('Rental images array:', data.images)
      console.log('Rental first image:', data.images?.[0])
      console.log('Equipment main_image_url:', data.equipment?.main_image_url)
      console.log('Equipment images array:', data.equipment?.images)
      console.log('Equipment first image:', data.equipment?.images?.[0])
      console.log('Equipment_image field:', data.equipment_image)
      console.log('All rental keys:', Object.keys(data))
      setRental(data)
    } catch (err) {
      console.error('Failed to load rental:', err)
      setError(err.response?.data?.detail || err.message || 'Failed to load rental details')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    try {
      await rentalsAPI.approveRental(rentalId, 'Rental request approved. Customer can proceed with payment.')
      setSuccess('Rental approved successfully!')
      loadRental()
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to approve rental')
    }
  }

  const handleUpdateStatus = async () => {
    try {
      await rentalsAPI.updateStatus(
        rentalId,
        updateDialog.newStatus,
        updateDialog.notes,
        true // visible to customer
      )
      setSuccess(`Status updated to ${updateDialog.newStatus}`)
      setUpdateDialog({ open: false, newStatus: '', notes: '' })
      loadRental()
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update status')
    }
  }

  const handleCancel = async reason => {
    try {
      await rentalsAPI.cancelRental(rentalId, reason)
      setSuccess('Rental cancelled successfully')
      loadRental()
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to cancel rental')
    }
  }

  const handleUploadDocument = async () => {
    try {
      if (!uploadDialog.file || !uploadDialog.documentType || !uploadDialog.title) {
        setError('Please fill all required fields')
        return
      }

      const formData = new FormData()
      formData.append('file', uploadDialog.file)
      formData.append('document_type', uploadDialog.documentType)
      formData.append('title', uploadDialog.title)
      formData.append('visible_to_customer', 'true')

      // Get token from localStorage
      const token = localStorage.getItem('accessToken')
      
      const response = await fetch(
        `http://localhost:8000/api/rentals/rentals/${rentalId}/upload_document/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      )

      const data = await response.json()
      
      if (response.ok) {
        setSuccess('Document uploaded successfully!')
        setUploadDialog({ open: false, documentType: '', file: null, title: '' })
        loadRental() // Reload to show new document
      } else {
        setError(data.error || 'Failed to upload document')
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload document')
    }
  }

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0)
  }

  const formatDate = dateString => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatDateTime = dateString => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getAvailableStatuses = () => {
    if (!rental) return []
    return statusOptions.filter(option => option.allowedFrom.includes(rental.status))
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  if (!rental) {
    return (
      <Box>
        <Alert severity='error'>Rental not found</Alert>
        <Button variant='contained' onClick={() => router.push('/rentals/pending')} sx={{ mt: 2 }}>
          Back to Rentals
        </Button>
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      {/* Header */}
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Box>
            <Typography variant='h4' sx={{ mb: 1 }}>
              {rental.rental_reference}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Created: {formatDateTime(rental.created_at)}
            </Typography>
          </Box>
          <Chip label={rental.status_display || rental.status} color={getStatusColor(rental.status)} size='large' />
        </Box>
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

      {/* Equipment Info */}
      <Grid item xs={12} md={7}>
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 3 }}>
              Equipment Details
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
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
                      height: 200,
                      objectFit: 'cover',
                      borderRadius: 2,
                      backgroundColor: 'grey.200'
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', e.target.src)
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      backgroundColor: 'grey.200',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <i className='ri-image-line' style={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} md={8}>
                <Typography variant='h5' sx={{ mb: 1 }}>
                  {rental.equipment?.name || 'Equipment'}
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                  {rental.equipment?.category_name || 'Category'}
                </Typography>

                {rental.equipment?.brand && (
                  <Box display='flex' alignItems='center' gap={1} mb={1}>
                    <i className='ri-building-line' style={{ fontSize: 18, opacity: 0.6 }} />
                    <Typography variant='body2'>Brand: {rental.equipment.brand}</Typography>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant='subtitle2' sx={{ mb: 1 }}>
                  Rental Period
                </Typography>
                <Box display='flex' alignItems='center' gap={1} mb={1}>
                  <i className='ri-calendar-line' style={{ fontSize: 18, opacity: 0.6 }} />
                  <Typography variant='body2'>
                    {formatDate(rental.start_date)} - {formatDate(rental.end_date)}
                  </Typography>
                </Box>
                <Chip label={`${rental.total_days || 0} days`} size='small' variant='outlined' />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 3 }}>
              Customer Information
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box display='flex' alignItems='center' gap={1} mb={2}>
                  <i className='ri-user-line' style={{ fontSize: 18, opacity: 0.6 }} />
                  <Typography variant='body2'>{rental.customer?.full_name || 'N/A'}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box display='flex' alignItems='center' gap={1} mb={2}>
                  <i className='ri-phone-line' style={{ fontSize: 18, opacity: 0.6 }} />
                  <Typography variant='body2'>{rental.customer?.phone_number || rental.customer_phone}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box display='flex' alignItems='center' gap={1} mb={2}>
                  <i className='ri-mail-line' style={{ fontSize: 18, opacity: 0.6 }} />
                  <Typography variant='body2'>{rental.customer?.email || rental.customer_email}</Typography>
                </Box>
              </Grid>
            </Grid>

            {rental.delivery_address && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant='subtitle2' sx={{ mb: 1 }}>
                  Delivery Information
                </Typography>
                <Box display='flex' alignItems='start' gap={1}>
                  <i className='ri-map-pin-line' style={{ fontSize: 18, opacity: 0.6, marginTop: 2 }} />
                  <Box>
                    <Typography variant='body2'>{rental.delivery_address}</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {rental.delivery_city}, {rental.delivery_country}
                    </Typography>
                    {rental.delivery_instructions && (
                      <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                        Instructions: {rental.delivery_instructions}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </>
            )}

            {rental.customer_notes && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant='subtitle2' sx={{ mb: 1 }}>
                  Customer Notes
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {rental.customer_notes}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>

        {/* Status History */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 3 }}>
              Status History
            </Typography>

            {rental.status_history && rental.status_history.length > 0 ? (
              <Timeline position='right'>
                {rental.status_history.map((update, index) => (
                  <TimelineItem key={update.id}>
                    <TimelineOppositeContent color='text.secondary' sx={{ flex: 0.3 }}>
                      <Typography variant='caption'>{formatDateTime(update.updated_at)}</Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color={getStatusColor(update.new_status)} />
                      {index < rental.status_history.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant='subtitle2'>{update.new_status}</Typography>
                      {update.notes && (
                        <Typography variant='body2' color='text.secondary'>
                          {update.notes}
                        </Typography>
                      )}
                      <Typography variant='caption' color='text.secondary'>
                        by {update.updated_by_name || 'System'}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                No status updates yet
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Sidebar - Pricing & Actions */}
      <Grid item xs={12} md={5}>
        {/* Pricing Card */}
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 3 }}>
              Pricing Details
            </Typography>

            <Box display='flex' justifyContent='space-between' mb={1}>
              <Typography variant='body2'>Daily Rate</Typography>
              <Typography variant='body2'>{formatCurrency(rental.daily_rate)}</Typography>
            </Box>

            <Box display='flex' justifyContent='space-between' mb={1}>
              <Typography variant='body2'>Duration ({rental.total_days} days)</Typography>
              <Typography variant='body2'>{formatCurrency(rental.subtotal)}</Typography>
            </Box>

            {parseFloat(rental.delivery_fee) > 0 && (
              <Box display='flex' justifyContent='space-between' mb={1}>
                <Typography variant='body2'>Delivery Fee</Typography>
                <Typography variant='body2'>{formatCurrency(rental.delivery_fee)}</Typography>
              </Box>
            )}

            {parseFloat(rental.insurance_fee) > 0 && (
              <Box display='flex' justifyContent='space-between' mb={1}>
                <Typography variant='body2'>Insurance</Typography>
                <Typography variant='body2'>{formatCurrency(rental.insurance_fee)}</Typography>
              </Box>
            )}

            {parseFloat(rental.security_deposit) > 0 && (
              <Box display='flex' justifyContent='space-between' mb={1}>
                <Typography variant='body2' color='primary'>
                  Security Deposit
                </Typography>
                <Typography variant='body2' color='primary'>
                  {formatCurrency(rental.security_deposit)}
                </Typography>
              </Box>
            )}

            {parseFloat(rental.late_fees) > 0 && (
              <Box display='flex' justifyContent='space-between' mb={1}>
                <Typography variant='body2' color='error'>
                  Late Fees
                </Typography>
                <Typography variant='body2' color='error'>
                  {formatCurrency(rental.late_fees)}
                </Typography>
              </Box>
            )}

            {parseFloat(rental.damage_fees) > 0 && (
              <Box display='flex' justifyContent='space-between' mb={1}>
                <Typography variant='body2' color='error'>
                  Damage Fees
                </Typography>
                <Typography variant='body2' color='error'>
                  {formatCurrency(rental.damage_fees)}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Box display='flex' justifyContent='space-between'>
              <Typography variant='h6'>Total Amount</Typography>
              <Typography variant='h6' color='primary'>
                {formatCurrency(rental.total_amount)}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 3 }}>
              Actions
            </Typography>

            <Box display='flex' flexDirection='column' gap={2}>
              {rental.status === 'pending' && (
                <>
                  <Button
                    variant='contained'
                    color='success'
                    fullWidth
                    startIcon={<i className='ri-check-line' />}
                    onClick={handleApprove}
                  >
                    Approve Rental
                  </Button>
                  <Button
                    variant='outlined'
                    color='error'
                    fullWidth
                    startIcon={<i className='ri-close-line' />}
                    onClick={() => {
                      const reason = prompt('Reason for cancellation:')
                      if (reason) handleCancel(reason)
                    }}
                  >
                    Reject Rental
                  </Button>
                </>
              )}

              {getAvailableStatuses().length > 0 && (
                <Button
                  variant='contained'
                  fullWidth
                  startIcon={<i className='ri-arrow-right-line' />}
                  onClick={() => setUpdateDialog({ open: true, newStatus: '', notes: '' })}
                >
                  Update Status
                </Button>
              )}

              <Button
                variant='outlined'
                fullWidth
                startIcon={<i className='ri-refresh-line' />}
                onClick={loadRental}
              >
                Refresh
              </Button>

              <Button
                variant='outlined'
                fullWidth
                startIcon={<i className='ri-arrow-left-line' />}
                onClick={() => router.back()}
              >
                Back
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Payments */}
        {rental.payments && rental.payments.length > 0 && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 3 }}>
                Payments
              </Typography>

              {rental.payments.map(payment => (
                <Box key={payment.id} mb={2} p={2} sx={{ backgroundColor: 'grey.100', borderRadius: 1 }}>
                  <Box display='flex' justifyContent='space-between' mb={1}>
                    <Typography variant='body2'>{payment.payment_type}</Typography>
                    <Chip label={payment.payment_status} size='small' color='success' />
                  </Box>
                  <Typography variant='h6' color='primary'>
                    {formatCurrency(payment.amount)}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {formatDateTime(payment.created_at)}
                  </Typography>
                  {payment.transaction_id && (
                    <Typography variant='caption' display='block' color='text.secondary'>
                      Transaction: {payment.transaction_id}
                    </Typography>
                  )}
                </Box>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
              <Typography variant='h6'>Documents</Typography>
              <Button
                variant='outlined'
                size='small'
                startIcon={<i className='ri-upload-2-line' />}
                onClick={() => setUploadDialog({ open: true, documentType: '', file: null, title: '' })}
              >
                Upload
              </Button>
            </Box>

            {rental.documents && rental.documents.length > 0 ? (
              rental.documents.map(doc => (
                <Box key={doc.id} mb={2} p={2} sx={{ backgroundColor: 'grey.50', borderRadius: 1 }}>
                  <Box display='flex' justifyContent='space-between' alignItems='start'>
                    <Box flex={1}>
                      <Typography variant='body2' fontWeight={600}>
                        {doc.title}
                      </Typography>
                      <Chip label={doc.document_type} size='small' variant='outlined' sx={{ mt: 1 }} />
                      <Typography variant='caption' display='block' color='text.secondary' sx={{ mt: 1 }}>
                        Uploaded: {formatDateTime(doc.uploaded_at)}
                      </Typography>
                    </Box>
                    <Button
                      variant='outlined'
                      size='small'
                      startIcon={<i className='ri-download-2-line' />}
                      href={doc.document}
                      target='_blank'
                    >
                      Download
                    </Button>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant='body2' color='text.secondary' textAlign='center' py={2}>
                No documents uploaded yet
              </Typography>
            )}

            {/* Show if equipment has operating manual */}
            {rental.equipment?.operating_manual && (
              <Box mt={2} p={2} sx={{ backgroundColor: 'info.lighter', borderRadius: 1, border: '1px solid', borderColor: 'info.main' }}>
                <Box display='flex' alignItems='center' gap={1} mb={1}>
                  <i className='ri-book-line' style={{ color: 'var(--mui-palette-info-main)' }} />
                  <Typography variant='body2' fontWeight={600}>
                    Equipment Operating Manual
                  </Typography>
                </Box>
                {rental.equipment?.manual_description && (
                  <Typography variant='caption' color='text.secondary' display='block' mb={1}>
                    {rental.equipment.manual_description}
                  </Typography>
                )}
                <Button
                  variant='contained'
                  size='small'
                  startIcon={<i className='ri-download-2-line' />}
                  href={rental.equipment.operating_manual}
                  target='_blank'
                >
                  Download Manual
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Update Status Dialog */}
      <Dialog
        open={updateDialog.open}
        onClose={() => setUpdateDialog({ open: false, newStatus: '', notes: '' })}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Update Rental Status</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label='New Status'
            value={updateDialog.newStatus}
            onChange={e => setUpdateDialog({ ...updateDialog, newStatus: e.target.value })}
            sx={{ mt: 2, mb: 3 }}
          >
            {getAvailableStatuses().map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            multiline
            rows={4}
            label='Notes'
            placeholder='Add notes about this status change...'
            value={updateDialog.notes}
            onChange={e => setUpdateDialog({ ...updateDialog, notes: e.target.value })}
          />

          <Alert severity='info' sx={{ mt: 2 }}>
            This update will be visible to the customer.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialog({ open: false, newStatus: '', notes: '' })}>Cancel</Button>
          <Button variant='contained' onClick={handleUpdateStatus} disabled={!updateDialog.newStatus}>
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog
        open={uploadDialog.open}
        onClose={() => setUploadDialog({ open: false, documentType: '', file: null, title: '' })}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label='Document Type'
            value={uploadDialog.documentType}
            onChange={e => setUploadDialog({ ...uploadDialog, documentType: e.target.value })}
            sx={{ mt: 2, mb: 3 }}
          >
            {documentTypes.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label='Document Title'
            placeholder='e.g., Delivery Receipt - October 2025'
            value={uploadDialog.title}
            onChange={e => setUploadDialog({ ...uploadDialog, title: e.target.value })}
            sx={{ mb: 3 }}
          />

          <Box
            sx={{
              border: '2px dashed',
              borderColor: 'grey.300',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' }
            }}
            onClick={() => document.getElementById('document-upload-input').click()}
          >
            <input
              id='document-upload-input'
              type='file'
              hidden
              accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
              onChange={e => setUploadDialog({ ...uploadDialog, file: e.target.files[0] })}
            />
            <i className='ri-upload-cloud-2-line' style={{ fontSize: 48, opacity: 0.5 }} />
            <Typography variant='body2' sx={{ mt: 2 }}>
              {uploadDialog.file ? uploadDialog.file.name : 'Click to select file or drag and drop'}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              PDF, DOC, DOCX, JPG, PNG (Max 10MB)
            </Typography>
          </Box>

          <Alert severity='info' sx={{ mt: 2 }}>
            Documents will be visible to the customer and stored with the rental record.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog({ open: false, documentType: '', file: null, title: '' })}>
            Cancel
          </Button>
          <Button
            variant='contained'
            disabled={!uploadDialog.documentType || !uploadDialog.file || !uploadDialog.title}
            onClick={handleUploadDocument}
          >
            Upload Document
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default RentalDetail
