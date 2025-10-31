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
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import InputAdornment from '@mui/material/InputAdornment'

// API Imports
import { equipmentAPI } from '@/services/api'

const TagsPage = () => {
  // States
  const [tags, setTags] = useState([])
  const [filteredTags, setFilteredTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentTag, setCurrentTag] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [tagName, setTagName] = useState('')

  // Fetch tags
  useEffect(() => {
    fetchTags()
  }, [])

  // Filter tags based on search
  useEffect(() => {
    if (searchQuery) {
      setFilteredTags(
        tags.filter(tag =>
          tag.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    } else {
      setFilteredTags(tags)
    }
  }, [searchQuery, tags])

  const fetchTags = async () => {
    try {
      setLoading(true)
      const response = await equipmentAPI.getTags()
      const tagData = response.data || response.results || response
      setTags(tagData)
      setFilteredTags(tagData)
    } catch (err) {
      console.error('Error fetching tags:', err)
      setError('Failed to load tags')
    } finally {
      setLoading(false)
    }
  }

  // Open dialog for create
  const handleOpenCreate = () => {
    setEditMode(false)
    setCurrentTag(null)
    setTagName('')
    setOpenDialog(true)
  }

  // Open dialog for edit
  const handleOpenEdit = (tag) => {
    setEditMode(true)
    setCurrentTag(tag)
    setTagName(tag.name)
    setOpenDialog(true)
  }

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setError('')
    setTagName('')
  }

  // Handle submit
  const handleSubmit = async () => {
    try {
      if (!tagName.trim()) {
        setError('Tag name is required')
        return
      }

      setLoading(true)
      setError('')

      if (editMode && currentTag) {
        await equipmentAPI.updateTag(currentTag.id, { name: tagName.trim() })
        setSuccess('Tag updated successfully!')
      } else {
        await equipmentAPI.createTag({ name: tagName.trim() })
        setSuccess('Tag created successfully!')
      }

      await fetchTags()
      setOpenDialog(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error saving tag:', err)
      const errorMsg = err.response?.data?.name?.[0] || err.response?.data?.message || 'Failed to save tag'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async (id, name) => {
    console.log('Delete clicked for tag:', id, name)
    
    if (!confirm(`Are you sure you want to delete the tag "${name}"? This will remove it from all equipment.`)) {
      console.log('Delete cancelled by user')
      return
    }

    try {
      console.log('Attempting to delete tag:', id)
      setLoading(true)
      setError('')
      const result = await equipmentAPI.deleteTag(id)
      console.log('Delete result:', result)
      setSuccess('Tag deleted successfully!')
      await fetchTags()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error deleting tag:', err)
      console.error('Error response:', err.response?.data)
      
      // Extract error message from various possible response formats
      let errorMsg = 'Failed to delete tag'
      if (err.response?.data) {
        const data = err.response.data
        errorMsg = data.error || data.detail || data.message || data.non_field_errors?.[0] || errorMsg
      }
      
      setError(errorMsg)
      setTimeout(() => setError(''), 5000) // Increased to 5 seconds for longer messages
    } finally {
      setLoading(false)
    }
  }

  // Quick create from search
  const handleQuickCreate = async () => {
    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      await equipmentAPI.createTag({ name: searchQuery.trim() })
      setSuccess(`Tag "${searchQuery}" created!`)
      setSearchQuery('')
      await fetchTags()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.name?.[0] || 'Failed to create tag')
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
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

      {/* Tags List */}
      <Card>
        <CardHeader
          title='Equipment Tags'
          subheader='Manage custom tags for equipment (e.g., "heavy duty", "eco-friendly", "GPS equipped")'
          action={
            <Button
              variant='contained'
              startIcon={<i className='ri-add-line' />}
              onClick={handleOpenCreate}
            >
              Add Tag
            </Button>
          }
        />
        <CardContent>
          {/* Search/Filter */}
          <Box mb={4}>
            <TextField
              fullWidth
              placeholder='Search tags or type to create new...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='ri-search-line' />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && filteredTags.length === 0 && (
                  <InputAdornment position='end'>
                    <Button size='small' variant='contained' onClick={handleQuickCreate}>
                      Create "{searchQuery}"
                    </Button>
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {loading && tags.length === 0 ? (
            <Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
              <CircularProgress />
            </Box>
          ) : filteredTags.length === 0 && !searchQuery ? (
            <Box textAlign='center' py={4}>
              <i className='ri-price-tag-3-line' style={{ fontSize: 64, opacity: 0.3 }} />
              <Typography variant='h6' color='text.secondary' gutterBottom sx={{ mt: 2 }}>
                No tags yet
              </Typography>
              <Typography variant='body2' color='text.secondary' paragraph>
                Create custom tags to organize your equipment
              </Typography>
              <Button variant='contained' onClick={handleOpenCreate} startIcon={<i className='ri-add-line' />}>
                Create Tag
              </Button>
            </Box>
          ) : filteredTags.length === 0 && searchQuery ? (
            <Box textAlign='center' py={4}>
              <Typography variant='body2' color='text.secondary' paragraph>
                No tags found matching "{searchQuery}"
              </Typography>
              <Button variant='contained' onClick={handleQuickCreate} startIcon={<i className='ri-add-line' />}>
                Create "{searchQuery}"
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                {filteredTags.length} tag{filteredTags.length !== 1 ? 's' : ''}
                {searchQuery && ` matching "${searchQuery}"`}
              </Typography>
              <Box display='flex' gap={1} flexWrap='wrap' mt={2}>
                {filteredTags.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    size='medium'
                    onDelete={() => handleDelete(tag.id, tag.name)}
                    onClick={() => handleOpenEdit(tag)}
                    sx={{ fontSize: '0.875rem', py: 2.5 }}
                    deleteIcon={
                      <Tooltip title='Delete'>
                        <i className='ri-close-line' />
                      </Tooltip>
                    }
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Quick Stats */}
          {tags.length > 0 && (
            <Box mt={4} p={2} bgcolor='grey.50' borderRadius={1}>
              <Typography variant='caption' color='text.secondary'>
                💡 Tip: Click on a tag to edit it, or use the delete icon to remove it. Tags help customers find equipment faster.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth='sm' fullWidth>
        <DialogTitle>{editMode ? 'Edit Tag' : 'Create New Tag'}</DialogTitle>
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
              label='Tag Name'
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              required
              placeholder='e.g., heavy duty, eco-friendly, GPS equipped'
              helperText='Use lowercase, spaces allowed. Keep it short and descriptive.'
            />

            <Box p={2} bgcolor='grey.50' borderRadius={1}>
              <Typography variant='caption' color='text.secondary'>
                <strong>Examples of good tags:</strong>
                <br />
                • heavy duty
                <br />
                • eco-friendly
                <br />
                • GPS equipped
                <br />
                • recently serviced
                <br />
                • new arrival
                <br />• certified operator required
              </Typography>
            </Box>
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

export default TagsPage
