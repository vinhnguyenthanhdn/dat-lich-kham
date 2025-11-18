
export const REASONS_FOR_VISIT: string[] = [
  'Chậm nói',
  'Tự kỷ',
  'Tăng động giảm chú ý',
  'Vận động',
  'Sa tạng chậu',
  'Đau khớp',
  'Vật lý trị liệu hô hấp (lấy đờm)',
  'Vấn đề khác',
];

// Time slots for each day. 0 = Sunday, 6 = Saturday
// Each entry is an array of [startHour, endHour] in 24-hour format (e.g., 8.5 is 8:30)
export const DAILY_SCHEDULE: { [key: number]: [number, number][] } = {
  0: [[8.5, 10.5], [15, 18]], // Sunday
  1: [[17, 20]],               // Monday
  2: [[17, 20]],               // Tuesday
  3: [[17, 20]],               // Wednesday
  4: [[17, 20]],               // Thursday
  5: [[17, 20]],               // Friday
  6: [[8.5, 10.5], [15, 18]], // Saturday
};

export const APPOINTMENT_DURATION_MINUTES = 30;
