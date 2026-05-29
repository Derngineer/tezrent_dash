'use client'

import { useState, useEffect, useCallback } from 'react'

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
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'

import { equipmentAPI } from '@/services/api'

const MAJOR_CATEGORIES = [
  { value: 'construction', label: 'Construction' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'sports', label: 'Sports' },
  { value: 'home_goods', label: 'Home Goods' },
  { value: 'cars_auto', label: 'Cars & Auto' },
  { value: 'real_estate', label: 'Real Estate' }
]

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

const SubCategoriesPage = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentCategory, setCurrentCategory] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [majorFilter, setMajorFilter] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    major_category: '',
    description: '',
    color_code: '#1976d2',
    is_featured: false,
    display_order: 0
  })

  const [iconFile, setIconFile] = useState(null)
  const [iconPreview, setIconPreview] = useState(null)
  const [promotionalImageFile, setPromotionalImageFile] = useState(null)
  const [promotionalImagePreview, setPromotionalImagePreview] = useState(null)

  const fetchCategories = useCallback(async (major = majorFilter) => {
    try {
      setLoading(true)
      const response = await equipmentAPI.getCategories(major || null)

      let categoriesData = []

      if (Array.isArray(response)) {
        categoriesData = response
      } else if (response?.results && Array.isArray(response.results)) {
        categoriesData = response.results
      } else if (response?.data && Array.isArray(response.data)) {
        categoriesData = response.data
      }

      setCategories(categoriesData)
    } catch (err) {
      console.error('Error fetching sub-categories:', err)
      setError('Failed to load sub-categories')
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [majorFilter])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleChange = field => event => {
    const value = field === 'is_featured' ? event.target.checked : event.target.value

    setFormData({ ...formData, [field]: value })
  }

  const handleIconChange = event => {
    const file = event.target.files[0]

    if (file) {
      setIconFile(file)
      const reader = new FileReader()

      reader.onloadend = () => setIconPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handlePromotionalImageChange = event => {
    const file = event.target.files[0]

    if (file) {
      setPromotionalImageFile(file)
      const reader = new FileReader()

      reader.onloadend = () => setPromotionalImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleOpenCreate = () => {
    setEditMode(false)
    setCurrentCategory(null)
    setFormData({
      name: '',
      major_category: majorFilter || '',
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

  const handleOpenEdit = category => {
    setEditMode(true)
    setCurrentCategory(category)
    setFormData({
      name: category.name,
      major_category: category.major_category || '',
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

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setError('')
  }

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        setError('Sub-category name is required')

        return
      }

      if (!formData.major_category) {
        setError('Major category is required')

        return
      }

      setLoading(true)
      setError('')

      let categoryId

      if (editMode && currentCategory) {
        await equipmentAPI.updateCategory(currentCategory.id, formData)
        categoryId = currentCategory.id
        setSuccess('Sub-category updated successfully!')
      } else {
        const response = await equipmentAPI.createCategory(formData)

        categoryId = response.id
        setSuccess('Sub-category created successfully!')
      }

      if (iconFile && categoryId) {
        await equipmentAPI.uploadCategoryIcon(categoryId, iconFile)
      }

      if (promotionalImageFile && categoryId) {
        await equipmentAPI.uploadCategoryPromotionalImage(categoryId, promotionalImageFile)
      }

      await fetchCategories()
      setOpenDialog(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error saving sub-category:', err)
      setError(err.response?.data?.message || 'Failed to save sub-category')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async id => {
    if (!confirm('Are you sure you want to delete this sub-category? This action cannot be undone.')) return

    try {
      setLoading(true)
      await equipmentAPI.deleteCategory(id)
      setSuccess('Sub-category deleted successfully!')
      await fetchCategories()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error deleting sub-category:', err)
      setError(err.response?.data?.message || 'Failed to delete sub-category')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFeatured = async category => {
    try {
      await equipmentAPI.updateCategory(category.id, { ...category, is_featured: !category.is_featured })
      setSuccess('Sub-category updated!')
      await fetchCategories()
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      console.error('Error updating sub-category:', err)
      setError('Failed to update sub-category')
      setTimeout(() => setError(''), 3000)
    }
  }

  const getMajorLabel = value => MAJOR_CATEGORIES.find(c => c.value === value)?.label || value

  return (
    <div>
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

      <Card>
        <CardHeader
          title='Sub-Categories'
          subheader='Sub-categories fall under one of the 6 major categories'
          action={
            <Box display='flex' gap={2} alignItems='center'>
              <TextField
                select
                size='small'
                label='Filter by Major Category'
                value={majorFilter}
                onChange={e => setMajorFilter(e.target.value)}
                sx={{ minWidth: 200 }}
              >
                <MenuItem value=''>All Major Categories</MenuItem>
                {MAJOR_CATEGORIES.map(cat => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </TextField>
              <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={handleOpenCreate}>
                Add Sub-Category
              </Button>
            </Box>
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
                No sub-categories yet
              </Typography>
              <Typography variant='body2' color='text.secondary' paragraph>
                {majorFilter
                  ? `No sub-categories under ${getMajorLabel(majorFilter)}`
                  : 'Create sub-categories under any major category'}
              </Typography>
              <Button variant='contained' onClick={handleOpenCreate} startIcon={<i className='ri-add-line' />}>
                Add Sub-Category
              </Button>
            </Box>
          ) : (
            <Grid container spacing={4}>
              {categories.map(category => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
                  <Card
                    variant='outlined'
                    sx={{ borderLeft: 4, borderLeftColor: category.color_code || '#1976d2', height: '100%', display: 'flex', flexDirection: 'column' }}
                  >
                    {category.promotional_image_url && (
                      <Box
                        component='img'
                        src={category.promotional_image_url}
                        alt={category.name}
                        sx={{ width: '100%', height: 150, objectFit: 'cover' }}
                      />
                    )}

                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display='flex' justifyContent='space-between' alignItems='start' mb={1}>
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
                        {category.is_featured && <Chip label='Featured' size='small' color='primary' />}
                      </Box>

                      {category.major_category && (
                        <Chip
                          label={getMajorLabel(category.major_category)}
                          size='small'
                          variant='outlined'
                          color='secondary'
                          sx={{ mb: 1 }}
                        />
                      )}

                      {category.description && (
                        <Typography variant='body2' color='text.secondary' paragraph>
                          {category.description}
                        </Typography>
                      )}

                      <Box display='flex' gap={1} alignItems='center' mb={1}>
                        <Box sx={{ width: 20, height: 20, borderRadius: 0.5, backgroundColor: category.color_code || '#1976d2' }} />
                        <Typography variant='caption' color='text.secondary'>
                          {category.color_code || '#1976d2'}
                        </Typography>
                      </Box>

                      <Typography variant='caption' color='text.secondary'>
                        Equipment: {category.equipment_count || 0}
                      </Typography>
                    </CardContent>

                    <Box display='flex' gap={1} p={2} pt={0}>
                      <Tooltip title={category.is_featured ? 'Remove from featured' : 'Mark as featured'}>
                        <IconButton size='small' color={category.is_featured ? 'primary' : 'default'} onClick={() => handleToggleFeatured(category)}>
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
        <DialogTitle>{editMode ? 'Edit Sub-Category' : 'Create Sub-Category'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity='error' onClose={() => setError('')} className='mbe-4'>
              {error}
            </Alert>
          )}

          <Box display='flex' flexDirection='column' gap={3} mt={2}>
            <TextField
              fullWidth
              required
              select
              label='Major Category'
              value={formData.major_category}
              onChange={handleChange('major_category')}
              helperText='Which major category does this sub-category belong to?'
            >
              <MenuItem value=''>Select Major Category</MenuItem>
              {MAJOR_CATEGORIES.map(cat => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              autoFocus
              fullWidth
              required
              label='Sub-Category Name'
              value={formData.name}
              onChange={handleChange('name')}
              placeholder='e.g., Excavators, Laptops, Soccer Equipment'
            />

            <TextField
              fullWidth
              label='Description'
              value={formData.description}
              onChange={handleChange('description')}
              multiline
              rows={3}
              placeholder='Brief description of this sub-category'
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
                {recommendedColors.map(item => (
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
                Icon
              </Typography>
              <Button variant='outlined' component='label' fullWidth sx={{ mb: 1 }}>
                <i className='ri-upload-2-line' style={{ marginRight: 8 }} />
                Upload Icon
                <input type='file' hidden accept='image/*' onChange={handleIconChange} />
              </Button>
              {iconPreview && (
                <Box sx={{ mt: 1, p: 2, border: '1px solid #ddd', borderRadius: 1, textAlign: 'center' }}>
                  <img src={iconPreview} alt='Icon preview' style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }} />
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
                <Box sx={{ mt: 1, p: 2, border: '1px solid #ddd', borderRadius: 1, textAlign: 'center' }}>
                  <img src={promotionalImagePreview} alt='Promotional preview' style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: 4 }} />
                </Box>
              )}
            </Box>

            <FormControlLabel
              control={<Switch checked={formData.is_featured} onChange={handleChange('is_featured')} />}
              label='Featured Sub-Category'
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

export default SubCategoriesPage
