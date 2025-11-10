import axios from 'axios'

// ============================================================================
// CONNECTION FLOW:
// ============================================================================
// 1. .env file (line 10) defines: NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/
// 2. Next.js reads .env and makes it available as: process.env.NEXT_PUBLIC_API_BASE_URL
// 3. This file reads it below and stores in API_BASE_URL constant
// 4. All API functions in this file use API_BASE_URL to build full URLs
// 5. Components import functions from this file (e.g., import { authAPI } from '@/services/api')
// 6. Components call the functions (e.g., authAPI.register(data))
// 7. Axios sends HTTP request to the full URL
// ============================================================================

// API Base URL - READ FROM .env FILE
// This reads: NEXT_PUBLIC_API_BASE_URL from /.env
// Value: http://localhost:8000/api/
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/'

// Create axios instance - THIS IS THE HTTP CLIENT
// All requests will automatically use API_BASE_URL as the base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  config => {
    const token = getAccessToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = getRefreshToken()

        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}accounts/token/refresh/`, {
            refresh: refreshToken
          })

          const { access } = response.data

          setAccessToken(access)

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`

          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        clearTokens()
        window.location.href = '/login'

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Token management functions
export const setTokens = (access, refresh) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
  }
}

export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token')
  }

  return null
}

export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refresh_token')
  }

  return null
}

export const setAccessToken = token => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token)
  }
}

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_profile')
  }
}

export const setUserProfile = profile => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_profile', JSON.stringify(profile))
  }
}

export const getUserProfile = () => {
  if (typeof window !== 'undefined') {
    const profile = localStorage.getItem('user_profile')

    return profile ? JSON.parse(profile) : null
  }

  return null
}

// Authentication API
export const authAPI = {
  // ============================================================================
  // REGISTER FUNCTION - HOW IT CONNECTS:
  // ============================================================================
  // 1. This function is EXPORTED from this file
  // 2. Register.jsx IMPORTS it: import { authAPI } from '@/services/api'
  // 3. Register.jsx CALLS it: authAPI.register(formData)
  // 4. Axios sends POST request to: API_BASE_URL + 'accounts/register/company/'
  // 5. Full URL becomes: http://localhost:8000/api/accounts/register/company/
  // 6. Backend receives the request at that URL
  // ============================================================================
  register: async data => {
    // axios.post() sends HTTP POST request
    // First parameter: URL = API_BASE_URL + 'accounts/register/company/'
    // Second parameter: data = { username, email, password, confirm_password, profile: { company_name, phone } }
    console.log('API REGISTER - URL:', `${API_BASE_URL}accounts/register/company/`)
    console.log('API REGISTER - Data:', JSON.stringify(data, null, 2))
    const response = await axios.post(`${API_BASE_URL}accounts/register/company/`, data)

    console.log('API REGISTER - Response:', response.data)

    return response.data
  },

  // LOGIN ENDPOINT
  login: async (email, password) => {
    const response = await axios.post(`${API_BASE_URL}accounts/token/`, { email, password })
    const { access, refresh, user } = response.data

    setTokens(access, refresh)
    setUserProfile(user)

    return response.data
  },

  logout: () => {
    clearTokens()
    window.location.href = '/login'
  },

  getProfile: async () => {
    const response = await api.get('accounts/profile/')

    setUserProfile(response.data)

    return response.data
  },

  updateProfile: async data => {
    const response = await api.patch('accounts/profile/', data)

    setUserProfile(response.data)

    return response.data
  },

  // PASSWORD RESET ENDPOINTS
  // ============================================================================
  // COMPLETE PASSWORD RESET FLOW:
  // ============================================================================
  // Step 1: User visits /forgot-password
  //         - Enters email
  //         - Calls: authAPI.requestPasswordReset(email)
  //         - Backend sends email with reset link
  //         - Email link format: http://localhost:3000/reset-password?token=abc123xyz
  //
  // Step 2: User clicks link in email
  //         - Opens /reset-password?token=abc123xyz
  //         - Token is extracted from URL
  //         - User enters new password
  //         - Calls: authAPI.confirmPasswordReset(token, newPassword)
  //         - Backend validates token and updates password
  //         - User redirected to /login
  // ============================================================================

  // Step 1: Request password reset (send email with reset link)
  // POST request to: http://localhost:8000/api/accounts/password-reset/
  // Sends: { email: "user@example.com" }
  requestPasswordReset: async email => {
    const response = await axios.post(`${API_BASE_URL}accounts/password-reset/`, { email })

    return response.data
  },

  // Step 2: Confirm password reset (set new password with token)
  // POST request to: http://localhost:8000/api/accounts/password-reset-confirm/
  // Sends: { token: "...", password: "newpassword" }
  confirmPasswordReset: async (token, password) => {
    const response = await axios.post(`${API_BASE_URL}accounts/password-reset-confirm/`, {
      token,
      password
    })

    return response.data
  }
}

// Equipment API
export const equipmentAPI = {
  // GET REQUEST - Retrieve list of equipment
  // Component calls: equipmentAPI.getMyEquipment()
  // HTTP Method decided HERE ↓
  getMyEquipment: async params => {
    const response = await api.get('equipment/equipment/', { params }) // ← GET method

    return response.data
  },

  // GET REQUEST - Retrieve single equipment by ID
  // Component calls: equipmentAPI.getEquipment(id)
  // HTTP Method decided HERE ↓
  getEquipment: async id => {
    const response = await api.get(`equipment/equipment/${id}/`) // ← GET method

    return response.data
  },

  // POST REQUEST - Create new equipment
  // Component calls: equipmentAPI.createEquipment(data)
  // HTTP Method decided HERE ↓
  createEquipment: async data => {
    const response = await api.post('equipment/equipment/', data, {
      // ← POST method
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  },

  // PATCH REQUEST - Update existing equipment
  // Component calls: equipmentAPI.updateEquipment(id, data)
  // HTTP Method decided HERE ↓
  updateEquipment: async (id, data) => {
    const response = await api.patch(`equipment/equipment/${id}/`, data) // ← PATCH method

    return response.data
  },

  // DELETE REQUEST - Delete equipment
  // Component calls: equipmentAPI.deleteEquipment(id)
  // HTTP Method decided HERE ↓
  deleteEquipment: async id => {
    await api.delete(`equipment/equipment/${id}/`) // ← DELETE method
  },

  // POST REQUEST - Upload image
  uploadImage: async (id, imageFile) => {
    const formData = new FormData()

    formData.append('image', imageFile)

    const response = await api.post(`equipment/equipment/${id}/upload_image/`, formData, {
      // ← POST method
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  },

  // POST REQUEST - Set primary image
  setPrimaryImage: async (id, imageId) => {
    const response = await api.post(`equipment/equipment/${id}/set_primary_image/`, { image_id: imageId }) // ← POST method

    return response.data
  },

  // DELETE REQUEST - Delete image
  deleteImage: async imageId => {
    await api.delete(`equipment/images/${imageId}/`) // ← DELETE method
  },

  // ============================================================================
  // CATEGORY MANAGEMENT ENDPOINTS
  // ============================================================================

  // GET REQUEST - Get all categories
  getCategories: async () => {
    const response = await api.get('equipment/categories/')

    return response.data
  },

  // GET REQUEST - Get featured categories
  getFeaturedCategories: async () => {
    const response = await api.get('equipment/categories/featured/')

    return response.data
  },

  // GET REQUEST - Get category choices for dropdowns
  getCategoryChoices: async () => {
    const response = await api.get('equipment/categories/choices/')

    return response.data
  },

  // GET REQUEST - Get single category by ID
  getCategory: async id => {
    const response = await api.get(`equipment/categories/${id}/`)

    return response.data
  },

  // POST REQUEST - Create new category
  createCategory: async data => {
    const response = await api.post('equipment/categories/', data)

    return response.data
  },

  // PATCH REQUEST - Update category
  updateCategory: async (id, data) => {
    const response = await api.patch(`equipment/categories/${id}/`, data)

    return response.data
  },

  // DELETE REQUEST - Delete category
  deleteCategory: async id => {
    await api.delete(`equipment/categories/${id}/`)
  },

  // POST REQUEST - Upload category icon
  uploadCategoryIcon: async (id, iconFile) => {
    const formData = new FormData()

    formData.append('icon', iconFile)

    const response = await api.post(`equipment/categories/${id}/upload_icon/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  },

  // POST REQUEST - Upload category promotional image
  uploadCategoryPromotionalImage: async (id, imageFile) => {
    const formData = new FormData()

    formData.append('promotional_image', imageFile)

    const response = await api.post(`equipment/categories/${id}/upload_promotional_image/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  },

  toggleAvailability: async id => {
    const response = await api.post(`equipment/equipment/${id}/toggle_availability/`)

    return response.data
  },

  // ============================================================================
  // BANNER MANAGEMENT ENDPOINTS
  // ============================================================================

  // GET REQUEST - Get all banners
  getBanners: async () => {
    const response = await api.get('equipment/banners/')

    return response.data
  },

  // GET REQUEST - Get active banners only
  getActiveBanners: async () => {
    const response = await api.get('equipment/banners/active/')

    return response.data
  },

  // GET REQUEST - Get single banner
  getBanner: async id => {
    const response = await api.get(`equipment/banners/${id}/`)

    return response.data
  },

  // POST REQUEST - Create banner (with image upload)
  createBanner: async formData => {
    const response = await api.post('equipment/banners/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  },

  // PATCH REQUEST - Update banner
  updateBanner: async (id, formData) => {
    const response = await api.patch(`equipment/banners/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  },

  // DELETE REQUEST - Delete banner
  deleteBanner: async id => {
    await api.delete(`equipment/banners/${id}/`)
  },

  // ============================================================================
  // TAG MANAGEMENT ENDPOINTS
  // ============================================================================

  // GET REQUEST - Get all tags
  getTags: async () => {
    const response = await api.get('equipment/tags/')

    return response.data
  },

  // GET REQUEST - Get single tag
  getTag: async id => {
    const response = await api.get(`equipment/tags/${id}/`)

    return response.data
  },

  // POST REQUEST - Create tag
  createTag: async data => {
    const response = await api.post('equipment/tags/', data)

    return response.data
  },

  // PATCH REQUEST - Update tag
  updateTag: async (id, data) => {
    const response = await api.patch(`equipment/tags/${id}/`, data)

    return response.data
  },

  // DELETE REQUEST - Delete tag
  deleteTag: async id => {
    await api.delete(`equipment/tags/${id}/`)
  },

  getCategories: async () => {
    const response = await api.get('equipment/categories/')

    return response.data
  }
}

// Rentals API
export const rentalsAPI = {
  // List rentals with filters
  getRentals: async params => {
    const response = await api.get('rentals/rentals/', { params })

    return response.data
  },

  // Get single rental detail
  getRental: async id => {
    const response = await api.get(`rentals/rentals/${id}/`)

    return response.data
  },

  // Seller-specific endpoints
  getPendingApprovals: async () => {
    const response = await api.get('rentals/rentals/pending_approvals/')

    return response.data
  },

  getActiveRentals: async () => {
    const response = await api.get('rentals/rentals/active_rentals/')

    return response.data
  },

  // Customer-specific
  getMyRentals: async () => {
    const response = await api.get('rentals/rentals/my_rentals/')

    return response.data
  },

  // Status updates
  approveRental: async (id, notes) => {
    const response = await api.post(`rentals/rentals/${id}/approve/`, { notes })

    return response.data
  },

  cancelRental: async (id, reason) => {
    const response = await api.post(`rentals/rentals/${id}/cancel/`, { reason })

    return response.data
  },

  updateStatus: async (id, newStatus, notes, isVisibleToCustomer = true) => {
    const response = await api.post(`rentals/rentals/${id}/update_status/`, {
      new_status: newStatus,
      notes,
      is_visible_to_customer: isVisibleToCustomer
    })

    return response.data
  },

  markDelivered: async (id, notes) => {
    const response = await api.post(`rentals/rentals/${id}/mark_delivered/`, {
      notes
    })

    return response.data
  },

  requestReturn: async (id, notes) => {
    const response = await api.post(`rentals/rentals/${id}/request_return/`, {
      notes
    })

    return response.data
  },

  completeRental: async (id, lateFees, damageFees, notes) => {
    const response = await api.post(`rentals/rentals/${id}/complete/`, {
      late_fees: lateFees || 0,
      damage_fees: damageFees || 0,
      notes
    })

    return response.data
  },

  // Reviews
  getReviews: async params => {
    const response = await api.get('rentals/reviews/', { params })

    return response.data
  },

  createReview: async data => {
    const response = await api.post('rentals/reviews/', data)

    return response.data
  },

  // Financial endpoints
  getRevenueSummary: async () => {
    const response = await api.get('rentals/rentals/revenue_summary/')

    return response.data
  },

  getRevenueTrends: async (params = {}) => {
    // params: { period: 'daily'|'weekly'|'monthly', days: number }
    const response = await api.get('rentals/rentals/revenue_trends/', { params })

    return response.data
  },

  // GET REQUEST - Revenue by category (for dashboards)
  // Example response expected: [{ category: 'Excavators', total_revenue: 12345 }, ...]
  getRevenueByCategory: async (params = {}) => {
    const response = await api.get('rentals/rentals/revenue_by_category/', { params })

    return response.data
  },

  // GET REQUEST - Top revenue by equipment (for dashboards)
  // Example response expected: { equipment: [{ equipment_name, equipment_image, total_revenue, rental_count }, ...] }
  getTopRevenueEquipment: async (params = {}) => {
    const response = await api.get('rentals/rentals/revenue_by_equipment/', { params })

    return response.data
  },

  getTransactions: async params => {
    const response = await api.get('rentals/rentals/transactions/', { params })

    return response.data
  },

  getSales: async params => {
    const response = await api.get('rentals/rentals/sales/', { params })

    return response.data
  },

  // Dashboard summary - single endpoint for all dashboard data
  getDashboardSummary: async () => {
    const response = await api.get('rentals/rentals/dashboard_summary/')

    return response.data
  }
}

// CRM API
export const crmAPI = {
  // Leads
  getLeads: async params => {
    const response = await api.get('crm/leads/', { params })

    return response.data
  },

  createLead: async data => {
    const response = await api.post('crm/leads/', data)

    return response.data
  },

  updateLead: async (id, data) => {
    const response = await api.patch(`crm/leads/${id}/`, data)

    return response.data
  },

  markLeadContacted: async (id, notes) => {
    const response = await api.post(`crm/leads/${id}/mark_contacted/`, { notes })

    return response.data
  },

  convertToOpportunity: async (id, data) => {
    const response = await api.post(`crm/leads/${id}/convert_to_opportunity/`, data)

    return response.data
  },

  // Opportunities
  getOpportunities: async params => {
    const response = await api.get('crm/opportunities/', { params })

    return response.data
  },

  getPipelineSummary: async () => {
    const response = await api.get('crm/opportunities/pipeline/')

    return response.data
  },

  updateOpportunity: async (id, data) => {
    const response = await api.patch(`crm/opportunities/${id}/`, data)

    return response.data
  },

  markOpportunityWon: async (id, notes) => {
    const response = await api.post(`crm/opportunities/${id}/mark_won/`, { won_notes: notes })

    return response.data
  },

  markOpportunityLost: async (id, reason) => {
    const response = await api.post(`crm/opportunities/${id}/mark_lost/`, { lost_reason: reason })

    return response.data
  },

  // Interactions
  getInteractions: async params => {
    const response = await api.get('crm/interactions/', { params })

    return response.data
  },

  createInteraction: async data => {
    const response = await api.post('crm/interactions/', data)

    return response.data
  },

  // Support Tickets
  getTickets: async params => {
    const response = await api.get('crm/tickets/', { params })

    return response.data
  },

  getMyTickets: async () => {
    const response = await api.get('crm/tickets/my_tickets/')

    return response.data
  },

  createTicket: async data => {
    const response = await api.post('crm/tickets/', data)

    return response.data
  },

  updateTicket: async (id, data) => {
    const response = await api.patch(`crm/tickets/${id}/`, data)

    return response.data
  },

  addTicketComment: async (id, comment, isInternal = false) => {
    const response = await api.post(`crm/tickets/${id}/add_comment/`, {
      comment,
      is_internal: isInternal
    })

    return response.data
  },

  resolveTicket: async (id, notes) => {
    const response = await api.post(`crm/tickets/${id}/mark_resolved/`, { resolution_notes: notes })

    return response.data
  }
}

// Notifications API
export const notificationsAPI = {
  getNotifications: async params => {
    const response = await api.get('notifications/', { params })

    return response.data
  },

  getUnreadCount: async () => {
    const response = await api.get('notifications/unread_count/')

    return response.data
  },

  markAsRead: async id => {
    await api.post(`notifications/${id}/mark_read/`)
  },

  markAllAsRead: async () => {
    await api.post('notifications/mark_all_read/')
  }
}

export default api
