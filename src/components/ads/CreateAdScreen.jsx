import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.tsx';
import { MdArrowBack, MdCloudUpload, MdImage, MdReceipt, MdClose } from 'react-icons/md';
// ✅ FIXED: Updated imports
import { SERVER_URL } from '../../apiConfig';


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


const CreateAdScreen = ({ navigation }) => {
  const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';


  // --- State for Header ---
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [unreadCount, setLocalUnreadCount] = useState(0);
  const [query, setQuery] = useState("");


  // --- STATE MANAGEMENT ---
  const [adminView, setAdminView] = useState('create'); // 'create' or 'manage' for admin
  const [adText, setAdText] = useState('');
  const [adImage, setAdImage] = useState(null);
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentText, setPaymentText] = useState('');
  const [dbPaymentDetails, setDbPaymentDetails] = useState({});
  const [formDetails, setFormDetails] = useState({
    ad_amount: '',
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    cif_code: ''
  });
  const [newQrImage, setNewQrImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(true);


  // ✅ FIXED: Updated fetchUnreadNotifications function
  useEffect(() => {
    async function fetchUnreadNotifications() {
      if (!token) { setUnreadCount?.(0); return; }
      try {
        const response = await apiClient.get('/notifications');
        const data = response.data;
        const count = Array.isArray(data) ? data.filter((n) => !n.is_read).length : 0;
        setLocalUnreadCount(count);
        setUnreadCount?.(count);
      } catch { setUnreadCount?.(0); }
    }
    fetchUnreadNotifications();
    const id = setInterval(fetchUnreadNotifications, 60000);
    return () => clearInterval(id);
  }, [token, setUnreadCount]);


  // ✅ FIXED: Updated fetchProfile function
  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) { setLoadingProfile(false); return; }
      setLoadingProfile(true);
      try {
        const response = await apiClient.get(`/profiles/${user.id}`);
        setProfile(response.data);
      } catch {
        setProfile({
          id: user.id,
          username: user.username || "Unknown",
          full_name: user.full_name || "User",
          role: user.role || "user",
        });
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
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


  const handleBackClick = () => {
    navigate(getDefaultDashboardRoute());
  };
  
  const showFeedback = (message, type = 'info') => {
      const feedbackEl = document.createElement('div');
      feedbackEl.style.position = 'fixed';
      feedbackEl.style.top = '20px';
      feedbackEl.style.right = '20px';
      feedbackEl.style.padding = '12px 20px';
      feedbackEl.style.borderRadius = '8px';
      feedbackEl.style.color = 'white';
      feedbackEl.style.zIndex = '1000';
      feedbackEl.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
      feedbackEl.style.transition = 'opacity 0.5s, transform 0.5s';
      feedbackEl.style.opacity = '0';
      feedbackEl.style.transform = 'translateY(-20px)';
      
      if (type === 'error') {
          feedbackEl.style.backgroundColor = '#ef4444'; // red-500
      } else {
          feedbackEl.style.backgroundColor = '#2563eb'; // blue-600
      }
      
      feedbackEl.textContent = message;
      document.body.appendChild(feedbackEl);


      setTimeout(() => {
        feedbackEl.style.opacity = '1';
        feedbackEl.style.transform = 'translateY(0)';
      }, 10);
      
      setTimeout(() => {
          feedbackEl.style.opacity = '0';
          feedbackEl.style.transform = 'translateY(-20px)';
          setTimeout(() => document.body.removeChild(feedbackEl), 500);
      }, 4000);
  };


  // ✅ FIXED: Updated fetchAdPaymentDetails function
  const fetchAdPaymentDetails = useCallback(async () => {
    setIsDetailsLoading(true);
    try {
      const { data } = await apiClient.get('/ad-payment-details');
      setDbPaymentDetails(data || {});
      setFormDetails({
        ad_amount: String(data?.ad_amount || ''),
        account_holder_name: data?.account_holder_name || '',
        account_number: data?.account_number || '',
        ifsc_code: data?.ifsc_code || '',
        cif_code: data?.cif_code || ''
      });
    } catch (error) {
      showFeedback('Error: Could not load payment instructions.', 'error');
    } finally {
      setIsDetailsLoading(false);
    }
  }, []);


  useEffect(() => { fetchAdPaymentDetails(); }, [fetchAdPaymentDetails]);


  // --- IMAGE HANDLING ---
  const handleImageSelect = (setState) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setState({
            uri: event.target.result,
            type: file.type,
            fileName: file.name,
            file: file
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };


  // ✅ FIXED: Updated handleCreateAd function
  const handleCreateAd = async () => {
    if (!adImage) {
      showFeedback('Missing Ad Image: Please select an image.', 'error');
      return;
    }
    if (!isAdmin && !paymentProof) {
      showFeedback('Missing Payment Proof: Please upload a screenshot.', 'error');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('ad_type', 'top_notch');
    formData.append('ad_content_text', adText);
    formData.append('ad_content_image', adImage.file);

    if (!isAdmin && paymentProof) {
      formData.append('payment_text', paymentText);
      formData.append('payment_screenshot', paymentProof.file);
    }

    try {
      const { data } = await apiClient.post('/ads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showFeedback('Success! ' + data.message);
      navigate(getDefaultDashboardRoute());
    } catch (error) {
      showFeedback('Submission Failed: ' + (error.response?.data?.message || 'An error occurred.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };


  // ✅ FIXED: Updated handleSaveChanges function
  const handleSaveChanges = async () => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('adAmount', formDetails.ad_amount || '');
    formData.append('accountHolderName', formDetails.account_holder_name || '');
    formData.append('accountNumber', formDetails.account_number || '');
    formData.append('ifscCode', formDetails.ifsc_code || '');
    formData.append('cifCode', formDetails.cif_code || '');
    if (newQrImage) {
      formData.append('qrCodeImage', newQrImage.file);
    }
    try {
      const { data } = await apiClient.post('/admin/ad-payment-details', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showFeedback('Success: ' + data.message);
      setNewQrImage(null);
      fetchAdPaymentDetails();
    } catch (error) {
      showFeedback('Error: ' + (error.response?.data?.message || 'Failed to update details.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderLoading = () => (
    <div className="flex justify-center items-center py-20">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );


  const renderContent = () => {
    if(loadingProfile || isDetailsLoading) return renderLoading();


    if(isAdmin) {
      return (
        <>
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-xl p-2 mb-6 max-w-lg mx-auto">
              <div className="flex items-center gap-2">
                  <button onClick={() => setAdminView('create')} className={`flex-1 py-2 px-4 text-center rounded-lg transition-all text-sm sm:text-base font-semibold ${adminView === 'create' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>Create Ad</button>
                  <button onClick={() => setAdminView('manage')} className={`flex-1 py-2 px-4 text-center rounded-lg transition-all text-sm sm:text-base font-semibold ${adminView === 'manage' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>Manage Details</button>
              </div>
          </div>
          {adminView === 'create' ? (
              <UserAdCreation 
                  isAdmin={true}
                  adText={adText} setAdText={setAdText}
                  adImage={adImage} setAdImage={setAdImage}
                  paymentProof={paymentProof} setPaymentProof={setPaymentProof}
                  paymentText={paymentText} setPaymentText={setPaymentText}
                  handleImageSelect={handleImageSelect}
                  handleCreateAd={handleCreateAd}
                  isSubmitting={isSubmitting}
                  dbPaymentDetails={dbPaymentDetails}
              />
          ) : (
              <AdminPaymentEditor 
                  dbPaymentDetails={dbPaymentDetails} 
                  formDetails={formDetails} 
                  setFormDetails={setFormDetails} 
                  newQrImage={newQrImage} 
                  handleImageSelect={handleImageSelect} 
                  setNewQrImage={setNewQrImage}
                  handleSaveChanges={handleSaveChanges}
                  isSubmitting={isSubmitting}
              />
          )}
        </>
      );
    }


    // Default view for non-admin users
    return <UserAdCreation
        isAdmin={false}
        adText={adText} setAdText={setAdText}
        adImage={adImage} setAdImage={setAdImage}
        paymentProof={paymentProof} setPaymentProof={setPaymentProof}
        paymentText={paymentText} setPaymentText={setPaymentText}
        handleImageSelect={handleImageSelect}
        handleCreateAd={handleCreateAd}
        isSubmitting={isSubmitting}
        dbPaymentDetails={dbPaymentDetails}
    />
  }


  return (
    <div className="min-h-screen bg-slate-100">
        <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">Create Advertisement</h1>
                        <p className="text-xs sm:text-sm text-slate-600">Create and manage your advertisements</p>
                    </div>
                    <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
                        <div className="relative">
                            <input
                                id="module-search" type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search..."
                                className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="inline-flex items-stretch rounded-lg border border-slate-200 bg-white overflow-hidden">
                            <button onClick={() => navigate(getDefaultDashboardRoute())} className="flex items-center gap-1 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Home">
                                <HomeIcon />
                                <span className="hidden md:inline">Home</span>
                            </button>
                            <div className="w-px bg-slate-200" aria-hidden="true" />
                            <button onClick={() => navigate("/AcademicCalendar")} className="flex items-center gap-1 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Calendar">
                                <CalendarIcon />
                                <span className="hidden md:inline">Calendar</span>
                            </button>
                            <div className="w-px bg-slate-200" aria-hidden="true" />
                            <button onClick={() => navigate("/ProfileScreen")} className="flex items-center gap-1 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition" type="button" title="Profile">
                                <UserIcon />
                                <span className="hidden md:inline">Profile</span>
                            </button>
                        </div>
                        <div className="h-6 w-px bg-slate-200 mx-1" aria-hidden="true" />
                        <div className="flex items-center gap-3">
                            <img src={getProfileImageUrl() || "/placeholder.svg"} alt="Profile" className="w-9 h-9 rounded-full border-2 border-white object-cover shadow" onError={(e) => { e.currentTarget.src = "/assets/profile.png" }} />
                            <div className="hidden sm:flex flex-col">
                                <span className="text-sm font-medium text-slate-900">{profile?.full_name || profile?.username || "User"}</span>
                                <span className="text-xs text-slate-600 capitalize">{profile?.role || ""}</span>
                            </div>
                            <button onClick={handleLogout} className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                Logout
                            </button>
                            <button onClick={() => navigate("/NotificationsScreen")} className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 focus:outline-none" aria-label="Notifications" title="Notifications" type="button">
                                <BellIcon />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">{unreadCount > 9 ? "9+" : unreadCount}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>


        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
            <div className="mb-6">
                <button onClick={handleBackClick} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                    <MdArrowBack /> Back to Dashboard
                </button>
            </div>
            {renderContent()}
        </main>
    </div>
  );
};


const UserAdCreation = ({ isAdmin, adText, setAdText, adImage, setAdImage, paymentProof, setPaymentProof, paymentText, setPaymentText, handleImageSelect, handleCreateAd, isSubmitting, dbPaymentDetails }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left Column: Form */}
      <div className={`lg:col-span-2 bg-slate-50 rounded-2xl shadow-lg border border-slate-200/80 p-6 md:p-8 space-y-8`}>
        {/* Step 1 */}
        <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Step 1: Upload Ad Image</h3>
            <p className="text-sm text-slate-500 mb-4">This is the image that will be displayed in the ad.</p>
            <ImageUploader image={adImage} onSelect={() => handleImageSelect(setAdImage)} icon={<MdImage className="w-8 h-8 text-indigo-500"/>} onClear={() => setAdImage(null)}/>
        </div>


        {/* Step 2 */}
        <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Step 2: Add Text (Optional)</h3>
            <p className="text-sm text-slate-500 mb-4">Add a short caption or text for your ad.</p>
            <input type="text" className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition" placeholder="e.g., Annual Sports Day this Saturday!" value={adText} onChange={(e) => setAdText(e.target.value)} />
        </div>


        {/* Payment sections are hidden for admins */}
        {!isAdmin && (
          <>
            {/* Step 3 */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Step 3: Upload Payment Proof</h3>
                <p className="text-sm text-slate-500 mb-4">After paying, upload a screenshot of the transaction.</p>
                <ImageUploader image={paymentProof} onSelect={() => handleImageSelect(setPaymentProof)} icon={<MdReceipt className="w-8 h-8 text-green-500"/>} onClear={() => setPaymentProof(null)}/>
            </div>
            
            {/* Step 4 */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Step 4: Transaction ID (Optional)</h3>
                <p className="text-sm text-slate-500 mb-4">Enter any reference or transaction ID for our records.</p>
                <input type="text" className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition" placeholder="e.g., UTR, Ref ID" value={paymentText} onChange={(e) => setPaymentText(e.target.value)} />
            </div>
          </>
        )}


        <div className="border-t border-slate-200 pt-6 flex justify-end">
          <button onClick={handleCreateAd} disabled={isSubmitting} className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[200px]">
            {isSubmitting ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isAdmin ? "Post Ad (Free)" : "Submit Ad for Review")}
          </button>
        </div>
      </div>


      {/* Right Column: Payment Details (hidden for admins) */}
      {!isAdmin && (
        <div className="lg:col-span-1">
          <PaymentDetailsCard details={dbPaymentDetails} />
        </div>
      )}
    </div>
  );
};


const AdminPaymentEditor = ({ dbPaymentDetails, formDetails, setFormDetails, newQrImage, handleImageSelect, setNewQrImage, handleSaveChanges, isSubmitting }) => (
    <div className="bg-slate-50 rounded-2xl shadow-lg border border-slate-200/80 p-6 md:p-8 space-y-8">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Manage Payment Details</h2>
            <p className="text-slate-500 mt-1">Update the bank and QR details for ad payments.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* QR Code Section */}
            <div className="space-y-4">
                <h3 className="font-bold text-slate-700">QR Code</h3>
                <ImageUploader 
                    image={newQrImage || (dbPaymentDetails.qr_code_url ? { uri: `${SERVER_URL}${dbPaymentDetails.qr_code_url}` } : null)}
                    onSelect={() => handleImageSelect(setNewQrImage)}
                    onClear={() => setNewQrImage(null)}
                    icon={<MdImage className="w-8 h-8 text-indigo-500"/>}
                />
            </div>
            {/* Bank Details Section */}
            <div className="space-y-4">
                <h3 className="font-bold text-slate-700">Bank Account Details</h3>
                <div>
                    <label className="text-sm font-medium text-slate-600">Ad Amount (₹)</label>
                    <input type="number" value={String(formDetails.ad_amount || '')} onChange={(e) => setFormDetails(p => ({ ...p, ad_amount: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200" />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-600">Account Holder Name</label>
                    <input type="text" value={formDetails.account_holder_name || ''} onChange={(e) => setFormDetails(p => ({ ...p, account_holder_name: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200" />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-600">Account Number</label>
                    <input type="text" value={formDetails.account_number || ''} onChange={(e) => setFormDetails(p => ({ ...p, account_number: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200" />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-600">IFSC Code</label>
                    <input type="text" value={formDetails.ifsc_code || ''} onChange={(e) => setFormDetails(p => ({ ...p, ifsc_code: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200" />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-600">CIF Code</label>
                    <input type="text" value={formDetails.cif_code || ''} onChange={(e) => setFormDetails(p => ({ ...p, cif_code: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200" />
                </div>
            </div>
        </div>
        <div className="border-t border-slate-200 pt-6 flex justify-end">
            <button onClick={handleSaveChanges} disabled={isSubmitting} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[180px]">
                {isSubmitting ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Save Changes'}
            </button>
        </div>
    </div>
);


const PaymentDetailsCard = ({ details }) => {
    const hasDetails = details && details.account_holder_name;
    return (
        <div className="bg-slate-50 rounded-2xl shadow-lg border border-slate-200/80 p-6 space-y-4 h-full">
            <h3 className="text-lg font-bold text-slate-800 text-center">Payment Instructions</h3>
            {!hasDetails ? (
                <p className="text-center text-slate-500 py-10">Payment details have not been set up by the administrator yet.</p>
            ) : (
                <>
                    {details.qr_code_url && (
                        <div className="text-center">
                            <img src={`${SERVER_URL}${details.qr_code_url}`} alt="QR Code" className="w-48 h-48 object-contain mx-auto rounded-lg shadow-md bg-white border border-slate-200" />
                            <p className="text-sm text-slate-500 mt-2">Scan QR code to pay</p>
                        </div>
                    )}
                    <div className="divide-y divide-slate-200">
                        {Object.entries({
                            "Ad Amount": details.ad_amount ? `₹ ${details.ad_amount}` : null,
                            "Account Holder": details.account_holder_name,
                            "Account Number": details.account_number,
                            "IFSC Code": details.ifsc_code,
                            "CIF Code": details.cif_code,
                        }).map(([key, value]) => value && (
                            <div key={key} className="py-3">
                                <p className="text-xs text-slate-500 font-semibold uppercase">{key}</p>
                                <p className="font-medium text-slate-800 break-words">{value}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};


const ImageUploader = ({ image, onSelect, icon, onClear }) => (
    <div onClick={!image ? onSelect : undefined} className="relative aspect-video w-full border-2 border-dashed border-slate-300 rounded-xl flex justify-center items-center bg-white cursor-pointer hover:bg-slate-50 hover:border-indigo-500 transition-all duration-300 group">
        {image ? (
            <>
                <img src={image.uri} alt="Preview" className="w-full h-full rounded-lg object-contain p-2" />
                <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition">
                    <MdClose />
                </button>
            </>
        ) : (
            <div className="text-center text-slate-500">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-indigo-100 transition-colors">
                    {icon}
                </div>
                <span className="font-medium">Tap to upload image</span>
            </div>
        )}
    </div>
);


export default CreateAdScreen;
