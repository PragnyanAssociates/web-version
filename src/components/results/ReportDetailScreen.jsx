import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../apiConfig';
import { useParams, useNavigate } from 'react-router-dom';

const ReportDetailScreen = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const fetchReportDetails = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/details`);
                if (!response.ok) throw new Error("Could not load report details.");
                setReportData(await response.json());
            } catch (error) { 
                alert("Error: " + error.message); 
            } finally { 
                setIsLoading(false); 
            }
        };
        fetchReportDetails();
    }, [reportId]);

    // ✅ NEW, MODERN DOWNLOAD LOGIC - Adapted for Web
    const handleDownloadPdf = async () => {
        if (!reportData) {
            alert("Error: Report data is not available yet.");
            return;
        }

        setIsDownloading(true);

        const { reportDetails } = reportData;
        const fileName = `Report_${reportDetails.full_name.replace(/ /g, '_')}_${reportId}.pdf`;
        
        // Generate HTML Content
        const htmlContent = generateHtmlForPdf(reportData);

        try {
            // Web implementation using browser's print functionality
            const printWindow = window.open('', '_blank');
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            
            // Wait for content to load
            printWindow.onload = () => {
                printWindow.print();
                printWindow.close();
            };

            alert(`Success! Print dialog opened for ${fileName}. You can save as PDF from the print options.`);

        } catch (error) {
            console.error(error);
            alert('Download Error: An error occurred while preparing the PDF.');
        } finally {
            setIsDownloading(false);
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex-1 justify-center items-center p-5">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
            </div>
        );
    }

    if (!reportData) {
        return (
            <div className="flex-1 justify-center items-center p-5">
                <p className="text-center text-gray-600">Report not found.</p>
            </div>
        );
    }
    
    // The visual part of the marksheet remains the same
    const { reportDetails, subjects } = reportData;
    let totalCredits = 0; 
    let totalCreditPoints = 0;

    return (
        <div className="flex-1 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-300">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                    <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                </button>
                
                <h1 className="flex-1 text-center text-lg font-bold text-gray-700">Mark Sheet</h1>
                
                <button 
                    onClick={handleDownloadPdf} 
                    disabled={isDownloading} 
                    className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                >
                    {isDownloading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-800"></div>
                    ) : (
                        <svg className="w-6 h-6 text-blue-800" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Report Content */}
            <div className="p-4">
                <div className="bg-white mx-auto p-5 border border-gray-300">
                    <h2 className="text-xl font-bold text-center mb-5">Report Card</h2>
                    
                    {/* Student Info Grid */}
                    <div className="border border-gray-400 mb-5">
                        <div className="flex border-b border-gray-400">
                            <p className="p-2 text-xs">Student's Name: {reportDetails.full_name}</p>
                        </div>
                        <div className="flex border-b border-gray-400">
                            <p className="p-2 text-xs">Class: {reportDetails.class_group}</p>
                        </div>
                        <div className="flex">
                            <p className="p-2 text-xs">Roll No: {reportDetails.roll_no || 'N/A'}</p>
                        </div>
                    </div>
                    
                    {/* Subjects Table */}
                    <div className="border border-gray-400 mt-5">
                        {/* Table Header */}
                        <div className="flex bg-gray-100 border-b border-gray-400">
                            <div className="flex-2 p-2 font-bold border-r border-gray-400 text-center text-xs">
                                Subject Name
                            </div>
                            <div className="flex-1 p-2 font-bold border-r border-gray-400 text-center text-xs">
                                Credit
                            </div>
                            <div className="flex-1 p-2 font-bold border-r border-gray-400 text-center text-xs">
                                Grade
                            </div>
                            <div className="flex-1 p-2 font-bold text-center text-xs">
                                Credit Point
                            </div>
                        </div>
                        
                        {/* Table Body */}
                        {subjects.map((item) => {
                            totalCredits += parseFloat(item.credit) || 0;
                            totalCreditPoints += parseFloat(item.credit_point) || 0;
                            return (
                                <div key={item.subject_entry_id} className="flex">
                                    <div className="flex-2 p-2 border-r border-gray-200 border-t border-gray-200 text-center text-xs">
                                        {item.subject_name}
                                    </div>
                                    <div className="flex-1 p-2 border-r border-gray-200 border-t border-gray-200 text-center text-xs">
                                        {item.credit || '-'}
                                    </div>
                                    <div className="flex-1 p-2 border-r border-gray-200 border-t border-gray-200 text-center text-xs">
                                        {item.grade || '-'}
                                    </div>
                                    <div className="flex-1 p-2 border-t border-gray-200 text-center text-xs">
                                        {item.credit_point || '-'}
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* Table Footer */}
                        <div className="flex">
                            <div className="flex-2 p-2 font-bold border-r border-gray-200 border-t border-gray-400 text-right text-xs">
                                Total
                            </div>
                            <div className="flex-1 p-2 font-bold border-r border-gray-200 border-t border-gray-400 text-center text-xs">
                                {totalCredits.toFixed(2)}
                            </div>
                            <div className="flex-1 p-2 font-bold border-r border-gray-200 border-t border-gray-400 text-center text-xs">
                            </div>
                            <div className="flex-1 p-2 font-bold border-t border-gray-400 text-center text-xs">
                                {totalCreditPoints.toFixed(2)}
                            </div>
                        </div>
                    </div>
                    
                    {/* SGPA/CGPA Grid */}
                    <div className="border border-gray-400 mt-5">
                        <div className="flex border-b border-gray-400">
                            <p className="p-2 text-xs">SGPA: {reportDetails.sgpa || 'N/A'}</p>
                        </div>
                        <div className="flex">
                            <p className="p-2 text-xs">CGPA: {reportDetails.cgpa || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <p className="text-center mt-5 text-xs text-gray-600">
                        {reportDetails.result_status}
                    </p>
                </div>
            </div>
        </div>
    );
};

// ✅ NEW: Helper function to generate HTML - Same logic, adapted for web
const generateHtmlForPdf = (reportData) => {
    const { reportDetails, subjects } = reportData;
    let totalCredits = 0;
    let totalCreditPoints = 0;

    const subjectsHtml = subjects.map(item => {
        totalCredits += parseFloat(item.credit) || 0;
        totalCreditPoints += parseFloat(item.credit_point) || 0;
        return `
            <tr class="body-row">
                <td class="cell subject-cell">${item.subject_name}</td>
                <td class="cell">${item.credit || '-'}</td>
                <td class="cell">${item.grade || '-'}</td>
                <td class="cell">${item.credit_point || '-'}</td>
            </tr>
        `;
    }).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Report Card - ${reportDetails.full_name}</title>
            <style>
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
                body { 
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
                    color: #333; 
                    margin: 20px; 
                }
                .sheet { 
                    padding: 30px; 
                    border: 1px solid #ccc; 
                    max-width: 800px; 
                    margin: 0 auto; 
                }
                .main-title { 
                    font-size: 24px; 
                    font-weight: bold; 
                    text-align: center; 
                    margin-bottom: 25px; 
                    text-transform: uppercase; 
                }
                .grid { 
                    border: 1px solid #999; 
                    margin-bottom: 20px; 
                }
                .row { 
                    display: flex; 
                    border-bottom: 1px solid #999; 
                }
                .row:last-child { 
                    border-bottom: none; 
                }
                .cell-label { 
                    padding: 12px; 
                    font-size: 14px; 
                }
                .table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 20px; 
                }
                .table, .cell, .header-cell { 
                    border: 1px solid #999; 
                }
                .header-row { 
                    background-color: #f2f2f2; 
                }
                .header-cell { 
                    padding: 12px; 
                    font-weight: bold; 
                    text-align: center; 
                    font-size: 14px; 
                }
                .body-row .cell { 
                    padding: 12px; 
                    text-align: center; 
                    font-size: 14px; 
                }
                .subject-cell { 
                    text-align: left; 
                }
                .footer-row .cell { 
                    padding: 12px; 
                    font-weight: bold; 
                    text-align: center; 
                    font-size: 14px; 
                }
                .footer-note { 
                    text-align: center; 
                    margin-top: 30px; 
                    font-size: 14px; 
                    color: #777; 
                }
            </style>
        </head>
        <body>
            <div class="sheet">
                <div class="main-title">Semester Grade Report</div>
                <div class="grid">
                    <div class="row">
                        <div class="cell-label">Student's Name: <strong>${reportDetails.full_name}</strong></div>
                    </div>
                    <div class="row">
                        <div class="cell-label">Class: <strong>${reportDetails.class_group}</strong></div>
                    </div>
                    <div class="row">
                        <div class="cell-label">Roll No: <strong>${reportDetails.roll_no || 'N/A'}</strong></div>
                    </div>
                </div>
                <table class="table">
                    <tr class="header-row">
                        <th class="header-cell" style="width:50%">Subject Name</th>
                        <th class="header-cell">Credit</th>
                        <th class="header-cell">Grade</th>
                        <th class="header-cell">Credit Point</th>
                    </tr>
                    ${subjectsHtml}
                    <tr class="footer-row">
                        <td class="cell" style="text-align:right"><strong>Total</strong></td>
                        <td class="cell"><strong>${totalCredits.toFixed(2)}</strong></td>
                        <td class="cell"></td>
                        <td class="cell"><strong>${totalCreditPoints.toFixed(2)}</strong></td>
                    </tr>
                </table>
                <div class="grid" style="margin-top:20px">
                    <div class="row">
                        <div class="cell-label">SGPA: <strong>${reportDetails.sgpa || 'N/A'}</strong></div>
                    </div>
                    <div class="row">
                        <div class="cell-label">CGPA: <strong>${reportDetails.cgpa || 'N/A'}</strong></div>
                    </div>
                </div>
                <div class="footer-note">${reportDetails.result_status}</div>
            </div>
        </body>
        </html>
    `;
};

export default ReportDetailScreen;
