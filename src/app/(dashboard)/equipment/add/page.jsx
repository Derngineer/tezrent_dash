'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

// API Imports
import { equipmentAPI } from '@/services/api'

const AddEquipment = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [uploadingImages, setUploadingImages] = useState(false)

  // Form data - EXACTLY matching backend model
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    manufacturer: '',
    model_number: '', // Backend field
    year: '', // Backend field (not manufacture_year)
    weight: '',
    dimensions: '',
    fuel_type: '',
    daily_rate: '',
    weekly_rate: '',
    monthly_rate: '',
    country: 'UAE', // Required: 3-letter code
    city: 'DXB', // Required: 3-letter code
    status: 'available',
    total_units: 1,
    available_units: 1,
    featured: false, // Backend field (not is_featured)
    manual_description: '' // Optional: Description of operating manual
  })

  // Specifications array
  const [specifications, setSpecifications] = useState([])
  const [specName, setSpecName] = useState('')
  const [specValue, setSpecValue] = useState('')

  // Tags
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [availableTags, setAvailableTags] = useState([])
  const [loadingTags, setLoadingTags] = useState(false)

  // Image handling
  const [selectedImages, setSelectedImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  // Operating manual handling
  const [operatingManual, setOperatingManual] = useState(null)
  const [manualFileName, setManualFileName] = useState('')

  // Form validation
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadCategories()
    loadTags()
  }, [])

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
      setLoadingTags(true)
      const data = await equipmentAPI.getTags()
      setAvailableTags(data.results || data)
    } catch (err) {
      console.error('Failed to load tags:', err)
    } finally {
      setLoadingTags(false)
    }
  }

  const handleInputChange = (field, value) => {
    console.log(`Field "${field}" changed to:`, value)
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      console.log('Updated formData:', newData)
      return newData
    })
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleCountryChange = (value) => {
    console.log('Country changed to:', value)
    // When country changes, reset city to default for that country
    const defaultCity = value === 'UAE' ? 'DXB' : 'TAS'
    console.log('Resetting city to:', defaultCity)
    setFormData(prev => {
      const newData = { ...prev, country: value, city: defaultCity }
      console.log('Updated formData:', newData)
      return newData
    })
    // Clear errors
    if (errors.country) {
      setErrors(prev => ({ ...prev, country: null }))
    }
    if (errors.city) {
      setErrors(prev => ({ ...prev, city: null }))
    }
  }

  const handleImageSelect = e => {
    const files = Array.from(e.target.files)
    if (files.length + selectedImages.length > 7) {
      setError('Maximum 7 images allowed')
      return
    }

    setSelectedImages(prev => [...prev, ...files])

    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImage = index => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleManualFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type (PDF only)
      if (file.type !== 'application/pdf') {
        setError('Operating manual must be a PDF file')
        return
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Operating manual must be less than 10MB')
        return
      }
      setOperatingManual(file)
      setManualFileName(file.name)
      setError(null)
    }
  }

  const handleRemoveManual = () => {
    setOperatingManual(null)
    setManualFileName('')
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleSelectExistingTag = (tagName) => {
    if (!tags.includes(tagName)) {
      setTags([...tags, tagName])
    }
  }

  const handleRemoveTag = tagToRemove => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleAddSpecification = () => {
    if (specName.trim() && specValue.trim()) {
      setSpecifications([...specifications, { name: specName.trim(), value: specValue.trim() }])
      setSpecName('')
      setSpecValue('')
    }
  }

  const handleRemoveSpecification = index => {
    setSpecifications(specifications.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Equipment name is required'
    if (!formData.category_id) newErrors.category_id = 'Category is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.daily_rate || parseFloat(formData.daily_rate) <= 0)
      newErrors.daily_rate = 'Valid daily rate is required'
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
      setLoading(true)
      setError(null)

      // Create FormData for multipart/form-data
      const formDataToSend = new FormData()

      // Add all form fields (only non-empty values)
      Object.keys(formData).forEach(key => {
        const value = formData[key]
        if (value !== '' && value !== null && value !== undefined) {
          // Convert boolean to string for FormData
          if (typeof value === 'boolean') {
            formDataToSend.append(key, value ? 'true' : 'false')
          } else {
            formDataToSend.append(key, value)
          }
        }
      })

      // Add tags as JSON string if any
      if (tags.length > 0) {
        formDataToSend.append('tag_names', JSON.stringify(tags))
      }

      // Add specifications as JSON string if any
      if (specifications.length > 0) {
        formDataToSend.append('specifications_data', JSON.stringify(specifications))
      }

      // Add images directly to FormData (backend expects 'images' field)
      selectedImages.forEach(image => {
        formDataToSend.append('images', image)
      })

      // Add operating manual if selected (optional)
      if (operatingManual) {
        formDataToSend.append('operating_manual', operatingManual)
      }

      // Log what we're sending
      console.log('Submitting equipment data:')
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: ${value.name} (${value.type}, ${value.size} bytes)`)
        } else {
          console.log(`  ${key}: ${value}`)
        }
      }

      // Create equipment (images are uploaded with creation)
      const equipment = await equipmentAPI.createEquipment(formDataToSend)

      setSuccess('Equipment added successfully!')
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/equipment')
      }, 2000)
    } catch (err) {
      console.error('Failed to create equipment:', err)
      console.error('Error response:', err.response?.data)
      console.error('Error status:', err.response?.status)
      console.error('Full error object:', JSON.stringify(err.response?.data, null, 2))
      
      // Extract detailed error messages
      let errorMessage = 'Failed to create equipment'
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          // Log each field error separately
          Object.entries(err.response.data).forEach(([field, messages]) => {
            console.error(`Field "${field}":`, messages)
          })
          
          // Handle field-specific errors
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
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
      setUploadingImages(false)
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={6}>
        <Box>
          <Typography variant='h4'>Add New Equipment</Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            Fill in the details to add equipment to your inventory
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
                      placeholder='Detailed description of the equipment, its capabilities, and specifications...'
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
                      placeholder='0.00'
                      value={formData.daily_rate}
                      onChange={e => handleInputChange('daily_rate', e.target.value)}
                      error={!!errors.daily_rate}
                      helperText={errors.daily_rate}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>AED</Typography>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6} lg={3}>
                    <TextField
                      fullWidth
                      type='number'
                      label='Weekly Rate (AED)'
                      placeholder='Optional'
                      value={formData.weekly_rate}
                      onChange={e => handleInputChange('weekly_rate', e.target.value)}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>AED</Typography>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6} lg={3}>
                    <TextField
                      fullWidth
                      type='number'
                      label='Monthly Rate (AED)'
                      placeholder='Optional'
                      value={formData.monthly_rate}
                      onChange={e => handleInputChange('monthly_rate', e.target.value)}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>AED</Typography>
                      }}
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
                <Typography variant='h6' sx={{ mb: 4 }}>
                  Equipment Details
                </Typography>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label='Manufacturer'
                      placeholder='e.g., Caterpillar'
                      value={formData.manufacturer}
                      onChange={e => handleInputChange('manufacturer', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label='Model Number'
                      placeholder='e.g., 320D'
                      value={formData.model_number}
                      onChange={e => handleInputChange('model_number', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type='number'
                      label='Year'
                      placeholder='e.g., 2022'
                      value={formData.year}
                      onChange={e => handleInputChange('year', e.target.value)}
                      inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label='Weight'
                      placeholder='e.g., 20000 kg'
                      value={formData.weight}
                      onChange={e => handleInputChange('weight', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label='Dimensions'
                      placeholder='e.g., 9.5m x 2.8m x 3.1m'
                      value={formData.dimensions}
                      onChange={e => handleInputChange('dimensions', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label='Fuel Type'
                      placeholder='e.g., Diesel, Electric'
                      value={formData.fuel_type}
                      onChange={e => handleInputChange('fuel_type', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant='body2' fontWeight={600} gutterBottom>
                      Technical Specifications
                    </Typography>
                    <Box display='flex' flexDirection='column' gap={2}>
                      {specifications.map((spec, index) => (
                        <Box key={index} display='flex' gap={1} alignItems='center'>
                          <Chip
                            label={`${spec.name}: ${spec.value}`}
                            onDelete={() => handleRemoveSpecification(index)}
                            color='primary'
                            variant='outlined'
                          />
                        </Box>
                      ))}
                    </Box>
                    <Box display='flex' gap={2} mt={2}>
                      <TextField
                        size='small'
                        label='Spec Name'
                        placeholder='e.g., Engine Power'
                        value={specName}
                        onChange={e => setSpecName(e.target.value)}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        size='small'
                        label='Spec Value'
                        placeholder='e.g., 122 HP'
                        value={specValue}
                        onChange={e => setSpecValue(e.target.value)}
                        sx={{ flex: 1 }}
                      />
                      <Button variant='outlined' onClick={handleAddSpecification}>
                        Add
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant='body2' fontWeight={600} gutterBottom>
                      Tags (Optional)
                    </Typography>
                    
                    {/* Selected Tags */}
                    {tags.length > 0 && (
                      <Box display='flex' gap={1} flexWrap='wrap' mb={2}>
                        {tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            onDelete={() => handleRemoveTag(tag)}
                            color='primary'
                          />
                        ))}
                      </Box>
                    )}

                    {/* Existing Tags - Quick Select */}
                    {availableTags.length > 0 && (
                      <Box mb={2}>
                        <Typography variant='caption' color='text.secondary' display='block' mb={1}>
                          Select from existing tags:
                        </Typography>
                        <Box display='flex' gap={1} flexWrap='wrap'>
                          {availableTags
                            .filter(tag => !tags.includes(tag.name))
                            .map((tag) => (
                              <Chip
                                key={tag.id}
                                label={tag.name}
                                onClick={() => handleSelectExistingTag(tag.name)}
                                variant='outlined'
                                size='small'
                                sx={{ 
                                  cursor: 'pointer',
                                  '&:hover': { 
                                    backgroundColor: 'primary.main',
                                    color: 'primary.contrastText'
                                  }
                                }}
                              />
                            ))}
                        </Box>
                      </Box>
                    )}

                    {/* Add New Tag */}
                    <Box display='flex' gap={2}>
                      <TextField
                        fullWidth
                        size='small'
                        label='Create New Tag'
                        placeholder='e.g., Heavy Equipment, Construction'
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
                        <i className='ri-add-line' style={{ marginRight: 4 }} />
                        Add New
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
                      required
                      type='number'
                      label='Total Units'
                      placeholder='Total number of units'
                      value={formData.total_units}
                      onChange={e => handleInputChange('total_units', e.target.value)}
                      inputProps={{ min: 1 }}
                      helperText='Total units owned'
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      required
                      type='number'
                      label='Available Units'
                      placeholder='Available for rent'
                      value={formData.available_units}
                      onChange={e => handleInputChange('available_units', e.target.value)}
                      inputProps={{ min: 0 }}
                      helperText='Currently available'
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
                  Upload up to 7 images. First image will be set as primary.
                </Typography>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2}>
                      {imagePreviews.map((preview, index) => (
                        <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                          <Box
                            sx={{
                              position: 'relative',
                              paddingTop: '100%',
                              borderRadius: 1,
                              overflow: 'hidden',
                              border: '2px solid',
                              borderColor: index === 0 ? 'primary.main' : 'divider'
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
                            {index === 0 && (
                              <Chip
                                label='Primary'
                                size='small'
                                color='primary'
                                sx={{ position: 'absolute', top: 8, left: 8 }}
                              />
                            )}
                            <IconButton
                              size='small'
                              onClick={() => handleRemoveImage(index)}
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
                <Button variant='outlined' component='label' disabled={selectedImages.length >= 7}>
                  <i className='ri-upload-2-line' style={{ marginRight: 8 }} />
                  Choose Images
                  <input type='file' hidden multiple accept='image/*' onChange={handleImageSelect} />
                </Button>
                <Typography variant='caption' color='text.secondary' sx={{ ml: 2 }}>
                  {selectedImages.length}/7 images selected
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
                  Upload a PDF operating manual or user guide. This will be available to customers after booking confirmation.
                </Typography>

                {/* Manual File Display */}
                {manualFileName ? (
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
                      <i className='ri-file-pdf-line' style={{ fontSize: 24, color: 'var(--mui-palette-success-main)' }} />
                      <Box>
                        <Typography variant='body2' fontWeight={600}>
                          {manualFileName}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          PDF Document
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton size='small' onClick={handleRemoveManual} color='error'>
                      <i className='ri-close-line' />
                    </IconButton>
                  </Box>
                ) : (
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

                {/* Manual Description */}
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label='Manual Description'
                  placeholder="Describe what's included in the manual (e.g., Safety instructions, maintenance guide, troubleshooting)"
                  value={formData.manual_description}
                  onChange={e => handleInputChange('manual_description', e.target.value)}
                  helperText='Optional: Helps customers understand what information is available'
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Additional Options */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 3 }}>
                  Additional Options
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.featured}
                          onChange={e => handleInputChange('featured', e.target.checked)}
                        />
                      }
                      label='Feature this equipment (appears prominently in listings)'
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Box display='flex' gap={2} justifyContent='flex-end'>
              <Button variant='outlined' onClick={() => router.push('/equipment')} disabled={loading}>
                Cancel
              </Button>
              <Button
                type='submit'
                variant='contained'
                disabled={loading || uploadingImages}
                startIcon={loading || uploadingImages ? <CircularProgress size={20} /> : <i className='ri-add-line' />}
              >
                {uploadingImages ? 'Uploading Images...' : loading ? 'Creating...' : 'Add Equipment'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}

export default AddEquipment
