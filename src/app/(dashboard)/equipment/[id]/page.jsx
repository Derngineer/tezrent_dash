'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// API Imports
import { equipmentAPI } from '@/services/api'

const EquipmentDetail = ({ params }) => {
  const router = useRouter()
  const [equipment, setEquipment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (params?.id) {
      loadEquipment()
    }
  }, [params?.id])

  const loadEquipment = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await equipmentAPI.getEquipment(params.id)
      console.log('Equipment data:', data)
      console.log('Equipment images:', data.images)
      setEquipment(data)
    } catch (err) {
      console.error('Failed to load equipment:', err)
      setError(err.response?.data?.detail || 'Failed to load equipment details')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await equipmentAPI.deleteEquipment(params.id)
      router.push('/equipment')
    } catch (err) {
      console.error('Failed to delete equipment:', err)
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to delete equipment')
      setDeleteDialogOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  const getCityName = (cityCode) => {
    const cities = {
      DXB: 'Dubai',
      AUH: 'Abu Dhabi',
      SHJ: 'Sharjah',
      AJM: 'Ajman',
      RAK: 'Ras Al Khaimah',
      FUJ: 'Fujairah',
      UAQ: 'Umm Al Quwain',
      TAS: 'Tashkent',
      SAM: 'Samarkand',
      NAM: 'Namangan',
      AND: 'Andijan'
    }
    return cities[cityCode] || cityCode
  }

  const getCountryName = (countryCode) => {
    const countries = {
      UAE: 'United Arab Emirates',
      UZB: 'Uzbekistan'
    }
    return countries[countryCode] || countryCode
  }

  const getStatusColor = (status) => {
    const colors = {
      available: 'success',
      rented: 'warning',
      maintenance: 'error',
      unavailable: 'default'
    }
    return colors[status] || 'default'
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='60vh'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <Alert severity='error' sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Button variant='outlined' onClick={() => router.push('/equipment')}>
          Back to Equipment List
        </Button>
      </Box>
    )
  }

  if (!equipment) {
    return (
      <Box>
        <Alert severity='warning' sx={{ mb: 4 }}>
          Equipment not found
        </Alert>
        <Button variant='outlined' onClick={() => router.push('/equipment')}>
          Back to Equipment List
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
        <Box>
          <Box display='flex' alignItems='center' gap={2} mb={1}>
            <IconButton onClick={() => router.push('/equipment')} size='small'>
              <i className='ri-arrow-left-line' />
            </IconButton>
            <Typography variant='h4'>{equipment.name}</Typography>
            {equipment.featured && (
              <Chip label='Featured' color='primary' size='small' icon={<i className='ri-star-fill' />} />
            )}
          </Box>
          <Typography variant='body2' color='text.secondary'>
            Equipment ID: #{equipment.id}
          </Typography>
        </Box>
        <Box display='flex' gap={2}>
          <Button
            variant='outlined'
            startIcon={<i className='ri-edit-line' />}
            onClick={() => router.push(`/equipment/edit/${equipment.id}`)}
          >
            Edit
          </Button>
          <Button
            variant='outlined'
            color='error'
            startIcon={<i className='ri-delete-bin-line' />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Grid container spacing={6}>
        {/* Images Section */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Images
              </Typography>
              {/* Always show primary image container */}
              <Box
                sx={{
                  width: '100%',
                  height: 400,
                  borderRadius: 2,
                  overflow: 'hidden',
                  cursor: equipment.images && equipment.images.length > 0 ? 'pointer' : 'default',
                  mb: 2,
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => equipment.images && equipment.images.length > 0 && setImageDialogOpen(true)}
              >
                {equipment.images && equipment.images.length > 0 && equipment.images[selectedImage]?.image_url ? (
                  <img
                    src={equipment.images[selectedImage].image_url}
                    alt={equipment.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', equipment.images[selectedImage].image_url)
                      e.target.style.display = 'none'
                      e.target.parentElement.innerHTML = `
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #999;">
                          <i class="ri-image-line" style="font-size: 64px; opacity: 0.3;"></i>
                          <p style="margin-top: 16px; font-size: 14px;">Image failed to load</p>
                        </div>
                      `
                    }}
                  />
                ) : (
                  <Box
                    display='flex'
                    flexDirection='column'
                    alignItems='center'
                    justifyContent='center'
                  >
                    <i className='ri-image-line' style={{ fontSize: 64, opacity: 0.3 }} />
                    <Typography variant='body2' color='text.secondary' mt={2}>
                      No primary image
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Thumbnail Images - Only show if multiple images exist */}
              {equipment.images && equipment.images.length > 1 && (
                <Box display='flex' gap={2} flexWrap='wrap'>
                  {equipment.images.map((img, index) => (
                    img.image_url && (
                      <Box
                        key={img.id || index}
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 1,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: selectedImage === index ? '2px solid' : '2px solid transparent',
                          borderColor: selectedImage === index ? 'primary.main' : 'transparent',
                          opacity: selectedImage === index ? 1 : 0.6,
                          transition: 'all 0.2s',
                          '&:hover': {
                            opacity: 1
                          },
                          bgcolor: 'grey.100'
                        }}
                        onClick={() => setSelectedImage(index)}
                      >
                        <img
                          src={img.image_url}
                          alt={`${equipment.name} ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            console.error('Thumbnail failed to load:', img.image_url)
                            e.target.style.display = 'none'
                          }}
                        />
                      </Box>
                    )
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Description
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ whiteSpace: 'pre-line' }}>
                {equipment.description || 'No description provided'}
              </Typography>
            </CardContent>
          </Card>

          {/* Specifications */}
          {equipment.specifications_data && equipment.specifications_data.length > 0 && (
            <Card sx={{ mt: 4 }}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Specifications
                </Typography>
                <Table>
                  <TableBody>
                    {equipment.specifications_data.map((spec, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontWeight: 500, width: '40%' }}>{spec.name}</TableCell>
                        <TableCell>{spec.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Details Section */}
        <Grid item xs={12} md={5}>
          {/* Pricing */}
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Pricing
              </Typography>
              <Box display='flex' flexDirection='column' gap={2}>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Daily Rate
                  </Typography>
                  <Typography variant='h5' color='primary'>
                    ${equipment.daily_rate}
                    <Typography component='span' variant='body2' color='text.secondary'>
                      /day
                    </Typography>
                  </Typography>
                </Box>
                {equipment.weekly_rate && (
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Weekly Rate
                    </Typography>
                    <Typography variant='h6'>
                      ${equipment.weekly_rate}
                      <Typography component='span' variant='body2' color='text.secondary'>
                        /week
                      </Typography>
                    </Typography>
                  </Box>
                )}
                {equipment.monthly_rate && (
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Monthly Rate
                    </Typography>
                    <Typography variant='h6'>
                      ${equipment.monthly_rate}
                      <Typography component='span' variant='body2' color='text.secondary'>
                        /month
                      </Typography>
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Status & Availability */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Status & Availability
              </Typography>
              <Box display='flex' flexDirection='column' gap={2}>
                <Box display='flex' justifyContent='space-between' alignItems='center'>
                  <Typography variant='body2' color='text.secondary'>
                    Status
                  </Typography>
                  <Chip
                    label={equipment.status?.toUpperCase() || 'UNKNOWN'}
                    color={getStatusColor(equipment.status)}
                    size='small'
                  />
                </Box>
                <Divider />
                <Box display='flex' justifyContent='space-between' alignItems='center'>
                  <Typography variant='body2' color='text.secondary'>
                    Total Units
                  </Typography>
                  <Typography variant='body2' fontWeight={500}>
                    {equipment.total_units || 0}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between' alignItems='center'>
                  <Typography variant='body2' color='text.secondary'>
                    Available Units
                  </Typography>
                  <Typography variant='body2' fontWeight={500} color='success.main'>
                    {equipment.available_units || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Equipment Details */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Equipment Details
              </Typography>
              <Box display='flex' flexDirection='column' gap={2}>
                {equipment.manufacturer && (
                  <Box display='flex' justifyContent='space-between'>
                    <Typography variant='body2' color='text.secondary'>
                      Manufacturer
                    </Typography>
                    <Typography variant='body2' fontWeight={500}>
                      {equipment.manufacturer}
                    </Typography>
                  </Box>
                )}
                {equipment.model_number && (
                  <Box display='flex' justifyContent='space-between'>
                    <Typography variant='body2' color='text.secondary'>
                      Model Number
                    </Typography>
                    <Typography variant='body2' fontWeight={500}>
                      {equipment.model_number}
                    </Typography>
                  </Box>
                )}
                {equipment.year && (
                  <Box display='flex' justifyContent='space-between'>
                    <Typography variant='body2' color='text.secondary'>
                      Year
                    </Typography>
                    <Typography variant='body2' fontWeight={500}>
                      {equipment.year}
                    </Typography>
                  </Box>
                )}
                {equipment.weight && (
                  <Box display='flex' justifyContent='space-between'>
                    <Typography variant='body2' color='text.secondary'>
                      Weight
                    </Typography>
                    <Typography variant='body2' fontWeight={500}>
                      {equipment.weight}
                    </Typography>
                  </Box>
                )}
                {equipment.dimensions && (
                  <Box display='flex' justifyContent='space-between'>
                    <Typography variant='body2' color='text.secondary'>
                      Dimensions
                    </Typography>
                    <Typography variant='body2' fontWeight={500}>
                      {equipment.dimensions}
                    </Typography>
                  </Box>
                )}
                {equipment.fuel_type && (
                  <Box display='flex' justifyContent='space-between'>
                    <Typography variant='body2' color='text.secondary'>
                      Fuel Type
                    </Typography>
                    <Typography variant='body2' fontWeight={500}>
                      {equipment.fuel_type}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Location */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Location
              </Typography>
              <Box display='flex' flexDirection='column' gap={2}>
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='body2' color='text.secondary'>
                    Country
                  </Typography>
                  <Typography variant='body2' fontWeight={500}>
                    {getCountryName(equipment.country)}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='body2' color='text.secondary'>
                    City
                  </Typography>
                  <Typography variant='body2' fontWeight={500}>
                    {getCityName(equipment.city)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Category & Tags */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Category & Tags
              </Typography>
              <Box display='flex' flexDirection='column' gap={2}>
                <Box>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Category
                  </Typography>
                  {equipment.category ? (
                    <Chip
                      label={equipment.category.name}
                      color='primary'
                      variant='outlined'
                      size='small'
                    />
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      No category
                    </Typography>
                  )}
                </Box>
                {equipment.tag_names && equipment.tag_names.length > 0 && (
                  <Box>
                    <Typography variant='body2' color='text.secondary' gutterBottom>
                      Tags
                    </Typography>
                    <Box display='flex' gap={1} flexWrap='wrap'>
                      {equipment.tag_names.map((tag, index) => (
                        <Chip key={index} label={tag} size='small' />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Operating Manual */}
          {equipment.operating_manual && (
            <Card sx={{ mt: 4 }}>
              <CardContent>
                <Box display='flex' alignItems='center' gap={2} mb={2}>
                  <i className='ri-book-line' style={{ fontSize: 24, color: 'var(--mui-palette-primary-main)' }} />
                  <Typography variant='h6'>
                    Operating Manual
                  </Typography>
                </Box>
                
                {equipment.manual_description && (
                  <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                    {equipment.manual_description}
                  </Typography>
                )}

                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                    backgroundColor: 'primary.lighter',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box display='flex' alignItems='center' gap={2}>
                    <i className='ri-file-pdf-line' style={{ fontSize: 32, color: 'var(--mui-palette-primary-main)' }} />
                    <Box>
                      <Typography variant='body2' fontWeight={600}>
                        Equipment Manual (PDF)
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Available to customers after booking
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant='contained'
                    size='small'
                    startIcon={<i className='ri-download-2-line' />}
                    href={equipment.operating_manual}
                    target='_blank'
                    download
                  >
                    Download
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Owner Information */}
          {equipment.owner && (
            <Card sx={{ mt: 4 }}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Owner Information
                </Typography>
                <Box display='flex' flexDirection='column' gap={2}>
                  {equipment.owner.first_name && (
                    <Box display='flex' justifyContent='space-between'>
                      <Typography variant='body2' color='text.secondary'>
                        Name
                      </Typography>
                      <Typography variant='body2' fontWeight={500}>
                        {equipment.owner.first_name} {equipment.owner.last_name}
                      </Typography>
                    </Box>
                  )}
                  {equipment.owner.email && (
                    <Box display='flex' justifyContent='space-between'>
                      <Typography variant='body2' color='text.secondary'>
                        Email
                      </Typography>
                      <Typography variant='body2' fontWeight={500}>
                        {equipment.owner.email}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Additional Information
              </Typography>
              <Box display='flex' flexDirection='column' gap={2}>
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='body2' color='text.secondary'>
                    Created
                  </Typography>
                  <Typography variant='body2'>
                    {new Date(equipment.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='body2' color='text.secondary'>
                    Last Updated
                  </Typography>
                  <Typography variant='body2'>
                    {new Date(equipment.updated_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} maxWidth='lg' fullWidth>
        <DialogTitle>
          <Box display='flex' justifyContent='space-between' alignItems='center'>
            <Typography variant='h6'>
              {equipment.name} - Image {selectedImage + 1} of {equipment.images?.length || 0}
            </Typography>
            <IconButton onClick={() => setImageDialogOpen(false)}>
              <i className='ri-close-line' />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              width: '100%',
              height: '70vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'black'
            }}
          >
            {equipment.images && equipment.images[selectedImage]?.image_url ? (
              <img
                src={equipment.images[selectedImage].image_url}
                alt={equipment.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  console.error('Full-size image failed to load:', equipment.images[selectedImage].image_url)
                  e.target.style.display = 'none'
                }}
              />
            ) : (
              <Box display='flex' flexDirection='column' alignItems='center' color='white'>
                <i className='ri-image-line' style={{ fontSize: 64 }} />
                <Typography variant='body2' mt={2}>
                  Image not available
                </Typography>
              </Box>
            )}
          </Box>
          {equipment.images && equipment.images.length > 1 && (
            <Box display='flex' justifyContent='center' gap={2} mt={2}>
              <Button
                variant='outlined'
                disabled={selectedImage === 0}
                onClick={() => setSelectedImage(prev => prev - 1)}
                startIcon={<i className='ri-arrow-left-line' />}
              >
                Previous
              </Button>
              <Button
                variant='outlined'
                disabled={selectedImage === equipment.images.length - 1}
                onClick={() => setSelectedImage(prev => prev + 1)}
                endIcon={<i className='ri-arrow-right-line' />}
              >
                Next
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Equipment?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{equipment.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color='error' variant='contained' disabled={deleting}>
            {deleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EquipmentDetail
