'use client'

// React Imports
import { useState, useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'

// API Imports
import { equipmentAPI } from '@/services/api'

const EditEquipment = () => {
  const router = useRouter()
  const params = useParams()
  const equipmentId = params.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Form data - EXACTLY matching backend model
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    manufacturer: '',
    model_number: '',
    year: '',
    weight: '',
    dimensions: '',
    fuel_type: '',
    daily_rate: '',
    weekly_rate: '',
    monthly_rate: '',
    country: 'UAE',
    city: 'DXB',
    status: 'available',
    total_units: 1,
    available_units: 1,
    featured: false,
    is_new_listing: true,
    is_todays_deal: false,
    is_active: true,
    manual_description: ''
  })

  // Tags
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [availableTags, setAvailableTags] = useState([])

  // Existing images from server
  const [existingImages, setExistingImages] = useState([])

  // New images to upload
  const [newImages, setNewImages] = useState([])
  const [newImagePreviews, setNewImagePreviews] = useState([])

  // Operating manual handling
  const [existingManual, setExistingManual] = useState(null)
  const [newManual, setNewManual] = useState(null)
  const [newManualFileName, setNewManualFileName] = useState('')

  // Form validation
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (equipmentId) {
      loadEquipment()
      loadCategories()
      loadTags()
    }
  }, [equipmentId])

  const loadEquipment = async () => {
    try {
      setLoading(true)
      const data = await equipmentAPI.getEquipment(equipmentId)

      console.log('Loaded equipment:', data)

      // Populate form data
      setFormData({
        name: data.name || '',
        category_id: data.category?.id || data.category_id || '',
        description: data.description || '',
        manufacturer: data.manufacturer || '',
        model_number: data.model_number || '',
        year: data.year || '',
        weight: data.weight || '',
        dimensions: data.dimensions || '',
        fuel_type: data.fuel_type || '',
        daily_rate: data.daily_rate || '',
        weekly_rate: data.weekly_rate || '',
        monthly_rate: data.monthly_rate || '',
        country: data.country || 'UAE',
        city: data.city || 'DXB',
        status: data.status || 'available',
        total_units: data.total_units || 1,
        available_units: data.available_units || 1,
        featured: data.featured || false,
        is_new_listing: data.is_new_listing ?? true,
        is_todays_deal: data.is_todays_deal || false,
        is_active: data.is_active ?? true,
        manual_description: data.manual_description || ''
      })

      // Set existing images
      if (data.images && data.images.length > 0) {
        setExistingImages(data.images)
      }

      // Set existing tags
      if (data.tags && data.tags.length > 0) {
        setTags(data.tags.map(t => t.name || t))
      }

      // Set existing manual
      if (data.operating_manual) {
        setExistingManual(data.operating_manual)
      }
    } catch (err) {
      console.error('Failed to load equipment:', err)
      setError('Failed to load equipment details')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await equipmentAPI.getCategories()

      setCategories(data.results || data)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const loadTags = async () => {
    try {
      const data = await equipmentAPI.getTags()

      setAvailableTags(data.results || data)
    } catch (err) {
      console.error('Failed to load tags:', err)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleCountryChange = value => {
    const defaultCity = value === 'UAE' ? 'DXB' : 'TAS'

    setFormData(prev => ({ ...prev, country: value, city: defaultCity }))
  }

  // Image handling
  const handleNewImageSelect = e => {
    const files = Array.from(e.target.files)
    const totalImages = existingImages.length + newImages.length + files.length

    if (totalImages > 7) {
      setError('Maximum 7 images allowed')

      return
    }

    setNewImages(prev => [...prev, ...files])

    files.forEach(file => {
      const reader = new FileReader()

      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result])
      }

      reader.readAsDataURL(file)
    })
  }

  const handleRemoveExistingImage = async imageId => {
    try {
      await equipmentAPI.deleteImage(imageId)
      setExistingImages(prev => prev.filter(img => img.id !== imageId))
      setSuccess('Image deleted')
      setTimeout(() => setSuccess(null), 2000)
    } catch (err) {
      setError('Failed to delete image')
    }
  }

  const handleRemoveNewImage = index => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSetPrimaryImage = async imageId => {
    try {
      await equipmentAPI.setPrimaryImage(equipmentId, imageId)

      // Update local state
      setExistingImages(prev =>
        prev.map(img => ({
          ...img,
          is_primary: img.id === imageId
        }))
      )
      setSuccess('Primary image updated')
      setTimeout(() => setSuccess(null), 2000)
    } catch (err) {
      setError('Failed to set primary image')
    }
  }

  // Manual handling
  const handleManualFileChange = e => {
    const file = e.target.files[0]

    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Operating manual must be a PDF file')

        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('Operating manual must be less than 10MB')

        return
      }

      setNewManual(file)
      setNewManualFileName(file.name)
      setError(null)
    }
  }

  const handleRemoveManual = () => {
    setNewManual(null)
    setNewManualFileName('')
    setExistingManual(null)
  }

  // Tag handling
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleSelectExistingTag = tagName => {
    if (!tags.includes(tagName)) {
      setTags([...tags, tagName])
    }
  }

  const handleRemoveTag = tagToRemove => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Equipment name is required'
    if (!formData.category_id) newErrors.category_id = 'Category is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'

    // Validate daily rate (required and must be positive)
    if (!formData.daily_rate || parseFloat(formData.daily_rate) <= 0) {
      newErrors.daily_rate = 'Valid daily rate is required (must be greater than 0)'
    } else if (parseFloat(formData.daily_rate) < 0) {
      newErrors.daily_rate = 'Daily rate cannot be negative'
    }

    // Validate weekly rate (optional but must be positive if provided)
    if (formData.weekly_rate && parseFloat(formData.weekly_rate) < 0) {
      newErrors.weekly_rate = 'Weekly rate cannot be negative'
    }

    // Validate monthly rate (optional but must be positive if provided)
    if (formData.monthly_rate && parseFloat(formData.monthly_rate) < 0) {
      newErrors.monthly_rate = 'Monthly rate cannot be negative'
    }

    if (!formData.country) newErrors.country = 'Country is required'
    if (!formData.city) newErrors.city = 'City is required'

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!validateForm()) {
      setError('Please fix the errors in the form')

      return
    }

    try {
      setSaving(true)
      setError(null)

      // Create FormData for multipart/form-data
      const formDataToSend = new FormData()

      // Fields that backend requires but we treat as optional on frontend
      // Send empty string if not provided (backend workaround)
      const optionalFieldsWithDefaults = {
        manufacturer: '',
        model_number: '',
        year: '',
        weight: '',
        dimensions: '',
        fuel_type: ''
      }

      // Add all form fields (only non-empty values)
      Object.keys(formData).forEach(key => {
        const value = formData[key]

        if (value !== '' && value !== null && value !== undefined) {
          if (typeof value === 'boolean') {
            formDataToSend.append(key, value ? 'true' : 'false')
          } else {
            formDataToSend.append(key, value)
          }
        } else if (key in optionalFieldsWithDefaults) {
          // Send empty string for optional fields that backend requires
          formDataToSend.append(key, optionalFieldsWithDefaults[key])
        }
      })

      // Add tags as JSON string if any
      if (tags.length > 0) {
        formDataToSend.append('tag_names', JSON.stringify(tags))
      }

      // Add NEW images only
      newImages.forEach(image => {
        formDataToSend.append('images', image)
      })

      // Add operating manual if new one selected
      if (newManual) {
        formDataToSend.append('operating_manual', newManual)
      }

      // Log what we're sending
      console.log('Updating equipment data:')

      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: ${value.name} (${value.type}, ${value.size} bytes)`)
        } else {
          console.log(`  ${key}: ${value}`)
        }
      }

      // Update equipment
      await equipmentAPI.updateEquipment(equipmentId, formDataToSend)

      setSuccess('Equipment updated successfully!')

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/equipment')
      }, 2000)
    } catch (err) {
      console.error('Failed to update equipment:', err)
      console.error('Error response:', err.response?.data)

      let errorMessage = 'Failed to update equipment'

      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          const fieldErrors = Object.entries(err.response.data)
            .map(([field, messages]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages]

              return `${field}: ${msgArray.join(', ')}`
            })
            .join(' | ')

          errorMessage = fieldErrors || errorMessage
        } else {
          errorMessage = err.response.data.message || err.response.data || errorMessage
        }
      }

      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <Box>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={6}>
          <Skeleton variant='text' width={300} height={40} />
          <Skeleton variant='rectangular' width={100} height={36} />
        </Box>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Skeleton variant='text' width={200} height={30} sx={{ mb: 4 }} />
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Skeleton variant='rectangular' height={56} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Skeleton variant='rectangular' height={56} />
                  </Grid>
                  <Grid item xs={12}>
                    <Skeleton variant='rectangular' height={120} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={6}>
        <Box>
          <Typography variant='h4'>Edit Equipment</Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            Update the details of your equipment
          </Typography>
        </Box>
        <Button variant='outlined' onClick={() => router.push('/equipment')}>
          Cancel
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity='error' onClose={() => setError(null)} sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity='success' onClose={() => setSuccess(null)} sx={{ mb: 4 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={6}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 4 }}>
                  Basic Information
                </Typography>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label='Equipment Name'
                      placeholder='e.g., Caterpillar 320D Excavator'
                      value={formData.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      error={!!errors.name}
                      helperText={errors.name}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      select
                      label='Category'
                      value={formData.category_id}
                      onChange={e => handleInputChange('category_id', e.target.value)}
                      error={!!errors.category_id}
                      helperText={errors.category_id}
                    >
                      <MenuItem value=''>Select Category</MenuItem>
                      {categories.map(cat => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      multiline
                      rows={4}
                      label='Description'
                      placeholder='Detailed description of the equipment...'
                      value={formData.description}
                      onChange={e => handleInputChange('description', e.target.value)}
                      error={!!errors.description}
                      helperText={errors.description}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Pricing */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 4 }}>
                  Pricing
                </Typography>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6} lg={3}>
                    <TextField
                      fullWidth
                      required
                      type='number'
                      label='Daily Rate (AED)'
                      value={formData.daily_rate}
                      onChange={e => handleInputChange('daily_rate', e.target.value)}
                      error={!!errors.daily_rate}
                      helperText={errors.daily_rate}
                      inputProps={{ min: 0, step: '0.01' }}
                      InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>AED</Typography> }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6} lg={3}>
                    <TextField
                      fullWidth
                      type='number'
                      label='Weekly Rate (AED)'
                      value={formData.weekly_rate}
                      onChange={e => handleInputChange('weekly_rate', e.target.value)}
                      error={!!errors.weekly_rate}
                      helperText={errors.weekly_rate}
                      inputProps={{ min: 0, step: '0.01' }}
                      InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>AED</Typography> }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6} lg={3}>
                    <TextField
                      fullWidth
                      type='number'
                      label='Monthly Rate (AED)'
                      value={formData.monthly_rate}
                      onChange={e => handleInputChange('monthly_rate', e.target.value)}
                      error={!!errors.monthly_rate}
                      helperText={errors.monthly_rate}
                      inputProps={{ min: 0, step: '0.01' }}
                      InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>AED</Typography> }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Equipment Details */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 1 }}>
                  Equipment Details
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
                  All fields in this section are optional
                </Typography>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label='Manufacturer'
                      value={formData.manufacturer}
                      onChange={e => handleInputChange('manufacturer', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label='Model Number'
                      value={formData.model_number}
                      onChange={e => handleInputChange('model_number', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type='number'
                      label='Year'
                      value={formData.year}
                      onChange={e => handleInputChange('year', e.target.value)}
                      inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label='Weight'
                      value={formData.weight}
                      onChange={e => handleInputChange('weight', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label='Dimensions'
                      value={formData.dimensions}
                      onChange={e => handleInputChange('dimensions', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label='Fuel Type'
                      value={formData.fuel_type}
                      onChange={e => handleInputChange('fuel_type', e.target.value)}
                    />
                  </Grid>

                  {/* Marketing & Visibility */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant='h6' sx={{ mb: 2 }}>
                      Marketing & Visibility
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.featured}
                              onChange={e => handleInputChange('featured', e.target.checked)}
                            />
                          }
                          label='Featured Listing'
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.is_new_listing}
                              onChange={e => handleInputChange('is_new_listing', e.target.checked)}
                            />
                          }
                          label='New Listing'
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.is_todays_deal}
                              onChange={e => handleInputChange('is_todays_deal', e.target.checked)}
                            />
                          }
                          label="Today's Deal"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.is_active}
                              onChange={e => handleInputChange('is_active', e.target.checked)}
                            />
                          }
                          label='Active'
                        />
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />
                  </Grid>

                  {/* Tags */}
                  <Grid item xs={12}>
                    <Typography variant='body2' fontWeight={600} gutterBottom>
                      Tags (Optional)
                    </Typography>
                    {tags.length > 0 && (
                      <Box display='flex' gap={1} flexWrap='wrap' mb={2}>
                        {tags.map((tag, index) => (
                          <Chip key={index} label={tag} onDelete={() => handleRemoveTag(tag)} color='primary' />
                        ))}
                      </Box>
                    )}
                    {availableTags.length > 0 && (
                      <Box mb={2}>
                        <Typography variant='caption' color='text.secondary' display='block' mb={1}>
                          Select from existing tags:
                        </Typography>
                        <Box display='flex' gap={1} flexWrap='wrap'>
                          {availableTags
                            .filter(tag => !tags.includes(tag.name))
                            .map(tag => (
                              <Chip
                                key={tag.id}
                                label={tag.name}
                                onClick={() => handleSelectExistingTag(tag.name)}
                                variant='outlined'
                                size='small'
                                sx={{
                                  cursor: 'pointer',
                                  '&:hover': { backgroundColor: 'primary.main', color: 'white' }
                                }}
                              />
                            ))}
                        </Box>
                      </Box>
                    )}
                    <Box display='flex' gap={2}>
                      <TextField
                        fullWidth
                        size='small'
                        label='Create New Tag'
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyPress={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddTag()
                          }
                        }}
                      />
                      <Button variant='outlined' onClick={handleAddTag} disabled={!tagInput.trim()}>
                        Add
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Location & Availability */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 4 }}>
                  Location & Availability
                </Typography>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      select
                      label='Country'
                      value={formData.country}
                      onChange={e => handleCountryChange(e.target.value)}
                      error={!!errors.country}
                      helperText={errors.country}
                    >
                      <MenuItem value='UAE'>United Arab Emirates</MenuItem>
                      <MenuItem value='UZB'>Uzbekistan</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      select
                      label='City'
                      value={formData.city}
                      onChange={e => handleInputChange('city', e.target.value)}
                      error={!!errors.city}
                      helperText={errors.city}
                    >
                      {formData.country === 'UAE' && <MenuItem value='DXB'>Dubai</MenuItem>}
                      {formData.country === 'UAE' && <MenuItem value='AUH'>Abu Dhabi</MenuItem>}
                      {formData.country === 'UAE' && <MenuItem value='SHJ'>Sharjah</MenuItem>}
                      {formData.country === 'UAE' && <MenuItem value='AJM'>Ajman</MenuItem>}
                      {formData.country === 'UAE' && <MenuItem value='RAK'>Ras Al Khaimah</MenuItem>}
                      {formData.country === 'UAE' && <MenuItem value='FUJ'>Fujairah</MenuItem>}
                      {formData.country === 'UAE' && <MenuItem value='UAQ'>Umm Al Quwain</MenuItem>}
                      {formData.country === 'UZB' && <MenuItem value='TAS'>Tashkent</MenuItem>}
                      {formData.country === 'UZB' && <MenuItem value='SAM'>Samarkand</MenuItem>}
                      {formData.country === 'UZB' && <MenuItem value='NAM'>Namangan</MenuItem>}
                      {formData.country === 'UZB' && <MenuItem value='AND'>Andijan</MenuItem>}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      select
                      label='Status'
                      value={formData.status}
                      onChange={e => handleInputChange('status', e.target.value)}
                    >
                      <MenuItem value='available'>Available</MenuItem>
                      <MenuItem value='rented'>Rented</MenuItem>
                      <MenuItem value='maintenance'>Maintenance</MenuItem>
                      <MenuItem value='unavailable'>Unavailable</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type='number'
                      label='Total Units'
                      value={formData.total_units}
                      onChange={e => handleInputChange('total_units', e.target.value)}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type='number'
                      label='Available Units'
                      value={formData.available_units}
                      onChange={e => handleInputChange('available_units', e.target.value)}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Images */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 2 }}>
                  Images
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                  Manage equipment images. Click the star to set primary image.
                </Typography>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant='subtitle2' sx={{ mb: 2 }}>
                      Current Images
                    </Typography>
                    <Grid container spacing={2}>
                      {existingImages.map((image, index) => (
                        <Grid item xs={6} sm={4} md={3} lg={2} key={image.id}>
                          <Box
                            sx={{
                              position: 'relative',
                              paddingTop: '100%',
                              borderRadius: 1,
                              overflow: 'hidden',
                              border: '2px solid',
                              borderColor: image.is_primary ? 'primary.main' : 'divider'
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundImage: `url(${image.image || image.url})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                              }}
                            />
                            {image.is_primary && (
                              <Chip
                                label='Primary'
                                size='small'
                                color='primary'
                                sx={{ position: 'absolute', top: 8, left: 8 }}
                              />
                            )}
                            <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                              {!image.is_primary && (
                                <IconButton
                                  size='small'
                                  onClick={() => handleSetPrimaryImage(image.id)}
                                  sx={{ bgcolor: 'background.paper' }}
                                  title='Set as primary'
                                >
                                  <i className='ri-star-line' />
                                </IconButton>
                              )}
                              <IconButton
                                size='small'
                                onClick={() => handleRemoveExistingImage(image.id)}
                                sx={{
                                  bgcolor: 'background.paper',
                                  '&:hover': { bgcolor: 'error.main', color: 'white' }
                                }}
                              >
                                <i className='ri-close-line' />
                              </IconButton>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* New Images Preview */}
                {newImagePreviews.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant='subtitle2' sx={{ mb: 2 }}>
                      New Images (will be uploaded on save)
                    </Typography>
                    <Grid container spacing={2}>
                      {newImagePreviews.map((preview, index) => (
                        <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                          <Box
                            sx={{
                              position: 'relative',
                              paddingTop: '100%',
                              borderRadius: 1,
                              overflow: 'hidden',
                              border: '2px dashed',
                              borderColor: 'success.main'
                            }}
                          >
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundImage: `url(${preview})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                              }}
                            />
                            <Chip
                              label='New'
                              size='small'
                              color='success'
                              sx={{ position: 'absolute', top: 8, left: 8 }}
                            />
                            <IconButton
                              size='small'
                              onClick={() => handleRemoveNewImage(index)}
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                bgcolor: 'background.paper',
                                '&:hover': { bgcolor: 'error.main', color: 'white' }
                              }}
                            >
                              <i className='ri-close-line' />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Upload Button */}
                <Button variant='outlined' component='label' disabled={existingImages.length + newImages.length >= 7}>
                  <i className='ri-upload-2-line' style={{ marginRight: 8 }} />
                  Add More Images
                  <input type='file' hidden multiple accept='image/*' onChange={handleNewImageSelect} />
                </Button>
                <Typography variant='caption' color='text.secondary' sx={{ ml: 2 }}>
                  {existingImages.length + newImages.length}/7 images
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Operating Manual */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 1 }}>
                  Operating Manual (Optional)
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                  Upload a PDF operating manual or user guide.
                </Typography>

                {/* Existing Manual */}
                {existingManual && !newManual && (
                  <Box
                    sx={{
                      p: 2,
                      mb: 2,
                      border: '1px solid',
                      borderColor: 'primary.main',
                      borderRadius: 1,
                      backgroundColor: 'primary.lighter',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box display='flex' alignItems='center' gap={1}>
                      <i className='ri-file-pdf-line' style={{ fontSize: 24 }} />
                      <Box>
                        <Typography variant='body2' fontWeight={600}>
                          Current Manual
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          <a href={existingManual} target='_blank' rel='noopener noreferrer'>
                            View PDF
                          </a>
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton size='small' onClick={handleRemoveManual} color='error'>
                      <i className='ri-close-line' />
                    </IconButton>
                  </Box>
                )}

                {/* New Manual */}
                {newManualFileName && (
                  <Box
                    sx={{
                      p: 2,
                      mb: 2,
                      border: '1px solid',
                      borderColor: 'success.main',
                      borderRadius: 1,
                      backgroundColor: 'success.lighter',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box display='flex' alignItems='center' gap={1}>
                      <i
                        className='ri-file-pdf-line'
                        style={{ fontSize: 24, color: 'var(--mui-palette-success-main)' }}
                      />
                      <Box>
                        <Typography variant='body2' fontWeight={600}>
                          {newManualFileName}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          New PDF (will replace existing)
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton size='small' onClick={handleRemoveManual} color='error'>
                      <i className='ri-close-line' />
                    </IconButton>
                  </Box>
                )}

                {/* Upload New Manual */}
                {!newManualFileName && !existingManual && (
                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: 'grey.300',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      mb: 2,
                      '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' }
                    }}
                    onClick={() => document.getElementById('manual-upload-input').click()}
                  >
                    <input
                      id='manual-upload-input'
                      type='file'
                      hidden
                      accept='application/pdf'
                      onChange={handleManualFileChange}
                    />
                    <i className='ri-file-pdf-line' style={{ fontSize: 48, opacity: 0.5 }} />
                    <Typography variant='body2' sx={{ mt: 1 }}>
                      Click to upload operating manual
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      PDF only (Max 10MB)
                    </Typography>
                  </Box>
                )}

                {(existingManual || newManualFileName) && !newManualFileName && (
                  <Button variant='outlined' component='label' size='small'>
                    Replace Manual
                    <input type='file' hidden accept='application/pdf' onChange={handleManualFileChange} />
                  </Button>
                )}

                {/* Manual Description */}
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label='Manual Description'
                  placeholder="Describe what's included in the manual..."
                  value={formData.manual_description}
                  onChange={e => handleInputChange('manual_description', e.target.value)}
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Box display='flex' gap={2} justifyContent='flex-end'>
              <Button variant='outlined' onClick={() => router.push('/equipment')} disabled={saving}>
                Cancel
              </Button>
              <Button
                type='submit'
                variant='contained'
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <i className='ri-save-line' />}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}

export default EditEquipment
