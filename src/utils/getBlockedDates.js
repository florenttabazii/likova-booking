import { supabase } from '@/supabaseClient'

/**
 * Fetches all blocked date ranges for a barber
 * and expands them into individual ISO date strings.
 * These will be treated as unavailable in date pickers.
 */
export async function getBlockedDates(barberId) {
  const { data, error } = await supabase
    .from('blocked_appt')
    .select('start_date, end_date')
    .eq('barber_id', barberId)

  if (error) {
    console.error('❌ Failed to fetch blocked dates:', error)
    return []
  }

  const blockedDates = new Set()

  for (const entry of data) {
    const start = new Date(entry.start_date)
    const end = new Date(entry.end_date)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      blockedDates.add(new Date(d).toISOString().split('T')[0])
    }
  }

  return Array.from(blockedDates)
}
