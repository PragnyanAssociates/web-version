"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../context/AuthContext.tsx';
import { API_BASE_URL } from '../../apiConfig';
import EmojiPicker from 'emoji-picker-react';
import { MdChat, MdSend, MdAttachFile, MdEmojiEmotions, MdClose, MdPerson, MdOnlinePrediction, MdArrowBack } from 'react-icons/md'; // +++ ADDED MdArrowBack +++

// --- Icon Components for Header ---
function UserIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="7" r="4" strokeLinecap="round" />
      <path d="M5.5 21a6.5 6.5 0 0113 0" strokeLinecap="round" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12l9-9 9 9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 001 1h4m8-10v9a1 1 0 01-1 1h-4m-6 0h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
      <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
      <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

const formatSmartDate = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
};

const DatePill = ({ date }) => (
  <div className="flex justify-center my-3">
    <div className="bg-slate-200 rounded-full px-4 py-1.5 shadow-sm">
      <span className="text-slate-600 text-xs font-medium tracking-wide">{date}</span>
    </div>
  </div>
);

const renderEmptyComponent = () => (
  <div className="flex flex-col items-center justify-center flex-1 p-4">
    <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner border">
      <img src='https://cdn-icons-png.flaticon.com/512/4712/4712035.png' alt="Empty chat" className="w-12 h-12 opacity-70" />
    </div>
    <h3 className="text-slate-800 text-xl font-bold mb-2">Start a Conversation</h3>
    <p className="text-slate-500 text-center font-medium max-w-sm">
      AI is here to help you with questions, tasks, and creative projects.
    </p>
  </div>
);

const ChatHeader = () => (
  <div className="flex items-center p-4 bg-slate-50 border-b border-slate-200">
    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-md mr-4">
      <img
        src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
        alt="AI Avatar"
        className="w-8 h-8 rounded-full"
      />
    </div>
    <div className="ml-2">
      <h3 className="text-slate-800 text-lg font-bold tracking-wide">AI Assistant</h3>
      <div className="flex items-center gap-2 mt-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <p className="text-green-600 text-sm font-medium">Online</p>
      </div>
    </div>
  </div>
);

const MessageBubble = ({ message, isUser }) => {
  const bubbleClass = isUser 
    ? "bg-blue-600 text-white ml-auto rounded-2xl rounded-br-none shadow-md"
    : "bg-slate-100 text-slate-800 mr-auto rounded-2xl rounded-bl-none shadow-sm border border-slate-200";

  return (
    <div className={`max-w-md mb-4 ${isUser ? 'ml-auto' : 'mr-auto'}`}>
      <div className={`p-3 ${bubbleClass}`}>
        <p className="font-normal leading-relaxed break-words whitespace-pre-wrap">{message.text || message.content}</p>
      </div>
      <div className={`text-xs text-slate-400 mt-1.5 px-2 ${isUser ? 'text-right' : 'text-left'}`}>
        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};

const ChatAIScreen = () => {
    const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
    const navigate = useNavigate();
    
    // State for Header
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [unreadCount, setLocalUnreadCount] = useState(0);
    const [query, setQuery] = useState("");

    // State for Chat
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isFetchingHistory, setIsFetchingHistory] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    
    const chatUser = { id: user?.id ?? '1' };
    const chatAI = { id: 'ai-assistant', firstName: 'AI' };

    // --- Hooks for Header Functionality ---
    useEffect(() => {
        async function fetchUnreadNotifications() {
        if (!token) { setUnreadCount?.(0); return; }
        try {
            const res = await fetch(`${API_BASE_URL}/api/notifications`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
            const data = await res.json();
            const count = Array.isArray(data) ? data.filter((n) => !n.is_read).length : 0;
            setLocalUnreadCount(count);
            setUnreadCount?.(count);
            } else { setUnreadCount?.(0); }
        } catch { setUnreadCount?.(0); }
        }
        fetchUnreadNotifications();
        const id = setInterval(fetchUnreadNotifications, 60000);
        return () => clearInterval(id);
    }, [token, setUnreadCount]);

    useEffect(() => {
        async function fetchProfile() {
        if (!user?.id) { setLoadingProfile(false); return; }
        setLoadingProfile(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/profiles/${user.id}`);
            if (res.ok) {
            setProfile(await res.json());
            } else {
            setProfile({ id: user.id, username: user.username || "Unknown", full_name: user.full_name || "User", role: user.role || "user" });
            }
        } catch { setProfile(null); }
        finally { setLoadingProfile(false); }
        }
        fetchProfile();
    }, [user]);

    // --- Hooks for Chat Functionality ---
    const formatMessages = (msgs) => msgs.map((msg, index) => ({
        author: msg.role === 'user' ? chatUser : chatAI,
        createdAt: new Date(msg.created_at).getTime() || Date.now() - index * 60000,
        id: msg.id.toString(),
        text: msg.content,
        type: 'text',
    }));

    useEffect(() => {
      if (user) {
        const fetchHistory = async () => {
          try {
            const res = await axios.get(`${API_BASE_URL}/api/chat/history/${user.id}`);
            const formatted = formatMessages(res.data);
            setMessages(formatted.reverse());
          } catch (e) {
            console.error('Chat history error:', e);
          } finally {
            setIsFetchingHistory(false);
          }
        };
        fetchHistory();
      }
    }, [user]);
    
    // --- Helper Functions ---
    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
          logout();
          navigate("/");
        }
    };
    
    const getDefaultDashboardRoute = () => {
        if (!user) return '/';
        if (user.role === 'admin') return '/AdminDashboard';
        if (user.role === 'teacher') return '/TeacherDashboard';
        if (user.role === 'student') return '/StudentDashboard';
        return '/';
    };

    const handleSendPress = useCallback(
      async (text) => {
        if (!user || text.trim() === '') return;

        const userMsg = {
          id: uuidv4(),
          text,
          createdAt: Date.now(),
          author: chatUser,
          type: 'text',
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputText('');
        setShowEmojiPicker(false);

        try {
          const res = await axios.post(`${API_BASE_URL}/api/chat/message`, {
            userId: user.id,
            message: text,
            type: 'text'
          });

          if (res.data.reply) {
            const aiMsg = {
              id: uuidv4(),
              text: res.data.reply,
              createdAt: Date.now(),
              author: chatAI,
              type: 'text',
            };
            setMessages((prev) => [...prev, aiMsg]);
          }
        } catch (error) {
          console.error('Send error:', error);
        }
      },
      [user]
    );

    const handleEmojiSelected = (emojiData) => {
        setInputText((prev) => prev + emojiData.emoji);
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendPress(inputText);
        }
    };

    const groupMessagesByDate = (messages) => {
        const groups = [];
        let currentGroup = null;
        messages.forEach((message) => {
            const messageDate = formatSmartDate(message.createdAt);
            if (!currentGroup || currentGroup.date !== messageDate) {
                currentGroup = { date: messageDate, messages: [] };
                groups.push(currentGroup);
            }
            currentGroup.messages.push(message);
        });
        return groups;
    };

    if (loadingProfile || isFetchingHistory) {
        return (
          <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-200 rounded-full border-t-blue-500 animate-spin"></div>
            <p className="text-slate-600 font-medium mt-4">Loading Chat...</p>
          </div>
        );
    }
    
    const messageGroups = groupMessagesByDate(messages);

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">AI Assistant</h1>
                            <p className="text-xs sm:text-sm text-slate-600">Chat with your intelligent AI assistant</p>
                        </div>

                        <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
                            <div className="relative">
                                <input id="module-search" type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-200 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="inline-flex items-stretch rounded-lg border border-slate-200 bg-white overflow-hidden">
                                <button onClick={() => navigate(getDefaultDashboardRoute())} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Home"><HomeIcon /><span className="hidden md:inline">Home</span></button>
                                <div className="w-px bg-slate-200" aria-hidden="true" />
                                <button onClick={() => navigate("/AcademicCalendar")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Calendar"><CalendarIcon /><span className="hidden md:inline">Calendar</span></button>
                                <div className="w-px bg-slate-200" aria-hidden="true" />
                                <button onClick={() => navigate("/ProfileScreen")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Profile"><UserIcon /><span className="hidden md:inline">Profile</span></button>
                            </div>
                            <div className="h-4 sm:h-6 w-px bg-slate-200 mx-0.5 sm:mx-1" aria-hidden="true" />
                            <div className="flex items-center gap-2 sm:gap-3">
                                <img src={getProfileImageUrl() || "/placeholder.svg"} alt="Profile" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-slate-200 object-cover" onError={(e) => { e.currentTarget.src = "/assets/profile.png" }} />
                                <div className="hidden sm:flex flex-col">
                                    <span className="text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[8ch] sm:max-w-[12ch]">{profile?.full_name || "User"}</span>
                                    <span className="text-xs text-slate-600 capitalize">{profile?.role || ""}</span>
                                </div>
                                <button onClick={handleLogout} className="inline-flex items-center rounded-md bg-blue-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><span className="hidden sm:inline">Logout</span><span className="sm:hidden">Exit</span></button>
                                <button onClick={() => navigate("/NotificationsScreen")} className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-1.5 sm:p-2 text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Notifications" title="Notifications" type="button">
                                    <BellIcon />
                                    {unreadCount > 0 && (<span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white bg-red-600 rounded-full min-w-[16px] sm:min-w-[18px]">{unreadCount > 99 ? "99+" : unreadCount}</span>)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4">
                {/* +++ ADDED THIS BACK BUTTON +++ */}
                <div className="mb-4">
                    <button
                        onClick={() => navigate(getDefaultDashboardRoute())}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                        title="Back to Dashboard"
                    >
                        <MdArrowBack />
                        <span>Back to Dashboard</span>
                    </button>
                </div>
                <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <ChatHeader />
                    <div className="flex-1 overflow-y-auto p-4 relative" onClick={() => setShowEmojiPicker(false)}>
                        {messages.length === 0 ? (
                            renderEmptyComponent()
                        ) : (
                            <div className="space-y-1">
                                {messageGroups.map((group, groupIndex) => (
                                    <div key={groupIndex}>
                                        <DatePill date={group.date} />
                                        {group.messages.map((message) => (
                                            <MessageBubble
                                                key={message.id}
                                                message={message}
                                                isUser={message.author.id === chatUser.id}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-200 bg-slate-50 relative">
                        {showEmojiPicker && (
                            <div className="absolute bottom-full right-4 mb-2 z-10">
                                <EmojiPicker onEmojiClick={handleEmojiSelected} />
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowEmojiPicker(prev => !prev)} className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-slate-200 transition-colors">
                                <MdEmojiEmotions size={22} />
                            </button>
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                rows="1"
                                className="flex-1 bg-white border border-slate-300 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button onClick={() => handleSendPress(inputText)} disabled={!inputText.trim()} className="p-3 bg-blue-600 text-white rounded-lg disabled:bg-slate-300 transition-colors">
                                <MdSend size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChatAIScreen;