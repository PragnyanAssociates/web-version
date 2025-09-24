import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext.tsx';
import { API_BASE_URL } from '../../apiConfig';
import { MdPayment, MdHistory, MdUpload, MdClose, MdAccountBalanceWallet } from 'react-icons/md';

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

export default function DonorPaymentScreen() {
  const navigate = useNavigate();
  const showBackButton = useScrollButtonVisibility();
  const { user } = useAuth();

  const [view, setView] = useState('menu'); // 'menu', 'makePayment', 'uploadProof', 'history'

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

  const renderContent = () => {
    switch (view) {
      case 'menu': 
        return (
          <PaymentMenu 
            onMakePayment={() => setView('makePayment')} 
            onViewHistory={() => setView('history')}
            showBackButton={showBackButton}
            handleBackClick={handleBackClick}
          />
        );
      case 'makePayment': 
        return (
          <MakePaymentView 
            onBack={() => setView('menu')} 
            onUploadProof={() => setView('uploadProof')}
            showBackButton={showBackButton}
          />
        );
      case 'uploadProof': 
        return (
          <UploadProofView 
            onBack={() => setView('makePayment')} 
            onUploadSuccess={() => setView('history')}
            showBackButton={showBackButton}
          />
        );
      case 'history': 
        return (
          <HistoryView 
            onBack={() => setView('menu')}
            showBackButton={showBackButton}
          />
        );
      default: 
        return (
          <PaymentMenu 
            onMakePayment={() => setView('makePayment')} 
            onViewHistory={() => setView('history')}
            showBackButton={showBackButton}
            handleBackClick={handleBackClick}
          />
        );
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-teal-50/60 to-cyan-50/60 min-h-screen relative">
      {renderContent()}
    </div>
  );
}

function PaymentMenu({ onMakePayment, onViewHistory, showBackButton, handleBackClick }) {
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 pt-6 pb-4 flex flex-col justify-center min-h-screen">
        {/* EXACT SAME Title Structure as TeacherAdminHealthScreen */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 space-y-3 sm:space-y-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl border border-white/20 backdrop-blur-sm sm:mr-4">
              <MdAccountBalanceWallet size={24} className="text-white sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent tracking-tight">
              Payment Center
            </h1>
          </div>
        </div>

        {/* Enhanced Content Container */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 transform transition-all duration-500 hover:shadow-3xl">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Make a Payment</h2>
              <p className="text-gray-600">Manage your donations and payment history</p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <button
                onClick={onMakePayment}
                className="w-full flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 border border-green-500/30"
              >
                <MdPayment className="mr-3" size={20} />
                Make a Payment
              </button>
              <button
                onClick={onViewHistory}
                className="w-full flex items-center justify-center bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 border border-gray-400/30"
              >
                <MdHistory className="mr-3" size={20} />
                View Payment History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MakePaymentView({ onBack, onUploadProof, showBackButton }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/payment-details`)
      .then(res => res.json())
      .then(data => setDetails(data))
      .catch(() => alert('Failed to fetch payment details'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-teal-50/60 to-cyan-50/60 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-4">
            <div className="h-16 w-16 border-4 border-teal-200 rounded-full border-t-teal-600 animate-spin shadow-lg"></div>
            <div className="absolute inset-0 h-16 w-16 border-4 border-transparent rounded-full border-r-teal-400 animate-pulse"></div>
          </div>
          <p className="text-teal-700 font-medium">Loading payment details...</p>
        </div>
      </div>
    );
  }

  const qrCodeUri = details?.qr_code_url ? `${API_BASE_URL}${details.qr_code_url}` : null;

  return (
    <div className="bg-gradient-to-br from-slate-50 via-teal-50/60 to-cyan-50/60 min-h-screen relative">
      {/* Back Button */}
      <button
        onClick={onBack}
        className={`fixed top-20 left-4 sm:left-8 z-50 w-10 h-10 sm:w-8 sm:h-8 bg-teal-500 shadow-lg flex items-center justify-center rounded-full hover:bg-teal-600 active:scale-95 transition-all duration-300 ${
          showBackButton ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
        title="Back to Menu"
        style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 pt-6 pb-4 flex flex-col justify-center min-h-screen">
        {/* Title Structure */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 space-y-3 sm:space-y-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl border border-white/20 backdrop-blur-sm sm:mr-4">
              <MdPayment size={24} className="text-white sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent tracking-tight">
              Payment Details
            </h1>
          </div>
        </div>

        {/* Enhanced Content Container */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 transform transition-all duration-500 hover:shadow-3xl">
          <div className="p-6 sm:p-8">
            <div className="max-w-2xl mx-auto">
              {/* QR Code Section */}
              <div className="text-center mb-8">
                {qrCodeUri ? (
                  <div className="inline-block p-4 bg-white rounded-2xl shadow-lg border border-gray-200/60">
                    <img src={qrCodeUri} alt="Payment QR Code" className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl shadow-md" />
                  </div>
                ) : (
                  <div className="inline-block p-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl shadow-inner border border-gray-200/60">
                    <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl">
                      <span className="text-gray-500 font-semibold text-lg">QR Code not available</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bank Details */}
              <div className="bg-gradient-to-r from-gray-50/50 to-white/50 rounded-2xl p-6 border border-gray-200/60 mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-6">Bank Account Details</h3>
                <div className="space-y-4">
                  <DetailRow label="Account Holder Name" value={details?.account_holder_name} />
                  <DetailRow label="Bank Account Number" value={details?.account_number} />
                  <DetailRow label="IFSC Code" value={details?.ifsc_code} />
                  <DetailRow label="CIF Code" value={details?.cif_code} />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={onUploadProof}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 border border-blue-500/30"
              >
                I've Paid, Upload Screenshot
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadProofView({ onBack, onUploadSuccess, showBackButton }) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!photo || !amount) {
      alert('Please enter the amount and select a screenshot.');
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append('donorId', user.id);
    formData.append('amount', amount);
    formData.append('screenshot', photo);

    try {
      const res = await fetch(`${API_BASE_URL}/api/donor/payment-proof`, {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        alert(result.message);
        onUploadSuccess();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      alert('Upload Failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-teal-50/60 to-cyan-50/60 min-h-screen relative">
      {/* Back Button */}
      <button
        onClick={onBack}
        className={`fixed top-20 left-4 sm:left-8 z-50 w-10 h-10 sm:w-8 sm:h-8 bg-teal-500 shadow-lg flex items-center justify-center rounded-full hover:bg-teal-600 active:scale-95 transition-all duration-300 ${
          showBackButton ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
        title="Back to Payment Details"
        style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 pt-6 pb-4 flex flex-col justify-center min-h-screen">
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
          <div className="p-6 sm:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Amount Input */}
              <FormInput 
                label="Amount Paid (₹)" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                type="number" 
                required 
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
                        alt="Payment proof preview"
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
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                </label>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleUpload}
                disabled={loading}
                className={`w-full py-4 rounded-2xl text-white font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 border ${
                  loading 
                    ? "bg-gray-400 cursor-not-allowed border-gray-300" 
                    : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-green-500/30"
                }`}
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
    </div>
  );
}

function HistoryView({ onBack, showBackButton }) {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchHistory = useCallback(() => {
    if (!user) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/donor/payment-history/${user.id}`)
      .then(res => res.json())
      .then(data => setHistory(Array.isArray(data) ? data : []))
      .catch(() => alert('Could not fetch payment history.'))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const openModal = (imgUrl) => {
    setSelectedImage(imgUrl);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-teal-50/60 to-cyan-50/60 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-4">
            <div className="h-16 w-16 border-4 border-teal-200 rounded-full border-t-teal-600 animate-spin shadow-lg"></div>
            <div className="absolute inset-0 h-16 w-16 border-4 border-transparent rounded-full border-r-teal-400 animate-pulse"></div>
          </div>
          <p className="text-teal-700 font-medium">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-teal-50/60 to-cyan-50/60 min-h-screen relative">
      {/* Back Button */}
      <button
        onClick={onBack}
        className={`fixed top-20 left-4 sm:left-8 z-50 w-10 h-10 sm:w-8 sm:h-8 bg-teal-500 shadow-lg flex items-center justify-center rounded-full hover:bg-teal-600 active:scale-95 transition-all duration-300 ${
          showBackButton ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
        title="Back to Menu"
        style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
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
              Payment History
            </h1>
          </div>
        </div>

        {/* Enhanced Content Container */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 transform transition-all duration-500 hover:shadow-3xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-white/50 to-gray-50/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">My Payment History</h2>
                <p className="text-gray-600">View all your submitted payment proofs</p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 rounded-2xl border border-blue-200/60">
                <div className="text-lg font-bold text-blue-700">{history.length}</div>
                <div className="text-xs text-blue-600">Total Payments</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {history.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <MdHistory size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No payment history yet</h3>
                <p className="text-gray-500">Your submitted payment proofs will appear here</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
                    onClick={() => openModal(`${API_BASE_URL}${item.screenshot_url}`)}
                    tabIndex={0}
                    onKeyPress={(e) => { 
                      if (e.key === 'Enter' || e.key === ' ') {
                        openModal(`${API_BASE_URL}${item.screenshot_url}`);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-6">
                      <img
                        src={`${API_BASE_URL}${item.screenshot_url}`}
                        alt="Payment screenshot"
                        className="w-16 h-16 rounded-2xl object-cover shadow-md border border-gray-200/60"
                      />
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">₹{item.amount || 'N/A'}</h3>
                            <p className="text-gray-600 text-sm">{new Date(item.submission_date).toLocaleString()}</p>
                          </div>
                          <div className="mt-2 sm:mt-0 flex items-center text-blue-600 font-semibold text-sm">
                            <span>View Full Image</span>
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Modal for image preview */}
        {modalOpen && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setModalOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <div className="relative max-w-4xl w-full">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/75 rounded-full p-3 transition-all duration-300 transform hover:scale-110 active:scale-95 z-10"
                aria-label="Close modal"
              >
                <MdClose size={24} />
              </button>
              <img 
                src={selectedImage} 
                alt="Full size payment proof" 
                className="max-w-full max-h-[85vh] mx-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Enhanced Helper Components ---
function DetailRow({ label, value }) {
  return (
    <div className="bg-white/80 rounded-xl p-4 border border-gray-200/60 shadow-sm">
      <div className="text-sm font-semibold text-gray-600 mb-1">{label}</div>
      <div className="text-base font-medium text-gray-900 break-words">{value || "N/A"}</div>
    </div>
  );
}

function FormInput({ label, value, onChange, type = 'text', required = false, placeholder = '' }) {
  return (
    <div>
      <label className="block font-semibold mb-2 text-gray-700">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full border-2 border-gray-200/60 rounded-2xl p-4 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-inner text-base font-medium"
      />
    </div>
  );
}
