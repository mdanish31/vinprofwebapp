import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, MessageSquare, Search } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { Conversation, Message, Profile } from '../lib/database.types';
import { useAuth } from '../contexts/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Avatar } from '../components/ui/Avatar';
import { Card } from '../components/ui/Card';

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeConvId = searchParams.get('conv');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) loadConversations();
  }, [user]);

  useEffect(() => {
    if (activeConvId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === activeConvId);
      if (conv) selectConversation(conv);
    }
  }, [activeConvId, conversations]);

  useEffect(() => {
    if (!activeConv) return;

    const channel = supabase
      .channel(`messages-${activeConv.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeConv.id}`,
      }, payload => {
        fetchMessageWithProfile(payload.new as Message);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessageWithProfile = async (msg: Message) => {
    const { data: sender } = await supabase.from('profiles').select('*').eq('id', msg.sender_id).maybeSingle();
    setMessages(prev => {
      if (prev.find(m => m.id === msg.id)) return prev;
      return [...prev, { ...msg, sender: sender || undefined }];
    });
  };

  const loadConversations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant1_id.eq.${user!.id},participant2_id.eq.${user!.id}`)
      .order('last_message_at', { ascending: false });

    if (data) {
      const enriched: Conversation[] = await Promise.all(data.map(async conv => {
        const otherId = conv.participant1_id === user!.id ? conv.participant2_id : conv.participant1_id;
        const { data: other } = await supabase.from('profiles').select('*').eq('id', otherId).maybeSingle();
        const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id).eq('is_read', false).neq('sender_id', user!.id);
        return { ...conv, other_participant: other || undefined, unread_count: count || 0 };
      }));
      setConversations(enriched);
    }
    setLoading(false);
  };

  const selectConversation = async (conv: Conversation) => {
    setActiveConv(conv);
    navigate(`/messages?conv=${conv.id}`, { replace: true });

    const { data } = await supabase
      .from('messages')
      .select('*, sender:profiles(*)')
      .eq('conversation_id', conv.id)
      .order('created_at');

    setMessages((data as Message[]) || []);

    // Mark as read
    await supabase.from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conv.id)
      .neq('sender_id', user!.id);

    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c));
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv || !user || sending) return;
    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    await supabase.from('messages').insert({
      conversation_id: activeConv.id,
      sender_id: user.id,
      content,
    });

    await supabase.from('conversations').update({
      last_message: content,
      last_message_at: new Date().toISOString(),
    }).eq('id', activeConv.id);

    setSending(false);
  };

  const filteredConvos = conversations.filter(c =>
    !searchQuery || c.other_participant?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden" style={{ height: 'calc(100vh - 120px)', minHeight: '500px' }}>
          <div className="flex h-full">
            {/* Conversation List */}
            <div className={`${activeConv && isMobile ? 'hidden' : 'flex'} md:flex flex-col w-full md:w-80 border-r border-gray-200`}>
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-bold text-navy-900 text-lg mb-3">Messages</h2>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse-soft" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3.5 bg-gray-200 rounded animate-pulse-soft w-24" />
                          <div className="h-3 bg-gray-200 rounded animate-pulse-soft w-36" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConvos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
                    <MessageSquare size={36} className="text-gray-300 mb-3" />
                    <p className="text-sm font-semibold text-navy-900">No conversations</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Connect with people to start messaging
                    </p>
                  </div>
                ) : (
                  filteredConvos.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${activeConv?.id === conv.id ? 'bg-navy-50' : ''}`}
                    >
                      <Avatar src={conv.other_participant?.avatar_url} name={conv.other_participant?.full_name} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold truncate ${activeConv?.id === conv.id ? 'text-navy-800' : 'text-gray-900'}`}>
                            {conv.other_participant?.full_name || 'Unknown'}
                          </span>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{timeAgo(conv.last_message_at)}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{conv.last_message || 'No messages yet'}</p>
                      </div>
                      {(conv.unread_count || 0) > 0 && (
                        <span className="w-5 h-5 bg-navy-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                          {conv.unread_count}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat */}
            {activeConv ? (
              <div className={`${isMobile ? 'flex' : 'flex'} flex-1 flex-col`}>
                {/* Chat Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
                  <button
                    onClick={() => { setActiveConv(null); navigate('/messages'); }}
                    className="md:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <Avatar src={activeConv.other_participant?.avatar_url} name={activeConv.other_participant?.full_name} size="md" />
                  <div>
                    <p className="font-semibold text-navy-900 text-sm">{activeConv.other_participant?.full_name}</p>
                    <p className="text-xs text-gray-500">{activeConv.other_participant?.headline || activeConv.other_participant?.job_title}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {messages.map(msg => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                        {!isMe && <Avatar src={msg.sender?.avatar_url} name={msg.sender?.full_name} size="xs" className="flex-shrink-0 mt-1" />}
                        <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                          <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-navy-700 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-900 rounded-tl-sm'}`}>
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-gray-400 px-1">{timeAgo(msg.created_at)}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-200 px-4 py-3 flex gap-2">
                  <input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 text-sm bg-gray-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:bg-white transition-all"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="p-2.5 bg-navy-700 text-white rounded-xl hover:bg-navy-800 disabled:opacity-40 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center">
                <div className="text-center">
                  <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-navy-900 mb-1">Select a conversation</h3>
                  <p className="text-sm text-gray-500">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
