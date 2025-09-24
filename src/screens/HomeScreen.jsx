import React from 'react';
import { useNavigate } from 'react-router-dom';
import vspngoLogo from '../assets/pragnyanlatest.png'; // Updated logo path

// Helper component for role buttons for cleaner code
const RoleButton = ({ role, onClick }) => {
  const colors = {
    Admin: 'bg-blue-100 text-blue-800',
    Student: 'bg-green-100 text-green-800',
    Teacher: 'bg-indigo-100 text-indigo-800',
    Driver: 'bg-orange-100 text-orange-800', // Added color for Driver
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-slate-50 rounded-xl border border-slate-200 
                 flex items-center space-x-4
                 transition-all duration-300 ease-out 
                 hover:shadow-lg hover:border-indigo-400 hover:bg-white
                 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <div className={`p-3 rounded-lg ${colors[role.name] || 'bg-gray-100'}`}>
        <img 
          src={role.icon} 
          alt={`${role.name} icon`}
          className="w-8 h-8 object-contain"
          loading="lazy"
        />
      </div>
      <span className="text-lg font-semibold text-slate-700">{role.name}</span>
    </button>
  );
};

export default function HomeScreen() {
  const navigate = useNavigate();

  const roles = [
    { id: 2, name: "Admin", icon: "https://cdn-icons-png.flaticon.com/512/17003/17003310.png", type: 'login', target: 'admin' },
    { id: 3, name: "Student", icon: "https://cdn-icons-png.flaticon.com/128/2784/2784403.png", type: 'login', target: 'student' },
    { id: 4, name: "Teacher", icon: "https://cdn-icons-png.freepik.com/256/14416/14416005.png?semt=ais_hybrid", type: 'login', target: 'teacher' },
    { 
      id: 5, 
      name: "Driver", 
      icon: "https://cdn-icons-png.flaticon.com/128/1535/1535791.png", // CORRECTED Driver icon URL
      type: 'login', 
      target: 'driver' 
    },
    /* { 
      id: 6, 
      name: "Donor", 
      icon: "https://cdn-icons-png.flaticon.com/128/10880/10880476.png", 
      type: 'login', 
      target: 'donor' 
    }, */
  ];

  const handleRolePress = (item) => {
    if (item.type === 'login') {
      navigate('/LoginScreen', { state: { role: item.target } });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40">
        <div className="w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
      </div>
      <div className="pointer-events-none absolute -bottom-40 -right-40">
        <div className="w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-4xl z-10">
        <div className="grid md:grid-cols-2 bg-white rounded-2xl shadow-2xl shadow-slate-300/40 overflow-hidden border border-slate-200/50">
          
          {/* Left Column: Branding */}
          <div className="p-8 md:p-12 bg-slate-100/80 flex flex-col justify-center items-center md:items-start text-center md:text-left">
            <img 
              src={vspngoLogo} 
              alt="Pragnyan Logo" 
              className="w-24 h-24 object-contain mb-4 animate-fade-in-down"
            />
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-2 animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
              PRAGNYAN ASSOCIATES
            </h1>
            <p className="text-base text-slate-600 max-w-sm animate-fade-in-down" style={{ animationDelay: '0.4s' }}>
              "Simplifying Management, Empowering Institutions."
            </p>
          </div>

          {/* Right Column: Role Selection */}
          <div className="p-8 md:p-12">
            <h2 className="text-2xl font-semibold text-slate-700 mb-6 text-center md:text-left">Select Your Role</h2>
            <div className="space-y-4">
              {roles.map((roleItem, index) => (
                <div key={roleItem.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.2}s` }}>
                  <RoleButton role={roleItem} onClick={() => handleRolePress(roleItem)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="absolute bottom-4 text-center w-full">
        <p className="text-slate-500 text-sm">© 2025 Pragnyan</p>
      </footer>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in-down { 0% { opacity: 0; transform: translateY(-20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-down, .animate-fade-in-up { animation-fill-mode: both; animation-duration: 0.8s; animation-timing-function: ease-out; }
        .animate-fade-in-down { animation-name: fade-in-down; }
        .animate-fade-in-up { animation-name: fade-in-up; }
      `}</style>
    </div>
  );
}