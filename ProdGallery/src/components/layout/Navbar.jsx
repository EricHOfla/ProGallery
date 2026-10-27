import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import Container from "../common/Container";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const linkClass = ({ isActive }) => `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`;

export default function Navbar() {
  const { getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const cartCount = getTotalItems();
  const closeMenu = () => { setMenuOpen(false); setProfileOpen(false); };
  const handleLogout = () => { logout(); closeMenu(); navigate("/"); };
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || user?.name?.[0]?.toUpperCase() || "U";

  const links = [
    { to: "/", label: "Home", end: true },
    { to: "/gallery", label: "Gallery" },
    { to: "/services", label: "Services" },
    { to: "/about", label: "Our story" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm shadow-slate-900/[0.02] backdrop-blur-xl">
      <Container className="flex min-h-[76px] items-center justify-between gap-4 py-3">
        <Link to="/" onClick={closeMenu} aria-label="ProdGallery home" className="flex shrink-0 items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-sm font-black tracking-tight text-emerald-300 shadow-sm">PG</span>
          <span><span className="block text-lg font-bold leading-tight tracking-tight text-slate-950">ProdGallery</span><span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:block">Photography marketplace</span></span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {links.map((link) => <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>{link.label}</NavLink>)}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? <>
            <Link to="/favorites" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Saved photos</Link><Link to="/orders" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">My orders</Link>
            <Link to="/cart" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-300 px-4 text-sm font-bold text-slate-950 transition hover:bg-emerald-200"><span>Cart</span><span className="grid min-w-5 place-items-center rounded-full bg-slate-950/10 px-1.5 py-0.5 text-xs">{cartCount}</span></Link>
            <div className="relative">
              <button type="button" onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen} className="ml-1 flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 p-1.5 pr-3 hover:bg-slate-50">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-950 text-xs font-bold text-emerald-300">{initials}</span><span className="max-w-24 truncate text-sm font-semibold text-slate-700">{user.firstName || user.name || "Account"}</span><span className="text-xs text-slate-400">⌄</span>
              </button>
              {profileOpen && <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
                <div className="border-b border-slate-100 px-3 py-2"><p className="truncate text-sm font-bold text-slate-900">{user.firstName} {user.lastName}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div>
                <Link to="/orders" onClick={closeMenu} className="mt-1 block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50">My orders</Link>
                <Link to="/change-password" onClick={closeMenu} className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50">Change password</Link>
                {user.role === "admin" && <Link to="/admin" onClick={closeMenu} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">Open admin workspace ↗</Link>}
                <button type="button" onClick={handleLogout} className="mt-1 w-full rounded-lg border-t border-slate-100 px-3 py-2.5 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50">Sign out</button>
              </div>}
            </div>
          </> : <><Link to="/login" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Sign in</Link><Link to="/register" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-emerald-800">Create account</Link></>}
        </div>

        <button type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.8" strokeLinecap="round" d={menuOpen ? "M6 6l12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"} /></svg>
        </button>
      </Container>

      {menuOpen && <div className="border-t border-slate-200 bg-white px-4 pb-5 pt-3 shadow-lg lg:hidden"><nav aria-label="Mobile navigation" className="mx-auto flex max-w-7xl flex-col gap-1">
        {links.map((link) => <NavLink key={link.to} to={link.to} end={link.end} onClick={closeMenu} className={linkClass}>{link.label}</NavLink>)}
        {user ? <><Link to="/favorites" onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Saved photos</Link><Link to="/orders" onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">My orders</Link><Link to="/cart" onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Shopping cart ({cartCount})</Link><Link to="/change-password" onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Change password</Link>{user.role === "admin" && <Link to="/admin" onClick={closeMenu} className="rounded-lg bg-emerald-50 px-3 py-3 text-sm font-bold text-emerald-900">Admin workspace ↗</Link>}<button type="button" onClick={handleLogout} className="mt-2 min-h-11 rounded-xl border border-rose-200 px-3 text-left text-sm font-semibold text-rose-700">Sign out</button></> : <div className="mt-3 grid grid-cols-2 gap-2"><Link to="/login" onClick={closeMenu} className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold">Sign in</Link><Link to="/register" onClick={closeMenu} className="rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white">Create account</Link></div>}
      </nav></div>}
    </header>
  );
}
