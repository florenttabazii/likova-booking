<template>
  <div class="row justify-content-center">
    <LoadingOverlay :visible="isLoading" gif="/assets/loading.gif" />

    <div class="col-md-8">
      <div class="card">
        <div class="card-body">
          <!-- Personal Information -->
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">{{ $t('booking.firstName') }} *</label>
              <input type="text" class="form-control" v-model="booking.firstName" required />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">{{ $t('booking.lastName') }} *</label>
              <input type="text" class="form-control" v-model="booking.lastName" required />
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">{{ $t('booking.email') }} *</label>
              <input type="email" class="form-control" v-model="booking.email" required />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">{{ $t('booking.phone') }} *</label>
              <div class="input-group">
                <span class="input-group-text bg-light">+41</span>
                <input
                  type="tel"
                  class="form-control"
                  v-model="phoneNumber"
                  @input="validatePhone"
                  :placeholder="$t('booking.phonePlaceholder')"
                  maxlength="12"
                />
              </div>
              <small class="text-muted">{{ $t('booking.phoneHint') }}</small>
            </div>
          </div>

          <!-- Datepicker -->
          <div class="mb-3">
            <label class="form-label">{{ $t('booking.selectDate') }} *</label>
            <Datepicker
              v-model="booking.date"
              :min-date="new Date()"
              :max-date="maxDate"
              :disabled-dates="fullyBookedDates"
              :day-class="getDayClass"
              :format="'dd.MM.yyyy'"
              locale="de"
              auto-apply
              :placeholder="$t('booking.datePlaceholder')"
              :enable-time-picker="false"
            />
          </div>

          <!-- Time Slots -->
          <div v-if="booking.date" class="mb-3">
            <label class="form-label">{{ $t('booking.timeSlots') }} *</label>
            <div v-if="availableSlots.length === 0" class="alert alert-warning">
              <i class="fas fa-exclamation-triangle me-2"></i>
              {{ $t('booking.noSlots') }}
            </div>
            <div v-else>
              <div class="alert alert-info" v-if="!booking.timeSlot">
                <i class="fas fa-info-circle me-2"></i>
                {{ $t('booking.selectSlotPrompt') }}
              </div>
              <div class="row g-2">
                <div v-for="slot in availableSlots" :key="slot" class="col-md-3 col-sm-6">
                  <TimeSlot :slot="slot" />
                </div>
              </div>
              <div v-if="booking.timeSlot" class="alert alert-success mt-2">
                <i class="fas fa-check-circle me-2"></i>
                {{ $t('booking.selectedTime') }}: <strong>{{ booking.timeSlot }}</strong>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary px-4 py-2 min-w-button" @click="goBack">
              <i class="fas fa-arrow-left me-2"></i>
              <span class="d-none d-md-inline ms-2">{{ $t('buttons.back') }}</span>
            </button>
            <button
              type="button"
              class="btn btn-primary px-4 py-2 min-w-button"
              :class="{ 'btn-success': isFormComplete }"
              @click="validateAndContinue"
            >
              <span v-if="isFormComplete">
                <span class="d-none d-md-inline ms-2">{{ $t('buttons.continue') }}</span><i class="fas fa-arrow-right ms-2"></i>
              </span>
              <span v-else>
                <span class="d-none d-md-inline ms-2">{{ $t('buttons.completeForm') }}</span><i class="fas fa-exclamation ms-2"></i>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '../stores/booking'
import TimeSlot from '../components/TimeSlot.vue'
import { fetchAvailableHours } from '@/utils/fetchAvailableHours'
import { getFullyBookedDates } from '@/utils/getFullyBookedDates'
import { getBusyDatesOnly } from '@/utils/getBusyDatesOnly'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import LoadingOverlay from '@/components/LoadingOverlay.vue'

export default defineComponent({
  name: 'BookingForm',
  components: { TimeSlot, Datepicker, LoadingOverlay },
  setup() {
    const router = useRouter()
    const bookingStore = useBookingStore()

    const booking = computed({
      get: () => bookingStore.booking,
      set: (val) => {
        Object.entries(val).forEach(([k, v]) => bookingStore.updateBookingField(k, v))
      },
    })

    const availableSlots = computed(() => bookingStore.availableSlots)
    const isFormComplete = computed(() => bookingStore.isBookingFormComplete)
    const minDate = ref(new Date())
    const maxDate = ref(new Date(new Date().setMonth(new Date().getMonth() + 6)))
    const phoneNumber = ref('')
    const fullyBookedDates = ref([])
    const busyDates = ref([])
    const isLoading = ref(false)

    const validatePhone = (e) => {
      let val = e.target.value.replace(/\D/g, '')
      phoneNumber.value =
        val.length <= 2
          ? val
          : val.length <= 5
          ? `${val.slice(0, 2)} ${val.slice(2)}`
          : val.length <= 7
          ? `${val.slice(0, 2)} ${val.slice(2, 5)} ${val.slice(5)}`
          : `${val.slice(0, 2)} ${val.slice(2, 5)} ${val.slice(5, 7)} ${val.slice(7, 9)}`
      bookingStore.updateBookingField('phone', phoneNumber.value ? '+41 ' + phoneNumber.value : '')
    }

    watch(phoneNumber, (val) => {
      bookingStore.updateBookingField('phone', val ? '+41 ' + val : '')
    })

    watch(
      () => booking.value.date,
      async (newDate) => {
        const barberId = booking.value.barber_id
        if (!barberId || !newDate || isNaN(newDate.getTime?.())) return
        isLoading.value = true
        const slots = await fetchAvailableHours(barberId, newDate)
        bookingStore.setAvailableSlots(slots)
        isLoading.value = false
      }
    )

    const fetchVisualIndicators = async () => {
      const barberId = booking.value.barber_id
      if (!barberId) return
      isLoading.value = true
      try {
        const fullResult = await getFullyBookedDates(barberId)
        const busy = await getBusyDatesOnly(barberId)
        fullyBookedDates.value = fullResult.fullyBooked.map((d) => new Date(`${d}T12:00:00`))
        busyDates.value = busy.map((d) => new Date(`${d}T12:00:00`))
      } catch (err) {
        console.error('❌ Error fetching dates:', err)
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => {
      fetchVisualIndicators()
    })

    const getDayClass = (date) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const inputDate = new Date(date)
      inputDate.setHours(0, 0, 0, 0)
      const formatted = `${inputDate.getFullYear()}-${(inputDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${inputDate.getDate().toString().padStart(2, '0')}`

      const matchDate = (d) => {
        const local = new Date(d)
        local.setHours(0, 0, 0, 0)
        return `${local.getFullYear()}-${(local.getMonth() + 1).toString().padStart(2, '0')}-${local
          .getDate()
          .toString()
          .padStart(2, '0')}` === formatted
      }

      if (inputDate < today) return 'day-unavailable'
      if (fullyBookedDates.value.some(matchDate)) return 'day-unavailable'
      if (busyDates.value.some(matchDate)) return 'day-busy'
      return 'day-available'
    }

    const goBack = () => router.push('/booking/services')

    const validateAndContinue = () => {
      const b = booking.value
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (!b.firstName) return bookingStore.showValidation('Enter your first name.')
      if (!b.lastName) return bookingStore.showValidation('Enter your last name.')
      if (!b.email) return bookingStore.showValidation('Enter your email.')
      if (!validEmail.test(b.email)) return bookingStore.showValidation('Invalid email.')
      if (!b.phone || b.phone === '+41 ' || b.phone.replace(/[^0-9]/g, '').length < 11)
        return bookingStore.showValidation('Enter valid Swiss phone number.')
      if (!b.date) return bookingStore.showValidation('Select appointment date.')
      if (availableSlots.value.length === 0)
        return bookingStore.showValidation('No slots for this date.')
      if (!b.timeSlot) return bookingStore.showValidation('Select a time slot.')

      router.push('/booking/confirmation')
    }

    return {
      booking,
      availableSlots,
      minDate,
      maxDate,
      fullyBookedDates,
      busyDates,
      phoneNumber,
      validatePhone,
      isFormComplete,
      validateAndContinue,
      goBack,
      getDayClass,
      isLoading,
    }
  },
})
</script>
