// 📂 File: src/screens/DonorHelpDeskScreen.jsx (FINAL - For Public Access)

import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import storage from '../../utils/storage';
import { API_BASE_URL } from '../../apiConfig';

const BLUE_THEME = { 
    primary: '#1976D2', 
    secondary: '#E3F2FD', 
    textDark: '#212121', 
    textLight: '#757575', 
    open: '#FFB300', 
    inProgress: '#1E88E5', 
    solved: '#43A047' 
};
const STORAGE_KEY = '@donor_ticket_ids'; // Key to save ticket IDs on the device

// FAQ Data - matching mobile version
const FAQ_DATA = [
    {
        id: 1,
        question: "How do I reset my password?",
        answer: "You can reset your password by clicking on the 'Forgot Password' link on the login page and following the instructions sent to your email."
    },
    {
        id: 2,
        question: "Where can I find my exam schedule?",
        answer: "Your exam schedule is available in the 'Calendar' section of your dashboard. You can also check the notifications for any schedule updates."
    },
    {
        id: 3,
        question: "Who do I contact for technical issues with the portal?",
        answer: "For technical issues, please submit a query through this help desk or contact our technical support team at support@example.com."
    }
];

// --- Main component to manage the public workflow ---
const DonorHelpDeskScreen = () => {
    const [view, setView] = useState('main'); // 'main', 'history', 'details'
    const [selectedQueryData, setSelectedQueryData] = useState(null);

    const handleViewDetails = (queryData) => {
        setSelectedQueryData(queryData);
        setView('details');
    };

    const handleBack = () => {
        if (view === 'details') setView('history');
        else setView('main');
    };
    
    return (
        <div className="flex-1 bg-gray-50 min-h-screen">
            <div className="flex items-center bg-blue-600 p-5" style={{ backgroundColor: BLUE_THEME.primary }}>
                <svg className="w-6 h-6 text-white mr-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="ml-4">
                    <h1 className="text-white text-lg font-bold">Help Desk & Support</h1>
                    <p className="text-blue-100 text-sm">Find answers or submit your queries.</p>
                </div>
            </div>
            {view === 'main' && <SubmitQueryView onSwitchToHistory={() => setView('history')} />}
            {view === 'history' && <QueryHistoryView onViewDetails={handleViewDetails} onBack={() => setView('main')} />}
            {view === 'details' && <QueryDetailsView queryData={selectedQueryData} onBack={handleBack} />}
        </div>
    );
};

// --- Child Component: The form for submitting a new query ---
const SubmitQueryView = ({ onSwitchToHistory }) => {
    const { user } = useAuth(); // Get user from AuthContext
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [expandedFAQ, setExpandedFAQ] = useState(null);
    
    const handleSubmit = async () => {
        if (!subject.trim()) {
            alert("Missing Info: Subject is required.");
            return;
        }
        
        if (!user) {
            alert("Error: User not authenticated.");
            return;
        }
        
        setSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/donor/submit-query`, {
                method: 'POST', 
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    donor_name: user.full_name || user.username, // Use authenticated user's name
                    donor_email: user.username, // Assuming username is email, adjust if needed
                    subject, 
                    description 
                })
            });
            const data = await response.json();
            if (response.ok) {
                const existingIds = await storage.get(STORAGE_KEY);
                const ids = existingIds ? JSON.parse(existingIds) : [];
                ids.push(data.ticketId);
                await storage.set(STORAGE_KEY, JSON.stringify(ids));
                alert("Success! Your query has been submitted. You can check its status in \"View My Submitted Queries\".");
                setSubject(''); 
                setDescription('');
            } else { 
                alert("Error: " + data.message); 
            }
        } catch (e) { 
            alert("Error: Could not submit query."); 
        }
        finally { 
            setSubmitting(false); 
        }
    };

    const toggleFAQ = (faqId) => {
        setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            {/* View My Submitted Queries Button */}
            <button 
                className="flex items-center justify-between w-full p-4 mb-6 rounded-lg border"
                style={{ backgroundColor: BLUE_THEME.secondary, color: BLUE_THEME.primary }}
                onClick={onSwitchToHistory}
            >
                <span className="font-bold text-base">View My Submitted Queries</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
            </button>

            {/* FAQ Section - Exactly like mobile */}
            <div className="mb-6">
                <h2 className="text-lg font-bold mb-4" style={{ color: BLUE_THEME.textDark }}>
                    Frequently Asked Questions (FAQs)
                </h2>
                <div className="space-y-1">
                    {FAQ_DATA.map(faq => (
                        <div key={faq.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <button 
                                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                                onClick={() => toggleFAQ(faq.id)}
                            >
                                <span className="text-gray-800 text-sm">{faq.question}</span>
                                <svg 
                                    className={`w-5 h-5 transform transition-transform ${expandedFAQ === faq.id ? 'rotate-180' : ''}`}
                                    style={{ color: BLUE_THEME.primary }}
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                >
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                            {expandedFAQ === faq.id && (
                                <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit Query Form - Matches Mobile (only Subject & Description) */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-lg font-bold mb-4" style={{ color: BLUE_THEME.textDark }}>
                    Submit a Query
                </h2>
                
                <input 
                    type="text"
                    placeholder="Subject (e.g., Issue with assignment)" 
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 mb-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)} 
                />
                
                <textarea 
                    placeholder="Describe your issue in detail..." 
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 mb-4 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="6"
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                />
                
                <button 
                    className="flex items-center justify-center w-full p-4 rounded-lg text-white font-bold text-base shadow-md disabled:opacity-50 transition-opacity"
                    style={{ backgroundColor: BLUE_THEME.primary }}
                    onClick={handleSubmit} 
                    disabled={submitting}
                >
                    {submitting ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                            Submit Query
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

// --- Child Component: Shows the list of queries saved on the device ---
const QueryHistoryView = ({ onViewDetails, onBack }) => {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadHistory = useCallback(async () => {
        setLoading(true);
        try {
            const idString = await storage.get(STORAGE_KEY);
            if (!idString || JSON.parse(idString).length === 0) { 
                setQueries([]); 
                setLoading(false);
                return; 
            }
            const ids = JSON.parse(idString);
            const promises = ids.map(id => 
                fetch(`${API_BASE_URL}/api/donor/query-status/${id}`)
                    .then(res => res.ok ? res.json() : null)
            );
            const results = await Promise.all(promises);
            setQueries(results.filter(r => r !== null)); // Filter out any failed fetches
        } catch (e) { 
            alert("Error: Could not load query history."); 
        } 
        finally { 
            setLoading(false); 
        }
    }, []);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    return (
        <div className="flex-1">
            <button 
                className="flex items-center p-4"
                onClick={onBack}
            >
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                <span style={{ color: BLUE_THEME.primary }} className="text-base font-medium">
                    Back to Submit Query
                </span>
            </button>
            
            <h2 className="text-2xl font-bold text-center mb-5 px-4" style={{ color: BLUE_THEME.textDark }}>
                My Submitted Queries
            </h2>
            
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: BLUE_THEME.primary }}></div>
                </div>
            ) : (
                <div className="px-4">
                    {queries.length > 0 ? (
                        queries.map(item => (
                            <button 
                                key={item.details.id}
                                className="flex items-center justify-between w-full bg-white p-4 mx-auto rounded-lg mb-3 shadow-sm hover:shadow-md transition-shadow"
                                onClick={() => onViewDetails(item)}
                            >
                                <div className="flex-1 text-left mr-3">
                                    <h3 className="font-bold text-base truncate">
                                        {item.details.subject}
                                    </h3>
                                    <p className="text-xs mt-1" style={{ color: BLUE_THEME.textLight }}>
                                        Submitted on: {new Date(item.details.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <StatusBadge status={item.details.status} />
                            </button>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 text-base py-5">
                            You have no submitted queries on this device.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Child Component: Shows the full details and conversation of one query ---
const QueryDetailsView = ({ queryData, onBack }) => {
    if (!queryData) return null;
    
    const { details, replies } = queryData;
    
    return (
        <div className="max-h-screen overflow-y-auto">
            <button 
                className="flex items-center p-4"
                onClick={onBack}
            >
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                <span style={{ color: BLUE_THEME.primary }} className="text-base font-medium">
                    Back to History
                </span>
            </button>
            
            <div className="px-4">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-2xl font-bold flex-1 mr-3" style={{ color: BLUE_THEME.textDark }}>
                        {details.subject}
                    </h1>
                    <StatusBadge status={details.status} />
                </div>
                
                <p className="text-xs mb-4" style={{ color: BLUE_THEME.textLight }}>
                    Query ID: {details.id} | Submitted: {new Date(details.created_at).toLocaleDateString()}
                </p>
                
                <div className="bg-white p-4 rounded-lg my-4 border border-gray-200">
                    <p className="text-base leading-relaxed">{details.description}</p>
                </div>
                
                <h2 className="text-2xl font-bold text-center mb-5" style={{ color: BLUE_THEME.textDark }}>
                    Conversation History
                </h2>
                
                {replies.length > 0 ? (
                    replies.map(reply => (
                        <div 
                            key={reply.id} 
                            className={`p-3 rounded-xl mb-3 max-w-[85%] ${
                                reply.is_admin_reply 
                                    ? 'bg-gray-200 ml-auto' 
                                    : 'mr-auto'
                            }`}
                            style={!reply.is_admin_reply ? { backgroundColor: BLUE_THEME.secondary } : {}}
                        >
                            <p className="font-bold text-sm mb-1">
                                {reply.is_admin_reply ? 'Support Team' : details.donor_name}
                            </p>
                            <p className="text-base leading-relaxed">{reply.reply_text}</p>
                            <p className="text-xs text-gray-600 mt-2 text-right">
                                {new Date(reply.created_at).toLocaleString()}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 text-base py-5">No replies yet.</p>
                )}
            </div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
        const normalizedStatus = status.replace(' ', '').toLowerCase();
        return BLUE_THEME[normalizedStatus] || '#757575';
    };

    return (
        <div 
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: getStatusColor(status) }}
        >
            <span className="text-white text-xs font-bold">{status}</span>
        </div>
    );
};

export default DonorHelpDeskScreen;