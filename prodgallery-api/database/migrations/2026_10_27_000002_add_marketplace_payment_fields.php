<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_status')->default('pending')->index();
            $table->string('payment_provider_session_id')->nullable()->unique();
            $table->string('payment_intent_id')->nullable()->index();
            $table->timestamp('paid_at')->nullable();
        });

        Schema::table('carts', function (Blueprint $table) {
            $table->string('license_type', 20)->default('personal');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->string('license_type', 20)->default('personal');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', fn (Blueprint $table) => $table->dropColumn('license_type'));
        Schema::table('carts', fn (Blueprint $table) => $table->dropColumn('license_type'));
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['payment_provider_session_id']);
            $table->dropIndex(['payment_status']);
            $table->dropIndex(['payment_intent_id']);
            $table->dropColumn(['payment_status', 'payment_provider_session_id', 'payment_intent_id', 'paid_at']);
        });
    }
};
