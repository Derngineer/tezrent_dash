'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'

// Component Imports
import Illustrations from '@components/Illustrations'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

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

const Register = ({ mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    country: 'UAE',
    company_name: '',
    business_type: '',
    company_address: '',
    city: 'DXB',
    tax_number: '',
    company_phone: ''
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Vars
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  // Hooks
  const router = useRouter()
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show)

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value })
    setError('') // Clear error on input change
  }

  const handleCountryChange = (event) => {
    const country = event.target.value
    // Set default city based on country
    const defaultCity = country === 'UAE' ? 'DXB' : 'TAS'
    setFormData({ ...formData, country, city: defaultCity })
    setError('')
  }

  // Get city choices based on selected country
  const getCityChoices = () => {
    return formData.country === 'UAE' ? UAE_CITY_CHOICES : UZB_CITY_CHOICES
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // STEP 1: VALIDATION - Check if all required fields are filled
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields')
      return
    }

    if (!agreedToTerms) {
      setError('Please agree to the privacy policy and terms')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      setError('')

      // STEP 2: API CALL - THIS IS WHERE THE ENDPOINT IS CALLED
      // authAPI.register() is imported from '@/services/api' (line 31 above)
      // It sends a POST request to: http://localhost:8000/api/accounts/register/company/
      // Backend expects: { email, username, password, confirm_password, first_name, last_name, phone_number, profile: {...} }
      
      // Prepare data for backend matching the exact structure
      const registrationData = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        country: formData.country,
        profile: {
          company_name: formData.company_name,
          business_type: formData.business_type,
          company_address: formData.company_address,
          city: formData.city,
          tax_number: formData.tax_number,
          company_phone: formData.company_phone
        }
      }

      console.log('=== REGISTRATION DATA BEING SENT ===')
      console.log(JSON.stringify(registrationData, null, 2))
      console.log('====================================')

      const response = await authAPI.register(registrationData)

      // STEP 3: SUCCESS - Show success message
      setSuccess(true)
      
      // STEP 4: REDIRECT - Send user to login page after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (err) {
      // STEP 5: ERROR HANDLING - Show error if registration fails
      console.error('Registration failed:', err)
      console.error('Error response data:', err.response?.data)
      console.error('Error response status:', err.response?.status)
      
      // Handle validation errors from backend
      if (err.response?.data) {
        const errorData = err.response.data
        console.log('Backend error details:', JSON.stringify(errorData, null, 2))
        
        // Try to extract error message from various possible formats
        let errorMessage = 'Registration failed. Please try again.'
        
        if (typeof errorData === 'string') {
          errorMessage = errorData
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else if (errorData.detail) {
          errorMessage = errorData.detail
        } else {
          // Check for field-specific errors
          const fieldErrors = []
          Object.keys(errorData).forEach(key => {
            if (Array.isArray(errorData[key])) {
              fieldErrors.push(`${key}: ${errorData[key].join(', ')}`)
            } else if (typeof errorData[key] === 'object') {
              Object.keys(errorData[key]).forEach(nestedKey => {
                fieldErrors.push(`${key}.${nestedKey}: ${errorData[key][nestedKey]}`)
              })
            } else {
              fieldErrors.push(`${key}: ${errorData[key]}`)
            }
          })
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('\n')
          }
        }
        
        setError(errorMessage)
      } else {
        setError(err.message || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-start mbe-6'>
            <Logo />
          </Link>
          <Typography variant='h4'>Adventure starts here 🚀</Typography>
          <div className='flex flex-col gap-5'>
            <Typography className='mbs-1'>Make your app management easy and fun!</Typography>
            
            {/* Success Alert */}
            {success && (
              <Alert severity='success'>
                Registration successful! Redirecting to login...
              </Alert>
            )}
            
            {/* Error Alert */}
            {error && (
              <Alert severity='error' onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            
            <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
              <TextField 
                autoFocus 
                fullWidth 
                label='Username' 
                value={formData.username}
                onChange={handleChange('username')}
                disabled={loading}
                required
              />
              <TextField 
                fullWidth 
                label='Email' 
                type='email'
                value={formData.email}
                onChange={handleChange('email')}
                disabled={loading}
                required
              />
              
              {/* Personal Information */}
              <div className='grid grid-cols-2 gap-4'>
                <TextField 
                  fullWidth 
                  label='First Name' 
                  value={formData.first_name}
                  onChange={handleChange('first_name')}
                  disabled={loading}
                  required
                />
                <TextField 
                  fullWidth 
                  label='Last Name' 
                  value={formData.last_name}
                  onChange={handleChange('last_name')}
                  disabled={loading}
                  required
                />
              </div>
              
              <TextField 
                fullWidth 
                label='Phone Number' 
                placeholder='+971501234567'
                value={formData.phone_number}
                onChange={handleChange('phone_number')}
                disabled={loading}
                required
              />
              
              <TextField
                select
                fullWidth
                label='Country'
                value={formData.country}
                onChange={handleCountryChange}
                disabled={loading}
                required
              >
                {COUNTRY_CHOICES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              
              {/* Company Information */}
              <Divider>Company Information</Divider>
              
              <TextField 
                fullWidth 
                label='Company Name' 
                value={formData.company_name}
                onChange={handleChange('company_name')}
                disabled={loading}
                required
              />
              
              <TextField 
                fullWidth 
                label='Business Type' 
                placeholder='Equipment Rental'
                value={formData.business_type}
                onChange={handleChange('business_type')}
                disabled={loading}
                required
              />
              
              <TextField 
                fullWidth 
                label='Company Address' 
                value={formData.company_address}
                onChange={handleChange('company_address')}
                disabled={loading}
                required
              />
              
              <div className='grid grid-cols-2 gap-4'>
                <TextField
                  select
                  fullWidth 
                  label='City' 
                  value={formData.city}
                  onChange={handleChange('city')}
                  disabled={loading}
                  required
                >
                  {getCityChoices().map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField 
                  fullWidth 
                  label='Tax Number' 
                  value={formData.tax_number}
                  onChange={handleChange('tax_number')}
                  disabled={loading}
                  required
                />
              </div>
              
              <TextField 
                fullWidth 
                label='Company Phone' 
                placeholder='+971501234567'
                value={formData.company_phone}
                onChange={handleChange('company_phone')}
                disabled={loading}
                required
              />
              
              {/* Password Fields */}
              <Divider>Security</Divider>
              
              <TextField
                fullWidth
                label='Password'
                type={isPasswordShown ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange('password')}
                disabled={loading}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                        disabled={loading}
                      >
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                fullWidth
                label='Confirm Password'
                type={isConfirmPasswordShown ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                disabled={loading}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={e => e.preventDefault()}
                        disabled={loading}
                      >
                        <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    disabled={loading}
                  />
                }
                label={
                  <>
                    <span>I agree to </span>
                    <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
                      privacy policy & terms
                    </Link>
                  </>
                }
              />
              <Button 
                fullWidth 
                variant='contained' 
                type='submit'
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Signing Up...' : 'Sign Up'}
              </Button>
              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>Already have an account?</Typography>
                <Typography component={Link} href='/login' color='primary'>
                  Sign in instead
                </Typography>
              </div>
              <Divider className='gap-3'>Or</Divider>
              <div className='flex justify-center items-center gap-2'>
                <IconButton size='small' className='text-facebook'>
                  <i className='ri-facebook-fill' />
                </IconButton>
                <IconButton size='small' className='text-twitter'>
                  <i className='ri-twitter-fill' />
                </IconButton>
                <IconButton size='small' className='text-github'>
                  <i className='ri-github-fill' />
                </IconButton>
                <IconButton size='small' className='text-googlePlus'>
                  <i className='ri-google-fill' />
                </IconButton>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  )
}

export default Register
