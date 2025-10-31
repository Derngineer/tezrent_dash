'use client'

// React Imports
import { useState, useEffect } from 'react'

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

// API Imports
import { crmAPI } from '@/services/api'

const Leads = () => {
  const [loading, setLoading] = useState(true)
  const [leads, setLeads] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [createDialog, setCreateDialog] = useState(false)
  const [newLead, setNewLead] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    source: 'website',
    notes: ''
  })

  useEffect(() => {
    loadLeads()
  }, [filterStatus])

  const loadLeads = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = { ordering: '-created_at' }
      if (filterStatus) params.status = filterStatus

      const data = await crmAPI.getLeads(params)
      setLeads(data.results || data)
    } catch (err) {
      console.error('Failed to load leads:', err)
      setError(err.message || 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLead = async () => {
    try {
      await crmAPI.createLead(newLead)
      setSuccess('Lead created successfully!')
      setCreateDialog(false)
      setNewLead({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        source: 'website',
        notes: ''
      })
      loadLeads()
    } catch (err) {
      setError(err.message || 'Failed to create lead')
    }
  }

  const handleMarkContacted = async (leadId, leadName) => {
    try {
      await crmAPI.markLeadContacted(leadId, `Contacted ${leadName} on ${new Date().toLocaleDateString()}`)
      setSuccess('Lead marked as contacted')
      loadLeads()
    } catch (err) {
      setError(err.message || 'Failed to mark as contacted')
    }
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
      new: 'primary',
      contacted: 'info',
      qualified: 'success',
      lost: 'error'
    }

    return colors[status] || 'default'
  }

  return (
    <Grid container spacing={6}>
      {/* Header */}
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Box>
            <Typography variant='h4'>Leads</Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              Manage potential customers and track their journey
            </Typography>
          </Box>
          <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => setCreateDialog(true)}>
            Add Lead
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

      {/* Filters */}
      <Grid item xs={12}>
        <Box display='flex' gap={2}>
          <Chip
            label='All'
            onClick={() => setFilterStatus('')}
            color={filterStatus === '' ? 'primary' : 'default'}
            variant={filterStatus === '' ? 'filled' : 'outlined'}
          />
          <Chip
            label='New'
            onClick={() => setFilterStatus('new')}
            color={filterStatus === 'new' ? 'primary' : 'default'}
            variant={filterStatus === 'new' ? 'filled' : 'outlined'}
          />
          <Chip
            label='Contacted'
            onClick={() => setFilterStatus('contacted')}
            color={filterStatus === 'contacted' ? 'primary' : 'default'}
            variant={filterStatus === 'contacted' ? 'filled' : 'outlined'}
          />
          <Chip
            label='Qualified'
            onClick={() => setFilterStatus('qualified')}
            color={filterStatus === 'qualified' ? 'primary' : 'default'}
            variant={filterStatus === 'qualified' ? 'filled' : 'outlined'}
          />
          <Chip
            label='Lost'
            onClick={() => setFilterStatus('lost')}
            color={filterStatus === 'lost' ? 'primary' : 'default'}
            variant={filterStatus === 'lost' ? 'filled' : 'outlined'}
          />
        </Box>
      </Grid>

      {/* Content */}
      {loading ? (
        <Grid item xs={12}>
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='300px'>
            <CircularProgress />
          </Box>
        </Grid>
      ) : leads.length === 0 ? (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box textAlign='center' py={4}>
                <i className='ri-user-add-line' style={{ fontSize: 64, opacity: 0.3 }} />
                <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
                  No leads found
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                  Start by adding your first lead
                </Typography>
                <Button variant='contained' onClick={() => setCreateDialog(true)} startIcon={<i className='ri-add-line' />}>
                  Add Lead
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ) : (
        leads.map(lead => (
          <Grid item xs={12} md={6} lg={4} key={lead.id}>
            <Card>
              <CardContent>
                <Box display='flex' justifyContent='space-between' alignItems='start' mb={2}>
                  <Box>
                    <Typography variant='h6' sx={{ mb: 0.5 }}>
                      {lead.customer_name}
                    </Typography>
                    <Chip label={lead.status} color={getStatusColor(lead.status)} size='small' />
                  </Box>
                  <IconButton size='small'>
                    <i className='ri-more-2-line' />
                  </IconButton>
                </Box>

                <Box mb={2}>
                  <Box display='flex' alignItems='center' gap={1} mb={1}>
                    <i className='ri-mail-line' style={{ fontSize: 16, opacity: 0.6 }} />
                    <Typography variant='body2'>{lead.customer_email}</Typography>
                  </Box>
                  <Box display='flex' alignItems='center' gap={1} mb={1}>
                    <i className='ri-phone-line' style={{ fontSize: 16, opacity: 0.6 }} />
                    <Typography variant='body2'>{lead.customer_phone}</Typography>
                  </Box>
                  <Box display='flex' alignItems='center' gap={1}>
                    <i className='ri-apps-line' style={{ fontSize: 16, opacity: 0.6 }} />
                    <Typography variant='body2' sx={{ textTransform: 'capitalize' }}>
                      Source: {lead.source}
                    </Typography>
                  </Box>
                </Box>

                {lead.notes && (
                  <Box mb={2}>
                    <Typography variant='body2' color='text.secondary'>
                      {lead.notes}
                    </Typography>
                  </Box>
                )}

                <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                  <Typography variant='caption' color='text.secondary'>
                    {formatDate(lead.created_at)}
                  </Typography>
                  {lead.contacted_at && (
                    <Typography variant='caption' color='text.secondary'>
                      Contacted: {formatDate(lead.contacted_at)}
                    </Typography>
                  )}
                </Box>

                <Box display='flex' gap={1}>
                  {lead.status === 'new' && (
                    <Button
                      fullWidth
                      size='small'
                      variant='contained'
                      onClick={() => handleMarkContacted(lead.id, lead.customer_name)}
                    >
                      Mark Contacted
                    </Button>
                  )}
                  <Button fullWidth size='small' variant='outlined'>
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))
      )}

      {/* Create Lead Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Add New Lead</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Customer Name'
                value={newLead.customer_name}
                onChange={e => setNewLead(prev => ({ ...prev, customer_name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Email'
                type='email'
                value={newLead.customer_email}
                onChange={e => setNewLead(prev => ({ ...prev, customer_email: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Phone'
                value={newLead.customer_phone}
                onChange={e => setNewLead(prev => ({ ...prev, customer_phone: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label='Source'
                value={newLead.source}
                onChange={e => setNewLead(prev => ({ ...prev, source: e.target.value }))}
              >
                <MenuItem value='website'>Website</MenuItem>
                <MenuItem value='referral'>Referral</MenuItem>
                <MenuItem value='phone'>Phone</MenuItem>
                <MenuItem value='email'>Email</MenuItem>
                <MenuItem value='social_media'>Social Media</MenuItem>
                <MenuItem value='other'>Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label='Notes'
                value={newLead.notes}
                onChange={e => setNewLead(prev => ({ ...prev, notes: e.target.value }))}
                placeholder='Interest, requirements, or other notes...'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateLead} variant='contained'>
            Create Lead
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default Leads
