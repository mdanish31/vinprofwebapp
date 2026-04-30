import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';

const navLinks = [
  { label: 'Investors', to: '/investor' },
  { label: 'Inventors', to: '/inventor' },
  { label: 'Advisors', to: '/advisors' },
];

export function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-navy-700 rounded-lg flex items-center justify-center">
            <TrendingUp size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-navy-800 tracking-tight">Vinprof</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-lg ${
                location.pathname === to
                  ? 'bg-navy-50 text-navy-800'
                  : 'text-gray-600 hover:text-navy-800 hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="hidden sm:block text-sm font-medium text-gray-600 hover:text-navy-700 transition-colors px-3 py-1.5"
          >
            Sign In
          </button>
          <Button onClick={() => navigate('/register')} size="sm" className="hidden sm:flex">
            Join Vinprof
          </Button>
          <button
            className="md:hidden p-2 text-gray-600 hover:text-navy-800"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`block text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                location.pathname === to
                  ? 'bg-navy-50 text-navy-800'
                  : 'text-gray-700 hover:text-navy-800 hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 flex gap-2">
            <Button onClick={() => { navigate('/login'); setOpen(false); }} variant="outline" size="sm" className="flex-1">Sign In</Button>
            <Button onClick={() => { navigate('/register'); setOpen(false); }} size="sm" className="flex-1">Join Vinprof</Button>
          </div>
        </div>
      )}
    </header>
  );
}
