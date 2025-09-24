import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx";
import { API_BASE_URL } from "../../apiConfig";

// Scroll-based visibility hook (same as TeacherAdminHealthScreen)
const useScrollButtonVisibility = () => {
  const [showBackButton, setShowBackButton] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setShowBackButton(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowBackButton(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);
  
  return showBackButton;
};

// Custom SVG Icons - EXACT SAME as AdminSuggestionsScreen
function SuggestionIcon() {
  return (
    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );
}

function EmptyStateIcon() {
  return (
    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

// --- Status badge helper - EXACT SAME as AdminSuggestionsScreen
function StatusBadge({ status }) {
  const statusConfig = {
    "Open": {
      bg: "bg-gradient-to-r from-amber-400 to-orange-500",
      text: "text-white",
      shadow: "shadow-amber-500/25",
      icon: "🔓"
    },
    "Under Review": {
      bg: "bg-gradient-to-r from-blue-400 to-cyan-500",
      text: "text-white",
      shadow: "shadow-blue-500/25",
      icon: "👀"
    },
    "Implemented": {
      bg: "bg-gradient-to-r from-green-400 to-emerald-500",
      text: "text-white",
      shadow: "shadow-green-500/25",
      icon: "✅"
    },
    "Closed": {
      bg: "bg-gradient-to-r from-red-400 to-rose-500",
      text: "text-white",
      shadow: "shadow-red-500/25",
      icon: "🔒"
    }
  };

  const config = statusConfig[status] || statusConfig["Open"];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${config.bg} ${config.text} ${config.shadow} shadow-lg transition-all duration-300 hover:scale-105`}>
      <span className="text-xs">{config.icon}</span>
      {status}
    </span>
  );
}

// --- Chat message ---
function MessageBubble({ message, user }) {
  const isDonor = user && message.user_id === user.id;
  const alignClass = isDonor
    ? "ml-auto backdrop-blur-sm bg-blue-50/90 border border-blue-200/50 text-right"
    : "mr-auto backdrop-blur-sm bg-green-50/90 border border-green-200/50 text-left";
  
  return (
    <div
      className={`rounded-2xl p-4 my-3 w-fit max-w-[80%] text-sm shadow-lg transition-all duration-300 hover:shadow-xl ${alignClass}`}
      style={{
        animation: `fadeInUp 0.6s ease-out both`
      }}
    >
      <div className="font-bold mb-2 text-gray-800 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isDonor ? 'bg-blue-500' : 'bg-green-500'}`}></span>
        {message.full_name} ({message.role})
      </div>
      {message.message_text && (
        <div className="mb-3 text-gray-700 leading-relaxed">{message.message_text}</div>
      )}
      {message.file_url && (
        <div className="mb-3">
          <a
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 underline text-sm font-medium backdrop-blur-sm bg-white/80 px-3 py-2 rounded-xl border border-blue-200/50 transition-all duration-300 hover:shadow-md"
            href={`${API_BASE_URL}${message.file_url}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <DownloadIcon /> {message.file_name}
          </a>
        </div>
      )}
      <div className="text-right text-gray-500 text-xs mt-2 font-medium">
        {new Date(message.created_at).toLocaleString()}
      </div>
    </div>
  );
}

// --- Chat/Conversation View ---
export function ConversationView({ suggestionId, onBack, isAdmin, hideBack }) {
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isReplying, setIsReplying] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchConversation() {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/suggestions/${suggestionId}`
        );
        const data = await res.json();
        if (data.thread) {
          setThread(data.thread);
          setMessages(data.messages);
        } else {
          throw new Error("Suggestion not found");
        }
      } catch {
        window.alert("Could not load conversation.");
        onBack?.();
      } finally {
        setLoading(false);
      }
    }
    fetchConversation();
  }, [suggestionId, onBack]);

  const handlePickFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  async function handlePostReply() {
    if (!replyText.trim() && !attachment) return;
    if (!user) return window.alert("User not found.");
    setIsReplying(true);
    const formData = new FormData();
    formData.append("suggestionId", suggestionId);
    formData.append("userId", user.id);
    formData.append("message", replyText);
    if (attachment) {
      formData.append("attachment", attachment);
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/suggestions/reply`,
        { method: "POST", body: formData }
      );
      if (response.ok) {
        setReplyText("");
        setAttachment(null);
        const res = await fetch(
          `${API_BASE_URL}/api/suggestions/${suggestionId}`
        );
        const data = await res.json();
        setThread(data.thread);
        setMessages(data.messages);
      } else {
        throw new Error();
      }
    } catch {
      window.alert("Could not send reply.");
    } finally {
      setIsReplying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative mb-4">
          <div className="h-12 w-12 border-4 border-orange-200 rounded-full border-t-orange-500 animate-spin shadow-lg"></div>
          <div className="absolute inset-0 h-12 w-12 border-4 border-transparent rounded-full border-r-orange-400 animate-pulse"></div>
        </div>
        <p className="text-gray-600 font-medium">Loading conversation...</p>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="text-center text-gray-500 py-12">
        <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <SuggestionIcon />
        </div>
        <p className="text-lg font-medium">Suggestion thread not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {!hideBack && (
        <div className="flex items-center mb-6 pb-4 border-b border-gray-200/60">
          <button
            onClick={onBack}
            className="mr-4 w-10 h-10 bg-teal-500 hover:bg-teal-600 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 shadow-lg"
            aria-label="Back"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path
                d="M15.75 19.5L8.25 12l7.5-7.5"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="flex-1 min-w-0 mr-4">
            <h3 className="text-xl font-bold text-gray-800 truncate">{thread.subject}</h3>
          </div>
          <StatusBadge status={thread.status} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto max-h-[50vh] px-2 py-4 space-y-2 backdrop-blur-sm bg-gray-50/50 rounded-2xl border border-white/20 mb-6">
        {messages.map((msg, index) => (
          <MessageBubble key={msg.id} message={msg} user={user} />
        ))}
      </div>

      <div className="backdrop-blur-sm bg-white/90 rounded-2xl border border-white/20 p-4 shadow-lg">
        <div className="flex items-end gap-3 mb-3">
          <textarea
            className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-300 bg-white/90 backdrop-blur-sm resize-none text-sm"
            placeholder="Type your message..."
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <input
            type="file"
            onChange={handlePickFile}
            className="hidden"
            id="attachfile"
          />
          <label
            htmlFor="attachfile"
            className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center cursor-pointer text-gray-600 hover:text-teal-600 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <PaperclipIcon />
          </label>
          <button
            className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handlePostReply}
            disabled={isReplying}
          >
            {isReplying ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <SendIcon />
            )}
          </button>
        </div>
        {attachment && (
          <div className="flex items-center gap-2 p-3 bg-teal-50/80 rounded-xl border border-teal-200/50">
            <PaperclipIcon />
            <span className="text-sm text-teal-700 font-medium">Attached: {attachment.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Suggestion List View ---
function SuggestionListView({ onSelect, onCreate }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/suggestions/my-suggestions/${user.id}`)
      .then((res) => res.json())
      .then(setSuggestions)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-xl border border-white/20 p-6">
        <button
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          onClick={onCreate}
        >
          <PlusIcon />
          Submit a New Suggestion
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-4">
            <div className="h-12 w-12 border-4 border-orange-200 rounded-full border-t-orange-500 animate-spin shadow-lg"></div>
            <div className="absolute inset-0 h-12 w-12 border-4 border-transparent rounded-full border-r-orange-400 animate-pulse"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your suggestions...</p>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="backdrop-blur-sm bg-white/90 rounded-3xl shadow-xl border border-white/20 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <EmptyStateIcon />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-3">No Suggestions Yet</h3>
          <p className="text-gray-600">You haven't submitted any suggestions. Start by creating your first one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((item, index) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="w-full backdrop-blur-sm bg-white/90 rounded-2xl shadow-lg border border-white/30 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] text-left"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-gray-800 mb-2 truncate">{item.subject}</h4>
                  <p className="text-sm text-gray-600 flex items-center">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                    Last update: {new Date(item.last_reply_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="ml-4">
                  <StatusBadge status={item.status} />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Create Suggestion Form ---
function CreateSuggestionView({ onBack }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const handlePickFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  async function handleSubmit() {
    if (!subject.trim() || !message.trim())
      return window.alert("Subject and Message are required.");
    if (!user) return;
    setSubmitting(true);
    const formData = new FormData();
    formData.append("donorId", user.id);
    formData.append("subject", subject);
    formData.append("message", message);
    if (attachment) formData.append("attachment", attachment);

    try {
      const response = await fetch(`${API_BASE_URL}/api/suggestions`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        window.alert("Suggestion submitted!");
        onBack();
      } else throw new Error();
    } catch {
      window.alert("Could not submit suggestion.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="backdrop-blur-sm bg-white/90 rounded-3xl shadow-2xl border border-white/20 p-8 max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="mr-4 w-10 h-10 bg-teal-500 hover:bg-teal-600 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 shadow-lg"
        >
          <ArrowLeftIcon />
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Create New Suggestion</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
          <input
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-300 bg-white/90 backdrop-blur-sm"
            placeholder="Brief summary of your suggestion"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
          <textarea
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-300 bg-white/90 backdrop-blur-sm resize-none"
            placeholder="Describe your suggestion in detail..."
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Attachment (Optional)</label>
          <div className="flex items-center gap-4">
            <input type="file" onChange={handlePickFile} className="hidden" id="file-upload" />
            <label
              htmlFor="file-upload"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer text-gray-700 hover:text-teal-700 transition-all duration-300 border border-gray-200"
            >
              <PaperclipIcon />
              Choose File
            </label>
            {attachment && (
              <span className="text-sm text-teal-700 font-medium bg-teal-50/80 px-3 py-2 rounded-xl border border-teal-200/50">
                {attachment.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={onBack}
            className="flex-1 py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-all duration-300"
          >
            Cancel
          </button>
          <button
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </div>
            ) : (
              "Submit Suggestion"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- DonorSuggestionsScreen main component ---
export default function DonorSuggestionsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const showBackButton = useScrollButtonVisibility();

  const getDefaultDashboardRoute = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/AdminDashboard';
    if (user.role === 'teacher') return '/TeacherDashboard';
    if (user.role === 'student') return '/StudentDashboard';
    if (user.role === 'donor') return '/DonorDashboard';
    return '/';
  };

  const handleBackClick = () => {
    navigate(getDefaultDashboardRoute());
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    setView("details");
  };

  const handleBack = () => {
    setView("list");
    setSelectedId(null);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-teal-50/60 to-cyan-50/60 min-h-screen relative">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-100/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-teal-50/10 to-cyan-50/10 rounded-full blur-3xl"></div>
      </div>

      {/* Back Button - EXACT SAME as TeacherAdminHealthScreen */}
      <button
        onClick={handleBackClick}
        className={`fixed top-20 left-4 sm:left-8 z-50 w-10 h-10 sm:w-8 sm:h-8 bg-teal-500 shadow-lg flex items-center justify-center rounded-full hover:bg-teal-600 active:scale-95 transition-all duration-300 ${
          showBackButton ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
        title="Back"
        style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-6 pb-4">
        {/* Enhanced Title with Icon - EXACT SAME structure as TeacherAdminHealthScreen */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 space-y-3 sm:space-y-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl border border-white/20 backdrop-blur-sm sm:mr-4">
              <SuggestionIcon />
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent tracking-tight">
              Manage Suggestions
            </h1>
          </div>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto rounded-full"></div>
          <p className="text-gray-600 mt-4 text-sm sm:text-base">
            Submit feedback and track your suggestions
          </p>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {view === "list" && <SuggestionListView onSelect={handleSelect} onCreate={() => setView("create")} />}
          
          {view === "details" && selectedId && (
            <div className="backdrop-blur-sm bg-white/90 rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 min-h-[80vh]">
              <ConversationView suggestionId={selectedId} onBack={handleBack} isAdmin={false} />
            </div>
          )}
          
          {view === "create" && <CreateSuggestionView onBack={handleBack} />}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
