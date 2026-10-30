<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('photographer_bio')->nullable();
            $table->string('photographer_avatar')->nullable();
            $table->string('photographer_website')->nullable();
            $table->json('photographer_social_links')->nullable();
            $table->timestamp('photographer_verified_at')->nullable();
            $table->boolean('is_suspended')->default(false)->index();
        });

        Schema::table('photos', function (Blueprint $table) {
            $table->foreignId('photographer_id')->nullable()->after('photographer')->constrained('users')->nullOnDelete();
            $table->json('tags')->nullable();
            $table->string('file_format', 20)->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->unsignedBigInteger('views_count')->default(0);
            $table->unsignedBigInteger('downloads_count')->default(0);
            $table->string('moderation_status', 20)->default('approved')->index();
            $table->boolean('copyright_confirmed')->default(false);
            $table->timestamp('published_at')->nullable()->index();
        });
    }

    public function down(): void
    {
        Schema::table('photos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('photographer_id');
            $table->dropColumn(['tags', 'file_format', 'file_size', 'views_count', 'downloads_count', 'moderation_status', 'copyright_confirmed', 'published_at']);
        });
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['photographer_bio', 'photographer_avatar', 'photographer_website', 'photographer_social_links', 'photographer_verified_at', 'is_suspended']);
        });
    }
};
