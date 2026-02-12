'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'

// API Imports
import { authAPI } from '@/services/api'

// Country and City choices matching backend
const COUNTRY_CHOICES = [
  { value: 'UAE', label: 'United Arab Emirates' },
  { value: 'UZB', label: 'Uzbekistan' }
]

const UAE_CITY_CHOICES = [
  { value: 'AUH', label: 'Abu Dhabi' },
  { value: 'DXB', label: 'Dubai' },
  { value: 'SHJ', label: 'Sharjah' },
  { value: 'AJM', label: 'Ajman' },
  { value: 'UAQ', label: 'Umm Al Quwain' },
  { value: 'FUJ', label: 'Fujairah' },
  { value: 'RAK', label: 'Ras Al Khaimah' }
]

const UZB_CITY_CHOICES = [
  { value: 'TAS', label: 'Tashkent' },
  { value: 'SAM', label: 'Samarkand' },
  { value: 'NAM', label: 'Namangan' },
  { value: 'AND', label: 'Andijan' }
]

const AccountDetails = () => {
  // States
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // User fields
  const [userData, setUserData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    country: 'UAE'
  })

  // Company fields
  const [companyData, setCompanyData] = useState({
    company_name: '',
    business_type: '',
    company_address: '',
    company_phone: '',
    city: 'DXB',
    tax_number: ''
  })

  // Form validation errors
  const [errors, setErrors] = useState({})

  // Get city choices based on country
  const getCityChoices = () => {
    return userData.country === 'UZB' ? UZB_CITY_CHOICES : UAE_CITY_CHOICES
  }

  // Load user profile on mount
  useEffect(() => {
    loadProfile()
  }, [])

  // Update city when country changes
  useEffect(() => {
    const cityChoices = userData.country === 'UZB' ? UZB_CITY_CHOICES : UAE_CITY_CHOICES
    const currentCityValid = cityChoices.some(c => c.value === companyData.city)

    if (!currentCityValid) {
      setCompanyData(prev => ({ ...prev, city: cityChoices[0].value }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData.country])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const profile = await authAPI.getProfile()

      console.log('Loaded profile:', profile)

      // Set user data
      setUserData({
        email: profile.email || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone_number: profile.phone_number || profile.profile?.phone_number || '',
        country: profile.country || profile.profile?.country || 'UAE'
      })

      // Set company data from profile
      setCompanyData({
        company_name: profile.company_name || profile.profile?.company_name || '',
        business_type: profile.business_type || profile.profile?.business_type || '',
        company_address: profile.company_address || profile.profile?.company_address || '',
        company_phone: profile.company_phone || profile.profile?.company_phone || '',
        city: profile.city || profile.profile?.city || 'DXB',
        tax_number: profile.tax_number || profile.profile?.tax_number || ''
      })
    } catch (err) {
      console.error('Failed to load profile:', err)
      setError('Failed to load profile. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const handleUserChange = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
    setError('')
    setSuccess('')
  }

  const handleCompanyChange = (field, value) => {
    setCompanyData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
    setError('')
    setSuccess('')
  }

  const validateForm = () => {
    const newErrors = {}

    // User validations
    if (!userData.first_name.trim()) newErrors.first_name = 'First name is required'
    if (!userData.last_name.trim()) newErrors.last_name = 'Last name is required'
    if (!userData.phone_number.trim()) newErrors.phone_number = 'Phone number is required'

    // Company validations (required fields)
    if (!companyData.company_name.trim()) newErrors.company_name = 'Company name is required'
    if (!companyData.business_type.trim()) newErrors.business_type = 'Business type is required'
    if (!companyData.company_address.trim()) newErrors.company_address = 'Company address is required'
    if (!companyData.company_phone.trim()) newErrors.company_phone = 'Company phone is required'

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!validateForm()) {
      setError('Please fill in all required fields')

      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      // Combine user and company data for update
      const updateData = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone_number: userData.phone_number,
        country: userData.country,

        // Company fields - may be nested in profile based on backend
        company_name: companyData.company_name,
        business_type: companyData.business_type,
        company_address: companyData.company_address,
        company_phone: companyData.company_phone,
        city: companyData.city,
        tax_number: companyData.tax_number
      }

      await authAPI.updateProfile(updateData)
      setSuccess('Profile updated successfully!')
    } catch (err) {
      console.error('Failed to update profile:', err)

      if (err.response?.data) {
        const fieldErrors = {}

        Object.entries(err.response.data).forEach(([key, value]) => {
          fieldErrors[key] = Array.isArray(value) ? value[0] : value
        })
        setErrors(fieldErrors)
        setError('Please fix the errors below')
      } else {
        setError(err.message || 'Failed to update profile')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    loadProfile()
    setErrors({})
    setError('')
    setSuccess('')
  }

  if (loading) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center min-h-[400px]'>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* User Information Card */}
      <Card className='mbe-6'>
        <CardHeader title='User Information' subheader='Update your personal details' />
        <CardContent>
          {error && (
            <Alert severity='error' className='mbe-4'>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity='success' className='mbe-4'>
              {success}
            </Alert>
          )}

          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Email'
                value={userData.email}
                disabled
                helperText='Email cannot be changed'
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='First Name'
                value={userData.first_name}
                onChange={e => handleUserChange('first_name', e.target.value)}
                error={!!errors.first_name}
                helperText={errors.first_name}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Last Name'
                value={userData.last_name}
                onChange={e => handleUserChange('last_name', e.target.value)}
                error={!!errors.last_name}
                helperText={errors.last_name}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Phone Number'
                value={userData.phone_number}
                onChange={e => handleUserChange('phone_number', e.target.value)}
                placeholder='+971 50 123 4567'
                error={!!errors.phone_number}
                helperText={errors.phone_number}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  label='Country'
                  value={userData.country}
                  onChange={e => handleUserChange('country', e.target.value)}
                >
                  {COUNTRY_CHOICES.map(country => (
                    <MenuItem key={country.value} value={country.value}>
                      {country.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Company Information Card */}
      <Card>
        <CardHeader title='Company Information' subheader='Update your company details' />
        <CardContent>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Company Name'
                value={companyData.company_name}
                onChange={e => handleCompanyChange('company_name', e.target.value)}
                error={!!errors.company_name}
                helperText={errors.company_name || 'Required'}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Business Type'
                value={companyData.business_type}
                onChange={e => handleCompanyChange('business_type', e.target.value)}
                placeholder='e.g., Equipment Rental, Construction'
                error={!!errors.business_type}
                helperText={errors.business_type || 'Required'}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Company Address'
                value={companyData.company_address}
                onChange={e => handleCompanyChange('company_address', e.target.value)}
                placeholder='Full company address'
                error={!!errors.company_address}
                helperText={errors.company_address || 'Required'}
                required
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Company Phone'
                value={companyData.company_phone}
                onChange={e => handleCompanyChange('company_phone', e.target.value)}
                placeholder='+971 4 123 4567'
                error={!!errors.company_phone}
                helperText={errors.company_phone || 'Required'}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>City</InputLabel>
                <Select
                  label='City'
                  value={companyData.city}
                  onChange={e => handleCompanyChange('city', e.target.value)}
                >
                  {getCityChoices().map(city => (
                    <MenuItem key={city.value} value={city.value}>
                      {city.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Tax Number (TRN)'
                value={companyData.tax_number}
                onChange={e => handleCompanyChange('tax_number', e.target.value)}
                placeholder='Tax Registration Number (optional)'
                helperText='Optional'
              />
            </Grid>
          </Grid>

          <Divider className='mbs-6 mbe-6' />

          <Box className='flex gap-4'>
            <Button
              variant='contained'
              type='submit'
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} color='inherit' /> : null}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant='outlined' color='secondary' type='button' onClick={handleReset} disabled={saving}>
              Reset
            </Button>
          </Box>
        </CardContent>
      </Card>
    </form>
  )
}

export default AccountDetails
