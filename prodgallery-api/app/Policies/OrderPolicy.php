<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /**
     * Determine if the user can view any orders.
     */
    public function viewAny(User $user): bool
    {
        return true; // Users can view their own orders list
    }

    /**
     * Determine if the user can view the order.
     */
    public function view(User $user, Order $order): bool
    {
        // Users can only view their own orders
        // Admins can view any order
        return $user->id === $order->user_id || $user->role === 'admin';
    }

    /**
     * Determine if the user can update the order.
     */
    public function update(User $user, Order $order): bool
    {
        // Only admins can update orders
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can delete the order.
     */
    public function delete(User $user, Order $order): bool
    {
        // Only admins can delete orders
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can download the order invoice.
     */
    public function downloadInvoice(User $user, Order $order): bool
    {
        // Users can only download invoices for their own completed orders
        return $user->id === $order->user_id && $order->status === 'completed';
    }

    /**
     * Determine if the user can download order images.
     */
    public function downloadImages(User $user, Order $order): bool
    {
        // Users can only download images for their own completed orders
        return $user->id === $order->user_id && $order->status === 'completed';
    }
}
