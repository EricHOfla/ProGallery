import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Container from "../common/Container";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const cartCount = getTotalItems();

  useEffect(() => {
    const handleClickOutside = () => {
      if (profileOpen) setProfileOpen(false);
    };
    
    if (profileOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [profileOpen]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setProfileOpen(false);
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <Container className="py-3 md:py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <img 
            src="/src/assets/logo/prodgallery-logo.jpeg"
            alt="ProdGallery"
            className="h-12 md:h-16 w-auto"
          />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-6 lg:gap-8 items-center">
          <li><Link to="/" className="text-gray-700 hover:text-emerald-600 text-sm">Home</Link></li>
          <li><Link to="/gallery" className="text-gray-700 hover:text-emerald-600 text-sm">Gallery</Link></li>
          <li><Link to="/about" className="text-gray-700 hover:text-emerald-600 text-sm">About</Link></li>
          <li><Link to="/services" className="text-gray-700 hover:text-emerald-600 text-sm">Services</Link></li>
          {user && <li><Link to="/orders" className="text-gray-700 hover:text-emerald-600 text-sm">Orders</Link></li>}
          <li><Link to="/contact" className="text-gray-700 hover:text-emerald-600 text-sm">Contact</Link></li>
          
          {user ? (
            <>
              <li>
                <Link to="/cart" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
                  Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
              </li>
              <li className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileOpen(!profileOpen);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium"
                >
                  <span className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                  <span>{user.firstName}</span>
                  <svg className={`w-4 h-4 transition ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-200">
                      <p className="font-semibold text-sm">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-600 truncate">{user.email}</p>
                    </div>
                    <Link to="/orders" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Orders</Link>
                    <Link to="/change-password" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Change Password</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 border-t">Admin Panel</Link>
                    )}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t">Logout</button>
                  </div>
                )}
              </li>
            </>
          ) : (
            <li><Link to="/login" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">Login</Link></li>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </Container>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t">
          <ul className="flex flex-col p-4 space-y-2">
            <li><Link to="/" className="block text-gray-700 hover:text-emerald-600 py-2" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/gallery" className="block text-gray-700 hover:text-emerald-600 py-2" onClick={() => setMenuOpen(false)}>Gallery</Link></li>
            <li><Link to="/about" className="block text-gray-700 hover:text-emerald-600 py-2" onClick={() => setMenuOpen(false)}>About</Link></li>
            <li><Link to="/services" className="block text-gray-700 hover:text-emerald-600 py-2" onClick={() => setMenuOpen(false)}>Services</Link></li>
            {user && <li><Link to="/orders" className="block text-gray-700 hover:text-emerald-600 py-2" onClick={() => setMenuOpen(false)}>Orders</Link></li>}
            <li><Link to="/contact" className="block text-gray-700 hover:text-emerald-600 py-2" onClick={() => setMenuOpen(false)}>Contact</Link></li>
            
            {user ? (
              <>
                <li className="border-t pt-3 mt-2">
                  <div className="px-3 py-2 text-sm">
                    <p className="font-semibold">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                </li>
                <li><Link to="/cart" className="block px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium" onClick={() => setMenuOpen(false)}>Cart {cartCount > 0 && `(${cartCount})`}</Link></li>
                <li><Link to="/orders" className="block text-gray-700 hover:text-emerald-600 py-2" onClick={() => setMenuOpen(false)}>My Orders</Link></li>
                <li><Link to="/change-password" className="block text-gray-700 hover:text-emerald-600 py-2" onClick={() => setMenuOpen(false)}>Change Password</Link></li>
                {user.role === 'admin' && (
                  <li><Link to="/admin" className="block text-emerald-600 hover:text-emerald-700 py-2 font-medium" onClick={() => setMenuOpen(false)}>Admin Panel</Link></li>
                )}
                <li><button onClick={handleLogout} className="block w-full text-left px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">Logout</button></li>
              </>
            ) : (
              <li><Link to="/login" className="block px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium text-center" onClick={() => setMenuOpen(false)}>Login</Link></li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}
