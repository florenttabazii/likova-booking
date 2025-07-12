<template>
  <div>
    <LoadingOverlay :visible="isSubmitting" gif="/assets/loading.gif" />

    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <h5>{{ $t('confirmBooking.personalInfo') }}</h5>
                <p><strong>{{ $t('confirmBooking.name') }}:</strong> {{ booking.firstName }} {{ booking.lastName }}</p>
                <p><strong>{{ $t('confirmBooking.email') }}:</strong> {{ booking.email }}</p>
                <p><strong>{{ $t('confirmBooking.phone') }}:</strong> {{ booking.phone }}</p>
              </div>
              <div class="col-md-6">
                <h5>{{ $t('confirmBooking.appointmentDetails') }}</h5>
                <p><strong>{{ $t('confirmBooking.date') }}:</strong> {{ formattedDate }}</p>
                <p><strong>{{ $t('confirmBooking.time') }}:</strong> {{ booking.timeSlot }}</p>
                <p><strong>{{ $t('confirmBooking.barber') }}:</strong> {{ barberName }}</p>
              </div>
            </div>

            <hr />

            <h5>{{ $t('confirmBooking.selectedServices') }}</h5>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>{{ $t('confirmBooking.service') }}</th>
                    <th>{{ $t('confirmBooking.duration') }}</th>
                    <th>{{ $t('confirmBooking.price') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="service in selectedServicesDetails" :key="service.id">
                    <td>{{ service.name }}</td>
                    <td>{{ service.duration }}</td>
                    <td>{{ service.price }} CH₣</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="fw-bold">
                    <td colspan="2">{{ $t('confirmBooking.total') }}</td>
                    <td>{{ totalPrice }} CH₣</td>
                  </tr>
                </tfoot>
              </table>
              <p class="text-muted small mt-3">
                {{ $t('confirmBooking.privacyPrefix') }}
                <a href="#" @click.prevent="showPolicyModal = true">{{ $t('confirmBooking.privacyLink') }}</a>.
              </p>

              <div class="form-check mt-3">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="privacyAcceptMain"
                  v-model="privacyAccepted"
                />
                <label class="form-check-label text-muted small" for="privacyAcceptMain">
                  {{ $t('confirmBooking.privacyCheck') }}
                </label>
              </div>
            </div>

            <div class="d-flex justify-content-between mt-4">
              <button type="button" class="btn btn-secondary px-4 py-2 min-w-button" @click="goBack">
                <i class="fas fa-arrow-left me-2"></i>
                <span class="d-none d-md-inline ms-2">{{ $t('confirmBooking.back') }}</span>
              </button>
              <button
                type="button"
                class="btn btn-dark px-4 py-2 min-w-button"
                @click="confirmBooking"
                :disabled="!privacyAccepted || isSubmitting"
              >
                <i class="fas fa-check me-2"></i>
                <span class="d-none d-md-inline ms-2">{{ $t('confirmBooking.confirm') }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Privacy Policy Modal -->
    <PrivacyPolicyModal v-if="showPolicyModal" @close="showPolicyModal = false" />
  </div>
</template>

<script>
import { defineComponent, computed, getCurrentInstance, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '../stores/booking'
import { useBarbersStore } from '../stores/barbers'
import { useServicesStore } from '../stores/services'
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import { supabase } from '@/supabaseClient'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export default defineComponent({
  name: 'BookingConfirmation',
  components: {
    PrivacyPolicyModal,
    LoadingOverlay,
  },
  setup() {
    const router = useRouter()
    const bookingStore = useBookingStore()
    const barbersStore = useBarbersStore()
    const servicesStore = useServicesStore()

    const showPolicyModal = ref(false)
    const privacyAccepted = ref(false)
    const isSubmitting = ref(false)
    const instance = getCurrentInstance()

    const booking = computed(() => bookingStore.booking)
    const formattedDate = computed(() => {
      return format(new Date(booking.value.date), "EEEE, d. MMMM yyyy", { locale: de })
    })
    const barberName = computed(() => {
      return barbersStore.selectedBarber ? barbersStore.selectedBarber.name : 'Not selected'
    })
    const selectedServicesDetails = computed(() => servicesStore.selectedServicesDetails)
    const totalPrice = computed(() => servicesStore.totalPrice)

    const goBack = () => {
      router.push('/booking/form')
    }

    const confirmBooking = async () => {
      if (isSubmitting.value) return
      isSubmitting.value = true

      const { date, timeSlot, barber_id } = booking.value
      const totalDuration = selectedServicesDetails.value.reduce((sum, s) => sum + s.duration, 0)

      try {
        const { data: barberData, error: barberError } = await supabase
          .from('barbers')
          .select('slot_interval_minutes')
          .eq('id', barber_id)
          .single()

        if (barberError || !barberData) {
          console.error('❌ Could not fetch barber interval:', barberError)
          return
        }

        const interval = barberData.slot_interval_minutes || 15

        const markUnavailableSlots = (startTime, durationMinutes, intervalMinutes) => {
          const slots = []
          const start = new Date(`2000-01-01T${startTime}:00`)
          const totalSlots = Math.ceil(durationMinutes / intervalMinutes)

          for (let i = 0; i < totalSlots; i++) {
            const slot = new Date(start.getTime() + i * intervalMinutes * 60000)
            const formatted = slot.toTimeString().slice(0, 5)
            slots.push(formatted)
          }

          return slots
        }

        const slotsToBlock = markUnavailableSlots(timeSlot, totalDuration, interval)
        const rows = slotsToBlock.map((hour) => ({
          barber_id,
          date,
          hour,
          is_available: false,
        }))

        const { error: insertError } = await supabase.from('availability').insert(rows)

        if (insertError) {
          if (insertError.code === '23505' || insertError.status === 409) {
            alert('⚠️ This time slot was just booked by someone else. Please choose a new one.')
          } else {
            console.error('❌ Failed to block time slots:', insertError)
          }
          return
        }

        bookingStore.confirmBooking()
        bookingStore.toggleConfirmationModal(true)

        const modalComponent = instance.appContext.app._instance.refs.confirmationModal
        if (modalComponent && modalComponent.showModal) {
          modalComponent.showModal()
        }
      } catch (err) {
        console.error('❌ Unexpected booking error:', err)
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      booking,
      formattedDate,
      barberName,
      selectedServicesDetails,
      totalPrice,
      goBack,
      confirmBooking,
      showPolicyModal,
      privacyAccepted,
      isSubmitting,
    }
  },
})
</script>
