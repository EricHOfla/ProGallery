# Laravel Backend Setup Guide for ProdGallery

This guide will help you set up a Laravel backend with MySQL database for the ProdGallery React project.

## Prerequisites

- PHP 8.1 or higher
- Composer
- MySQL/MariaDB
- Node.js and npm (already installed)

## Step 1: Create Laravel Project

```bash
# Navigate to your project directory
cd d:\Solvit\Project

# Create Laravel project (name it 'prodgallery-api')
composer create-project laravel/laravel prodgallery-api

# Navigate to Laravel project
cd prodgallery-api
```

## Step 2: Database Configuration

1. Create a MySQL database named `prodgallery`

2. Update `.env` file in Laravel project:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=prodgallery
DB_USERNAME=root
DB_PASSWORD=your_password
```

3. Configure CORS in `.env`:
```env
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
```

## Step 3: Install Laravel Sanctum (for authentication)

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

## Step 4: Configure CORS

Edit `config/cors.php`:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

## Step 5: Create Database Migrations

```bash
# Users table is already created by Laravel

# Photos table
php artisan make:migration create_photos_table

# Categories table
php artisan make:migration create_categories_table

# Cart table
php artisan make:migration create_carts_table

# Orders table
php artisan make:migration create_orders_table

# Order items table
php artisan make:migration create_order_items_table

# Contact messages table
php artisan make:migration create_contact_messages_table
```

### Migration Files Content

#### `database/migrations/xxxx_create_categories_table.php`
```php
public function up()
{
    Schema::create('categories', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('slug')->unique();
        $table->text('description')->nullable();
        $table->timestamps();
    });
}
```

#### `database/migrations/xxxx_create_photos_table.php`
```php
public function up()
{
    Schema::create('photos', function (Blueprint $table) {
        $table->id();
        $table->string('title');
        $table->text('description')->nullable();
        $table->foreignId('category_id')->constrained()->onDelete('cascade');
        $table->decimal('price', 10, 2);
        $table->string('image');
        $table->string('photographer')->nullable();
        $table->integer('width')->nullable();
        $table->integer('height')->nullable();
        $table->boolean('featured')->default(false);
        $table->boolean('is_active')->default(true);
        $table->timestamps();
    });
}
```

#### `database/migrations/xxxx_create_carts_table.php`
```php
public function up()
{
    Schema::create('carts', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->foreignId('photo_id')->constrained()->onDelete('cascade');
        $table->integer('quantity')->default(1);
        $table->timestamps();
    });
}
```

#### `database/migrations/xxxx_create_orders_table.php`
```php
public function up()
{
    Schema::create('orders', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('order_number')->unique();
        $table->decimal('total_amount', 10, 2);
        $table->string('status')->default('pending'); // pending, processing, completed, cancelled
        $table->string('payment_method');
        $table->json('shipping_address');
        $table->json('billing_address')->nullable();
        $table->text('notes')->nullable();
        $table->timestamps();
    });
}
```

#### `database/migrations/xxxx_create_order_items_table.php`
```php
public function up()
{
    Schema::create('order_items', function (Blueprint $table) {
        $table->id();
        $table->foreignId('order_id')->constrained()->onDelete('cascade');
        $table->foreignId('photo_id')->constrained()->onDelete('cascade');
        $table->integer('quantity');
        $table->decimal('price', 10, 2);
        $table->timestamps();
    });
}
```

#### `database/migrations/xxxx_create_contact_messages_table.php`
```php
public function up()
{
    Schema::create('contact_messages', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email');
        $table->string('subject');
        $table->text('message');
        $table->boolean('is_read')->default(false);
        $table->timestamps();
    });
}
```

#### Update `users` table migration to add role:
```bash
php artisan make:migration add_role_to_users_table
```

```php
public function up()
{
    Schema::table('users', function (Blueprint $table) {
        $table->string('role')->default('customer'); // admin, customer
    });
}
```

## Step 6: Run Migrations

```bash
php artisan migrate
```

## Step 7: Create Models

```bash
php artisan make:model Category
php artisan make:model Photo
php artisan make:model Cart
php artisan make:model Order
php artisan make:model OrderItem
php artisan make:model ContactMessage
```

### Model Files

#### `app/Models/Category.php`
```php
protected $fillable = ['name', 'slug', 'description'];

public function photos()
{
    return $this->hasMany(Photo::class);
}
```

#### `app/Models/Photo.php`
```php
protected $fillable = [
    'title', 'description', 'category_id', 'price', 'image',
    'photographer', 'width', 'height', 'featured', 'is_active'
];

protected $casts = [
    'price' => 'decimal:2',
    'featured' => 'boolean',
    'is_active' => 'boolean',
];

public function category()
{
    return $this->belongsTo(Category::class);
}
```

#### `app/Models/Cart.php`
```php
protected $fillable = ['user_id', 'photo_id', 'quantity'];

public function user()
{
    return $this->belongsTo(User::class);
}

public function photo()
{
    return $this->belongsTo(Photo::class);
}
```

#### `app/Models/Order.php`
```php
protected $fillable = [
    'user_id', 'order_number', 'total_amount', 'status',
    'payment_method', 'shipping_address', 'billing_address', 'notes'
];

protected $casts = [
    'shipping_address' => 'array',
    'billing_address' => 'array',
    'total_amount' => 'decimal:2',
];

public function user()
{
    return $this->belongsTo(User::class);
}

public function items()
{
    return $this->hasMany(OrderItem::class);
}
```

#### `app/Models/OrderItem.php`
```php
protected $fillable = ['order_id', 'photo_id', 'quantity', 'price'];

protected $casts = [
    'price' => 'decimal:2',
];

public function order()
{
    return $this->belongsTo(Order::class);
}

public function photo()
{
    return $this->belongsTo(Photo::class);
}
```

## Step 8: Create Controllers

```bash
php artisan make:controller Api/AuthController
php artisan make:controller Api/PhotoController
php artisan make:controller Api/CartController
php artisan make:controller Api/OrderController
php artisan make:controller Api/CategoryController
php artisan make:controller Api/ContactController
php artisan make:controller Admin/PhotoController
php artisan make:controller Admin/OrderController
php artisan make:controller Admin/CategoryController
php artisan make:controller Admin/DashboardController
```

### Controller Examples

#### `app/Http/Controllers/Api/AuthController.php`
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $request->first_name . ' ' . $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'customer',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
```

#### `app/Http/Controllers/Api/PhotoController.php`
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Photo;
use Illuminate\Http\Request;

class PhotoController extends Controller
{
    public function index(Request $request)
    {
        $query = Photo::with('category')->where('is_active', true);

        if ($request->has('category')) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        if ($request->has('featured')) {
            $query->where('featured', true);
        }

        $photos = $query->orderBy('created_at', 'desc')->get();

        return response()->json($photos);
    }

    public function show($id)
    {
        $photo = Photo::with('category')->findOrFail($id);
        return response()->json($photo);
    }
}
```

## Step 9: Create API Routes

Edit `routes/api.php`:

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PhotoController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Admin\PhotoController as AdminPhotoController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\DashboardController;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/photos', [PhotoController::class, 'index']);
Route::get('/photos/{id}', [PhotoController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::post('/contact', [ContactController::class, 'store']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    
    // Cart routes
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::put('/cart/update/{id}', [CartController::class, 'update']);
    Route::delete('/cart/remove/{id}', [CartController::class, 'remove']);
    Route::delete('/cart/clear', [CartController::class, 'clear']);
    
    // Order routes
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);
    
    // Admin routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
        
        // Photos management
        Route::get('/photos', [AdminPhotoController::class, 'index']);
        Route::post('/photos', [AdminPhotoController::class, 'store']);
        Route::put('/photos/{id}', [AdminPhotoController::class, 'update']);
        Route::delete('/photos/{id}', [AdminPhotoController::class, 'destroy']);
        
        // Orders management
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
        
        // Categories management
        Route::post('/categories', [AdminCategoryController::class, 'store']);
        Route::put('/categories/{id}', [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy']);
    });
});
```

## Step 10: Create Admin Middleware

```bash
php artisan make:middleware AdminMiddleware
```

Edit `app/Http/Middleware/AdminMiddleware.php`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $next($request);
    }
}
```

Register middleware in `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'admin' => \App\Http\Middleware\AdminMiddleware::class,
    ]);
})
```

## Step 11: Seed Database with Sample Data

```bash
php artisan make:seeder CategorySeeder
php artisan make:seeder PhotoSeeder
php artisan make:seeder UserSeeder
```

### Create Seeders

#### `database/seeders/UserSeeder.php`
```php
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@prodgallery.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);

        // Demo customer
        User::create([
            'name' => 'Demo User',
            'email' => 'demo@example.com',
            'password' => Hash::make('demo123'),
            'role' => 'customer',
        ]);
    }
}
```

#### `database/seeders/CategorySeeder.php`
```php
<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            ['name' => 'Products', 'slug' => 'products', 'description' => 'Product photography'],
            ['name' => 'Fashion', 'slug' => 'fashion', 'description' => 'Fashion photography'],
            ['name' => 'Food', 'slug' => 'food', 'description' => 'Food photography'],
            ['name' => 'Lifestyle', 'slug' => 'lifestyle', 'description' => 'Lifestyle photography'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
```

Run seeders:
```bash
php artisan db:seed --class=UserSeeder
php artisan db:seed --class=CategorySeeder
```

## Step 12: Start Laravel Server

```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

## Step 13: Test API Endpoints

You can use Postman or Thunder Client (VS Code extension) to test:

- POST `http://localhost:8000/api/auth/register`
- POST `http://localhost:8000/api/auth/login`
- GET `http://localhost:8000/api/photos`
- GET `http://localhost:8000/api/categories`

## Next Steps

1. **Start Laravel server**: `php artisan serve`
2. **Start React dev server**: `npm run dev` (in ProdGallery folder)
3. **Update React contexts** to use the new API service
4. **Create admin panel** in React with routes for:
   - Dashboard
   - Photos management (CRUD)
   - Orders management
   - Categories management
   - Users management

## Admin Panel Features to Implement

- **Dashboard**: Statistics (total photos, orders, revenue, users)
- **Photos Management**: Add/Edit/Delete photos with image upload
- **Orders Management**: View all orders, update status
- **Categories Management**: Add/Edit/Delete categories
- **Users Management**: View users, change roles

## File Upload Configuration

For image uploads, you'll need to:

1. Create storage link:
```bash
php artisan storage:link
```

2. Configure file upload in controller
3. Use FormData in React for file uploads

Would you like me to create the admin panel components next?
