
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-kasadya-brown text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="animate-fade-in">
            <div className="flex items-center mb-4">
              <img 
                src="/lovable-uploads/73a04d9b-63ea-42f1-9c3c-5a47a988cf0a.png" 
                alt="Kasadya Logo" 
                className="h-12 w-12 mr-2 hover-scale"
              />
              <h3 className="text-xl font-playfair font-bold">
                <span className="bg-gradient-to-r from-kasadya-teal to-kasadya-gold bg-clip-text text-transparent">
                  Kasadya Marketplace
                </span>
              </h3>
            </div>
            <p className="mb-4 text-gray-300">
              Connecting you with the best event services in Davao del Norte. Let's celebrate life's moments together.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-kasadya-teal hover:text-white transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-kasadya-teal hover:text-white transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-kasadya-teal hover:text-white transition-colors">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-lg font-bold mb-4 text-kasadya-gold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-kasadya-teal flex items-center transform transition-transform hover:translate-x-1">
                  <span className="bg-kasadya-gold/20 rounded-full h-1.5 w-1.5 mr-2"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-kasadya-teal flex items-center transform transition-transform hover:translate-x-1">
                  <span className="bg-kasadya-gold/20 rounded-full h-1.5 w-1.5 mr-2"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-kasadya-teal flex items-center transform transition-transform hover:translate-x-1">
                  <span className="bg-kasadya-gold/20 rounded-full h-1.5 w-1.5 mr-2"></span>
                  Services
                </Link>
              </li>
              <li>
                <Link to="/vendors" className="hover:text-kasadya-teal flex items-center transform transition-transform hover:translate-x-1">
                  <span className="bg-kasadya-gold/20 rounded-full h-1.5 w-1.5 mr-2"></span>
                  Vendors
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-kasadya-teal flex items-center transform transition-transform hover:translate-x-1">
                  <span className="bg-kasadya-gold/20 rounded-full h-1.5 w-1.5 mr-2"></span>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-lg font-bold mb-4 text-kasadya-gold">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start hover-lift">
                <MapPin className="h-5 w-5 mr-2 text-kasadya-teal" />
                <span>123 Main Street, Tagum City, Davao del Norte, Philippines</span>
              </li>
              <li className="flex items-center hover-lift">
                <Phone className="h-5 w-5 mr-2 text-kasadya-teal" />
                <span>+63 (123) 456-7890</span>
              </li>
              <li className="flex items-center hover-lift">
                <Mail className="h-5 w-5 mr-2 text-kasadya-teal" />
                <span>info@kasadyamarketplace.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h3 className="text-lg font-bold mb-4 text-kasadya-gold">Subscribe to Our Newsletter</h3>
            <p className="mb-4 text-gray-300">Stay updated with our latest services and events.</p>
            <form className="flex flex-col space-y-3">
              <input
                type="email"
                placeholder="Your Email"
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-kasadya-teal transition-all duration-300"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-kasadya-teal hover:bg-kasadya-deep-teal rounded-md text-white transition-colors animate-bounce-subtle"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Kasadya Marketplace. All rights reserved.</p>
          <div className="mt-2 flex justify-center space-x-6">
            <Link to="/terms" className="hover:text-kasadya-teal text-sm">Terms & Conditions</Link>
            <Link to="/privacy" className="hover:text-kasadya-teal text-sm">Privacy Policy</Link>
            <Link to="/faq" className="hover:text-kasadya-teal text-sm">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
