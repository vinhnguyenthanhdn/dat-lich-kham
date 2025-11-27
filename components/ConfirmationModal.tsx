
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

          <h2 className="text-3xl font-bold text-gray-800 mb-8">Đặt Lịch Thành Công!</h2>

          {/* Beautiful Thank You Section */}
          <div className="relative mb-6 pt-10 pb-6 px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 shadow-lg">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-white rounded-full p-2 shadow-md">
                <svg className="w-8 h-8 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Phòng khám bác sĩ <span className="whitespace-nowrap">Cẩm Vân</span>
              </p>
              <p className="text-xl font-semibold text-gray-800 mb-1">
                Xin chân thành cảm ơn!
              </p>
              <p className="text-sm text-gray-400 italic">
                ✨ Vì một thế hệ trẻ khỏe mạnh và <span className="whitespace-nowrap">toàn diện</span> ✨
              </p>
            </div>
          </div>

          <p className="text-gray-600 mb-6 text-sm font-medium">
            Thông tin lịch hẹn của bạn:
          </p>

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
              <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Phụ huynh</p>
                <p className="font-bold text-gray-900">{patient.parentName}</p>
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
