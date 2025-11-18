
import React, { useMemo } from 'react';
import { DAILY_SCHEDULE, APPOINTMENT_DURATION_MINUTES } from '../constants';
import { ClockIcon } from './icons/ClockIcon';

interface TimeSlotPickerProps {
  selectedDateString: string;
  bookedSlots: Date[];
  onSelectSlot: (slot: Date) => void;
  selectedSlot: Date | null;
}

const formatTime = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ selectedDateString, bookedSlots, onSelectSlot, selectedSlot }) => {
  const availableSlots = useMemo(() => {
    if (!selectedDateString) return [];
    
    const date = new Date(selectedDateString);
    // Adjust for timezone offset to prevent day-off errors
    const localDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
    const dayOfWeek = localDate.getDay();

    const scheduleForDay = DAILY_SCHEDULE[dayOfWeek];
    if (!scheduleForDay) return [];

    const slots: Date[] = [];
    scheduleForDay.forEach(([startHour, endHour]) => {
      let currentHour = startHour;
      while (currentHour < endHour) {
        const slotDate = new Date(localDate);
        const hours = Math.floor(currentHour);
        const minutes = Math.round((currentHour - hours) * 60);
        slotDate.setHours(hours, minutes, 0, 0);
        slots.push(slotDate);
        currentHour += APPOINTMENT_DURATION_MINUTES / 60;
      }
    });

    const bookedTimes = new Set(bookedSlots.map(d => d.getTime()));
    return slots.filter(slot => !bookedTimes.has(slot.getTime()));
  }, [selectedDateString, bookedSlots]);
  
  if (!selectedDateString) {
    return (
        <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 font-medium">Vui lòng chọn ngày khám để xem các khung giờ có sẵn</p>
        </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">Chọn giờ khám <span className="text-red-500">*</span></label>
      {availableSlots.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {availableSlots.map((slot) => {
            const isSelected = selectedSlot?.getTime() === slot.getTime();
            return (
              <button
                type="button"
                key={slot.toISOString()}
                onClick={() => onSelectSlot(slot)}
                className={`group relative px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                  isSelected
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105 ring-4 ring-indigo-200'
                  : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 border-2 border-gray-200 hover:border-indigo-300 hover:shadow-md hover:scale-105'
                }`}
              >
                <ClockIcon className={`h-4 w-4 transition-transform ${isSelected ? '' : 'group-hover:rotate-12'}`} />
                <span>{formatTime(slot.getHours() + slot.getMinutes() / 60)}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl">
            <svg className="w-12 h-12 mx-auto text-yellow-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-yellow-800 font-semibold">Không có lịch trống cho ngày đã chọn</p>
            <p className="text-yellow-700 text-sm mt-1">Vui lòng chọn ngày khác</p>
        </div>
      )}
    </div>
  );
};
