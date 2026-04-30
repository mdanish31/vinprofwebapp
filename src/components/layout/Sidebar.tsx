import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, Users, Briefcase, MessageSquare, Bell, User, LayoutDashboard, LogOut, Search, TrendingUp
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificationCount } from '../../hooks/useNotificationCount';
import { useMessageCount } from '../../hooks/useMessageCount';

const navItems = [
  { to: '/feed', icon: Home, label: 'Home' },
  { to: '/network', icon: Users, label: 'My Network' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/messages', icon: MessageSquare, label: 'Messages', badge: 'messages' },
  { to: '/notifications', icon: Bell, label: 'Notifications', badge: 'notifications' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
];

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { count: notifCount } = useNotificationCount();
  const { count: msgCount } = useMessageCount();

  const getBadge = (badge?: string) => {
    if (badge === 'notifications') return notifCount;
    if (badge === 'messages') return msgCount;
    return 0;
  };

  return (
    <aside className="hidden lg:flex flex-col w-60 xl:w-64 h-screen sticky top-0 bg-white border-r border-gray-200 z-30">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/feed')}>
          <div className="w-8 h-8 bg-navy-700 rounded-lg flex items-center justify-center">
            <TrendingUp size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-navy-800 tracking-tight">Vinprof</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, badge }) => {
          const count = getBadge(badge);
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive
                  ? 'bg-navy-50 text-navy-800'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <div className="relative">
                <Icon size={19} />
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </div>
              <span>{label}</span>
            </NavLink>
          );
        })}

        <NavLink
          to="/search"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
            ${isActive ? 'bg-navy-50 text-navy-800' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
          `}
        >
          <Search size={19} />
          <span>Search</span>
        </NavLink>
      </nav>

      {/* Profile Section */}
      {profile && (
        <div className="border-t border-gray-100 px-3 py-3">
          <NavLink
            to={`/profile/${profile.id}`}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
              ${isActive ? 'bg-navy-50' : 'hover:bg-gray-100'}
            `}
          >
            <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{profile.full_name || 'Your Profile'}</p>
              <p className="text-xs text-gray-500 truncate">{profile.headline || profile.job_title || 'Add headline'}</p>
            </div>
          </NavLink>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all w-full mt-0.5"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
}
