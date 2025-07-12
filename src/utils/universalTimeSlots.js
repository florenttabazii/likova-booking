import { supabase } from '@/supabaseClient'

/**
 * 🚀 UNIVERSAL SCHEDULING ALGORITHM
 * Works with ANY service duration and ANY slot interval
 * Calculates exact availability based on business needs
 */
export async function calculateAvailableSlots(selectedServices, selectedDate, barberId) {
  try {
    console.log('🔍 Universal scheduler starting...', { selectedServices, selectedDate, barberId })

    // Calculate total service duration
    const totalDuration = selectedServices.reduce(
      (sum, service) => sum + (service.duration || 0),
      0,
    )
    console.log('⏱️ Total service duration:', totalDuration, 'minutes')

    if (totalDuration === 0) {
      console.warn('⚠️ No duration selected')
      return []
    }

    // Get base time slots from database
    const { data: slotData, error: slotError } = await supabase
      .from('time_slots')
      .select('slots')
      .single()

    if (slotError || !slotData?.slots) {
      console.error('❌ Failed to fetch time slots:', slotError)
      return []
    }

    const baseSlots = slotData.slots.sort()
    console.log('📅 Base slots:', baseSlots)

    // 🧮 UNIVERSAL: Detect slot interval automatically
    const slotInterval = detectSlotInterval(baseSlots)
    console.log('⏱️ Detected slot interval:', slotInterval, 'minutes')

    // 🧮 UNIVERSAL: Calculate how many slots needed
    const slotsNeeded = Math.ceil(totalDuration / slotInterval)
    console.log('📊 Slots needed for service:', slotsNeeded)

    // Get booked/unavailable slots
    const { data: bookedData, error: bookedError } = await supabase
      .from('availability')
      .select('hour')
      .eq('barber_id', barberId)
      .eq('date', selectedDate)
      .eq('is_available', false)

    if (bookedError) {
      console.error('❌ Failed to fetch booked slots:', bookedError)
      return baseSlots
    }

    const bookedSlots = bookedData.map((item) => item.hour)
    console.log('🚫 Booked slots:', bookedSlots)

    // 🎯 SMART FILTERING: Check each slot for availability
    const availableStartSlots = baseSlots.filter((slot) => {
      return canBookAtThisSlot(slot, slotsNeeded, baseSlots, bookedSlots, slotInterval)
    })

    console.log('✅ Available start slots:', availableStartSlots)
    return availableStartSlots
  } catch (error) {
    console.error('💥 Universal scheduler error:', error)
    return []
  }
}

/**
 * 🧮 UNIVERSAL: Auto-detect slot interval from time slots
 * Works with 15min, 20min, 30min, or any interval
 */
function detectSlotInterval(slots) {
  if (slots.length < 2) return 20 // Default fallback

  const firstSlot = timeToMinutes(slots[0])
  const secondSlot = timeToMinutes(slots[1])
  const interval = secondSlot - firstSlot

  console.log(`🔍 Auto-detected interval: ${interval} minutes (${slots[0]} → ${slots[1]})`)
  return interval
}

/**
 * 🎯 SMART CHECK: Can we book a service starting at this slot?
 */
function canBookAtThisSlot(startSlot, slotsNeeded, allSlots, bookedSlots, slotInterval) {
  const startIndex = allSlots.indexOf(startSlot)

  if (startIndex === -1) {
    return false // Slot doesn't exist
  }

  // Calculate which slots would be occupied by this service
  const requiredSlots = []

  for (let i = 0; i < slotsNeeded; i++) {
    const slotIndex = startIndex + i

    if (slotIndex >= allSlots.length) {
      // Service would extend beyond available slots
      console.log(`❌ ${startSlot}: Would extend beyond schedule (needs ${slotsNeeded} slots)`)
      return false
    }

    requiredSlots.push(allSlots[slotIndex])
  }

  // Check if ANY required slot is already booked
  const conflicts = requiredSlots.filter((slot) => bookedSlots.includes(slot))

  if (conflicts.length > 0) {
    console.log(`❌ ${startSlot}: Conflicts with booked slots:`, conflicts)
    return false
  }

  // Calculate service end time for logging
  const endTime = calculateServiceEndTime(startSlot, slotsNeeded, slotInterval)
  console.log(
    `✅ ${startSlot}: Can book (service ends at ${endTime}, uses slots: ${requiredSlots.join(', ')})`,
  )

  return true
}

/**
 * 🕐 Calculate when service ends (for display/logging)
 */
function calculateServiceEndTime(startSlot, slotsNeeded, slotInterval) {
  const startMinutes = timeToMinutes(startSlot)
  const serviceMinutes = slotsNeeded * slotInterval
  const endMinutes = startMinutes + serviceMinutes
  return minutesToTime(endMinutes)
}

/**
 * 🕐 Convert time string to minutes since midnight
 */
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * 🕐 Convert minutes back to time string
 */
function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

/**
 * 🗓️ Filter past slots if booking for today
 */
export function filterPastSlots(slots, selectedDate) {
  const now = new Date()
  const selectedDateObj = new Date(selectedDate)

  // Only filter if selected date is today
  if (selectedDateObj.toDateString() !== now.toDateString()) {
    return slots
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes() + 15 // 15min buffer

  return slots.filter((slot) => {
    const slotMinutes = timeToMinutes(slot)
    return slotMinutes > currentMinutes
  })
}

/**
 * 🎯 Check if a date should be muted (no available slots)
 */
export async function shouldDateBeMuted(date, barberId, selectedServices) {
  const slots = await calculateAvailableSlots(selectedServices, date, barberId)
  const availableSlots = filterPastSlots(slots, date)
  return availableSlots.length === 0
}

// Default export for compatibility
export default {
  calculateAvailableSlots,
  filterPastSlots,
  shouldDateBeMuted,
}
