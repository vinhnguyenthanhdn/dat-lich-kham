
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 sm:p-10 text-center animate-fade-in-up relative overflow-hidden">
        {/* Decorative gradient background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500 opacity-10"></div>

        <div className="relative z-10">
          {/* Success Icon with Logo Background */}
          <div className="relative mx-auto w-24 h-24 mb-5 animate-bounce-in">
            <img
              src="/logo.jpg"
              alt="Logo"
              className="w-24 h-24 rounded-full object-cover opacity-20 absolute inset-0"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
                <svg className="h-12 w-12 text-white animate-check" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">Đặt Lịch Thành Công!</h2>
          <p className="text-gray-600 mb-8 text-base">Lịch hẹn của bạn đã được xác nhận. Vui lòng kiểm tra lại thông tin dưới đây.</p>

          <div className="text-left bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border-2 border-gray-200 space-y-4 shadow-inner">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Bệnh nhân</p>
                <p className="font-bold text-gray-900">{patient.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Lý do khám</p>
                <p className="font-bold text-gray-900">{reason}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Thời gian</p>
                <p className="font-bold text-gray-900">{formattedTime} - {formattedDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Số điện thoại</p>
                <p className="font-bold text-gray-900">{patient.phone}</p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-8 w-full inline-flex justify-center items-center gap-2 py-4 px-8 border border-transparent shadow-lg text-base font-bold rounded-2xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Hoàn Tất
          </button>
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
            0% {
                opacity: 0;
            }
            100% {
                opacity: 1;
            }
        }
        @keyframes fade-in-up {
            0% {
                opacity: 0;
                transform: translateY(40px) scale(0.95);
            }
            100% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        @keyframes bounce-in {
            0% {
                transform: scale(0);
            }
            50% {
                transform: scale(1.1);
            }
            100% {
                transform: scale(1);
            }
        }
        @keyframes check {
            0% {
                stroke-dasharray: 0, 100;
            }
            100% {
                stroke-dasharray: 100, 100;
            }
        }
        .animate-fade-in {
            animation: fade-in 0.2s ease-out forwards;
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.4s ease-out forwards;
        }
        .animate-bounce-in {
            animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        .animate-check {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            animation: check 0.5s ease-out 0.3s forwards;
        }
    `}</style>
    </div>
  );
};
