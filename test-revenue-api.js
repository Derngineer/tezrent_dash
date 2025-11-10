#!/usr/bin/env node

/**
 * Test script to check the revenue_by_category API endpoint
 * Run with: node test-revenue-api.js
 */

const axios = require('axios')

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/'
const endpoint = 'rentals/rentals/revenue_by_category/'

console.log('🔍 Testing Revenue by Category API')
console.log('📡 Endpoint:', API_BASE_URL + endpoint)
console.log('='.repeat(60))

async function testAPI() {
  try {
    const response = await axios.get(API_BASE_URL + endpoint, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    console.log('\n✅ SUCCESS - API Response Status:', response.status)
    console.log('\n📦 Response Data Type:', typeof response.data)
    console.log('📦 Is Array:', Array.isArray(response.data))

    if (response.data) {
      console.log('\n📊 Response Structure:')
      console.log(JSON.stringify(response.data, null, 2))

      // Check if it's paginated
      if (response.data.results) {
        console.log('\n✅ Paginated response detected')
        console.log('   Count:', response.data.count)
        console.log('   Results length:', response.data.results?.length)

        if (response.data.results.length > 0) {
          console.log('\n📋 First item structure:')
          console.log(JSON.stringify(response.data.results[0], null, 2))

          // Check for expected fields
          const firstItem = response.data.results[0]

          console.log('\n🔑 Field analysis:')
          console.log('   Has "category":', 'category' in firstItem)
          console.log('   Has "total_revenue":', 'total_revenue' in firstItem)
          console.log('   Has "revenue":', 'revenue' in firstItem)
          console.log('   Has "amount":', 'amount' in firstItem)
          console.log('   Has "value":', 'value' in firstItem)
        }
      } else if (Array.isArray(response.data)) {
        console.log('\n✅ Direct array response')
        console.log('   Array length:', response.data.length)

        if (response.data.length > 0) {
          console.log('\n📋 First item structure:')
          console.log(JSON.stringify(response.data[0], null, 2))

          const firstItem = response.data[0]

          console.log('\n🔑 Field analysis:')
          console.log('   Has "category":', 'category' in firstItem)
          console.log('   Has "total_revenue":', 'total_revenue' in firstItem)
          console.log('   Has "revenue":', 'revenue' in firstItem)
          console.log('   Has "amount":', 'amount' in firstItem)
          console.log('   Has "value":', 'value' in firstItem)
        }
      } else {
        console.log('\n⚠️  Unexpected response format (not array, not paginated)')
      }
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message)

    if (error.response) {
      console.error('   Status:', error.response.status)
      console.error('   Status Text:', error.response.statusText)
      console.error('   Response Data:', JSON.stringify(error.response.data, null, 2))
    } else if (error.request) {
      console.error('   No response received from server')
      console.error('   Check if backend is running on:', API_BASE_URL)
    } else {
      console.error('   Request setup error:', error.message)
    }
  }
}

testAPI()
