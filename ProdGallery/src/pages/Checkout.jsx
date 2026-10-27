import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../components/common/Container";
import Button from "../components/common/Button";
import SectionTitle from "../components/common/SectionTitle";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();
  const { createOrder } = useOrders();
  const { isAuthenticated } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState("card");
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderItemCount, setOrderItemCount] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getSubtotal = () => getTotalPrice();
  const getTax = () => 0;
  const getDiscount = () => 0;
  const getTotal = () => getSubtotal();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setSubmitError("Please complete your name and email before placing the order.");
      return;
    }
    setSubmitting(true);
    try {
      const orderData = {
        items: cart,
        subtotal: getSubtotal(),
        tax: getTax(),
        discount: getDiscount(),
        shipping: 0,
        total: getTotal(),
        shippingInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
        },
        paymentMethod,
      };
      const newOrder = await createOrder(orderData);
      setOrderId(newOrder.orderNumber || newOrder.id);
      setOrderTotal(Number(newOrder.total ?? newOrder.total_amount ?? getSubtotal()));
      setOrderItemCount(cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0));
      setOrderPlaced(true);
      clearCart();
    } catch (error) {
      setSubmitError(error?.message || "We could not place your order. Your cart has been kept; please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <Container className="py-20">
        <SectionTitle title="Checkout" subtitle="Your cart is empty" />
        <div className="text-center">
          <p className="text-gray-600 mb-8">
            Please add items to your cart before checking out.
          </p>
          <Button variant="primary">
            <a href="/gallery">Return to Gallery</a>
          </Button>
        </div>
      </Container>
    );
  }

  if (orderPlaced) {
    return (
      <Container className="py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Order Received — Payment Pending
          </h2>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 mb-8">
            <p className="text-gray-600 mb-4">Your order ID:</p>
            <p className="text-2xl font-bold text-emerald-600 mb-6">{orderId}</p>
            <p className="text-gray-700">
              Your order has been recorded, but payment has <strong>not</strong> been processed.
              No confirmation email has been sent by this application.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Order Details</h3>
            <div className="text-left bg-gray-50 border border-gray-200 p-6 rounded-lg">
              <p className="mb-2">
                <strong>Items:</strong> {orderItemCount}
              </p>
              <p className="mb-2">
                <strong>Order Total:</strong> ${orderTotal.toFixed(2)}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="text-amber-700">Pending payment</span>
              </p>
            </div>
          </div>

          <p className="text-gray-600 mb-8">
            You will be redirected to your orders page in a few seconds, or click below.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="primary" onClick={() => navigate("/orders")}>
              View Order Details
            </Button>
            <Button variant="secondary" onClick={() => navigate("/gallery")}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8 md:py-16">
      <SectionTitle title="Checkout" subtitle="Complete your purchase" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Checkout Form */}
        <div className="lg:col-span-2 w-full">
          <form onSubmit={handleSubmit} className="space-y-8">
            {submitError && <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">{submitError}</div>}
            {/* Shipping Information */}
            <div className="border border-gray-200 rounded-lg p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6">Shopping Information</h3>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name *"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name *"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="mb-6">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="mb-6">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="mb-6">
                <input
                  type="text"
                  name="address"
                  placeholder="Street Address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
                <input
                  type="text"
                  name="zipCode"
                  placeholder="ZIP Code"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="border border-gray-200 rounded-lg p-6 md:p-8">
              <h3 className="text-xl font-bold mb-2">Preferred Payment Method</h3>
              <p className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                Online payment is not connected yet. Do not enter card details. Orders remain pending until a payment provider or manual payment process is configured.
              </p>

              <div className="space-y-4 mb-8">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-emerald-600 transition"
                  style={{ borderColor: paymentMethod === "card" ? "#059669" : "" }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 font-medium">Credit/Debit Card</span>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-emerald-600 transition"
                  style={{ borderColor: paymentMethod === "mobile" ? "#059669" : "" }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mobile"
                    checked={paymentMethod === "mobile"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 font-medium">Mobile Money</span>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-emerald-600 transition"
                  style={{ borderColor: paymentMethod === "bank" ? "#059669" : "" }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={paymentMethod === "bank"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 font-medium">Bank Transfer</span>
                </label>
              </div>

              {paymentMethod === "mobile" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    Mobile Money processing is not connected. The order will remain pending until payment is arranged.
                  </p>
                </div>
              )}

              {paymentMethod === "bank" && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    Bank transfer is not automated. Payment instructions must be confirmed by the store administrator.
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
              {submitting ? "Placing order..." : "Place Order (Payment Pending)"}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 w-full">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 md:p-8 sticky top-20">
            <h3 className="text-xl font-bold mb-6">Order Summary</h3>

            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-semibold">${getSubtotal().toFixed(2)}</span>
              </div>
}
              <div className="flex justify-between">
                <span className="text-gray-700">Tax and delivery</span>
                <span className="font-semibold">Not configured</span>
              </div>
            </div>

            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-lg text-emerald-600">
                  ${getTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
