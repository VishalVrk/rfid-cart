
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Menu, X, Home, Package, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const Navigation = () => {
  const { totalItems } = useCart();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle mobile menu toggle
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close menu when navigation occurs
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-semibold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Cartopia
          </span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/" active={location.pathname === "/"}>
              Products
            </NavLink>
            <NavLink to="/cart" active={location.pathname === "/cart"}>
              Cart
            </NavLink>
            <NavLink to="/admin" active={location.pathname === "/admin"}>
              Admin
            </NavLink>
          </nav>
        )}

        {/* Cart and Mobile Menu Buttons */}
        <div className="flex items-center space-x-2">
          <Link 
            to="/cart" 
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            aria-label="View cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs text-white bg-primary rounded-full animate-fade-in">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="md:hidden"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-md animate-slide-down">
          <nav className="container mx-auto py-4 px-6 flex flex-col space-y-4">
            <MobileNavLink to="/" icon={<Home className="w-4 h-4" />} active={location.pathname === "/"}>
              Products
            </MobileNavLink>
            <MobileNavLink to="/cart" icon={<ShoppingCart className="w-4 h-4" />} active={location.pathname === "/cart"}>
              Cart {totalItems > 0 && `(${totalItems})`}
            </MobileNavLink>
            <MobileNavLink to="/admin" icon={<Settings className="w-4 h-4" />} active={location.pathname === "/admin"}>
              Admin
            </MobileNavLink>
          </nav>
        </div>
      )}
    </header>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink = ({ to, active, children }: NavLinkProps) => (
  <Link
    to={to}
    className={cn(
      "text-sm font-medium transition-all duration-200",
      active 
        ? "text-primary" 
        : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
    )}
  >
    {children}
  </Link>
);

interface MobileNavLinkProps extends NavLinkProps {
  icon: React.ReactNode;
}

const MobileNavLink = ({ to, active, icon, children }: MobileNavLinkProps) => (
  <Link
    to={to}
    className={cn(
      "flex items-center space-x-2 p-2 rounded-md transition-colors duration-200",
      active 
        ? "bg-primary/10 text-primary" 
        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    )}
  >
    {icon}
    <span>{children}</span>
  </Link>
);

export default Navigation;
