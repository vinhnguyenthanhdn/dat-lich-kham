
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
        <div className="text-center p-4 bg-gray-100 rounded-md">
            <p className="text-gray-500">Vui lòng chọn một ngày để xem các khung giờ có sẵn.</p>
        </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Chọn giờ khám <span className="text-red-500">*</span></label>
      {availableSlots.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {availableSlots.map((slot) => {
            const isSelected = selectedSlot?.getTime() === slot.getTime();
            return (
              <button
                type="button"
                key={slot.toISOString()}
                onClick={() => onSelectSlot(slot)}
                className={`px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                  isSelected 
                  ? 'bg-indigo-600 text-white shadow-md ring-2 ring-offset-2 ring-indigo-500' 
                  : 'bg-gray-100 text-gray-800 hover:bg-indigo-100 hover:text-indigo-700'
                }`}
              >
                <ClockIcon className="h-4 w-4" />
                <span>{formatTime(slot.getHours() + slot.getMinutes() / 60)}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-700">Không có lịch trống cho ngày đã chọn. Vui lòng chọn ngày khác.</p>
        </div>
      )}
    </div>
  );
};
