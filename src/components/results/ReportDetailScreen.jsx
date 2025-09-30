import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

const ReportDetailScreen = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const fetchReportDetails = async () => {
            try {
                // ★★★ FIXED: Use apiClient correctly (no double /api, no .ok property) ★★★
                const response = await apiClient.get(`/reports/${reportId}/details`);
                setReportData(response.data); // apiClient returns data directly in .data property
            } catch (error) { 
                console.error('Error fetching report details:', error);
                alert("Error: " + (error.response?.data?.message || "Could not load report details."));
            } finally { 
                setIsLoading(false); 
            }
        };
        
        if (reportId) {
            fetchReportDetails();
        }
    }, [reportId]);

    // ✅ DOWNLOAD LOGIC - Corrected for Web
    const handleDownloadPdf = async () => {
        if (!reportData) {
            alert("Error: Report data is not available yet.");
            return;
        }

        setIsDownloading(true);

        const { reportDetails } = reportData;
        const fileName = `Report_${reportDetails.full_name.replace(/ /g, '_')}_${reportId}.pdf`;
        
        try {
            // Generate HTML Content
            const htmlContent = generateHtmlForPdf(reportData);

            // Web implementation using browser's print functionality
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                
                // Wait for content to load
                printWindow.onload = () => {
                    printWindow.print();
                    printWindow.close();
                };

                alert(`Success! Print dialog opened for ${fileName}. You can save as PDF from the print options.`);
            } else {
                alert('Unable to open print window. Please allow popups for this site.');
            }

        } catch (error) {
            console.error('Download error:', error);
            alert('Download Error: An error occurred while preparing the PDF.');
        } finally {
            setIsDownloading(false);
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
            </div>
        );
    }

    if (!reportData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-center text-gray-600">Report not found.</p>
            </div>
        );
    }
    
    // The visual part of the marksheet
    const { reportDetails, subjects } = reportData;
    let totalCredits = 0; 
    let totalCreditPoints = 0;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-300 sticky top-0 z-10">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="Go Back"
                >
                    <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                </button>
                
                <h1 className="flex-1 text-center text-lg font-bold text-gray-700">Mark Sheet</h1>
                
                <button 
                    onClick={handleDownloadPdf} 
                    disabled={isDownloading} 
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                    title="Download/Print PDF"
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
                <div className="bg-white mx-auto max-w-4xl p-6 border border-gray-300 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Report Card</h2>
                    
                    {/* Student Info Grid */}
                    <div className="border border-gray-400 mb-6 rounded">
                        <div className="flex border-b border-gray-400 bg-gray-50">
                            <p className="p-3 text-sm font-medium">
                                <span className="text-gray-600">Student's Name:</span> 
                                <span className="ml-2 font-semibold">{reportDetails.full_name}</span>
                            </p>
                        </div>
                        <div className="flex border-b border-gray-400">
                            <p className="p-3 text-sm font-medium">
                                <span className="text-gray-600">Class:</span> 
                                <span className="ml-2 font-semibold">{reportDetails.class_group}</span>
                            </p>
                        </div>
                        <div className="flex">
                            <p className="p-3 text-sm font-medium">
                                <span className="text-gray-600">Roll No:</span> 
                                <span className="ml-2 font-semibold">{reportDetails.roll_no || 'N/A'}</span>
                            </p>
                        </div>
                    </div>
                    
                    {/* Subjects Table */}
                    <div className="border border-gray-400 rounded overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-4 bg-gray-100 border-b border-gray-400">
                            <div className="p-3 font-bold text-center text-sm border-r border-gray-400">
                                Subject Name
                            </div>
                            <div className="p-3 font-bold text-center text-sm border-r border-gray-400">
                                Credit
                            </div>
                            <div className="p-3 font-bold text-center text-sm border-r border-gray-400">
                                Grade
                            </div>
                            <div className="p-3 font-bold text-center text-sm">
                                Credit Point
                            </div>
                        </div>
                        
                        {/* Table Body */}
                        {subjects.map((item) => {
                            totalCredits += parseFloat(item.credit) || 0;
                            totalCreditPoints += parseFloat(item.credit_point) || 0;
                            return (
                                <div key={item.subject_entry_id} className="grid grid-cols-4 border-b border-gray-200 hover:bg-gray-50">
                                    <div className="p-3 border-r border-gray-200 text-sm">
                                        {item.subject_name}
                                    </div>
                                    <div className="p-3 border-r border-gray-200 text-center text-sm">
                                        {item.credit || '-'}
                                    </div>
                                    <div className="p-3 border-r border-gray-200 text-center text-sm">
                                        {item.grade || '-'}
                                    </div>
                                    <div className="p-3 text-center text-sm">
                                        {item.credit_point || '-'}
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* Table Footer */}
                        <div className="grid grid-cols-4 bg-gray-100 border-t border-gray-400">
                            <div className="p-3 font-bold text-right text-sm border-r border-gray-200">
                                Total
                            </div>
                            <div className="p-3 font-bold text-center text-sm border-r border-gray-200">
                                {totalCredits.toFixed(2)}
                            </div>
                            <div className="p-3 font-bold text-center text-sm border-r border-gray-200">
                                -
                            </div>
                            <div className="p-3 font-bold text-center text-sm">
                                {totalCreditPoints.toFixed(2)}
                            </div>
                        </div>
                    </div>
                    
                    {/* SGPA/CGPA Grid */}
                    <div className="border border-gray-400 mt-6 rounded">
                        <div className="flex border-b border-gray-400 bg-gray-50">
                            <p className="p-3 text-sm font-medium">
                                <span className="text-gray-600">SGPA:</span> 
                                <span className="ml-2 font-semibold">{reportDetails.sgpa || 'N/A'}</span>
                            </p>
                        </div>
                        <div className="flex">
                            <p className="p-3 text-sm font-medium">
                                <span className="text-gray-600">CGPA:</span> 
                                <span className="ml-2 font-semibold">{reportDetails.cgpa || 'N/A'}</span>
                            </p>
                        </div>
                    </div>
                    
                    <p className="text-center mt-6 text-sm text-gray-600 italic">
                        {reportDetails.result_status}
                    </p>
                </div>
            </div>
        </div>
    );
};

// ✅ Helper function to generate HTML - Enhanced for better printing
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
            <meta charset="UTF-8">
            <style>
                @page {
                    margin: 1in;
                    size: A4;
                }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none !important; }
                }
                * {
                    box-sizing: border-box;
                }
                body { 
                    font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif; 
                    color: #333; 
                    margin: 0;
                    padding: 20px;
                    line-height: 1.4;
                }
                .sheet { 
                    max-width: 800px; 
                    margin: 0 auto;
                    background: white;
                }
                .main-title { 
                    font-size: 28px; 
                    font-weight: bold; 
                    text-align: center; 
                    margin-bottom: 30px; 
                    text-transform: uppercase;
                    color: #2c3e50;
                    border-bottom: 3px solid #3498db;
                    padding-bottom: 15px;
                }
                .info-grid { 
                    border: 2px solid #34495e; 
                    margin-bottom: 25px; 
                    border-radius: 5px;
                }
                .info-row { 
                    padding: 15px; 
                    border-bottom: 1px solid #bdc3c7; 
                    font-size: 16px;
                    background: #f8f9fa;
                }
                .info-row:last-child { 
                    border-bottom: none; 
                }
                .info-label {
                    font-weight: bold;
                    color: #2c3e50;
                }
                .table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 25px 0;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                .table, .cell, .header-cell { 
                    border: 1px solid #34495e; 
                }
                .header-row { 
                    background: linear-gradient(135deg, #3498db, #2980b9);
                    color: white;
                }
                .header-cell { 
                    padding: 15px 10px; 
                    font-weight: bold; 
                    text-align: center; 
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .body-row:nth-child(even) {
                    background-color: #f8f9fa;
                }
                .body-row:hover {
                    background-color: #e8f4f8;
                }
                .body-row .cell { 
                    padding: 12px 10px; 
                    text-align: center; 
                    font-size: 14px;
                    border-right: 1px solid #bdc3c7;
                }
                .body-row .cell:last-child {
                    border-right: none;
                }
                .subject-cell { 
                    text-align: left !important;
                    font-weight: 500;
                }
                .footer-row { 
                    background: linear-gradient(135deg, #e74c3c, #c0392b);
                    color: white;
                    font-weight: bold;
                }
                .footer-row .cell { 
                    padding: 15px 10px; 
                    font-weight: bold; 
                    text-align: center; 
                    font-size: 14px;
                }
                .results-grid {
                    border: 2px solid #34495e;
                    margin-top: 25px;
                    border-radius: 5px;
                }
                .result-row {
                    padding: 15px;
                    border-bottom: 1px solid #bdc3c7;
                    font-size: 16px;
                    background: #f8f9fa;
                }
                .result-row:last-child {
                    border-bottom: none;
                }
                .footer-note { 
                    text-align: center; 
                    margin-top: 30px; 
                    font-size: 16px; 
                    color: #7f8c8d;
                    font-style: italic;
                    padding: 20px;
                    background: #ecf0f1;
                    border-radius: 5px;
                }
                .print-date {
                    text-align: right;
                    font-size: 12px;
                    color: #95a5a6;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="sheet">
                <div class="main-title">Academic Performance Report</div>
                
                <div class="info-grid">
                    <div class="info-row">
                        <span class="info-label">Student's Name:</span> ${reportDetails.full_name}
                    </div>
                    <div class="info-row">
                        <span class="info-label">Class:</span> ${reportDetails.class_group}
                    </div>
                    <div class="info-row">
                        <span class="info-label">Roll Number:</span> ${reportDetails.roll_no || 'N/A'}
                    </div>
                </div>
                
                <table class="table">
                    <tr class="header-row">
                        <th class="header-cell" style="width:45%">Subject Name</th>
                        <th class="header-cell" style="width:15%">Credit</th>
                        <th class="header-cell" style="width:15%">Grade</th>
                        <th class="header-cell" style="width:25%">Credit Point</th>
                    </tr>
                    ${subjectsHtml}
                    <tr class="footer-row">
                        <td class="cell" style="text-align:right"><strong>TOTAL</strong></td>
                        <td class="cell"><strong>${totalCredits.toFixed(2)}</strong></td>
                        <td class="cell"><strong>-</strong></td>
                        <td class="cell"><strong>${totalCreditPoints.toFixed(2)}</strong></td>
                    </tr>
                </table>
                
                <div class="results-grid">
                    <div class="result-row">
                        <span class="info-label">SGPA (Semester Grade Point Average):</span> ${reportDetails.sgpa || 'N/A'}
                    </div>
                    <div class="result-row">
                        <span class="info-label">CGPA (Cumulative Grade Point Average):</span> ${reportDetails.cgpa || 'N/A'}
                    </div>
                </div>
                
                <div class="footer-note">
                    ${reportDetails.result_status}
                </div>
                
                <div class="print-date">
                    Generated on: ${new Date().toLocaleString()}
                </div>
            </div>
        </body>
        </html>
    `;
};

export default ReportDetailScreen;
