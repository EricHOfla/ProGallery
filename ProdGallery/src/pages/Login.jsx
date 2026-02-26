import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Container from "../components/common/Container";
import Button from "../components/common/Button";
import SectionTitle from "../components/common/SectionTitle";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }


    try {
      const response = await login(email, password);
      const role = response?.user?.role || "customer";
      navigate(role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-600 to-teal-600 flex items-center justify-center py-8">
      <Container className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Column - Form */}
            <div className="p-8 lg:p-12">
              <SectionTitle
                title="Welcome Back"
                subtitle="Login to your account"
                centered={true}
              />

              {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block font-semibold mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block font-semibold mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-600 hover:text-gray-900"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>

              <div className="mt-6 border-t pt-6">
                <p className="text-center text-gray-600 mb-4">
                  Don't have an account?
                </p>
                <Link to="/register" className="block">
                  <Button variant="secondary" className="w-full">
                    Create New Account
                  </Button>
                </Link>
              </div>

              <div className="mt-6">
                <Link to="/gallery" className="text-center block text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                  Continue as Guest
                </Link>
              </div>
            </div>

            {/* Right Column - Info */}
            <div className="bg-emerald-600 p-8 lg:p-12 flex flex-col justify-center text-white">
              <h3 className="text-3xl font-bold mb-6">ProdGallery</h3>
              <p className="text-emerald-100 mb-8">
                Welcome back! Login to access your account, manage your cart, view orders, and purchase stunning photography.
              </p>
              
              {/* Demo Credentials */}
              <div className="bg-emerald-700/50 p-6 rounded-lg">
                <p className="text-sm font-semibold mb-3">
                  Demo Credentials:
                </p>
                <p className="text-sm text-emerald-100">Email: demo@example.com</p>
                <p className="text-sm text-emerald-100">Password: password123</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
