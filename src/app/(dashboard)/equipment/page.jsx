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
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// API Imports
import { equipmentAPI } from '@/services/api'

const EquipmentList = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [equipment, setEquipment] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, equipmentId: null, equipmentName: '' })

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: ''
  })

  useEffect(() => {
    loadCategories()
    loadEquipment()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEquipment()
    }, 500)

    return () => clearTimeout(timer)
  }, [filters])

  const loadCategories = async () => {
    try {
      const data = await equipmentAPI.getCategories()
      setCategories(data.results || data)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const loadEquipment = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {}
      if (filters.search) params.search = filters.search
      if (filters.category) params.category = filters.category
      if (filters.status) params.status = filters.status

      const data = await equipmentAPI.getMyEquipment(params)
      setEquipment(data.results || data)
    } catch (err) {
      console.error('Failed to load equipment:', err)
      setError(err.message || 'Failed to load equipment')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleDelete = async () => {
    try {
      await equipmentAPI.deleteEquipment(deleteDialog.equipmentId)
      setSuccess(`${deleteDialog.equipmentName} deleted successfully`)
      setDeleteDialog({ open: false, equipmentId: null, equipmentName: '' })
      loadEquipment()
    } catch (err) {
      setError(err.message || 'Failed to delete equipment')
    }
  }

  const handleToggleAvailability = async equipmentId => {
    try {
      await equipmentAPI.toggleAvailability(equipmentId)
      setSuccess('Availability status updated')
      loadEquipment()
    } catch (err) {
      setError(err.message || 'Failed to update availability')
    }
  }

  const getStatusColor = status => {
    const colors = {
      available: 'success',
      rented: 'info',
      maintenance: 'warning',
      unavailable: 'error'
    }

    return colors[status] || 'default'
  }

  const getConditionColor = condition => {
    const colors = {
      new: 'success',
      excellent: 'success',
      good: 'primary',
      fair: 'warning',
      needs_repair: 'error'
    }

    return colors[condition] || 'default'
  }

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <Grid container spacing={6}>
      {/* Header */}
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h4'>Equipment Management</Typography>
          <Button variant='contained' startIcon={<i className='ri-add-line' />} href='/equipment/add'>
            Add Equipment
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
        <Card>
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label='Search'
                  placeholder='Search by name, model, serial number...'
                  value={filters.search}
                  onChange={e => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: <i className='ri-search-line' style={{ marginRight: 8 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label='Category'
                  value={filters.category}
                  onChange={e => handleFilterChange('category', e.target.value)}
                >
                  <MenuItem value=''>All Categories</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label='Status'
                  value={filters.status}
                  onChange={e => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value=''>All Status</MenuItem>
                  <MenuItem value='available'>Available</MenuItem>
                  <MenuItem value='rented'>Rented</MenuItem>
                  <MenuItem value='maintenance'>Maintenance</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Equipment Grid */}
      {loading ? (
        <Grid item xs={12}>
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='300px'>
            <CircularProgress />
          </Box>
        </Grid>
      ) : equipment.length === 0 ? (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box textAlign='center' py={4}>
                <i className='ri-tools-line' style={{ fontSize: 64, opacity: 0.3 }} />
                <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
                  No equipment found
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                  Start by adding your first equipment
                </Typography>
                <Button variant='contained' href='/equipment/add' startIcon={<i className='ri-add-line' />}>
                  Add Equipment
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ) : (
        equipment.map(item => (
          <Grid item xs={12} md={6} lg={4} key={item.id}>
            <Card>
              <Box
                sx={{
                  height: 200,
                  backgroundColor: 'grey.200',
                  backgroundImage: item.primary_image ? `url(${item.primary_image})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {!item.primary_image && <i className='ri-image-line' style={{ fontSize: 48, opacity: 0.3 }} />}
              </Box>
              <CardContent>
                <Box display='flex' justifyContent='space-between' alignItems='start' mb={2}>
                  <Box flex={1}>
                    <Typography variant='h6' sx={{ mb: 1 }}>
                      {item.name}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                      {item.category_name}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton size='small' onClick={() => router.push(`/equipment/edit/${item.id}`)}>
                      <i className='ri-edit-line' />
                    </IconButton>
                    <IconButton
                      size='small'
                      color='error'
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          equipmentId: item.id,
                          equipmentName: item.name
                        })
                      }
                    >
                      <i className='ri-delete-bin-line' />
                    </IconButton>
                  </Box>
                </Box>

                <Box display='flex' gap={1} mb={2} flexWrap='wrap'>
                  <Chip label={item.status} color={getStatusColor(item.status)} size='small' />
                  {item.featured && <Chip label='Featured' color='primary' size='small' />}
                  {item.is_todays_deal && <Chip label="Today's Deal" color='secondary' size='small' />}
                  {item.is_new_listing && <Chip label='New' color='success' size='small' />}
                </Box>

                <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                  <Box>
                    {item.is_deal_active && item.discounted_daily_rate ? (
                      <>
                        <Typography variant='h6' color='primary'>
                          {formatCurrency(item.discounted_daily_rate)}/day
                        </Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ textDecoration: 'line-through' }}>
                          {formatCurrency(item.daily_rate)}
                        </Typography>
                        {item.savings_amount > 0 && (
                          <Chip label={`Save $${item.savings_amount}`} size='small' color='success' sx={{ ml: 1 }} />
                        )}
                      </>
                    ) : (
                      <Typography variant='h6' color='primary'>
                        {formatCurrency(item.daily_rate)}/day
                      </Typography>
                    )}
                  </Box>
                  <Typography variant='body2' color='text.secondary'>
                    {item.available_units || 0} available
                  </Typography>
                </Box>

                <Box display='flex' gap={1}>
                  <Button
                    fullWidth
                    size='small'
                    variant='outlined'
                    onClick={() => handleToggleAvailability(item.id)}
                    disabled={item.status === 'rented'}
                  >
                    Toggle Status
                  </Button>
                  <Button
                    fullWidth
                    size='small'
                    variant='contained'
                    onClick={() => router.push(`/equipment/${item.id}`)}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, equipmentId: null, equipmentName: '' })}>
        <DialogTitle>Delete Equipment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteDialog.equipmentName}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, equipmentId: null, equipmentName: '' })}>Cancel</Button>
          <Button onClick={handleDelete} color='error' variant='contained'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default EquipmentList
