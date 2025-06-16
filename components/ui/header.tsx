"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ModeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Menu, Plus } from 'lucide-react';

const Header = () => {
  const pathname = usePathname();

  
  const navItems = [
    { name: 'Reels', path: '/reels' },
    { name: 'About', path: '/about' },
  ];
  
  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300  backdrop-blur-md bg-background/90"   
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/reels" className="text-2xl font-bold mr-8">
            SportsReels
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.path ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/create">
            <Button variant="default" size="sm" className="hidden md:flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create Reel
            </Button>
          </Link>
          
          <ModeToggle />
               
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <Link href="/" className="text-xl font-bold">
                    SportsReels
                  </Link>
                </div>
                <nav className="flex flex-col space-y-4 mb-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary p-2 rounded-md",
                        pathname === item.path 
                          ? "bg-secondary text-primary" 
                          : "text-foreground"
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Link
                    href="/create"
                    className="flex items-center space-x-2 p-2 text-sm font-medium bg-primary text-primary-foreground rounded-md"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Reel</span>
                  </Link>
                </nav>
                
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;