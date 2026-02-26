import { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Load user from localStorage on initialization
    const savedUser = localStorage.getItem("prodgallery_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("prodgallery_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("prodgallery_user");
    }
  }, [user]);

  const register = async (email, password, firstName, lastName) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });
      
      setUser({
        ...response.user,
        token: response.token,
      });
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login(email, password);
      
      setUser({
        ...response.user,
        token: response.token,
      });
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await authAPI.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      // Clear cart and orders on logout
      localStorage.removeItem("prodgallery_cart");
      localStorage.removeItem("prodgallery_orders");
      setLoading(false);
    }
  };

  const isAuthenticated = () => {
    return user !== null && user.token !== undefined;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
