import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div className="flex flex-col">
            <h3 className="text-white text-lg font-semibold mb-4">About Us</h3>
            <p className="text-sm leading-relaxed mb-4">
              Discover premium footwear collections from top brands worldwide. We bring style, comfort, and quality to your doorstep.
            </p>
            <p className="text-sm text-gray-400">
              Your trusted destination for authentic shoes since 2024.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col">
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-sm hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-sm hover:text-white transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-sm hover:text-white transition-colors">
                  Wishlist
                </Link>
              </li>
              <li>
                <a href="#faq" className="text-sm hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#shipping" className="text-sm hover:text-white transition-colors">
                  Shipping Info
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="flex flex-col">
            <h3 className="text-white text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2.5">
              <li>
                <a href="#returns" className="text-sm hover:text-white transition-colors">
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-sm hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-sm hover:text-white transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#contact" className="text-sm hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#support" className="text-sm hover:text-white transition-colors">
                  Track Order
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col">
            <h3 className="text-white text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Phone size={16} className="mt-1 flex-shrink-0 text-indigo-400" />
                <div className="flex flex-col text-sm">
                  <a href="tel:+1234567890" className="hover:text-white transition-colors">
                    +1 (234) 567-890
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={16} className="mt-1 flex-shrink-0 text-indigo-400" />
                <div className="flex flex-col text-sm">
                  <a href="mailto:support@multibrand.com" className="hover:text-white transition-colors">
                    support@multibrand.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-1 flex-shrink-0 text-indigo-400" />
                <div className="flex flex-col text-sm">
                  <p>123 Fashion Street</p>
                  <p>New York, NY 10001</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 py-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Social Links */}
          <div className="flex gap-6">
            <a
              href="#facebook"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a
              href="#twitter"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </a>
            <a
              href="#instagram"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href="#linkedin"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-400">
            &copy; {currentYear} Multibrand Shoes. All rights reserved.
          </p>

          {/* Payment Methods */}
          <div className="flex gap-3 text-xs text-gray-400">
            <span className="px-2 py-1 bg-gray-800 rounded">Visa</span>
            <span className="px-2 py-1 bg-gray-800 rounded">Mastercard</span>
            <span className="px-2 py-1 bg-gray-800 rounded">Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
