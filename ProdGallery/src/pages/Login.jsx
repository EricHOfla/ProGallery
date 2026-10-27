import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "../components/common/Container";
import Button from "../components/common/Button";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("Enter your email address and password to continue.");
      return;
    }

    try {
      const response = await login(normalizedEmail, password);
      navigate(response?.user?.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err?.message || "We couldn't sign you in. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:py-12">
      <Container className="mx-auto w-full max-w-5xl">
        <div className="mb-7 flex justify-center">
          <Link to="/" className="inline-flex items-center gap-3 rounded-lg text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-xl font-black text-white" aria-hidden="true">P</span>
            <span className="text-xl font-bold tracking-tight">ProdGallery</span>
          </Link>
        </div>

        <section className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 lg:grid-cols-2">
          <div className="p-6 sm:p-10 lg:p-12">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Your creative space</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Welcome back</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">Sign in to manage your favourites, purchases and photography orders.</p>

            {error && (
              <div role="alert" aria-live="polite" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-slate-800">Email address</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                  spellCheck="false"
                  required
                  maxLength={255}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label htmlFor="login-password" className="block text-sm font-semibold text-slate-800">Password</label>
                  <Link to="/forgot-password" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    maxLength={128}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 pr-20 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="absolute inset-y-0 right-3 my-auto rounded-md px-2 text-sm font-semibold text-slate-600 hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-emerald-600">
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? "Signing you in..." : "Sign in"}
              </Button>
              {loading && <p role="status" className="text-center text-sm text-slate-500">Please wait while we verify your details.</p>}
            </form>

            <p className="mt-7 text-center text-sm text-slate-600">
              New to ProdGallery?{" "}
              <Link to="/register" className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline">Create an account</Link>
            </p>
            <Link to="/gallery" className="mt-5 block text-center text-sm font-medium text-slate-500 hover:text-slate-800 hover:underline">Explore the gallery as a guest</Link>
          </div>

          <aside className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:p-12">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Photography, collected</span>
              <h2 className="mt-8 max-w-sm text-4xl font-bold leading-tight tracking-tight">Find the image that tells your story.</h2>
              <p className="mt-5 max-w-sm leading-7 text-slate-300">Discover photography, keep the images you love close, and manage every purchase from one place.</p>
            </div>
            <div className="relative mt-12 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="text-xl" aria-hidden="true">♡</span>
                <p className="mt-3 font-semibold">Save favourites</p>
                <p className="mt-1 text-sm text-slate-400">Keep inspiration together.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="text-xl" aria-hidden="true">↗</span>
                <p className="mt-3 font-semibold">Track purchases</p>
                <p className="mt-1 text-sm text-slate-400">Find orders when you need them.</p>
              </div>
            </div>
          </aside>
        </section>
        <p className="mt-6 text-center text-xs text-slate-500">By signing in, you can access your ProdGallery account and order history.</p>
      </Container>
    </main>
  );
}
