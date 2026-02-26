import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import SectionTitle from "../components/common/SectionTitle";
import { useOrders } from "../context/OrderContext";
import { resolveImageUrl } from "../utils/image";

export default function Orders() {
  const { orders, loading } = useOrders();

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-teal-100 text-teal-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const skeletonCards = Array.from({ length: 3 }, (_, index) => (
    <div
      key={`order-skeleton-${index}`}
      className="border border-gray-200 rounded-lg p-4 md:p-6 animate-pulse"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-40 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
          <div className="h-3 w-20 bg-gray-200 rounded" />
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 3 }, (_, idx) => (
                <div key={`thumb-${index}-${idx}`} className="w-12 h-12 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-5 w-20 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      <div className="border-t mt-4 pt-4">
        <div className="h-3 w-64 bg-gray-200 rounded" />
      </div>
    </div>
  ));

  if (loading) {
    return (
      <Container className="py-20">
        <SectionTitle title="Order History" subtitle="" />
        <div className="space-y-6 mt-8">
          {skeletonCards}
        </div>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container className="py-20">
        <SectionTitle
          title="Order History"
          subtitle="You haven't placed any orders yet"
        />
        <div className="text-center">
          <p className="text-gray-600 mb-8">
            Start shopping to see your orders here!
          </p>
          <Link
            to="/gallery"
            className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Browse Gallery
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8 md:py-16">
      <SectionTitle
        title="Order History"
        subtitle={`${orders.length} order${orders.length !== 1 ? "s" : ""}`}
      />

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-lg transition"
          >
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{order.orderNumber || order.id}</h3>
                <p className="text-sm text-gray-600">
                  {formatDate(order.date)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <Link
                  to={`/order/${order.id}`}
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="border-t pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <img
                        key={idx}
                        src={resolveImageUrl(item.image)}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded border border-gray-200"
                      />
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-emerald-600">
                    ${Number(order.total).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="border-t mt-4 pt-4">
              <p className="text-sm text-gray-600">
                <strong>Ship to:</strong> {order.shippingInfo.firstName}{" "}
                {order.shippingInfo.lastName}, {order.shippingInfo.city}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
