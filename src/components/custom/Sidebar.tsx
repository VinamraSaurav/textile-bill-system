'use client'
import React, { useEffect, useRef, useState } from 'react';

// Sidebar Component


import { 
  Home, 
  FileText, 
  Users, 
  Upload, 
  ShoppingBag, 
  UserCog, 
  LogOut, 
  X 
} from 'lucide-react';


// Define prop types for components
interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

export const Sidebar = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const sidebarRef = useRef<HTMLDivElement | null>(null);
    
    const closeSidebar = (): void => {
      setIsOpen(false);
    };
  
    const toggleSidebar = (): void => {
      setIsOpen((prev) => !prev);
    };
    
    // Listen for custom toggle event from Navbar
    useEffect(() => {
      const handleToggle = () => toggleSidebar();
      window.addEventListener('toggle-sidebar', handleToggle);
      
      return () => {
        window.removeEventListener('toggle-sidebar', handleToggle);
      };
    }, []);
  
    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent | Event) => {
        if (isOpen && sidebarRef.current && event.target instanceof Node && !sidebarRef.current.contains(event.target)) {
          closeSidebar();
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);
  
    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-30"
            aria-hidden="true"
          />
        )}
        
        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
            <button
              onClick={closeSidebar}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close Sidebar"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="py-4 overflow-y-auto">
            <nav className="px-4 space-y-6">
              <a href="/" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                <Home size={20} className="mr-3" />
                <span>Home</span>
              </a>
              
              <div>
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Bills</p>
                <a href="/scan-bills" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                  <Upload size={20} className="mr-3" />
                  <span>Scan Bills</span>
                </a>
                <a href="/view-bills" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                  <FileText size={20} className="mr-3" />
                  <span>View Bills</span>
                </a>
              </div>
              
              <div>
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Entities</p>
                <a href="/suppliers" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                  <ShoppingBag size={20} className="mr-3" />
                  <span>View Supplier</span>
                </a>
                <a href="/parties" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                  <Users size={20} className="mr-3" />
                  <span>View Party</span>
                </a>
              </div>
              
              <div>
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">User</p>
                <a href="/manage-users" className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100">
                  <UserCog size={20} className="mr-3" />
                  <span>Manage Users</span>
                </a>
              </div>
            </nav>
          </div>
          
          <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
            <a href="/logout" className="flex items-center justify-center w-full px-4 py-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors">
              <LogOut size={20} className="mr-2" />
              <span>Logout</span>
            </a>
          </div>
        </div>
      </>
    );
  };
  