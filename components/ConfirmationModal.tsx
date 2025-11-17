
import React from 'react';
import type { Appointment } from '../types';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentDetails: Appointment | null;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, appointmentDetails }) => {
  if (!isOpen || !appointmentDetails) return null;

  const { patient, reason, dateTime } = appointmentDetails;

  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateTime);

  const formattedTime = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(dateTime);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center animate-fade-in-up">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Đặt Lịch Thành Công!</h2>
        <p className="text-gray-600 mt-2 mb-6">Lịch hẹn của bạn đã được xác nhận. Vui lòng kiểm tra lại thông tin dưới đây.</p>
        
        <div className="text-left bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3 text-gray-600">
            <p><strong className="font-semibold text-gray-900">Bệnh nhân:</strong> {patient.name}</p>
            <p><strong className="font-semibold text-gray-900">Lý do khám:</strong> {reason}</p>
            <p><strong className="font-semibold text-gray-900">Thời gian:</strong> {formattedTime} - {formattedDate}</p>
            <p><strong className="font-semibold text-gray-900">Số điện thoại:</strong> {patient.phone}</p>
        </div>

        <button 
          onClick={onClose} 
          className="mt-8 w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Đóng
        </button>
      </div>
       <style>{`
        @keyframes fade-in-up {
            0% {
                opacity: 0;
                transform: translateY(20px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
    `}</style>
    </div>
  );
};
