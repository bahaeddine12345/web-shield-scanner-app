
import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {isAuthenticated ? (
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-4 pt-10 sm:px-6 lg:px-8">
          {children}
        </main>
      )}
    </div>
  );
};

export default Layout;
