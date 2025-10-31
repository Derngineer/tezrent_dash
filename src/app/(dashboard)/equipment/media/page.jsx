'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'

// API Imports
import { equipmentAPI } from '@/services/api'

const MediaHubPage = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    categories: 0,
    banners: 0,
    activeBanners: 0,
    tags: 0,
    equipment: 0
  })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Fetch counts from all endpoints
      const [categories, banners, tags] = await Promise.all([
        equipmentAPI.getCategories().catch(() => ({ data: [] })),
        equipmentAPI.getBanners().catch(() => ({ data: [] })),
        equipmentAPI.getTags().catch(() => ({ data: [] }))
      ])

      const categoriesData = categories.data || categories.results || categories || []
      const bannersData = banners.data || banners.results || banners || []
      const tagsData = tags.data || tags.results || tags || []

      setStats({
        categories: categoriesData.length,
        banners: bannersData.length,
        activeBanners: bannersData.filter(b => b.is_active || b.is_currently_active).length,
        tags: tagsData.length
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError('Failed to load media statistics')
    } finally {
      setLoading(false)
    }
  }

  const mediaCards = [
    {
      title: 'Categories',
      description: 'Organize equipment into categories with custom colors and icons',
      icon: 'ri-folder-line',
      color: '#FF6B35',
      count: stats.categories,
      route: '/equipment/categories',
      features: ['Custom colors', 'Icon upload', 'Featured flag', 'Display order']
    },
    {
      title: 'Banners',
      description: 'Create promotional banners for homepage and category pages',
      icon: 'ri-image-2-line',
      color: '#4ECDC4',
      count: stats.banners,
      badge: `${stats.activeBanners} active`,
      route: '/equipment/banners',
      features: ['Image upload', 'CTA buttons', 'Date scheduling', 'Multiple positions']
    },
    {
      title: 'Tags',
      description: 'Custom tags for equipment filtering and search optimization',
      icon: 'ri-price-tag-3-line',
      color: '#95E1D3',
      count: stats.tags,
      route: '/equipment/tags',
      features: ['Quick create', 'Bulk management', 'Search filtering', 'Auto-suggest']
    }
  ]

  return (
    <div>
      <Grid container spacing={6}>
        {/* Header */}
        <Grid item xs={12}>
          <Box display='flex' justifyContent='space-between' alignItems='center'>
            <div>
              <Typography variant='h4' gutterBottom>
                Media Hub
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Manage categories, promotional banners, and equipment tags
              </Typography>
            </div>
          </Box>
        </Grid>

        {/* Error Alert */}
        {error && (
          <Grid item xs={12}>
            <Alert severity='error' onClose={() => setError('')}>
              {error}
            </Alert>
          </Grid>
        )}

        {/* Quick Stats Cards */}
        {loading ? (
          <Grid item xs={12}>
            <Box display='flex' justifyContent='center' alignItems='center' minHeight='200px'>
              <CircularProgress />
            </Box>
          </Grid>
        ) : (
          mediaCards.map((card, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  borderLeft: 4,
                  borderLeftColor: card.color,
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => router.push(card.route)}
              >
                <CardContent>
                  <Box display='flex' alignItems='start' justifyContent='space-between' mb={2}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        backgroundColor: `${card.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <i className={card.icon} style={{ fontSize: 28, color: card.color }} />
                    </Box>
                    <Box textAlign='right'>
                      <Typography variant='h3' color={card.color}>
                        {card.count}
                      </Typography>
                      {card.badge && (
                        <Chip label={card.badge} size='small' color='success' sx={{ mt: 1 }} />
                      )}
                    </Box>
                  </Box>

                  <Typography variant='h6' gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' paragraph>
                    {card.description}
                  </Typography>

                  <Box display='flex' gap={1} flexWrap='wrap' mb={2}>
                    {card.features.map((feature, idx) => (
                      <Chip
                        key={idx}
                        label={feature}
                        size='small'
                        variant='outlined'
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>

                  <Button
                    variant='contained'
                    fullWidth
                    sx={{ backgroundColor: card.color, '&:hover': { backgroundColor: card.color } }}
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(card.route)
                    }}
                  >
                    Manage {card.title}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Quick Actions' />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant='outlined'
                    startIcon={<i className='ri-folder-add-line' />}
                    onClick={() => router.push('/equipment/categories')}
                  >
                    Add Category
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant='outlined'
                    startIcon={<i className='ri-image-add-line' />}
                    onClick={() => router.push('/equipment/banners')}
                  >
                    Create Banner
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant='outlined'
                    startIcon={<i className='ri-price-tag-3-line' />}
                    onClick={() => router.push('/equipment/tags')}
                  >
                    Add Tag
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant='outlined'
                    startIcon={<i className='ri-tools-line' />}
                    onClick={() => router.push('/equipment/add')}
                  >
                    Add Equipment
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Best Practices */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title='📚 Best Practices' />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant='h6' gutterBottom color='primary'>
                      <i className='ri-folder-line' style={{ marginRight: 8 }} />
                      Categories
                    </Typography>
                    <Typography variant='body2' color='text.secondary' component='div'>
                      <ul style={{ paddingLeft: 20, margin: 0 }}>
                        <li>Use clear, descriptive names</li>
                        <li>Upload 64x64px icons</li>
                        <li>Choose distinct colors</li>
                        <li>Mark popular ones as featured</li>
                        <li>Set display order for sorting</li>
                      </ul>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant='h6' gutterBottom color='primary'>
                      <i className='ri-image-2-line' style={{ marginRight: 8 }} />
                      Banners
                    </Typography>
                    <Typography variant='body2' color='text.secondary' component='div'>
                      <ul style={{ paddingLeft: 20, margin: 0 }}>
                        <li>Use 1920x600px for desktop</li>
                        <li>Add compelling CTA text</li>
                        <li>Set start/end dates for deals</li>
                        <li>Link to relevant categories</li>
                        <li>Test on mobile devices</li>
                      </ul>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant='h6' gutterBottom color='primary'>
                      <i className='ri-price-tag-3-line' style={{ marginRight: 8 }} />
                      Tags
                    </Typography>
                    <Typography variant='body2' color='text.secondary' component='div'>
                      <ul style={{ paddingLeft: 20, margin: 0 }}>
                        <li>Keep tags short and lowercase</li>
                        <li>Use descriptive terms</li>
                        <li>Avoid duplicates</li>
                        <li>Think about search terms</li>
                        <li>Review and clean up regularly</li>
                      </ul>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}

export default MediaHubPage
