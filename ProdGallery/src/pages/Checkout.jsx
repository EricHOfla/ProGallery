import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../components/common/Container";
import Button from "../components/common/Button";
import SectionTitle from "../components/common/SectionTitle";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();
  const { createOrder } = useOrders();

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Coupon codes
  const validCoupons = {
    SAVE10: { discount: 0.1, type: "percentage" },
    SAVE20: { discount: 0.2, type: "percentage" },
    FIRST50: { discount: 50, type: "fixed" },
    WELCOME15: { discount: 0.15, type: "percentage" },
  };

  const applyCoupon = () => {
    const coupon = validCoupons[couponCode.toUpperCase()];
    if (coupon) {
      setAppliedCoupon({ code: couponCode.toUpperCase(), ...coupon });
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code");
      setAppliedCoupon(null);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    const subtotal = getTotalPrice();
    if (appliedCoupon.type === "percentage") {
      return subtotal * appliedCoupon.discount;
    }
    return Math.min(appliedCoupon.discount, subtotal);
  };

  const getSubtotal = () => getTotalPrice();
  const getTax = () => getSubtotal() * 0.1;
  const getDiscount = () => calculateDiscount();
  const getTotal = () => getSubtotal() + getTax() - getDiscount();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert("Please fill in all required fields");
      return;
    }

    // Create order object
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
      paymentMethod: paymentMethod,
      couponCode: appliedCoupon?.code || null,
    };

    // Save order to context
    const newOrder = await createOrder(orderData);
    setOrderId(newOrder.orderNumber || newOrder.id);
    setOrderPlaced(true);
    
    // Clear cart
    clearCart();

    // Redirect after 5 seconds
    setTimeout(() => {
      navigate("/orders");
    }, 5000);
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
            Order Placed Successfully!
          </h2>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 mb-8">
            <p className="text-gray-600 mb-4">Your order ID:</p>
            <p className="text-2xl font-bold text-emerald-600 mb-6">{orderId}</p>
            <p className="text-gray-600">
              A confirmation email has been sent to <strong>{formData.email}</strong>
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Order Details</h3>
            <div className="text-left bg-gray-50 border border-gray-200 p-6 rounded-lg">
              <p className="mb-2">
                <strong>Items:</strong> {cart.length}
              </p>
              <p className="mb-2">
                <strong>Total Amount:</strong> ${getTotal().toFixed(2)}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="text-green-600">Confirmed</span>
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
              <h3 className="text-xl font-bold mb-6">Payment Method</h3>

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

              {/* Card Details */}
              {paymentMethod === "card" && (
                <div className="space-y-4">
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="Card Number (16 digits)"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                    />
                    <input
                      type="text"
                      name="cvv"
                      placeholder="CVV"
                      value={formData.cvv}
                      onChange={handleChange}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "mobile" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    You will receive a prompt on your registered mobile number to complete the payment.
                  </p>
                </div>
              )}

              {paymentMethod === "bank" && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    Bank details will be provided after placing your order.
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="primary" className="w-full">
              Place Order
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

            {/* Coupon Code */}
            <div className="border-t pt-4 mb-4">
              <h4 className="font-semibold mb-3">Have a coupon?</h4>
              {!appliedCoupon ? (
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600 text-sm"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-red-600 text-xs mt-2">{couponError}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Try: SAVE10, SAVE20, WELCOME15
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-green-800 text-sm">
                        {appliedCoupon.code}
                      </p>
                      <p className="text-xs text-green-600">
                        {appliedCoupon.type === "percentage"
                          ? `${(appliedCoupon.discount * 100).toFixed(0)}% off`
                          : `$${appliedCoupon.discount} off`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-semibold">${getSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Tax (10%)</span>
                <span className="font-semibold">${getTax().toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span className="font-semibold">-${getDiscount().toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-700">Delivery</span>
                <span className="font-semibold">Free</span>
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
