# Quick Testing Guide - ProdGallery API

## Test Accounts

### Admin Account
- **Email:** admin@prodgallery.com
- **Password:** admin123
- **Role:** admin

### Customer Account
- **Email:** demo@example.com
- **Password:** demo123
- **Role:** customer

### Additional Test Account
- **Email:** john@example.com
- **Password:** password123
- **Role:** customer

## 1. Testing with Thunder Client (VS Code)

### Step 1: Login and Get Token
**Request:**
```
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "demo@example.com",
  "password": "demo123"
}
```

**Expected Response:**
```json
{
  "user": {
    "id": 2,
    "name": "Demo User",
    "email": "demo@example.com",
    "role": "customer",
    ...
  },
  "token": "1|your_access_token_here"
}
```

### Step 2: Get All Photos
**Request:**
```
GET http://localhost:8000/api/photos
Content-Type: application/json
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Mountain Sunrise",
      "description": "Beautiful mountain landscape...",
      "category_id": 5,
      "price": "49.99",
      "image": "https://via.placeholder.com/...",
      "featured": true,
      ...
    }
  ],
  "meta": { ... pagination ... }
}
```

### Step 3: Add to Cart (with token)
**Request:**
```
POST http://localhost:8000/api/cart/add
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "photo_id": 1,
  "quantity": 1
}
```

### Step 4: View Cart
**Request:**
```
GET http://localhost:8000/api/cart
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN
```

### Step 5: Create Order
**Request:**
```
POST http://localhost:8000/api/orders
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "payment_method": "credit_card",
  "shipping_address": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zip": "62701",
    "country": "USA"
  },
  "billing_address": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zip": "62701",
    "country": "USA"
  }
}
```

## 2. Testing in React Frontend

### Register New User
1. Go to http://localhost:5173
2. Click "Register"
3. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@example.com
   - Password: mypassword123
4. Click "Register" button
5. You should be logged in and redirected to home page

### Login
1. Click "Login" (or visit login page)
2. Enter credentials:
   - Email: demo@example.com
   - Password: demo123
3. Click "Login" button
4. You should see "Welcome, Demo User"

### Add to Cart
1. Browse gallery page
2. Click on any photo
3. Click "Add to Cart" button
4. Quantity should increase in cart icon (top right)

### View Cart
1. Click cart icon in top navigation
2. You should see all items in your cart
3. You can update quantities or remove items

### Checkout
1. In cart, click "Checkout"
2. Fill in shipping address
3. Select payment method
4. Click "Place Order"
5. You should see order confirmation with order number

### View Orders
1. Click "My Orders" in user menu
2. You should see all your orders
3. Click on an order to see details

## 3. Testing Admin Features

### Login as Admin
1. Go to http://localhost:5173
2. Login with:
   - Email: admin@prodgallery.com
   - Password: admin123

### Access Admin Panel
1. After login as admin, click "Admin Dashboard" (in menu if implemented)
2. You should see:
   - Total photos count
   - Total orders count
   - Total revenue
   - Total customers
   - Recent orders list

### Manage Photos (Admin)
API Endpoint: `POST /api/admin/photos`
```json
{
  "title": "New Photo",
  "description": "Description here",
  "category_id": 1,
  "price": 29.99,
  "image": "https://example.com/image.jpg",
  "photographer": "John Doe",
  "width": 3000,
  "height": 2000,
  "featured": false,
  "is_active": true
}
```

### Manage Orders (Admin)
API Endpoint: `PUT /api/admin/orders/{order_id}/status`
```json
{
  "status": "processing"
}
```
Valid statuses: `pending`, `processing`, `completed`, `cancelled`

## 4. Using Postman

1. Install Postman (or use web version)
2. Create a new collection called "ProdGallery"
3. Add requests for:
   - Login
   - Get Photos
   - Get Categories
   - Add to Cart
   - Create Order
   - Get Orders

4. Use Postman's environment variables to store:
   ```
   base_url = http://localhost:8000/api
   token = (paste token from login response)
   ```

5. Use `{{base_url}}` and `{{token}}` in request URLs and headers

## 5. Common Issues & Solutions

### Issue: CORS Error
**Solution:**
- Restart Laravel server: `php artisan serve`
- Check both servers are running
- Clear browser cache (Ctrl+Shift+Delete)

### Issue: 401 Unauthorized
**Solution:**
- Token might be expired or invalid
- Login again to get new token
- Make sure Authorization header is present

### Issue: 404 Not Found
**Solution:**
- Check endpoint URL spelling
- Make sure API endpoint exists
- Verify request method (GET, POST, etc.)

### Issue: Photos not showing
**Solution:**
- Run migrations: `php artisan migrate`
- Seed database: `php artisan db:seed`
- Check photos are marked as `is_active = true`

### Issue: Cart not syncing
**Solution:**
- Make sure user is authenticated (has token)
- Check Authorization header is being sent
- Verify cart items in database: `SELECT * FROM carts;`

## Database Checks

### Check Users
```sql
SELECT id, name, email, role FROM users;
```

### Check Photos
```sql
SELECT id, title, price, category_id, is_active FROM photos;
```

### Check Categories
```sql
SELECT id, name, slug FROM categories;
```

### Check Cart Items
```sql
SELECT c.*, p.title, p.price FROM carts c 
JOIN photos p ON c.photo_id = p.id;
```

### Check Orders
```sql
SELECT o.*, u.name, u.email FROM orders o 
JOIN users u ON o.user_id = u.id;
```

## Performance Tips

1. **Pagination:** Photos endpoint returns paginated results (12 per page)
   ```
   GET /api/photos?page=2
   ```

2. **Filtering:** Filter photos by category
   ```
   GET /api/photos?category=nature
   ```

3. **Featured Photos:** Get only featured photos
   ```
   GET /api/photos?featured=true
   ```

4. **Relationships:** APIs automatically load related data
   - Photos include category data
   - Orders include items and photos
   - Cart items include photo details

---

**Happy Testing!** 🚀
