import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomPlayer from './BottomPlayer';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileNavBar from "./MobileNavBar";
// Removed import MobileTopNavBar

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="h-screen flex flex-col bg-[#121212]">
      {/* Mobile nav bar at the top only for mobile */}
      {isMobile && <MobileNavBar />}
      <div className={`flex-1 flex overflow-hidden ${isMobile ? 'pt-16' : ''}`}>
        {!isMobile && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
        <main className={`flex-1 overflow-y-auto bg-gradient-to-b from-[#121212] to-[#121212] relative ${isMobile ? 'pb-32' : ''}`}>
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.2)]" />
          <div className="relative z-10 h-full">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomPlayer />
    </div>
  );
};

export default Layout;
