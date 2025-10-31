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
import LinearProgress from '@mui/material/LinearProgress'

// API Imports
import { crmAPI } from '@/services/api'

const SalesOpportunities = () => {
  const [loading, setLoading] = useState(true)
  const [opportunities, setOpportunities] = useState([])
  const [pipelineSummary, setPipelineSummary] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [filterStage, setFilterStage] = useState('')
  const [createDialog, setCreateDialog] = useState(false)
  const [actionDialog, setActionDialog] = useState({
    open: false,
    type: null, // 'won' or 'lost'
    opportunityId: null,
    notes: ''
  })

  const [newOpportunity, setNewOpportunity] = useState({
    name: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    value: '',
    probability: 50,
    expected_close_date: '',
    stage: 'lead',
    notes: ''
  })

  const stages = [
    { value: 'lead', label: 'Lead', color: 'default' },
    { value: 'qualified', label: 'Qualified', color: 'info' },
    { value: 'proposal', label: 'Proposal', color: 'primary' },
    { value: 'negotiation', label: 'Negotiation', color: 'warning' },
    { value: 'won', label: 'Won', color: 'success' },
    { value: 'lost', label: 'Lost', color: 'error' }
  ]

  useEffect(() => {
    loadOpportunities()
    loadPipelineSummary()
  }, [filterStage])

  const loadOpportunities = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = { ordering: '-value' }
      if (filterStage) params.stage = filterStage

      const data = await crmAPI.getOpportunities(params)
      setOpportunities(data.results || data)
    } catch (err) {
      console.error('Failed to load opportunities:', err)
      setError(err.message || 'Failed to load opportunities')
    } finally {
      setLoading(false)
    }
  }

  const loadPipelineSummary = async () => {
    try {
      const data = await crmAPI.getPipelineSummary()
      setPipelineSummary(data)
    } catch (err) {
      console.error('Failed to load pipeline summary:', err)
    }
  }

  const handleCreateOpportunity = async () => {
    try {
      await crmAPI.createOpportunity(newOpportunity)
      setSuccess('Opportunity created successfully!')
      setCreateDialog(false)
      setNewOpportunity({
        name: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        value: '',
        probability: 50,
        expected_close_date: '',
        stage: 'lead',
        notes: ''
      })
      loadOpportunities()
      loadPipelineSummary()
    } catch (err) {
      setError(err.message || 'Failed to create opportunity')
    }
  }

  const handleStageChange = async (opportunityId, newStage) => {
    try {
      await crmAPI.updateOpportunity(opportunityId, { stage: newStage })
      setSuccess('Stage updated successfully')
      loadOpportunities()
      loadPipelineSummary()
    } catch (err) {
      setError(err.message || 'Failed to update stage')
    }
  }

  const handleMarkWon = async () => {
    try {
      await crmAPI.markOpportunityWon(actionDialog.opportunityId, actionDialog.notes)
      setSuccess('Opportunity marked as won! 🎉')
      setActionDialog({ open: false, type: null, opportunityId: null, notes: '' })
      loadOpportunities()
      loadPipelineSummary()
    } catch (err) {
      setError(err.message || 'Failed to mark as won')
    }
  }

  const handleMarkLost = async () => {
    try {
      await crmAPI.markOpportunityLost(actionDialog.opportunityId, actionDialog.notes)
      setSuccess('Opportunity marked as lost')
      setActionDialog({ open: false, type: null, opportunityId: null, notes: '' })
      loadOpportunities()
      loadPipelineSummary()
    } catch (err) {
      setError(err.message || 'Failed to mark as lost')
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

  const getStageColor = stage => {
    const stageObj = stages.find(s => s.value === stage)
    return stageObj ? stageObj.color : 'default'
  }

  const getTotalPipelineValue = () => {
    return opportunities.reduce((sum, opp) => sum + parseFloat(opp.value || 0), 0)
  }

  return (
    <Grid container spacing={6}>
      {/* Header */}
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Box>
            <Typography variant='h4'>Sales Opportunities</Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              Track your sales pipeline and manage opportunities
            </Typography>
          </Box>
          <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => setCreateDialog(true)}>
            Add Opportunity
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

      {/* Pipeline Summary */}
      {pipelineSummary && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 3 }}>
                Pipeline Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Total Pipeline Value
                    </Typography>
                    <Typography variant='h5' sx={{ mt: 1 }}>
                      {formatCurrency(getTotalPipelineValue())}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Total Opportunities
                    </Typography>
                    <Typography variant='h5' sx={{ mt: 1 }}>
                      {opportunities.length}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Win Rate
                    </Typography>
                    <Typography variant='h5' sx={{ mt: 1 }}>
                      {pipelineSummary.win_rate || 0}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Avg Deal Size
                    </Typography>
                    <Typography variant='h5' sx={{ mt: 1 }}>
                      {formatCurrency(pipelineSummary.average_deal_size || getTotalPipelineValue() / (opportunities.length || 1))}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Stage Filters */}
      <Grid item xs={12}>
        <Box display='flex' gap={2} flexWrap='wrap'>
          <Chip
            label='All Stages'
            onClick={() => setFilterStage('')}
            color={filterStage === '' ? 'primary' : 'default'}
            variant={filterStage === '' ? 'filled' : 'outlined'}
          />
          {stages.map(stage => (
            <Chip
              key={stage.value}
              label={stage.label}
              onClick={() => setFilterStage(stage.value)}
              color={filterStage === stage.value ? 'primary' : 'default'}
              variant={filterStage === stage.value ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Grid>

      {/* Content */}
      {loading ? (
        <Grid item xs={12}>
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='300px'>
            <CircularProgress />
          </Box>
        </Grid>
      ) : opportunities.length === 0 ? (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box textAlign='center' py={4}>
                <i className='ri-briefcase-line' style={{ fontSize: 64, opacity: 0.3 }} />
                <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
                  No opportunities found
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                  {filterStage ? 'Try selecting a different stage' : 'Start by adding your first opportunity'}
                </Typography>
                <Button variant='contained' onClick={() => setCreateDialog(true)} startIcon={<i className='ri-add-line' />}>
                  Add Opportunity
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ) : (
        opportunities.map(opp => (
          <Grid item xs={12} md={6} lg={4} key={opp.id}>
            <Card>
              <CardContent>
                <Box display='flex' justifyContent='space-between' alignItems='start' mb={2}>
                  <Box flex={1}>
                    <Typography variant='h6' sx={{ mb: 0.5 }}>
                      {opp.name}
                    </Typography>
                    <Chip label={opp.stage} color={getStageColor(opp.stage)} size='small' />
                  </Box>
                  <IconButton size='small'>
                    <i className='ri-more-2-line' />
                  </IconButton>
                </Box>

                <Box mb={2}>
                  <Box display='flex' alignItems='center' gap={1} mb={1}>
                    <i className='ri-user-line' style={{ fontSize: 16, opacity: 0.6 }} />
                    <Typography variant='body2'>{opp.customer_name}</Typography>
                  </Box>
                  {opp.customer_email && (
                    <Box display='flex' alignItems='center' gap={1} mb={1}>
                      <i className='ri-mail-line' style={{ fontSize: 16, opacity: 0.6 }} />
                      <Typography variant='body2'>{opp.customer_email}</Typography>
                    </Box>
                  )}
                  {opp.customer_phone && (
                    <Box display='flex' alignItems='center' gap={1}>
                      <i className='ri-phone-line' style={{ fontSize: 16, opacity: 0.6 }} />
                      <Typography variant='body2'>{opp.customer_phone}</Typography>
                    </Box>
                  )}
                </Box>

                <Box mb={2}>
                  <Box display='flex' justifyContent='space-between' mb={1}>
                    <Typography variant='body2' color='text.secondary'>
                      Value
                    </Typography>
                    <Typography variant='h6' color='primary'>
                      {formatCurrency(opp.value)}
                    </Typography>
                  </Box>
                  <Box display='flex' justifyContent='space-between' mb={1}>
                    <Typography variant='body2' color='text.secondary'>
                      Probability
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      {opp.probability}%
                    </Typography>
                  </Box>
                  <LinearProgress variant='determinate' value={opp.probability} sx={{ height: 6, borderRadius: 1 }} />
                </Box>

                {opp.expected_close_date && (
                  <Box mb={2}>
                    <Typography variant='caption' color='text.secondary'>
                      Expected Close: {formatDate(opp.expected_close_date)}
                    </Typography>
                  </Box>
                )}

                {opp.notes && (
                  <Box mb={2}>
                    <Typography variant='body2' color='text.secondary' sx={{ fontStyle: 'italic' }}>
                      {opp.notes.length > 100 ? `${opp.notes.substring(0, 100)}...` : opp.notes}
                    </Typography>
                  </Box>
                )}

                <Box display='flex' gap={1}>
                  <TextField
                    select
                    size='small'
                    value={opp.stage}
                    onChange={e => handleStageChange(opp.id, e.target.value)}
                    sx={{ flex: 1 }}
                  >
                    {stages.map(stage => (
                      <MenuItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  {opp.stage !== 'won' && opp.stage !== 'lost' && (
                    <>
                      <IconButton
                        size='small'
                        color='success'
                        onClick={() =>
                          setActionDialog({
                            open: true,
                            type: 'won',
                            opportunityId: opp.id,
                            notes: ''
                          })
                        }
                        title='Mark as Won'
                      >
                        <i className='ri-check-line' />
                      </IconButton>
                      <IconButton
                        size='small'
                        color='error'
                        onClick={() =>
                          setActionDialog({
                            open: true,
                            type: 'lost',
                            opportunityId: opp.id,
                            notes: ''
                          })
                        }
                        title='Mark as Lost'
                      >
                        <i className='ri-close-line' />
                      </IconButton>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))
      )}

      {/* Create Opportunity Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Create Sales Opportunity</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label='Opportunity Name'
                placeholder='e.g., Construction Equipment Rental - Q4 2025'
                value={newOpportunity.name}
                onChange={e => setNewOpportunity(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label='Customer Name'
                value={newOpportunity.customer_name}
                onChange={e => setNewOpportunity(prev => ({ ...prev, customer_name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='email'
                label='Customer Email'
                value={newOpportunity.customer_email}
                onChange={e => setNewOpportunity(prev => ({ ...prev, customer_email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Customer Phone'
                value={newOpportunity.customer_phone}
                onChange={e => setNewOpportunity(prev => ({ ...prev, customer_phone: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type='number'
                label='Opportunity Value (AED)'
                value={newOpportunity.value}
                onChange={e => setNewOpportunity(prev => ({ ...prev, value: e.target.value }))}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>AED</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='number'
                label='Probability (%)'
                value={newOpportunity.probability}
                onChange={e => setNewOpportunity(prev => ({ ...prev, probability: parseInt(e.target.value) || 0 }))}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label='Stage'
                value={newOpportunity.stage}
                onChange={e => setNewOpportunity(prev => ({ ...prev, stage: e.target.value }))}
              >
                {stages.slice(0, -2).map(stage => (
                  <MenuItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='date'
                label='Expected Close Date'
                value={newOpportunity.expected_close_date}
                onChange={e => setNewOpportunity(prev => ({ ...prev, expected_close_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label='Notes'
                placeholder='Additional notes or requirements...'
                value={newOpportunity.notes}
                onChange={e => setNewOpportunity(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateOpportunity} variant='contained'>
            Create Opportunity
          </Button>
        </DialogActions>
      </Dialog>

      {/* Won/Lost Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, type: null, opportunityId: null, notes: '' })}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>{actionDialog.type === 'won' ? 'Mark as Won' : 'Mark as Lost'}</DialogTitle>
        <DialogContent>
          <Typography variant='body2' sx={{ mb: 2 }}>
            {actionDialog.type === 'won'
              ? 'Add notes about winning this opportunity:'
              : 'Please provide a reason for losing this opportunity:'}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label='Notes'
            value={actionDialog.notes}
            onChange={e => setActionDialog(prev => ({ ...prev, notes: e.target.value }))}
            placeholder={
              actionDialog.type === 'won'
                ? 'Customer signed contract, project starts next month'
                : 'Customer chose competitor with lower pricing'
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, type: null, opportunityId: null, notes: '' })}>
            Cancel
          </Button>
          <Button
            onClick={actionDialog.type === 'won' ? handleMarkWon : handleMarkLost}
            color={actionDialog.type === 'won' ? 'success' : 'error'}
            variant='contained'
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default SalesOpportunities
