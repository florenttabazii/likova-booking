<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="admin-modal">
      <div class="modal-header d-flex justify-content-between align-items-center mb-3">
        <h5>Edit Booking</h5>
        <button class="btn-close" @click="$emit('close')"></button>
      </div>

      <div class="modal-content-box">
        <div v-if="bookingData">
          <div class="mb-3">
            <strong>Client:</strong> {{ bookingData.customer_name }} {{ bookingData.customer_surname }}<br />
            <strong>Email:</strong> {{ bookingData.customer_email }}<br />
            <strong>Phone:</strong> {{ bookingData.phone_number }}
          </div>

          <div class="mb-3">
            <label class="form-label">Date</label>
            <Datepicker
              v-model="form.date_appt"
              :min-date="new Date()"
              :max-date="maxDate"
              :disabled-dates="fullyBookedDates"
              :day-class="getDayClass"
              :format="'dd.MM.yyyy'"
              locale="de"
              auto-apply
              :enable-time-picker="false"
            />
          </div>

          <div class="mb-3">
            <label class="form-label">Time</label>
            <select class="form-select" v-model="form.hour">
              <option disabled value="">Select a time</option>
              <option v-for="slot in availableSlots" :key="slot" :value="slot">{{ slot }}</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Services</label>
            <div class="row">
              <div class="col-md-6 mb-2" v-for="service in services" :key="service.id">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="'svc-' + service.id"
                    :value="service.id"
                    v-model="form.service_ids"
                  />
                  <label class="form-check-label" :for="'svc-' + service.id">
                    {{ service.name }} ({{ service.duration }} min)
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-between mt-4">
            <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
            <button class="btn btn-dark" @click="saveChanges">Save Changes</button>
          </div>
        </div>
        <div v-else>
          <p>Loading booking...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { supabase } from '@/supabaseClient'
import { fetchAvailableHours } from '@/utils/fetchAvailableHours'
import { getFullyBookedDates } from '@/utils/getFullyBookedDates'
import { getBusyDatesOnly } from '@/utils/getBusyDatesOnly'

const props = defineProps({
  bookingId: String,
})
const emit = defineEmits(['close', 'saved'])

const bookingData = ref(null)
const services = ref([])
const availableSlots = ref([])
const fullyBookedDates = ref([])
const busyDates = ref([])
const maxDate = ref(new Date(new Date().setMonth(new Date().getMonth() + 6)))

const form = ref({
  date_appt: '',
  hour: '',
  service_ids: [],
})
const original = ref({
  date_appt: '',
  hour: '',
  service_ids: [],
})

const fetchBookingDetails = async () => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`*, booking_services(service_id)`)
    .eq('id', props.bookingId)
    .single()

  if (error || !data) {
    console.error('❌ Failed to fetch booking', error)
    return
  }

  bookingData.value = data
  form.value.date_appt = data.date_appt
  form.value.hour = data.hour
  form.value.service_ids = data.booking_services.map((s) => s.service_id)
  original.value = { ...form.value }

  await fetchVisualIndicators()
  availableSlots.value = await fetchAvailableHours(data.barber_id, data.date_appt)
}

const fetchServices = async () => {
  const { data, error } = await supabase.from('services').select('*')
  if (!error && data) services.value = data
}

const fetchVisualIndicators = async () => {
  if (!bookingData.value?.barber_id) return

  try {
    const fullResult = await getFullyBookedDates(bookingData.value.barber_id)
    const busy = await getBusyDatesOnly(bookingData.value.barber_id)

    fullyBookedDates.value = fullResult.fullyBooked.map(d => new Date(`${d}T12:00:00`))
    busyDates.value = busy.map(d => new Date(`${d}T12:00:00`))
  } catch (err) {
    console.error('❌ Error loading indicators:', err)
  }
}

watch(
  () => form.value.date_appt,
  async (newDate) => {
    if (bookingData.value?.barber_id && newDate) {
      availableSlots.value = await fetchAvailableHours(bookingData.value.barber_id, newDate)
    }
  }
)

const getDayClass = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const inputDate = new Date(date)
  inputDate.setHours(0, 0, 0, 0)

  const formatted = `${inputDate.getFullYear()}-${(inputDate.getMonth() + 1).toString().padStart(2, '0')}-${inputDate.getDate().toString().padStart(2, '0')}`

  const matchDate = (d) => {
    const local = new Date(d)
    local.setHours(0, 0, 0, 0)
    return `${local.getFullYear()}-${(local.getMonth() + 1).toString().padStart(2, '0')}-${local.getDate().toString().padStart(2, '0')}` === formatted
  }

  if (inputDate < today) return 'day-unavailable'
  if (fullyBookedDates.value.some(matchDate)) return 'day-unavailable'
  if (busyDates.value.some(matchDate)) return 'day-busy'
  return 'day-available'
}

onMounted(() => {
  fetchServices()
  fetchBookingDetails()
})

const saveChanges = async () => {
  const { date_appt, hour, service_ids } = form.value
  const changes = {}

  if (date_appt !== original.value.date_appt) changes.date_appt = date_appt
  if (hour !== original.value.hour) changes.hour = hour

  if (Object.keys(changes).length > 0) {
    const { error: updateError } = await supabase
      .from('bookings')
      .update(changes)
      .eq('id', props.bookingId)

    if (updateError) {
      console.error('❌ Booking update failed:', updateError)
      return
    }

    await supabase
      .from('availability')
      .delete()
      .eq('barber_id', bookingData.value.barber_id)
      .eq('date', original.value.date_appt)
      .eq('hour', original.value.hour)

    await supabase.from('availability').upsert([{
      barber_id: bookingData.value.barber_id,
      date: date_appt,
      hour: hour,
      is_available: false,
      booking_id: props.bookingId,
    }])
  }

  const originalSorted = [...original.value.service_ids].sort().join(',')
  const currentSorted = [...service_ids].sort().join(',')

  if (originalSorted !== currentSorted) {
    await supabase.from('booking_services').delete().eq('booking_id', props.bookingId)

    const inserts = service_ids.map((sid) => ({
      booking_id: props.bookingId,
      service_id: sid,
    }))
    const { error: insertError } = await supabase.from('booking_services').insert(inserts)
    if (insertError) {
      console.error('❌ Failed to update services:', insertError)
      return
    }
  }

  emit('saved')
  emit('close')
}
</script>
