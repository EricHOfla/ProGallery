# Image Upload Implementation Guide

## Overview
The image upload feature has been successfully implemented with both backend and frontend support for storing image files directly instead of just URLs.

## What Changed

### Backend (Laravel)
- **File**: `prodgallery-api/app/Http/Controllers/Admin/PhotoController.php`
  - Updated `store()` method to accept image file uploads
  - Updated `update()` method to accept optional image file uploads
  - Added `storeImage()` private method for file handling
  - Files stored in: `storage/app/public/photos/`
  - Public URL accessible via: `http://localhost:8000/storage/photos/[filename]`

**Validation Rules**:
- Max file size: 5MB (5120KB)
- Allowed formats: JPEG, PNG, JPG, GIF
- Required on create, optional on update

### Frontend (React)
Updated **two** admin components:

1. **PhotoForm.jsx** (`src/pages/admin/PhotoForm.jsx`)
   - Changed from text input (URL) to file input (`<input type="file">`)
   - Added image preview display
   - Uses FormData instead of JSON for submission
   - Shows upload requirements (format, max size)

2. **PhotoEdit.jsx** (`src/pages/admin/PhotoEdit.jsx`)
   - Changed from text input (URL) to file input
   - Keeps current image display while editing
   - Optional file upload (keeps current image if not selected)
   - Preview of selected or current image

### API Service Updates
**File**: `src/services/api.js`
- `photosAPI.create(formData)` - Sends FormData with multipart/form-data
- `photosAPI.update(id, formData)` - Sends FormData with X-HTTP-Method-Override header for file uploads

## Storage Configuration

### Laravel Storage Link
Created symlink connecting:
- `public/storage` → `storage/app/public`

**Command executed**:
```bash
php artisan storage:link
```

This allows uploaded files in `storage/app/public/photos/` to be publicly accessible at:
```
http://localhost:8000/storage/photos/filename.jpg
```

## How to Use

### Admin: Add New Photo with Image Upload
1. Go to Admin Dashboard
2. Click "Add New Photo"
3. Fill in photo details:
   - **Title** (required)
   - **Category** (required)
   - **Price** (required)
   - **Image File** (required) - Click to select image from computer
   - **Photographer** (optional)
   - **Width/Height** (optional)
   - **Featured** (checkbox)
   - **Active** (checkbox)
4. Image preview shows after selection
5. Click "Save Photo" to upload
6. Image is stored server-side, accessible to all users

### Admin: Edit Existing Photo
1. Go to Admin → Photos
2. Click "Edit" on any photo
3. Current image displays
4. To change image: Select new image file
5. To keep current: Leave file input empty
6. Click "Save Photo"
7. Old image automatically deleted if new one uploaded

## Image Storage Details

### Directory Structure
```
prodgallery-api/
├── storage/
│   └── app/
│       └── public/
│           └── photos/           # Uploaded images stored here
│               ├── uuid-name1.jpg
│               ├── uuid-name2.png
│               └── uuid-name3.gif
└── public/
    └── storage/ → links to ../storage/app/public (symlink)
```

### File Naming
- Files are renamed to UUIDs by Laravel for security
- Original filenames not preserved
- Unique name prevents filename collisions

### Public Access URL
```
http://localhost:8000/storage/photos/[uuid-filename]
```

Example: `http://localhost:8000/storage/photos/abc123def-photo.jpg`

## Database
- Image path/URL stored in `photos.image` column
- Path format: `/storage/photos/[filename]`
- Automatic on upload via Laravel Storage facade

## Testing the Feature

### Step-by-Step Test
1. **Login as Admin**
   - Email: `admin@prodgallery.com`
   - Password: `admin123`

2. **Add New Photo**
   - Navigate to `/admin/photos`
   - Click "Add Photo"
   - Fill form with:
     - Title: "Test Photo"
     - Category: Select any category
     - Price: 99.99
     - Select image file from computer
   - Submit form

3. **Verify Upload**
   - Should redirect to photos list
   - New photo appears in admin list
   - Check database: `SELECT image FROM photos WHERE title = 'Test Photo'`
   - Image should be accessible at the public URL

4. **Edit Photo**
   - Click "Edit" on any photo
   - Keep image (don't select new one) → save → image unchanged
   - Select new image → save → old image deleted, new image stored

5. **Frontend Display**
   - Navigate to Gallery
   - New photo should display with uploaded image
   - Photo appears in search/category filters

## API Request Examples

### Create Photo (Multipart FormData)
```bash
POST /api/admin/photos
Content-Type: multipart/form-data
Authorization: Bearer [token]

Form Data:
- title: "Beach Sunset"
- category_id: 1
- price: 149.99
- image: [file binary]
- photographer: "John Doe"
- featured: true
- is_active: true
```

### Update Photo (Optional Image)
```bash
POST /api/admin/photos/1
X-HTTP-Method-Override: PUT
Content-Type: multipart/form-data
Authorization: Bearer [token]

Form Data:
- title: "Updated Title"
- category_id: 1
- price: 199.99
- image: [file binary OR empty]
- featured: false
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Image file is required" | No file selected on create | Select an image file |
| "File size exceeds 5MB" | Image too large | Compress image or use smaller file |
| "Unsupported file format" | Wrong file type | Use JPEG, PNG, or GIF |
| "Failed to create photo" | Backend error | Check Laravel logs or database permissions |

## File Size Optimization Tips

If users upload very large images:
1. Backend validates max 5MB
2. Recommended max width: 2048px
3. Consider adding frontend image compression
4. Use modern formats: WebP (if backend updated)

## Security Considerations

✅ **Implemented**:
- File type validation (MIME types)
- File size limits (5MB)
- Unique filename generation (prevents collision)
- File stored outside web root (storage/app/public)
- Only accessible via public symlink

⚠️ **Note**: In production, consider:
- Antivirus scanning for uploaded files
- Image re-encoding to remove metadata
- Rate limiting on uploads
- User quota per role
- Audit logging of uploads

## Troubleshooting

### Images Not Displaying
1. Check if `public/storage` symlink exists
2. Verify `storage/app/public` directory exists
3. Check file permissions: `storage` folder should be writable
4. Verify image path in database

### Storage Symlink Error
```bash
# Recreate symlink
cd prodgallery-api
php artisan storage:link
```

### Permission Issues
```bash
# On Linux/Mac
chmod -R 775 storage bootstrap/cache

# On Windows (run as admin)
icacls "storage" /grant Everyone:F /T
icacls "bootstrap\cache" /grant Everyone:F /T
```

## Next Steps

1. ✅ Backend file upload support - DONE
2. ✅ Frontend file input forms - DONE
3. ✅ Image preview in forms - DONE
4. ✅ Storage symlink - DONE
5. Optional: Add image compression on frontend
6. Optional: Add drag-and-drop upload
7. Optional: Support multiple image uploads
8. Optional: Add image editing (crop, resize)

---

**Last Updated**: Current session
**Status**: Production Ready
