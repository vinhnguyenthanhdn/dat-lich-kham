
import React, { useState, useCallback } from 'react';
import { REASONS_FOR_VISIT } from '../constants';
import type { Appointment, Patient } from '../types';
import { TimeSlotPicker } from './TimeSlotPicker';
import { CalendarIcon } from './icons/CalendarIcon';

const initialPatientState: Patient = {
  name: '',
  dob: '',
  parentName: '',
  address: '',
  phone: '',
};

interface BookingFormProps {
  onBookAppointment: (appointment: Appointment) => Promise<boolean>;
  bookedSlots: Date[];
}

export const BookingForm: React.FC<BookingFormProps> = ({ onBookAppointment, bookedSlots }) => {
  const [patient, setPatient] = useState<Patient>(initialPatientState);
  const [reason, setReason] = useState<string>(REASONS_FOR_VISIT[0]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = useCallback(() => {
    setPatient(initialPatientState);
    setReason(REASONS_FOR_VISIT[0]);
    setSelectedDate('');
    setSelectedSlot(null);
    setError('');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!patient.name || !patient.dob || !patient.phone || !selectedSlot) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc và chọn một khung giờ.');
      return;
    }

    // Validate past date/time
    const now = new Date();
    if (selectedSlot.getTime() < now.getTime()) {
      setError('Không thể đặt lịch cho thời gian trong quá khứ. Vui lòng chọn ngày và giờ khác.');
      setSelectedSlot(null);
      return;
    }

    if (isSubmitting) {
      return; // Prevent double submission
    }

    setError('');
    setIsSubmitting(true);

    try {
      const appointment: Appointment = {
        patient,
        reason,
        dateTime: selectedSlot,
      };

      const success = await onBookAppointment(appointment);
      if(success) {
        resetForm();
      }
    } catch (error) {
      setError('Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/50">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Thông tin bệnh nhân</h2>
          </div>
          
          <div className="group">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Tên bệnh nhân <span className="text-red-500">*</span></label>
            <input type="text" id="name" name="name" value={patient.name} onChange={handlePatientChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:border-gray-300" placeholder="Nhập tên bệnh nhân"/>
          </div>

          <div className="group">
            <label htmlFor="dob" className="block text-sm font-semibold text-gray-700 mb-2">
              Ngày sinh <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 font-normal ml-2">(dd/mm/yyyy)</span>
            </label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={patient.dob}
              onChange={handlePatientChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:border-gray-300"
            />
          </div>

          <div className="group">
            <label htmlFor="parentName" className="block text-sm font-semibold text-gray-700 mb-2">Tên bố/mẹ</label>
            <input type="text" id="parentName" name="parentName" value={patient.parentName} onChange={handlePatientChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:border-gray-300" placeholder="Nhập tên bố hoặc mẹ (tùy chọn)"/>
          </div>

          <div className="group">
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại <span className="text-red-500">*</span></label>
            <input type="tel" id="phone" name="phone" value={patient.phone} onChange={handlePatientChange} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:border-gray-300" placeholder="0xxx xxx xxx"/>
          </div>

          <div className="md:col-span-2 group">
            <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ</label>
            <input type="text" id="address" name="address" value={patient.address} onChange={handlePatientChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:border-gray-300" placeholder="Nhập địa chỉ (tùy chọn)"/>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-sm text-gray-500 font-medium">Lịch khám</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="md:col-span-2 flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Thông tin lịch hẹn</h2>
          </div>
          
          <div className="group">
            <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 mb-2">Vấn đề cần khám</label>
            <select id="reason" name="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:border-gray-300 bg-white cursor-pointer">
              {REASONS_FOR_VISIT.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="relative group">
            <label htmlFor="appointmentDate" className="block text-sm font-semibold text-gray-700 mb-2">
              Chọn ngày khám <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 font-normal ml-2">(dd/mm/yyyy)</span>
            </label>
            <div className="relative">
              <input
                type="date"
                id="appointmentDate"
                name="appointmentDate"
                value={selectedDate}
                onChange={(e) => {setSelectedDate(e.target.value); setSelectedSlot(null);}}
                min={today}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10 transition-all duration-200 group-hover:border-gray-300"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <TimeSlotPicker 
              selectedDateString={selectedDate}
              bookedSlots={bookedSlots}
              onSelectSlot={setSelectedSlot}
              selectedSlot={selectedSlot}
            />
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="text-center pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full md:w-auto inline-flex items-center justify-center gap-2 py-4 px-12 border border-transparent shadow-lg text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Đặt Lịch Hẹn
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
