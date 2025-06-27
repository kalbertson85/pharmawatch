import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const baseClass =
    "block px-4 py-2 text-base font-medium text-dhis2-text hover:text-dhis2-blue hover:bg-gray-100 rounded transition";
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

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-dhis2-text hover:text-dhis2-blue focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Nav Links - Desktop */}
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
            {/* Updated to /medicines */}
            <NavLink
              to="/medicines"
              className={({ isActive }) =>
                isActive ? `${baseClass} ${activeClass}` : baseClass
              }
            >
              Add Medicine
            </NavLink>
            {/* Updated to /medicines */}
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
        </div>
      </div>

      {/* Nav Links - Mobile */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
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
          {/* Updated to /medicines */}
          <NavLink
            to="/medicines"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              isActive ? `${baseClass} ${activeClass}` : baseClass
            }
          >
            Add Medicine
          </NavLink>
          {/* Updated to /medicines */}
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
        </div>
      )}
    </nav>
  );
};

export default Navbar;