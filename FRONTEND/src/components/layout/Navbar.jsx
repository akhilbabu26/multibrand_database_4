import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  ShoppingCart,
  Heart,
  ChevronDown,
  User,
  LogOut,
  Package,
} from 'lucide-react';
import { AuthContext } from '../../Context/AuthContext';
import { CartContext } from '../../Context/CartContext';
import { WishlistContext } from '../../Context/WishlistContext';
import NavbarSearchBar from './NavbarSearchBar';

const BRAND = (
  <>
    <span className="text-slate-900">Multi</span>
    <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
      Brand
    </span>
  </>
);

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, isAuthenticated, isLoggingOut } = useContext(AuthContext);
  const cartCtx = useContext(CartContext);
  const cartCount = cartCtx?.cartCount ?? 0;
  const { wishlist } = useContext(WishlistContext);
  const wishlistCount = wishlist?.length ?? 0;

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/login');
  };

  const displayName = currentUser?.name || currentUser?.email?.split('@')[0] || 'Member';
  const avatarUrl = currentUser?.avatarUrl || currentUser?.imageUrl;
  const initials = displayName
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isCustomer = isAuthenticated && currentUser;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setSidebarOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100"
          aria-expanded={sidebarOpen}
          aria-controls="app-sidebar"
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          <Menu className="h-6 w-6" strokeWidth={2} />
        </button>

        <Link
          to="/"
          className="shrink-0 text-xl font-extrabold tracking-tight"
          onClick={() => setSidebarOpen(false)}
        >
          {BRAND}
        </Link>

        <div className="mx-auto hidden min-w-0 max-w-xl flex-1 md:flex">
          <NavbarSearchBar onNavigate={() => setSidebarOpen(false)} />
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            to="/searchPage"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 md:hidden"
            aria-label="Search"
            onClick={() => setSidebarOpen(false)}
          >
            <Search className="h-5 w-5" />
          </Link>

          {isCustomer && (
            <>
              <Link
                to="/wishlist"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-100 ${
                  location.pathname === '/wishlist'
                    ? 'text-indigo-600'
                    : 'text-slate-600'
                }`}
                aria-label="Wishlist"
                onClick={() => setSidebarOpen(false)}
              >
                <Heart className="h-5 w-5" strokeWidth={2} />
                {wishlistCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                to="/cart"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-100 ${
                  location.pathname === '/cart'
                    ? 'text-indigo-600'
                    : 'text-slate-600'
                }`}
                aria-label="Cart"
                onClick={() => setSidebarOpen(false)}
              >
                <ShoppingCart className="h-5 w-5" strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {isCustomer ? (
            <div className="relative pl-1" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl py-1.5 pl-1 pr-2 transition hover:bg-slate-100"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-200"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white ring-2 ring-slate-200">
                    {initials}
                  </div>
                )}
                <span className="hidden max-w-[7rem] truncate text-sm font-medium text-slate-800 sm:block">
                  {displayName}
                </span>
                <ChevronDown
                  className={`hidden h-4 w-4 text-slate-500 transition sm:block ${profileOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl border border-slate-200 bg-white py-1 shadow-xl shadow-slate-900/10"
                >
                  <Link
                    role="menuitem"
                    to="/orders"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Package className="h-4 w-4" />
                    My orders
                  </Link>
                  <Link
                    role="menuitem"
                    to="/addresses"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Profile & addresses
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              onClick={() => setSidebarOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}