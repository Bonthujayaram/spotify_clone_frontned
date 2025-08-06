import { Home, Search, Library, User, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/library", icon: Library, label: "Library" },
  { to: "/profile", icon: User, label: "Profile" },
];

const MobileNavBar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900 via-black to-indigo-900 shadow-lg border-b border-white/10 flex justify-evenly items-center h-16 md:hidden">
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center px-2 text-xs transition-all duration-200 ${
              isActive
                ? "text-primary font-bold"
                : "text-gray-300 hover:text-white"
            }`}
          >
            <span
              className={`rounded-full p-2 ${
                isActive
                  ? "bg-primary/20 shadow-md"
                  : "bg-transparent"
              }`}
            >
              <Icon className={`w-6 h-6`} />
            </span>
            <span className="mt-1">{item.label}</span>
            {isActive && (
              <span className="block w-6 h-1 bg-primary rounded-full mt-1 transition-all duration-200"></span>
            )}
          </Link>
        );
      })}
      <button
        onClick={logout}
        className="flex flex-col items-center justify-center px-2 text-xs text-gray-300 hover:text-red-500 transition-all duration-200"
      >
        <span className="rounded-full p-2">
          <LogOut className="w-6 h-6" />
        </span>
        <span className="mt-1">Logout</span>
      </button>
    </nav>
  );
};

export default MobileNavBar;
