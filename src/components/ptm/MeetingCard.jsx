import React from 'react';

// This helper function takes a date string and makes it look nice and readable.
const formatMeetingDate = (isoDate) => {
  if (!isoDate) return 'Invalid Date';
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

// This is the main MeetingCard component.
const MeetingCard = ({ meeting, isAdmin, onEdit, onDelete, onJoin }) => {
  
  const canJoin = !isAdmin && meeting.status === 'Scheduled' && meeting.meeting_link;

  return (
    <div className="group backdrop-blur-sm bg-white/95 rounded-2xl p-6 mx-4 my-3 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] relative overflow-hidden flex flex-col h-full">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 pointer-events-none"></div>
      
      {/* Header Section */}
      <div className="relative flex flex-col sm:flex-row sm:justify-between sm:items-start pb-5 mb-5 border-b border-gray-100">
        <div className="flex items-start flex-1 pr-0 sm:pr-4 mb-4 sm:mb-0">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-lg border border-white/50 mr-4 flex-shrink-0">
            <span className="text-2xl">🗓️</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 leading-tight group-hover:text-blue-700 transition-colors duration-300">
              {formatMeetingDate(meeting.meeting_datetime)}
            </h3>
            <p className="text-sm text-gray-500 font-medium bg-gray-100/80 px-3 py-1 rounded-full inline-block">
              Parent-Teacher Meeting
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap">
            <button 
              onClick={() => onEdit(meeting)} 
              className="flex items-center justify-center py-2.5 px-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.05] min-w-[70px]"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button 
              onClick={() => onDelete(meeting.id)} 
              className="flex items-center justify-center py-2.5 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.05] min-w-[70px]"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Content Section - This will grow to fill available space */}
      <div className="relative space-y-4 flex-grow">
        <div className="flex items-center p-3 bg-gradient-to-r from-gray-50/80 to-blue-50/50 rounded-xl border border-gray-100/50">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center shadow-md mr-4 flex-shrink-0">
            <span className="text-xl">🧑‍🏫</span>
          </div>
          <p className="text-base text-gray-700 font-medium">Teacher: <span className="font-semibold text-gray-800">{meeting.teacher_name}</span></p>
        </div>
        
        {/* Class Group */}
        <div className="flex items-center p-3 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-xl border border-gray-100/50">
          <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center shadow-md mr-4 flex-shrink-0">
            <span className="text-xl">🏫</span>
          </div>
          <p className="text-base text-gray-700 font-medium">Class: <span className="font-semibold text-gray-800">{meeting.class_group}</span></p>
        </div>
        
        <div className="flex items-center p-3 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-xl border border-gray-100/50">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center shadow-md mr-4 flex-shrink-0">
            <span className="text-xl">💬</span>
          </div>
          <p className="text-base text-gray-700 font-medium">Subject Focus: <span className="font-semibold text-gray-800">{meeting.subject_focus}</span></p>
        </div>
        
        <div className="flex items-center p-3 bg-gradient-to-r from-cyan-50/50 to-blue-50/50 rounded-xl border border-gray-100/50">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center shadow-md mr-4 flex-shrink-0">
            <span className="text-xl">ℹ️</span>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <p className="text-base text-gray-700 font-medium">Status:</p>
            <span className={`py-2 px-4 rounded-full font-bold text-sm shadow-md border ${
              meeting.status === 'Scheduled' 
                ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200' 
                : 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200'
            }`}>
              {meeting.status}
            </span>
          </div>
        </div>
      </div>

      {/* Fixed Height Footer Section */}
      <div className="relative mt-6">
        {/* Join Meeting Button - Always reserve space */}
        <div className="min-h-[60px] mb-4">
          {canJoin && (
            <button 
              onClick={() => onJoin(meeting.meeting_link)}
              className="w-full flex items-center justify-center bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-4 rounded-2xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <svg className="w-5 h-5 mr-3 relative z-10 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
              <span className="relative z-10">Join Meeting</span>
            </button>
          )}
        </div>

        {/* Notes Section */}
        <div className="pt-5 border-t border-gray-100">
          <h4 className="text-sm text-gray-500 font-bold mb-3 uppercase tracking-wide flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Notes/Summary:
          </h4>
          <div className="bg-gradient-to-br from-gray-50/80 to-slate-50/80 border border-gray-200/50 rounded-2xl p-4 shadow-inner backdrop-blur-sm">
            <p className="text-gray-700 text-sm leading-relaxed font-medium">
              {meeting.notes || 'No notes have been added yet.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingCard;
