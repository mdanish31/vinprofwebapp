import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Briefcase, MessageSquare, Bell, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificationCount } from '../../hooks/useNotificationCount';
import { useMessageCount } from '../../hooks/useMessageCount';

const navItems = [
  { to: '/feed', icon: Home, label: 'Home' },
  { to: '/network', icon: Users, label: 'Network' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/messages', icon: MessageSquare, label: 'Messages', badge: 'messages' },
  { to: '/notifications', icon: Bell, label: 'Notifications', badge: 'notifications' },
];

export function BottomNav() {
  const { profile } = useAuth();
  const { count: notifCount } = useNotificationCount();
  const { count: msgCount } = useMessageCount();

  const getBadge = (badge?: string) => {
    if (badge === 'notifications') return notifCount;
    if (badge === 'messages') return msgCount;
    return 0;
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map(({ to, icon: Icon, label, badge }) => {
          const count = getBadge(badge);
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `
                flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all min-w-[50px]
                ${isActive ? 'text-navy-700' : 'text-gray-500'}
              `}
            >
              <div className="relative">
                <Icon size={22} />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-tight">{label}</span>
            </NavLink>
          );
        })}
        {profile && (
          <NavLink
            to={`/profile/${profile.id}`}
            className={({ isActive }) => `
              flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all min-w-[50px]
              ${isActive ? 'text-navy-700' : 'text-gray-500'}
            `}
          >
            <User size={22} />
            <span className="text-[10px] font-medium leading-tight">Profile</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
}
