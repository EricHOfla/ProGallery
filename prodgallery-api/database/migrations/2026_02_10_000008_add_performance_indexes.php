<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('photos', function (Blueprint $table) {
            $table->index(['is_active', 'created_at'], 'photos_is_active_created_at_idx');
            $table->index(['featured', 'is_active'], 'photos_featured_is_active_idx');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->index(['user_id', 'created_at'], 'orders_user_created_at_idx');
            $table->index(['status', 'created_at'], 'orders_status_created_at_idx');
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->index(['user_id', 'photo_id'], 'carts_user_photo_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('photos', function (Blueprint $table) {
            $table->dropIndex('photos_is_active_created_at_idx');
            $table->dropIndex('photos_featured_is_active_idx');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_user_created_at_idx');
            $table->dropIndex('orders_status_created_at_idx');
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->dropIndex('carts_user_photo_idx');
        });
    }
};
