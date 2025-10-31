'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import Form from '@components/Form'
import DirectionalIcon from '@components/DirectionalIcon'
import Illustrations from '@components/Illustrations'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// API Imports
import { authAPI } from '@/services/api'

const ResetPassword = ({ mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()

  // Vars
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  // Get token from URL on component mount
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token')
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
    } else {
      setError('Invalid or missing reset token. Please request a new password reset link.')
    }
  }, [searchParams])

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show)

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value })
    setError('') // Clear error on input change
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields')
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

    if (!token) {
      setError('Invalid reset token. Please request a new password reset link.')
      return
    }

    try {
      setLoading(true)
      setError('')

      // STEP 2: Confirm password reset with token
      // Calls: POST http://localhost:8000/api/accounts/password-reset-confirm/
      // Sends: { token: "...", password: "newpassword" }
      await authAPI.confirmPasswordReset(token, formData.password)

      // Show success message
      setSuccess(true)

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)

    } catch (err) {
      console.error('Password reset failed:', err)
      
      // Handle specific error messages
      if (err.response?.status === 400) {
        setError('Invalid or expired reset token. Please request a new password reset link.')
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to reset password. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <Typography variant='h4'>Reset Password 🔐</Typography>
          <div className='flex flex-col gap-5'>
            <Typography className='mbs-1'>
              Enter your new password below
            </Typography>

            {/* Success Message */}
            {success ? (
              <Alert severity='success' sx={{ mb: 2 }}>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  Password reset successful! ✓
                </Typography>
                <Typography variant='body2'>
                  Your password has been updated. Redirecting to login page...
                </Typography>
              </Alert>
            ) : (
              <>
                {/* Error Alert */}
                {error && (
                  <Alert severity='error' onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}

                <Form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
                  <TextField
                    autoFocus
                    fullWidth
                    label='New Password'
                    type={isPasswordShown ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange('password')}
                    disabled={loading || !token}
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
                    disabled={loading || !token}
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
                  <Button 
                    fullWidth 
                    variant='contained' 
                    type='submit'
                    disabled={loading || !token}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </Form>
              </>
            )}

            <Typography className='flex justify-center items-center' color='primary'>
              <Link href='/login' className='flex items-center'>
                <DirectionalIcon ltrIconClass='ri-arrow-left-s-line' rtlIconClass='ri-arrow-right-s-line' />
                <span>Back to Login</span>
              </Link>
            </Typography>
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  )
}

export default ResetPassword
