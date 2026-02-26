# ProdGallery - Laravel + React E-Commerce Photography Platform

A full-stack e-commerce photography gallery with React frontend and Laravel backend API.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- PHP 8.1+
- Composer
- MySQL/MariaDB

### Frontend Setup (React)

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
# .env file should have:
VITE_API_URL=http://localhost:8000/api
```

3. **Start development server:**
```bash
npm run dev
```

React app → `http://localhost:5173`

### Backend Setup (Laravel)

📖 **See [LARAVEL_SETUP_GUIDE.md](./LARAVEL_SETUP_GUIDE.md) for complete backend setup**

**Quick commands:**
```bash
cd d:\Solvit\Project
composer create-project laravel/laravel prodgallery-api
cd prodgallery-api
composer require laravel/sanctum
php artisan migrate
php artisan serve  # → http://localhost:8000
```

## 📁 Project Structure

```
ProdGallery/
├── src/
│   ├── components/
│   │   ├── admin/          # Admin panel components
│   │   ├── common/         # Reusable UI (Button, Container, etc.)
│   │   ├── gallery/        # Photo grid, cards
│   │   └── layout/         # Navbar, Footer
│   ├── contexts/           # Auth, Cart, Orders contexts
│   ├── pages/
│   │   ├── admin/          # Dashboard, Photos, Orders, Categories
│   │   └── ...             # Public pages
│   ├── services/
│   │   └── api.js          # Complete API service layer
│   └── routes/
│       └── AppRoutes.jsx   # Route configuration with admin routes
├── .env                    # Environment variables
└── LARAVEL_SETUP_GUIDE.md  # Complete Laravel setup guide
```

## 🔐 Authentication

Laravel Sanctum with JWT tokens

### Demo Credentials

**Admin:**
- Email: `admin@prodgallery.com`
- Password: `admin123`

**Customer:**
- Email: `demo@example.com`
- Password: `demo123`

## 🎨 Features

### Customer Features
- ✅ Browse photo gallery with categories
- ✅ View photo details
- ✅ Shopping cart management
- ✅ Checkout & order placement
- ✅ Order history
- ✅ User authentication
- ✅ Contact form

### Admin Features
- ✅ Dashboard with statistics
- ✅ Photo management (CRUD)
- ✅ Order management & status updates
- ✅ Category management
- ✅ View contact messages

## 🔧 API Service Layer

All API calls are centralized in `src/services/api.js`:

```javascript
import { authAPI, photosAPI, cartAPI, ordersAPI, categoriesAPI } from './services/api';

// Example usage:
const photos = await photosAPI.getAll();
const user = await authAPI.login(email, password);
await cartAPI.addItem(photoId, quantity);
```

## 🎯 What's Included

✅ Complete API service layer with all endpoints
✅ Admin panel with dashboard, photos, orders, categories management
✅ Admin-only route protection
✅ Environment configuration (.env)
✅ Comprehensive Laravel setup guide
✅ Database migration schemas
✅ Model relationships
✅ Controller examples
✅ Middleware for admin access

## 📦 Technologies

**Frontend:**
- React 19.2.0
- React Router DOM 7.13.0
- Tailwind CSS 4.1.18
- Vite 7.2.4

**Backend (Laravel):**
- Laravel 11.x
- Laravel Sanctum
- MySQL

## 🛠️ Development Commands

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend
```bash
php artisan serve              # Start server
php artisan migrate           # Run migrations
php artisan db:seed           # Seed database
php artisan storage:link      # Link storage
```

## 📝 Next Steps

1. ✅ API service layer created
2. ✅ Admin panel components ready
3. ✅ Routes configured with admin protection
4. 🔄 Follow LARAVEL_SETUP_GUIDE.md to create backend
5. 🔄 Update React contexts to use API instead of localStorage
6. 🔄 Implement image upload in admin
7. 🔄 Test all features with real backend

## 🐛 Troubleshooting

**CORS Issues:** Check Laravel `config/cors.php` allows frontend URL

**Auth Issues:** Verify Sanctum configuration and Bearer token in requests

**Database:** Ensure MySQL running with correct credentials in `.env`

## 📖 Documentation

- [LARAVEL_SETUP_GUIDE.md](./LARAVEL_SETUP_GUIDE.md) - Complete backend setup
- API endpoints documentation in setup guide
- Database schema in migration files

---

**Ready for Laravel integration!** Follow the setup guide to complete the backend.
