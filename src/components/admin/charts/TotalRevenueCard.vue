<template>
  <div class="card mb-4 h-100">
    <div class="card-header d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center gap-2">
        <i class="fas fa-franc-sign text-warning"></i>
        <span class="text-muted small">{{ $t('admin.estimatedRevenue') }}</span>
      </div>
      <select v-model="filter" class="form-select form-select-sm" style="width: 180px">
        <option value="today">{{ $t('filters.today') }}</option>
        <option value="week">{{ $t('filters.thisWeek') }}</option>
        <option value="month">{{ $t('filters.thisMonth') }}</option>
      </select>
    </div>
    <div class="card-body">
      <h3 class="fw-bold text-dark mb-0">CHF {{ revenue }}</h3>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from '@/supabaseClient'

const revenue = ref('—')
const filter = ref('today')

const getStartDate = () => {
  const now = new Date()
  switch (filter.value) {
    case 'today':
      now.setHours(0, 0, 0, 0)
      return now
    case 'week': {
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Monday
      const monday = new Date(now.setDate(diff))
      monday.setHours(0, 0, 0, 0)
      return monday
    }
    case 'month':
      const first = new Date(now.getFullYear(), now.getMonth(), 1)
      first.setHours(0, 0, 0, 0)
      return first
  }
}

const fetchRevenue = async () => {
  revenue.value = '—'

  const { data: bookings, error: bookingsErr } = await supabase
    .from('bookings')
    .select('id, date_appt')
    .not('status', 'eq', 'no-show')

  if (bookingsErr) {
    console.error('Error fetching bookings:', bookingsErr)
    return
  }

  const startDate = getStartDate()
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const filteredBookings = bookings.filter((b) => {
    const apptDate = new Date(b.date_appt)
    if (filter.value === 'today') {
      return apptDate.toDateString() === startDate.toDateString()
    }
    return apptDate >= startDate && apptDate <= today
  })

  const validBookingIds = filteredBookings.map((b) => b.id)

  if (validBookingIds.length === 0) {
    revenue.value = '0.00'
    return
  }

  const { data: bookingServices, error: bsErr } = await supabase
    .from('booking_services')
    .select('service:services (price), booking_id')

  if (bsErr) {
    console.error('Error fetching services:', bsErr)
    return
  }

  const total = bookingServices.reduce((sum, row) => {
    if (validBookingIds.includes(row.booking_id)) {
      return sum + (row.service?.price || 0)
    }
    return sum
  }, 0)

  revenue.value = total.toFixed(2)
}

onMounted(fetchRevenue)
watch(filter, fetchRevenue)
</script>
