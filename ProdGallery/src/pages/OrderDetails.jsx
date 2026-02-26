import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Container from "../components/common/Container";
import Button from "../components/common/Button";
import { ordersAPI } from "../services/api";
import { resolveImageUrl } from "../utils/image";

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadingImages, setDownloadingImages] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await ordersAPI.getById(orderId);
        
        // Map API response to UI format
        const mappedOrder = {
          id: data.id,
          orderNumber: data.order_number,
          date: data.created_at,
          status: data.status,
          items: (data.items || []).map((item) => ({
            id: item.id,
            title: item.photo?.title,
            image: item.photo?.image,
            category: item.photo?.category?.name,
            price: parseFloat(item.price),
            quantity: item.quantity,
          })),
          subtotal: parseFloat(data.total_amount),
          tax: 0,
          discount: 0,
          shipping: 0,
          total: parseFloat(data.total_amount),
          shippingInfo: {
            firstName: data.shipping_address?.first_name || data.shipping_address?.firstName || "",
            lastName: data.shipping_address?.last_name || data.shipping_address?.lastName || "",
            email: data.shipping_address?.email || "",
            phone: data.shipping_address?.phone || "",
            address: data.shipping_address?.address || data.shipping_address?.street || "",
            city: data.shipping_address?.city || "",
            zipCode: data.shipping_address?.zip || data.shipping_address?.zip_code || data.shipping_address?.zipCode || "",
            country: data.shipping_address?.country || "",
          },
          paymentMethod: data.payment_method,
        };
        
        setOrder(mappedOrder);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load order");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <Container className="py-20">
        <div className="space-y-6">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-56 bg-gray-200 rounded animate-pulse" />

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 md:p-8">
            <div className="h-5 w-40 bg-gray-200 rounded mb-6 animate-pulse" />
            <div className="flex justify-between gap-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={`step-${index}`} className="flex flex-col items-center flex-1">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mb-2 animate-pulse" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="h-5 w-32 bg-gray-200 rounded mb-6 animate-pulse" />
                <div className="space-y-4">
                  {Array.from({ length: 3 }, (_, index) => (
                    <div key={`item-${index}`} className="flex gap-4 pb-4 border-b animate-pulse">
                      <div className="w-20 h-20 bg-gray-200 rounded" />
                      <div className="flex-1">
                        <div className="h-4 w-48 bg-gray-200 rounded mb-2" />
                        <div className="h-3 w-32 bg-gray-200 rounded mb-2" />
                        <div className="h-3 w-20 bg-gray-200 rounded" />
                      </div>
                      <div className="text-right">
                        <div className="h-4 w-16 bg-gray-200 rounded mb-2" />
                        <div className="h-3 w-20 bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="border border-gray-200 rounded-lg p-6 animate-pulse">
                <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
              <div className="border border-gray-200 rounded-lg p-6 animate-pulse">
                <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
                <div className="h-3 w-full bg-gray-200 rounded mb-2" />
                <div className="h-3 w-3/4 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container className="py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "We couldn't find the order you're looking for."}
          </p>
          <Button onClick={() => navigate("/orders")}>View All Orders</Button>
        </div>
      </Container>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "shipped":
        return "bg-teal-100 text-teal-800 border-teal-300";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrderSteps = () => {
    const steps = [
      { name: "Order Placed", status: "pending", icon: "📋" },
      { name: "Processing", status: "processing", icon: "⚙️" },
      { name: "Shipped", status: "shipped", icon: "🚚" },
      { name: "Delivered", status: "delivered", icon: "✅" },
    ];

    const statusOrder = ["pending", "processing", "shipped", "delivered"];
    const currentIndex = statusOrder.indexOf(order.status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  const orderSteps = getOrderSteps();

  const handleDownloadInvoice = async () => {
    try {
      setDownloading(true);
      const html = await ordersAPI.getInvoiceHtml(orderId);
      const invoiceWindow = window.open('', '_blank');
      if (!invoiceWindow) {
        alert('Please allow pop-ups to download the invoice.');
        return;
      }
      invoiceWindow.document.open();
      invoiceWindow.document.write(html);
      invoiceWindow.document.close();
      invoiceWindow.focus();
    } catch (err) {
      alert(err.message || 'Failed to download invoice');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadImages = async () => {
    try {
      setDownloadingImages(true);
      const blob = await ordersAPI.downloadImages(orderId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order_${order.orderNumber || order.id}_images.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err.message || 'Failed to download images');
    } finally {
      setDownloadingImages(false);
    }
  };

  return (
    <Container className="py-8 md:py-16">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link to="/orders" className="hover:text-emerald-600">
            Orders
          </Link>
          <span>/</span>
          <span className="text-gray-900">{order.orderNumber || order.id}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Order Details
            </h1>
            <p className="text-gray-600">
              Placed on {formatDate(order.date)}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {order.status === "completed" && (
              <>
                <button
                  onClick={handleDownloadInvoice}
                  disabled={downloading}
                  className="px-4 py-2 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition text-sm font-semibold disabled:opacity-60"
                >
                  {downloading ? 'Preparing Invoice...' : 'Download Invoice (PDF)'}
                </button>
                <button
                  onClick={handleDownloadImages}
                  disabled={downloadingImages}
                  className="px-4 py-2 rounded-lg border border-blue-600 text-blue-700 hover:bg-blue-50 transition text-sm font-semibold disabled:opacity-60"
                >
                  {downloadingImages ? 'Preparing Download...' : 'Download Images (ZIP)'}
                </button>
              </>
            )}
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(
                order.status
              )}`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Order Progress */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 md:p-8 mb-8">
        <h2 className="text-xl font-bold mb-6">Order Progress</h2>

        <div className="relative">
          <div className="flex justify-between">
            {orderSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 transition ${
                    step.completed
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {step.icon}
                </div>
                <p
                  className={`text-xs md:text-sm text-center ${
                    step.completed
                      ? "font-semibold text-gray-900"
                      : "text-gray-500"
                  }`}
                >
                  {step.name}
                </p>
              </div>
            ))}
          </div>

          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
            <div
              className="h-full bg-emerald-600 transition-all duration-500"
              style={{
                width: `${
                  (orderSteps.filter((s) => s.completed).length - 1) * 33.33
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Order Items</h2>

            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 pb-4 border-b last:border-b-0"
                >
                  <img
                    src={resolveImageUrl(item.image)}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.category}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${item.price}</p>
                    <p className="text-sm text-gray-600">
                      Total: ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary & Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Order Summary */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-semibold">
                  ${Number(order.subtotal).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Tax</span>
                <span className="font-semibold">${Number(order.tax).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Shipping</span>
                <span className="font-semibold">
                  {order.shipping === 0 ? "Free" : `$${Number(order.shipping).toFixed(2)}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-semibold">
                    -${Number(order.discount).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-lg text-emerald-600">
                  ${Number(order.total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="font-semibold">
                {order.shippingInfo.firstName} {order.shippingInfo.lastName}
              </p>
              {order.shippingInfo.address && (
                <p>{order.shippingInfo.address}</p>
              )}
              {order.shippingInfo.city && order.shippingInfo.zipCode && (
                <p>
                  {order.shippingInfo.city}, {order.shippingInfo.zipCode}
                </p>
              )}
              <p>{order.shippingInfo.email}</p>
              {order.shippingInfo.phone && <p>{order.shippingInfo.phone}</p>}
            </div>
          </div>

          {/* Payment Information */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            <div className="text-sm text-gray-700">
              <p className="capitalize">{order.paymentMethod}</p>
              {order.paymentMethod === "card" && (
                <p className="text-gray-500 mt-1">
                  Card ending in ****
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button variant="primary" className="w-full">
              <Link to="/gallery">Continue Shopping</Link>
            </Button>
            <Button variant="secondary" className="w-full">
              <Link to="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
