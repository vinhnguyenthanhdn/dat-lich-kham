
import React, { useState, useCallback } from 'react';
import { BookingForm } from './components/BookingForm';
import { ConfirmationModal } from './components/ConfirmationModal';
import type { Appointment } from './types';
import { insertAppointment, type AppointmentRow } from './lib/supabase';

function App() {
  const [bookedSlots, setBookedSlots] = useState<Date[]>([]);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBookAppointment = useCallback(async (appointment: Appointment) => {
    // Check for local conflicts first
    const isConflict = bookedSlots.some(
      (slot) => slot.getTime() === appointment.dateTime.getTime()
    );

    if (isConflict) {
      alert('Khung giờ này đã được đặt. Vui lòng chọn khung giờ khác.');
      return false;
    }

    // Prevent duplicate submissions
    if (isSubmitting) {
      return false;
    }

    setIsSubmitting(true);

    try {
      // Save to Supabase
      const appointmentRow: AppointmentRow = {
        patient_name: appointment.patient.name,
        patient_dob: appointment.patient.dob,
        parent_name: appointment.patient.parentName,
        patient_address: appointment.patient.address || null,
        patient_phone: appointment.patient.phone,
        reason: appointment.reason,
        appointment_date: appointment.dateTime.toISOString(),
        status: 'pending',
      };

      await insertAppointment(appointmentRow);

      // Update local state
      setBookedSlots((prevSlots) => [...prevSlots, appointment.dateTime]);
      setConfirmedAppointment(appointment);

      return true;
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại sau.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [bookedSlots, isSubmitting]);

  const closeConfirmationModal = () => {
    setConfirmedAppointment(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-4xl mx-auto relative z-10">
        <header className="text-center mb-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <img
                src="/logo.jpg"
                alt="Logo Phòng Khám"
                className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover shadow-2xl border-4 border-white transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3">
            Đặt Lịch Khám
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 font-medium">Bác sĩ Cẩm Vân</p>
          <p className="mt-2 text-base text-gray-600 max-w-2xl mx-auto">Vui lòng điền thông tin dưới đây để đặt lịch hẹn khám bệnh</p>
        </header>
        <main>
          <BookingForm
            onBookAppointment={handleBookAppointment}
            bookedSlots={bookedSlots}
          />
        </main>
      </div>
      <ConfirmationModal
        isOpen={!!confirmedAppointment}
        onClose={closeConfirmationModal}
        appointmentDetails={confirmedAppointment}
      />
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default App;
