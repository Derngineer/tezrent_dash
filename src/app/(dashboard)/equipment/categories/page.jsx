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
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'

// API Imports
import { equipmentAPI } from '@/services/api'

const CategoriesPage = () => {
  // States
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentCategory, setCurrentCategory] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color_code: '#1976d2',
    is_featured: false,
    display_order: 0
  })
  const [iconFile, setIconFile] = useState(null)
  const [iconPreview, setIconPreview] = useState(null)
  const [promotionalImageFile, setPromotionalImageFile] = useState(null)
  const [promotionalImagePreview, setPromotionalImagePreview] = useState(null)

  // Recommended colors for categories
  const recommendedColors = [
    { color: '#FF9800', name: 'Orange' },
    { color: '#4CAF50', name: 'Green' },
    { color: '#2196F3', name: 'Blue' },
    { color: '#F44336', name: 'Red' },
    { color: '#9C27B0', name: 'Purple' },
    { color: '#00BCD4', name: 'Cyan' },
    { color: '#FF5722', name: 'Deep Orange' },
    { color: '#795548', name: 'Brown' }
  ]

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await equipmentAPI.getCategories()
      setCategories(response.data || response)
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Handle form changes
  const handleChange = (field) => (event) => {
    const value = field === 'is_featured' ? event.target.checked : event.target.value
    setFormData({ ...formData, [field]: value })
  }

  // Handle icon file selection
  const handleIconChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setIconFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setIconPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle promotional image file selection
  const handlePromotionalImageChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setPromotionalImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPromotionalImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Open dialog for create
  const handleOpenCreate = () => {
    setEditMode(false)
    setCurrentCategory(null)
    setFormData({
      name: '',
      description: '',
      color_code: '#1976d2',
      is_featured: false,
      display_order: categories.length
    })
    setIconFile(null)
    setIconPreview(null)
    setPromotionalImageFile(null)
    setPromotionalImagePreview(null)
    setOpenDialog(true)
  }

  // Open dialog for edit
  const handleOpenEdit = (category) => {
    setEditMode(true)
    setCurrentCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      color_code: category.color_code || '#1976d2',
      is_featured: category.is_featured || false,
      display_order: category.display_order || 0
    })
    setIconFile(null)
    setIconPreview(category.icon_url)
    setPromotionalImageFile(null)
    setPromotionalImagePreview(category.promotional_image_url)
    setOpenDialog(true)
  }

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setError('')
  }

  // Handle submit (create or update)
  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        setError('Category name is required')
        return
      }

      setLoading(true)
      setError('')

      let categoryId

      if (editMode && currentCategory) {
        // Update existing category
        await equipmentAPI.updateCategory(currentCategory.id, formData)
        categoryId = currentCategory.id
        setSuccess('Category updated successfully!')
      } else {
        // Create new category
        const response = await equipmentAPI.createCategory(formData)
        categoryId = response.id
        setSuccess('Category created successfully!')
      }

      // Upload icon if provided
      if (iconFile && categoryId) {
        const iconFormData = new FormData()
        iconFormData.append('icon', iconFile)
        await equipmentAPI.uploadCategoryIcon(categoryId, iconFile)
      }

      // Upload promotional image if provided
      if (promotionalImageFile && categoryId) {
        const imageFormData = new FormData()
        imageFormData.append('promotional_image', promotionalImageFile)
        // Note: You may need to add this endpoint to your API
        await equipmentAPI.uploadCategoryPromotionalImage(categoryId, promotionalImageFile)
      }

      // Refresh list and close dialog
      await fetchCategories()
      setOpenDialog(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error saving category:', err)
      setError(err.response?.data?.message || 'Failed to save category')
    } finally {
      setLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
      await equipmentAPI.deleteCategory(id)
      setSuccess('Category deleted successfully!')
      await fetchCategories()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error deleting category:', err)
      setError(err.response?.data?.message || 'Failed to delete category')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  // Toggle featured status
  const handleToggleFeatured = async (category) => {
    try {
      await equipmentAPI.updateCategory(category.id, {
        ...category,
        is_featured: !category.is_featured
      })
      setSuccess('Category updated!')
      await fetchCategories()
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      console.error('Error updating category:', err)
      setError('Failed to update category')
      setTimeout(() => setError(''), 3000)
    }
  }

  return (
    <div>
      {/* Success/Error Alerts */}
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

      {/* Categories List */}
      <Card>
        <CardHeader
          title='Equipment Categories'
          action={
            <Button
              variant='contained'
              startIcon={<i className='ri-add-line' />}
              onClick={handleOpenCreate}
            >
              Add Category
            </Button>
          }
        />
        <CardContent>
          {loading && categories.length === 0 ? (
            <Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
              <CircularProgress />
            </Box>
          ) : categories.length === 0 ? (
            <Box textAlign='center' py={4}>
              <Typography variant='h6' color='text.secondary' gutterBottom>
                No categories yet
              </Typography>
              <Typography variant='body2' color='text.secondary' paragraph>
                Create your first equipment category to get started
              </Typography>
              <Button variant='contained' onClick={handleOpenCreate} startIcon={<i className='ri-add-line' />}>
                Create Category
              </Button>
            </Box>
          ) : (
            <Grid container spacing={4}>
              {categories.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
                  <Card
                    variant='outlined'
                    sx={{
                      borderLeft: 4,
                      borderLeftColor: category.color_code || '#1976d2',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Promotional Image */}
                    {category.promotional_image_url && (
                      <Box
                        component='img'
                        src={category.promotional_image_url}
                        alt={category.name}
                        sx={{
                          width: '100%',
                          height: 150,
                          objectFit: 'cover'
                        }}
                      />
                    )}

                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display='flex' justifyContent='space-between' alignItems='start' mb={2}>
                        <Box display='flex' alignItems='center' gap={1}>
                          {category.icon_url && (
                            <Box
                              component='img'
                              src={category.icon_url}
                              alt={category.name}
                              sx={{ width: 24, height: 24, objectFit: 'contain' }}
                            />
                          )}
                          <Typography variant='h6' component='div'>
                            {category.name}
                          </Typography>
                        </Box>
                        <Box>
                          {category.is_featured && (
                            <Chip label='Featured' size='small' color='primary' sx={{ mr: 1 }} />
                          )}
                        </Box>
                      </Box>

                      {category.description && (
                        <Typography variant='body2' color='text.secondary' paragraph>
                          {category.description}
                        </Typography>
                      )}

                      <Box display='flex' gap={1} alignItems='center' mb={2}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: 1,
                            backgroundColor: category.color_code || '#1976d2'
                          }}
                        />
                        <Typography variant='caption' color='text.secondary'>
                          {category.color_code || '#1976d2'}
                        </Typography>
                      </Box>

                      <Box display='flex' gap={2} flexWrap='wrap'>
                        <Typography variant='caption' color='text.secondary'>
                          Order: {category.display_order || 0}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Equipment: {category.equipment_count || 0}
                        </Typography>
                      </Box>
                    </CardContent>

                    <Box display='flex' gap={1} p={2} pt={0}>
                      <Tooltip title={category.is_featured ? 'Remove from featured' : 'Mark as featured'}>
                        <IconButton
                          size='small'
                          color={category.is_featured ? 'primary' : 'default'}
                          onClick={() => handleToggleFeatured(category)}
                        >
                          <i className='ri-star-line' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Edit'>
                        <IconButton size='small' onClick={() => handleOpenEdit(category)}>
                          <i className='ri-edit-line' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Delete'>
                        <IconButton size='small' color='error' onClick={() => handleDelete(category.id)}>
                          <i className='ri-delete-bin-line' />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth='sm' fullWidth>
        <DialogTitle>{editMode ? 'Edit Category' : 'Create New Category'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity='error' onClose={() => setError('')} className='mbe-4'>
              {error}
            </Alert>
          )}

          <Box display='flex' flexDirection='column' gap={3} mt={2}>
            <TextField
              autoFocus
              fullWidth
              label='Category Name'
              value={formData.name}
              onChange={handleChange('name')}
              required
              placeholder='e.g., Excavators, Cranes, Forklifts'
            />

            <TextField
              fullWidth
              label='Description'
              value={formData.description}
              onChange={handleChange('description')}
              multiline
              rows={3}
              placeholder='Brief description of this category'
            />

            <TextField
              fullWidth
              label='Display Order'
              type='number'
              value={formData.display_order}
              onChange={handleChange('display_order')}
              helperText='Lower numbers appear first'
            />

            <Box>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Color Code
              </Typography>
              <Box display='flex' gap={1} flexWrap='wrap' mb={2}>
                {recommendedColors.map((item) => (
                  <Tooltip key={item.color} title={item.name}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        backgroundColor: item.color,
                        cursor: 'pointer',
                        border: formData.color_code === item.color ? '3px solid #000' : '1px solid #ddd',
                        '&:hover': { transform: 'scale(1.1)' }
                      }}
                      onClick={() => setFormData({ ...formData, color_code: item.color })}
                    />
                  </Tooltip>
                ))}
              </Box>
              <TextField
                fullWidth
                label='Custom Color'
                type='color'
                value={formData.color_code}
                onChange={handleChange('color_code')}
              />
            </Box>

            <Box>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Category Icon
              </Typography>
              <Button variant='outlined' component='label' fullWidth sx={{ mb: 1 }}>
                <i className='ri-upload-2-line' style={{ marginRight: 8 }} />
                Upload Icon
                <input type='file' hidden accept='image/*' onChange={handleIconChange} />
              </Button>
              {iconPreview && (
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    textAlign: 'center'
                  }}
                >
                  <img
                    src={iconPreview}
                    alt='Icon preview'
                    style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }}
                  />
                  <Typography variant='caption' display='block' mt={1}>
                    Icon Preview
                  </Typography>
                </Box>
              )}
            </Box>

            <Box>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Promotional Image
              </Typography>
              <Button variant='outlined' component='label' fullWidth sx={{ mb: 1 }}>
                <i className='ri-image-add-line' style={{ marginRight: 8 }} />
                Upload Promotional Image
                <input type='file' hidden accept='image/*' onChange={handlePromotionalImageChange} />
              </Button>
              {promotionalImagePreview && (
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    textAlign: 'center'
                  }}
                >
                  <img
                    src={promotionalImagePreview}
                    alt='Promotional preview'
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: 4 }}
                  />
                  <Typography variant='caption' display='block' mt={1}>
                    Promotional Image Preview
                  </Typography>
                </Box>
              )}
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_featured}
                  onChange={handleChange('is_featured')}
                />
              }
              label='Featured Category'
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

export default CategoriesPage
