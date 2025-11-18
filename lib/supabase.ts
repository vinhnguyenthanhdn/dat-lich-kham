
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface AppointmentRow {
  id?: string;
  patient_name: string;
  patient_dob: string;
  parent_name: string;
  patient_address: string | null;
  patient_phone: string;
  reason: string;
  appointment_date: string;
  created_at?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
}

// Function to insert appointment
export async function insertAppointment(appointment: AppointmentRow) {
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointment])
    .select()
    .single();

  if (error) {
    console.error('Error inserting appointment:', error);
    throw error;
  }

  return data;
}

// Function to get booked slots for a specific date range
export async function getBookedSlots(startDate: Date, endDate: Date) {
  const { data, error } = await supabase
    .from('appointments')
    .select('appointment_date')
    .gte('appointment_date', startDate.toISOString())
    .lte('appointment_date', endDate.toISOString())
    .neq('status', 'cancelled');

  if (error) {
    console.error('Error fetching booked slots:', error);
    return [];
  }

  return data.map(item => new Date(item.appointment_date));
}
