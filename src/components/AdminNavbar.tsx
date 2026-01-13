import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const AdminNavbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      path: "/prayer",
      label: "Prayer",
      icon: "🕌",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      path: "/ikamah",
      label: "Iqamath",
      icon: "⏰",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      path: "/ramadan",
      label: "Ramadan",
      icon: "🌙",
      gradient: "from-purple-500 to-violet-600",
    },
    {
      path: "/languages",
      label: "Languages",
      icon: "🌐",
      gradient: "from-indigo-500 to-blue-600",
    },
    {
      path: "/notice",
      label: "Notice",
      icon: "📢",
      gradient: "from-yellow-500 to-amber-600",
    },
    {
      path: "/settings",
      label: "Settings",
      icon: "⚙️",
      gradient: "from-gray-500 to-slate-600",
    },
    {
      path: "/translations",
      label: "Translations",
      icon: "🗣️",
      gradient: "from-pink-500 to-rose-600",
    },
    {
      path: "/display",
      label: "Display",
      icon: "📺",
      gradient: "from-teal-500 to-cyan-600",
    },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 shadow-2xl sticky top-0 z-50 border-b-4 border-white/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center text-white font-black text-2xl hover:scale-105 transition-transform flex-shrink-0"
          >
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
              <span className="text-4xl">🕌</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all transform ${
                  isActive(item.path)
                    ? `bg-white text-gray-900 shadow-xl scale-105`
                    : "text-white hover:bg-white/20 hover:scale-105 backdrop-blur-sm"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-3 hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm font-black"
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={3}
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

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fadeIn">
            <div className="flex flex-col gap-2 bg-white/10 backdrop-blur-md p-3 rounded-2xl border-2 border-white/20">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-5 py-4 rounded-xl font-bold transition-all transform ${
                    isActive(item.path)
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-xl scale-105`
                      : "text-white hover:bg-white/20 hover:scale-102"
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-lg">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </nav>
  );
};

export default AdminNavbar;
