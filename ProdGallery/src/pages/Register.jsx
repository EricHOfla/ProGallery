import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "../components/common/Container";
import Button from "../components/common/Button";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser, loading, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const email = formData.email.trim().toLowerCase();

    if (!firstName || !lastName || !email || !formData.password || !formData.confirmPassword) {
      setError("Please complete every field.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    if (formData.password.length > 128) {
      setError("Your password must be 128 characters or fewer.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Your passwords do not match. Please check and try again.");
      return;
    }

    try {
      await registerUser(email, formData.password, firstName, lastName);
      navigate("/gallery");
    } catch (err) {
      setError(err?.message || "We couldn't create your account. Please try again.");
    }
  };

  const passwordMismatch = Boolean(formData.confirmPassword) && formData.password !== formData.confirmPassword;
  const visibleError = error || authError;

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
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Start exploring</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Create your account</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">Join ProdGallery to save favourite photos and keep your purchases organised.</p>

            {visibleError && (
              <div role="alert" aria-live="polite" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {visibleError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="register-first-name" className="mb-2 block text-sm font-semibold text-slate-800">First name</label>
                  <input id="register-first-name" name="firstName" type="text" autoComplete="given-name" required maxLength={255} placeholder="Your first name" value={formData.firstName} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
                </div>
                <div>
                  <label htmlFor="register-last-name" className="mb-2 block text-sm font-semibold text-slate-800">Last name</label>
                  <input id="register-last-name" name="lastName" type="text" autoComplete="family-name" required maxLength={255} placeholder="Your last name" value={formData.lastName} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
                </div>
              </div>

              <div>
                <label htmlFor="register-email" className="mb-2 block text-sm font-semibold text-slate-800">Email address</label>
                <input id="register-email" name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck="false" required maxLength={255} placeholder="you@example.com" value={formData.email} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
              </div>

              <div>
                <label htmlFor="register-password" className="mb-2 block text-sm font-semibold text-slate-800">Password</label>
                <div className="relative">
                  <input id="register-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={128} placeholder="At least 8 characters" value={formData.password} onChange={handleChange} aria-describedby="password-hint" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 pr-20 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="absolute inset-y-0 right-3 my-auto rounded-md px-2 text-sm font-semibold text-slate-600 hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-emerald-600">{showPassword ? "Hide" : "Show"}</button>
                </div>
                <p id="password-hint" className="mt-2 text-xs text-slate-500">Use at least 8 characters. Avoid using a password you use elsewhere.</p>
              </div>

              <div>
                <label htmlFor="register-confirm-password" className="mb-2 block text-sm font-semibold text-slate-800">Confirm password</label>
                <div className="relative">
                  <input id="register-confirm-password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={128} placeholder="Enter the same password again" value={formData.confirmPassword} onChange={handleChange} aria-invalid={passwordMismatch} aria-describedby={passwordMismatch ? "confirm-password-error" : undefined} className={`w-full rounded-xl border bg-white px-4 py-3.5 pr-20 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-100 ${passwordMismatch ? "border-red-400 focus:border-red-500" : "border-slate-300 focus:border-emerald-600"}`} />
                  <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"} aria-pressed={showConfirmPassword} className="absolute inset-y-0 right-3 my-auto rounded-md px-2 text-sm font-semibold text-slate-600 hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-emerald-600">{showConfirmPassword ? "Hide" : "Show"}</button>
                </div>
                {passwordMismatch && <p id="confirm-password-error" className="mt-2 text-xs text-red-700">The passwords do not match yet.</p>}
              </div>

              <Button type="submit" variant="primary" className="w-full" disabled={loading || passwordMismatch}>
                {loading ? "Creating your account..." : "Create account"}
              </Button>
              {loading && <p role="status" className="text-center text-sm text-slate-500">Please wait while we set up your account.</p>}
            </form>

            <p className="mt-7 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline">Sign in</Link>
            </p>
            <Link to="/gallery" className="mt-5 block text-center text-sm font-medium text-slate-500 hover:text-slate-800 hover:underline">Explore the gallery as a guest</Link>
          </div>

          <aside className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:p-12">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" aria-hidden="true" />
            <div className="relative">
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Welcome to ProdGallery</span>
              <h2 className="mt-8 max-w-sm text-4xl font-bold leading-tight tracking-tight">Make room for the photos you love.</h2>
              <p className="mt-5 max-w-sm leading-7 text-slate-300">Create one account for a simpler, more personal photography shopping experience.</p>
            </div>
            <ul className="relative mt-12 space-y-4">
              <li className="flex items-start gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-200" aria-hidden="true">✓</span><span><strong className="block font-semibold">Save favourites</strong><span className="mt-1 block text-sm text-slate-400">Build your own collection of inspiring images.</span></span></li>
              <li className="flex items-start gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-200" aria-hidden="true">✓</span><span><strong className="block font-semibold">Manage orders</strong><span className="mt-1 block text-sm text-slate-400">Keep track of purchases and order details.</span></span></li>
              <li className="flex items-start gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-200" aria-hidden="true">✓</span><span><strong className="block font-semibold">Shop with confidence</strong><span className="mt-1 block text-sm text-slate-400">Access your account whenever you return.</span></span></li>
            </ul>
          </aside>
        </section>
        <p className="mt-6 text-center text-xs text-slate-500">Your details are used to create and manage your ProdGallery account.</p>
      </Container>
    </main>
  );
}
