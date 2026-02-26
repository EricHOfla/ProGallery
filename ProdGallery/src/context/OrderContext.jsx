import { createContext, useState, useContext, useEffect } from "react";
import { ordersAPI } from "../services/api";
import { useAuth } from "./AuthContext";
import { resolveImageUrl } from "../utils/image";

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState(() => {
    // Load orders from localStorage on initialization
    const savedOrders = localStorage.getItem("prodgallery_orders");
    return savedOrders ? JSON.parse(savedOrders) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (!isAuthenticated()) {
      localStorage.setItem("prodgallery_orders", JSON.stringify(orders));
    }
  }, [orders, isAuthenticated()]);

  useEffect(() => {
    if (isAuthenticated()) {
      loadOrdersFromAPI();
    }
  }, [user, isAuthenticated()]);

  const mapOrderFromApi = (order) => {
    const shipping = order.shipping_address || {};
    const items = (order.items || []).map((item) => ({
      id: item.id,
      title: item.photo?.title,
      image: resolveImageUrl(item.photo?.image),
      category: item.photo?.category?.name,
      price: parseFloat(item.price),
      quantity: item.quantity,
    }));

    return {
      id: order.id,
      orderNumber: order.order_number,
      date: order.created_at,
      status: order.status,
      items,
      subtotal: parseFloat(order.total_amount),
      tax: 0,
      discount: 0,
      shipping: 0,
      total: parseFloat(order.total_amount),
      shippingInfo: {
        firstName: shipping.first_name || shipping.firstName || "",
        lastName: shipping.last_name || shipping.lastName || "",
        email: shipping.email || "",
        phone: shipping.phone || "",
        address: shipping.address || "",
        city: shipping.city || "",
        zipCode: shipping.zip_code || shipping.zipCode || "",
        country: shipping.country || "",
      },
      paymentMethod: order.payment_method,
    };
  };

  const loadOrdersFromAPI = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();
      const ordersList = Array.isArray(response) ? response : response?.data || [];
      setOrders(ordersList.map(mapOrderFromApi));
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    if (isAuthenticated()) {
      const shippingAddress = {
        first_name: orderData.shippingInfo.firstName,
        last_name: orderData.shippingInfo.lastName,
        email: orderData.shippingInfo.email,
        phone: orderData.shippingInfo.phone,
        address: orderData.shippingInfo.address,
        city: orderData.shippingInfo.city,
        zip_code: orderData.shippingInfo.zipCode,
        country: orderData.shippingInfo.country || "",
      };

      const response = await ordersAPI.create({
        payment_method: orderData.paymentMethod,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
      });

      const mappedOrder = mapOrderFromApi(response);
      setOrders((prevOrders) => [mappedOrder, ...prevOrders]);
      return mappedOrder;
    }

    const newOrder = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString(),
      status: "pending",
      ...orderData,
    };

    setOrders((prevOrders) => [newOrder, ...prevOrders]);
    return newOrder;
  };

  const getOrderById = (orderId) => {
    return orders.find((order) => order.id === orderId);
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        error,
        createOrder,
        getOrderById,
        updateOrderStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within OrderProvider");
  }
  return context;
}
