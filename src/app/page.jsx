'use client'

// React Imports
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const HomePage = () => {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard
    router.replace('/dashboard')
  }, [router])

  return (
    <Box
      display='flex'
      flexDirection='column'
      justifyContent='center'
      alignItems='center'
      minHeight='100vh'
      gap={2}
    >
      <CircularProgress size={60} />
      <Typography variant='h6' color='text.secondary'>
        Redirecting to Dashboard...
      </Typography>
    </Box>
  )
}

export default HomePage
