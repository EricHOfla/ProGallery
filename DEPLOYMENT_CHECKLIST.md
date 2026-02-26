# DEPLOYMENT CHECKLIST & QUICK START GUIDE

## Pre-Deployment Verification

### Backend Setup
- [ ] PHP 8.2+ installed
- [ ] Composer dependencies: `composer install`
- [ ] Database created: `prodgallery` (MySQL)
- [ ] `.env` configured with DB credentials
- [ ] `APP_KEY` generated: `php artisan key:generate`
- [ ] Migrations run: `php artisan migrate`
- [ ] Database seeded: `php artisan db:seed`
- [ ] Storage symlink created: `php artisan storage:link`
- [ ] Permissions set: `chmod -R 775 storage bootstrap/cache`

### Frontend Setup
- [ ] Node.js 18+ installed
- [ ] Dependencies: `npm install`
- [ ] `.env` has correct `VITE_API_URL`
- [ ] Build test: `npm run build`

---

## Local Development Startup

### Terminal 1 - Backend (Laravel)
```bash
cd prodgallery-api
php artisan serve
# Runs on http://localhost:8000
```

### Terminal 2 - Frontend (React)
```bash
cd ProdGallery
npm run dev
# Runs on http://localhost:5173
```

### Database Setup (First Time)
```bash
cd prodgallery-api
php artisan migrate
php artisan db:seed
php artisan storage:link
```

---

## Quick Test Workflow

### 1. Login as Admin
```
URL: http://localhost:5173/login
Email: admin@prodgallery.com
Password: admin123
→ Should redirect to /admin dashboard
```

### 2. Upload a Photo
```
URL: http://localhost:5173/admin/photos/new
- Title: "Test Photo"
- Category: Select one
- Price: 99.99
- Image: Choose file (5MB max, JPEG/PNG/GIF)
→ Submit
→ Should appear in /admin/photos list
```

### 3. Browse as Customer
```
URL: http://localhost:5173/gallery
- Photos should load from database
- Click category to filter
- Click photo to see details
```

### 4. Test Cart & Order
```
1. Add item to cart (click "Add to Cart" on photo)
2. Go to /cart
3. Click "Checkout"
4. Fill address and submit
5. Go to /orders to see confirmation
6. Login as admin → /admin/orders to see order
```

### 5. Test Contact
```
URL: http://localhost:5173/contact
- Fill form and submit
- Should see success message
- Backend stores in database
```

---

## API Testing with Thunder Client (VS Code)

### 1. Login to Get Token
```
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "demo@example.com",
  "password": "demo123"
}
```
Save the returned `token` for other requests.

### 2. Get Photos
```
GET http://localhost:8000/api/photos
```

### 3. Add to Cart
```
POST http://localhost:8000/api/cart/add
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "photo_id": 1,
  "quantity": 1
}
```

### 4. Create Order
```
POST http://localhost:8000/api/orders
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "payment_method": "credit_card",
  "shipping_address": {
    "street": "123 Main St",
    "city": "Kigali",
    "state": "KGL",
    "zip": "00000",
    "country": "Rwanda"
  },
  "billing_address": {
    "street": "123 Main St",
    "city": "Kigali",
    "state": "KGL",
    "zip": "00000",
    "country": "Rwanda"
  }
}
```

---

## Common Issues & Solutions

### Issue: "Cannot GET /api/photos"
**Solution:** 
```bash
cd prodgallery-api
php artisan route:clear
php artisan route:cache
```

### Issue: Images not displaying after upload
**Solution:** Check symlink
```bash
cd prodgallery-api
php artisan storage:link
# Verify symbolic link was created
ls -la public/storage
```

### Issue: Database connection error
**Solution:** Check `.env` credentials
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=prodgallery
DB_USERNAME=root
DB_PASSWORD=
```

### Issue: CORS error in browser console
**Solution:** Verify CORS configuration
```php
# prodgallery-api/config/cors.php
'allowed_origins' => ['http://localhost:5173'],
```

### Issue: File upload size error
**Solution:** Check PHP settings in `php.ini`
```
upload_max_filesize = 20M
post_max_size = 20M
```

---

## Database Verification

### Check if tables exist
```bash
cd prodgallery-api
php artisan tinker
```

```php
>>> DB::table('users')->count()
>>> DB::table('photos')->count()
>>> DB::table('categories')->count()
```

### View test user
```php
>>> \App\Models\User::first()
```

---

## File Structure Overview

```
ProdGallery/                    # Frontend React app
├── src/
│   ├── pages/                 # All page components
│   ├── components/            # Reusable components
│   ├── context/               # Auth, Cart, Order state
│   ├── services/api.js        # All API calls
│   └── routes/AppRoutes.jsx   # Route definitions
├── .env                       # Frontend config
└── package.json

prodgallery-api/               # Backend Laravel API
├── app/
│   ├── Models/                # Eloquent models
│   ├── Http/Controllers/      # API controllers
│   ├── Policies/              # Authorization policies
│   └── Providers/             # Service providers
├── database/
│   ├── migrations/            # Database tables
│   └── seeders/               # Test data
├── routes/api.php             # API routes
├── .env                       # Backend config
└── composer.json
```

---

## Key Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=ProdGallery
```

### Backend (.env)
```
APP_NAME=ProdGallery
APP_ENV=local
APP_DEBUG=true
APP_KEY=base64:xxxxx

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=prodgallery
DB_USERNAME=root
DB_PASSWORD=

FRONTEND_URL=http://localhost:5173
```

---

## Code Quality Commands

### Backend
```bash
cd prodgallery-api

# Check routes
php artisan route:list

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Tinker shell
php artisan tinker

# Clear caches
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### Frontend
```bash
cd ProdGallery

# Install dependencies
npm install

# Dev server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

---

## Production Deployment Steps

1. **Update Environment Variables**
   ```bash
   # Backend .env
   APP_ENV=production
   APP_DEBUG=false
   # Set all production values
   
   # Frontend .env
   VITE_API_URL=https://your-api-domain.com/api
   ```

2. **Build Backend**
   ```bash
   cd prodgallery-api
   composer install --optimize-autoloader --no-dev
   php artisan config:cache
   php artisan route:cache
   ```

3. **Build Frontend**
   ```bash
   cd ProdGallery
   npm install
   npm run build
   # Deploy dist/ folder to web server
   ```

4. **Database Setup**
   ```bash
   php artisan migrate --force
   php artisan db:seed --force
   ```

5. **Set Permissions**
   ```bash
   chown -R www-data:www-data storage bootstrap/cache
   chmod -R 755 storage bootstrap/cache
   ```

6. **Create Storage Symlink**
   ```bash
   php artisan storage:link
   ```

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Verify backend is running
- [ ] Verify frontend is serving
- [ ] Check database connectivity
- [ ] Monitor storage disk space

### Weekly Tasks
- [ ] Review error logs: `storage/logs/laravel.log`
- [ ] Check contact form submissions
- [ ] Review admin order list
- [ ] Backup database

### Monthly Tasks
- [ ] Update dependencies: `composer update`, `npm update`
- [ ] Review security logs
- [ ] Check application performance
- [ ] Update SSL certificate if needed

---

## Support & Debugging

### View Logs
```bash
cd prodgallery-api
tail -f storage/logs/laravel.log
```

### Enable Debug Mode (Development Only)
```
APP_DEBUG=true
LOG_LEVEL=debug
```

### Test Database Connection
```bash
cd prodgallery-api
php artisan tinker

>>> DB::connection()->getPdo()
// Should return database connection object
```

### Test Storage
```bash
php artisan tinker

>>> Storage::disk('public')->put('test.txt', 'test content')
>>> Storage::disk('public')->get('test.txt')
>>> Storage::disk('public')->delete('test.txt')
```

---

## Performance Optimization Tips

1. **Database Indexing**
   ```sql
   ALTER TABLE photos ADD INDEX idx_category_id (category_id);
   ALTER TABLE orders ADD INDEX idx_user_id (user_id);
   ALTER TABLE carts ADD INDEX idx_user_id (user_id);
   ```

2. **Response Caching**
   ```php
   // In controllers
   return cache()->remember('photos', 3600, function() {
       return Photo::all();
   });
   ```

3. **Frontend Optimization**
   - Use image lazy loading
   - Code splitting with React.lazy()
   - Minify CSS and JS in production

4. **API Rate Limiting**
   ```php
   Route::middleware('throttle:60,1')->group(function () {
       // Apply rate limiting
   });
   ```

---

## Success Indicators

✅ Backend running on port 8000  
✅ Frontend running on port 5173  
✅ Login working with both admin and customer  
✅ Photos loading from database  
✅ Cart syncing with backend  
✅ Orders creating successfully  
✅ Admin dashboard showing statistics  
✅ Contact form saving messages  
✅ Image uploads working  
✅ No errors in browser console  

---

**Version:** 1.0  
**Last Updated:** January 28, 2026  
**Status:** Production Ready ✅
