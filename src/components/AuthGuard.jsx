'use client'

// React Imports
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

// API Imports
import { getAccessToken, authAPI } from '@/services/api'

// Component Imports
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

/**
 * Authentication Guard Component
 * Wraps protected routes to ensure user is authenticated
 * Redirects to /login if no valid token found
 */
const AuthGuard = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Only check auth once on mount, not on every pathname change
    if (isChecking) {
      checkAuth()
    }
  }, [])

  const checkAuth = async () => {
    try {
      console.log('🔐 Checking authentication...')
      const startTime = Date.now()
      
      // Step 1: Check if access token exists in localStorage
      const token = getAccessToken()
      
      if (!token) {
        // No token found, redirect to login
        console.log('❌ No token found, redirecting to login')
        router.push('/login')
        return
      }

      // Step 2: Verify token is valid by making a profile request with timeout
      try {
        const profilePromise = authAPI.getProfile()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile check timeout')), 5000)
        )
        
        await Promise.race([profilePromise, timeoutPromise])
        
        console.log(`✅ Auth check passed in ${Date.now() - startTime}ms`)
        // Token is valid, user is authenticated
        setIsAuthenticated(true)
      } catch (error) {
        // Token is invalid or expired
        console.log('❌ Token invalid or timeout, redirecting to login:', error.message)
        router.push('/login')
        return
      }

    } catch (error) {
      console.error('❌ Auth check failed:', error)
      router.push('/login')
    } finally {
      setIsChecking(false)
    }
  }

  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'
      >
        <CircularProgress />
      </Box>
    )
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null
}

export default AuthGuard
