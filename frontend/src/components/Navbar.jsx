import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { totalItems } = useCart()
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  // Briefly bump the cart badge when the count increases — reinforces "added".
  const [bump, setBump] = useState(false)
  const prevCount = useRef(totalItems)
  useEffect(() => {
    if (totalItems > prevCount.current) {
      setBump(true)
      const id = setTimeout(() => setBump(false), 300)
      prevCount.current = totalItems
      return () => clearTimeout(id)
    }
    prevCount.current = totalItems
  }, [totalItems])

  // User-facing links use the indigo accent.
  const userLinkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium rounded-md transition ${
      isActive ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'
    }`

  // Admin links use a subtle amber accent so the admin area reads as distinct.
  const adminLinkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium rounded-md transition ${
      isActive ? 'text-amber-700 bg-amber-50' : 'text-gray-600 hover:text-gray-900'
    }`

  async function handleLogout() {
    setOpen(false)
    await logout()
    navigate('/')
  }

  const CartLink = (
    <Link
      to="/cart"
      onClick={() => setOpen(false)}
      className="relative rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
    >
      Cart
      {totalItems > 0 && (
        <span
          className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-semibold text-white transition-transform duration-300 ${
            bump ? 'scale-125' : 'scale-100'
          }`}
        >
          {totalItems}
        </span>
      )}
    </Link>
  )

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" onClick={() => setOpen(false)} className="text-xl font-bold tracking-tight text-indigo-600">
          Mini<span className="text-gray-900">Shop</span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {/* User area */}
          <NavLink to="/" className={userLinkClass} end>
            Catalog
          </NavLink>
          {CartLink}

          {isAuthenticated ? (
            /* Admin area — separated by a divider and a subtle label */
            <div className="ml-2 flex items-center gap-1 border-l border-gray-200 pl-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                Admin
              </span>
              <NavLink to="/admin/products" className={adminLinkClass}>
                Products
              </NavLink>
              <NavLink to="/admin/orders" className={adminLinkClass}>
                Orders
              </NavLink>
              <button
                onClick={handleLogout}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="ml-2 rounded-md border-l border-gray-200 py-2 pl-3 pr-3 text-sm font-medium text-amber-700 hover:text-amber-800"
            >
              Admin
            </NavLink>
          )}
        </div>

        {/* Mobile controls: Cart stays reachable, rest behind a menu button */}
        <div className="flex items-center gap-1 md:hidden">
          {CartLink}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile dropdown panel */}
      {open && (
        <div className="border-t border-gray-200 bg-white px-4 py-2 md:hidden">
          <div className="flex flex-col">
            <NavLink to="/" end onClick={() => setOpen(false)} className={userLinkClass}>
              Catalog
            </NavLink>

            {isAuthenticated ? (
              <>
                <div className="mt-2 border-t border-gray-100 pt-2">
                  <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                    Admin
                  </span>
                </div>
                <NavLink to="/admin/products" onClick={() => setOpen(false)} className={adminLinkClass}>
                  Products
                </NavLink>
                <NavLink to="/admin/orders" onClick={() => setOpen(false)} className={adminLinkClass}>
                  Orders
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="rounded-md px-3 py-2 text-left text-sm font-medium text-gray-500 hover:text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-md border-t border-gray-100 px-3 pb-2 pt-3 text-sm font-medium text-amber-700 hover:text-amber-800"
              >
                Admin
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
