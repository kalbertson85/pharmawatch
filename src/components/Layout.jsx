import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Toaster } from "sonner";

const Layout = ({ children, user, onLogout }) => {
  const location = useLocation();
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Conditionally include nav links based on user role
  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    ...(user?.role === "admin"
      ? [
          { to: "/add", label: "Add Medicine" },
          { to: "/audit-log", label: "Audit Log" },
        ]
      : []),
    { to: "/list", label: "Medicine List" },
  ];

  const navLinkClass = ({ isActive }) =>
    `nav-link ${isActive ? "active" : ""}`;

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-dhis2-gray-light dark:bg-dhis2-dark-background text-dhis2-text dark:text-dhis2-dark-textPrimary transition-colors duration-300">
      <nav className="bg-dhis2-blue dark:bg-dhis2-dark-blue text-white shadow-md sticky top-0 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Brand with animated gradient border and text */}
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
            <div className="hidden md:flex space-x-6 lg:space-x-8">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={navLinkClass}
                >
                  {label}
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
              <span className="text-sm font-medium select-none">{user?.username || "User"}</span>
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
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            key={location.pathname}
            className="md:hidden px-4 pb-6 space-y-3 bg-dhis2-blue dark:bg-dhis2-dark-blue rounded-b shadow-lg"
          >
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={navLinkClass}
                onClick={handleMobileLinkClick}
              >
                {label}
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

            <div className="px-3 py-1 text-sm font-medium select-none">{user?.username || "User"}</div>

            <button
              onClick={() => {
                onLogout();
                setMobileMenuOpen(false);
              }}
              className="btn btn-danger w-full px-3 py-2 rounded text-white text-sm font-semibold transition"
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      <main className="flex-grow p-4 sm:p-6 max-w-full overflow-x-hidden">{children}</main>

      {/* Toaster with theme support */}
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