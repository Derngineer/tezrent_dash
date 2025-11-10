'use client'

/**
 * Revenue by Category API Test Page
 * Navigate to /test-revenue-api to see raw API response
 */

import { useState, useEffect } from 'react'

import { Box, Button, Card, CardContent, Typography, Alert, CircularProgress } from '@mui/material'

import { rentalsAPI, getAccessToken, getUserProfile } from '@/services/api'

export default function TestRevenueAPIPage() {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [error, setError] = useState(null)
  const [authStatus, setAuthStatus] = useState({ isAuthenticated: false, user: null })

  useEffect(() => {
    // Check authentication status on mount
    const token = getAccessToken()
    const user = getUserProfile()

    setAuthStatus({
      isAuthenticated: !!token,
      user: user
    })
  }, [])

  const testAPI = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      console.log('🧪 Testing rentalsAPI.getRevenueByCategory()...')
      
      // Add 3 second delay
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const data = await rentalsAPI.getRevenueByCategory()

      console.log('✅ Success! Response:', data)
      setResponse(data)
    } catch (err) {
      console.error('❌ Error:', err)

      let errorMessage = err.message || 'Unknown error'

      // Check for authentication error
      if (err.response?.status === 401) {
        errorMessage = '🔒 Authentication required - Please log in first at /login'
      } else if (err.response?.status === 403) {
        errorMessage = '🚫 Permission denied - You do not have access to this resource'
      } else if (err.response?.status === 404) {
        errorMessage = '❌ Endpoint not found - Check if backend URL is correct'
      } else if (err.response) {
        errorMessage = `HTTP ${err.response.status}: ${err.response.statusText || errorMessage}`
      } else if (err.request) {
        errorMessage = '🌐 Network error - Backend server may be offline'
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box p={4}>
      <Typography variant='h4' gutterBottom>
        Revenue by Category API Test
      </Typography>

      <Typography variant='body1' color='text.secondary' paragraph>
        This page tests the <code>GET /api/rentals/rentals/revenue_by_category/</code> endpoint
      </Typography>

      {/* Authentication Status */}
      <Card sx={{ mb: 3, bgcolor: authStatus.isAuthenticated ? '#e8f5e9' : '#fff3e0' }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            🔐 Authentication Status
          </Typography>
          {authStatus.isAuthenticated ? (
            <Box>
              <Typography color='success.main' sx={{ fontWeight: 'bold', mb: 1 }}>
                ✅ Authenticated
              </Typography>
              {authStatus.user && (
                <Box sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                  <Typography>User: {authStatus.user.email || authStatus.user.username}</Typography>
                  <Typography>Role: {authStatus.user.user_type || authStatus.user.role || 'N/A'}</Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box>
              <Typography color='warning.main' sx={{ fontWeight: 'bold', mb: 1 }}>
                ⚠️ Not Authenticated
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Please log in first at <code>/login</code> to test this API endpoint.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Button variant='contained' onClick={testAPI} disabled={loading || !authStatus.isAuthenticated} sx={{ mb: 4 }}>
        {loading ? 'Testing...' : 'Test API Endpoint'}
      </Button>

      {loading && (
        <Box display='flex' alignItems='center' gap={2}>
          <CircularProgress size={24} />
          <Typography>Fetching data from API...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity='error' sx={{ mb: 4 }}>
          <Typography variant='h6'>Error</Typography>
          <Typography>{error}</Typography>
        </Alert>
      )}

      {response && (
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              API Response
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant='subtitle2' color='primary'>
                Response Type:
              </Typography>
              <Typography variant='body2' sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                {typeof response} | Is Array: {Array.isArray(response).toString()}
              </Typography>
            </Box>

            {response.results && (
              <Box sx={{ mb: 3 }}>
                <Typography variant='subtitle2' color='primary'>
                  Paginated Response:
                </Typography>
                <Typography variant='body2' sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                  Count: {response.count} | Results: {response.results?.length || 0} items
                </Typography>
              </Box>
            )}

            {Array.isArray(response) && (
              <Box sx={{ mb: 3 }}>
                <Typography variant='subtitle2' color='primary'>
                  Array Response:
                </Typography>
                <Typography variant='body2' sx={{ fontFamily: 'monospace', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                  Length: {response.length} items
                </Typography>
              </Box>
            )}

            <Typography variant='subtitle2' color='primary' gutterBottom>
              Full Response (JSON):
            </Typography>
            <Box
              component='pre'
              sx={{
                bgcolor: '#1e1e1e',
                color: '#d4d4d4',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: '500px',
                fontSize: '0.85rem'
              }}
            >
              {JSON.stringify(response, null, 2)}
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant='subtitle2' color='primary' gutterBottom>
                Field Analysis:
              </Typography>
              {(() => {
                const items = response.results || (Array.isArray(response) ? response : [])

                if (items.length === 0) {
                  return <Typography color='warning.main'>⚠️ No items in response</Typography>
                }

                const firstItem = items[0]

                return (
                  <Box sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    <Typography>✓ Has &quot;category&quot;: {('category' in firstItem).toString()}</Typography>
                    <Typography>
                      ✓ Has &quot;total_revenue&quot;: {('total_revenue' in firstItem).toString()}
                    </Typography>
                    <Typography>✓ Has &quot;revenue&quot;: {('revenue' in firstItem).toString()}</Typography>
                    <Typography>✓ Has &quot;amount&quot;: {('amount' in firstItem).toString()}</Typography>
                    <Typography>✓ Has &quot;value&quot;: {('value' in firstItem).toString()}</Typography>

                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant='subtitle2' gutterBottom>
                        First Item:
                      </Typography>
                      <pre>{JSON.stringify(firstItem, null, 2)}</pre>
                    </Box>
                  </Box>
                )
              })()}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
