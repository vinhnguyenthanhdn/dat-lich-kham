
import React, { useState, useCallback } from 'react';
import { REASONS_FOR_VISIT } from '../constants';
import type { Appointment, Patient } from '../types';
import { TimeSlotPicker } from './TimeSlotPicker';
import { CalendarIcon } from './icons/CalendarIcon';

const initialPatientState: Patient = {
  name: '',
  dob: '',
  address: '',
  phone: '',
};

interface BookingFormProps {
  onBookAppointment: (appointment: Appointment) => boolean;
  bookedSlots: Date[];
}

export const BookingForm: React.FC<BookingFormProps> = ({ onBookAppointment, bookedSlots }) => {
  const [patient, setPatient] = useState<Patient>(initialPatientState);
  const [reason, setReason] = useState<string>(REASONS_FOR_VISIT[0]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [error, setError] = useState<string>('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient.name || !patient.dob || !patient.phone || !selectedSlot) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc và chọn một khung giờ.');
      return;
    }
    setError('');
    
    const appointment: Appointment = {
      patient,
      reason,
      dateTime: selectedSlot,
    };

    const success = onBookAppointment(appointment);
    if(success) {
      resetForm();
    }
  };
  
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <h2 className="text-2xl font-semibold text-slate-700 md:col-span-2">Thông tin bệnh nhân</h2>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên bệnh nhân <span className="text-red-500">*</span></label>
            <input type="text" id="name" name="name" value={patient.name} onChange={handlePatientChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh <span className="text-red-500">*</span></label>
            <input type="date" id="dob" name="dob" value={patient.dob} onChange={handlePatientChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
            <input type="text" id="address" name="address" value={patient.address} onChange={handlePatientChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
            <input type="tel" id="phone" name="phone" value={patient.phone} onChange={handlePatientChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
        </div>

        <hr className="border-t border-gray-200" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <h2 className="text-2xl font-semibold text-slate-700 md:col-span-2">Thông tin lịch hẹn</h2>
          
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Vấn đề cần khám</label>
            <select id="reason" name="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
              {REASONS_FOR_VISIT.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          
          <div className="relative">
            <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-1">Chọn ngày khám <span className="text-red-500">*</span></label>
            <div className="relative">
              <input type="date" id="appointmentDate" name="appointmentDate" value={selectedDate} onChange={(e) => {setSelectedDate(e.target.value); setSelectedSlot(null);}} min={today} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 pr-10"/>
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
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        
        <div className="text-center pt-4">
          <button type="submit" className="w-full md:w-auto inline-flex justify-center py-3 px-12 border border-transparent shadow-sm text-lg font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105">
            Đặt Lịch Hẹn
          </button>
        </div>
      </form>
    </div>
  );
};
