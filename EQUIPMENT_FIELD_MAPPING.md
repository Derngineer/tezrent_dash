# Equipment Backend-Frontend Field Mapping

## EquipmentListSerializer Fields (Backend → Frontend)

### ✅ Correctly Mapped Fields:

| Backend Field | Frontend Usage | Description |
|--------------|----------------|-------------|
| `id` | `item.id` | Equipment ID |
| `name` | `item.name` | Equipment name |
| `category_name` | `item.category_name` | Category display name |
| `primary_image` | `item.primary_image` | Main image URL |
| `daily_rate` | `item.daily_rate` | Base daily rental rate |
| `status` | `item.status` | Status (available/rented/maintenance/unavailable) |
| `available_units` | `item.available_units` | Number of available units |
| `featured` | `item.featured` | Featured flag |
| `is_todays_deal` | `item.is_todays_deal` | Today's deal flag |
| `is_new_listing` | `item.is_new_listing` | New listing flag |
| `discounted_daily_rate` | `item.discounted_daily_rate` | Discounted price |
| `savings_amount` | `item.savings_amount` | Amount saved |
| `is_deal_active` | `item.is_deal_active` | Deal active flag |
| `company_name` | `item.company_name` | Seller company name |
| `company_phone` | `item.company_phone` | Seller phone |
| `city_name` | `item.city_name` | City display name |
| `country_name` | `item.country_name` | Country display name |

### 📱 Mobile-Specific Fields (Available but not used in web):
- `mobile_display_title` - Truncated title for mobile cards
- `mobile_price_text` - Formatted price text
- `quick_contact_data` - WhatsApp/call links
- `image_gallery` - Array of all images for carousel
- `tags` - Array of tag names
- `manufacturer`, `year` - Equipment details

### ❌ Removed/Fixed Fields:
- ~~`availability_status`~~ → Use `status` instead
- ~~`condition`~~ → Not in EquipmentListSerializer
- ~~`times_rented`~~ → Not in EquipmentListSerializer

## API Endpoints

### Equipment Endpoints:
```javascript
// List seller's equipment
equipmentAPI.getMyEquipment(params)
// GET /api/equipment/my_equipment/
// Params: { search, category, status }

// Get single equipment
equipmentAPI.getEquipment(id)
// GET /api/equipment/equipment/{id}/

// Create equipment
equipmentAPI.createEquipment(data)
// POST /api/equipment/equipment/

// Update equipment
equipmentAPI.updateEquipment(id, data)
// PATCH /api/equipment/equipment/{id}/

// Delete equipment
equipmentAPI.deleteEquipment(id)
// DELETE /api/equipment/equipment/{id}/
```

### Category Endpoints:
```javascript
// List all categories
equipmentAPI.getCategories()
// GET /api/equipment/categories/

// Featured categories
equipmentAPI.getFeaturedCategories()
// GET /api/equipment/categories/featured/

// Category choices for dropdowns
equipmentAPI.getCategoryChoices()
// GET /api/equipment/categories/choices/

// Create category
equipmentAPI.createCategory(data)
// POST /api/equipment/categories/

// Update category
equipmentAPI.updateCategory(id, data)
// PATCH /api/equipment/categories/{id}/

// Delete category
equipmentAPI.deleteCategory(id)
// DELETE /api/equipment/categories/{id}/
```

## Status Values
- `available` - Equipment is available for rent
- `rented` - Currently rented out
- `maintenance` - Under maintenance
- `unavailable` - Not available for rent

## Promotional Fields
- `is_todays_deal` - Shows "Today's Deal" badge
- `is_new_listing` - Shows "New" badge
- `featured` - Shows "Featured" badge
- `deal_discount_percentage` - Percentage off original price
- `savings_amount` - Dollar amount saved
- `is_deal_active` - Whether deal is currently active

## Image Handling
- `primary_image` - Main image URL (full path from backend)
- `image_gallery` - Array of up to 7 images with metadata:
  ```javascript
  {
    id: number,
    url: string,
    is_primary: boolean,
    display_order: number,
    caption: string
  }
  ```

## Company Information
Available in listing for quick contact:
- `company_name` - Seller company name
- `company_phone` - Company phone number
- For mobile: `quick_contact_data` includes WhatsApp and call links
