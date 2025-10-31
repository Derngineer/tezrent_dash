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
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Badge from '@mui/material/Badge'

// API Imports
import { crmAPI } from '@/services/api'

const SupportTickets = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [createDialog, setCreateDialog] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [commentText, setCommentText] = useState('')

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: ''
  })

  const [newTicket, setNewTicket] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium'
  })

  useEffect(() => {
    loadTickets()
  }, [filters])

  const loadTickets = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = { ordering: '-created_at' }
      if (filters.status) params.status = filters.status
      if (filters.priority) params.priority = filters.priority
      if (filters.category) params.category = filters.category

      const data = await crmAPI.getTickets(params)
      setTickets(data.results || data)
    } catch (err) {
      console.error('Failed to load tickets:', err)
      setError(err.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTicket = async () => {
    try {
      await crmAPI.createTicket(newTicket)
      setSuccess('Support ticket created successfully!')
      setCreateDialog(false)
      setNewTicket({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        subject: '',
        description: '',
        category: 'general',
        priority: 'medium'
      })
      loadTickets()
    } catch (err) {
      setError(err.message || 'Failed to create ticket')
    }
  }

  const handleAddComment = async ticketId => {
    if (!commentText.trim()) return

    try {
      await crmAPI.addTicketComment(ticketId, commentText, false)
      setSuccess('Comment added successfully')
      setCommentText('')
      // Reload ticket details if needed
      loadTickets()
    } catch (err) {
      setError(err.message || 'Failed to add comment')
    }
  }

  const handleResolveTicket = async ticketId => {
    try {
      await crmAPI.resolveTicket(ticketId, 'Issue resolved')
      setSuccess('Ticket marked as resolved')
      loadTickets()
    } catch (err) {
      setError(err.message || 'Failed to resolve ticket')
    }
  }

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await crmAPI.updateTicket(ticketId, { status: newStatus })
      setSuccess('Status updated successfully')
      loadTickets()
    } catch (err) {
      setError(err.message || 'Failed to update status')
    }
  }

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = status => {
    const colors = {
      open: 'error',
      in_progress: 'warning',
      resolved: 'success',
      closed: 'default'
    }
    return colors[status] || 'default'
  }

  const getPriorityColor = priority => {
    const colors = {
      low: 'default',
      medium: 'info',
      high: 'warning',
      urgent: 'error'
    }
    return colors[priority] || 'default'
  }

  const getCategoryIcon = category => {
    const icons = {
      general: 'ri-question-line',
      equipment_issue: 'ri-tools-line',
      billing: 'ri-money-dollar-circle-line',
      delivery: 'ri-truck-line',
      other: 'ri-more-line'
    }
    return icons[category] || 'ri-customer-service-line'
  }

  const getTicketCounts = () => {
    return {
      open: tickets.filter(t => t.status === 'open').length,
      in_progress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length
    }
  }

  const counts = getTicketCounts()

  return (
    <Grid container spacing={6}>
      {/* Header */}
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Box>
            <Typography variant='h4'>Support Tickets</Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              Manage customer support requests and issues
            </Typography>
          </Box>
          <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => setCreateDialog(true)}>
            Create Ticket
          </Button>
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

      {/* Status Overview */}
      <Grid item xs={12}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
              <CardContent>
                <Box display='flex' justifyContent='space-between' alignItems='center'>
                  <Box>
                    <Typography variant='body2' sx={{ opacity: 0.9 }}>
                      Open Tickets
                    </Typography>
                    <Typography variant='h4' sx={{ mt: 1 }}>
                      {counts.open}
                    </Typography>
                  </Box>
                  <i className='ri-error-warning-line' style={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
              <CardContent>
                <Box display='flex' justifyContent='space-between' alignItems='center'>
                  <Box>
                    <Typography variant='body2' sx={{ opacity: 0.9 }}>
                      In Progress
                    </Typography>
                    <Typography variant='h4' sx={{ mt: 1 }}>
                      {counts.in_progress}
                    </Typography>
                  </Box>
                  <i className='ri-time-line' style={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent>
                <Box display='flex' justifyContent='space-between' alignItems='center'>
                  <Box>
                    <Typography variant='body2' sx={{ opacity: 0.9 }}>
                      Resolved
                    </Typography>
                    <Typography variant='h4' sx={{ mt: 1 }}>
                      {counts.resolved}
                    </Typography>
                  </Box>
                  <i className='ri-check-line' style={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display='flex' justifyContent='space-between' alignItems='center'>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Closed
                    </Typography>
                    <Typography variant='h4' sx={{ mt: 1 }}>
                      {counts.closed}
                    </Typography>
                  </Box>
                  <i className='ri-archive-line' style={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Filters */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label='Status'
                  value={filters.status}
                  onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value=''>All Status</MenuItem>
                  <MenuItem value='open'>Open</MenuItem>
                  <MenuItem value='in_progress'>In Progress</MenuItem>
                  <MenuItem value='resolved'>Resolved</MenuItem>
                  <MenuItem value='closed'>Closed</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label='Priority'
                  value={filters.priority}
                  onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <MenuItem value=''>All Priorities</MenuItem>
                  <MenuItem value='low'>Low</MenuItem>
                  <MenuItem value='medium'>Medium</MenuItem>
                  <MenuItem value='high'>High</MenuItem>
                  <MenuItem value='urgent'>Urgent</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label='Category'
                  value={filters.category}
                  onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                >
                  <MenuItem value=''>All Categories</MenuItem>
                  <MenuItem value='general'>General</MenuItem>
                  <MenuItem value='equipment_issue'>Equipment Issue</MenuItem>
                  <MenuItem value='billing'>Billing</MenuItem>
                  <MenuItem value='delivery'>Delivery</MenuItem>
                  <MenuItem value='other'>Other</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Content */}
      {loading ? (
        <Grid item xs={12}>
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='300px'>
            <CircularProgress />
          </Box>
        </Grid>
      ) : tickets.length === 0 ? (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box textAlign='center' py={4}>
                <i className='ri-customer-service-line' style={{ fontSize: 64, opacity: 0.3 }} />
                <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
                  No support tickets found
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                  {filters.status || filters.priority || filters.category
                    ? 'Try adjusting your filters'
                    : 'All support tickets will appear here'}
                </Typography>
                <Button variant='contained' onClick={() => setCreateDialog(true)} startIcon={<i className='ri-add-line' />}>
                  Create Ticket
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ) : (
        tickets.map(ticket => (
          <Grid item xs={12} md={6} key={ticket.id}>
            <Card>
              <CardContent>
                <Box display='flex' justifyContent='space-between' alignItems='start' mb={2}>
                  <Box display='flex' alignItems='center' gap={1}>
                    <i className={getCategoryIcon(ticket.category)} style={{ fontSize: 24, opacity: 0.6 }} />
                    <Box>
                      <Typography variant='body2' color='text.secondary'>
                        #{ticket.ticket_number || ticket.id}
                      </Typography>
                      <Typography variant='h6'>{ticket.subject}</Typography>
                    </Box>
                  </Box>
                  <Box display='flex' gap={1}>
                    <Chip label={ticket.status} color={getStatusColor(ticket.status)} size='small' />
                    <Chip label={ticket.priority} color={getPriorityColor(ticket.priority)} size='small' variant='outlined' />
                  </Box>
                </Box>

                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                  {ticket.description.length > 150 ? `${ticket.description.substring(0, 150)}...` : ticket.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box display='flex' alignItems='center' justifyContent='space-between' mb={2}>
                  <Box display='flex' alignItems='center' gap={2}>
                    <Box display='flex' alignItems='center' gap={1}>
                      <i className='ri-user-line' style={{ fontSize: 16, opacity: 0.6 }} />
                      <Typography variant='body2'>{ticket.customer_name}</Typography>
                    </Box>
                    <Box display='flex' alignItems='center' gap={1}>
                      <i className='ri-time-line' style={{ fontSize: 16, opacity: 0.6 }} />
                      <Typography variant='caption' color='text.secondary'>
                        {formatDate(ticket.created_at)}
                      </Typography>
                    </Box>
                  </Box>
                  {ticket.comments && ticket.comments.length > 0 && (
                    <Badge badgeContent={ticket.comments.length} color='primary'>
                      <i className='ri-chat-3-line' style={{ fontSize: 20 }} />
                    </Badge>
                  )}
                </Box>

                <Box display='flex' gap={1}>
                  {ticket.status === 'open' && (
                    <Button
                      size='small'
                      variant='outlined'
                      onClick={() => handleStatusChange(ticket.id, 'in_progress')}
                      startIcon={<i className='ri-play-line' />}
                    >
                      Start
                    </Button>
                  )}
                  {(ticket.status === 'open' || ticket.status === 'in_progress') && (
                    <Button
                      size='small'
                      variant='contained'
                      color='success'
                      onClick={() => handleResolveTicket(ticket.id)}
                      startIcon={<i className='ri-check-line' />}
                    >
                      Resolve
                    </Button>
                  )}
                  <Button size='small' variant='outlined' startIcon={<i className='ri-eye-line' />}>
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))
      )}

      {/* Create Ticket Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Create Support Ticket</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label='Customer Name'
                value={newTicket.customer_name}
                onChange={e => setNewTicket(prev => ({ ...prev, customer_name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='email'
                label='Customer Email'
                value={newTicket.customer_email}
                onChange={e => setNewTicket(prev => ({ ...prev, customer_email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Customer Phone'
                value={newTicket.customer_phone}
                onChange={e => setNewTicket(prev => ({ ...prev, customer_phone: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label='Subject'
                placeholder='Brief description of the issue'
                value={newTicket.subject}
                onChange={e => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={4}
                label='Description'
                placeholder='Detailed description of the issue...'
                value={newTicket.description}
                onChange={e => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label='Category'
                value={newTicket.category}
                onChange={e => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
              >
                <MenuItem value='general'>General</MenuItem>
                <MenuItem value='equipment_issue'>Equipment Issue</MenuItem>
                <MenuItem value='billing'>Billing</MenuItem>
                <MenuItem value='delivery'>Delivery</MenuItem>
                <MenuItem value='other'>Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label='Priority'
                value={newTicket.priority}
                onChange={e => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
              >
                <MenuItem value='low'>Low</MenuItem>
                <MenuItem value='medium'>Medium</MenuItem>
                <MenuItem value='high'>High</MenuItem>
                <MenuItem value='urgent'>Urgent</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTicket} variant='contained'>
            Create Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default SupportTickets
