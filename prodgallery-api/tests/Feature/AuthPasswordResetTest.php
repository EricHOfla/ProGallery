<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthPasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_never_returns_a_reset_token_in_the_api_response(): void
    {
        $this->postJson('/api/auth/forgot-password', [
            'email' => 'unknown@example.com',
        ])
            ->assertOk()
            ->assertJsonMissingPath('reset_token')
            ->assertJsonMissingPath('token')
            ->assertJsonPath('message', 'If an account exists with this email, password reset instructions will be sent.');
    }
}
