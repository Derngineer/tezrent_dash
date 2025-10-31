'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
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

const ForgotPassword = ({ mode }) => {
  // States
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Vars
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  // Hooks
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!email) {
      setError('Please enter your email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    try {
      setLoading(true)
      setError('')

      // STEP 1: Request password reset
      // Calls: POST http://localhost:8000/api/accounts/password-reset/
      // Sends: { email: "user@example.com" }
      await authAPI.requestPasswordReset(email)

      // Show success message
      setSuccess(true)

    } catch (err) {
      console.error('Password reset request failed:', err)
      // Note: Backend returns success even for non-existent emails (security feature)
      // But we still handle errors in case of network issues
      setError(err.response?.data?.message || err.message || 'Failed to send reset link. Please try again.')
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
          <Typography variant='h4'>Forgot Password 🔒</Typography>
          <div className='flex flex-col gap-5'>
            <Typography className='mbs-1'>
              Enter your email and we&#39;ll send you instructions to reset your password
            </Typography>

            {/* Success Message */}
            {success ? (
              <Alert severity='success' sx={{ mb: 2 }}>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  Reset link sent!
                </Typography>
                <Typography variant='body2'>
                  If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
                  Please check your email inbox and spam folder.
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
                    label='Email' 
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <Button 
                    fullWidth 
                    variant='contained' 
                    type='submit'
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    {loading ? 'Sending...' : 'Send reset link'}
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

export default ForgotPassword
