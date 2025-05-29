import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Search, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Safely handle notifications
  let unreadCount = 0;
  try {
    const { unreadCount: count } = useNotifications();
    unreadCount = count;
  } catch (error) {
    console.log('Notifications context not available in Navbar');
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };


  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to the Index page after logout
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="h-10 w-10 mr-2 animate-fade-in">
              <img 
                src="/lovable-uploads/73a04d9b-63ea-42f1-9c3c-5a47a988cf0a.png" 
                alt="Kasadya Logo" 
                className="h-full w-full object-contain hover-scale" 
              />
            </div>
            <div className="animate-fade-in-right">
              <span className="text-2xl font-playfair font-bold">
                <span className="text-kasadya-teal">Kasadya</span>
                <span className="text-kasadya-brown"> Marketplace</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 animate-fade-in">
            <Link to="/" className="font-medium nav-link text-kasadya-brown hover:text-kasadya-teal transition-colors">
              Home
            </Link>
            <Link to="/about" className="font-medium nav-link text-kasadya-brown hover:text-kasadya-teal transition-colors">
              About Us
            </Link>
            <Link to="/services" className="font-medium nav-link text-kasadya-brown hover:text-kasadya-teal transition-colors">
              Services
            </Link>
            <Link to="/vendors" className="font-medium nav-link text-kasadya-brown hover:text-kasadya-teal transition-colors">
              Vendors
            </Link>
            <Link to="/contact" className="font-medium nav-link text-kasadya-brown hover:text-kasadya-teal transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Side - Search, User, and Notifications */}
          <div className="hidden lg:flex items-center space-x-4 animate-fade-in-left">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-kasadya-teal/20 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-kasadya-teal transition-all duration-300"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-kasadya-teal" />
            </div>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative rounded-full p-2 hover:bg-kasadya-teal/10">
                      <Bell className="h-5 w-5 text-kasadya-brown" />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-kasadya-red text-white text-xs flex items-center justify-center animate-pulse-subtle">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link to="/dashboard" className="w-full">
                      <DropdownMenuItem>
                        View All Notifications
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative rounded-full p-0 hover:bg-kasadya-teal/10">
                      <Avatar className="h-8 w-8 border-2 border-kasadya-teal">
                        <AvatarFallback className="bg-kasadya-teal text-white">
                          {user?.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link to="/dashboard">
                      <DropdownMenuItem>Dashboard</DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" className="border-kasadya-teal text-kasadya-teal hover:bg-kasadya-teal hover:text-white transition-colors">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-kasadya-teal hover:bg-kasadya-deep-teal text-white transition-colors">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden" onClick={toggleMenu}>
            {isMenuOpen ? (
              <X className="h-6 w-6 text-kasadya-brown transition-transform duration-300 rotate-90" />
            ) : (
              <Menu className="h-6 w-6 text-kasadya-brown transition-transform duration-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="block py-2 text-kasadya-brown hover:text-kasadya-teal transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className="block py-2 text-kasadya-brown hover:text-kasadya-teal transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link 
                to="/services" 
                className="block py-2 text-kasadya-brown hover:text-kasadya-teal transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/vendors" 
                className="block py-2 text-kasadya-brown hover:text-kasadya-teal transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Vendors
              </Link>
              <Link 
                to="/contact" 
                className="block py-2 text-kasadya-brown hover:text-kasadya-teal transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="block py-2 text-kasadya-brown hover:text-kasadya-teal transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block py-2 text-left text-kasadya-brown hover:text-kasadya-teal transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button variant="outline" className="w-full border-kasadya-teal text-kasadya-teal hover:bg-kasadya-teal hover:text-white transition-colors">
                      Login
                    </Button>
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button className="w-full bg-kasadya-teal hover:bg-kasadya-deep-teal text-white transition-colors">
                      Register
                    </Button>
                  </Link>
                </div>
              )}

              <div className="pt-4 flex items-center">
                <input
                  type="text"
                  placeholder="Search..."
                  className="flex-grow pl-10 pr-4 py-2 border border-kasadya-teal/20 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-kasadya-teal transition-colors"
                />
                <Search className="absolute ml-3 h-4 w-4 text-kasadya-teal" />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
