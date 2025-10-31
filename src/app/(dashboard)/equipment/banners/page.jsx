'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'

// API Imports
import { equipmentAPI } from '@/services/api'

const BannersPage = () => {
  // States
  const [banners, setBanners] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentBanner, setCurrentBanner] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    banner_type: 'hero',
    position: 'top',
    cta_text: '',
    cta_link: '',
    target_category: '',
    is_active: true,
    display_order: 0,
    start_date: '',
    end_date: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [mobileImageFile, setMobileImageFile] = useState(null)

  const bannerTypes = [
    { value: 'hero', label: 'Hero Banner' },
    { value: 'promotional', label: 'Promotional' },
    { value: 'category', label: 'Category Highlight' },
    { value: 'deal', label: 'Special Deal' },
    { value: 'announcement', label: 'Announcement' }
  ]

  const positions = [
    { value: 'top', label: 'Top' },
    { value: 'middle', label: 'Middle' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'sidebar', label: 'Sidebar' }
  ]

  // Fetch data
  useEffect(() => {
    fetchBanners()
    fetchCategories()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching banners from API...')
      let response = await equipmentAPI.getBanners()
      console.log('getBanners() response:', response)
      
      // If no banners, try getActiveBanners
      if (!response || (Array.isArray(response) && response.length === 0)) {
        console.log('No banners from getBanners, trying getActiveBanners...')
        response = await equipmentAPI.getActiveBanners()
        console.log('getActiveBanners() response:', response)
      }
      
      console.log('Response type:', typeof response)
      console.log('Is array?', Array.isArray(response))
      
      // The API returns response.data directly, so response should be the data
      let bannersData = []
      if (Array.isArray(response)) {
        bannersData = response
        console.log('Response is array, using directly')
      } else if (response && typeof response === 'object') {
        console.log('Response is object, checking properties...')
        console.log('Has results?', 'results' in response)
        console.log('Has data?', 'data' in response)
        
        if (response.results && Array.isArray(response.results)) {
          bannersData = response.results
          console.log('Using response.results')
        } else if (response.data && Array.isArray(response.data)) {
          bannersData = response.data
          console.log('Using response.data')
        } else {
          console.log('Could not find array in response, using empty array')
        }
      }
      
      console.log('Final banners data:', bannersData)
      console.log('Number of banners:', bannersData.length)
      
      if (bannersData.length > 0) {
        console.log('First banner:', bannersData[0])
      } else {
        console.warn('No banners found. Check Django admin at http://localhost:8000/admin/ to verify banners exist.')
      }
      
      setBanners(bannersData)
    } catch (err) {
      console.error('Error fetching banners:', err)
      console.error('Error response:', err.response)
      setError('Failed to load banners: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await equipmentAPI.getCategories()
      setCategories(response.data || response)
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  // Handle form changes
  const handleChange = (field) => (event) => {
    const value = field === 'is_active' ? event.target.checked : event.target.value
    setFormData({ ...formData, [field]: value })
  }

  // Handle desktop image upload
  const handleDesktopImageChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle mobile image upload
  const handleMobileImageChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setMobileImageFile(file)
    }
  }

  // Open dialog for create
  const handleOpenCreate = () => {
    setEditMode(false)
    setCurrentBanner(null)
    setImagePreview(null)
    setImageFile(null)
    setMobileImageFile(null)
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      banner_type: 'hero',
      position: 'top',
      cta_text: '',
      cta_link: '',
      target_category: '',
      is_active: true,
      display_order: banners.length,
      start_date: '',
      end_date: ''
    })
    setOpenDialog(true)
  }

  // Open dialog for edit
  const handleOpenEdit = (banner) => {
    setEditMode(true)
    setCurrentBanner(banner)
    setImagePreview(banner.desktop_image_url || banner.mobile_image_url)
    setImageFile(null)
    setMobileImageFile(null)
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      banner_type: banner.banner_type || 'hero',
      position: banner.position || 'top',
      cta_text: banner.cta_text || '',
      cta_link: banner.cta_link || '',
      target_category: banner.target_category || '',
      is_active: banner.is_active !== undefined ? banner.is_active : true,
      display_order: banner.display_order || 0,
      start_date: banner.start_date || '',
      end_date: banner.end_date || ''
    })
    setOpenDialog(true)
  }

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setError('')
    setImagePreview(null)
    setImageFile(null)
    setMobileImageFile(null)
  }

  // Handle submit
  const handleSubmit = async () => {
    try {
      if (!formData.title.trim()) {
        setError('Banner title is required')
        return
      }

      if (!editMode && !imageFile) {
        setError('Banner image is required')
        return
      }

      setLoading(true)
      setError('')

      // Prepare form data for multipart upload
      const submitData = new FormData()
      
      console.log('Form data before submission:', formData)
      
      // Add only required and filled fields
      submitData.append('title', formData.title.trim())
      
      if (formData.subtitle) submitData.append('subtitle', formData.subtitle.trim())
      if (formData.description) submitData.append('description', formData.description.trim())
      
      submitData.append('banner_type', formData.banner_type)
      submitData.append('position', formData.position)
      
      if (formData.cta_text) submitData.append('cta_text', formData.cta_text.trim())
      if (formData.cta_link) submitData.append('cta_link', formData.cta_link.trim())
      if (formData.target_category) submitData.append('target_category', formData.target_category)
      
      submitData.append('is_active', formData.is_active)
      submitData.append('display_order', formData.display_order)
      
      if (formData.start_date) submitData.append('start_date', formData.start_date)
      if (formData.end_date) submitData.append('end_date', formData.end_date)

      if (imageFile) {
        console.log('Appending desktop image file:', imageFile.name, imageFile.type, imageFile.size)
        submitData.append('desktop_image', imageFile)
      }
      
      if (mobileImageFile) {
        console.log('Appending mobile image file:', mobileImageFile.name, mobileImageFile.type, mobileImageFile.size)
        submitData.append('mobile_image', mobileImageFile)
      } else if (imageFile && !editMode) {
        // Use desktop image as mobile if no separate mobile image provided (only on create)
        console.log('Using desktop image as mobile image')
        submitData.append('mobile_image', imageFile)
      }

      // Log FormData contents
      console.log('Submitting FormData:')
      for (let pair of submitData.entries()) {
        console.log(pair[0] + ':', pair[1])
      }

      if (editMode && currentBanner) {
        console.log('Updating banner:', currentBanner.id)
        await equipmentAPI.updateBanner(currentBanner.id, submitData)
        setSuccess('Banner updated successfully!')
      } else {
        console.log('Creating new banner')
        const response = await equipmentAPI.createBanner(submitData)
        console.log('Banner created:', response)
        setSuccess('Banner created successfully!')
      }

      await fetchBanners()
      setOpenDialog(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('===== ERROR SAVING BANNER =====')
      console.error('Error object:', err)
      console.error('Error response:', err.response)
      console.error('Error response data:', err.response?.data)
      console.error('Error response status:', err.response?.status)
      console.error('Error message:', err.message)
      console.error('================================')
      
      // Extract detailed error message
      let errorMsg = 'Failed to save banner'
      if (err.response?.data) {
        const data = err.response.data
        console.log('Parsing error data:', data)
        
        if (typeof data === 'string') {
          errorMsg = data
        } else if (data.detail) {
          errorMsg = data.detail
        } else if (data.message) {
          errorMsg = data.message
        } else if (data.error) {
          errorMsg = data.error
        } else {
          // Show all field errors
          const errors = []
          Object.keys(data).forEach(key => {
            const value = data[key]
            if (Array.isArray(value)) {
              errors.push(`${key}: ${value.join(', ')}`)
            } else if (typeof value === 'string') {
              errors.push(`${key}: ${value}`)
            }
          })
          if (errors.length > 0) {
            errorMsg = errors.join('; ')
          }
        }
      }
      
      console.log('Final error message:', errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) {
      return
    }

    try {
      setLoading(true)
      await equipmentAPI.deleteBanner(id)
      setSuccess('Banner deleted successfully!')
      await fetchBanners()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error deleting banner:', err)
      setError('Failed to delete banner')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  // Toggle active status
  const handleToggleActive = async (banner) => {
    try {
      const updateData = new FormData()
      updateData.append('is_active', !banner.is_active)
      
      await equipmentAPI.updateBanner(banner.id, updateData)
      setSuccess('Banner status updated!')
      await fetchBanners()
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      console.error('Error updating banner:', err)
      setError('Failed to update banner')
      setTimeout(() => setError(''), 3000)
    }
  }

  return (
    <div>
      {/* Alerts */}
      {success && (
        <Alert severity='success' onClose={() => setSuccess('')} className='mbe-4'>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity='error' onClose={() => setError('')} className='mbe-4'>
          {error}
        </Alert>
      )}

      {/* Banners List */}
      <Card>
        <CardHeader
          title='Promotional Banners'
          subheader='Manage homepage and promotional banners'
          action={
            <Button
              variant='contained'
              startIcon={<i className='ri-add-line' />}
              onClick={handleOpenCreate}
            >
              Add Banner
            </Button>
          }
        />
        <CardContent>
          {loading && banners.length === 0 ? (
            <Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
              <CircularProgress />
            </Box>
          ) : banners.length === 0 ? (
            <Box textAlign='center' py={4}>
              <Typography variant='h6' color='text.secondary' gutterBottom>
                No banners yet
              </Typography>
              <Typography variant='body2' color='text.secondary' paragraph>
                Create your first promotional banner
              </Typography>
              <Button variant='contained' onClick={handleOpenCreate} startIcon={<i className='ri-add-line' />}>
                Create Banner
              </Button>
            </Box>
          ) : (
            <Grid container spacing={4}>
              {banners.map((banner) => (
                <Grid item xs={12} key={banner.id}>
                  <Card variant='outlined'>
                    <Grid container>
                      {/* Banner Image */}
                      <Grid item xs={12} md={4}>
                        <Box
                          sx={{
                            height: 200,
                            backgroundColor: 'grey.200',
                            backgroundImage: banner.desktop_image_url ? `url(${banner.desktop_image_url})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {!banner.desktop_image_url && <i className='ri-image-line' style={{ fontSize: 48, opacity: 0.3 }} />}
                        </Box>
                      </Grid>

                      {/* Banner Details */}
                      <Grid item xs={12} md={8}>
                        <CardContent>
                          <Box display='flex' justifyContent='space-between' alignItems='start' mb={2}>
                            <Box flex={1}>
                              <Typography variant='h6' gutterBottom>
                                {banner.title}
                              </Typography>
                              {banner.subtitle && (
                                <Typography variant='body2' color='text.secondary' gutterBottom>
                                  {banner.subtitle}
                                </Typography>
                              )}
                            </Box>
                            <Box display='flex' gap={1}>
                              <Tooltip title={banner.is_active ? 'Active' : 'Inactive'}>
                                <IconButton
                                  size='small'
                                  color={banner.is_active ? 'success' : 'default'}
                                  onClick={() => handleToggleActive(banner)}
                                >
                                  <i className={banner.is_active ? 'ri-eye-line' : 'ri-eye-off-line'} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title='Edit'>
                                <IconButton size='small' onClick={() => handleOpenEdit(banner)}>
                                  <i className='ri-edit-line' />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title='Delete'>
                                <IconButton size='small' color='error' onClick={() => handleDelete(banner.id)}>
                                  <i className='ri-delete-bin-line' />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>

                          {banner.description && (
                            <Typography variant='body2' color='text.secondary' paragraph>
                              {banner.description}
                            </Typography>
                          )}

                          <Box display='flex' gap={1} flexWrap='wrap' mb={2}>
                            <Chip label={banner.banner_type || 'promotional'} size='small' color='primary' />
                            <Chip label={banner.position || 'homepage'} size='small' variant='outlined' />
                            {banner.is_active && <Chip label='Active' size='small' color='success' />}
                            {banner.target_category_name && (
                              <Chip label={`Category: ${banner.target_category_name}`} size='small' />
                            )}
                          </Box>

                          {banner.cta_text && (
                            <Box display='flex' gap={2} alignItems='center'>
                              <Typography variant='caption' color='text.secondary'>
                                CTA: {banner.cta_text}
                              </Typography>
                              {banner.cta_link && (
                                <Typography variant='caption' color='text.secondary'>
                                  → {banner.cta_link}
                                </Typography>
                              )}
                            </Box>
                          )}

                          <Box mt={2}>
                            <Typography variant='caption' color='text.secondary'>
                              Order: {banner.display_order || 0}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth='md' fullWidth>
        <DialogTitle>{editMode ? 'Edit Banner' : 'Create New Banner'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity='error' onClose={() => setError('')} className='mbe-4'>
              {error}
            </Alert>
          )}

          <Box display='flex' flexDirection='column' gap={3} mt={2}>
            {/* Desktop Image Upload */}
            <Box>
              <Typography variant='subtitle2' gutterBottom>
                Desktop Image *
              </Typography>
              <Button variant='outlined' component='label' fullWidth>
                <i className='ri-upload-2-line' style={{ marginRight: 8 }} />
                Upload Desktop Banner Image
                <input type='file' hidden accept='image/*' onChange={handleDesktopImageChange} />
              </Button>
              {imagePreview && (
                <Box mt={2}>
                  <img
                    src={imagePreview}
                    alt='Desktop Preview'
                    style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8 }}
                  />
                </Box>
              )}
              {imageFile && (
                <Typography variant='caption' color='success.main' display='block' mt={1}>
                  ✓ {imageFile.name} selected
                </Typography>
              )}
              <Typography variant='caption' color='text.secondary' display='block' mt={1}>
                Required. Recommended size: 1920x600px
              </Typography>
            </Box>

            {/* Mobile Image Upload */}
            <Box>
              <Typography variant='subtitle2' gutterBottom>
                Mobile Image (Optional)
              </Typography>
              <Button variant='outlined' component='label' fullWidth>
                <i className='ri-upload-2-line' style={{ marginRight: 8 }} />
                Upload Mobile Banner Image
                <input type='file' hidden accept='image/*' onChange={handleMobileImageChange} />
              </Button>
              {mobileImageFile && (
                <Typography variant='caption' color='success.main' display='block' mt={1}>
                  ✓ {mobileImageFile.name} selected
                </Typography>
              )}
              <Typography variant='caption' color='text.secondary' display='block' mt={1}>
                Optional. Recommended size: 800x400px. If not provided, desktop image will be used.
              </Typography>
            </Box>

            <TextField
              fullWidth
              label='Title'
              value={formData.title}
              onChange={handleChange('title')}
              required
              placeholder='e.g., Summer Sale - 20% Off All Excavators'
            />

            <TextField
              fullWidth
              label='Subtitle'
              value={formData.subtitle}
              onChange={handleChange('subtitle')}
              placeholder='Short tagline'
            />

            <TextField
              fullWidth
              label='Description'
              value={formData.description}
              onChange={handleChange('description')}
              multiline
              rows={3}
              placeholder='Detailed description of the promotion'
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label='Banner Type'
                  value={formData.banner_type}
                  onChange={handleChange('banner_type')}
                >
                  {bannerTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label='Position'
                  value={formData.position}
                  onChange={handleChange('position')}
                >
                  {positions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              select
              label='Target Category (Optional)'
              value={formData.target_category}
              onChange={handleChange('target_category')}
            >
              <MenuItem value=''>None</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='CTA Button Text'
                  value={formData.cta_text}
                  onChange={handleChange('cta_text')}
                  placeholder='e.g., Shop Now, Learn More'
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='CTA Link'
                  value={formData.cta_link}
                  onChange={handleChange('cta_link')}
                  placeholder='/equipment?category=1'
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label='Display Order'
                  type='number'
                  value={formData.display_order}
                  onChange={handleChange('display_order')}
                  helperText='Lower numbers appear first'
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label='Start Date'
                  type='date'
                  value={formData.start_date}
                  onChange={handleChange('start_date')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label='End Date'
                  type='date'
                  value={formData.end_date}
                  onChange={handleChange('end_date')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={handleChange('is_active')}
                />
              }
              label='Active (Show on website)'
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant='contained' disabled={loading}>
            {loading ? <CircularProgress size={20} /> : editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default BannersPage
