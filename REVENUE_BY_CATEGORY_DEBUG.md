# Revenue by Category - Debugging Guide

## 🐛 ApexCharts Error Fix Applied

The error `TypeError: Cannot read properties of null (reading '1')` in ApexCharts was caused by:

1. **Invalid color values from theme** - The theme object was returning null/undefined
2. **Empty data arrays** - Chart was trying to render with no data
3. **Missing categories** - xaxis categories array was empty

### ✅ Fixes Applied

1. **Hardcoded color values** - Removed theme dependency, using direct hex colors
2. **Added data guards** - Check if data exists before rendering chart
3. **Default values** - Provide fallback ['No Data'] and [0] when no data available
4. **Enhanced logging** - Added console.log statements to debug API responses

## 🧪 How to Debug the API Response

### Option 1: Use the Test Page

Navigate to: **`/test-revenue-api`** in your browser

This page will:

- Show you the exact API response structure
- Display whether it's an array or paginated object
- Check for expected fields (category, total_revenue, etc.)
- Pretty-print the JSON response

### Option 2: Check Browser Console

Open the Analytics page (`/financial/analytics`) and check console for:

```
🔍 Raw revenue list type: ...
🔍 Raw revenue list length: ...
🔍 Processing item: { categoryName: ..., revenueValue: ..., rawItem: ... }
📊 Final revenue category data: [...]
```

## 📋 Expected API Response Format

The code supports multiple formats:

### Format 1: Direct Array

```json
[
  {
    "category": "Excavators",
    "total_revenue": 12345.0
  },
  {
    "category": "Bulldozers",
    "total_revenue": 8900.5
  }
]
```

### Format 2: Paginated Response

```json
{
  "count": 2,
  "results": [
    {
      "category": "Excavators",
      "total_revenue": 12345.0
    },
    {
      "category": "Bulldozers",
      "total_revenue": 8900.5
    }
  ]
}
```

### Format 3: Nested Category Object

```json
[
  {
    "category": {
      "name": "Excavators",
      "id": 1
    },
    "revenue": 12345.0
  }
]
```

### Format 4: Alternative Field Names

The code checks for these revenue field names (in order):

- `total_revenue`
- `revenue`
- `amount`
- `value`

And these category field names:

- `category.name`
- `category`
- `name`
- `label`

## 🔍 Common Issues & Solutions

### Issue 1: Empty Response

**Symptom:** Chart shows "No data available"
**Check:**

1. Open browser console
2. Look for `✅ API Response - Revenue by Category:`
3. If it's `[]` or `{ results: [] }`, the backend has no data

**Solution:** Ensure your backend has rental data with categories

### Issue 2: Authentication Error

**Symptom:** API returns 401 Unauthorized
**Check:** Network tab shows 401 status
**Solution:** Make sure you're logged in

### Issue 3: Wrong Field Names

**Symptom:** Console shows revenue as 0 for all items
**Check:** Look for the `🔍 Processing item:` logs
**Solution:**

1. Check what fields your API actually returns
2. Update the field mapping in the code if needed

### Issue 4: Category Names Show as "Other"

**Symptom:** All bars labeled "Other"
**Check:** `🔍 Processing item:` logs show categoryName as "Other"
**Solution:** Your API might be returning category differently than expected

## 🛠️ Quick Fixes

### If API Returns Different Field Names

Edit: `src/app/(dashboard)/financial/analytics/page.jsx`

Find this line (around line 95):

```javascript
const categoryName = item?.category?.name || item?.category || item?.name || item?.label || 'Other'
const revenueValue = Number(item?.total_revenue ?? item?.revenue ?? item?.amount ?? item?.value ?? 0)
```

Add your field names to the chain.

### If API Returns No Data

The chart automatically falls back to showing equipment counts instead.

## 📊 What Should Happen

When working correctly:

1. Chart title shows "Revenue by Category"
2. Horizontal bars showing category names
3. Bars labeled with "AED X,XXX" format
4. Tooltip shows "AED X,XXX" on hover
5. Console shows processed data with actual revenue values

## 🚀 Next Steps

1. **Navigate to `/test-revenue-api`** to see raw API response
2. **Check the response format** - is it array or paginated?
3. **Verify field names** - does it have `category` and `total_revenue`?
4. **If different format**, update the field mapping in the code
5. **Check backend** - ensure the endpoint exists and returns data

## 📝 Files Modified

- `src/services/api.js` - Added `getRevenueByCategory()` method
- `src/app/(dashboard)/financial/analytics/page.jsx` - Updated to fetch and display revenue by category
- `src/app/(dashboard)/test-revenue-api/page.jsx` - NEW test page for debugging

## 🔗 Backend Endpoint

Expected endpoint: `GET /api/rentals/rentals/revenue_by_category/`

If your backend endpoint is different, update it in `src/services/api.js`:

```javascript
getRevenueByCategory: async (params = {}) => {
  const response = await api.get('YOUR_ACTUAL_ENDPOINT_HERE', { params })
  return response.data
}
```
