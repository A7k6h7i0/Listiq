'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Search, Menu, X, User, LogOut, MessageSquare, Plus } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">Listiq</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Home
            </Link>
            <Link href="/search" className="text-sm font-medium hover:text-primary">
              Browse
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/listings/create">
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Post Ad
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </Button>
                </Link>
                <Link href="/favorites">
                  <Button variant="ghost" size="sm">
                    Favorites
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    {user?.name}
                  </Button>
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="px-4 py-2 hover:bg-muted rounded">
                Home
              </Link>
              <Link href="/search" className="px-4 py-2 hover:bg-muted rounded">
                Browse
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/listings/create" className="px-4 py-2 hover:bg-muted rounded">
                    Post Ad
                  </Link>
                  <Link href="/messages" className="px-4 py-2 hover:bg-muted rounded">
                    Messages
                  </Link>
                  <Link href="/favorites" className="px-4 py-2 hover:bg-muted rounded">
                    Favorites
                  </Link>
                  <Link href="/profile" className="px-4 py-2 hover:bg-muted rounded">
                    Profile
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link href="/admin" className="px-4 py-2 hover:bg-muted rounded">
                      Admin
                    </Link>
                  )}
                  <button onClick={handleLogout} className="px-4 py-2 text-left hover:bg-muted rounded">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 hover:bg-muted rounded">
                    Login
                  </Link>
                  <Link href="/register" className="px-4 py-2 hover:bg-muted rounded">
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
