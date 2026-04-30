import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Bell, MessageSquare } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificationCount } from '../../hooks/useNotificationCount';
import { useMessageCount } from '../../hooks/useMessageCount';

export function Topbar() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { count: notifCount } = useNotificationCount();
  const { count: msgCount } = useMessageCount();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-3">
      {/* Mobile logo */}
      <div
        className="lg:hidden flex items-center gap-2 cursor-pointer flex-shrink-0"
        onClick={() => navigate('/feed')}
      >
        <div className="w-7 h-7 bg-navy-700 rounded-lg flex items-center justify-center">
          <TrendingUp size={15} className="text-white" />
        </div>
        <span className="font-bold text-navy-800 text-lg">Vinprof</span>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search people, jobs, posts..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-navy-400 transition-all"
          />
        </div>
      </form>

      {/* Right actions - mobile only */}
      <div className="lg:hidden flex items-center gap-1">
        <button
          onClick={() => navigate('/messages')}
          className="relative p-2 text-gray-500 hover:text-navy-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MessageSquare size={20} />
          {msgCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {msgCount > 9 ? '9+' : msgCount}
            </span>
          )}
        </button>
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-gray-500 hover:text-navy-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell size={20} />
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </button>
        {profile && (
          <button
            onClick={() => navigate(`/profile/${profile.id}`)}
            className="p-1"
          >
            <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
          </button>
        )}
      </div>
    </header>
  );
}
