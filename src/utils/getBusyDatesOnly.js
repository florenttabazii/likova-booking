import { supabase } from '@/supabaseClient'
import { fetchAvailableHours } from './fetchAvailableHours'

// ✅ This function returns only busy dates — not fully booked
export async function getBusyDatesOnly(barberId, threshold = 0.5) {
  const { data, error } = await supabase
    .from('availability')
    .select('date')
    .eq('barber_id', barberId)
    .eq('is_available', false)

  if (error) {
    console.error('❌ Failed to fetch busy dates:', error)
    return []
  }

  const uniqueDates = [...new Set(data.map((item) => item.date))]
  const busyDates = []

  for (const date of uniqueDates) {
    const slots = await fetchAvailableHours(barberId, date)
    const total = slots.length + data.filter(d => d.date === date).length
    const ratio = slots.length / total

    if (ratio > 0 && ratio < threshold) {
      busyDates.push(date)
    }
  }

  return busyDates
}
