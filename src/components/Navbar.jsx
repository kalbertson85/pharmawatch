import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent background scrolling when menu open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const baseClass =
    "block px-6 py-4 text-lg font-medium text-dhis2-text hover:text-dhis2-blue hover:bg-gray-100 rounded transition";
  const activeClass = "text-dhis2-blue font-bold border-b-2 border-dhis2-blue";

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <NavLink to="/" className="flex items-center gap-2">
            <img
              src="/images/pharmawatch_menu_image_small.png"
              alt="PharmaWatch Logo"
              className="h-10 w-auto"
            />
            <span className="text-xl font-semibold text-dhis2-blue tracking-wide">
              PharmaWatch
            </span>
          </NavLink>

          {/* Desktop Links */}
          <div className="hidden md:flex md:space-x-6">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? `${baseClass} ${activeClass}` : baseClass
              }
              end
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/medicines"
              className={({ isActive }) =>
                isActive ? `${baseClass} ${activeClass}` : baseClass
              }
            >
              Add Medicine
            </NavLink>
            <NavLink
              to="/medicines"
              className={({ isActive }) =>
                isActive ? `${baseClass} ${activeClass}` : baseClass
              }
            >
              Medicine List
            </NavLink>
            <NavLink
              to="/audit-log"
              className={({ isActive }) =>
                isActive ? `${baseClass} ${activeClass}` : baseClass
              }
            >
              Audit Log
            </NavLink>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-dhis2-text hover:text-dhis2-blue focus:outline-none"
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      ></div>

      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col h-full px-4 py-6 space-y-6">
          <nav className="flex flex-col space-y-4">
            <NavLink
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                isActive ? `${baseClass} ${activeClass}` : baseClass
              }
              end
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/medicines"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                isActive ? `${baseClass} ${activeClass}` : baseClass
              }
            >
              Add Medicine
            </NavLink>
            <NavLink
              to="/medicines"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                isActive ? `${baseClass} ${activeClass}` : baseClass
              }
            >
              Medicine List
            </NavLink>
            <NavLink
              to="/audit-log"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                isActive ? `${baseClass} ${activeClass}` : baseClass
              }
            >
              Audit Log
            </NavLink>
          </nav>

          {/* Optional: Add other mobile menu content here */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;