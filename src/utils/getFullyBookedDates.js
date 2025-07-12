// utils/getFullyBookedDates.js
import { supabase } from '@/supabaseClient'
import { fetchAvailableHours } from './fetchAvailableHours'
import { getBlockedDates } from './getBlockedDates'

export async function getFullyBookedDates(barberId, interval = 15, threshold = 0.5) {
  const { data, error } = await supabase
    .from('availability')
    .select('date')
    .eq('barber_id', barberId)
    .eq('is_available', false)

  if (error) {
    console.error('❌ Error fetching availability dates:', error)
    return { fullyBooked: [], busy: [] }
  }

  const uniqueDates = [...new Set(data.map(item => item.date))]
  const fullyBooked = []
  const busy = []

  // Include all blocked dates as fully booked
  const blockedDates = await getBlockedDates(barberId)
  for (const blocked of blockedDates) {
    if (!fullyBooked.includes(blocked)) {
      fullyBooked.push(blocked)
    }
  }

  for (const date of uniqueDates) {
    // Skip if already in blocked list
    if (blockedDates.includes(date)) continue

    const availableSlots = await fetchAvailableHours(barberId, date)
    const totalPossible = await getTotalPossibleSlots(barberId, date, interval)

    if (availableSlots.length === 0) {
      fullyBooked.push(date)
    } else if (availableSlots.length / totalPossible < (1 - threshold)) {
      busy.push(date)
    }
  }

  return { fullyBooked, busy }
}

// Utility to calculate how many total slots could exist that day
async function getTotalPossibleSlots(barberId, date, interval) {
  const dayNumber = new Date(date).getDay()
  const { data } = await supabase
    .from('barber_working_hours')
    .select('start_time, end_time')
    .eq('barber_id', barberId)
    .eq('weekday', dayNumber)
    .single()

  if (!data) return 0

  const [sh, sm] = data.start_time.split(':').map(Number)
  const [eh, em] = data.end_time.split(':').map(Number)

  const start = new Date(date)
  const end = new Date(date)
  start.setHours(sh, sm, 0, 0)
  end.setHours(eh, em, 0, 0)

  const diff = (end - start) / 60000 // in minutes
  return Math.floor(diff / interval)
}
