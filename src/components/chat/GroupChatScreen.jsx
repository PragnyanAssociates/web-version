"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
// useNavigate is replaced with direct window navigation to avoid router context errors
import { useAuth } from '../../context/AuthContext.tsx';
import { API_BASE_URL } from '../../apiConfig';
import { io } from 'socket.io-client';
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

const GroupChatScreen = () => {
    const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
    
    // State for Header
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [unreadCount, setLocalUnreadCount] = useState(0);
    const [query, setQuery] = useState("");

    // State for Chat
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(false);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

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
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/group-chat/history`);
                if (!response.ok) throw new Error('Failed to fetch history');
                const history = await response.json();
                setMessages(history);
            } catch (error) {
                alert("Error: Could not load chat history.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
        socketRef.current = io(API_BASE_URL);
        
        socketRef.current.on('connect', () => {
            setIsOnline(true);
        });
        
        socketRef.current.on('disconnect', () => {
            setIsOnline(false);
        });
        
        socketRef.current.on('newMessage', (receivedMessage) => {
            setMessages(prevMessages => [...prevMessages, receivedMessage]);
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);
    
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // --- Helper Functions ---
    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
          logout();
          window.location.href = "/";
        }
    };
    
    const getDefaultDashboardRoute = () => {
        if (!user) return '/';
        if (user.role === 'admin') return '/AdminDashboard';
        if (user.role === 'teacher') return '/TeacherDashboard';
        if (user.role === 'student') return '/StudentDashboard';
        return '/';
    };

    const sendMessage = (type, text, url) => {
        if (!user || !socketRef.current) return;
        
        const optimisticMessage = {
            id: Date.now(),
            user_id: parseInt(user.id, 10),
            full_name: user.full_name,
            role: user.role,
            message_type: type,
            message_text: text,
            file_url: url,
            timestamp: new Date().toISOString(),
        };
        setMessages(prevMessages => [...prevMessages, optimisticMessage]);
        
        socketRef.current.emit('sendMessage', {
            userId: user.id,
            messageType: type,
            messageText: text,
            fileUrl: url,
        });

        if (type === 'text') {
            setNewMessage('');
            setIsEmojiPickerOpen(false);
        }
    };

    const handleSendText = () => {
        if (newMessage.trim() === '') return;
        sendMessage('text', newMessage.trim(), null);
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert("Error: Please select an image file.");
            return;
        }
        setIsUploading(true);
        const formData = new FormData();
        formData.append('media', file);
        try {
            const res = await fetch(`${API_BASE_URL}/api/group-chat/upload-media`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Upload failed');
            sendMessage('image', null, data.fileUrl);
        } catch (error) {
            alert("Upload Failed: " + (error.message || 'An unknown error occurred.'));
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendText();
        }
    };

    const renderMessageItem = (item) => {
        if (!user) return null;
        const isMyMessage = item.user_id === parseInt(user.id, 10);
        const messageTime = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

        const renderContent = () => {
            switch (item.message_type) {
                case 'image':
                    return <img src={`${API_BASE_URL}${item.file_url}`} alt="Shared content" className="w-64 h-auto rounded-lg object-cover border border-slate-200" loading="lazy" />;
                case 'text':
                default:
                    return <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{item.message_text}</p>;
            }
        };

        return (
            <div key={item.id} className={`flex items-end mb-4 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex flex-col max-w-xs md:max-w-md ${isMyMessage ? 'items-end' : 'items-start'}`}>
                    {!isMyMessage && <span className="text-xs text-slate-500 mb-1 ml-2">{item.full_name}</span>}
                    <div className={`px-4 py-3 rounded-2xl ${isMyMessage ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'}`}>
                        {renderContent()}
                    </div>
                    <span className={`text-xs mt-1 ${isMyMessage ? 'text-slate-400 mr-2' : 'text-slate-400 ml-2'}`}>{messageTime}</span>
                </div>
            </div>
        );
    };

    if (loading || loadingProfile) {
        return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-100">
            <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">School Group Chat</h1>
                            <p className="text-xs sm:text-sm text-slate-600">Live discussion for students and staff</p>
                        </div>
                        <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
                            <div className="relative">
                                <input id="module-search" type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search messages..." className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-200 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="inline-flex items-stretch rounded-lg border border-slate-200 bg-white overflow-hidden">
                                <button onClick={() => window.location.href = getDefaultDashboardRoute()} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Home"><HomeIcon /><span className="hidden md:inline">Home</span></button>
                                <div className="w-px bg-slate-200" aria-hidden="true" />
                                <button onClick={() => window.location.href = "/AcademicCalendar"} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Calendar"><CalendarIcon /><span className="hidden md:inline">Calendar</span></button>
                                <div className="w-px bg-slate-200" aria-hidden="true" />
                                <button onClick={() => window.location.href = "/ProfileScreen"} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Profile"><UserIcon /><span className="hidden md:inline">Profile</span></button>
                            </div>
                            <div className="h-4 sm:h-6 w-px bg-slate-200 mx-0.5 sm:mx-1" aria-hidden="true" />
                            <div className="flex items-center gap-2 sm:gap-3">
                                <img src={getProfileImageUrl() || "/placeholder.svg"} alt="Profile" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-slate-200 object-cover" onError={(e) => { e.currentTarget.src = "/assets/profile.png" }} />
                                <div className="hidden sm:flex flex-col">
                                    <span className="text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[8ch] sm:max-w-[12ch]">{profile?.full_name || profile?.username || "User"}</span>
                                    <span className="text-xs text-slate-600 capitalize">{profile?.role || ""}</span>
                                </div>
                                <button onClick={handleLogout} className="inline-flex items-center rounded-md bg-blue-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><span className="hidden sm:inline">Logout</span><span className="sm:hidden">Exit</span></button>
                                <button onClick={() => window.location.href = "/NotificationsScreen"} className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-1.5 sm:p-2 text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Notifications" title="Notifications" type="button">
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
                        onClick={() => window.location.href = getDefaultDashboardRoute()}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                        title="Back to Dashboard"
                    >
                        <MdArrowBack />
                        <span>Back to Dashboard</span>
                    </button>
                </div>
                <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-2xl shadow-lg border border-slate-200">
                    <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                        <h2 className="font-bold text-slate-700">Live Discussion</h2>
                        <div className={`flex items-center gap-2 text-xs font-semibold ${isOnline ? 'text-green-600' : 'text-slate-500'}`}>
                            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                            {isOnline ? 'Connected' : 'Connecting...'}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50" onClick={() => setIsEmojiPickerOpen(false)}>
                        {messages.length > 0 ? messages.map(renderMessageItem) : (
                             <div className="flex items-center justify-center h-full text-center text-slate-400">
                                 <p>No messages yet. Start the conversation!</p>
                             </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t border-slate-200 bg-white relative">
                        {isEmojiPickerOpen && (
                            <div className="absolute bottom-full right-0 mb-2 z-10">
                                <EmojiPicker onEmojiClick={(emojiData) => setNewMessage(prev => prev + emojiData.emoji)} />
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            <button onClick={() => fileInputRef.current.click()} disabled={isUploading} className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-slate-200 transition-colors">
                                {isUploading ? <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div> : <MdAttachFile size={22} />}
                            </button>
                            <button onClick={() => setIsEmojiPickerOpen(prev => !prev)} className="p-2 text-slate-500 hover:text-blue-600 rounded-full hover:bg-slate-200 transition-colors">
                                <MdEmojiEmotions size={22} />
                            </button>
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                rows="1"
                                className="flex-1 bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button onClick={handleSendText} disabled={!newMessage.trim()} className="p-3 bg-blue-600 text-white rounded-lg disabled:bg-slate-300 transition-colors">
                                <MdSend size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GroupChatScreen;