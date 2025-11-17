
import React, { useState, useCallback } from 'react';
import { BookingForm } from './components/BookingForm';
import { ConfirmationModal } from './components/ConfirmationModal';
import type { Appointment } from './types';

function App() {
  const [bookedSlots, setBookedSlots] = useState<Date[]>([]);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  const handleBookAppointment = useCallback((appointment: Appointment) => {
    // In a real app, you would check for conflicts on the server here.
    const isConflict = bookedSlots.some(
      (slot) => slot.getTime() === appointment.dateTime.getTime()
    );

    if (isConflict) {
      alert('This time slot has just been booked. Please select another one.');
      return false;
    }

    setBookedSlots((prevSlots) => [...prevSlots, appointment.dateTime]);
    setConfirmedAppointment(appointment);
    return true;
  }, [bookedSlots]);

  const closeConfirmationModal = () => {
    setConfirmedAppointment(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800">Đặt Lịch Khám</h1>
          <p className="mt-2 text-lg text-slate-600">Vui lòng điền thông tin dưới đây để đặt lịch hẹn.</p>
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
    </div>
  );
}

export default App;
