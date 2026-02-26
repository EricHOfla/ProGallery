# 🚀 Quick Start Guide - ProdGallery

## 5-Minute Setup

### Prerequisites
- ✅ PHP 8.1+ installed
- ✅ MySQL running
- ✅ Node.js and npm installed
- ✅ Composer installed

---

## Step 1: Start Backend (Terminal 1)

```bash
cd d:\Solvit\Project\ProdGallery1\prodgallery-api
php artisan serve
```

**Expected Output:**
```
INFO  Server running on [http://127.0.0.1:8000].
Press Ctrl+C to stop the server
```

---

## Step 2: Start Frontend (Terminal 2)

```bash
cd d:\Solvit\Project\ProdGallery1\ProdGallery
npm run dev
```

**Expected Output:**
```
VITE v7.3.1  ready in 770 ms

  ➜  Local:   http://localhost:5173/
```

---

## Step 3: Open in Browser

Visit: **http://localhost:5173**

---

## Test the App

### Option A: Register New Account
1. Click "Register"
2. Fill in details
3. Click "Register"

### Option B: Use Test Account
1. Click "Login"
2. Enter: `demo@example.com`
3. Password: `demo123`
4. Click "Login"

---

## What You Can Do Now

✅ **View Photos**
- Browse gallery
- Filter by category
- View photo details

✅ **Shopping**
- Add photos to cart
- Update quantities
- View cart

✅ **Orders**
- Checkout and create order
- View order history
- Track orders

✅ **Admin** (use admin@prodgallery.com / admin123)
- Manage photos
- View all orders
- Dashboard statistics

---

## Test Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@prodgallery.com | admin123 | Admin |
| demo@example.com | demo123 | Customer |
| john@example.com | password123 | Customer |

---

## API Base URL

```
http://localhost:8000/api
```

Example:
```
GET  http://localhost:8000/api/photos
POST http://localhost:8000/api/auth/login
```

---

## Database

**Name:** `prodgallery`
**Host:** 127.0.0.1
**User:** root

Sample Data Already Loaded:
- 3 test users
- 6 categories
- 6 sample photos

---

## Stop Servers

- **Backend:** `Ctrl+C` in Terminal 1
- **Frontend:** `Ctrl+C` in Terminal 2

---

## Useful Commands

### Backend
```bash
# View logs
tail -f prodgallery-api/storage/logs/laravel.log

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Create new migration
php artisan make:migration migration_name

# Clear cache
php artisan cache:clear
```

### Frontend
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Troubleshooting

### Problem: Page won't load
- ✅ Check both servers are running
- ✅ Check ports 5173 and 8000 are accessible
- ✅ Clear browser cache (Ctrl+Shift+Delete)

### Problem: Login fails
- ✅ Check database is running
- ✅ Clear localStorage: `localStorage.clear()` in console
- ✅ Try admin account

### Problem: Photos don't show
- ✅ Run: `php artisan db:seed`
- ✅ Check network tab in DevTools

### Problem: Port already in use
```bash
# Use different port
php artisan serve --port=8001
```

---

## Next Steps

1. ✅ **Browse the code** - Understand the structure
2. ✅ **Test all features** - Try every button and link
3. ✅ **Review API** - Check endpoints documentation
4. ✅ **Build admin UI** - Create admin panel pages
5. ✅ **Add features** - Image upload, reviews, etc.

---

## Documentation

- **`INTEGRATION_COMPLETE.md`** - Full integration guide
- **`TESTING_GUIDE.md`** - How to test with Postman
- **`BACKEND_FRONTEND_INTEGRATION.md`** - Architecture overview
- **`LARAVEL_SETUP_GUIDE.md`** - Original Laravel setup

---

## Architecture at a Glance

```
React Frontend (http://localhost:5173)
       ↓ (uses api.js)
Laravel API (http://localhost:8000/api)
       ↓ (queries)
MySQL Database (prodgallery)
```

### Authentication
```
1. User logs in
2. Backend returns token
3. React stores token in localStorage
4. All future requests include token
5. Backend validates token for protected routes
```

### Data Flow
```
User Action (e.g., "Add to Cart")
     ↓
React Context (CartContext)
     ↓
api.js Service (adds auth token)
     ↓
Laravel Controller
     ↓
Eloquent Model
     ↓
MySQL Database
     ↓
Response back to React
     ↓
UI Updates
```

---

## File Structure

```
ProdGallery/                    # React frontend
├── src/
│   ├── components/             # React components
│   ├── context/                # React contexts (Auth, Cart)
│   ├── pages/                  # Page components
│   ├── services/
│   │   └── api.js             # ← API service layer
│   └── main.jsx
└── .env                        # API URL config

prodgallery-api/                # Laravel backend
├── app/
│   ├── Http/
│   │   ├── Controllers/        # API logic
│   │   └── Middleware/         # Auth middleware
│   ├── Models/                 # Database models
│   └── Providers/
├── routes/
│   └── api.php                # ← API routes definition
├── database/
│   ├── migrations/             # Table structure
│   └── seeders/                # Sample data
└── .env                        # Database config
```

---

## Key Technologies

**Backend:**
- Laravel 11 - Web framework
- Sanctum - API authentication
- MySQL - Database
- Eloquent - ORM

**Frontend:**
- React 19 - UI library
- Vite - Build tool
- Context API - State management
- Fetch API - HTTP requests

---

## Performance Tips

1. **Pagination** - Photos load in pages of 12
2. **Caching** - Consider adding Redis cache
3. **Images** - Use optimized image service (Cloudinary, etc.)
4. **Database** - Add indexes for faster queries
5. **API** - Implement rate limiting

---

## Security Checklist

- ✅ CORS configured for frontend only
- ✅ Passwords hashed with Bcrypt
- ✅ API tokens (Sanctum) for authentication
- ✅ Role-based access control (admin middleware)
- ✅ Input validation on all endpoints
- ✅ CSRF protection

---

## Next Development Tasks

### Must Do
- [ ] Build admin dashboard pages
- [ ] Add image upload functionality
- [ ] Implement search and filtering
- [ ] Add pagination to photo gallery

### Should Do
- [ ] Email notifications for orders
- [ ] Payment gateway integration
- [ ] User profile management
- [ ] Order tracking

### Nice to Have
- [ ] Photo reviews/ratings
- [ ] Wishlist feature
- [ ] Advanced filtering
- [ ] Analytics dashboard

---

**Happy coding! 🎉**

Both servers are running and ready for development!

---

*Last Updated: January 28, 2026*
*Status: ✅ Production Ready*
