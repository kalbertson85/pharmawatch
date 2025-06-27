import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Toaster } from "sonner";

const Badge = ({ count }) =>
  count > 0 ? (
    <span
      aria-label={`${count} alerts`}
      className="ml-2 inline-block min-w-[16px] h-4 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 select-none"
      style={{ lineHeight: 1 }}
    >
      {count > 9 ? "9+" : count}
    </span>
  ) : null;

const Layout = ({
  children,
  user,
  onLogout,
  expiredCount = 0,
  expiringSoonCount = 0,
  lowStockCount = 0,
}) => {
  const location = useLocation();
  const [theme, setTheme] = useState(
    () =>
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
  }, [mobileMenuOpen]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const navLinks = [
    {
      to: "/dashboard",
      label: "Dashboard",
      badgeCount: expiredCount + expiringSoonCount + lowStockCount,
    },
    ...(user?.role === "admin"
      ? [
          { to: "/add", label: "Add Medicine", badgeCount: 0 },
          { to: "/audit-log", label: "Audit Log", badgeCount: 0 },
        ]
      : []),
    { to: "/list", label: "Medicine List", badgeCount: lowStockCount },
  ];

  const navLinkClass = ({ isActive }) =>
    `block px-4 py-3 rounded text-white hover:bg-dhis2-blueLight transition ${
      isActive ? "bg-dhis2-blueLight font-semibold" : "font-normal"
    }`;

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-dhis2-gray-light dark:bg-dhis2-dark-background text-dhis2-text dark:text-dhis2-dark-textPrimary transition-colors duration-300">
      <nav className="bg-dhis2-blue dark:bg-dhis2-dark-blue text-white shadow-md sticky top-0 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Brand */}
            <div className="flex items-center space-x-3">
              <div
                className="flex-shrink-0 rounded-full p-0.5 animate-spin-slow
                  bg-gradient-animated dark:bg-gradient-animated-dark"
                style={{ width: "54px", height: "54px" }}
              >
                <NavLink
                  to="/dashboard"
                  className="block rounded-full overflow-hidden bg-white dark:bg-dhis2-dark-background"
                  style={{ width: "48px", height: "48px" }}
                  aria-label="PharmaWatch Home"
                >
                  <img
                    src="/images/pharmawatch_menu_image_small.png"
                    alt="PharmaWatch Logo"
                    className="w-full h-full object-contain rounded-full"
                    draggable={false}
                  />
                </NavLink>
              </div>
              <NavLink
                to="/dashboard"
                className="text-white dark:text-dhis2-blueLight text-xl font-semibold select-none"
                aria-label="PharmaWatch Home"
              >
                PharmaWatch
              </NavLink>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-6 lg:space-x-8 items-center">
              {navLinks.map(({ to, label, badgeCount }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    isActive
                      ? "text-dhis2-blueLight font-semibold border-b-2 border-dhis2-blueLight flex items-center"
                      : "hover:text-dhis2-blueLight transition flex items-center"
                  }
                >
                  {label}
                  <Badge count={badgeCount} />
                </NavLink>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-5">
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className="btn btn-primary p-2 text-lg leading-none flex items-center justify-center rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-dhis2-blueLight focus-visible:ring-offset-2 transition"
              >
                {theme === "dark" ? "🌙" : "☀️"}
              </button>
              <span className="text-sm font-medium select-none">
                {user?.username || "User"}
              </span>
              <button
                onClick={onLogout}
                className="btn btn-danger px-4 py-2 text-sm font-semibold rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-dhis2-red-dark focus-visible:ring-offset-2 transition"
              >
                Logout
              </button>
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="btn btn-primary p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-dhis2-blueLight focus-visible:ring-offset-2 transition"
                aria-label="Toggle Menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
            mobileMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden={!mobileMenuOpen}
        ></div>

        {/* Mobile Menu Drawer */}
        <div
          className={`fixed top-0 right-0 h-full w-64 bg-dhis2-blue dark:bg-dhis2-dark-blue text-white z-50 transform transition-transform ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
        >
          <nav className="flex flex-col h-full px-4 py-6 space-y-6">
            {navLinks.map(({ to, label, badgeCount }) => (
              <NavLink
                key={to}
                to={to}
                className={navLinkClass}
                onClick={handleMobileLinkClick}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{label}</span>
                  <Badge count={badgeCount} />
                </div>
              </NavLink>
            ))}

            <button
              onClick={() => {
                toggleTheme();
                setMobileMenuOpen(false);
              }}
              className="btn btn-primary w-full text-left px-3 py-2 text-sm rounded transition"
            >
              Toggle {theme === "dark" ? "Light" : "Dark"} Mode
            </button>

            <div className="px-3 py-1 text-sm font-medium select-none">
              {user?.username || "User"}
            </div>

            <button
              onClick={() => {
                onLogout();
                setMobileMenuOpen(false);
              }}
              className="btn btn-danger w-full px-3 py-2 rounded text-white text-sm font-semibold transition"
            >
              Logout
            </button>
          </nav>
        </div>
      </nav>

      <main className="flex-grow p-4 sm:p-6 max-w-full overflow-x-hidden">
        {children}
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: "font-semibold",
        }}
        theme={theme === "dark" ? "dark" : "light"}
      />
    </div>
  );
};

export default Layout;