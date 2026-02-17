import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setEmail("");
      alert("Thanks for subscribing!");
    }
  };

  return (
    <footer id="contact" className="bg-[#1a1a1a] text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-20 pb-12">
        <div className="grid lg:grid-cols-3 gap-16">
          {/* Column 1 — Nav Menu + Follow Us */}
          <div>
            <p className="text-sm text-gray-500 mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>Nav menu</p>
            <nav className="space-y-3 mb-12">
              <Link to="/" className="block text-sm text-white hover:text-gray-400 transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Home</Link>
              <Link to="/listings" className="block text-sm text-white hover:text-gray-400 transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Listings</Link>
              <a href="#team" className="block text-sm text-white hover:text-gray-400 transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>About us</a>
              <a href="#contact" className="block text-sm text-white hover:text-gray-400 transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Contact</a>
            </nav>

            <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Follow us</p>
            <div className="flex items-center space-x-4">
              <a href="https://www.tiktok.com/@dealzinheelz.realestate?_r=1&_t=ZS-93oQ3jmf18x" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.8a4.83 4.83 0 01-1-.11z"/></svg>
              </a>
              <a href="https://www.facebook.com/dealzinheelz.ca/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/dealzinheelz.realestate?igsh=MWRyYmlnbGIzMjk3cA==" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2 — Newsletter */}
          <div>
            <p className="text-sm text-white text-center leading-relaxed mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
              Subscribe to our newsletter to get<br />
              market updates, new listings, exclusive<br />
              insights & more
            </p>
            <form onSubmit={handleSubscribe} className="flex items-center border-b border-gray-600 pb-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              <button type="submit" className="text-sm text-white hover:text-gray-400 transition-colors ml-4 flex-shrink-0" style={{ fontFamily: "'Inter', sans-serif" }}>
                Subscribe
              </button>
            </form>
          </div>

          {/* Column 3 — Pages + Contact (right-aligned) */}
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>Pages</p>
            <nav className="space-y-3 mb-12">
              <a href="#team" className="block text-sm text-white hover:text-gray-400 transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>About us</a>
              <Link to="/listings" className="block text-sm text-white hover:text-gray-400 transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Listings</Link>
              <Link to="/testimonials" className="block text-sm text-white hover:text-gray-400 transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>Testimonials</Link>
            </nav>

            <p className="text-sm text-gray-500 mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>Contact</p>
            <div className="space-y-2">
              <a href="tel:+14169095662" className="block text-sm text-white hover:text-gray-400 transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>+1 (416) 909-5662</a>
              <a href="mailto:muniba.mian@century21.ca" className="block text-sm text-white hover:text-gray-400 transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>muniba.mian@century21.ca</a>
              <p className="text-sm text-white leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                2855 Markham Rd Suite 300,<br />
                Scarborough, ON
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Giant Brand Name at Bottom */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pb-8 overflow-hidden">
        <h2 className="text-[18vw] md:text-[14vw] lg:text-[12vw] font-bold text-white leading-none select-none tracking-tight" style={{ fontFamily: "'Inter', sans-serif", WebkitTextStroke: '1px rgba(255,255,255,0.15)', background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', lineHeight: '0.85' }}>
          Muniba Mian
        </h2>
      </div>
    </footer>
  );
}