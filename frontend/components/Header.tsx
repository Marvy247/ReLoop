'use client';

import { useState, useEffect } from 'react';
import Wallet from './Wallet';
import Link from 'next/link';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm text-foreground border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-3xl font-bold tracking-tight">
            ReLoop
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-grow justify-center space-x-8">
            <Link href="/" className="text-lg hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/mint" className="text-lg hover:text-primary transition-colors">
              Mint
            </Link>
            <Link href="/recycle" className="text-lg hover:text-primary transition-colors">
              Recycle
            </Link>
            <Link href="/dashboard" className="text-lg hover:text-primary transition-colors">
              My Products
            </Link>
          </nav>

          {/* Desktop Connect Button & Theme Toggle */}
          <div className="hidden md:flex items-center space-x-4">
            {mounted && (
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
              </button>
            )}
            <Wallet />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-6 pt-2">
            <nav className="flex flex-col items-center space-y-6">
              <Link href="/" className="text-lg hover:text-primary transition-colors" onClick={toggleMobileMenu}>
                Home
              </Link>
              <Link href="/mint" className="text-lg hover:text-primary transition-colors" onClick={toggleMobileMenu}>
                Mint
              </Link>
              <Link href="/recycle" className="text-lg hover:text-primary transition-colors" onClick={toggleMobileMenu}>
                Recycle
              </Link>
              <Link href="/dashboard" className="text-lg hover:text-primary transition-colors" onClick={toggleMobileMenu}>
                My Products
              </Link>
              <div className="pt-6 flex items-center space-x-6">
                {mounted && (
                  <button
                    onClick={toggleTheme}
                    aria-label="Toggle Theme"
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                  >
                    {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
                  </button>
                )}
                <Wallet />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
