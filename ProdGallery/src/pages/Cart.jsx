import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import Button from "../components/common/Button";
import SectionTitle from "../components/common/SectionTitle";
import { useCart } from "../context/CartContext";
import { resolveImageUrl } from "../utils/image";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <Container className="py-20">
        <SectionTitle
          title="Shopping Cart"
          subtitle="Your cart is empty"
        />
        <div className="text-center">
          <p className="text-gray-600 mb-8">
            Start adding photos to your cart to get started!
          </p>
          <Button variant="primary">
            <Link to="/gallery">Continue Shopping</Link>
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-16">
      <SectionTitle
        title="Shopping Cart"
        subtitle={`${cart.length} item${cart.length !== 1 ? "s" : ""} in your cart`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.map((item) => {
              const photo = item.photo || item;
              const photoId = item.photo_id || item.photo?.id || item.id;
              const quantity = Number(item.quantity) || 1;
              return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-lg transition"
              >
                {/* Product Image */}
                <div className="w-24 h-24 shrink-0">
                  <img
                    src={resolveImageUrl(photo.image)}
                    alt={photo.title}
                    className="w-full h-full object-cover rounded"
                  />
                </div>

                {/* Product Details */}
                <div className="grow flex-1">
                  <h3 className="text-lg font-semibold mb-2">{photo.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{photo.category?.name || photo.category}</p>
                  <p className="text-emerald-600 font-bold">${photo.price}</p>
                </div>

                {/* Quantity & Remove */}
                <div className="flex flex-row sm:flex-col justify-between sm:justify-between items-center sm:items-end gap-3">
                  <button
                    onClick={() => removeFromCart(photoId)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>

                  <div className="flex items-center gap-3 border border-gray-300 rounded">
                    <button
                      onClick={() => updateQuantity(photoId, quantity - 1)}
                      className="px-3 py-1 hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="px-4 py-1 min-w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(photoId, quantity + 1)}
                      className="px-3 py-1 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <p className="font-bold">
                    ${(parseFloat(photo.price) * quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 md:p-8 sticky top-20">
            <h3 className="text-xl font-bold mb-6">Order Summary</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-semibold">${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Shipping</span>
                <span className="font-semibold">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Tax</span>
                <span className="font-semibold">
                  ${(getTotalPrice() * 0.1).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-lg text-emerald-600">
                  ${(getTotalPrice() * 1.1).toFixed(2)}
                </span>
              </div>
            </div>

            <Link to="/checkout" className="block mb-3">
              <Button variant="primary" className="w-full">
                Proceed to Checkout
              </Button>
            </Link>

            <Link to="/gallery" className="block">
              <Button variant="secondary" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}
