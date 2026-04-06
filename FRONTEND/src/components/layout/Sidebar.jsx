import { NavLink } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  MapPin,
  LogOut,
  LogIn,
  X,
} from 'lucide-react';

const linkBase =
  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200';

/**
 * Slide-in sidebar: overlay + backdrop on small screens; fixed panel below navbar on lg+.
 */
export default function Sidebar({
  open,
  onClose,
  userName,
  userEmail,
  avatarUrl,
  onLogout,
  requireAuth,
}) {
  const items = [
    { to: '/cart', label: 'Cart', icon: ShoppingCart, needsAuth: true },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, needsAuth: true },
    { to: '/addresses', label: 'Address', icon: MapPin, needsAuth: true },
  ];

  const initials = (userName || userEmail || '?')
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <div
        className={`fixed inset-0 top-16 z-30 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
        onClick={onClose}
      />

      <aside
        id="app-sidebar"
        className={`fixed left-0 top-16 z-40 flex h-[calc(100dvh-4rem)] w-[min(20rem,90vw)] flex-col border-r border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10 transition-transform duration-300 ease-out dark:border-slate-800 dark:bg-slate-950 lg:w-80 lg:max-w-none lg:shadow-xl ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 dark:border-slate-800">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-indigo-900/50"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white ring-2 ring-indigo-100 dark:ring-indigo-900/50">
                {requireAuth ? initials : '•'}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900 dark:text-white">
                {requireAuth ? userName || 'Member' : 'Guest'}
              </p>
              {requireAuth && userEmail && (
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{userEmail}</p>
              )}
              {!requireAuth && (
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  Sign in for cart & wishlist
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {items.map((item) => {
            const { to, label, needsAuth } = item;
            const ItemIcon = item.icon;
            return (
            <NavLink
              key={to}
              to={needsAuth && !requireAuth ? '/login' : to}
              state={needsAuth && !requireAuth ? { from: { pathname: to } } : undefined}
              onClick={onClose}
              className={({ isActive }) => {
                const active =
                  needsAuth && !requireAuth ? false : isActive && (needsAuth ? requireAuth : true);
                return `${linkBase} ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-950/50 dark:text-indigo-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900'
                }`;
              }}
            >
              <ItemIcon className="h-5 w-5 shrink-0 opacity-80" strokeWidth={2} />
              {label}
            </NavLink>
            );
          })}

          {requireAuth ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className={`${linkBase} mt-auto text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40`}
            >
              <LogOut className="h-5 w-5 shrink-0" strokeWidth={2} />
              Logout
            </button>
          ) : (
            <NavLink
              to="/login"
              onClick={onClose}
              className={({ isActive }) =>
                `${linkBase} mt-auto ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900'
                }`
              }
            >
              <LogIn className="h-5 w-5" strokeWidth={2} />
              Login
            </NavLink>
          )}
        </nav>
      </aside>
    </>
  );
}
