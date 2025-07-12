import { defineStore } from 'pinia'
import { supabase } from '@/supabaseClient'
import { useBarbersStore } from './barbers'
import { useServicesStore } from './services'

const saveToLocalStorage = (key, data, hoursToExpire = 24) => {
  const item = {
    value: data,
    expiry: new Date().getTime() + hoursToExpire * 60 * 60 * 1000,
  }
  localStorage.setItem(key, JSON.stringify(item))
}

// Helper function to get from localStorage with expiry check
const getFromLocalStorage = (key) => {
  const itemStr = localStorage.getItem(key)
  if (!itemStr) return null

  const item = JSON.parse(itemStr)
  const now = new Date().getTime()

  // If expired, remove it and return null
  if (now > item.expiry) {
    localStorage.removeItem(key)
    return null
  }

  return item.value
}

export const useBookingStore = defineStore('booking', {
  state: () => ({
    currentStep: 1,
    bookingId: '',
    showConfirmationModal: false,
    showValidationModal: false,
    booking: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      date: '',
      timeSlot: '',
    },
    availableSlots: [],
    timeSlotDB: {}, // Simulated database for time slots
  }),

  getters: {
    progressPercentage: (state) => {
      return (state.currentStep / 4) * 100
    },

    isBookingFormComplete: (state) => {
      return (
        state.booking.firstName &&
        state.booking.lastName &&
        state.booking.email &&
        state.booking.phone &&
        state.booking.phone !== '+41 ' && // UPDATE THIS LINE
        state.booking.date &&
        state.booking.timeSlot &&
        state.availableSlots.length > 0
      )
    },

    minDate: () => {
      const today = new Date()
      return today.toISOString().split('T')[0]
    },
  },

  actions: {
    initializeFromStorage() {
      const barbersStore = useBarbersStore()
      const servicesStore = useServicesStore()

      // Restore booking data
      const savedBooking = getFromLocalStorage('bookingData')
      if (savedBooking) {
        this.booking = savedBooking
      }

      // Restore current step
      const savedStep = getFromLocalStorage('bookingStep')
      if (savedStep) {
        this.currentStep = savedStep
      }

      // Restore barber selection
      const savedBarberId = getFromLocalStorage('selectedBarberId')
      if (savedBarberId) {
        barbersStore.selectedBarberId = savedBarberId
      }

      // Restore service selections
      const savedServices = getFromLocalStorage('selectedServices')
      if (savedServices) {
        servicesStore.selectedServices = savedServices
      }
    },

    saveToStorage() {
      const barbersStore = useBarbersStore()
      const servicesStore = useServicesStore()

      // Save all booking-related data
      saveToLocalStorage('bookingData', this.booking, 24)
      saveToLocalStorage('bookingStep', this.currentStep, 24)
      saveToLocalStorage('selectedBarberId', barbersStore.selectedBarberId, 24)
      saveToLocalStorage('selectedServices', servicesStore.selectedServices, 24)
    },

    nextStep() {
      if (this.currentStep < 4) {
        this.currentStep++
      }
    },

    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },

    setStep(step) {
      this.currentStep = step
    },

    updateBookingField(field, value) {
      this.booking[field] = value
      this.saveToStorage()
    },

    loadAvailableSlots() {
      const selectedDate = this.booking.date

      // Generate available slots or use cached ones
      if (!this.timeSlotDB[selectedDate]) {
        this.timeSlotDB[selectedDate] = this.generateTimeSlots()
      }

      this.availableSlots = this.timeSlotDB[selectedDate]
      this.booking.timeSlot = '' // Reset selected slot
    },

    setAvailableSlots(slots) {
      this.availableSlots = slots
      this.booking.timeSlot = '' // reset selected slot
    },

    generateTimeSlots() {
      const slots = [
        '9:00 AM',
        '9:30 AM',
        '10:00 AM',
        '10:30 AM',
        '11:00 AM',
        '11:30 AM',
        '12:00 PM',
        '12:30 PM',
        '1:00 PM',
        '1:30 PM',
        '2:00 PM',
        '2:30 PM',
        '3:00 PM',
        '3:30 PM',
        '4:00 PM',
        '4:30 PM',
        '5:00 PM',
        '5:30 PM',
      ]

      // Get current date and time
      const now = new Date()
      const selectedDate = new Date(this.booking.date)

      // Check if selected date is today
      const isToday = selectedDate.toDateString() === now.toDateString()

      let availableSlots = slots

      // If it's today, filter out past times with 15-minute buffer
      if (isToday) {
        availableSlots = slots.filter((slot) => {
          // Convert slot time to 24-hour format for comparison
          const [time, period] = slot.split(' ')
          let [hours, minutes] = time.split(':').map(Number)

          // Convert to 24-hour format
          if (period === 'PM' && hours !== 12) {
            hours += 12
          } else if (period === 'AM' && hours === 12) {
            hours = 0
          }

          // Create date object for the slot time
          const slotDate = new Date(selectedDate)
          slotDate.setHours(hours, minutes, 0, 0)

          // Add 15-minute buffer (subtract 15 minutes from slot time)
          const bufferTime = new Date(slotDate.getTime() - 15 * 60000)

          // Only show slots that are at least 15 minutes in the future
          return bufferTime > now
        })
      }

      // Randomly remove some slots to simulate existing bookings
      availableSlots = availableSlots.filter(() => Math.random() > 0.3)

      return availableSlots
    },

    selectTimeSlot(slot) {
      this.booking.timeSlot = slot
      this.saveToStorage()
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    },

    generateBookingId() {
      this.bookingId = 'BK' + Date.now().toString().slice(-6)
    },

    async confirmBooking() {
      const barbersStore = useBarbersStore()
      const servicesStore = useServicesStore()

      console.log('Selected services:', servicesStore.selectedServices)

      // 1. Save booking to Supabase and get inserted ID
      const { data: bookingResult, error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            barber_id: this.booking.barber_id,
            customer_name: this.booking.firstName,
            customer_surname: this.booking.lastName,
            customer_email: this.booking.email,
            phone_number: this.booking.phone,
            date_appt: this.booking.date,
            hour: this.booking.timeSlot,
            created_at: new Date().toISOString(),
          },
        ])
        .select('id')
        .single()

      if (bookingError || !bookingResult) {
        console.error('❌ Booking insert failed:', bookingError)
        return null
      }

      const newBookingId = bookingResult.id
      this.bookingId = newBookingId

      // 2. Link selected services to the booking
      const serviceInserts = servicesStore.selectedServicesDetails
        .filter((service) => service?.id)
        .map((service) => ({
          booking_id: newBookingId,
          service_id: service.id,
        }))

      console.log('🧪 Trying to link these services:', serviceInserts)

      const { error: linkError } = await supabase.from('booking_services').insert(serviceInserts)

      if (linkError) {
        console.error('❌ Failed to link services:', linkError)
      } else {
        console.log('✅ Services linked to booking:', serviceInserts)
      }

      // 3. Mark slot as unavailable
      const { error: slotError } = await supabase.from('availability').upsert(
        [
          {
            barber_id: this.booking.barber_id,
            date: this.booking.date,
            hour: this.booking.timeSlot,
            is_available: false,
          },
        ],
        { onConflict: ['barber_id', 'date', 'hour'] },
      )

      if (slotError) {
        console.error('❌ Failed to block slot (upsert):', slotError)
      }

      // 4. Log summary
      console.log('✅ Booking saved:', {
        id: this.bookingId,
        customer: this.booking,
        services: servicesStore.selectedServicesDetails,
        total: servicesStore.totalPrice,
        barber: barbersStore.selectedBarber?.name || 'Not selected',
      })

      return this.bookingId
    },

    toggleConfirmationModal(show) {
      this.showConfirmationModal = show
    },

    showValidation(message) {
      this.validationMessage = message
      this.showValidationModal = true
    },

    hideValidationModal() {
      this.showValidationModal = false
      this.validationMessage = ''
    },

    resetBooking() {
      // Reset all booking data
      this.currentStep = 1
      this.bookingId = ''
      this.booking = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        date: '',
        timeSlot: '',
      }
      this.availableSlots = []

      // Clear ALL localStorage
      localStorage.removeItem('bookingData')
      localStorage.removeItem('bookingStep')
      localStorage.removeItem('selectedBarberId') // ADD THIS LINE
      localStorage.removeItem('selectedServices') // ADD THIS LINE

      // Reset other stores
      const barbersStore = useBarbersStore()
      const servicesStore = useServicesStore()
      barbersStore.resetSelection()
      servicesStore.resetServices()
    },
  },
})
