# ProdGallery - Quick Start Guide

## 🚀 Features Overview

Your ProdGallery e-commerce application now includes:

### ✅ Complete Authentication System
- User registration and login
- Protected shopping features (cart, checkout, orders)
- User profile with logout
- Public browsing without login
- Session persistence

### ✅ Shopping Features
- Browse photo gallery
- Add photos to cart (requires login)
- Shopping cart management
- Checkout with payment methods
- Discount/coupon system
- Order history and tracking

### ✅ User Experience
- Responsive mobile-first design
- Professional navbar with user menu
- Product details with related items
- Order tracking with visual progress
- Intuitive navigation

---

## 📱 How to Use

### For Guests (No Login)
1. **Browse Gallery** → Click "Gallery" in navbar
2. **View Product Details** → Click on any photo
3. **See About Us** → Click "About" in navbar
4. **View Services** → Click "Services" in navbar
5. **Contact** → Click "Contact" in navbar

### For Shopping (Requires Login)
1. **Create Account** → Click "Sign Up" in navbar
   - Fill in name, email, password
   - Account created and logged in automatically
   
2. **OR Login** → Click "Login" in navbar
   - Demo email: demo@example.com
   - Demo password: password123

3. **Add to Cart** → Go to product and click "Add to Cart"
   - Only visible when logged in
   
4. **View Cart** → Click "Cart" button in navbar
   - Manage quantities and remove items
   
5. **Checkout** → Click "Proceed to Checkout"
   - Enter shipping info
   - Choose payment method
   - Apply coupon (SAVE10, SAVE20, WELCOME15, FIRST50)
   - Complete purchase
   
6. **View Orders** → Click "Orders" in navbar
   - See order history
   - Click order to see details
   - Track order status

### Logout
- Click profile dropdown (shows your name)
- Click "Logout"
- Redirects to home page

---

## 🎟️ Test Coupons

Use these codes at checkout for discounts:
- **SAVE10** → 10% off
- **SAVE20** → 20% off
- **WELCOME15** → 15% off
- **FIRST50** → $50 off

---

## 💡 Key Routes

| Route | Purpose | Requires Login |
|-------|---------|----------------|
| `/` | Home page | ❌ No |
| `/gallery` | Photo gallery | ❌ No |
| `/photo/:id` | Product details | ❌ No |
| `/about` | About page | ❌ No |
| `/services` | Services page | ❌ No |
| `/contact` | Contact page | ❌ No |
| `/login` | User login | ❌ No |
| `/register` | Create account | ❌ No |
| `/cart` | Shopping cart | ✅ Yes |
| `/checkout` | Payment page | ✅ Yes |
| `/orders` | Order history | ✅ Yes |
| `/order/:id` | Order details | ✅ Yes |

---

## 🔐 Authentication

### Login
```
Email: any email address
Password: any password (minimum 6 characters)
```

### Register
```
First Name: your first name
Last Name: your last name
Email: your email address
Password: minimum 6 characters
Confirm Password: must match password
```

---

## 🛒 Shopping Process Flow

```
Gallery → Photo Details → Login (if needed) → Add to Cart 
→ Cart → Checkout → Payment → Confirmation → Orders
```

---

## 📧 Demo Account

**For Testing Without Creating Account:**
- Email: `demo@example.com`
- Password: `password123`

---

## 🎨 Customization Tips

### Colors
- Primary: Indigo-600 (`#4f46e5`)
- Secondary: Purple/Gray palette
- Find in: Tailwind CSS classes

### Logo
- Located: `/src/assets/logo/prodgallery-logo.jpeg`
- Update navbar/footer images if needed

### Product Data
- Located: `/src/data/photos.js`
- Add/edit photos here

### Payment Methods
- Card
- Mobile Money
- Bank Transfer
(Currently simulated - ready for real payment gateway)

---

## 🐛 Troubleshooting

### Can't see "Add to Cart" button
→ Not logged in. Click "Login" in navbar first.

### Cart shows as empty after logout
→ Normal behavior. Login again to access your cart.

### Can't access Orders page
→ Login required. Click "Login" in navbar.

### Demo account not working
→ Use any email/password combination. All credentials work in demo mode.

---

## 📦 Technology Stack

- **React 19.2.0** - Frontend framework
- **React Router 7.13.0** - Navigation
- **Tailwind CSS 4.1.18** - Styling
- **Vite 7.2.4** - Build tool
- **localStorage** - Data persistence

---

## 📞 Support

For issues or questions:
1. Check routes match your navigation
2. Verify login is working
3. Clear browser cache if needed
4. Check browser console for errors

---

**Status:** ✅ Fully Operational  
**Last Updated:** Today  
**Version:** 2.0.0 (with Authentication)
