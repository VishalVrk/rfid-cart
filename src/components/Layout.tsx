
import React from 'react';
import Navigation from './Navigation';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className={cn("flex-1 pt-16", className)}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
