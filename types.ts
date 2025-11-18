
export interface Patient {
  name: string;
  dob: string;
  parentName: string;
  address: string;
  phone: string;
}

export interface Appointment {
  patient: Patient;
  reason: string;
  dateTime: Date;
}
