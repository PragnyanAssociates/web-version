import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx";
import { API_BASE_URL } from "../../apiConfig";
import { FiArrowLeft } from "react-icons/fi";
import { MdVolunteerActivism, MdHistory, MdPayment, MdUpload, MdVerified, MdPending } from "react-icons/md";

// Scroll-based visibility hook (EXACT SAME as TeacherAdminHealthScreen)
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

const THEME = {
  success: "#28a745",
  warning: "#ffc107",
  muted: "#6c757d"
};

export default function DonorSponsorScreen() {
  const navigate = useNavigate();
  const showBackButton = useScrollButtonVisibility();
  const { user } = useAuth();

  const [view, setView] = useState("form");
  const [sponsorshipApplication, setSponsorshipApplication] = useState(null);

  const getDefaultDashboardRoute = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/AdminDashboard';
    if (user.role === 'teacher') return '/TeacherDashboard';
    if (user.role === 'student') return '/StudentDashboard';
    return '/';
  };

  const handleBackClick = () => {
    navigate(getDefaultDashboardRoute());
  };

  const handleFormSubmit = (appData) => {
    setSponsorshipApplication(appData);
    setView("paymentDetails");
  };
  const handleProceedToUpload = () => setView("uploadProof");
  const handleUploadSuccess = () => setView("history");

  return (
    <div className="bg-gradient-to-br from-slate-50 via-teal-50/60 to-cyan-50/60 min-h-screen relative">
      {/* EXACT SAME Back Button as TeacherAdminHealthScreen */}
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

      {view === "history" ? (
        <HistoryView 
          onBack={() => setView("form")} 
          showBackButton={showBackButton}
        />
      ) : (
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 pt-6 pb-4">
          {view === "form" && (
            <SponsorshipForm 
              onSubmit={handleFormSubmit} 
              onShowHistory={() => setView("history")} 
            />
          )}
          {view === "paymentDetails" && (
            <PaymentDetailsView 
              onBack={() => setView("form")} 
              onProceed={handleProceedToUpload} 
            />
          )}
          {view === "uploadProof" && (
            <UploadProofView
              application={sponsorshipApplication}
              onBack={() => setView("paymentDetails")}
              onUploadSuccess={handleUploadSuccess}
            />
          )}
        </div>
      )}
    </div>
  );
}

function HistoryView({ onBack, showBackButton }) {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(() => {
    if (!user) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/sponsorship/history/${user.id}`)
      .then((res) => res.json())
      .then(setHistory)
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getStatusStyle = (status) => {
    if (status === "Verified") return "bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-green-300";
    if (status === "Pending") return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300";
    return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border-gray-300";
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-teal-50/60 to-cyan-50/60 min-h-screen relative">
      {/* Back Button */}
      <button
        onClick={onBack}
        className={`fixed top-20 left-4 sm:left-8 z-50 w-10 h-10 sm:w-8 sm:h-8 bg-teal-500 shadow-lg flex items-center justify-center rounded-full hover:bg-teal-600 active:scale-95 transition-all duration-300 ${
          showBackButton ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
        title="Back to Form"
        style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}
      >
        <FiArrowLeft className="text-white w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pt-6 pb-4">
        {/* Title Structure */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 space-y-3 sm:space-y-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl border border-white/20 backdrop-blur-sm sm:mr-4">
              <MdHistory size={24} className="text-white sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent tracking-tight">
              My Sponsorships
            </h1>
          </div>
        </div>

        {/* Enhanced Content Container */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 transform transition-all duration-500 hover:shadow-3xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-white/50 to-gray-50/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Sponsorship History</h2>
                <p className="text-gray-600">Track your donation applications and their status</p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 rounded-2xl border border-blue-200/60">
                <div className="text-lg font-bold text-blue-700">{history.length}</div>
                <div className="text-xs text-blue-600">Applications</div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="p-6">
            <div className="overflow-hidden rounded-2xl border border-gray-200/60 bg-white/80 backdrop-blur-sm shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/60">
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm">Name</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm">Date Applied</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm">Amount</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm">Status</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm">Message</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm">Proof</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="p-16 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="relative mx-auto mb-4">
                              <div className="h-12 w-12 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin shadow-lg"></div>
                              <div className="absolute inset-0 h-12 w-12 border-4 border-transparent rounded-full border-r-blue-400 animate-pulse"></div>
                            </div>
                            <p className="text-blue-700 font-medium">Loading history...</p>
                          </div>
                        </td>
                      </tr>
                    ) : history.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-16 text-center">
                          <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <MdVolunteerActivism size={32} className="text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">No sponsorships found</h3>
                          <p className="text-gray-500">Your sponsorship applications will appear here</p>
                        </td>
                      </tr>
                    ) : (
                      history.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100/60 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-teal-50/30 transition-all duration-200">
                          <td className="px-6 py-4 font-semibold text-gray-900 max-w-[200px] truncate" title={item.full_name}>
                            {item.full_name}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {new Date(item.application_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {item.amount ? `₹${item.amount}` : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-6 py-4">
                            {item.amount ? (
                              <span className={`inline-flex items-center px-3 py-1 rounded-full font-semibold text-sm border shadow-sm ${getStatusStyle(item.status)}`}>
                                {item.status === "Verified" && <MdVerified className="mr-1" size={16} />}
                                {item.status === "Pending" && <MdPending className="mr-1" size={16} />}
                                {item.status}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 font-semibold text-sm border border-gray-300 shadow-sm">
                                <MdPending className="mr-1" size={16} />
                                Proof Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 max-w-[250px] text-gray-700 break-words" title={item.message || ""}>
                            {item.message || "—"}
                          </td>
                          <td className="px-6 py-4">
                            {item.screenshot_url ? (
                              <a href={`${API_BASE_URL}${item.screenshot_url}`} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={`${API_BASE_URL}${item.screenshot_url}`}
                                  alt="Payment Proof"
                                  className="w-16 h-16 object-cover rounded-xl border border-gray-200/60 shadow-sm hover:shadow-lg transition-shadow duration-300 hover:scale-105"
                                />
                              </a>
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SponsorshipForm({ onSubmit, onShowHistory }) {
  // 🔥 FIXED: Updated form state with proper field names
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    message: "",
    wantsUpdates: false,
    wantsToVisit: false,  // Fixed: Changed from wantsVisit to wantsToVisit
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleInputChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleCheckboxChange = (field) =>
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));

  // 🔥 FIXED: Updated handleSubmit to send proper data format
  const handleSubmit = async () => {
    if (!form.fullName || !form.email || !form.phone) {
      alert("Full Name, Email, and Phone Number are required.");
      return;
    }
    setLoading(true);
    try {
      // 🔥 FIXED: Properly map form data to expected backend format
      const payload = {
        donorId: user.id,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        organization: form.organization || '',  // Ensure not null
        message: form.message || '',           // Ensure not null
        wantsUpdates: form.wantsUpdates ? 1 : 0,      // Convert boolean to int
        wantsToVisit: form.wantsToVisit ? 1 : 0       // Convert boolean to int - This fixes the NULL error
      };

      console.log('Sending payload:', payload); // Debug log

      const res = await fetch(`${API_BASE_URL}/api/sponsorship/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      console.log('Response:', data); // Debug log
      
      if (res.ok) {
        onSubmit({ applicationId: data.applicationId });
      } else {
        throw new Error(data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error('Submit error:', err); // Debug log
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* EXACT SAME Title Structure as TeacherAdminHealthScreen */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-center mb-4 space-y-3 sm:space-y-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl border border-white/20 backdrop-blur-sm sm:mr-4">
            <MdVolunteerActivism size={24} className="text-white sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent tracking-tight">
            Sponsorship Registration
          </h1>
        </div>
      </div>

      {/* Enhanced Content Container */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 transform transition-all duration-500 hover:shadow-3xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-white/50 to-gray-50/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Apply for Sponsorship</h2>
              <p className="text-gray-600">Help support education by becoming a sponsor</p>
            </div>
            <button
              onClick={onShowHistory}
              className="flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 border border-blue-200/60"
            >
              <MdHistory className="mr-2" size={18} />
              View My Sponsorships
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 sm:p-8">
          <div className="space-y-6">
            <FormInput 
              label="Full Name" 
              value={form.fullName} 
              onChange={(e) => handleInputChange("fullName", e.target.value)} 
              required 
            />
            <FormInput 
              label="Email" 
              type="email" 
              value={form.email} 
              onChange={(e) => handleInputChange("email", e.target.value)} 
              required 
            />
            <FormInput 
              label="Phone" 
              type="tel" 
              value={form.phone} 
              onChange={(e) => handleInputChange("phone", e.target.value)} 
              required 
            />
            <FormInput 
              label="Organization" 
              value={form.organization} 
              onChange={(e) => handleInputChange("organization", e.target.value)} 
            />
            <FormInput 
              label="Message" 
              value={form.message} 
              onChange={(e) => handleInputChange("message", e.target.value)} 
              multiline 
            />
            
            {/* Enhanced Checkbox Section */}
            <div className="bg-gradient-to-r from-gray-50/50 to-white/50 rounded-2xl p-6 border border-gray-200/60">
              <h3 className="font-semibold text-gray-700 mb-4">Preferences</h3>
              <div className="space-y-4">
                <Checkbox 
                  label="I want to receive updates and photos" 
                  checked={form.wantsUpdates} 
                  onChange={() => handleCheckboxChange("wantsUpdates")} 
                />
                {/* 🔥 FIXED: Updated to use wantsToVisit */}
                <Checkbox 
                  label="I am interested in school events and visits" 
                  checked={form.wantsToVisit} 
                  onChange={() => handleCheckboxChange("wantsToVisit")} 
                />
              </div>
            </div>
          </div>

          <button
            className={`w-full mt-8 py-4 rounded-2xl text-white text-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 border ${
              loading 
                ? "bg-gray-400 cursor-not-allowed border-gray-300" 
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-blue-500/30"
            }`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 rounded-full border-t-white animate-spin"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              "Proceed to Payment"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentDetailsView({ onBack, onProceed }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/payment-details`)
      .then((res) => res.json())
      .then(setDetails)
      .catch(() => alert("Failed to load payment details"))
      .finally(() => setLoading(false));
  }, []);

  const qrCodeUri = details?.qr_code_url ? `${API_BASE_URL}${details.qr_code_url}` : null;

  return (
    <div>
      {/* Title Structure */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-center mb-4 space-y-3 sm:space-y-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl border border-white/20 backdrop-blur-sm sm:mr-4">
            <MdPayment size={24} className="text-white sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent tracking-tight">
            Make Payment
          </h1>
        </div>
      </div>

      {/* Enhanced Content Container */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 transform transition-all duration-500 hover:shadow-3xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-white/50 to-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Payment Information</h2>
              <p className="text-gray-600">Use the details below to make your sponsorship payment</p>
            </div>
            <button
              onClick={onBack}
              className="p-3 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 border border-gray-200/60"
              title="Go Back"
            >
              <FiArrowLeft size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative mx-auto mb-4">
                <div className="h-12 w-12 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin shadow-lg"></div>
                <div className="absolute inset-0 h-12 w-12 border-4 border-transparent rounded-full border-r-blue-400 animate-pulse"></div>
              </div>
              <p className="text-blue-700 font-medium">Loading payment details...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* QR Code Section */}
              <div className="text-center">
                {qrCodeUri ? (
                  <div className="inline-block p-4 bg-white rounded-2xl shadow-lg border border-gray-200/60">
                    <img src={qrCodeUri} alt="Payment QR Code" className="mx-auto rounded-xl max-w-72 shadow-md" />
                  </div>
                ) : (
                  <div className="inline-block p-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl shadow-inner border border-gray-200/60">
                    <div className="w-72 h-72 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
                      <span className="text-gray-500 font-semibold text-lg">QR Code Not Available</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bank Details Grid */}
              <div className="bg-gradient-to-r from-gray-50/50 to-white/50 rounded-2xl p-6 border border-gray-200/60">
                <h3 className="font-semibold text-gray-700 mb-6 text-lg">Bank Account Details</h3>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                  <DetailRow label="Account Holder" value={details?.account_holder_name} />
                  <DetailRow label="Account Number" value={details?.account_number} />
                  <DetailRow label="IFSC Code" value={details?.ifsc_code} />
                  <DetailRow label="CIF Code" value={details?.cif_code} />
                </div>
              </div>

              {/* Action Button */}
              <button
                className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold text-lg rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 border border-green-500/30"
                onClick={onProceed}
              >
                I've Paid, Upload Proof
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadProofView({ application, onBack, onUploadSuccess }) {
  const [amount, setAmount] = useState("");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleChoosePhoto = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!photo || !amount) {
      alert("Please enter the amount and select a file.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("applicationId", application.applicationId);
    formData.append("donorId", user.id);
    formData.append("amount", amount);
    formData.append("screenshot", photo);

    try {
      const res = await fetch(`${API_BASE_URL}/api/sponsorship/upload-proof`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        alert(result.message);
        onUploadSuccess();
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Title Structure */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-center mb-4 space-y-3 sm:space-y-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl border border-white/20 backdrop-blur-sm sm:mr-4">
            <MdUpload size={24} className="text-white sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent tracking-tight">
            Upload Payment Proof
          </h1>
        </div>
      </div>

      {/* Enhanced Content Container */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 transform transition-all duration-500 hover:shadow-3xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-white/50 to-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Submit Payment Proof</h2>
              <p className="text-gray-600">Upload your payment screenshot and enter the amount</p>
            </div>
            <button
              onClick={onBack}
              className="p-3 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 border border-gray-200/60"
              title="Go Back"
            >
              <FiArrowLeft size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <div className="space-y-8">
            {/* Amount Input */}
            <FormInput
              label="Amount Paid (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              required
              min="1"
              placeholder="Enter the amount you paid"
            />

            {/* File Upload Section */}
            <div>
              <label className="block font-semibold mb-4 text-gray-700">
                Payment Screenshot <span className="text-red-600">*</span>
              </label>
              <label
                htmlFor="photo-upload"
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300/60 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 p-8 min-h-[20rem] bg-gradient-to-br from-gray-50/30 to-white/30"
              >
                {photo ? (
                  <div className="text-center">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt="Selected payment proof"
                      className="max-h-64 max-w-full rounded-2xl shadow-lg border border-gray-200/60 mb-4"
                    />
                    <p className="text-green-600 font-semibold">Image selected successfully</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MdUpload size={28} className="text-gray-500" />
                    </div>
                    <p className="text-gray-600 font-semibold mb-2">Click to select payment screenshot</p>
                    <p className="text-gray-500 text-sm">PNG, JPG, or JPEG files only</p>
                  </div>
                )}
                <input 
                  id="photo-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleChoosePhoto} 
                  className="hidden" 
                />
              </label>
            </div>

            {/* Submit Button */}
            <button
              className={`w-full py-4 rounded-2xl text-white font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 border ${
                loading 
                  ? "bg-gray-400 cursor-not-allowed border-gray-300" 
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-blue-500/30"
              }`}
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 rounded-full border-t-white animate-spin"></div>
                  <span>Uploading...</span>
                </div>
              ) : (
                <>
                  <MdUpload className="inline mr-2" size={20} />
                  Submit Proof
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Enhanced Shared UI Components ---
function FormInput({ label, multiline, type = "text", required, ...props }) {
  return (
    <div>
      <label className="block font-semibold mb-2 text-gray-700">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {multiline ? (
        <textarea
          rows={4}
          className="w-full border-2 border-gray-200/60 rounded-2xl p-4 resize-none focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-inner"
          {...props}
        />
      ) : (
        <input
          type={type}
          className="w-full border-2 border-gray-200/60 rounded-2xl p-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-inner"
          {...props}
        />
      )}
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center space-x-3 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div className={`w-5 h-5 rounded border-2 transition-all duration-300 ${
          checked 
            ? 'bg-blue-500 border-blue-500' 
            : 'bg-white border-gray-300 group-hover:border-blue-400'
        }`}>
          {checked && (
            <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-gray-700 font-medium group-hover:text-blue-700 transition-colors duration-200">
        {label}
      </span>
    </label>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="bg-white/80 rounded-xl p-4 border border-gray-200/60 shadow-sm">
      <div className="text-sm font-semibold text-gray-600 mb-1">{label}</div>
      <div className="text-base font-medium text-gray-900 break-words">{value || "N/A"}</div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="relative">
      <div className="h-9 w-9 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin shadow-lg"></div>
      <div className="absolute inset-0 h-9 w-9 border-4 border-transparent rounded-full border-r-blue-400 animate-pulse"></div>
    </div>
  );
}
