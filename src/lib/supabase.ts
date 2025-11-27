
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
  note?: string | null;
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

// ============ ADMIN FUNCTIONS ============

// Get all appointments with pagination and filters
export async function getAllAppointments(
  limit: number = 50,
  offset: number = 0,
  search?: string,
  status?: 'pending' | 'confirmed' | 'cancelled'
) {
  let query = supabase
    .from('appointments')
    .select('*', { count: 'exact' })
    .order('appointment_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`patient_name.ilike.%${search}%,patient_phone.ilike.%${search}%,parent_name.ilike.%${search}%`);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }

  return { data: data || [], count: count || 0 };
}

// Get appointments for today
export async function getTodayAppointments() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .gte('appointment_date', today.toISOString())
    .lt('appointment_date', tomorrow.toISOString())
    .order('appointment_date', { ascending: true });

  if (error) {
    console.error('Error fetching today appointments:', error);
    return [];
  }

  return data || [];
}

// Get appointments for tomorrow
export async function getTomorrowAppointments() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .gte('appointment_date', tomorrow.toISOString())
    .lt('appointment_date', dayAfter.toISOString())
    .order('appointment_date', { ascending: true });

  if (error) {
    console.error('Error fetching tomorrow appointments:', error);
    return [];
  }

  return data || [];
}

// Get statistics for dashboard
export async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  // Total appointments
  const { count: totalCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true });

  // Today's appointments
  const { count: todayCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('appointment_date', today.toISOString())
    .lt('appointment_date', tomorrow.toISOString());

  // This month's appointments
  const { count: monthCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('appointment_date', thisMonth.toISOString())
    .lt('appointment_date', nextMonth.toISOString());

  // Pending appointments
  const { count: pendingCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  return {
    total: totalCount || 0,
    today: todayCount || 0,
    month: monthCount || 0,
    pending: pendingCount || 0,
  };
}

// Get appointments grouped by date for chart with date range
export async function getAppointmentsByDate(daysBefore: number = 15, daysAfter: number = 15) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - daysBefore);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + daysAfter);
  endDate.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('appointments')
    .select('appointment_date, created_at')
    .gte('appointment_date', startDate.toISOString())
    .lte('appointment_date', endDate.toISOString())
    .order('appointment_date', { ascending: true });

  if (error) {
    console.error('Error fetching appointments by date:', error);
    return [];
  }

  // Group by date
  const grouped = (data || []).reduce((acc: Record<string, number>, item) => {
    const date = new Date(item.appointment_date).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Fill in missing dates with 0 count
  const result: Array<{ date: string; count: number }> = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      count: grouped[dateStr] || 0,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
}

// Update appointment status
export async function updateAppointmentStatus(
  id: string,
  status: 'pending' | 'confirmed' | 'cancelled'
) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }

  return data;
}

// Update appointment note
export async function updateAppointmentNote(id: string, note: string) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ note })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating appointment note:', error);
    throw error;
  }

  return data;
}

// Update appointment patient info
export async function updateAppointmentInfo(
  id: string,
  info: Partial<Pick<AppointmentRow, 'patient_name' | 'patient_dob' | 'parent_name' | 'patient_address' | 'patient_phone'>>
) {
  const { data, error } = await supabase
    .from('appointments')
    .update(info)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating appointment info:', error);
    throw error;
  }

  return data;
}

// Delete appointment
export async function deleteAppointment(id: string) {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }

  return true;
}

// ============ BLOCKED SLOTS FUNCTIONS ============

export interface BlockedSlot {
  id?: string;
  blocked_date: string; // YYYY-MM-DD format
  blocked_time: string; // HH:MM format (e.g., "08:30", "15:00")
  reason?: string;
  created_at?: string;
}

// Get all blocked slots
export async function getAllBlockedSlots() {
  const { data, error } = await supabase
    .from('blocked_slots')
    .select('*')
    .order('blocked_date', { ascending: true })
    .order('blocked_time', { ascending: true });

  if (error) {
    console.error('Error fetching blocked slots:', error);
    throw error;
  }

  return data || [];
}

// Get blocked slots for a specific date range
export async function getBlockedSlotsInRange(startDate: string | Date, endDate: string | Date) {
  // Handle both string (YYYY-MM-DD) and Date inputs
  const startDateStr = typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0];
  const endDateStr = typeof endDate === 'string' ? endDate : endDate.toISOString().split('T')[0];
  console.log('[getBlockedSlotsInRange] Query params:', { startDateStr, endDateStr });

  const { data, error } = await supabase
    .from('blocked_slots')
    .select('*')
    .gte('blocked_date', startDateStr)
    .lte('blocked_date', endDateStr)
    .order('blocked_date', { ascending: true })
    .order('blocked_time', { ascending: true });

  if (error) {
    console.error('Error fetching blocked slots in range:', error);
    return [];
  }

  console.log('[getBlockedSlotsInRange] Data returned:', data);
  return data || [];
}

// Add a blocked slot
export async function addBlockedSlot(slot: Omit<BlockedSlot, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('blocked_slots')
    .insert([slot])
    .select()
    .single();

  if (error) {
    console.error('Error adding blocked slot:', error);
    throw error;
  }

  return data;
}

// Delete a blocked slot
export async function deleteBlockedSlot(id: string) {
  const { error } = await supabase
    .from('blocked_slots')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blocked slot:', error);
    throw error;
  }

  return true;
}

// Update a blocked slot
export async function updateBlockedSlot(id: string, updates: Partial<Omit<BlockedSlot, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('blocked_slots')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating blocked slot:', error);
    throw error;
  }

  return data;
}
