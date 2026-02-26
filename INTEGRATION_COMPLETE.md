# ProdGallery - Backend & Frontend Integration Guide

## ✅ Setup Completed!

Your Laravel backend and React frontend are now fully integrated and ready to use.

## Running the Application

### 1. Start Laravel Backend
```bash
cd d:\Solvit\Project\ProdGallery1\prodgallery-api
php artisan serve
```
The API will run at: **http://localhost:8000**

### 2. Start React Frontend
```bash
cd d:\Solvit\Project\ProdGallery1\ProdGallery
npm run dev
```
The frontend will run at: **http://localhost:5173**

## 📋 What Has Been Set Up

### Backend (Laravel)
✅ Database migrations created for:
- Categories
- Photos
- Carts
- Orders
- Order Items
- Contact Messages
- Users (with role field)

✅ Eloquent Models created:
- User (with relations to Cart and Order)
- Category
- Photo
- Cart
- Order
- OrderItem
- ContactMessage

✅ API Controllers:
- **AuthController** - Register, Login, Logout, Get User
- **PhotoController** - List and show photos
- **CategoryController** - List categories
- **CartController** - Cart management
- **OrderController** - Order management
- **ContactController** - Contact form submission

✅ Admin Controllers:
- **Admin\PhotoController** - CRUD for photos
- **Admin\CategoryController** - CRUD for categories
- **Admin\OrderController** - Order status management
- **Admin\DashboardController** - Dashboard statistics

✅ Authentication & Security:
- Laravel Sanctum installed for API token authentication
- Admin middleware for role-based access control
- CORS configured for frontend communication

✅ Database:
- Test users created:
  - Admin: `admin@prodgallery.com` / `admin123`
  - Customer: `demo@example.com` / `demo123`
  - John: `john@example.com` / `password123`
- Sample categories and photos seeded

### Frontend (React)
✅ API Service Layer Updated:
- `api.js` with full API integration
- Auth methods connected to Laravel API
- Photo, Category, Cart, and Order APIs
- Proper error handling and token management

✅ Context Providers Updated:
- **AuthContext** - Real authentication with Laravel API
- **CartContext** - Synced with backend for authenticated users
- Token-based requests with Authorization headers

## 🔗 API Endpoints

### Public Endpoints
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
GET    /api/photos                 - Get all photos
GET    /api/photos/{id}            - Get single photo
GET    /api/categories             - Get all categories
GET    /api/categories/{id}        - Get category with photos
POST   /api/contact                - Submit contact message
```

### Protected Endpoints (Requires Authentication)
```
POST   /api/auth/logout            - Logout user
GET    /api/auth/user              - Get current user
GET    /api/cart                   - Get user's cart
POST   /api/cart/add               - Add item to cart
PUT    /api/cart/update/{id}       - Update cart item quantity
DELETE /api/cart/remove/{id}       - Remove from cart
DELETE /api/cart/clear             - Clear entire cart
GET    /api/orders                 - Get user's orders
GET    /api/orders/{id}            - Get order details
POST   /api/orders                 - Create new order
```

### Admin Endpoints (Requires admin role)
```
GET    /api/admin/dashboard        - Dashboard statistics
GET    /api/admin/photos           - Get all photos
POST   /api/admin/photos           - Create new photo
PUT    /api/admin/photos/{id}      - Update photo
DELETE /api/admin/photos/{id}      - Delete photo
GET    /api/admin/orders           - Get all orders
PUT    /api/admin/orders/{id}/status - Update order status
POST   /api/admin/categories       - Create category
PUT    /api/admin/categories/{id}  - Update category
DELETE /api/admin/categories/{id}  - Delete category
```

## 🧪 Testing the Integration

### 1. Test Authentication
```bash
# In your browser or API client, POST to:
http://localhost:8000/api/auth/login

# Body:
{
  "email": "demo@example.com",
  "password": "demo123"
}

# You'll get back:
{
  "user": { ... user data ... },
  "token": "your_access_token"
}
```

### 2. Test Photos API
```bash
# GET all photos
http://localhost:8000/api/photos

# GET single photo
http://localhost:8000/api/photos/1

# GET by category
http://localhost:8000/api/photos?category=nature
```

### 3. Test Protected Endpoints
Add header to requests:
```
Authorization: Bearer <your_token>
```

### 4. Test in React Application
Visit: http://localhost:5173
- Register new account
- Login with credentials
- Add photos to cart
- Create orders
- View order history

## 🗄️ Database

**Database Name:** `prodgallery`
**Connection:** MySQL (local)
**Host:** 127.0.0.1
**Port:** 3306
**Username:** root
**Password:** (as configured in .env)

### Database Tables
- users (with role field)
- categories
- photos
- carts
- orders
- order_items
- contact_messages
- personal_access_tokens (Sanctum)

## 📝 Configuration Files

### Backend
- `.env` - Database and app configuration
- `config/cors.php` - CORS settings for React frontend
- `bootstrap/app.php` - Middleware registration
- `routes/api.php` - API route definitions

### Frontend
- `.env` - API URL configuration
- `src/services/api.js` - API service layer
- `src/context/AuthContext.jsx` - Authentication context
- `src/context/CartContext.jsx` - Cart management context

## 🚀 Next Steps

### 1. Image Upload
To enable photo uploads:
```bash
php artisan storage:link
```
Update the Photo model and controller to handle file uploads.

### 2. Payment Integration
Integrate payment gateway (Stripe, PayPal) in the checkout flow.

### 3. Email Notifications
Configure mail settings in `.env` for order confirmations.

### 4. Admin Panel
Build admin dashboard pages in React to manage:
- Photos (CRUD)
- Categories (CRUD)
- Orders
- Users
- Statistics

### 5. Additional Features
- Search and filtering
- Photo reviews/ratings
- Wishlist functionality
- Order tracking
- Email notifications

## 🐛 Troubleshooting

### CORS Errors
If you see CORS errors, ensure:
1. `FRONTEND_URL=http://localhost:5173` in `.env`
2. Laravel server is running on port 8000
3. React server is running on port 5173

### Authentication Issues
- Clear browser localStorage: `localStorage.clear()`
- Check browser console for error messages
- Verify token is being sent in request headers

### Database Errors
- Ensure MySQL is running
- Check database credentials in `.env`
- Run: `php artisan migrate --seed` to reset database

### Port Already in Use
If port 8000 is busy:
```bash
php artisan serve --port=8001
```

## 📚 File Structure

```
ProdGallery/                  # React Frontend
├── src/
│   ├── services/api.js       # API service layer
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   └── pages/
└── .env

prodgallery-api/              # Laravel Backend
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   ├── Controllers/Admin/
│   │   └── Middleware/AdminMiddleware.php
│   └── Models/
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/api.php
├── config/cors.php
└── .env
```

## 📞 Support

For issues or questions:
1. Check error messages in browser console
2. Check Laravel logs: `storage/logs/`
3. Verify both servers are running
4. Test endpoints with Postman/Insomnia

---

**Status:** ✅ Backend and Frontend Integration Complete
**Last Updated:** January 28, 2026
