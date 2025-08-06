import { User } from "lucide-react";
import { Link } from "react-router-dom";

const MobileTopNavBar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10 flex items-center justify-between h-14 px-4 md:hidden">
      <Link to="/" className="flex items-center gap-2">
        <img src="/echovibe2.png" alt="EchoVibe" className="h-8 w-auto" />
        <span className="text-white font-bold text-lg">EchoVibe</span>
      </Link>
      <Link to="/profile" className="text-gray-400 hover:text-white">
        <User className="w-6 h-6" />
      </Link>
    </nav>
  );
};

export default MobileTopNavBar;
