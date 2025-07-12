<template>
  <div class="card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">{{ $t('admin.todayBookings') }}</h5>
      <select class="form-select" style="width: 180px" v-model="statusFilter">
        <option value="all">{{ $t('filters.all') }}</option>
        <option value="confirmed">{{ $t('filters.confirmed') }}</option>
        <option value="no-show">{{ $t('filters.noShow') }}</option>
      </select>
    </div>
    <div class="card-body p-0">
      <div v-if="filteredBookings.length === 0" class="text-muted text-center py-4">
        {{ $t('admin.noBookingsToday') }}
      </div>
      <div v-else class="table-responsive">
        <table class="table table-hover table-sm mb-0 text-center">
          <thead class="table-light">
            <tr>
              <th>{{ $t('booking.time') }}</th>
              <th class="text-start">{{ $t('booking.client') }}</th>
              <th class="text-start">{{ $t('booking.barber') }}</th>
              <th class="text-start">{{ $t('booking.services') }}</th>
              <th>{{ $t('booking.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in filteredBookings" :key="booking.id">
              <td>{{ booking.hour }}</td>
              <td class="text-start">{{ booking.customer_name }} {{ booking.customer_surname }}</td>
              <td class="text-start">{{ booking.barber?.name }} {{ booking.barber?.surname }}</td>
              <td class="text-start">
                <ul class="mb-0 small ps-3">
                  <li v-for="s in booking.serviceNames" :key="s">{{ s }}</li>
                </ul>
              </td>
              <td>
                <input
                  type="checkbox"
                  class="btn-check"
                  :id="`status-toggle-${booking.id}`"
                  :checked="booking.status === 'confirmed'"
                  @change="toggleNoShow(booking)"
                  autocomplete="off"
                />
                <label
                  class="btn btn-sm"
                  :class="
                    booking.status === 'confirmed' ? 'btn-outline-success' : 'btn-outline-danger'
                  "
                  :for="`status-toggle-${booking.id}`"
                >
                  {{ booking.status === 'confirmed' ? $t('status.confirmed') : $t('status.noShow') }}
                </label>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/supabaseClient'

const bookings = ref([])
const statusFilter = ref('all')

const fetchBookings = async () => {
  const today = new Date().toLocaleDateString('sv-SE') // ✅ local date format "YYYY-MM-DD"

  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      id,
      customer_name,
      customer_surname,
      hour,
      status,
      barber:barbers (name, surname),
      booking_services (
        service:services (name)
      )
    `,
    )
    .eq('date_appt', today)

  if (error) {
    console.error('Error fetching today bookings:', error)
    return
  }

  bookings.value = data.map((b) => ({
    ...b,
    serviceNames: b.booking_services.map((bs) => bs.service?.name).filter(Boolean),
  }))
}

const toggleNoShow = async (booking) => {
  const newStatus = booking.status === 'confirmed' ? 'no-show' : 'confirmed'

  const { error } = await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', booking.id)

  if (!error) {
    booking.status = newStatus
  } else {
    console.error('Failed to update status:', error)
  }
}

const filteredBookings = computed(() => {
  if (statusFilter.value === 'all') return bookings.value
  return bookings.value.filter((b) => b.status === statusFilter.value)
})

onMounted(fetchBookings)
</script>
