import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { API_BASE_URL } from '../apiConfig';
import { MdArrowBack } from 'react-icons/md';

// --- Icon Components for Header (No Change) ---
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

// --- DATA (No Change) ---
const committeeData = {
    "Patrons": ["Padma Vibhushan Dr Palle Rama Rao Garu", "Sri B.D. Jain"],
    "President": ["C. Vidya Sagar"],
    "Vice Presidents": ["Dr. Y.Krishna", "G.Shankar"],
    "Secretary": ["Dhathri Priya"],
    "Treasurer": ["Dr. H.Sarvothaman"],
    "Joint Secretary": ["Renuka Chekkala"],
    "Organising Secretary": ["Smita Rane"],
    "Executive Members": ["Yugandhara Babu Lella", "Aarti Joshi", "M. Vijaya"]
};

const services = [
    { name: "Free Education", icon: "🎓" },
    { name: "Midday Meals", icon: "🍱" },
    { name: "Uniforms & Books", icon: "👕" },
    { name: "Medical Assistance", icon: "❤️‍🩹" },
    { name: "Quality Teaching", icon: "🧑‍🏫" },
    { name: "Holistic Development", icon: "🌱" }
];

// --- HELPER COMPONENTS (Revised) ---

// Generic Section Wrapper (Simplified)
function Section({ title, children }) {
    return (
        <section className="py-16 sm:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        {title}
                    </h2>
                    <div className="mt-4 h-1 w-20 bg-indigo-600 mx-auto rounded"></div>
                </div>
                <div className="mt-12">
                    {children}
                </div>
            </div>
        </section>
    );
}

// Card for "How You Can Help"
function CtaCard({ icon, title, onClick }) {
    return (
        <button
            onClick={onClick}
            className="group text-center p-6 bg-white hover:bg-indigo-600 rounded-lg shadow-sm border border-gray-200 transition-all duration-300 w-full"
        >
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mx-auto transition-all duration-300 group-hover:bg-white group-hover:text-indigo-600 group-hover:scale-110">
                <span className="text-3xl">{icon}</span>
            </div>
            <h3 className="mt-5 text-lg font-semibold text-gray-900 transition-colors duration-300 group-hover:text-white">{title}</h3>
        </button>
    );
}

function ExternalLink({ url, children }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 transition-colors">
      {children}
    </a>
  );
}

// --- MAIN COMPONENT ---
export default function AboutUs() {
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
  const navigate = useNavigate();

  // --- State for Header (No Change) ---
  const [profile, setProfile] = useState(null);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  const [query, setQuery] = useState("");

  // --- Hooks for Header Functionality (No Change) ---
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
        if (!user?.id) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/profiles/${user.id}`);
            if (res.ok) { setProfile(await res.json()); }
            else { setProfile({ id: user.id, username: user.username || "Unknown", full_name: user.full_name || "User", role: user.role || "user" }); }
        } catch { setProfile(null); }
    }
    fetchProfile();
  }, [user]);

  // --- Helper Functions (No Change) ---
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

  const handleCtaClick = (cta) => {
    alert(`Thank you for your interest in "${cta}"! Please contact us to learn more.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ================================================================== */}
      {/* HEADER (UPDATED BACKGROUND COLOR)                                */}
      {/* ================================================================== */}
      <header className="border-b border-gray-200 bg-slate-50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700 truncate">About Us</h1>
              <p className="text-xs sm:text-sm text-gray-600">Learn more about our mission and team</p>
            </div>
            <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
              <div className="relative">
                <input id="module-search" type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="w-full sm:w-44 lg:w-64 rounded-md border border-gray-200 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="inline-flex items-stretch rounded-lg border border-gray-200 bg-white overflow-hidden">
                <button onClick={() => navigate(getDefaultDashboardRoute())} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition" type="button" title="Home"><HomeIcon /><span className="hidden md:inline">Home</span></button>
                <div className="w-px bg-gray-200" aria-hidden="true" />
                <button onClick={() => navigate("/AcademicCalendar")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition" type="button" title="Calendar"><CalendarIcon /><span className="hidden md:inline">Calendar</span></button>
                <div className="w-px bg-gray-200" aria-hidden="true" />
                <button onClick={() => navigate("/ProfileScreen")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition" type="button" title="Profile"><UserIcon /><span className="hidden md:inline">Profile</span></button>
              </div>
              <div className="h-4 sm:h-6 w-px bg-gray-200 mx-0.5 sm:mx-1" aria-hidden="true" />
              <div className="flex items-center gap-2 sm:gap-3">
                <img src={getProfileImageUrl() || "/placeholder.svg"} alt="Profile" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-gray-200 object-cover" onError={(e) => { e.currentTarget.src = "/assets/profile.png" }} />
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[8ch] sm:max-w-[12ch]">{profile?.full_name || profile?.username || "User"}</span>
                  <span className="text-xs text-gray-600 capitalize">{profile?.role || ""}</span>
                </div>
                <button onClick={handleLogout} className="inline-flex items-center rounded-md bg-indigo-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><span className="hidden sm:inline">Logout</span><span className="sm:hidden">Exit</span></button>
                <button onClick={() => navigate("/NotificationsScreen")} className="relative inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-1.5 sm:p-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label="Notifications" title="Notifications" type="button">
                  <BellIcon />
                  {unreadCount > 0 && (<span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white bg-red-600 rounded-full min-w-[16px] sm:min-w-[18px]">{unreadCount > 99 ? "99+" : unreadCount}</span>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* ================================================================== */}
      {/* MAIN CONTENT (UPDATED BACKGROUND COLORS)                           */}
      {/* ================================================================== */}
      <main className="bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button onClick={() => navigate(getDefaultDashboardRoute())} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors" title="Back to Dashboard">
            <MdArrowBack /><span>Back to Dashboard</span>
          </button>
        </div>

        {/* --- Hero Section --- */}
        <div className="bg-slate-50 text-center py-20 sm:py-24 px-4 border-b border-gray-200">
            <img src={require('../assets/vspngo-logo.png')} alt="VSPNGO Logo" className="w-32 h-auto mx-auto mb-4" />
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Vivekananda Public School
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
                "They Alone Live Who Live For Others" — Swami Vivekananda
            </p>
        </div>

        {/* --- Our Mission & Commitment --- */}
        <div className="py-16 sm:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
                {/* Left Column: Mission Text */}
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Our Mission & Commitment</h2>
                    <p className="mt-4 text-lg text-gray-600">
                        At Vivekananda Public School, we are dedicated to providing quality English medium education to underprivileged students. Our vision, inspired by Swami Vivekananda, focuses on holistic development and character building. We believe education is the most powerful tool to transform lives and communities.
                    </p>
                </div>
                {/* Right Column: Services List */}
                <div className="bg-white p-8 rounded-lg border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800">What We Provide</h3>
                    <ul className="mt-6 space-y-4">
                        {services.map(item => (
                            <li key={item.name} className="flex items-center gap-x-3">
                                <span className="text-2xl" role="img" aria-label={item.name}>{item.icon}</span>
                                <span className="font-medium text-gray-700">{item.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

        {/* --- Join Our Cause (CTA) --- */}
        <Section title="Join Our Cause">
            <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <CtaCard icon="❤️" title="Sponsor a Child" onClick={() => handleCtaClick("Sponsor a Child")} />
                <CtaCard icon="🎁" title="Donate in Kind" onClick={() => handleCtaClick("Donate in Kind")} />
                <CtaCard icon="🍽️" title="Sponsor a Meal" onClick={() => handleCtaClick("Sponsor a Meal")} />
                <CtaCard icon="🤝" title="Volunteer" onClick={() => handleCtaClick("Volunteer")} />
            </div>
        </Section>
        
        {/* ================================================================== */}
        {/* MANAGEMENT COMMITTEE (DESIGN AS LIKED - NO CHANGE)               */}
        {/* ================================================================== */}
        <div className="bg-slate-50">
            <Section title="Management Committee">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {Object.entries(committeeData).map(([role, members]) => (
                        <div key={role} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <h3 className="font-bold text-lg text-gray-800">{role}</h3>
                            <ul className="mt-3 space-y-2 text-gray-600">
                                {members.map((name, idx) => (
                                    <li key={`${role}-${idx}`} className="flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                        {name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </Section>
        </div>

        {/* --- Get In Touch --- */}
        <Section title="Get In Touch">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 bg-white p-8 rounded-lg border border-gray-200">
                {/* Left Column: Map Placeholder */}
                <div className="bg-gray-200 rounded-lg flex items-center justify-center min-h-[300px]">
                    <p className="text-gray-500 font-medium">Map of Srinagar Colony, Hyderabad</p>
                </div>
                {/* Right Column: Contact Details */}
                <div className="flex flex-col justify-center">
                    <div className="space-y-5">
                        <div className="flex items-start gap-4">
                            <span className="text-2xl mt-1">📍</span>
                            <div>
                                <h4 className="font-semibold text-gray-800">Our Address</h4>
                                <p className="text-gray-600">H.No. 8-3-1100, A&A1, Plot No. 112, <br />Srinagar Colony, Hyderabad, <br />Telangana-500073, India</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="text-2xl mt-1">✉️</span>
                             <div>
                                <h4 className="font-semibold text-gray-800">Email Us</h4>
                                <p className="text-gray-600"><ExternalLink url="mailto:vivekanandaschoolhyd@gmail.com">vivekanandaschoolhyd@gmail.com</ExternalLink></p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="text-2xl mt-1">📞</span>
                             <div>
                                <h4 className="font-semibold text-gray-800">Call Us</h4>
                                <p className="text-gray-600"><ExternalLink url="tel:040-23355998">040-23355998</ExternalLink> / <ExternalLink url="tel:+919394073325">+91 9394073325</ExternalLink></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
      </main>
    </div>
  );
}