import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import { CartProvider } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <OrderProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </OrderProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
