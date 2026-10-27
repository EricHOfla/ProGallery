import { useState, useEffect } from "react";
import { analyticsAPI } from "../../services/api";
import { resolveImageUrl } from "../../utils/image";

export default function Analytics() {
  const [revenue, setRevenue] = useState([]);
  const [topPhotos, setTopPhotos] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErrors, setLoadErrors] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setLoadErrors([]);
    const requests = [
      ['Revenue', analyticsAPI.getRevenue],
      ['Top photos', analyticsAPI.getTopPhotos],
      ['Order status', analyticsAPI.getOrderStatus],
      ['Sales by category', analyticsAPI.getSalesByCategory],
    ];
    const results = await Promise.allSettled(requests.map(([, request]) => request()));
    const errors = [];
    const values = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        const payload = result.value;
        return Array.isArray(payload) ? payload : payload?.data || [];
      }
      console.error(`Analytics ${requests[index][0]} request failed:`, result.reason);
      errors.push(`${requests[index][0]} could not be loaded.`);
      return [];
    });
    setRevenue(values[0]);
    setTopPhotos(values[1]);
    setOrderStatus(values[2]);
    setSalesByCategory(values[3]);
    setLoadErrors(errors);
    setLoading(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Sales Analytics</h1>
        <button type="button" onClick={fetchAnalytics} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">Refresh analytics</button>
      </div>
      {loadErrors.length > 0 && <div role="alert" className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-semibold">Some analytics could not be loaded.</p><p>{loadErrors.join(" ")} Please refresh or check the API connection.</p></div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-64 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Sales Analytics</h1>

      {/* Revenue by Month */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Revenue by Month</h2>
        {revenue.length === 0 ? (
          <p className="text-gray-600">No revenue data available</p>
        ) : (
          <div className="space-y-3">
            {revenue.map((item) => (
              <div key={item.month} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">{item.month}</span>
                <span className="text-emerald-600 font-bold">
                  {formatCurrency(item.revenue)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Selling Photos */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Top Selling Photos</h2>
        {topPhotos.length === 0 ? (
          <p className="text-gray-600">No sales data available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPhotos.map((photo) => (
              <div key={photo.id} className="border rounded-lg overflow-hidden">
                <img
                  src={resolveImageUrl(photo.image)}
                  alt={photo.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {photo.title}
                  </h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Sold: {photo.total_sold}
                    </span>
                    <span className="text-emerald-600 font-semibold">
                      {formatCurrency(photo.total_revenue)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Order Status Breakdown</h2>
          {orderStatus.length === 0 ? (
            <p className="text-gray-600">No order data available</p>
          ) : (
            <div className="space-y-3">
              {orderStatus.map((status) => (
                <div
                  key={status.status}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <div>
                    <span className="font-medium capitalize">
                      {status.status}
                    </span>
                    <span className="text-gray-600 text-sm ml-2">
                      ({status.count} orders)
                    </span>
                  </div>
                  <span className="text-emerald-600 font-bold">
                    {formatCurrency(status.total_amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sales by Category */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Sales by Category</h2>
          {salesByCategory.length === 0 ? (
            <p className="text-gray-600">No category data available</p>
          ) : (
            <div className="space-y-3">
              {salesByCategory.map((category) => (
                <div
                  key={category.name}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <div>
                    <span className="font-medium">{category.name}</span>
                    <span className="text-gray-600 text-sm ml-2">
                      ({category.total_sold} sold)
                    </span>
                  </div>
                  <span className="text-emerald-600 font-bold">
                    {formatCurrency(category.total_revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
