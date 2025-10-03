'use client';

import { useState } from 'react';
import Wallet from './Wallet';
import Link from 'next/link';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

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
    <header className="bg-background text-foreground shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold">
            ReLoop
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <Link href="/mint" className="hover:underline">
              Mint
            </Link>
            <Link href="/recycle" className="hover:underline">
              Recycle
            </Link>
            <Link href="/product/1" className="hover:underline">
              Product
            </Link>
          </nav>

          {/* Desktop Connect Button */}
          <div className="hidden md:flex items-center space-x-4">
            {mounted && (
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="p-2 rounded-md hover:bg-muted"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            )}
            <Wallet />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="hover:underline" onClick={toggleMobileMenu}>
                Home
              </Link>
              <Link href="/mint" className="hover:underline" onClick={toggleMobileMenu}>
                Mint
              </Link>
              <Link href="/recycle" className="hover:underline" onClick={toggleMobileMenu}>
                Recycle
              </Link>
              <Link href="/product/1" className="hover:underline" onClick={toggleMobileMenu}>
                Product
              </Link>
              <div className="pt-4 flex items-center space-x-4">
                {mounted && (
                  <button
                    onClick={toggleTheme}
                    aria-label="Toggle Theme"
                    className="p-2 rounded-md hover:bg-muted"
                  >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
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
