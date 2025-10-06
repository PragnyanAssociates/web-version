// LabCard.jsx
import React from "react";
import { API_BASE_URL } from "../../apiConfig";

const LabCard = ({ lab, onEdit, onDelete }) => {
  const canManage = onEdit && onDelete;

  // Open external link
  const handleOpenLink = async () => {
    if (!lab.access_url) return;
    try {
      window.open(lab.access_url, "_blank", "noopener,noreferrer");
    } catch (error) {
      alert(`Cannot open this URL: ${lab.access_url}`);
    }
  };

  // Open uploaded file
  const handleOpenFile = async () => {
    if (!lab.file_path) return;
    const fileUrl = `${API_BASE_URL}${lab.file_path}`;
    try {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      alert(`Cannot open this file: ${fileUrl}`);
    }
  };

  const imageSource = lab.cover_image_url
    ? `${API_BASE_URL}${lab.cover_image_url}`
    : "/default-lab-icon.png";

  // Get file extension for better display
  const getFileExtension = (filePath) => {
    if (!filePath) return '';
    return filePath.split('.').pop().toUpperCase();
  };

  return (
    <div className="w-full backdrop-blur-sm bg-white/95 rounded-2xl shadow-xl border border-white/30 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] relative">
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/20 to-emerald-50/20 pointer-events-none"></div>
      
      {/* Header Section */}
      <div className="relative p-6 pb-4">
        <div className="flex flex-col gap-4">
          {/* Top row - Image + Title */}
          <div className="flex items-center flex-1">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 flex justify-center items-center shadow-lg border-2 border-white/50">
                <img
                  src={imageSource}
                  alt="Lab Icon"
                  className="w-10 h-10 object-cover rounded-xl"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                {/* Fallback icon */}
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center hidden">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              {/* Status indicator */}
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div className="ml-4 flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-800 mb-1 line-clamp-2 hover:text-teal-700 transition-colors duration-300">
                {lab.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span className="inline-flex items-center px-2.5 py-1 bg-teal-100 text-teal-700 rounded-lg font-medium">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {lab.subject || 'General'}
                </span>
                {lab.lab_type && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg font-medium">
                    {lab.lab_type}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bottom row - Actions (only show if canManage) */}
          {canManage && (
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => onEdit && onEdit(lab)}
                className="flex items-center justify-center bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:shadow-lg min-w-[80px]"
                title="Edit Lab"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={() => onDelete && onDelete(lab.id)}
                className="flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:shadow-lg min-w-[80px]"
                title="Delete Lab"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description Section */}
      <div className="relative px-6 pb-4">
        <div className="bg-gradient-to-r from-gray-50 to-gray-50/80 rounded-xl p-4 border border-gray-100">
          <p className="text-gray-700 leading-relaxed text-sm line-clamp-3">
            {lab.description || "Nothing, Just Watch & Learn the Video."}
          </p>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="relative px-6 pb-6">
        {(lab.file_path || lab.access_url) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lab.file_path && (
              <button
                onClick={handleOpenFile}
                className="flex items-center justify-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3.5 rounded-xl font-bold transition-all duration-300 hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-center">Download File</span>
                {getFileExtension(lab.file_path) && (
                  <span className="ml-2 px-2 py-1 bg-white/20 rounded-md text-xs font-semibold">
                    {getFileExtension(lab.file_path)}
                  </span>
                )}
              </button>
            )}
            {lab.access_url && (
              <button
                onClick={handleOpenLink}
                className="flex items-center justify-center bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-4 py-3.5 rounded-xl font-bold transition-all duration-300 hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="text-center">Access Link</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center p-4 bg-gray-100/50 rounded-xl border border-gray-200/50">
            <p className="text-gray-500 text-sm font-medium">No resources available</p>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            For: {lab.class_group || 'All Classes'}
          </span>
          <span className="flex items-center">
            {(lab.file_path && lab.access_url) ? 'File + Link' : lab.file_path ? 'File Available' : lab.access_url ? 'Link Available' : 'No Resources'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LabCard;
