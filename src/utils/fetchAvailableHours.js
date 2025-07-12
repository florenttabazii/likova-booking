// utils/fetchAvailableHours.js
import { supabase } from '@/supabaseClient'
import { getBlockedDates } from './getBlockedDates'

export async function fetchAvailableHours(barberId, date, totalDuration = 30) {
  const selectedDate = new Date(date)
  const dayNumber = selectedDate.getDay() // 0 = Sunday, 6 = Saturday

  // 🔒 Check if date is blocked first
  const blockedList = await getBlockedDates(barberId)
  const isoDate = selectedDate.toISOString().split('T')[0]
  if (blockedList.includes(isoDate)) {
    return []
  }

  // 1️⃣ Get interval from barbers table
  const { data: barberData, error: barberError } = await supabase
    .from('barbers')
    .select('slot_interval_minutes')
    .eq('id', barberId)
    .single()

  if (barberError || !barberData?.slot_interval_minutes) {
    console.error('❌ Failed to fetch barber interval:', barberError)
    return []
  }

  const intervalMinutes = barberData.slot_interval_minutes

  // 2️⃣ Get working hours + pauses
  const { data: hoursData, error: hoursError } = await supabase
    .from('barber_working_hours')
    .select(`
      start_time, end_time,
      pausefirst_start, pausefirst_end,
      pausesecond_start, pausesecond_end
    `)
    .eq('barber_id', barberId)
    .eq('weekday', dayNumber)
    .single()

  if (hoursError || !hoursData?.start_time || !hoursData?.end_time) {
    console.warn('⚠️ No working hours found for this day.')
    return []
  }

  const {
    start_time, end_time,
    pausefirst_start, pausefirst_end,
    pausesecond_start, pausesecond_end,
  } = hoursData

  function timeStrToMinutes(str) {
    if (!str) return null
    const [h, m] = str.split(':').map(Number)
    return h * 60 + m
  }

  const pauseWindows = []
  const pfStart = timeStrToMinutes(pausefirst_start)
  const pfEnd = timeStrToMinutes(pausefirst_end)
  const psStart = timeStrToMinutes(pausesecond_start)
  const psEnd = timeStrToMinutes(pausesecond_end)

  if (pfStart !== null && pfEnd !== null) pauseWindows.push([pfStart, pfEnd])
  if (psStart !== null && psEnd !== null) pauseWindows.push([psStart, psEnd])

  // 3️⃣ Generate slots (skip pauses)
  function generateSlots(start, end, interval) {
    const slots = []
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)

    let current = new Date(date)
    current.setHours(sh, sm, 0, 0)

    const endTime = new Date(date)
    endTime.setHours(eh, em, 0, 0)

    while (current < endTime) {
      const totalMinutes = current.getHours() * 60 + current.getMinutes()

      // Skip if inside a pause
      const isPaused = pauseWindows.some(([pStart, pEnd]) => totalMinutes >= pStart && totalMinutes < pEnd)
      if (!isPaused) {
        const hh = current.getHours().toString().padStart(2, '0')
        const mm = current.getMinutes().toString().padStart(2, '0')
        slots.push(`${hh}:${mm}`)
      }

      current.setMinutes(current.getMinutes() + interval)
    }

    return slots
  }

  const baseSlots = generateSlots(start_time, end_time, intervalMinutes)

  // 4️⃣ Fetch taken hours
  const formattedDate = isoDate
  const { data: takenData, error: takenError } = await supabase
    .from('availability')
    .select('hour')
    .eq('barber_id', barberId)
    .eq('date', formattedDate)
    .eq('is_available', false)

  const normalizeTime = (t) => {
    const [h, m] = t.trim().split(':').map(Number)
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  const takenHours = takenError ? [] : takenData.map(item => normalizeTime(item.hour))

  // 5️⃣ Filter out booked/past slots
  const now = new Date()
  const isToday = now.toDateString() === selectedDate.toDateString()
  const slotsNeeded = Math.ceil(totalDuration / intervalMinutes)
  const availableSlots = []

  for (let i = 0; i <= baseSlots.length - slotsNeeded; i++) {
    const chunk = baseSlots.slice(i, i + slotsNeeded)

    if (chunk.some(slot => takenHours.includes(slot))) continue

    if (isToday) {
      const [h, m] = baseSlots[i].split(':').map(Number)
      const slotTime = new Date(date)
      slotTime.setHours(h, m, 0, 0)
      if (slotTime <= now) continue
    }

    availableSlots.push(baseSlots[i])
  }

  return availableSlots
}
