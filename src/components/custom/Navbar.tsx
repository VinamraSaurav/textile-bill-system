'use client';
import { useState, useRef, useEffect, ReactNode, MouseEvent } from 'react';
import { 
  Menu, 
  User, 
  ChevronDown 
} from 'lucide-react';
import Link from 'next/link';


interface NavbarProps {
  toggleSidebar: () => void;
}

export const Navbar = () => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
    const userMenuRef = useRef<HTMLDivElement | null>(null);
  
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent | Event) => {
        if (userMenuRef.current && event.target instanceof Node && !userMenuRef.current.contains(event.target)) {
          setIsUserMenuOpen(false);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
  
    const handleToggleSidebar = () => {
      // Dispatch a custom event that Sidebar will listen for
      const event = new CustomEvent('toggle-sidebar');
      window.dispatchEvent(event);
    };
  
    return (
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white shadow-md z-30 flex items-center justify-between px-4">
        <div className="flex items-center">
          
          <Link href={"/"}><h1 className="text-xl font-bold text-gray-800">BillTrack Pro</h1></Link>
        </div>
        <div className='flex items-center space-x-4'>
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center bg-gray-100 hover:bg-gray-200 transition-colors rounded-full p-2"
          >
            <User size={20} className="text-gray-700" />
            <ChevronDown size={16} className="ml-1 text-gray-700" />
          </button>
          
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-2 px-4 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">admin@billtrackpro.com</p>
              </div>
              <div className="py-1">
                <a href="/bills" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  View Bills
                </a>
                <a href="/suppliers" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  View Supplier
                </a>
                <a href="/parties" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  View Party
                </a>
                <a href="/logout" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Logout
                </a>
              </div>
            </div>
          )}
        </div>
        <button
            onClick={handleToggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-4"
            aria-label="Toggle Sidebar"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>
    );
  };