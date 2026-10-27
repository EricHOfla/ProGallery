import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ordersAPI } from "../../services/api";
import { resolveImageUrl } from "../../utils/image";

export default function AdminOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await ordersAPI.getAdminOrderById(orderId);
        setOrder(data);
      } catch (err) {
        setError(err.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleStatusChange = async (newStatus) => {
    setError(null);
    setActionNotice("");
    try {
      const updated = await ordersAPI.updateStatus(orderId, newStatus);
      setOrder((current) => ({ ...current, ...(updated || {}), status: newStatus }));
      setActionNotice("Order status updated.");
    } catch (err) {
      setError(err?.message || "Failed to update order status.");
    }
  };

  const handleRefund = async () => {
    if (!window.confirm("Submit a full refund to Stripe for this order? This action cannot be undone here.")) return;
    setActionLoading(true);
    setError(null);
    setActionNotice("");
    try {
      const result = await ordersAPI.refund(orderId);
      setOrder((current) => ({ ...current, ...(result.order || {}) }));
      setActionNotice(result.message || "Refund submitted to Stripe.");
    } catch (err) {
      setError(err?.message || "Refund could not be submitted. Check Stripe before retrying.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-4 w-32 bg-gray-200 rounded mb-6 animate-pulse" />

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-gray-200 to-gray-100 px-6 py-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="h-8 w-40 bg-gray-300 rounded mb-2 animate-pulse" />
                  <div className="h-4 w-32 bg-gray-300 rounded animate-pulse" />
                </div>
                <div className="h-8 w-28 bg-gray-300 rounded-full animate-pulse" />
              </div>
            </div>

            <div className="p-6 space-y-8">
              <div className="border rounded-lg p-4">
                <div className="h-5 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: 4 }, (_, index) => (
                    <div key={`status-${index}`} className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="h-5 w-48 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-56 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="h-5 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="h-24 w-full bg-gray-100 rounded animate-pulse" />
              </div>

              <div className="border rounded-lg p-4">
                <div className="h-5 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="h-5 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error || "Order not found"}
          </div>
          <button
            onClick={() => navigate("/admin/orders")}
            className="text-emerald-600 hover:text-emerald-700"
          >
            ← Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/admin/orders")}
          className="mb-6 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          ← Back to Orders
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{order.order_number}</h1>
                <p className="text-emerald-100 mt-1">
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full font-semibold ${statusColor[order.status]}`}>
                {order.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Status Update */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-bold mb-4">Update Status</h2>
              <div className="flex gap-2 flex-wrap">
                {["pending", "processing", "completed", "cancelled"].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-4 py-2 rounded-lg font-medium capitalize ${
                      order.status === status
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>}
            {actionNotice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{actionNotice}</div>}

            {/* Payment and refund controls */}
            <div className="border rounded-lg p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold">Payment & refunds</h2>
                  <p className="mt-2 text-sm text-gray-600">Payment status: <strong className="capitalize">{String(order.payment_status || "pending").replaceAll("_", " ")}</strong></p>
                  {order.paid_at && <p className="mt-1 text-sm text-gray-500">Paid on {new Date(order.paid_at).toLocaleString()}</p>}
                  {order.refunded_at && <p className="mt-1 text-sm text-gray-500">Refund submitted on {new Date(order.refunded_at).toLocaleString()}</p>}
                  {order.stripe_refund_id && <p className="mt-1 break-all text-xs text-gray-500">Stripe refund: {order.stripe_refund_id}</p>}
                </div>
                <button type="button" onClick={handleRefund} disabled={actionLoading || order.payment_status !== "paid" || !order.payment_intent_id || Boolean(order.stripe_refund_id)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50">
                  {actionLoading ? "Submitting refund…" : order.payment_status === "refunded" ? "Refunded" : "Issue full refund"}
                </button>
              </div>
              <p className="mt-3 text-xs leading-5 text-gray-500">Refunds are sent to Stripe and are available only for confirmed payments with a payment intent. Confirm the refund status in Stripe if the provider reports a pending result.</p>
            </div>

            {/* Customer Info */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-bold mb-4">Customer Information</h2>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Name:</strong> {order.user ? `${order.user.first_name} ${order.user.last_name}` : order.user?.name || "N/A"}
                </p>
                <p className="text-gray-700">
                  <strong>Email:</strong> {order.user?.email || "N/A"}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-bold mb-4">Order Items</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-2">Photo</th>
                      <th className="text-left px-4 py-2">Price</th>
                      <th className="text-left px-4 py-2">Quantity</th>
                      <th className="text-right px-4 py-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {item.photo?.image && (
                              <img
                                src={resolveImageUrl(item.photo.image)}
                                alt={item.photo?.title || "Order item"}
                                className="h-10 w-10 rounded object-cover"
                              />
                            )}
                            <span>{item.photo?.title || "N/A"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">${parseFloat(item.price).toFixed(2)}</td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="text-right px-4 py-3 font-semibold">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-bold mb-4">Shipping Address</h2>
              <div className="space-y-2 text-gray-700">
                <p>
                  {order.shipping_address?.first_name} {order.shipping_address?.last_name}
                </p>
                <p>{order.shipping_address?.address}</p>
                <p>
                  {order.shipping_address?.city}, {order.shipping_address?.zip_code}
                </p>
                <p>{order.shipping_address?.country}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-bold text-emerald-600">
                    ${parseFloat(order.total_amount).toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  <strong>Payment Method:</strong> {order.payment_method}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
